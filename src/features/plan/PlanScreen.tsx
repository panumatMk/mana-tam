import React, {useState, useEffect} from 'react';
import {Plus, Calendar, MapPin, Trash2, Link as LinkIcon, Settings, GripVertical, X} from 'lucide-react';
import type {Activity, Trip} from '../../types/plan.types';
import {ActivityModal} from './ActivityModal';
import {EditTripModal} from './EditTripModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import {Button} from "../../components/ui/Button.tsx";

// Hook
import {useTrip} from '../../hooks/useTrip';
import {useActivities} from '../../hooks/useActivities';

// DnD Kit (Keep existing imports)
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {SortableItem} from "../../components/common/SorttableItem.tsx";

// Helper: บวกเวลา 1 ชั่วโมง (Format HH:mm)
const addOneHour = (timeStr: string) => {
    if (!timeStr) return "09:00";
    const [hh, mm] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hh, mm);
    date.setHours(date.getHours() + 1); // บวก 1 ชั่วโมง
    // ตรวจสอบให้แน่ใจว่าได้ format HH:mm 24-hour เสมอ
    return date.toLocaleTimeString('th-TH', {hour: '2-digit', minute: '2-digit', hour12: false});
};


interface PlanScreenProps {
    trip: Trip;
}

export const PlanScreen: React.FC<PlanScreenProps> = ({trip}) => {
    // 🔥 เรียกใช้ Hook
    const {saveTrip} = useTrip();
    const {activities, addActivity, updateActivity, deleteActivity} = useActivities();

    // State ทั่วไป
    const [activeDay, setActiveDay] = useState(1);
    const [isEditMode, setIsEditMode] = useState(false);

    // Modals
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [isTripModalOpen, setIsTripModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    // คำนวณ Days Array จาก trip.totalDays (ถ้าไม่มีให้เริ่มที่ 1 วัน)
    const totalDays = trip.totalDays || 1;
    const days = Array.from({length: totalDays}, (_, i) => i + 1);

    const isTripSetup = trip.title !== "";

    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 8}}),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates})
    );

    // --- Handlers: Manage Days ---

    const handleAddDay = async () => {
        // เพิ่มวัน = อัปเดต trip.totalDays + 1
        await saveTrip({...trip, totalDays: totalDays + 1});
    };

    const handleDeleteDay = async (dayId: number) => {
        if (totalDays <= 1) return;
        if (!confirm(`ต้องการลบ Day ${dayId} และกิจกรรมในวันนี้?`)) return;

        // 1. ลบกิจกรรมทั้งหมดในวันนั้น
        const actsToDelete = activities.filter(a => a.day === dayId);
        for (const act of actsToDelete) {
            await deleteActivity(act.id);
        }

        // 2. ย้ายกิจกรรมในวันที่มากกว่า ให้ถอยลงมา 1 วัน
        const actsToShift = activities.filter(a => a.day > dayId);
        for (const act of actsToShift) {
            await updateActivity(act.id, {day: act.day - 1});
        }

        // 3. อัปเดตจำนวนวันรวม
        await saveTrip({...trip, totalDays: totalDays - 1});

        // Reset active day
        if (activeDay >= dayId) setActiveDay(Math.max(1, activeDay - 1));
    };

    const handleDragDayEnd = async (event: DragEndEvent) => {
        // Drag Day Feature: Coming Soon
        console.log("Drag Day Feature: Coming Soon (Complex logic needed)");
    };


    // --- Handlers: Manage Activities ---

    const handleSaveActivity = async (data: any) => {
        if (editingActivity) {
            // Update
            await updateActivity(editingActivity.id, {
                ...data,
                day: activeDay
            });
        } else {
            // Create
            await addActivity({
                ...data,
                day: activeDay,
            });
        }
        setIsActivityModalOpen(false);
    };

    const confirmDeleteActivity = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteTargetId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deleteTargetId) {
            await deleteActivity(deleteTargetId);
            setDeleteTargetId(null);
        }
    };

    // ✅ ฟังก์ชันที่แก้ไข: เพิ่ม async
    const handleDragActivityEnd = async (event: DragEndEvent) => {
        const {active, over} = event;

        if (!over || active.id === over.id) return;

        const oldIndex = currentActivities.findIndex(a => a.id === active.id);
        const newIndex = currentActivities.findIndex(a => a.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        // จำลอง Array ใหม่หลังจัดเรียง (เพื่อหาว่าใครคือ "เพื่อนคนก่อนหน้า")
        const reorderedList = arrayMove(currentActivities, oldIndex, newIndex);

        // หา item ที่อยู่ "ก่อนหน้า" ตำแหน่งใหม่
        const prevItem = reorderedList[newIndex - 1];

        let newTime = "09:00"; // เวลา Default ถ้าลากไปบนสุด

        if (prevItem) {
            // 💡 Logic: ถ้ามีตัวก่อนหน้า ให้เวลา = เวลาของตัวก่อนหน้า + 1 ชม.
            newTime = addOneHour(prevItem.time);
        } else {
            // กรณีลากไปไว้บนสุด (ไม่มีตัวก่อนหน้า)
            newTime = "08:00";
        }

        // 💾 บันทึกลง Firebase
        await updateActivity(String(active.id), {
            time: newTime
        });
    };

    // Filter เฉพาะวันปัจจุบัน
    const currentActivities = activities.filter(a => a.day === activeDay);
    // ... (ส่วนที่เหลือของโค้ดเหมือนเดิม)
// ...

    // --- RENDER ---

    if (!isTripSetup) {
        // ... (Keep Empty State Code form previous file) ...
        return (
            <div className="flex flex-col h-full bg-F3F4F6 relative p-6 justify-center items-center overflow-hidden">
                <div
                    className="bg-white w-full rounded-[2.5rem] p-8 text-center shadow-sm border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-20 animate-fade-in">
                    <div
                        className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <Calendar className="text-green-500 w-10 h-10" strokeWidth={1.5}/>
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-800 mb-2 tracking-tight">ยังไม่มีแผนเที่ยวเลย</h3>
                    <p className="text-gray-400 text-sm mb-8 font-medium">เริ่มสร้าง Timeline วันแรกของคุณกันเถอะ</p>
                    <Button size="lg" variant="primary" onClick={() => setIsTripModalOpen(true)}>
                        <Plus className="w-6 h-6" strokeWidth={3}/>
                        <span>สร้างแผนเที่ยว</span>
                    </Button>
                </div>
                <EditTripModal isOpen={isTripModalOpen} onClose={() => setIsTripModalOpen(false)} onSave={saveTrip}
                               initialTrip={trip}/>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-F3F4F6 relative">
            {/* Header / Day Tabs */}
            <div className="flex-none px-4 py-2 bg-F3F4F6 z-10 shadow-sm">
                <div className="flex justify-between items-center animate-fade-in mb-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-800">Timeline</h2>
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`p-1.5 rounded-full transition-colors ${isEditMode ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            <Settings className="w-4 h-4"/>
                        </button>
                    </div>
                    <div className="text-xs text-gray-400 font-medium">Total {totalDays} Days</div>
                </div>

                {/* Day List */}
                <div className="relative">
                    {isEditMode ? (
                        // Edit Mode (เพิ่ม/ลบ วัน)
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragDayEnd}>
                            <SortableContext items={days} strategy={rectSortingStrategy}>
                                <div className="flex flex-wrap gap-2 py-1">
                                    {days.map((dayId, index) => (
                                        <SortableItem key={dayId} id={dayId} className="">
                                            <div className="relative group">
                                                <button
                                                    className="px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap border border-green-200 bg-green-50 text-green-700 cursor-grab active:cursor-grabbing">
                                                    D-{dayId}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteDay(dayId);
                                                    }}
                                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600 z-20"
                                                >
                                                    <X className="w-3 h-3"/>
                                                </button>
                                            </div>
                                        </SortableItem>
                                    ))}
                                    <button onClick={handleAddDay}
                                            className="w-10 h-9 flex-shrink-0 flex items-center justify-center bg-white rounded-xl text-green-500 border border-dashed border-green-300 hover:bg-green-50 transition-colors">
                                        <Plus className="w-4 h-4"/>
                                    </button>
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        // View Mode
                        <div
                            className="flex gap-2 no-scrollbar touch-pan-x py-1 overflow-x-auto hide-scrollbar-completely">
                            {days.map((dayId) => (
                                <button
                                    key={dayId}
                                    onClick={() => setActiveDay(dayId)}
                                    className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border 
                                        ${activeDay === dayId ? 'bg-green-600 text-white border-green-600 ring-green-200' : 'bg-white text-gray-500 border-gray-200'}
                                    `}
                                >
                                    D-{dayId}
                                </button>
                            ))}
                            <button onClick={handleAddDay}
                                    className="w-10 h-9 flex-shrink-0 flex items-center justify-center bg-white rounded-xl text-green-500 border border-dashed border-green-300 hover:bg-green-50 transition-colors">
                                <Plus className="w-4 h-4"/>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24 relative">
                <div className="space-y-3 min-h-[100px] pt-2">
                    {currentActivities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 mt-4 opacity-60">
                            <MapPin className="w-10 h-10 text-gray-300 mb-2"/>
                            <p className="text-xs text-gray-400">Day {activeDay} ยังว่างอยู่</p>
                            <button onClick={() => {
                                setEditingActivity(null);
                                setIsActivityModalOpen(true);
                            }}
                                    className="mt-4 text-green-600 text-sm font-bold flex items-center gap-1 hover:underline">
                                <Plus className="w-4 h-4"/> เพิ่มกิจกรรมแรก
                            </button>
                        </div>
                    ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter}
                                    onDragEnd={handleDragActivityEnd}>
                            <SortableContext items={currentActivities.map(a => a.id)}
                                             strategy={verticalListSortingStrategy}>
                                {currentActivities.map((item) => (
                                    <SortableItem key={item.id} id={item.id}>
                                        <div onClick={() => {
                                            setEditingActivity(item);
                                            setIsActivityModalOpen(true);
                                        }}
                                             className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-3 items-start group cursor-pointer hover:border-green-200 active:scale-[0.98] transition-all">
                                            <div
                                                className="mt-2 text-gray-300 cursor-grab active:cursor-grabbing p-1 -ml-2">
                                                <GripVertical className="w-4 h-4"/></div>

                                            {/* Time */}
                                            <div
                                                className="flex flex-col items-center min-w-[45px] border-r border-gray-100 pr-3">
                                                <span className="text-sm font-bold text-gray-800">{item.time}</span>
                                                <div
                                                    className="h-full w-[2px] bg-gray-100 mt-2 rounded-full group-hover:bg-green-100 transition-colors"></div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 pt-0.5 overflow-hidden">
                                                <h4 className="font-bold text-gray-800 text-sm truncate">{item.title}</h4>
                                                {item.note &&
                                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.note}</p>}

                                                {/* Links */}
                                                <div className="flex gap-2 mt-1.5">
                                                    {item.links && item.links.length > 0 && (
                                                        <div
                                                            className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">
                                                            <LinkIcon className="w-3 h-3"/> {item.links.length} Links
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Audit Info (แสดงตัวอย่างการใช้) */}
                                                {item.createdByName && ( // ตรวจสอบว่ามีชื่อคนสร้างหรือไม่ (ควรมีเสมอ)
                                                    <div className="mt-1 text-[9px] text-gray-300">
                                                        {/*
                                                          เงื่อนไข:
                                                          1. ตรวจสอบว่ามีค่า updatedAt และ createdAt และ
                                                          2. ค่า millisecond ของ updatedAt มากกว่า createdAt (แสดงว่ามีการแก้ไขหลังสร้าง)
                                                        */}
                                                        {item.updatedAt && item.createdAt && (item.updatedAt.toMillis() > item.createdAt.toMillis()) ? (
                                                            // ถ้ามีการแก้ไข
                                                            `แก้ไขล่าสุดโดย ${item.updatedByName || item.createdByName}`
                                                        ) : (
                                                            // ถ้าไม่มีการแก้ไข (Updated = Created)
                                                            `เพิ่มโดย ${item.createdByName}`
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <button onClick={(e) => confirmDeleteActivity(item.id, e)}
                                                    className="text-gray-300 hover:text-red-500 p-1 -mr-1 z-10"><Trash2
                                                className="w-4 h-4"/></button>
                                        </div>
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                    <div className="h-20"></div>
                </div>
            </div>

            {/* Floating Action Button */}
            {isTripSetup && !isEditMode && (
                <button onClick={() => {
                    setEditingActivity(null);
                    setIsActivityModalOpen(true);
                }}
                        className="fixed bottom-24 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-xl shadow-green-200 flex items-center justify-center hover:bg-green-700 active:scale-90 transition-all z-30">
                    <Plus className="w-8 h-8"/></button>
            )}

            <ActivityModal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)}
                           onSave={handleSaveActivity} initialData={editingActivity}/>
            <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}
                          onConfirm={handleConfirmDelete} title="ลบกิจกรรม?" message="เอาจริงดิ?"/>
        </div>
    );
};


