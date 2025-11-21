import React, { useState } from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

interface TripData {
    title: string;
    startDate: string;
    endDate: string;
}

interface CreateTripProps {
    onComplete: (trip: TripData) => void;
    userName: string;
}

const CreateTripScreen: React.FC<CreateTripProps> = ({ onComplete, userName }) => {
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        // Validation
        if (!title.trim()) {
            setError('ตั้งชื่อทริปหน่อยสิ (เช่น Japan 2025)');
            return;
        }
        if (!startDate || !endDate) {
            setError('ระบุวันเดินทางให้ครบนะ');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setError('วันกลับต้องมาทีหลังวันไปนะ!');
            return;
        }

        onComplete({ title, startDate, endDate });
    };

    return (
        <div className="fixed inset-0 z-40 bg-F3F4F6 flex flex-col items-center justify-center p-6 animate-fade-in">

            <div className="bg-white w-full max-w-sm p-8 rounded-3xl shadow-xl text-center">

                {/* Icon Header */}
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin className="text-blue-600 w-8 h-8" />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    หวัดดี, {userName}! 👋
                </h2>
                <p className="text-gray-500 text-sm mb-8">
                    ทริปต่อไปของคุณคือที่ไหน?<br/>มาเริ่มวางแผนกันเลย
                </p>

                {/* Form Inputs */}
                <div className="space-y-4 text-left">

                    {/* Trip Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">ชื่อทริป</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Japan 2025 🇯🇵"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>

                    {/* Dates */}
                    <div className="flex gap-3">
                        <div className="w-1/2">
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">วันไป</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="w-1/2">
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">วันกลับ</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 text-red-500 text-xs font-bold bg-red-50 p-2 rounded-lg animate-pulse">
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    className="w-full mt-8 bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <span>สร้างทริป</span>
                    <ArrowRight className="w-5 h-5" />
                </button>

            </div>
        </div>
    );
};

export default CreateTripScreen;
