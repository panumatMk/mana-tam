import React, {useState} from 'react';
import {Menu, Calendar, PenLine} from 'lucide-react';
import type {User} from '../../types/user.types';
import type {Trip} from '../../types/trip.types';
import {APP_NAME} from '../../config/constants';

interface Props {
    user: User;
    trip: Trip;
    participants: User[];
    onMenuClick: () => void;
    onEdit: () => void;
    isMinimized: boolean;
    activeTabLabel: string;
}

export const Header: React.FC<Props> = ({
                                            user,
                                            trip,
                                            participants,
                                            onMenuClick,
                                            onEdit,
                                            isMinimized,
                                            activeTabLabel
                                        }) => {

    // ตรวจสอบว่ามีการตั้งค่าทริปหรือยัง (เช็คจากชื่อทริป)
    const isTripSetup = trip.title && trip.title.trim() !== "";

    // คำนวณวันถอยหลัง (Countdown) จาก trip.startDate
    const getDaysLeft = () => {
        if (!trip.startDate || trip.startDate === 'TBD') return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = new Date(trip.startDate);
        start.setHours(0, 0, 0, 0);

        const diffTime = start.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    };

    const daysLeft = getDaysLeft();

    function formatDateRangeWithYear(startDateString: string, endDateString: string) {
        // แปลง string เป็น object Date
        const startDate = new Date(startDateString);
        const endDate = new Date(endDateString);

        // Array ของชื่อเดือนแบบย่อ
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        // ดึงข้อมูลวันที่
        const startDay = startDate.getDate();
        const startMonthIndex = startDate.getMonth();
        const startMonth = monthNames[startMonthIndex];
        const startYear = startDate.getFullYear();

        const endDay = endDate.getDate();
        const endMonthIndex = endDate.getMonth();
        const endMonth = monthNames[endMonthIndex];
        const endYear = endDate.getFullYear();

        // 1. ตรวจสอบว่า "ปีเดียวกัน" หรือไม่
        if (startYear === endYear) {
            // 1.1. ตรวจสอบว่า "เดือนเดียวกัน"
            if (startMonthIndex === endMonthIndex) {
                // Logic 1: เดือนเดียวกัน (26-28 Nov) -> ไม่ต้องแสดงปี
                return `${startDay} - ${endDay} ${startMonth} ${endYear}`;
            } else {
                // Logic 2: คนละเดือนแต่ปีเดียวกัน (28 Nov - 1 Dec) -> ไม่ต้องแสดงปี
                return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${endYear}`;
            }
        } else {
            // 2. Logic 3: คนละปี (28 Dec 2025 - 1 Jan 2026) -> แสดงปีทั้งหมด
            return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
        }
    }

    // === MINIMIZED MODE (แสดงตอนเลื่อนลง หรืออยู่แท็บอื่น) ===
    if (isMinimized) {
        return (
            <div className="flex-none bg-white px-5 py-3 shadow-sm z-20 flex items-center justify-between h-[60px]">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <Menu className="w-6 h-6"/>
                    </button>
                    <h1 className="text-lg font-bold text-gray-800">{activeTabLabel || APP_NAME}</h1>
                </div>

                {/* แสดงรูป Profile เล็กๆ */}
                <div className="flex items-center gap-2">
                    <img src={user.avatar} className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                         alt="avatar"/>
                </div>
            </div>
        );
    }

    // === FULL MODE (หน้าแรก) ===
    return (
        <div className="flex-none bg-white p-2 shadow-sm z-20 transition-all duration-300">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <Menu className="w-6 h-6"/>
                    </button>

                    {/* Title & Edit Button */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h1 className={`text-2xl font-bold leading-tight max-w-[220px] truncate ${!isTripSetup ? 'text-gray-400' : 'text-gray-800'}`}>
                                {isTripSetup ? trip.title : 'ยังไม่มีทริป'}
                            </h1>
                            <button
                                onClick={onEdit}
                                className="p-1.5 rounded-full bg-gray-50 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                            >
                                <PenLine className="w-4 h-4"/>
                            </button>
                        </div>

                        {/* Date Display */}
                        {isTripSetup && (
                            <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs font-medium">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <p>{formatDateRangeWithYear(trip.startDate, trip.endDate)}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Countdown Badge */}
                {isTripSetup && (
                    <div
                        className={`px-3 py-1.5 rounded-xl border text-center min-w-[60px] ${daysLeft >= 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                <span className="block text-[8px] uppercase opacity-60 font-bold tracking-wider">
                    {daysLeft > 0 ? 'Coming in' : (daysLeft === 0 ? 'Today!' : 'Ended')}
                </span>
                        {daysLeft > 0 && (
                            <span className="text-sm font-extrabold">{daysLeft} <span
                                className="text-[9px] font-normal">Days</span></span>
                        )}
                    </div>
                )}
            </div>

            {/* Team Avatars (แสดงเฉพาะเมื่อมีทริป) */}
            {isTripSetup && participants.length > 0 && (
                <div className="flex -space-x-2 overflow-hidden pl-1 mt-3">
                    {participants.slice(0, 5).map((p, index) => (
                        <img
                            key={p.id}
                            src={p.avatar}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover bg-gray-100"
                            style={{zIndex: 10 - index}}
                            alt={p.name}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

