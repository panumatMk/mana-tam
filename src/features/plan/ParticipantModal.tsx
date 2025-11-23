import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { UserPlus } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
}

export const ParticipantModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
            setName('');
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="เพิ่มเพื่อนร่วมทริป 🙋‍♂️"
            footer={
                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700"
                >
                    <UserPlus className="w-5 h-5" /> เพิ่มเข้าแก๊ง
                </button>
            }
        >
            <div className="space-y-4 py-2">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">ชื่อเพื่อน</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 font-bold text-gray-800 focus:border-blue-500 outline-none"
                        placeholder="เช่น น้องมายด์, พี่บอย"
                        autoFocus
                    />
                </div>
            </div>
        </Modal>
    );
};
