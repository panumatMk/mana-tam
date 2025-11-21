import React from 'react';
import type { VoteStatus } from './types';

interface Props {
    currentTab: 'ALL' | VoteStatus;
    onTabChange: (tab: 'ALL' | VoteStatus) => void;
}

const VoteTabs: React.FC<Props> = ({ currentTab, onTabChange }) => {
    const tabs = [
        { id: 'ALL', label: 'ทั้งหมด', icon: null },
        { id: 'PENDING', label: '⏳ กำลังโหวต', icon: null },
        { id: 'APPROVED', label: '✅ ผ่านแล้ว', icon: null },
    ];

    return (
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar px-1">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id as any)}
                    className={`
            flex-1 py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all border
            ${currentTab === tab.id
                        ? 'bg-gray-800 text-white border-gray-800 shadow-md'
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}
          `}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default VoteTabs;
