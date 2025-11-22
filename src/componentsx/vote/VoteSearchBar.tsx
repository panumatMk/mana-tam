import React from 'react';
import { Search } from 'lucide-react';

interface Props {
    value: string;
    onChange: (val: string) => void;
}

const VoteSearchBar: React.FC<Props> = ({ value, onChange }) => {
    return (
        <div className="bg-white p-3 rounded-2xl shadow-sm mb-4">
            <div className="relative bg-gray-50 rounded-xl flex items-center">
                <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="ค้นหาโหวต..."
                    className="w-full bg-transparent py-3 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
            </div>
        </div>
    );
};

export default VoteSearchBar;
