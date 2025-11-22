import React, {useEffect, useState} from 'react';
import { Save } from 'lucide-react';
import { Modal } from '../../components/common/Modal'; // ใช้ Modal กลาง

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export const ActivityModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
    const [time, setTime] = useState('08:00');
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [link, setLink] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTime('08:00'); // Reset เป็น 8 โมง
            // ...
        }
    }, [isOpen]);

    // Footer Content
    const footerContent = (
        <button
            onClick={() => { if(title) onSave({time, title, note, link}); }}
            className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
            <Save className="w-5 h-5" /> บันทึกกิจกรรม
        </button>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="เพิ่มกิจกรรมใหม่"
            footer={footerContent}
        >
            <div className="space-y-5">
                <div className="flex gap-3">
                    <div className="w-1/3">
                        <label className="block text-xs font-bold text-gray-400 mb-1">เวลา</label>
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl font-bold text-center outline-none focus:ring-2 ring-green-500/20" />
                    </div>
                    <div className="w-2/3">
                        <label className="block text-xs font-bold text-gray-400 mb-1">กิจกรรม <span className="text-red-500">*</span></label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl font-bold outline-none focus:ring-2 ring-green-500/20" placeholder="ทำอะไรดี?" autoFocus />
                    </div>
                </div>
                {/* ... inputs อื่นๆ */}
            </div>
        </Modal>
    );
};
