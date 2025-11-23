import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, QrCode, CreditCard, Check, Users, Calculator, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import type { User } from "../../types/user.types.ts";
import type { BillItem, PaymentMethodType } from "../../types/bill.types.ts";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    currentUser: User;
    onSave: (data: any, isEdit: boolean) => void;
    initialData?: BillItem | null;
    isSaving?: boolean; // เพิ่ม loading state
}

type SplitMode = 'EQUAL' | 'CUSTOM';

const CreateBillModal: React.FC<Props> = ({ isOpen, onClose, users, currentUser, onSave, initialData, isSaving }) => {
    // State
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [payType, setPayType] = useState<PaymentMethodType>('BANK_ACCOUNT');
    const [payValue, setPayValue] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [splitMode, setSplitMode] = useState<SplitMode>('EQUAL');
    const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});

    // Validation State
    const [errors, setErrors] = useState<{title?: string, amount?: string, users?: string}>({});

    // Load Data
    useEffect(() => {
        if (isOpen) {
            setErrors({}); // Reset errors
            if (initialData) {
                setTitle(initialData.title);
                setAmount(initialData.totalAmount.toString());
                setPayType(initialData.paymentType);
                setPayValue(initialData.paymentValue);
                const debtorIds = initialData.debtors.map(d => d.userId);
                setSelectedUserIds(debtorIds);

                const firstAmount = initialData.debtors[0]?.amount || 0;
                const isEqual = initialData.debtors.every(d => Math.abs(d.amount - firstAmount) < 0.01);

                if (isEqual) {
                    setSplitMode('EQUAL');
                } else {
                    setSplitMode('CUSTOM');
                    const amounts: Record<string, string> = {};
                    initialData.debtors.forEach(d => amounts[d.userId] = d.amount.toString());
                    setCustomAmounts(amounts);
                }
            } else {
                // Default
                setTitle('');
                setAmount('');
                setPayType('QR');
                setPayValue('');
                setSelectedUserIds(users.map(u => u.id));
                setSplitMode('EQUAL');
                setCustomAmounts({});
            }
        }
    }, [isOpen, initialData, users, currentUser]);

    // Calculation Helper
    const summaryStats = useMemo(() => {
        const total = parseFloat(amount) || 0;
        let currentSum = 0;
        if (splitMode === 'CUSTOM') {
            selectedUserIds.forEach(id => {
                currentSum += parseFloat(customAmounts[id] || '0');
            });
        } else {
            currentSum = total;
        }
        return {
            total,
            diff: total - currentSum,
            isValid: Math.abs(total - currentSum) < 0.1
        };
    }, [amount, customAmounts, selectedUserIds, splitMode]);

    // Handlers
    const toggleUser = (id: string) => {
        if (initialData) {
            const existing = initialData.debtors.find(d => d.userId === id);
            if (existing?.status === 'VERIFIED') return;
        }
        if (selectedUserIds.includes(id)) {
            // setSelectedUserIds(prev => prev.filter(uid => uid !== id));
            const newAmounts = { ...customAmounts };
            delete newAmounts[id];
            setCustomAmounts(newAmounts);
        } else {
            setSelectedUserIds(prev => [...prev, id]);
            setCustomAmounts(prev => ({ ...prev, [id]: '0' }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: any = {};
        let isValid = true;

        // 1. Validate Basic Fields
        if (!title.trim()) { newErrors.title = 'ใส่ชื่อค่าใช้จ่ายหน่อย'; isValid = false; }
        if (!amount || parseFloat(amount) <= 0) { newErrors.amount = 'ยอดเงินต้องมากกว่า 0'; isValid = false; }
        if (selectedUserIds.length === 0) { newErrors.users = 'ต้องมีคนหารอย่างน้อย 1 คน'; isValid = false; }

        // 2. Validate Custom Split
        if (splitMode === 'CUSTOM' && !summaryStats.isValid) {
            alert(`ยอดเงินไม่ตรง! ${summaryStats.diff > 0 ? 'ขาด' : 'เกิน'} ${Math.abs(summaryStats.diff).toLocaleString()} บาท`);
            return;
        }

        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        // Prepare Data
        let finalDebtors: { userId: string, amount: number }[] = [];
        if (splitMode === 'EQUAL') {
            const perHead = parseFloat(amount) / selectedUserIds.length;
            finalDebtors = selectedUserIds.map(id => ({ userId: id, amount: perHead }));
        } else {
            finalDebtors = selectedUserIds.map(id => ({ userId: id, amount: parseFloat(customAmounts[id] || '0') }));
        }

        onSave({
            title,
            totalAmount: parseFloat(amount),
            paymentType: payType,
            paymentValue: payValue || (payType === 'QR' ? 'QR_CODE_URL' : ''), // Mock if empty
            debtors: finalDebtors
        }, !!initialData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'แก้ไขบิล ✏️' : 'สร้างบิลเรียกเก็บ 🧾'}
            footer={
                <button
                    type="submit"
                    form="create-bill-form"
                    disabled={isSaving || (splitMode === 'CUSTOM' && !summaryStats.isValid)}
                    className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center active:scale-95 transition-all 
                    ${(isSaving || (splitMode === 'CUSTOM' && !summaryStats.isValid)) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isSaving ? 'กำลังบันทึก...' : (initialData ? 'บันทึกการแก้ไข' : 'สร้างบิลเลย')}
                </button>
            }
        >
            <form id="create-bill-form" onSubmit={handleSubmit} className="space-y-5">
                {/* Title & Amount */}
                <div className="space-y-3">
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => { setTitle(e.target.value); setErrors({...errors, title: undefined}); }}
                            placeholder="ค่าอะไร? (เช่น ค่าที่พัก)"
                            className={`w-full bg-gray-50 border-2 rounded-xl p-3 font-bold outline-none transition-all ${errors.title ? 'border-red-400 bg-red-50' : 'border-transparent focus:border-blue-500'}`}
                            autoFocus
                        />
                        {errors.title && <p className="text-red-500 text-[10px] mt-1 pl-1">{errors.title}</p>}
                    </div>
                    <div className="relative">
                        <DollarSign className="absolute top-3.5 left-3 text-gray-400 w-4 h-4" />
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => { setAmount(e.target.value); setErrors({...errors, amount: undefined}); }}
                            placeholder="0.00"
                            className={`w-full bg-gray-50 border-2 rounded-xl pl-9 p-3 font-bold text-blue-600 outline-none text-lg transition-all ${errors.amount ? 'border-red-400 bg-red-50' : 'border-transparent focus:border-blue-500'}`}
                        />
                        {errors.amount && <p className="text-red-500 text-[10px] mt-1 pl-1 absolute -bottom-5 left-0">{errors.amount}</p>}
                    </div>
                </div>

                {/* 3. Payment Method (ย่อลงมาหน่อย) */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex gap-2 text-xs">
                        <button type="button" onClick={() => setPayType('BANK_ACCOUNT')}
                                className={`flex-1 py-2 rounded-lg font-bold transition-colors ${payType === 'BANK_ACCOUNT' ? 'bg-blue-500 text-white shadow' : 'bg-white text-gray-500 border'}`}>เลขบัญชี
                        </button>
                        <button type="button" onClick={() => setPayType('QR')}
                                className={`flex-1 py-2 rounded-lg font-bold transition-colors ${payType === 'QR' ? 'bg-blue-500 text-white shadow' : 'bg-white text-gray-500 border'}`}>QR
                            Code
                        </button>
                    </div>
                    <div className="mt-2">
                        {payType === 'QR' ? (
                            <div
                                className="h-10 border border-dashed border-blue-300 rounded bg-blue-50 flex items-center justify-center text-blue-400 text-xs cursor-pointer">
                            <QrCode className="w-3 h-3 mr-1"/> อัปโหลด QR (Coming Soon)
                            </div>
                        ) : (
                            <input type="text" value={payValue} onChange={(e) => setPayValue(e.target.value)} placeholder="กรอกเลขบัญชี / พร้อมเพย์" className="w-full p-2 text-xs bg-white border rounded outline-none focus:border-blue-500"/>
                        )}
                    </div>
                </div>

                {/* Users Select */}
                <div className="pt-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex justify-between">
                        <span>ใครหารบ้าง? ({selectedUserIds.length})</span>
                        <span className="text-blue-500 cursor-pointer" onClick={() => setSelectedUserIds(users.map(u => u.id))}>เลือกทุกคน</span>
                    </label>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {users.map(u => {
                            const isSelected = selectedUserIds.includes(u.id);
                            const isVerified = initialData?.debtors.find(d => d.userId === u.id)?.status === 'VERIFIED';
                            return (
                                <div key={u.id} onClick={() => toggleUser(u.id)} className={`cursor-pointer flex flex-col items-center space-y-1 min-w-[56px] transition-all ${isSelected ? 'opacity-100' : 'opacity-50 scale-90'}`}>
                                    <div className={`w-12 h-12 rounded-full border-2 p-0.5 relative ${isSelected ? 'border-green-500' : 'border-gray-200'}`}>
                                        <img src={u.avatar} className="w-full h-full rounded-full bg-gray-100 object-cover" />
                                        {isSelected && <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white"><Check className="w-2.5 h-2.5 text-white" strokeWidth={4} /></div>}
                                        {isVerified && <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center"><Check className="text-white"/></div>}
                                    </div>
                                    <span className="text-[10px] font-bold truncate w-full text-center">{u.name}</span>
                                </div>
                            )
                        })}
                    </div>
                    {errors.users && <p className="text-red-500 text-[10px] mt-1 text-center">{errors.users}</p>}
                </div>

                {/* Split Mode & Amount Inputs (คงเดิม แต่เพิ่ม class จัด layout นิดหน่อย) */}
                <div className="pt-2">
                    {/* ... (ส่วน Tab Split Mode เหมือนเดิม) ... */}
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-3">
                        <button type="button" onClick={() => setSplitMode('EQUAL')} className={`flex-1 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${splitMode === 'EQUAL' ? 'bg-white shadow text-green-600' : 'text-gray-400'}`}><Users className="w-3 h-3" /> หารเท่ากัน</button>
                        <button type="button" onClick={() => setSplitMode('CUSTOM')} className={`flex-1 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${splitMode === 'CUSTOM' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}><Calculator className="w-3 h-3" /> กำหนดเอง</button>
                    </div>

                    {/* User Amount List */}
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                        {selectedUserIds.map(id => {
                            const user = users.find(u => u.id === id);
                            if (!user) return null;
                            return (
                                <div key={id} className="flex items-center justify-between bg-white border border-gray-100 p-2 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <img src={user.avatar} className="w-8 h-8 rounded-full bg-gray-100" />
                                        <span className="text-xs font-bold text-gray-700">{user.name}</span>
                                    </div>
                                    {splitMode === 'EQUAL' ? (
                                        <div className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">฿{(parseFloat(amount || '0') / selectedUserIds.length).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                    ) : (
                                        <div className="relative w-24">
                                            <span className="absolute left-2 top-1.5 text-gray-400 text-xs">฿</span>
                                            <input type="number" value={customAmounts[id] || ''} onChange={(e) => setCustomAmounts(prev => ({ ...prev, [id]: e.target.value }))} className="w-full pl-5 pr-2 py-1 text-right text-sm font-bold border rounded focus:border-blue-500 outline-none bg-blue-50/30 text-blue-700" placeholder="0"/>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default CreateBillModal;
