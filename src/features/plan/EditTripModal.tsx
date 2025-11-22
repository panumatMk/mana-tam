import React from 'react';
import { Modal } from '../../components/common/Modal';
import { Save } from 'lucide-react';
import type { Trip } from '../../types/trip.types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (trip: Trip) => void;
    initialTrip: Trip;
}

export const EditTripModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialTrip }) => {

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        const newTrip: Trip = {
            title: formData.get('title') as string,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            participants: initialTrip.participants // คงสมาชิกเดิมไว้
        };

        if (newTrip.title && newTrip.startDate && newTrip.endDate) {
            onSave(newTrip);
        } else {
            alert("กรุณากรอกข้อมูลให้ครบ");
        }
    };

    // Footer Button
    const footerContent = (
        <button type="submit" form="edit-trip-form" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Save className="w-5 h-5" /> บันทึกข้อมูล
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ตั้งค่าทริป ✈️" footer={footerContent}>
            <form id="edit-trip-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">ชื่อทริป</label>
                    <input name="title" type="text" defaultValue={initialTrip.title} className="w-full bg-gray-50 p-3 rounded-xl font-bold outline-none focus:ring-2 ring-green-500/20" placeholder="เช่น Japan 2025" />
                </div>
                <div className="flex gap-3">
                    <div className="w-1/2">
                        <label className="block text-xs font-bold text-gray-400 mb-1">วันไป</label>
                        <input name="startDate" type="date" defaultValue={initialTrip.startDate !== 'TBD' ? initialTrip.startDate : ''} className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-green-500/20" />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-xs font-bold text-gray-400 mb-1">วันกลับ</label>
                        <input name="endDate" type="date" defaultValue={initialTrip.endDate !== 'TBD' ? initialTrip.endDate : ''} className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-green-500/20" />
                    </div>
                </div>
            </form>
        </Modal>
    );
};
