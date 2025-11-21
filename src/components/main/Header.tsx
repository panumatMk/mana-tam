import React from 'react';
import { Calendar, PenLine, Dice5 } from 'lucide-react'; // เพิ่ม Dice5

interface User {
    name: string;
    avatar: string;
}

interface Trip {
    title: string;
    startDate: string;
    endDate: string;
}

interface HeaderProps {
    user: User;
    trip: Trip;
    onEdit: () => void;
    onRandomClick: () => void; // รับฟังก์ชันเปิด Modal
}

const Header: React.FC<HeaderProps> = ({ user, trip, onEdit, onRandomClick }) => {
    const isTripSetup = trip.startDate !== 'TBD';

    // ... (Logic StatusBadge เหมือนเดิม) ...
    const renderStatusBadge = () => {
        // (ขอละไว้ฐานที่เข้าใจ ใช้โค้ดเดิมได้เลยครับ)
        if (!isTripSetup) return null;
        return <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-100 flex flex-col items-center min-w-[70px]"><span className="text-[8px] uppercase font-bold opacity-60 tracking-wider">Coming in</span><div className="leading-none mt-0.5"><span className="text-base font-bold">45</span><span className="text-[9px] font-bold ml-0.5">Days</span></div></div>;
    };

    return (
        <div className="bg-white px-5 pt-10 pb-4 shadow-sm rounded-b-3xl flex-none z-20 relative">

            {/* Row 1: Title & Badge */}
            <div className="flex justify-between items-start mb-2 h-[50px]">
                <div className="flex items-start gap-2 pt-1">
                    <h1 className={`text-3xl font-bold leading-tight max-w-[200px] truncate ${!isTripSetup ? 'text-gray-300' : 'text-gray-800'}`}>
                        {trip.title}
                    </h1>
                    <button onClick={onEdit} className="text-gray-300 hover:text-green-500 bg-gray-50 p-1.5 rounded-full transition-colors mt-1">
                        <PenLine className="w-4 h-4" />
                    </button>
                </div>
                {renderStatusBadge()}
            </div>

            {/* Row 2: User Info + RANDOM BUTTON */}
            <div className="flex justify-between items-end">

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full border border-gray-200"/>
                        <span className="text-xs font-bold text-gray-500">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                        <Calendar className={`w-3.5 h-3.5 ${isTripSetup ? 'text-green-500' : 'text-gray-300'}`} />
                        <span>{isTripSetup ? `${trip.startDate} - ${trip.endDate}` : 'ยังไม่ระบุวัน'}</span>
                    </div>
                </div>

                {/* ปุ่ม Random อยู่ตรงนี้! */}
                <button
                    onClick={onRandomClick}
                    className="bg-purple-100 text-purple-600 px-3 py-1.5 rounded-full flex items-center gap-1 text-[10px] font-bold hover:bg-purple-200 transition-colors shadow-sm"
                >
                    <Dice5 className="w-3.5 h-3.5" />
                    <span>เสี่ยงดวง</span>
                </button>

            </div>
        </div>
    );
};

export default Header;
