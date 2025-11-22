import React from 'react';
import type { TaskStatus } from './types';

interface Props {
    currentTab: 'ALL' | TaskStatus;
    onTabChange: (tab: 'ALL' | TaskStatus) => void;
}

const TaskTabs: React.FC<Props> = ({ currentTab, onTabChange }) => {
    const tabs = [
        { id: 'ALL', label: 'ทั้งหมด' },
        { id: 'TODO', label: '⏳ ยังไม่เสร็จ' },
        { id: 'DONE', label: '✅ เสร็จแล้ว' },
    ];

    return (
        <div className="flex gap-2 mb-4 px-1">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id as any)}
                    className={`
            px-4 py-1.5 rounded-full text-xs font-bold transition-all border
            ${currentTab === tab.id
                        ? 'bg-green-600 text-white border-green-600 shadow-sm'
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}
          `}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default TaskTabs;
