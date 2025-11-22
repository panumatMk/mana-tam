import React, { useState } from 'react';
import { Plus, Calendar, MapPin, Trash2, Link as LinkIcon } from 'lucide-react';
import type { Activity } from '../../types/plan.types';
import { ActivityModal } from './ActivityModal';

// Mock Data เริ่มต้น
const MOCK_ACTIVITIES: Activity[] = [
    { id: '1', day: 1, time: '09:00', title: 'ถึงสนามบิน Narita', note: 'รับ Pocket WiFi ชั้น 2' },
    { id: '2', day: 1, time: '11:00', title: 'เข้าที่พัก Ueno', link: 'https://maps.google.com' },
];

export const PlanScreen: React.FC = () => {
    const [days, setDays] = useState([1, 2, 3]);
    const [activeDay, setActiveDay] = useState(1);
    const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter Activities for current day
    const dayActivities = activities
        .filter(a => a.day === activeDay)
        .sort((a, b) => a.time.localeCompare(b.time));

    const handleSave = (data: any) => {
        const newAct = { id: Date.now().toString(), day: activeDay, ...data };
        setActivities(prev => [...prev, newAct]);
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if(confirm('ลบกิจกรรมนี้?')) setActivities(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className="flex flex-col h-full bg-F3F4F6 relative">
            <style>{`
                .hide-scrollbar {
                    /* สำหรับ Firefox */
                    scrollbar-width: none;
                    /* สำหรับ IE/Edge Legacy */
                    -ms-overflow-style: none;
                }
                
                /* สำหรับ Chrome, Safari, Edge (Chromium) */
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {/* Day Tabs (Scrollable) */}
            <div className="flex-none px-4 py-3 bg-white border-b border-gray-100 overflow-x-auto custom-scrollbar flex gap-2 sticky top-0 z-10 shadow-sm hide-scrollbar">
                {days.map(day => (
                    <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={`px-5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeDay === day ? 'bg-green-600 text-white shadow-md ring-2 ring-green-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}
                    >
                        Day {day}
                    </button>
                ))}
                <button onClick={() => setDays([...days, days.length + 1])} className="px-3 py-1.5 rounded-full bg-white border border-dashed border-gray-300 text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors">
                    <Plus className="w-4 h-4"/>
                </button>
            </div>

            {/* Activity List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 pb-28">
                {dayActivities.length === 0 ? (
                    <div className="text-center py-16 text-gray-300 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                            <Calendar className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="text-xs font-medium">ยังไม่มีกิจกรรมใน Day {activeDay}</p>
                        <button onClick={() => setIsModalOpen(true)} className="mt-4 text-green-600 text-xs font-bold underline">เพิ่มกิจกรรมแรก</button>
                    </div>
                ) : (
                    dayActivities.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 relative group hover:border-green-200 transition-colors">
                            {/* Time Column */}
                            <div className="flex flex-col items-center min-w-[50px] border-r border-gray-100 pr-4">
                                <span className="text-sm font-bold text-gray-800">{item.time}</span>
                                <div className="h-full w-[2px] bg-gray-100 mt-2 rounded-full group-hover:bg-green-100 transition-colors"></div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-0.5 min-w-0">
                                <h4 className="font-bold text-gray-800 text-sm truncate">{item.title}</h4>
                                {item.note && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.note}</p>}
                                {item.link && (
                                    <a href={item.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors">
                                        <LinkIcon className="w-3 h-3"/> Link
                                    </a>
                                )}
                            </div>

                            {/* Delete Action */}
                            <button onClick={() => handleDelete(item.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 p-1">
                                <Trash2 className="w-4 h-4"/>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* FAB (Floating Action Button) */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-xl shadow-green-200 flex items-center justify-center hover:bg-green-700 active:scale-90 transition-all z-30"
            >
                <Plus className="w-8 h-8" />
            </button>

            {/* Modal */}
            <ActivityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
        </div>
    );
};
