import React from 'react';

interface Props {
    currentTab: 'ACTIVE' | 'HISTORY';
    onTabChange: (tab: 'ACTIVE' | 'HISTORY') => void;
}

const BillTabs: React.FC<Props> = ({ currentTab, onTabChange }) => {
    return (
        <div className="flex bg-gray-200 p-1 rounded-xl mb-4">
            <button
                onClick={() => onTabChange('ACTIVE')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${currentTab === 'ACTIVE' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
                ⏳ รอเก็บเงิน
            </button>
            <button
                onClick={() => onTabChange('HISTORY')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${currentTab === 'HISTORY' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}
            >
                ✅ ประวัติ (ครบแล้ว)
            </button>
        </div>
    );
};

export default BillTabs;
