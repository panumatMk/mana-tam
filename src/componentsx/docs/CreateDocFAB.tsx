import React from 'react';
import { Plus } from 'lucide-react';

interface Props {
    onClick: () => void;
}

const CreateDocFAB: React.FC<Props> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            // ใช้สีเหลือง (yellow-500) ให้เข้าธีม Docs
            className="fixed bottom-24 right-4 w-14 h-14 bg-yellow-500 text-white rounded-full shadow-xl shadow-yellow-200 flex items-center justify-center hover:bg-yellow-600 active:scale-90 transition-all z-30"
        >
            <Plus className="w-8 h-8" />
        </button>
    );
};

export default CreateDocFAB;
