import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import type { Trip } from '../../types/trip.types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (trip: Trip) => void;
    initialTrip: Trip;
}

export const EditTripModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialTrip }) => {
    const [title, setTitle] = useState(initialTrip?.title);
    const [startDate, setStartDate] = useState(initialTrip?.startDate);
    const [endDate, setEndDate] = useState(initialTrip?.endDate);

    const [formErrors, setFormErrors] = useState<{ title?: string; startDate?: string; endDate?: string }>({});

    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const errors: { title?: string; startDate?: string; endDate?: string } = {};
        let hasError = false;
        const today = getTodayDate();

        if (!title.trim()) { errors.title = "กรุณาตั้งชื่อทริป"; hasError = true; }

        if (!startDate || startDate === 'TBD') {
            errors.startDate = "ระบุวันไป"; hasError = true;
        } else if (startDate < today) {
            errors.startDate = "วันเริ่มทริปต้องไม่ใช่อดีตนะ"; hasError = true;
        }

        if (!endDate || endDate === 'TBD') {
            errors.endDate = "ระบุวันกลับ"; hasError = true;
        } else if (startDate && endDate < startDate) {
            errors.endDate = "วันกลับต้องอยู่หลังวันไป"; hasError = true;
        }

        if (hasError) { setFormErrors(errors); return; }

        const newTrip: Trip = {
            title: title.trim(),
            startDate: startDate,
            endDate: endDate,
            participants: initialTrip?.participants || []
        };

        onSave(newTrip);
        setFormErrors({});
    };

    const footerContent = (
        <button type="submit" form="edit-trip-form" className="w-full bg-green-600 text-white font-bold py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all text-base hover:bg-green-700">
            <span className="text-lg">💾</span> บันทึกทริป
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ตั้งค่าทริป ✈️" footer={footerContent}>
            <form id="edit-trip-form" onSubmit={handleSubmit} className="space-y-6 py-2">

                <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">ชื่อทริป <span className="text-red-500">*</span></label>
                    <input
                        name="title"
                        type="text"
                        value={title}
                        onChange={(e) => {setTitle(e.target.value); setFormErrors({...formErrors, title: undefined});}}
                        className={`w-full bg-white border-2 rounded-2xl p-4 font-bold text-lg text-gray-800 focus:outline-none focus:ring-4 ring-green-500/10 transition-all ${formErrors.title ? 'border-red-400 bg-red-50' : 'border-gray-100 focus:border-green-500'}`}
                        placeholder="เช่น Japan 2025"
                        autoFocus
                    />
                    {formErrors.title && <div className="flex items-center gap-1 mt-2 text-red-500 text-[10px] font-bold animate-pulse"><AlertCircle className="w-3 h-3" />{formErrors.title}</div>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">วันไป <span className="text-red-500">*</span></label>
                        <input
                            name="startDate" type="date"
                            value={startDate === 'TBD' ? '' : startDate}
                            min={getTodayDate()}
                            onChange={(e) => {setStartDate(e.target.value); setFormErrors({...formErrors, startDate: undefined});}}
                            className={`w-full bg-gray-50 border-2 rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 ring-green-500/20 ${formErrors.startDate ? 'border-red-400 bg-red-50' : 'border-gray-100 focus:border-green-500'}`}
                        />
                        {formErrors.startDate && <div className="text-red-500 text-[10px] font-bold mt-1 leading-tight">{formErrors.startDate}</div>}
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">วันกลับ <span className="text-red-500">*</span></label>
                        <input
                            name="endDate" type="date"
                            value={endDate === 'TBD' ? '' : endDate}
                            min={startDate !== 'TBD' ? startDate : getTodayDate()}
                            onChange={(e) => {setEndDate(e.target.value); setFormErrors({...formErrors, endDate: undefined});}}
                            className={`w-full bg-gray-50 border-2 rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 ring-green-500/20 ${formErrors.endDate ? 'border-red-400 bg-red-50' : 'border-gray-100 focus:border-green-500'}`}
                        />
                        {formErrors.endDate && <div className="text-red-500 text-[10px] font-bold mt-1 leading-tight">{formErrors.endDate}</div>}
                    </div>
                </div>
            </form>
        </Modal>
    );
};
