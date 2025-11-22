import React, { useState, useEffect } from 'react';
import { X, DollarSign, QrCode, CreditCard, Check } from 'lucide-react';
import type {User} from "../../types/user.types.ts";
import type {BillItem, PaymentMethodType} from "../../types/bill.types.ts";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    currentUser: User;
    onSave: (data: any, isEdit: boolean) => void;
    initialData?: BillItem | null;
}

const CreateBillModal: React.FC<Props> = ({ isOpen, onClose, users, currentUser, onSave, initialData }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [payType, setPayType] = useState<PaymentMethodType>('QR');
    const [payValue, setPayValue] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    // Load Data when Edit
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setAmount(initialData.totalAmount.toString());
                setPayType(initialData.paymentType);
                setPayValue(initialData.paymentValue);
                // Load existing debtors
                setSelectedUserIds(initialData.debtors.map(d => d.userId));
            } else {
                // Default for New Bill
                setTitle('');
                setAmount('');
                setPayType('QR');
                setPayValue('');
                setSelectedUserIds(users.filter(u => u.id !== currentUser.id).map(u => u.id));
            }
        }
    }, [isOpen, initialData, users, currentUser]);

    if (!isOpen) return null;

    // ตรวจสอบสถานะของคนในบิลเก่า (ถ้ามี)
    const getExistingPayerStatus = (userId: string) => {
        if (!initialData) return null;
        return initialData.debtors.find(d => d.userId === userId)?.status;
    };

    const toggleUser = (id: string) => {
        // ถ้าคนนี้จ่ายแล้ว (VERIFIED) ห้ามเอาออก
        if (getExistingPayerStatus(id) === 'VERIFIED') return;

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
            paymentValue: payValue || 'QR_CODE_URL',
            debtors: selectedUserIds
        }, !!initialData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{initialData ? 'แก้ไขบิล ✏️' : 'สร้างบิลเรียกเก็บ 🧾'}</h3>
                    <button onClick={onClose} className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200"><X className="w-4 h-4"/></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="space-y-2">
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ค่าอะไร? (เช่น ค่าที่พัก)" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none focus:border-blue-500" />
                        <div className="relative">
                            <DollarSign className="absolute top-3 left-3 text-gray-400 w-4 h-4" />
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 p-3 font-bold text-blue-600 outline-none focus:border-blue-500" />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <div className="flex gap-2 mb-2">
                            <button type="button" onClick={() => setPayType('QR')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${payType === 'QR' ? 'bg-blue-500 text-white shadow' : 'bg-white text-gray-500 border'}`}><QrCode className="w-3 h-3"/> QR รูป</button>
                            <button type="button" onClick={() => setPayType('BANK_ACCOUNT')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${payType === 'BANK_ACCOUNT' ? 'bg-blue-500 text-white shadow' : 'bg-white text-gray-500 border'}`}><CreditCard className="w-3 h-3"/> เลขบัญชี</button>
                        </div>
                        {payType === 'QR' ? <div className="h-24 border-2 border-dashed border-blue-200 rounded-lg bg-white flex flex-col items-center justify-center text-blue-300"><QrCode className="w-6 h-6"/><span className="text-[10px]">อัปโหลด QR</span></div> : <input type="text" value={payValue} onChange={(e) => setPayValue(e.target.value)} placeholder="เลขบัญชี / เบอร์" className="w-full p-2 rounded-lg border text-sm outline-none" />}
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">เก็บเงินใครบ้าง? ({selectedUserIds.length})</label>
                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {users.map(u => {
                                if (u.id === currentUser.id) return null;
                                const isSelected = selectedUserIds.includes(u.id);
                                const status = getExistingPayerStatus(u.id);
                                const isVerified = status === 'VERIFIED';

                                return (
                                    <div
                                        key={u.id}
                                        onClick={() => toggleUser(u.id)}
                                        className={`cursor-pointer flex flex-col items-center space-y-1 min-w-[50px] ${isVerified ? 'cursor-not-allowed opacity-70' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all relative ${isSelected ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200 opacity-50 grayscale'}`}>
                                            <img src={u.avatar} className="w-full h-full" />
                                            {isVerified && (
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white"/>
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[9px] font-bold ${isSelected ? 'text-green-600' : 'text-gray-400'}`}>{u.name}</span>
                                        {isVerified && <span className="text-[8px] text-green-600 font-bold bg-green-100 px-1 rounded">จ่ายแล้ว</span>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg mt-2">บันทึกบิล</button>
                </form>
            </div>
        </div>
    );
};

export default CreateBillModal;
