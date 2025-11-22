import React, { useState } from 'react';
import { DollarSign, QrCode, CreditCard, Check, Save } from 'lucide-react';
// Double check this path. It goes up from 'bill' -> 'features' -> 'src', then down to 'components/common/Modal'
import { Modal } from '../../components/common/Modal';

// Import Types & Enums
import type { User } from '../../types/user.types';
import { PaymentMethod } from '../../enums/bill.enums';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

// Mock Users for selection (ในของจริงควรรับ props เข้ามา)
const MOCK_USERS_SELECT: User[] = [
    { id: 'u2', name: 'Jane', avatar: '' },
    { id: 'u3', name: 'Max', avatar: '' },
    { id: 'u4', name: 'Nana', avatar: '' },
];

export const CreateBillModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [payType, setPayType] = useState<PaymentMethod>(PaymentMethod.QR);
    const [payValue, setPayValue] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    const toggleUser = (id: string) => {
        if (selectedUserIds.includes(id)) {
            setSelectedUserIds(prev => prev.filter(uid => uid !== id));
        } else {
            setSelectedUserIds(prev => [...prev, id]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount || selectedUserIds.length === 0) return;

        onSave({
            title,
            amount: Number(amount), // ส่งเป็น amount ไปคำนวณต่อข้างนอก
            paymentType: payType,
            paymentValue: payValue || 'QR_MOCK',
            debtors: selectedUserIds // ส่ง ID คนหารไป
        });
    };

    // Footer Button
    const footerContent = (
        <button
            type="submit"
            form="create-bill-form"
            disabled={!amount || selectedUserIds.length === 0}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
            <Save className="w-5 h-5"/> สร้างบิล
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="สร้างบิลเรียกเก็บ 🧾" footer={footerContent}>
            <form id="create-bill-form" onSubmit={handleSubmit} className="space-y-4">

                {/* Title & Amount */}
                <div className="space-y-2">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="ค่าอะไร? (เช่น ค่าที่พัก)"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none focus:border-blue-500"
                        autoFocus
                    />
                    <div className="relative">
                        <DollarSign className="absolute top-3 left-3 text-gray-400 w-4 h-4" />
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 p-3 font-bold text-blue-600 outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <div className="flex gap-2 mb-2">
                        <button type="button" onClick={() => setPayType(PaymentMethod.QR)} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${payType === PaymentMethod.QR ? 'bg-blue-500 text-white shadow' : 'bg-white text-gray-500 border'}`}>
                            <QrCode className="w-3 h-3"/> QR รูป
                        </button>
                        <button type="button" onClick={() => setPayType(PaymentMethod.BANK_ACCOUNT)} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${payType === PaymentMethod.BANK_ACCOUNT ? 'bg-blue-500 text-white shadow' : 'bg-white text-gray-500 border'}`}>
                            <CreditCard className="w-3 h-3"/> เลขบัญชี
                        </button>
                    </div>
                    {payType === PaymentMethod.QR ? (
                        <div className="h-24 border-2 border-dashed border-blue-200 rounded-lg bg-white flex flex-col items-center justify-center text-blue-300">
                            <QrCode className="w-6 h-6"/><span className="text-[10px]">อัปโหลด QR (Mock)</span>
                        </div>
                    ) : (
                        <input type="text" value={payValue} onChange={(e) => setPayValue(e.target.value)} placeholder="เลขบัญชี / เบอร์" className="w-full p-2 rounded-lg border text-sm outline-none" />
                    )}
                </div>

                {/* Debtors Selection */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">เก็บเงินใครบ้าง?</label>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {MOCK_USERS_SELECT.map(u => {
                            const isSelected = selectedUserIds.includes(u.id);
                            return (
                                <div
                                    key={u.id}
                                    onClick={() => toggleUser(u.id)}
                                    className="cursor-pointer flex flex-col items-center space-y-1 min-w-[50px]"
                                >
                                    <div className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all relative bg-gray-100 ${isSelected ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200 opacity-50 grayscale'}`}>
                                        {/* Mock Avatar */}
                                        {isSelected && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><Check className="w-4 h-4 text-white"/></div>}
                                    </div>
                                    <span className={`text-[9px] font-bold ${isSelected ? 'text-green-600' : 'text-gray-400'}`}>{u.name}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </form>
        </Modal>
    );
};
