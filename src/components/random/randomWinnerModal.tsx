import React, { useState, useEffect } from 'react';
import { X, Trophy, Sparkles } from 'lucide-react';

interface User {
    id: string;
    name: string;
    avatar: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
}

const RandomWinnerModal: React.FC<Props> = ({ isOpen, onClose, users }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [displayUser, setDisplayUser] = useState<User>(users[0]);
    const [winner, setWinner] = useState<User | null>(null);

    // Reset เมื่อเปิดใหม่
    useEffect(() => {
        if (isOpen) {
            setWinner(null);
            setIsSpinning(false);
            setDisplayUser(users[0]);
        }
    }, [isOpen, users]);

    const startSpin = () => {
        setIsSpinning(true);
        setWinner(null);
        let counter = 0;
        const maxSpins = 20; // จำนวนรอบที่จะวิ่ง
        const speed = 100; // ความเร็ว

        const interval = setInterval(() => {
            // สุ่มแสดงหน้าคนไปเรื่อยๆ
            const randomIndex = Math.floor(Math.random() * users.length);
            setDisplayUser(users[randomIndex]);
            counter++;

            if (counter > maxSpins) {
                clearInterval(interval);
                // จบการสุ่ม ได้ผู้ชนะ
                const finalWinnerIndex = Math.floor(Math.random() * users.length);
                const finalWinner = users[finalWinnerIndex];
                setDisplayUser(finalWinner);
                setWinner(finalWinner);
                setIsSpinning(false);
            }
        }, speed);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-fade-in">
            <div className="bg-white w-full max-w-xs rounded-3xl p-6 text-center relative overflow-hidden shadow-2xl border-4 border-purple-100">

                <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500">
                    <X className="w-5 h-5"/>
                </button>

                <div className="mb-6">
                    <h3 className="text-xl font-bold text-purple-600 flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        WHO IS LUCKY?
                        <Sparkles className="w-5 h-5" />
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">สุ่มหาผู้โชคดี (หรือผู้โชคร้าย 😈)</p>
                </div>

                {/* Avatar Display Area */}
                <div className="relative w-32 h-32 mx-auto mb-6">
                    {/* วงแหวนตกแต่ง */}
                    <div className={`absolute inset-0 rounded-full border-4 ${isSpinning ? 'border-purple-300 border-dashed animate-spin-slow' : 'border-purple-500'} transition-all`}></div>

                    <div className="w-full h-full rounded-full overflow-hidden p-1 bg-white">
                        <img
                            src={displayUser.avatar}
                            alt="User"
                            className={`w-full h-full object-cover rounded-full transition-transform ${winner ? 'scale-110' : ''}`}
                        />
                    </div>

                    {/* Icon Winner */}
                    {winner && (
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-2 rounded-full shadow-lg animate-bounce">
                            <Trophy className="w-5 h-5" />
                        </div>
                    )}
                </div>

                {/* Name Display */}
                <div className="min-h-[3rem] mb-6">
                    <h2 className={`text-2xl font-bold transition-all ${winner ? 'text-purple-600 scale-110' : 'text-gray-700'}`}>
                        {displayUser.name}
                    </h2>
                    {winner && <span className="text-xs font-bold text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">✨ The Winner! ✨</span>}
                </div>

                {/* Button */}
                {!winner ? (
                    <button
                        onClick={startSpin}
                        disabled={isSpinning}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-70"
                    >
                        {isSpinning ? 'กำลังสุ่ม...' : 'หมุนเลย! 🎲'}
                    </button>
                ) : (
                    <button
                        onClick={startSpin}
                        className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all"
                    >
                        สุ่มใหม่ 🔄
                    </button>
                )}

            </div>
        </div>
    );
};

export default RandomWinnerModal;
