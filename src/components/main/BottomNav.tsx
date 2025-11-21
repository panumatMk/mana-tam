import React from 'react';
import { Map, BarChartBig, CheckSquare, PieChart, Receipt, Folder } from 'lucide-react';

interface BottomNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {

    // เลือกไอคอนที่ทรงเหมือนในรูปที่สุด
    const leftGroup = [
        { id: 'plan', label: 'Plan', icon: Map },
        { id: 'vote', label: 'Vote', icon: BarChartBig }, // ใช้ BarChartBig ทรงจะเต็มกว่า
        { id: 'task', label: 'Task', icon: CheckSquare },
    ];

    const rightGroup = [
        { id: 'cost', label: 'Cost', icon: PieChart },
        { id: 'bill', label: 'Bill', icon: Receipt },
        { id: 'docs', label: 'Docs', icon: Folder },
    ];

    const renderButton = (item: typeof leftGroup[0]) => {
        const isActive = activeTab === item.id;

        // กำหนดสี: ถ้า Active ให้เป็นสี (Vote=เขียว, อื่นๆ=ฟ้า), ถ้า Inactive สีเทาอ่อนๆ
        const iconColor = isActive
            ? (item.id === 'vote' ? 'text-green-600' : 'text-blue-600')
            : 'text-gray-400';

        return (
            <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200 group"
            >
                <div className={`mb-1 transition-transform duration-200 ${isActive ? '-translate-y-1' : ''}`}>
                    <item.icon
                        className={`w-7 h-7 ${iconColor}`}
                        // ✨ MAGIC FIX: ทำให้ไอคอนเป็นสีทึบ (Solid) เหมือนในรูป
                        fill="currentColor"
                        fillOpacity={isActive ? 1 : 0.5} // ถ้าเลือกอยู่ให้ทึบ 100%, ถ้าไม่เลือกให้จางๆ หน่อย
                        strokeWidth={0} // ลบเส้นขอบออก เพื่อให้ดูเป็น Icon แบบ Flat Design
                    />
                </div>

                <span className={`text-[10px] font-bold transition-colors ${
                    isActive
                        ? (item.id === 'vote' ? 'text-green-600' : 'text-blue-600')
                        : 'text-gray-400'
                }`}>
          {item.label}
        </span>
            </button>
        );
    };

    return (
        <div className="flex-none bg-white border-t border-gray-100 pb-6 pt-3 px-2 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] z-50">
            <div className="flex items-center">

                {/* Left Group */}
                <div className="flex-1 flex justify-around">
                    {leftGroup.map(renderButton)}
                </div>

                {/* Divider (เส้นคั่นบางๆ สีจางๆ) */}
                <div className="w-[1px] h-8 bg-gray-200 mx-2 opacity-50"></div>

                {/* Right Group */}
                <div className="flex-1 flex justify-around">
                    {rightGroup.map(renderButton)}
                </div>

            </div>
        </div>
    );
};

export default BottomNav;
