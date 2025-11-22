import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, QrCode, CreditCard, Check, Users, Calculator, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import type { User } from "../../types/user.types.ts";
import type { BillItem, PaymentMethodType, Payer } from "../../types/bill.types.ts";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    currentUser: User;
    onSave: (data: any, isEdit: boolean) => void;
    initialData?: BillItem | null;
}

type SplitMode = 'EQUAL' | 'CUSTOM';

const CreateBillModal: React.FC<Props> = ({ isOpen, onClose, users, currentUser, onSave, initialData }) => {
    // --- Form State ---
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [payType, setPayType] = useState<PaymentMethodType>('QR');
    const [payValue, setPayValue] = useState('');

    // --- Split Logic State ---
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [splitMode, setSplitMode] = useState<SplitMode>('EQUAL');
    const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({}); // เก็บยอดแยกรายคน (id: amount)

    // Load Data when Edit
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setAmount(initialData.totalAmount.toString());
                setPayType(initialData.paymentType);
                setPayValue(initialData.paymentValue);

                const debtorIds = initialData.debtors.map(d => d.userId);
                setSelectedUserIds(debtorIds);

                // เช็คว่าเป็นหารเท่าหรือไม่ (โดยดูว่ายอดเท่ากันทุกคนไหม)
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
                // Default for New Bill
                setTitle('');
                setAmount('');
                setPayType('QR');
                setPayValue('');
                // Default select everyone except me
                const others = users.filter(u => u.id !== currentUser.id).map(u => u.id);
                setSelectedUserIds(others);
                setSplitMode('EQUAL');
                setCustomAmounts({});
            }
        }
    }, [isOpen, initialData, users, currentUser]);

    // Helper: คำนวณยอดคงเหลือ/เกิน ในโหมด Custom
    const summaryStats = useMemo(() => {
        const total = parseFloat(amount) || 0;
        let currentSum = 0;

        if (splitMode === 'CUSTOM') {
            selectedUserIds.forEach(id => {
                currentSum += parseFloat(customAmounts[id] || '0');
            });
        } else {
            currentSum = total; // ถ้าหารเท่า ถือว่าเป๊ะเสมอ
        }

        return {
            total,
            currentSum,
            diff: total - currentSum,
            isValid: Math.abs(total - currentSum) < 0.1 // อนุญาตให้คลาดเคลื่อนได้นิดหน่อย (ทศนิยม)
        };
    }, [amount, customAmounts, selectedUserIds, splitMode]);

    // Helper: Auto distribute when switching to Custom or selecting users
    useEffect(() => {
        if (splitMode === 'CUSTOM' && selectedUserIds.length > 0) {
            // ถ้าเปลี่ยนคนหาร หรือ เปลี่ยนโหมด อาจจะอยากให้เฉลี่ยไปก่อนเป็นค่าเริ่มต้น (Optional)
            // แต่ในที่นี้จะไม่ Reset ค่าที่กรอกไว้ถ้ายูสเซอร์เพิ่มคน
        }
    }, [selectedUserIds.length]);

    const toggleUser = (id: string) => {
        if (initialData) {
            // ถ้าแก้ไข และคนนี้จ่ายแล้ว ห้ามเอาออก
            const existing = initialData.debtors.find(d => d.userId === id);
            if (existing?.status === 'VERIFIED') return;
        }

        if (selectedUserIds.includes(id)) {
            setSelectedUserIds(prev => prev.filter(uid => uid !== id));
            // ลบค่าออกจาก customAmounts ด้วย
            const newAmounts = { ...customAmounts };
            delete newAmounts[id];
            setCustomAmounts(newAmounts);
        } else {
            setSelectedUserIds(prev => [...prev, id]);
            // เพิ่มคนใหม่ ให้ค่าเป็น 0 หรือค่าเฉลี่ยที่เหลือก็ได้
            setCustomAmounts(prev => ({ ...prev, [id]: '0' }));
        }
    };

    const handleCustomAmountChange = (userId: string, val: string) => {
        setCustomAmounts(prev => ({ ...prev, [userId]: val }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount || selectedUserIds.length === 0) return;

        // Validation for Custom Mode
        if (splitMode === 'CUSTOM' && !summaryStats.isValid) {
            alert(`ยอดเงินยังไม่ครบ! ${summaryStats.diff > 0 ? 'ขาด' : 'เกิน'} ${Math.abs(summaryStats.diff).toLocaleString()} บาท`);
            return;
        }

        // Prepare Data
        let finalDebtors: { userId: string, amount: number }[] = [];

        if (splitMode === 'EQUAL') {
            // หารเท่า: ส่งไปให้ BillScreen คำนวณเอง หรือคำนวณตรงนี้เลยก็ได้
            // เพื่อความชัวร์ คำนวณตรงนี้ส่งไปเลยจะดีกว่า จะได้รองรับ Custom ได้ด้วย
            const perHead = parseFloat(amount) / selectedUserIds.length;
            finalDebtors = selectedUserIds.map(id => ({
                userId: id,
                amount: perHead
            }));
        } else {
            // Custom: ใช้ค่าที่กรอก
            finalDebtors = selectedUserIds.map(id => ({
                userId: id,
                amount: parseFloat(customAmounts[id] || '0')
            }));
        }

        onSave({
            title,
            totalAmount: parseFloat(amount),
            paymentType: payType,
            paymentValue: payValue || 'QR_CODE_URL',
            debtors: finalDebtors // 🔥 ส่ง Object ที่มี amount ไปแทน list string แบบเดิม
        }, !!initialData);
    };

    const footerContent = (
        <div className="space-y-3">
            {/* Error Message for Custom Mode */}
            {splitMode === 'CUSTOM' && Math.abs(summaryStats.diff) > 0.1 && (
                <div className={`text-xs font-bold text-center ${summaryStats.diff > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                    {summaryStats.diff > 0 ? `เหลืออีก ${summaryStats.diff.toLocaleString()} บาท` : `เกินมา ${Math.abs(summaryStats.diff).toLocaleString()} บาท`}
                </div>
            )}

            <button
                type="submit"
                form="create-bill-form"
                disabled={splitMode === 'CUSTOM' && !summaryStats.isValid}
                className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center active:scale-95 transition-all 
                    ${(splitMode === 'CUSTOM' && !summaryStats.isValid) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                {initialData ? 'บันทึกการแก้ไข' : 'สร้างบิลเลย'}
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'แก้ไขบิล ✏️' : 'สร้างบิลเรียกเก็บ 🧾'}
            footer={footerContent}
        >
            <form id="create-bill-form" onSubmit={handleSubmit} className="space-y-5">

                {/* 1. Basic Info */}
                <div className="space-y-3">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="ค่าอะไร? (เช่น ค่าที่พัก)"
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-xl p-3 font-bold outline-none transition-all"
                        autoFocus
                    />
                    <div className="relative">
                        <DollarSign className="absolute top-3.5 left-3 text-gray-400 w-4 h-4" />
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-xl pl-9 p-3 font-bold text-blue-600 outline-none text-lg transition-all"
                        />
                    </div>
                </div>

                {/* 2. Who to split with? (Selection) */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block flex justify-between">
                        <span>ใครหารบ้าง? ({selectedUserIds.length})</span>
                        <span className="text-blue-500 cursor-pointer" onClick={() => setSelectedUserIds(users.filter(u => u.id !== currentUser.id).map(u => u.id))}>เลือกทุกคน</span>
                    </label>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {users.map(u => {
                            if (u.id === currentUser.id) return null;
                            const isSelected = selectedUserIds.includes(u.id);
                            const status = initialData?.debtors.find(d => d.userId === u.id)?.status;
                            const isVerified = status === 'VERIFIED';

                            return (
                                <div
                                    key={u.id}
                                    onClick={() => toggleUser(u.id)}
                                    className={`cursor-pointer flex flex-col items-center space-y-1 min-w-[56px] transition-all ${isSelected ? 'opacity-100' : 'opacity-50 scale-90'}`}
                                >
                                    <div className={`w-12 h-12 rounded-full border-2 p-0.5 relative ${isSelected ? 'border-green-500' : 'border-gray-200'}`}>
                                        <img src={u.avatar} className="w-full h-full rounded-full bg-gray-100 object-cover" />
                                        {isSelected && (
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                                            </div>
                                        )}
                                        {isVerified && <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center"><Check className="text-white"/></div>}
                                    </div>
                                    <span className="text-[10px] font-bold truncate w-full text-center">{u.name}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* 3. Payment Method (ย่อลงมาหน่อย) */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex gap-2 text-xs">
                        <button type="button" onClick={() => setPayType('QR')} className={`flex-1 py-2 rounded-lg font-bold transition-colors ${payType === 'QR' ? 'bg-blue-500 text-white shadow' : 'bg-white text-gray-500 border'}`}>QR Code</button>
                        <button type="button" onClick={() => setPayType('BANK_ACCOUNT')} className={`flex-1 py-2 rounded-lg font-bold transition-colors ${payType === 'BANK_ACCOUNT' ? 'bg-blue-500 text-white shadow' : 'bg-white text-gray-500 border'}`}>เลขบัญชี</button>
                    </div>
                    <div className="mt-2">
                        {payType === 'QR' ? (
                            <div className="h-10 border border-dashed border-blue-300 rounded bg-blue-50 flex items-center justify-center text-blue-400 text-xs cursor-pointer">
                                <QrCode className="w-3 h-3 mr-1"/> อัปโหลด QR (Coming Soon)
                            </div>
                        ) : (
                            <input type="text" value={payValue} onChange={(e) => setPayValue(e.target.value)} placeholder="กรอกเลขบัญชี / พร้อมเพย์" className="w-full p-2 text-xs bg-white border rounded outline-none focus:border-blue-500"/>
                        )}
                    </div>
                </div>

                {/* 4. Split Mode Tabs */}
                <div className="pt-2">
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-3">
                        <button
                            type="button"
                            onClick={() => setSplitMode('EQUAL')}
                            className={`flex-1 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${splitMode === 'EQUAL' ? 'bg-white shadow text-green-600' : 'text-gray-400'}`}
                        >
                            <Users className="w-3 h-3" /> หารเท่ากัน
                        </button>
                        <button
                            type="button"
                            onClick={() => setSplitMode('CUSTOM')}
                            className={`flex-1 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${splitMode === 'CUSTOM' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}
                        >
                            <Calculator className="w-3 h-3" /> กำหนดเอง
                        </button>
                    </div>

                    {/* Split Details */}
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                        {selectedUserIds.length === 0 && <div className="text-center text-gray-300 text-xs py-4">ยังไม่ได้เลือกเพื่อนเลย</div>}

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
                                        <div className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                            ฿{(parseFloat(amount || '0') / selectedUserIds.length).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </div>
                                    ) : (
                                        <div className="relative w-24">
                                            <span className="absolute left-2 top-1.5 text-gray-400 text-xs">฿</span>
                                            <input
                                                type="number"
                                                value={customAmounts[id] || ''}
                                                onChange={(e) => handleCustomAmountChange(id, e.target.value)}
                                                className="w-full pl-5 pr-2 py-1 text-right text-sm font-bold border rounded focus:border-blue-500 outline-none bg-blue-50/30 text-blue-700"
                                                placeholder="0"
                                            />
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
