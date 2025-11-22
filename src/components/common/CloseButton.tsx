import React from 'react';
import {ChevronDown} from 'lucide-react';

interface Props {
    onClick: () => void;
    className?: string; // เผื่ออยากปรับตำแหน่งเพิ่มเติม
}

export const CloseButton: React.FC<Props> = ({ onClick, className = "" }) => {
    return (
        <button
            onClick={onClick}
            className={`p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-black/5 active:scale-90 transition-all duration-200 ${className}`}
            aria-label="Close"
        >
            <ChevronDown className="w-6 h-6" strokeWidth={3} />
        </button>
    );
};
