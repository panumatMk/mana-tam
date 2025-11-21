import React from 'react';
import { Plus } from 'lucide-react';

interface Props {
    onClick: () => void;
}

const CreateVoteFAB: React.FC<Props> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-4 w-14 h-14 bg-green-500 text-white rounded-full shadow-xl shadow-green-200 flex items-center justify-center hover:bg-green-600 active:scale-90 transition-all z-30"
        >
            <Plus className="w-8 h-8" />
        </button>
    );
};

export default CreateVoteFAB;
