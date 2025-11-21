import React from 'react';
import { Plus } from 'lucide-react';

interface Props { onClick: () => void; }

const CreateTaskFAB: React.FC<Props> = ({ onClick }) => {
    return (
        <button onClick={onClick} className="fixed bottom-24 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-200 flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all z-30">
            <Plus className="w-8 h-8" />
        </button>
    );
};

export default CreateTaskFAB;
