import React from 'react';
import { Menu } from 'lucide-react';
import { APP_NAME, MOCK_TRIP_NAME, MOCK_TRIP_DATE } from '../../config/constants'; // สมมติว่ามีไฟล์นี้

interface Props {
    onMenuClick: () => void;
}

export const Header: React.FC<Props> = ({ onMenuClick }) => {
    // Mock logic for countdown (สามารถเปลี่ยนเป็น props รับค่าจริงได้)
    const daysLeft = 45;

    return (
        <div className="flex-none bg-white px-5 py-3 shadow-sm z-20 flex items-center justify-between h-[70px] rounded-b-2xl">
            <div className="flex items-center gap-3">
                {/* Hamburger Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Title & Date */}
                <div>
                    <h1 className="text-lg font-bold text-gray-800 leading-tight">{MOCK_TRIP_NAME || APP_NAME}</h1>
                    <div className="flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <p className="text-[10px] text-gray-500 font-medium">{MOCK_TRIP_DATE}</p>
                    </div>
                </div>
            </div>

            {/* Countdown Badge */}
            <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-xl border border-green-100 text-center min-w-[60px]">
                <span className="block text-[8px] uppercase opacity-60 font-bold tracking-wider">In</span>
                <span className="text-sm font-extrabold">{daysLeft} <span className="text-[9px] font-normal">Days</span></span>
            </div>
        </div>
    );
};
