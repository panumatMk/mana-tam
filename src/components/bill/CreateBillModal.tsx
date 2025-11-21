import React, { useState } from 'react';
import { X, DollarSign, Users, QrCode, CreditCard, Save, Copy } from 'lucide-react';
import type { User, PaymentMethodType } from './types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    currentUser: User;
    onSave: (data: any) => void;
}

const CreateBillModal: React.FC<Props> = ({ isOpen, onClose, users, currentUser, onSave }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');

    // Payment Method
    const [payType, setPayType] = useState<PaymentMethodType>('QR');
    const [payValue, setPayValue] = useState(''); // Text or Image URL

    // Select Debtors (Default: Select All except me)
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
        users.filter(u => u.id !== currentUser.id).map(u => u.id)
    );

    if (!isOpen) return null;

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
            totalAmount: Number(amount),
            paymentType: payType,
            paymentValue: payValue || 'https://via.placeholder.com/150?text=QR+Code', // Mock QR
            debtors: selectedUserIds
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">สร้างบิลเรียกเก็บ 🧾</h3>
                    <button onClick={onClose} className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200"><X className="w-4 h-4"/></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Title & Amount */}
                    <div className="space-y-2">
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ค่าอะไร? (เช่น ค่าที่พัก)" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none focus:border-blue-500" autoFocus />
                        <div className="relative">
                            <DollarSign className="absolute top-3 left-3 text-gray-400 w-4 h-4" />
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 p-3 font-bold text-blue-600 outline-none focus:border-blue-500" />
                        </div>
                    </div>

                    {/* Payment Method Switcher */}
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <label className="text-[10px] font-bold text-blue-500 uppercase mb-2 block">รับเงินทางไหน?</label>
                        <div className="flex gap-2 mb-3">
                            <button type="button" onClick={() => setPayType('QR')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${payType === 'QR' ? 'bg-blue-500 text-white shadow' : 'bg-white text-gray-500 border'}`}>
                                <QrCode className="w-3 h-3"/> QR รูปภาพ
                            </button>
                            <button type="button" onClick={() => setPayType('BANK_ACCOUNT')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${payType === 'BANK_ACCOUNT' ? 'bg-blue-500 text-white shadow' : 'bg-white text-gray-500 border'}`}>
                                <CreditCard className="w-3 h-3"/> เลขบัญชี
                            </button>
                        </div>

                        {payType === 'QR' ? (
                            <div className="h-24 border-2 border-dashed border-blue-200 rounded-lg bg-white flex flex-col items-center justify-center text-blue-300 cursor-pointer hover:bg-blue-50">
                                <QrCode className="w-6 h-6 mb-1"/>
                                <span className="text-[10px]">แตะเพื่ออัปโหลด QR Code</span>
                            </div>
                        ) : (
                            <input type="text" value={payValue} onChange={(e) => setPayValue(e.target.value)} placeholder="เลขบัญชี / เบอร์พร้อมเพย์" className="w-full p-2 rounded-lg border text-sm outline-none" />
                        )}
                    </div>

                    {/* Select Debtors */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">เก็บเงินใครบ้าง? ({selectedUserIds.length})</label>
                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {users.map(u => {
                                if (u.id === currentUser.id) return null; // ไม่เก็บตัวเอง
                                const isSelected = selectedUserIds.includes(u.id);
                                return (
                                    <div key={u.id} onClick={() => toggleUser(u.id)} className="cursor-pointer flex flex-col items-center space-y-1 min-w-[50px]">
                                        <div className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all ${isSelected ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200 opacity-50 grayscale'}`}>
                                            <img src={u.avatar} className="w-full h-full" />
                                        </div>
                                        <span className={`text-[9px] font-bold ${isSelected ? 'text-green-600' : 'text-gray-400'}`}>{u.name}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <button type="submit" disabled={!amount || selectedUserIds.length === 0} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 mt-2">
                        สร้างบิล
                    </button>

                </form>
            </div>
        </div>
    );
};

export default CreateBillModal;
