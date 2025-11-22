import React, { useState } from 'react';
import { X, Type, FileText, Users, Percent, Save } from 'lucide-react';
import type { VoteItem } from './types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<VoteItem, 'id' | 'status' | 'votesFor' | 'votesAgainst'>) => void;
    totalGroupMembers: number; // เอาไว้คำนวณ Preview
}

const CreateVoteModal: React.FC<Props> = ({ isOpen, onClose, onSave, totalGroupMembers }) => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [thresholdType, setThresholdType] = useState<'count' | 'percent'>('count');
    const [thresholdValue, setThresholdValue] = useState<number>(Math.ceil(totalGroupMembers / 2)); // Default ครึ่งนึง

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSave({
            title,
            description: desc,
            thresholdType,
            thresholdValue
        });

        // Reset & Close
        setTitle('');
        setDesc('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">

                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">สร้างโหวตใหม่ 🗳️</h3>
                    <button onClick={onClose} className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                        <X className="w-4 h-4"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Title */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">หัวข้อโหวต <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Type className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="เช่น ไปสวนสนุกไหม?"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 p-2.5 text-sm font-bold focus:border-orange-500 outline-none"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">รายละเอียด (เช่น ราคา)</label>
                        <div className="relative">
                            <FileText className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                            <textarea
                                rows={2}
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                placeholder="บัตรคนละ 1,500 บาท..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 p-2.5 text-xs focus:border-orange-500 outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Threshold Setting */}
                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                        <label className="block text-[10px] font-bold text-orange-500 mb-2 uppercase">เงื่อนไขการผ่าน (Pass Condition)</label>

                        {/* Switcher */}
                        <div className="flex bg-white p-1 rounded-lg border border-orange-100 mb-3">
                            <button
                                type="button"
                                onClick={() => { setThresholdType('count'); setThresholdValue(Math.ceil(totalGroupMembers/2)); }}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-all ${thresholdType === 'count' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-400'}`}
                            >
                                <Users className="w-3 h-3" /> นับคน
                            </button>
                            <button
                                type="button"
                                onClick={() => { setThresholdType('percent'); setThresholdValue(50); }}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-all ${thresholdType === 'percent' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-400'}`}
                            >
                                <Percent className="w-3 h-3" /> เปอร์เซ็นต์
                            </button>
                        </div>

                        {/* Value Slider/Input */}
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="1"
                                max={thresholdType === 'count' ? totalGroupMembers : 100}
                                value={thresholdValue}
                                onChange={(e) => setThresholdValue(Number(e.target.value))}
                                className="flex-1 h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <div className="w-16 bg-white border border-orange-200 rounded-lg py-1 text-center text-orange-600 font-bold text-sm">
                                {thresholdValue} {thresholdType === 'count' ? 'คน' : '%'}
                            </div>
                        </div>

                        <p className="text-[10px] text-orange-400 mt-2 text-center">
                            *ต้องมีคนเห็นด้วยอย่างน้อย
                            <span className="font-bold"> {thresholdType === 'count' ? thresholdValue : Math.ceil((totalGroupMembers * thresholdValue) / 100)} </span>
                            คน จาก {totalGroupMembers} คน
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={!title.trim()}
                        className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" /> สร้างโหวต
                    </button>

                </form>
            </div>
        </div>
    );
};

export default CreateVoteModal;
