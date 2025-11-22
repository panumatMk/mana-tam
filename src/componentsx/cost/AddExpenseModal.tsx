import React, {useEffect, useState} from 'react';
import { X, Save } from 'lucide-react';
import type {CategoryType, ExpenseItem} from './types';
import {  CATEGORIES } from './types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { title: string; amount: number; category: CategoryType }, isEdit: boolean) => void;
    initialData?: ExpenseItem | null;
}

const AddExpenseModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
    const [title, setTitle] = useState('');
    const [amountStr, setAmountStr] = useState('');
    const [category, setCategory] = useState<CategoryType>('food');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setAmountStr(initialData.amount.toLocaleString());
                // กันเหนียว: ถ้าค่าเก่าผิด ให้ใช้ food เป็น default
                setCategory(CATEGORIES[initialData.category] ? initialData.category : 'food');
            } else {
                setTitle('');
                setAmountStr('');
                setCategory('food');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');
        if (!isNaN(Number(rawValue))) {
            setAmountStr(Number(rawValue).toLocaleString());
        } else if (rawValue === '') {
            setAmountStr('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalAmount = Number(amountStr.replace(/,/g, ''));

        if (!title.trim() || finalAmount <= 0) return;

        onSave({ title, amount: finalAmount, category }, !!initialData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl mb-safe">

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{initialData ? 'แก้ไขรายจ่าย ✏️' : 'จดรายจ่าย 💸'}</h3>
                    <button onClick={onClose} className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200"><X className="w-4 h-4"/></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Amount */}
                    <div className="relative">
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">จำนวนเงิน<span
                            className="text-red-500">*</span></label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={amountStr}
                            onChange={handleAmountChange}
                            placeholder="0"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-3xl font-bold text-gray-800 text-center focus:border-blue-500 outline-none"
                            autoFocus
                        />
                    </div>

                    {/* Title (เพิ่มดอกจันสีแดงตรงนี้) */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">
                            รายการ <span className="text-red-500">*</span>
                        </label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น ค่าข้าว, ค่ารถ" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold focus:border-blue-500 outline-none" />
                    </div>

                    {/* Category Grid */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">หมวดหมู่</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(Object.keys(CATEGORIES) as CategoryType[]).map((catKey) => {
                                const cat = CATEGORIES[catKey];
                                const isSelected = category === catKey;
                                return (
                                    <button
                                        key={catKey}
                                        type="button"
                                        onClick={() => setCategory(catKey)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${isSelected ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${isSelected ? 'text-white' : 'text-gray-500 bg-gray-100'}`} style={{ backgroundColor: isSelected ? cat.color : undefined }}>
                                            <cat.icon className="w-4 h-4" />
                                        </div>
                                        <span className={`text-[10px] font-bold ${isSelected ? 'text-gray-800' : 'text-gray-400'}`}>{cat.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!amountStr || Number(amountStr.replace(/,/g, '')) <= 0 || !title.trim()}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        <Save className="w-4 h-4" /> บันทึก
                    </button>

                </form>
            </div>
        </div>
    );
};

export default AddExpenseModal;
