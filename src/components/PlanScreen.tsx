import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';

import { Plus, CalendarDays, Trash2, MapPin, Settings, Minus, Link as LinkIcon, GripVertical } from 'lucide-react';
import ActivityModal from './ActivityModal';
import { SortableItem } from './SortableItem';
import type {Activity} from "../types.ts";

interface PlanScreenProps {
    tripDate: string;
    onSetupTrip: () => void;
}

const PlanScreen: React.FC<PlanScreenProps> = ({ tripDate, onSetupTrip }) => {
    // --- STATE ---
    const [days, setDays] = useState<number[]>([1]);
    const [activeDay, setActiveDay] = useState(1);
    const [activities, setActivities] = useState<Activity[]>([]);

    // Modals
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [isManageDaysOpen, setIsManageDaysOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [tempDayCount, setTempDayCount] = useState(days.length);

    // Sensors: ตั้งค่าให้ต้อง "กดค้างและลาก" (Move 5px) ถึงจะเริ่มลาก เพื่อกันไม่ให้ชนกับ click
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // --- LOGIC: MANAGE DAYS ---
    const handleUpdateDays = () => {
        const newCount = tempDayCount;
        const currentCount = days.length;

        if (newCount < currentCount) {
            if (!confirm(`ลดจำนวนวันเหลือ ${newCount}? กิจกรรมในวันที่หายไปจะถูกลบ`)) return;
            setActivities(prev => prev.filter(a => a.day <= newCount));
            // ตัดวันออกจากท้ายอาเรย์ (ถ้าไม่ได้เรียงสลับ) หรือสร้างใหม่ 1..N
            // เพื่อความง่ายในการจัดการ logic ลดวัน เราจะ reset ลำดับวันให้เป็น 1..N เสมอเมื่อลด
            setDays(Array.from({ length: newCount }, (_, i) => i + 1));
            if (activeDay > newCount) setActiveDay(newCount);
        } else if (newCount > currentCount) {
            // เพิ่มวัน: หาเลขวันสูงสุดที่มีอยู่ แล้วบวกเพิ่ม
            const maxDay = Math.max(...days, 0);
            const added = Array.from({ length: newCount - currentCount }, (_, i) => maxDay + 1 + i);
            setDays([...days, ...added]);
        }
        setIsManageDaysOpen(false);
    };

    // --- LOGIC: DRAG & DROP ---

    // 1. Reorder Days (แนวนอน)
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

    // 2. Reorder Activities (แนวตั้ง)
    const handleDragActivityEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setActivities((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over!.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // --- LOGIC: ACTIVITY CRUD ---
    const handleSaveActivity = (data: Omit<Activity, 'id' | 'day'>, shouldClose: boolean) => {
        if (editingActivity) {
            setActivities(prev => prev.map(a => a.id === editingActivity.id ? { ...a, ...data } : a));
        } else {
            // สร้าง ID แบบ Unique ง่ายๆ
            const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            setActivities(prev => [...prev, { id: newId, day: activeDay, ...data }]);
        }
        if (shouldClose) setIsActivityModalOpen(false);
    };

    const handleDeleteActivity = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('ลบกิจกรรมนี้?')) setActivities(prev => prev.filter(a => a.id !== id));
    };

    // Filter activities for current day
    // *สำคัญ: ต้อง sort ตาม order ของ array activities เอง เพราะ dnd-kit จะจัดการลำดับใน array หลักให้แล้ว
    // เราแค่ filter เอาของ day นั้นๆ มาโชว์ตามลำดับที่มันอยู่ใน array
    const currentActivities = activities.filter(a => a.day === activeDay);

    const isTripSetup = tripDate !== 'TBD';

    return (
        <div className="p-4 pt-2 pb-24 min-h-full flex flex-col">

            {/* HEADER */}
            {isTripSetup && (
                <div className="flex justify-between items-center animate-fade-in mb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-800">Timeline</h2>
                        <button onClick={() => {setTempDayCount(days.length); setIsManageDaysOpen(true);}} className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"><Settings className="w-4 h-4" /></button>
                    </div>
                    <div className="text-xs text-gray-400 font-medium">Total {days.length} Days</div>
                </div>
            )}

            {!isTripSetup ? (
                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center shadow-sm mt-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400"><CalendarDays className="w-8 h-8" /></div>
                    <p className="text-gray-400 text-xs mb-6">ตั้งค่าทริปก่อนเริ่มวางแผนนะ</p>
                    <button onClick={onSetupTrip} className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg text-sm">ตั้งค่าทริป</button>
                </div>
            ) : (
                <div className="flex flex-col flex-1 animate-fade-in">

                    {/* === DRAGGABLE DAY TABS (แนวนอน) === */}
                    <div className="mb-2">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragDayEnd}>
                            <SortableContext items={days} strategy={horizontalListSortingStrategy}>
                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar touch-pan-x p-1">
                                    {days.map(day => (
                                        <SortableItem key={day} id={day} className="flex-shrink-0">
                                            <button
                                                onClick={() => setActiveDay(day)}
                                                // เพิ่ม touch-action: none เพื่อให้ลากได้สะดวกบนมือถือ
                                                className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all shadow-sm border 
                                        ${activeDay === day ? 'bg-green-600 text-white border-green-600 scale-105 ring-2 ring-green-200' : 'bg-white text-gray-500 border-gray-200'}
                                    `}
                                            >
                                                Day {day}
                                            </button>
                                        </SortableItem>
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
                            </SortableContext>
                        </DndContext>
                    </div>

                    {/* === DRAGGABLE ACTIVITY LIST (แนวตั้ง) === */}
                    <div className="space-y-3 flex-1 mt-2">
                        {currentActivities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 mt-4 opacity-60">
                                <MapPin className="w-10 h-10 text-gray-300 mb-2" />
                                <p className="text-xs text-gray-400">Day {activeDay} ยังว่างอยู่</p>
                                <button onClick={() => {setEditingActivity(null); setIsActivityModalOpen(true);}} className="mt-4 text-green-600 text-sm font-bold flex items-center gap-1 hover:underline"><Plus className="w-4 h-4" /> เพิ่มกิจกรรมแรก</button>
                            </div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragActivityEnd}>
                                <SortableContext items={currentActivities.map(a => a.id)} strategy={verticalListSortingStrategy}>
                                    {currentActivities.map((item) => (
                                        <SortableItem key={item.id} id={item.id}>
                                            <div onClick={() => {setEditingActivity(item); setIsActivityModalOpen(true);}} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-3 items-start group cursor-pointer hover:border-green-200 active:scale-[0.98]">
                                                {/* Grip Handle (จุดลาก) */}
                                                <div className="mt-2 text-gray-300 cursor-grab active:cursor-grabbing p-1 -ml-2">
                                                    <GripVertical className="w-4 h-4" />
                                                </div>

                                                <div className="flex flex-col items-center min-w-[45px] border-r border-gray-100 pr-3">
                                                    <span className="text-sm font-bold text-gray-800">{item.time}</span>
                                                    <div className="h-full w-[2px] bg-gray-100 mt-2 rounded-full group-hover:bg-green-100 transition-colors"></div>
                                                </div>
                                                <div className="flex-1 pt-0.5 overflow-hidden">
                                                    <h4 className="font-bold text-gray-800 text-sm truncate">{item.title}</h4>
                                                    {item.note && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.note}</p>}
                                                    <div className="flex gap-2 mt-1.5">
                                                        {item.link && <div className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded flex items-center gap-1"><LinkIcon className="w-3 h-3"/>Link</div>}
                                                    </div>
                                                </div>
                                                {item.image && <img src={item.image} className="w-14 h-14 rounded-lg object-cover border border-gray-100" />}
                                                <button onClick={(e) => handleDeleteActivity(item.id, e)} className="text-gray-300 hover:text-red-500 p-1 -mr-1 z-10"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </SortableItem>
                                    ))}
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>

                    {/* FAB Add Button */}
                    <button onClick={() => {setEditingActivity(null); setIsActivityModalOpen(true);}} className="fixed bottom-24 right-4 w-12 h-12 bg-green-600 text-white rounded-full shadow-xl shadow-green-200 flex items-center justify-center hover:bg-green-700 active:scale-90 transition-all z-10"><Plus className="w-6 h-6" /></button>
                </div>
            )}

            {/* === MODALs === */}
            <ActivityModal
                isOpen={isActivityModalOpen}
                onClose={() => setIsActivityModalOpen(false)}
                onSave={handleSaveActivity}
                initialData={editingActivity}
            />

            {isManageDaysOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
                    <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl relative text-center">
                        <button onClick={() => setIsManageDaysOpen(false)} className="absolute top-4 right-4 bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200"><X className="w-4 h-4"/></button>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">จัดการจำนวนวัน 🗓️</h3>
                        <div className="flex items-center justify-center gap-4 mb-8">
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

export default PlanScreen;
