import React, { useState } from 'react';
import {Plus, Calendar, MapPin, Trash2, Link as LinkIcon, Settings, Minus, GripVertical, X} from 'lucide-react';
import type { Activity, Trip } from '../../types/plan.types';
import { ActivityModal } from './ActivityModal';
import { EditTripModal } from './EditTripModal';

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
    horizontalListSortingStrategy,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import ConfirmModal from "../../components/common/ConfirmModal.tsx";
import { SortableItem } from '../../components/common/SorttableItem.tsx';

interface PlanScreenProps {
    trip: Trip;
    onSaveTrip: (trip: Trip) => void;
}

export const PlanScreen: React.FC<PlanScreenProps> = ({ trip, onSaveTrip }) => {
    // State
    const [days, setDays] = useState<number[]>([1]);
    const [activeDay, setActiveDay] = useState(1);
    const [activities, setActivities] = useState<Activity[]>([]);

    // Modals
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [isTripModalOpen, setIsTripModalOpen] = useState(false);
    const [isManageDaysOpen, setIsManageDaysOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [tempDayCount, setTempDayCount] = useState(days.length);

    // Logic: ตรวจสอบว่าทริปถูกตั้งค่าหรือยัง (title ไม่ว่าง)
    const isTripSetup = trip.title !== "";

    // Sensors for Drag & Drop
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // --- Handlers ---

    const handleAddDay = () => {
        const newDay = days.length + 1;
        setDays([...days, newDay]);
        setActiveDay(newDay);
    };

    const handleUpdateDays = () => {
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

    // Drag & Drop Handlers
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

    const handleDragActivityEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const currentDayActs = activities.filter(a => a.day === activeDay);
        const oldIndex = currentDayActs.findIndex(i => i.id === active.id);
        const newIndex = currentDayActs.findIndex(i => i.id === over.id);

        // Swap Time Logic
        const timeSlots = currentDayActs.map(a => a.time);
        const reorderedActs = arrayMove(currentDayActs, oldIndex, newIndex);
        const finalActsForDay = reorderedActs.map((act, index) => ({ ...act, time: timeSlots[index] }));

        setActivities(prev => {
            const otherDaysActs = prev.filter(a => a.day !== activeDay);
            return [...otherDaysActs, ...finalActsForDay];
        });
    };

    const currentActivities = activities
        .filter(a => a.day === activeDay)
        .sort((a, b) => a.time.localeCompare(b.time));

    // --- 1. EMPTY STATE (ยังไม่สร้างทริป) ---
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

                {/* Modal สร้างทริป (เปิดเมื่อกดปุ่ม) */}
                <EditTripModal
                    isOpen={isTripModalOpen}
                    onClose={() => setIsTripModalOpen(false)}
                    onSave={onSaveTrip}
                    initialTrip={trip}
                />
            </div>
        );
    }

    // --- 2. TIMELINE STATE (มีทริปแล้ว) ---
    return (
        <div className="flex flex-col h-full bg-F3F4F6 relative">

            {/* Header Section (Day Tabs) */}
            <div className="flex-none px-4 pt-2 pb-2 bg-F3F4F6 z-10 shadow-sm">
                <div className="flex justify-between items-center animate-fade-in mb-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-800">Timeline</h2>
                        <button onClick={() => {setTempDayCount(days.length); setIsManageDaysOpen(true);}} className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="text-xs text-gray-400 font-medium">Total {days.length} Days</div>
                </div>

                {/* Draggable Tabs */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragDayEnd}>
                    <SortableContext items={days} strategy={horizontalListSortingStrategy}>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar touch-pan-x p-1">
                            {days.map((dayId, index) => (
                                <SortableItem key={dayId} id={dayId} className="flex-shrink-0">
                                    <button
                                        onClick={() => setActiveDay(dayId)}
                                        className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all shadow-sm border 
                                    ${activeDay === dayId ? 'bg-green-600 text-white border-green-600 scale-105 ring-2 ring-green-200' : 'bg-white text-gray-500 border-gray-200'}
                                `}
                                    >
                                        Day {index + 1}
                                    </button>
                                </SortableItem>
                            ))}
                            <button onClick={handleAddDay} className="w-10 h-9 flex-shrink-0 flex items-center justify-center bg-white rounded-xl text-green-500 border border-dashed border-green-300 hover:bg-green-50 transition-colors">
                                <Plus className="w-4 h-4"/>
                            </button>
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* Content Section (List) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24 relative">
                <div className="space-y-3 min-h-[100px] pt-2">
                    {currentActivities.length === 0 ? (
                        // Empty Timeline State (ตามรูปที่ 3)
                        <div className="flex flex-col items-center justify-center py-20 mt-4 opacity-60">
                            <MapPin className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-sm font-bold text-gray-400">Day {days.indexOf(activeDay) + 1} ยังว่างอยู่</p>
                            <button
                                onClick={() => {setEditingActivity(null); setIsActivityModalOpen(true);}}
                                className="mt-4 text-green-600 text-sm font-bold flex items-center gap-1 hover:underline bg-green-50 px-4 py-2 rounded-full"
                            >
                                <Plus className="w-4 h-4" /> เพิ่มกิจกรรมแรก
                            </button>
                        </div>
                    ) : (
                        // Draggable List
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragActivityEnd}>
                            <SortableContext items={currentActivities.map(a => a.id)} strategy={verticalListSortingStrategy}>
                                {currentActivities.map((item) => (
                                    <SortableItem key={item.id} id={item.id}>
                                        <div
                                            onClick={() => {setEditingActivity(item); setIsActivityModalOpen(true);}}
                                            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-3 items-start group cursor-pointer hover:border-green-200 active:scale-[0.98] transition-all"
                                        >
                                            <div className="mt-1 text-gray-300 cursor-grab active:cursor-grabbing p-1 -ml-2">
                                                <GripVertical className="w-4 h-4" />
                                            </div>

                                            <div className="flex flex-col items-center min-w-[50px] border-r border-gray-100 pr-3">
                                                <span className="text-sm font-bold text-gray-800">{item.time}</span>
                                                <div className="h-full w-[2px] bg-gray-100 mt-2 rounded-full group-hover:bg-green-100 transition-colors"></div>
                                            </div>

                                            <div className="flex-1 pt-0.5 overflow-hidden">
                                                <h4 className="font-bold text-gray-800 text-sm truncate">{item.title}</h4>
                                                {item.note && <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{item.note}</p>}

                                                {/* Link Badges */}
                                                {item.links && item.links.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {item.links.map((l, idx) => (
                                                            <div key={idx} className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition-colors ${l.type === 'map' ? 'text-red-500 bg-red-50' : 'text-blue-600 bg-blue-50'}`}>
                                                                {l.type === 'map' ? <MapPin className="w-3 h-3"/> : <LinkIcon className="w-3 h-3"/>}
                                                                <span className="truncate max-w-[100px]">{l.url}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={(e) => confirmDeleteActivity(item.id, e)}
                                                className="text-gray-300 hover:text-red-500 p-1.5 -mr-1 z-10 rounded-full hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                    <div className="h-20"></div>
                </div>
            </div>

            {/* FAB (แสดงเฉพาะเมื่อมีกิจกรรมแล้ว) */}
            {currentActivities.length > 0 && (
                <button
                    onClick={() => {setEditingActivity(null); setIsActivityModalOpen(true);}}
                    className="absolute bottom-24 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-xl shadow-green-200 flex items-center justify-center hover:bg-green-700 active:scale-90 transition-all z-30"
                >
                    <Plus className="w-8 h-8" />
                </button>
            )}

            {/* Modals */}
            <ActivityModal
                isOpen={isActivityModalOpen}
                onClose={() => setIsActivityModalOpen(false)}
                onSave={handleSaveActivity}
                initialData={editingActivity}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteActivity}
                title="ลบกิจกรรม?"
                message="ลบแล้วหายเลยนะ กู้คืนไม่ได้ เอาจริงดิ?"
            />

            {/* Manage Days Modal */}
            {isManageDaysOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
                    <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl relative text-center">
                        {/* ...Content... */}
                        <button onClick={() => setIsManageDaysOpen(false)} className="absolute top-4 right-4 bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200"><X className="w-4 h-4"/></button>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">จัดการจำนวนวัน 🗓️</h3>
                        <div className="flex items-center justify-center gap-4 mb-8 mt-6">
                            <button onClick={() => setTempDayCount(Math.max(1, tempDayCount - 1))} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-500 active:scale-90"><Minus className="w-6 h-6" /></button>
                            <div className="text-4xl font-bold text-gray-800 w-16">{tempDayCount}</div>
                            <button onClick={() => setTempDayCount(tempDayCount + 1)} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-green-100 hover:text-green-600 active:scale-90"><Plus className="w-6 h-6" /></button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsManageDaysOpen(false)} className="flex-1 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl">ยกเลิก</button>
                            <button onClick={handleUpdateDays} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg">บันทึก</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
