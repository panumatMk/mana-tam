import { useState, useMemo, FormEvent } from 'react';
import { Check } from 'lucide-react'; // เพิ่มไอคอน Refresh ให้ดูดีขึ้น
import type { User } from '../../types/user.types';
import { APP_NAME, APP_FULL_TITLE } from '../../config/constants';
import {Button} from "../../components/ui/Button.tsx";

// ย้าย Constants ออกมานอก Component (Best Practice)
const MALE_SEEDS = ['Christopher', 'Oliver', 'Sebastian', 'Joshua', 'Daniel'];
const FEMALE_SEEDS = ['Elizabeth', 'Amelia', 'Jessica', 'Sophie', 'Hannah'];
const DISPLAY_SEEDS = [...MALE_SEEDS, ...FEMALE_SEEDS];

const getAvatarUrl = (seed: string) =>
    `https://api.dicebear.com/9.x/micah/svg?seed=${seed}&mouth=smile,laughing&baseColor=f9c9b6,ac6651`;

interface RegistrationScreenProps {
    onComplete: (user: User) => void;
}

// 1. ไม่ใช้ React.FC แล้ว เขียนเป็น Function ธรรมดา
export function RegistrationScreen({ onComplete }: RegistrationScreenProps) {
    const [name, setName] = useState('');
    const [hasError, setHasError] = useState(false);

    // Lazy initialization สำหรับ state เริ่มต้น (ทำถูกแล้วครับ)
    const [selectedSeed, setSelectedSeed] = useState<string>(() => {
        const randomIndex = Math.floor(Math.random() * DISPLAY_SEEDS.length);
        return DISPLAY_SEEDS[randomIndex];
    });

    // 4. useMemo เพื่อกันการคำนวณ string ซ้ำตอนพิมพ์ชื่อ (Optional แต่ดีต่อใจ)
    const currentAvatarUrl = useMemo(() => getAvatarUrl(selectedSeed), [selectedSeed]);

    const handleRandom = () => {
        // สุ่มตัวใหม่ที่ไม่ซ้ำตัวเดิม (UX Improvement)
        let newSeed;
        do {
            const randomIndex = Math.floor(Math.random() * DISPLAY_SEEDS.length);
            newSeed = DISPLAY_SEEDS[randomIndex];
        } while (newSeed === selectedSeed);

        setSelectedSeed(newSeed);
    };

    const handleSubmit = (e?: FormEvent) => {
        // 2. ป้องกันการ Reload หน้าเมื่อกด Enter ใน Form
        if (e) e.preventDefault();

        if (!name.trim()) {
            setHasError(true);
            if (navigator.vibrate) navigator.vibrate(200);
            return;
        }

        onComplete({
            id: Date.now().toString(),
            name: name.trim(), // trim ช่องว่างหน้าหลังออก
            avatar: currentAvatarUrl
        });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-4 animate-fade-in overflow-y-auto">

            {/* 2. ใช้ <form> ครอบ input และ button เพื่อรองรับปุ่ม Enter */}
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-xs flex flex-col items-center space-y-6"
            >
                {/* Hero Section */}
                <div className="relative group cursor-pointer" onClick={handleRandom}>
                    <div className="w-32 h-32 rounded-full border-4 border-green-400 bg-yellow-50 shadow-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                        <img
                            src={currentAvatarUrl}
                            alt="Selected Avatar"
                            className="w-full h-full object-cover transform scale-110 translate-y-2"
                        />
                    </div>
                    {/* Badge */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-700 px-3 py-0.5 rounded-full text-[10px] font-bold border border-green-200 whitespace-nowrap shadow-sm flex items-center gap-1">
                        ตัวละครของคุณ
                    </div>
                </div>

                {/* Title */}
                <div className="text-center">
                    <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                        {APP_FULL_TITLE} <span className="text-green-500">App</span>
                    </h1>
                    <p className="text-gray-400 text-xs mt-1">ให้ <span className="font-bold text-gray-600">"{APP_NAME}"</span> ช่วยดูแลทริปของคุณ 🎒</p>
                </div>

                {/* Name Input */}
                <div className="w-full">
                    <label htmlFor="nickname" className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider text-center">
                        ชื่อเล่นของคุณ
                    </label>
                    <div className="relative">
                        <input
                            id="nickname"
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
                                : 'border-gray-100 focus:border-green-500 focus:bg-white placeholder-gray-400'
                            }`}
                            autoFocus
                            autoComplete="off" // ปิด popup แนะนำชื่อเก่าๆ บังหน้าจอ
                        />
                    </div>
                </div>

                {/* Avatar Grid */}
                <div className="w-full">
                    <div className="flex justify-between items-end mb-2 px-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">เลือกตัวละคร</label>
                        <button
                            type="button" // ต้องระบุ type="button" ไม่ให้มัน trigger submit form
                            onClick={handleRandom}
                            className="text-[10px] text-green-600 font-bold hover:underline flex items-center gap-1 transition-colors hover:text-green-700"
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
                                    type="button" // สำคัญ! ถ้าไม่ใส่ กดรูปแล้วฟอร์มจะ Submit
                                    onClick={() => setSelectedSeed(seed)}
                                    className={`relative aspect-square rounded-xl overflow-hidden bg-gray-50 transition-all duration-200 
                                        ${isSelected
                                        ? 'ring-2 ring-green-500 ring-offset-1 scale-105 shadow-md z-10 bg-green-50'
                                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                                    }`}
                                >
                                    <img
                                        src={getAvatarUrl(seed)}
                                        alt={seed}
                                        className="w-full h-full object-cover transform scale-125 translate-y-1"
                                        loading="lazy" // ช่วยเรื่อง Performance นิดนึง
                                    />
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
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                >
                    ไปลุยกันเลย 🚀
                </Button>
            </form>
        </div>
    );
}
