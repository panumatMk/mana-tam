import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface Trip {
    title: string;
    startDate: string;
    endDate: string;
}

interface EditTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (trip: Trip) => void;
    initialTrip: Trip;
}

const EditTripModal: React.FC<EditTripModalProps> = ({ isOpen, onClose, onSave, initialTrip }) => {
    const [formErrors, setFormErrors] = useState<{ title?: string; startDate?: string; endDate?: string }>({});

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const newTitle = formData.get('title') as string;
        const newStart = formData.get('startDate') as string;
        const newEnd = formData.get('endDate') as string;

        const errors: { title?: string; startDate?: string; endDate?: string } = {};
        let hasError = false;

        if (!newTitle.trim()) { errors.title = "กรุณาตั้งชื่อทริป"; hasError = true; }
        if (!newStart) { errors.startDate = "ระบุวันไป"; hasError = true; }
        if (!newEnd) { errors.endDate = "ระบุวันกลับ"; hasError = true; }
        if (newStart && newEnd && new Date(newStart) > new Date(newEnd)) {
            errors.endDate = "วันกลับต้องอยู่หลังวันไป";
            hasError = true;
        }

        if (hasError) {
            setFormErrors(errors);
            return;
        }

        onSave({ title: newTitle, startDate: newStart, endDate: newEnd });
        setFormErrors({});
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200">
                    <X className="w-4 h-4" />
                </button>

                <div className="mb-6 text-center">
                    <h2 className="text-xl font-bold text-gray-800">ตั้งค่าทริป ✈️</h2>
                    <p className="text-xs text-gray-400 mt-1">ระบุรายละเอียดการเดินทางของคุณ</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">ชื่อทริป <span className="text-red-500">*</span></label>
                        <input
                            name="title"
                            type="text"
                            defaultValue={initialTrip.title === "My Trip ✈️" ? "" : initialTrip.title}
                            placeholder="เช่น Japan 2025"
                            className={`w-full bg-gray-50 border rounded-xl p-3 font-bold focus:outline-none focus:border-green-500 ${formErrors.title ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            onChange={() => setFormErrors({ ...formErrors, title: undefined })}
                        />
                        {formErrors.title && (
                            <div className="flex items-center gap-1 mt-1 text-red-500"><AlertCircle className="w-3 h-3" /><span className="text-[10px] font-bold">{formErrors.title}</span></div>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="flex gap-3 items-start">
                        <div className="w-1/2">
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">วันไป <span className="text-red-500">*</span></label>
                            <input
                                name="startDate"
                                type="date"
                                defaultValue={initialTrip.startDate !== 'TBD' ? initialTrip.startDate : ''}
                                className={`w-full bg-gray-50 border rounded-xl p-3 text-sm focus:outline-none focus:border-green-500 ${formErrors.startDate ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                onChange={() => setFormErrors({ ...formErrors, startDate: undefined })}
                            />
                            {formErrors.startDate && <span className="text-[10px] text-red-500 font-bold mt-1 block">{formErrors.startDate}</span>}
                        </div>
                        <div className="w-1/2">
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">วันกลับ <span className="text-red-500">*</span></label>
                            <input
                                name="endDate"
                                type="date"
                                defaultValue={initialTrip.endDate !== 'TBD' ? initialTrip.endDate : ''}
                                className={`w-full bg-gray-50 border rounded-xl p-3 text-sm focus:outline-none focus:border-green-500 ${formErrors.endDate ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                onChange={() => setFormErrors({ ...formErrors, endDate: undefined })}
                            />
                            {formErrors.endDate && <span className="text-[10px] text-red-500 font-bold mt-1 block">{formErrors.endDate}</span>}
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-200 mt-4 hover:bg-green-700 active:scale-95 transition-all">
                        บันทึกข้อมูล
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditTripModal;
