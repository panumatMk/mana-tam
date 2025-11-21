import React, { useState, useRef } from 'react';
import { X, Type, DollarSign, FileText, Link as LinkIcon, Image as ImageIcon, Save, Trash2 } from 'lucide-react';
import type { TaskItem, User } from './types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<TaskItem, 'id' | 'status' | 'cfUsers' | 'createdAt'>) => void;
    currentUser: User;
}

const CreateTaskModal: React.FC<Props> = ({ isOpen, onClose, onSave, currentUser }) => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [note, setNote] = useState('');
    const [link, setLink] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSave({
            title,
            price: price ? Number(price) : 0,
            note,
            link,
            image: image || undefined,
            createdBy: currentUser
        });

        // Reset
        setTitle('');
        setPrice('');
        setNote('');
        setLink('');
        setImage(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">เพิ่มงาน / ค่าใช้จ่าย ✨</h3>
                    <button onClick={onClose} className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200"><X className="w-4 h-4"/></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">

                    {/* Title */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">ชื่องาน <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Type className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น จองที่พัก, ซื้อตั๋ว" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 p-2.5 text-sm font-bold focus:border-green-500 outline-none" autoFocus />
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">ราคา (ถ้ามี)</label>
                        <div className="relative">
                            <DollarSign className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 p-2.5 text-sm font-bold focus:border-green-500 outline-none" />
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">รายละเอียด</label>
                        <div className="relative">
                            <FileText className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
                            <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="รายละเอียดเพิ่มเติม..." className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 p-2.5 text-xs focus:border-green-500 outline-none resize-none" />
                        </div>
                    </div>

                    {/* Link */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">แนบลิงก์</label>
                        <div className="relative">
                            <LinkIcon className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
                            <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 p-2.5 text-xs text-blue-500 focus:border-green-500 outline-none" />
                        </div>
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">แนบรูป</label>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                        <div className="flex gap-3 items-start">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 w-20 h-20 flex-shrink-0">
                                <ImageIcon className="w-6 h-6 mb-1"/><span className="text-[9px]">เลือกรูป</span>
                            </button>
                            {image && (
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group flex-shrink-0">
                                    <img src={image} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setImage(null)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white"><Trash2 className="w-5 h-5"/></button>
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" disabled={!title.trim()} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                        <Save className="w-4 h-4" /> บันทึก
                    </button>

                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
