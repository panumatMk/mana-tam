import React, { useState } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import type { User } from '../../types/user.types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    onSave: (updatedUser: User) => void;
}

const SEEDS = ['Felix', 'Aneka', 'Bob', 'Sky', 'Mini', 'Bella', 'Jack', 'Luna', 'Leo', 'Nora'];
const getAvatarUrl = (seed: string) => `https://api.dicebear.com/9.x/micah/svg?seed=${seed}&mouth=smile,laughing&baseColor=f9c9b6,ac6651`;

export const EditProfileModal: React.FC<Props> = ({ isOpen, onClose, currentUser, onSave }) => {
    const [name, setName] = useState(currentUser.name);
    const [currentAvatar, setCurrentAvatar] = useState(currentUser.avatar);

    const handleRandom = () => {
        const seed = SEEDS[Math.floor(Math.random() * SEEDS.length)];
        setCurrentAvatar(getAvatarUrl(seed));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ ...currentUser, name, avatar: currentAvatar });
        onClose();
    };

    const footer = (
        <button type="submit" form="edit-profile-form" className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
            <Save className="w-4 h-4"/> บันทึกการแก้ไข
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="แก้ไขโปรไฟล์ ✏️" footer={footer}>
            <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6 py-2">
                {/* Avatar Editor */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden mb-3 bg-gray-100 relative">
                        <img src={currentAvatar} className="w-full h-full object-cover" />
                    </div>
                    <button type="button" onClick={handleRandom} className="text-xs flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                        <RotateCcw className="w-3 h-3" /> สุ่มรูปใหม่
                    </button>
                </div>

                {/* Name Input */}
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">ชื่อเล่น</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold text-gray-800 outline-none focus:ring-2 ring-gray-200"
                    />
                </div>
            </form>
        </Modal>
    );
};
