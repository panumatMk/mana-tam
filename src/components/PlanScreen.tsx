import React, { useState } from 'react';
import { Plus, CalendarDays } from 'lucide-react';

interface PlanScreenProps {
    tripDate: string; // รับค่าวันที่มาเช็ค
    onSetupTrip: () => void; // ฟังก์ชันเปิด Modal ตั้งค่าทริป
}

const PlanScreen: React.FC<PlanScreenProps> = ({ tripDate, onSetupTrip }) => {
    const [timelineItems, setTimelineItems] = useState<any[]>([]);

    // เช็คว่าทริปถูกตั้งค่าหรือยัง (ถ้ายังเป็น TBD แปลว่ายัง)
    const isTripSetup = tripDate !== 'TBD';

    // ฟังก์ชันสร้างกิจกรรม (จะใช้ได้ก็ต่อเมื่อตั้งค่าทริปแล้ว)
    const handleAddActivity = () => {
        setTimelineItems([
            { id: 1, time: '09:00', title: 'ถึงสนามบิน', type: 'flight' }
        ]);
    };

    return (
        <div className="p-4 pt-2 space-y-4 pb-24">

            {/* Header: โชว์คำว่า Timeline เฉพาะตอนตั้งค่าทริปเสร็จแล้ว */}
            {isTripSetup && (
                <div className="flex justify-between items-center animate-fade-in">
                    <h2 className="text-lg font-bold text-gray-800">Timeline</h2>
                    <button className="text-xs text-gray-400 underline">จัดการวัน (Edit)</button>
                </div>
            )}

            {/* === CASE: ยังไม่มี Timeline Items === */}
            {timelineItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center shadow-sm mt-4">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <CalendarDays className="text-green-500 w-8 h-8" />
                    </div>
                    <h3 className="text-gray-800 font-bold mb-1">ยังไม่มีแผนเที่ยวเลย</h3>
                    <p className="text-gray-400 text-xs mb-6">
                        {isTripSetup
                            ? "เริ่มสร้าง Timeline วันแรกของคุณกันเถอะ"
                            : "ตั้งชื่อทริปและระบุวันเดินทางก่อนนะ"}
                    </p>

                    <button
                        onClick={isTripSetup ? handleAddActivity : onSetupTrip}
                        className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-200 flex items-center gap-2 hover:bg-green-700 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>สร้างแผนเที่ยว</span>
                    </button>
                </div>
            ) : (
                // === CASE: มี Timeline แล้ว ===
                <div className="space-y-4 animate-fade-in">
                    {/* Day Selector */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md whitespace-nowrap">Day 1</button>
                        <button className="bg-white text-gray-500 border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap">Day 2</button>
                        <button className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 border border-dashed border-gray-300"><Plus className="w-4 h-4"/></button>
                    </div>

                    {/* Items */}
                    {timelineItems.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                            <div className="flex flex-col items-center justify-center px-2 border-r border-gray-100">
                                <span className="text-sm font-bold text-gray-800">{item.time}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">{item.title}</h4>
                                <p className="text-xs text-gray-400">แตะเพื่อแก้ไขรายละเอียด</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default PlanScreen;
