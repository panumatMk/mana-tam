import React from 'react';
import { Map, Vote, CheckSquare, Wallet, FileText, Dice5 } from 'lucide-react';

interface BottomNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
    const navItems = [
        { id: 'plan', label: 'Plan', icon: Map },
        { id: 'vote', label: 'Vote', icon: Vote },
        { id: 'task', label: 'Task', icon: CheckSquare },
        { id: 'money', label: 'Money', icon: Wallet },
        { id: 'docs', label: 'Docs', icon: FileText },
        { id: 'rand', label: 'Rand', icon: Dice5 },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-6 pt-2 px-2 shadow-[0_-5px_15px_rgba(0,0,0,0.03)] z-50">
            <div className="flex justify-between items-center">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`flex flex-col items-center justify-center w-full transition-all duration-200 ${
                                isActive ? 'text-green-600 -translate-y-1' : 'text-gray-400'
                            }`}
                        >
                            <item.icon
                                className={`w-6 h-6 mb-1 ${isActive ? 'fill-current/10' : ''}`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
