import React, { useState } from 'react';
import { Plane, Check } from 'lucide-react'; // ใช้ไอคอนจาก lucide-react

// รายชื่อ Seed สำหรับสร้างรูปอวตาร (เปลี่ยนชื่อได้ตามใจชอบ)
const AVATAR_SEEDS = [
    'Felix', 'Aneka', 'Bob', 'Sky', 'Mini',
    'Bella', 'Jack', 'Luna', 'Leo', 'Nora'
];

interface RegistrationProps {
    onComplete: (user: { name: string; avatar: string }) => void;
}

const RegistrationScreen: React.FC<RegistrationProps> = ({ onComplete }) => {
    const [name, setName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!name.trim()) {
            setError('กรุณาใส่ชื่อเล่นก่อนนะ');
            return;
        }
        if (!selectedAvatar) {
            setError('อย่าลืมเลือกตัวละครด้วยล่ะ');
            return;
        }
        // ส่งข้อมูลกลับไปที่ App หลัก
        onComplete({ name, avatar: selectedAvatar });
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 animate-fade-in">

            {/* Header Section */}
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Plane className="text-green-600 w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Travel Companion</h1>
                <p className="text-gray-500 text-sm mt-1">ลงทะเบียนเข้าทริปกันเถอะ 🎒</p>
            </div>

            {/* Input Name */}
            <div className="w-full max-w-xs mb-6">
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    ชื่อเล่นของคุณ
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    placeholder="เช่น น้องมายด์, พี่บอย"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-center font-bold text-lg text-gray-700 focus:border-green-500 focus:outline-none focus:bg-white transition-all placeholder:font-normal"
                />
            </div>

            {/* Avatar Grid Selection */}
            <div className="w-full max-w-xs mb-8">
                <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider text-center">
                    เลือกตัวละครประจำตัว
                </label>

                <div className="grid grid-cols-5 gap-3">
                    {AVATAR_SEEDS.map((seed) => {
                        // ใช้ API ของ DiceBear สร้างรูป
                        const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
                        const isSelected = selectedAvatar === avatarUrl;

                        return (
                            <button
                                key={seed}
                                onClick={() => { setSelectedAvatar(avatarUrl); setError(''); }}
                                className={`
                  relative aspect-square rounded-full overflow-hidden bg-gray-100 
                  transition-all duration-200 hover:scale-105
                  ${isSelected ? 'ring-4 ring-green-500 scale-110 shadow-md' : 'border-2 border-transparent'}
                `}
                            >
                                <img src={avatarUrl} alt={seed} className="w-full h-full object-cover" />

                                {/* เครื่องหมายถูกเมื่อเลือก */}
                                {isSelected && (
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <div className="bg-green-500 rounded-full p-0.5 animate-fade-in">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 text-red-500 text-xs font-bold bg-red-50 px-4 py-2 rounded-lg animate-bounce">
                    ⚠️ {error}
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                className="w-full max-w-xs bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
            >
                <span>เข้าสู่ระบบ</span>
                🚀
            </button>

        </div>
    );
};

export default RegistrationScreen;
