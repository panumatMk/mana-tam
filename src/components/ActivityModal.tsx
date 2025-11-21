import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, Trash2, AlertCircle, Save, PlusCircle } from 'lucide-react';
import type {Activity} from "../types.ts";

interface ActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Activity, 'id' | 'day'>, shouldClose: boolean) => void;
    initialData?: Activity | null;
}

const ActivityModal: React.FC<ActivityModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formTime, setFormTime] = useState('09:00');
    const [formTitle, setFormTitle] = useState('');
    const [formNote, setFormNote] = useState('');
    const [formImage, setFormImage] = useState<string | null>(null);
    const [titleError, setTitleError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset or Load Data when Modal Opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormTime(initialData.time);
                setFormTitle(initialData.title);
                setFormNote(initialData.note || '');
                setFormImage(initialData.image || null);
            } else {
                resetForm();
            }
            setTitleError('');
        }
    }, [isOpen, initialData]);

    const resetForm = () => {
        setFormTime('09:00');
        setFormTitle('');
        setFormNote('');
        setFormImage(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (shouldClose: boolean) => {
        if (!formTitle.trim()) {
            setTitleError('กรุณาระบุชื่อกิจกรรม');
            return;
        }

        onSave({
            time: formTime,
            title: formTitle,
            note: formNote,
            image: formImage || undefined,
        }, shouldClose);

        if (!shouldClose) resetForm(); // Clear form for next entry
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl relative my-auto">
                <button onClick={onClose} className="absolute top-4 right-4 bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200">
                    <X className="w-4 h-4"/>
                </button>

                <h3 className="text-lg font-bold text-gray-800 mb-4 pr-8">
                    {initialData ? 'แก้ไขกิจกรรม ✏️' : 'เพิ่มกิจกรรมใหม่ ✨'}
                </h3>

                <div className="space-y-3">
                    {/* Time & Title */}
                    <div className="flex gap-3">
                        <div className="w-1/3">
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">เวลา</label>
                            <input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm font-bold text-center focus:border-green-500 outline-none" />
                        </div>
                        <div className="w-2/3">
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">ชื่อกิจกรรม <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formTitle}
                                onChange={(e) => {setFormTitle(e.target.value); setTitleError('');}}
                                placeholder="เช่น กินข้าวเย็น"
                                className={`w-full bg-gray-50 border rounded-xl p-2.5 text-sm font-bold focus:outline-none ${titleError ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-green-500'}`}
                            />
                        </div>
                    </div>
                    {titleError && <div className="text-red-500 text-[10px] flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{titleError}</div>}

                    {/* Note */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">รายละเอียด</label>
                        <textarea rows={2} value={formNote} onChange={(e) => setFormNote(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:border-green-500 outline-none resize-none" />
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">รูปภาพ</label>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                        <div className="flex gap-3 items-start">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 w-20 h-20">
                                <ImageIcon className="w-6 h-6 mb-1"/><span className="text-[9px]">เลือกรูป</span>
                            </button>
                            {formImage && (
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                                    <img src={formImage} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setFormImage(null)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white"><Trash2 className="w-5 h-5"/></button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        {!initialData && (
                            <button onClick={() => handleSubmit(false)} className="flex-1 bg-blue-50 text-blue-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 transition-all">
                                <PlusCircle className="w-4 h-4"/> บันทึก & เพิ่มต่อ
                            </button>
                        )}
                        <button onClick={() => handleSubmit(true)} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 flex items-center justify-center gap-2 transition-all">
                            <Save className="w-4 h-4"/> {initialData ? 'บันทึก' : 'เสร็จสิ้น'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityModal;
