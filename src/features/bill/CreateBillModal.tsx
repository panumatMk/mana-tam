import React, { useState, useEffect } from 'react';
import { DollarSign, QrCode, CreditCard, Check } from 'lucide-react';
import { Modal } from '../../components/common/Modal'; // ✅ เรียกใช้ Modal กลาง
import type { User } from "../../types/user.types.ts";
import type { BillItem, PaymentMethodType } from "../../types/bill.types.ts";

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
                setSelectedUserIds(initialData.debtors.map(d => d.userId));
            } else {
                setTitle('');
                setAmount('');
                setPayType('QR');
                setPayValue('');
                setSelectedUserIds(users.filter(u => u.id !== currentUser.id).map(u => u.id));
            }
        }
    }, [isOpen, initialData, users, currentUser]);

    // ตรวจสอบสถานะของคนในบิลเก่า (ถ้ามี)
    const getExistingPayerStatus = (userId: string) => {
        if (!initialData) return null;
        return initialData.debtors.find(d => d.userId === userId)?.status;
    };

    const toggleUser = (id: string) => {
        if (getExistingPayerStatus(id) === 'VERIFIED') return; // ห้ามเอาออกถ้าจ่ายแล้ว

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

    // ✅ สร้าง Footer Button แยกออกมา
    const footerContent = (
        <button
            type="submit"
            form="create-bill-form" // เชื่อมกับ ID ของฟอร์ม
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center active:scale-95 transition-all"
        >
            {initialData ? 'บันทึกการแก้ไข' : 'สร้างบิลเลย'}
        </button>
    );

    return (
        // ✅ ใช้ Modal Component แทน div แบบเดิม
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'แก้ไขบิล ✏️' : 'สร้างบิลเรียกเก็บ 🧾'}
            footer={footerContent}
        >
            <form id="create-bill-form" onSubmit={handleSubmit} className="space-y-6">

                {/* Input Group */}
                <div className="space-y-3">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">รายการ</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="ค่าอะไร? (เช่น ค่าที่พัก)"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">จำนวนเงินรวม</label>
                        <div className="relative">
                            <DollarSign className="absolute top-3.5 left-3 text-gray-400 w-4 h-4" />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 p-3 font-bold text-blue-600 outline-none focus:border-blue-500 focus:bg-white transition-all text-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                    <label className="block text-[10px] font-bold text-blue-400 mb-2 uppercase">รับเงินทางไหน?</label>
                    <div className="flex gap-2 mb-3">
                        <button
                            type="button"
                            onClick={() => setPayType('QR')}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${payType === 'QR' ? 'bg-blue-500 text-white shadow-md transform scale-105' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            <QrCode className="w-4 h-4" /> QR รูป
                        </button>
                        <button
                            type="button"
                            onClick={() => setPayType('BANK_ACCOUNT')}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${payType === 'BANK_ACCOUNT' ? 'bg-blue-500 text-white shadow-md transform scale-105' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            <CreditCard className="w-4 h-4" /> เลขบัญชี
                        </button>
                    </div>

                    {payType === 'QR' ? (
                        <div className="h-32 border-2 border-dashed border-blue-200 rounded-xl bg-white flex flex-col items-center justify-center text-blue-300 cursor-pointer hover:bg-blue-50 transition-colors">
                            <QrCode className="w-8 h-8 mb-1" />
                            <span className="text-xs font-bold">อัปโหลด QR Code</span>
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={payValue}
                            onChange={(e) => setPayValue(e.target.value)}
                            placeholder="เลขบัญชี / พร้อมเพย์"
                            className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-all"
                        />
                    )}
                </div>

                {/* Debtors Selection */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block">
                        เก็บเงินใครบ้าง? <span className="text-blue-500">({selectedUserIds.length})</span>
                    </label>
                    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 hide-scrollbar-completely">
                        {users.map(u => {
                            if (u.id === currentUser.id) return null;
                            const isSelected = selectedUserIds.includes(u.id);
                            const status = getExistingPayerStatus(u.id);
                            const isVerified = status === 'VERIFIED';

                            return (
                                <div
                                    key={u.id}
                                    onClick={() => toggleUser(u.id)}
                                    className={`cursor-pointer flex flex-col items-center space-y-2 min-w-[60px] group ${isVerified ? 'cursor-not-allowed opacity-60' : ''}`}
                                >
                                    <div className={`w-14 h-14 rounded-full border-2 p-0.5 transition-all relative ${isSelected ? 'border-green-500 scale-110 shadow-md' : 'border-gray-200 grayscale opacity-70 group-hover:opacity-100'}`}>
                                        <img src={u.avatar} className="w-full h-full rounded-full bg-gray-100 object-cover" />

                                        {/* Status Badge */}
                                        {isVerified && (
                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-[1px]">
                                                <Check className="w-6 h-6 text-white font-bold drop-shadow-md" />
                                            </div>
                                        )}

                                        {/* Selected Indicator */}
                                        {!isVerified && isSelected && (
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-bold truncate max-w-full ${isSelected ? 'text-green-600' : 'text-gray-400'}`}>{u.name}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default CreateBillModal;
