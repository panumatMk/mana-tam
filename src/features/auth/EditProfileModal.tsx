import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Sparkles } from 'lucide-react';
import type { User } from '../../types/user.types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    onSave: (updatedUser: User) => void;
}

const generateRandomSeed = () => {
    return (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
};

// Cache Busting Timestamp
const getAvatarUrl = (seed: string) => `https://api.dicebear.com/9.x/micah/svg?seed=${seed}&mouth=smile,laughing&baseColor=f9c9b6,ac6651&t=${Date.now()}`;

export const EditProfileModal: React.FC<Props> = ({ isOpen, onClose, currentUser, onSave }) => {
    const [name, setName] = useState(currentUser.name);
    const [currentAvatar, setCurrentAvatar] = useState(currentUser.avatar);

    // State Effect
    const [isRandomizing, setIsRandomizing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Reset state
    useEffect(() => {
        if (isOpen) {
            setIsRandomizing(false);
            setIsSuccess(false);
            // Reset Avatar กลับมาเป็นของ User ปัจจุบันเผื่อกด cancel ไปแล้วเปิดใหม่
            setCurrentAvatar(currentUser.avatar);
        }
    }, [isOpen, currentUser]);

    const handleRandom = () => {
        if (isRandomizing || isSuccess) return;

        // 1. เริ่มหมุน (แต่ยังใช้รูปเดิม!)
        setIsRandomizing(true);
        setIsSuccess(false);

        // เตรียมรูปใหม่ไว้ในใจ (สร้าง URL รอ)
        const nextSeed = generateRandomSeed();
        const nextAvatarUrl = getAvatarUrl(nextSeed);

        // *เทคนิคพิเศษ*: Preload รูปใหม่ไว้ใน Memory ระหว่างที่กำลังหมุน
        // พอหมุนเสร็จจะได้โชว์ทันที ไม่ขาว
        const img = new Image();
        img.src = nextAvatarUrl;

        // หมุนเล่นๆ ไป 800ms (เพื่อให้ User รู้สึกว่ากำลังสุ่ม)
        setTimeout(() => {
            // 2. หยุดหมุน + เปลี่ยนรูปทันที
            setCurrentAvatar(nextAvatarUrl);

            setIsRandomizing(false);
            setIsSuccess(true);

            // ปิดวิ้งๆ อัตโนมัติ
            setTimeout(() => {
                setIsSuccess(false);
            }, 800);
        }, 700);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            if (navigator.vibrate) navigator.vibrate(200);
            return;
        }
        onSave({ ...currentUser, name, avatar: currentAvatar });
        onClose();
    };

    const footer = (
        <button
            type="submit"
            form="edit-profile-form"
            className="w-full bg-green-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all text-base flex items-center justify-center gap-2"
        >
            พร้อมลุยต่อ! 🚀
        </button>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="ปรับลุคใหม่ ✨"
            footer={footer}
        >
        {/* Animation: Flip เหรียญ (เร็วหน่อยให้ดูไม่ออกว่าเป็นรูปเดิม) */}
        <style>{`
            @keyframes flip-vertical-fast {
                0% { transform: perspective(400px) rotateY(0deg); }
                100% { transform: perspective(400px) rotateY(360deg); }
            }
            .animate-flip-fast {
                animation: flip-vertical-fast 0.4s infinite linear;
            }
        `}</style>

            <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6 py-4">

                {/* Avatar Editor */}
                <div className="flex flex-col items-center">
                    <div
                        className="relative group cursor-pointer"
                        onClick={handleRandom}
                    >
                        {/* กรอบรูป */}
                        <div className={`
                        w-40 h-40 rounded-[2rem] border-4 overflow-hidden flex items-center justify-center 
                        transform transition-all duration-300 ease-out shadow-xl bg-white
                        ${isRandomizing ? 'animate-flip-fast border-green-300 opacity-90' : ''} 
                        ${isSuccess
                            ? 'border-yellow-400 scale-110 shadow-yellow-200 ring-4 ring-yellow-100'
                            : 'border-green-400 hover:scale-105'
                        }
                    `}>
                            {/* รูปอวตาร */}
                            <img
                                key={currentAvatar} // เปลี่ยน Key เพื่อบังคับ Flash ใหม่ตอนเปลี่ยนรูป
                                src={currentAvatar}
                                className="w-full h-full object-cover transform translate-y-2 scale-110"
                                alt="Avatar"
                            />

                            {/* Sparkles */}
                            {isSuccess && (
                                <>
                                    <Sparkles className="absolute top-3 right-3 text-yellow-400 w-6 h-6 animate-bounce drop-shadow-sm" />
                                    <Sparkles className="absolute bottom-5 left-3 text-yellow-300 w-4 h-4 animate-ping" />
                                </>
                            )}
                        </div>

                        {/* ปุ่มใต้รูป */}
                        <div className={`
                        absolute -bottom-3 left-1/2 transform -translate-x-1/2 
                        px-4 py-1.5 rounded-full border shadow-md transition-colors duration-300 
                        flex items-center gap-2 whitespace-nowrap z-10
                        ${isSuccess
                            ? 'bg-yellow-400 text-white border-yellow-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }
                    `}>
                            {isRandomizing ? (
                                <span className="text-[10px] font-bold">กำลังหมุน...</span>
                            ) : (isSuccess ? (
                                <span className="text-[10px] font-bold">วิ้งค์! ✨</span>
                            ) : (
                                <>
                                    <span className="text-lg leading-none">🎲</span>
                                    <span className="text-[10px] font-bold">สุ่มใหม่</span>
                                </>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Name Input */}
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider text-center">
                        ชื่อเล่นของคุณ
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="เห้ย! ลืมชื่อตัวเองหรอ? 😜"
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-center font-bold text-xl text-gray-800 focus:outline-none focus:border-green-500 focus:bg-white transition-all placeholder-gray-300"
                    />
                </div>
            </form>
        </Modal>
    );
};
