import React, { useState } from 'react';
import { Check } from 'lucide-react';
import type { User } from '../../types/user.types';
import { APP_NAME, APP_FULL_TITLE } from '../../config/constants';

// รายชื่อ Seed สำหรับสร้างรูป
const MALE_SEEDS = ['Christopher', 'Oliver', 'Sebastian', 'Joshua', 'Daniel'];
const FEMALE_SEEDS = ['Elizabeth', 'Amelia', 'Jessica', 'Sophie', 'Hannah'];
const DISPLAY_SEEDS = [...MALE_SEEDS, ...FEMALE_SEEDS];

const getAvatarUrl = (seed: string) => `https://api.dicebear.com/9.x/micah/svg?seed=${seed}&mouth=smile,laughing&baseColor=f9c9b6,ac6651`;

interface Props {
    onComplete: (user: User) => void;
}

export const RegistrationScreen: React.FC<Props> = ({ onComplete }) => {
    const [name, setName] = useState('');
    const [selectedSeed, setSelectedSeed] = useState<string>(() => {
        const randomIndex = Math.floor(Math.random() * DISPLAY_SEEDS.length);
        return DISPLAY_SEEDS[randomIndex];
    });

    const [hasError, setHasError] = useState(false);

    const handleRandom = () => {
        const randomIndex = Math.floor(Math.random() * DISPLAY_SEEDS.length);
        setSelectedSeed(DISPLAY_SEEDS[randomIndex]);
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            setHasError(true);
            if (navigator.vibrate) navigator.vibrate(200);
            return;
        }

        onComplete({
            id: Date.now().toString(),
            name,
            avatar: getAvatarUrl(selectedSeed)
        });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-4 animate-fade-in overflow-y-auto">

            <div className="w-full max-w-xs flex flex-col items-center space-y-6">

                {/* Hero Section */}
                <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-green-400 bg-yellow-50 shadow-xl overflow-hidden flex items-center justify-center">
                        <img
                            src={getAvatarUrl(selectedSeed)}
                            alt="Selected Avatar"
                            className="w-full h-full object-cover transform scale-110 translate-y-2"
                        />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-700 px-3 py-0.5 rounded-full text-[10px] font-bold border border-green-200 whitespace-nowrap shadow-sm">
                        ตัวละครของคุณ
                    </div>
                </div>

                {/* App Title */}
                <div className="text-center">
                    <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                        {APP_FULL_TITLE} <span className="text-green-500">App</span>
                    </h1>
                    <p className="text-gray-400 text-xs mt-1">ให้ <span className="font-bold text-gray-600">"{APP_NAME}"</span> ช่วยดูแลทริปของคุณ 🎒</p>
                </div>

                {/* Name Input (Sassy Placeholder Style) */}
                <div className="w-full">
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider text-center">
                        ชื่อเล่นของคุณ
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (hasError) setHasError(false);
                            }}
                            placeholder={hasError ? "เห้ย! ลืมชื่อตัวเองหรอ? 😜" : "เช่น น้องมายด์, พี่บอย"}
                            className={`w-full bg-gray-50 border-2 rounded-2xl p-3 text-center font-bold text-lg text-gray-700 focus:outline-none transition-all 
                    ${hasError
                                ? 'border-orange-400 bg-orange-50 focus:border-orange-500 animate-shake placeholder-orange-400'
                                : 'border-gray-100 focus:border-green-500 focus:bg-white placeholder-gray-400' // เปลี่ยน placeholder สีเทา
                            }`}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Avatar Grid Selection */}
                <div className="w-full">
                    <div className="flex justify-between items-end mb-2 px-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">เลือกตัวละคร</label>
                        <button
                            onClick={handleRandom}
                            className="text-[10px] text-green-600 font-bold hover:underline flex items-center gap-1"
                        >
                            สุ่มใหม่ 🎲
                        </button>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                        {DISPLAY_SEEDS.map((seed) => {
                            const isSelected = selectedSeed === seed;
                            return (
                                <button
                                    key={seed}
                                    onClick={() => { setSelectedSeed(seed); }}
                                    className={`relative aspect-square rounded-xl overflow-hidden bg-gray-50 transition-all duration-200 
                    ${isSelected
                                        ? 'ring-2 ring-green-500 ring-offset-1 scale-105 shadow-md z-10 bg-green-50'
                                        : 'opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    <img src={getAvatarUrl(seed)} alt={seed} className="w-full h-full object-cover transform scale-125 translate-y-1" />
                                    {isSelected && (
                                        <div className="absolute top-0 right-0 bg-green-500 p-0.5 rounded-bl shadow-sm">
                                            <Check className="w-2 h-2 text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Submit Button */}
                <button onClick={handleSubmit} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all text-lg">
                    ไปลุยกันเลย 🚀
                </button>

            </div>
        </div>
    );
};
