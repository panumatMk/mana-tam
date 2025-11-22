import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Copy, CheckCircle2, Clock, Image as ImageIcon, Edit3, Upload, XCircle, Download } from 'lucide-react';

// Import Types & Enums จากโครงสร้างใหม่
import type { Bill, Payer } from '../../types/bill.types';
import type { User } from '../../types/user.types';
import { PayerStatus, PaymentMethod } from '../../enums/bill.enums';

// (สมมติว่ามี Modal ดูรูปแยกต่างหาก หรือจะใส่ไว้ในนี้ก็ได้ถ้า simple)
// import ImagePreviewModal from '../../components/common/ImagePreviewModal';

interface Props {
    bill: Bill;
    // ในแอปจริงควรดึง currentUser จาก Context/Store แต่รับเป็น props ไปก่อน
    currentUser?: User;
    allUsers?: User[]; // รับรายการ User ทั้งหมดมาเพื่อแสดง Avatar
    isOpen?: boolean;
    onToggle?: () => void;
}

export const BillCard: React.FC<Props> = ({ bill, currentUser, allUsers = [], isOpen = false, onToggle }) => {
    // Mock User ปัจจุบันถ้าไม่ได้ส่งมา (เพื่อกัน Error ในหน้า Preview)
    const safeCurrentUser = currentUser || { id: 'me', name: 'Me', avatar: '' };

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Logic เรียงลำดับ: ให้คนรอตรวจ (SLIP_SENT) ขึ้นก่อน -> ยังไม่จ่าย -> จ่ายแล้ว
    const sortedDebtors = [...bill.debtors].sort((a, b) => {
        const score = { [PayerStatus.SLIP_SENT]: 1, [PayerStatus.UNPAID]: 2, [PayerStatus.REJECTED]: 2, [PayerStatus.VERIFIED]: 3 };
        return score[a.status] - score[b.status];
    });

    const paidCount = bill.debtors.filter(d => d.status === PayerStatus.VERIFIED).length;
    const totalCount = bill.debtors.length;
    const amIHost = bill.payerId === safeCurrentUser.id;

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        // navigator.clipboard.writeText(bill.paymentValue); // Uncomment เมื่อใช้งานจริง
        alert(`คัดลอกแล้ว: ${bill.id}`); // Mock alert
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-3 transition-all relative group">

            {/* Edit Button (เฉพาะเจ้าของบิล) */}
            {amIHost && (
                <button className="absolute top-3 right-3 text-gray-300 hover:text-blue-500 p-1 z-10">
                    <Edit3 className="w-4 h-4" />
                </button>
            )}

            {/* HEADER */}
            <div onClick={onToggle} className="p-4 cursor-pointer active:bg-gray-50">
                <div className="flex justify-between items-start mb-2 pr-6">
                    <div>
                        <h4 className="font-bold text-gray-800 text-base">{bill.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span>จ่ายโดย: {bill.payerId === 'me' ? 'You' : bill.payerId}</span>
                            <span className={`ml-2 ${paidCount === totalCount ? 'text-green-500 font-bold' : ''}`}>
                        เก็บแล้ว {paidCount}/{totalCount}
                    </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">฿{bill.totalAmount.toLocaleString()}</div>
                    </div>
                </div>

                {/* Payment Info Bar */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        {bill.paymentType === PaymentMethod.QR ? (
                            <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold">
                        <ImageIcon className="w-3 h-3"/> <span>QR Code</span>
                    </span>
                        ) : (
                            <button onClick={handleCopy} className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg font-bold hover:bg-orange-100 transition-colors">
                                <Copy className="w-3 h-3"/><span>Copy เลขบัญชี</span>
                            </button>
                        )}
                    </div>
                    <div className="text-gray-300">
                        {isOpen ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                    </div>
                </div>
            </div>

            {/* PAYERS LIST */}
            {isOpen && (
                <div className="bg-gray-50 p-3 border-t border-gray-100 space-y-2">
                    {sortedDebtors.map((payer, index) => {
                        // Mock User data ถ้าหาไม่เจอ
                        const user = allUsers.find(u => u.id === payer.userId) || { id: payer.userId, name: payer.userId, avatar: '' };
                        const isMe = user.id === safeCurrentUser.id;

                        return (
                            <div key={index} className={`flex flex-col p-3 rounded-xl border bg-white border-gray-200 shadow-sm ${payer.status === PayerStatus.VERIFIED ? 'opacity-60' : ''}`}>

                                {/* Row 1: User & Status */}
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white">
                                                {user.avatar && <img src={user.avatar} className="w-full h-full object-cover" />}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-700">
                                                {user.name} {isMe && <span className="text-blue-500">(ฉัน)</span>}
                                            </div>
                                            <div className="text-[10px] mt-0.5">
                                                {payer.status === PayerStatus.UNPAID && <span className="text-gray-400">ยังไม่จ่าย</span>}
                                                {payer.status === PayerStatus.SLIP_SENT && <span className="text-orange-500 font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> รอตรวจ</span>}
                                                {payer.status === PayerStatus.VERIFIED && <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> เรียบร้อย</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-sm font-bold text-gray-700">฿{Math.ceil(payer.amount).toLocaleString()}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
