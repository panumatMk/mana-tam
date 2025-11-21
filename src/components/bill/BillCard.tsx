import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, CheckCircle2, Clock, Image as ImageIcon } from 'lucide-react';
import type { BillItem, Payer, User } from './types';

interface Props {
    bill: BillItem;
    allUsers: User[];
    isOpen: boolean;
    onToggle: () => void;
    onVerifySlip: (billId: string, payerId: string) => void;
}

const BillCard: React.FC<Props> = ({ bill, allUsers, isOpen, onToggle, onVerifySlip }) => {

    // Logic เรียงลำดับ: UNPAID -> SLIP_SENT -> VERIFIED
    const sortedDebtors = [...bill.debtors].sort((a, b) => {
        const score = { UNPAID: 1, SLIP_SENT: 2, VERIFIED: 3 };
        return score[a.status] - score[b.status];
    });

    // นับจำนวน
    const paidCount = bill.debtors.filter(d => d.status === 'VERIFIED').length;
    const totalCount = bill.debtors.length;
    const amountPerPerson = bill.totalAmount / totalCount;

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(bill.paymentValue);
        alert('คัดลอกเลขบัญชีแล้ว!');
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-3 transition-all">

            {/* HEADER (Click to Expand) */}
            <div onClick={onToggle} className="p-4 cursor-pointer active:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h4 className="font-bold text-gray-800 text-base">{bill.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span>จ่ายโดย You</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className={`${paidCount === totalCount ? 'text-green-500 font-bold' : ''}`}>เก็บแล้ว {paidCount}/{totalCount} คน</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">฿{bill.totalAmount.toLocaleString()}</div>
                        <div className="text-[10px] text-gray-400">ตกคนละ {Math.ceil(amountPerPerson).toLocaleString()}</div>
                    </div>
                </div>

                {/* Payment Info Bar (Visible when expanded or always visible? Let's show mini info) */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        {bill.paymentType === 'QR' ? (
                            <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold"><ImageIcon className="w-3 h-3"/> QR Code</span>
                        ) : (
                            <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded font-bold select-all" onClick={handleCopy}>
                        {bill.paymentValue} <Copy className="w-3 h-3"/>
                    </span>
                        )}
                    </div>
                    <div className="text-gray-300">
                        {isOpen ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                    </div>
                </div>
            </div>

            {/* PAYERS LIST (Collapsible) */}
            {isOpen && (
                <div className="bg-gray-50 p-3 border-t border-gray-100 space-y-2">
                    {sortedDebtors.map(payer => {
                        const user = allUsers.find(u => u.id === payer.userId);
                        if(!user) return null;

                        return (
                            <div key={payer.userId} className={`flex items-center justify-between p-2 rounded-xl border ${payer.status === 'VERIFIED' ? 'bg-green-50 border-green-100 opacity-60 order-last' : 'bg-white border-gray-200 shadow-sm'}`}>

                                {/* User Info */}
                                <div className="flex items-center gap-3">
                                    <div className={`relative`}>
                                        <img src={user.avatar} className={`w-9 h-9 rounded-full border-2 ${payer.status === 'VERIFIED' ? 'border-green-500 grayscale' : 'border-gray-100'}`} />
                                        {payer.status === 'UNPAID' && <div className="absolute -bottom-1 -right-1 bg-gray-400 text-white text-[8px] px-1.5 rounded-full border border-white">รอ</div>}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-700">{user.name}</div>
                                        <div className="text-[10px]">
                                            {payer.status === 'UNPAID' && <span className="text-gray-400">ยังไม่จ่าย</span>}
                                            {payer.status === 'SLIP_SENT' && <span className="text-orange-500 font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> รอตรวจสลิป</span>}
                                            {payer.status === 'VERIFIED' && <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> จ่ายแล้ว</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div>
                                    {payer.status === 'UNPAID' && (
                                        <span className="text-xs font-bold text-gray-300">฿{Math.ceil(amountPerPerson)}</span>
                                    )}

                                    {payer.status === 'SLIP_SENT' && (
                                        <button
                                            onClick={() => {
                                                if(confirm('ยอดเงินถูกต้อง? กด OK เพื่อยืนยัน')) onVerifySlip(bill.id, payer.userId);
                                            }}
                                            className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-green-600 transition-all"
                                        >
                                            ตรวจรับ
                                        </button>
                                    )}

                                    {payer.status === 'VERIFIED' && (
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BillCard;
