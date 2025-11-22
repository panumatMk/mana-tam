import React, { useState } from 'react';
import { Plus, Calendar, MapPin, Trash2, Link as LinkIcon, Settings, Minus, GripVertical, X } from 'lucide-react';
import type { Activity, Trip } from '../../types/plan.types';
import { ActivityModal } from './ActivityModal';
import { EditTripModal } from './EditTripModal';
import ConfirmModal from '../../components/common/ConfirmModal';

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
    rectSortingStrategy, // ✅ ใช้ตัวนี้เพื่อให้ลากแบบตาราง (ขึ้นลงซ้ายขวา) ได้
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {SortableItem} from "../../components/common/SorttableItem.tsx";

interface PlanScreenProps {
    trip: Trip;
    onSaveTrip: (trip: Trip) => void;
}

export const PlanScreen: React.FC<PlanScreenProps> = ({ trip, onSaveTrip }) => {
    const [days, setDays] = useState<number[]>([1]);
    const [activeDay, setActiveDay] = useState(1);
    const [activities, setActivities] = useState<Activity[]>([]);

    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [isTripModalOpen, setIsTripModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); // ควบคุมโหมดแก้ไข (ลาก/ลบ)
    const [isManageDaysOpen, setIsManageDaysOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [tempDayCount, setTempDayCount] = useState(days.length);

    const isTripSetup = trip.title !== "";

    // Config Sensors ให้ลากบนมือถือได้ลื่นๆ (กดค้างนิดนึงถึงจะลากได้)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // --- Handlers ---

    const handleAddDay = () => {
        const newDay = days.length + 1;
        setDays([...days, newDay]);
    };

    const handleDeleteDay = (dayId: number) => {
        if (days.length <= 1) return;
        if (!confirm(`ต้องการลบ Day ${dayId} และกิจกรรมทั้งหมดในวันนี้?`)) return;

        const newDays = days.filter(d => d !== dayId);
        setActivities(prev => prev.filter(a => a.day !== dayId));
        setDays(newDays);
        if (activeDay === dayId) setActiveDay(newDays[0]);
    };

    const handleUpdateDays = () => {
        // (Logic เดิมของ Modal จัดการวัน - ถ้ายังใช้อยู่)
        const newCount = tempDayCount;
        const currentCount = days.length;

        if (newCount < currentCount) {
            if (!confirm(`ลดจำนวนวันเหลือ ${newCount}? กิจกรรมในวันที่หายไปจะถูกลบ`)) return;
            setActivities(prev => prev.filter(a => a.day <= newCount));
            setDays(Array.from({ length: newCount }, (_, i) => i + 1));
            if (activeDay > newCount) setActiveDay(newCount);
        } else if (newCount > currentCount) {
            const addedDays = Array.from({ length: newCount - currentCount }, (_, i) => currentCount + 1 + i);
            setDays([...days, ...addedDays]);
        }
        setIsManageDaysOpen(false);
    };

    // Drag Day End (ใช้กับ rectSortingStrategy ทำให้สลับที่แบบ Grid ได้)
    const handleDragDayEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setDays((items) => {
                const oldIndex = items.indexOf(Number(active.id));
                const newIndex = items.indexOf(Number(over!.id));
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Drag Activity End
    const handleDragActivityEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const currentDayActs = activities.filter(a => a.day === activeDay);
        const oldIndex = currentDayActs.findIndex(i => i.id === active.id);
        const newIndex = currentDayActs.findIndex(i => i.id === over.id);
        const timeSlots = currentDayActs.map(a => a.time);
        const reorderedActs = arrayMove(currentDayActs, oldIndex, newIndex);
        const finalActsForDay = reorderedActs.map((act, index) => ({ ...act, time: timeSlots[index] }));

        setActivities(prev => {
            const otherDaysActs = prev.filter(a => a.day !== activeDay);
            return [...otherDaysActs, ...finalActsForDay];
        });
    };

    const handleSaveActivity = (data: any, shouldClose: boolean) => {
        if (editingActivity) {
            setActivities(prev => prev.map(a => a.id === editingActivity.id ? { ...a, ...data } : a));
        } else {
            const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            setActivities(prev => [...prev, { id: newId, day: activeDay, ...data }]);
        }
        if (shouldClose) setIsActivityModalOpen(false);
    };

    const confirmDeleteActivity = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteTargetId(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteActivity = () => {
        if (deleteTargetId) setActivities(prev => prev.filter(a => a.id !== deleteTargetId));
    };

    const currentActivities = activities
        .filter(a => a.day === activeDay)
        .sort((a, b) => a.time.localeCompare(b.time));

    // --- EMPTY STATE ---
    if (!isTripSetup) {
        return (
            <div className="flex flex-col h-full bg-F3F4F6 relative p-6 justify-center items-center overflow-hidden">
                <div className="bg-white w-full rounded-[2.5rem] p-8 text-center shadow-sm border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-20 animate-fade-in">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <Calendar className="text-green-500 w-10 h-10" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-800 mb-2 tracking-tight">ยังไม่มีแผนเที่ยวเลย</h3>
                    <p className="text-gray-400 text-sm mb-8 font-medium">เริ่มสร้าง Timeline วันแรกของคุณกันเถอะ</p>
                    <button
                        onClick={() => setIsTripModalOpen(true)}
                        className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-green-200 flex items-center justify-center gap-2 hover:bg-green-700 active:scale-95 transition-all text-lg"
                    >
                        <Plus className="w-6 h-6" strokeWidth={3} />
                        <span>สร้างแผนเที่ยว</span>
                    </button>
                </div>
                <EditTripModal isOpen={isTripModalOpen} onClose={() => setIsTripModalOpen(false)} onSave={onSaveTrip} initialTrip={trip} />
            </div>
        );
    }

    // --- TIMELINE STATE ---
    return (
        <div className="flex flex-col h-full bg-F3F4F6 relative">

            {/* Header Section (Day Tabs) - ไม่ใช้ fixed height, ปล่อยยืดตาม content */}
            <div className="flex-none p-2 bg-F3F4F6 z-10 shadow-sm">

                <div className="flex justify-between items-center animate-fade-in">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-800">Timeline</h2>
                        {/* ปุ่ม Toggle Edit Mode */}
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`p-1.5 rounded-full transition-colors ${isEditMode ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="text-xs text-gray-400 font-medium">Total {days.length} Days</div>
                </div>

                {/* DAY TABS AREA */}
                {/* ใช้ flex-wrap เพื่อให้ตกบรรทัด ไม่ใช้ scrollbar */}
                <div className="relative">
                    {isEditMode ? (
                        // 🔴 Mode: EDIT (Draggable + Wrappable)
                        // ใช้ rectSortingStrategy เพื่อให้รองรับการลากในรูปแบบ Grid/Wrap ได้ดีขึ้น
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragDayEnd}>
                            <SortableContext items={days} strategy={rectSortingStrategy}>
                                <div className="flex flex-wrap gap-2 py-1">
                                    {days.map((dayId, index) => (
                                        <SortableItem key={dayId} id={dayId} className="">
                                            <div className="relative group">
                                                <button className="px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap border border-green-200 bg-green-50 text-green-700 cursor-grab active:cursor-grabbing">
                                                    D-{index + 1}
                                                </button>
                                                {/* ปุ่มลบวัน */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteDay(dayId); }}
                                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600 z-20"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </SortableItem>
                                    ))}
                                    {/* ปุ่มเพิ่มวันในโหมด Edit */}
                                    <button onClick={handleAddDay} className="w-10 h-9 flex-shrink-0 flex items-center justify-center bg-white rounded-xl text-green-500 border border-dashed border-green-300 hover:bg-green-50 transition-colors">
                                        <Plus className="w-4 h-4"/>
                                    </button>
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        // 🟢 Mode: VIEW (Clickable + Wrappable + NO Drag)
                        // ไม่ใช้ SortableItem หุ้ม ทำให้ลากไม่ได้
                        <div className="flex gap-2 no-scrollbar touch-pan-x py-1 overflow-x-auto hide-scrollbar-completely"
                             style={{WebkitOverflowScrolling: 'touch'}}>
                            {days.map((dayId, index) => (
                                <button
                                    key={dayId}
                                    onClick={() => setActiveDay(dayId)}
                                    className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border 
                                ${activeDay === dayId ? 'bg-green-600 text-white border-green-600 ring-green-200' : 'bg-white text-gray-500 border-gray-200'}
                            `}
                                >
                                    D-{index + 1}
                                </button>
                            ))}
                            {/* ปุ่ม + วัน ด่วน */}
                            <button
                                onClick={() => {
                                    const maxDay = Math.max(...days, 0);
                                    setDays([...days, maxDay + 1]);
                                    setActiveDay(maxDay + 1);
                                }}
                                className="w-10 h-9 flex-shrink-0 flex items-center justify-center bg-white rounded-xl text-green-500 border border-dashed border-green-300 hover:bg-green-50 transition-colors"
                            >
                                <Plus className="w-4 h-4"/>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section (List) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24 relative">
                <div className="space-y-3 min-h-[100px] pt-2">
                    {currentActivities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 mt-4 opacity-60">
                            <MapPin className="w-10 h-10 text-gray-300 mb-2"/>
                            <p className="text-xs text-gray-400">Day {days.indexOf(activeDay) + 1} ยังว่างอยู่</p>
                            <button onClick={() => {setEditingActivity(null); setIsActivityModalOpen(true);}} className="mt-4 text-green-600 text-sm font-bold flex items-center gap-1 hover:underline"><Plus className="w-4 h-4" /> เพิ่มกิจกรรมแรก</button>
                        </div>
                    ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragActivityEnd}>
                            <SortableContext items={currentActivities.map(a => a.id)} strategy={verticalListSortingStrategy}>
                                {currentActivities.map((item) => (
                                    <SortableItem key={item.id} id={item.id}>
                                        <div onClick={() => {setEditingActivity(item); setIsActivityModalOpen(true);}} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-3 items-start group cursor-pointer hover:border-green-200 active:scale-[0.98] transition-all">
                                            <div className="mt-2 text-gray-300 cursor-grab active:cursor-grabbing p-1 -ml-2"><GripVertical className="w-4 h-4" /></div>
                                            <div className="flex flex-col items-center min-w-[45px] border-r border-gray-100 pr-3">
                                                <span className="text-sm font-bold text-gray-800">{item.time}</span>
                                                <div className="h-full w-[2px] bg-gray-100 mt-2 rounded-full group-hover:bg-green-100 transition-colors"></div>
                                            </div>
                                            <div className="flex-1 pt-0.5 overflow-hidden">
                                                <h4 className="font-bold text-gray-800 text-sm truncate">{item.title}</h4>
                                                {item.note && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.note}</p>}
                                                <div className="flex gap-2 mt-1.5">
                                                    {item.links && item.links.length > 0 && (
                                                        <div className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">
                                                            <LinkIcon className="w-3 h-3"/> {item.links.length} Links
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {item.image && <img src={item.image} className="w-14 h-14 rounded-lg object-cover border border-gray-100" />}
                                            <button onClick={(e) => confirmDeleteActivity(item.id, e)} className="text-gray-300 hover:text-red-500 p-1 -mr-1 z-10"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                    <div className="h-20"></div>
                </div>
            </div>

            {/* FAB */}
            {isTripSetup && currentActivities.length > 0 && !isEditMode && (
                <button onClick={() => {setEditingActivity(null); setIsActivityModalOpen(true);}} className="fixed bottom-24 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-xl shadow-green-200 flex items-center justify-center hover:bg-green-700 active:scale-90 transition-all z-30"><Plus className="w-8 h-8" /></button>
            )}

            {/* Modals */}
            <ActivityModal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} onSave={handleSaveActivity} initialData={editingActivity} />
            <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteActivity} title="ลบกิจกรรม?" message="ลบแล้วหายเลยนะ กู้คืนไม่ได้ เอาจริงดิ?" />

            {/* Manage Days Modal (เดิม) - เก็บไว้เผื่อใช้ แต่ตอนนี้ใช้ Edit Mode บนหน้าจอแล้ว */}
            {isManageDaysOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
                    <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl relative text-center">
                        <button onClick={() => setIsManageDaysOpen(false)} className="absolute top-4 right-4 bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200"><X className="w-4 h-4"/></button>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">จัดการจำนวนวัน 🗓️</h3>
                        <div className="flex items-center justify-center gap-4 mb-8 mt-6">
                            <button onClick={() => setTempDayCount(Math.max(1, tempDayCount - 1))} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-500 active:scale-90"><Minus className="w-6 h-6" /></button>
                            <div className="text-4xl font-bold text-gray-800 w-16">{tempDayCount}</div>
                            <button onClick={() => setTempDayCount(tempDayCount + 1)} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-green-100 hover:text-green-600 active:scale-90"><Plus className="w-6 h-6" /></button>
                        </div>
                        <button onClick={handleUpdateDays} className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-black active:scale-95 transition-all">บันทึก</button>
                    </div>
                </div>
            )}

        </div>
    );
};
