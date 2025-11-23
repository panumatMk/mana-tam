import React, {useState, useRef} from 'react';
import {
    ChevronDown,
    ChevronUp,
    Copy,
    CheckCircle2,
    Clock,
    Image as ImageIcon,
    Edit3,
    Upload,
    XCircle
} from 'lucide-react';
// import ImagePreviewModal from "./ImagePreviewModal.tsx";
import type {BillItem} from "../../types/bill.types.ts";
import type {User} from "../../types/user.types.ts";
import {Button} from "../../components/ui/Button.tsx";

interface Props {
    bill: BillItem;
    currentUser: User;
    allUsers: User[];
    isOpen: boolean;
    onToggle: () => void;
    onVerifySlip: (billId: string, payerId: string, isApproved: boolean) => void;
    onUploadSlip: (billId: string, file: File) => void;
    onEdit: () => void;
}

const BillCard: React.FC<Props> = ({
                                       bill,
                                       currentUser,
                                       allUsers,
                                       isOpen,
                                       onToggle,
                                       onVerifySlip,
                                       onUploadSlip,
                                       onEdit
                                   }) => {

    const fileInputRef = useRef<HTMLInputElement>(null);

    // State สำหรับ Image Preview
    // const [previewImage, setPreviewImage] = useState<{ url: string; title: string; showDownload: boolean } | null>(null);

    const sortedDebtors = [...bill.debtors].sort((a, b) => {
        const score = {SLIP_SENT: 1, UNPAID: 2, REJECTED: 2, VERIFIED: 3};
        return score[a.status] - score[b.status];
    });

    const paidCount = bill.debtors.filter(d => d.status === 'VERIFIED').length;
    const totalCount = bill.debtors.length;
    const amIHost = bill.payerId === currentUser.id;

    const handleOpenQR = (e: React.MouseEvent) => {
        e.stopPropagation();
        // setPreviewImage({url: bill.paymentValue, title: 'QR Code รับเงิน', showDownload: true});
    };

    const handleOpenSlip = (e: React.MouseEvent, url: string, userName: string) => {
        e.stopPropagation();
        // setPreviewImage({url: url, title: `สลิปของ ${userName}`, showDownload: true});
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(bill.paymentValue);
        alert('คัดลอกเลขบัญชีแล้ว!');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUploadSlip(bill.id, e.target.files[0]);
        }
    };

    return (
        <>
            <div
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-3 transition-all relative group">

                {amIHost && (
                    <button onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }} className="absolute top-3 right-3 text-gray-300 hover:text-blue-500 p-1 z-10">
                        <Edit3 className="w-4 h-4"/>
                    </button>
                )}

                {/* HEADER */}
                <div onClick={onToggle} className="p-4 cursor-pointer active:bg-gray-50">
                    <div className="flex justify-between items-start mb-2 pr-6">
                        <div>
                            <h4 className="font-bold text-gray-800 text-base">{bill.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                <span>จ่ายให้: {allUsers.find(u => u.id === bill.payerId)?.name || 'Unknown'}</span>
                                <span className={`ml-2 ${paidCount === totalCount ? 'text-green-500 font-bold' : ''}`}>
                          เก็บแล้ว {paidCount}/{totalCount}
                      </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">฿{bill.totalAmount.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-dashed border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            {bill.paymentType === 'QR' ? (
                                <button
                                    onClick={handleOpenQR} // เปิด Modal QR
                                    className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                                >
                                    <ImageIcon className="w-3 h-3"/>
                                    <span>ดู QR Code</span>
                                </button>
                            ) : (
                                <button onClick={handleCopy}
                                        className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg font-bold hover:bg-orange-100 transition-colors">
                                    <Copy className="w-3 h-3"/><span>{bill.paymentValue}</span>
                                </button>
                            )}
                        </div>
                        <div className="text-gray-300 flex items-end">
                            <span>
                               <div className="flex -space-x-2 overflow-hidden pl-1 mt-3">
                                {sortedDebtors.slice(0, 5).map((p, index) => {
                                    const user = allUsers.find(u => u.id === p.userId);
                                    if (!user) return null;
                                    // const isMe = user.id === currentUser.id;
                                    // if(isMe) return null;
                                    return (
                                        <img
                                            key={user.id}
                                            src={user.avatar}
                                            className={`inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover bg-gray-100 ${p.status === 'VERIFIED' ? 'border-green-500 grayscale' : 'border-gray-100'}`}
                                            style={{zIndex: 10 - index}}
                                            alt={user.name}
                                        />
                                    )
                                })}
                            </div>
                            </span>
                            {isOpen ? <ChevronUp className="ml-2 w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                        </div>
                    </div>
                </div>

                {/* PAYERS LIST */}
                {isOpen && (
                    <div className="bg-gray-50 p-3 border-t border-gray-100 space-y-2">
                        {sortedDebtors.map(payer => {
                            const user = allUsers.find(u => u.id === payer.userId);
                            if (!user) return null;
                            const isMe = user.id === currentUser.id;

                            return (
                                <div key={payer.userId}
                                     className={`flex flex-col p-3 rounded-xl border bg-white border-gray-200 shadow-sm ${payer.status === 'VERIFIED' ? 'opacity-60' : ''}`}>
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img src={user.avatar}
                                                     className={`w-10 h-10 rounded-full border-2 ${payer.status === 'VERIFIED' ? 'border-green-500 grayscale' : 'border-gray-100'}`}/>
                                                {payer.status === 'UNPAID' && <div
                                                    className="absolute -bottom-1 -right-1 bg-gray-400 text-white text-[8px] px-1.5 rounded-full border border-white">รอ</div>}
                                                {payer.status === 'REJECTED' && <div
                                                    className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[8px] px-1.5 rounded-full border border-white">แก้</div>}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-700">
                                                    {user.name} {isMe && <span className="text-blue-500">(ฉัน)</span>}
                                                </div>
                                                <div className="text-[10px] mt-0.5">
                                                    {payer.status === 'UNPAID' &&
                                                        <span className="text-gray-400">ยังไม่จ่าย</span>}
                                                    {payer.status === 'REJECTED' && <span
                                                        className="text-red-500 font-bold flex items-center gap-1"><XCircle
                                                        className="w-3 h-3"/> สลิปไม่ผ่าน</span>}
                                                    {payer.status === 'SLIP_SENT' && <span
                                                        className="text-orange-500 font-bold flex items-center gap-1"><Clock
                                                        className="w-3 h-3"/> รอตรวจ</span>}
                                                    {payer.status === 'VERIFIED' && <span
                                                        className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2
                                                        className="w-3 h-3"/> จ่ายแล้ว</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div
                                                className="text-sm font-bold text-gray-700">฿{Math.ceil(payer.amount).toLocaleString()}</div>
                                            <Button size="mini" variants="outline"> จ่ายแล้ว </Button>
                                        </div>
                                    </div>

                                    {/*<div*/}
                                    {/*    className="mt-3 flex justify-end w-full border-t border-dashed border-gray-100 pt-2">*/}
                                    {/*    /!* ME: UPLOAD *!/*/}
                                    {/*    {isMe && (payer.status === 'UNPAID' || payer.status === 'REJECTED') && (*/}
                                    {/*        <div className="w-full">*/}
                                    {/*            <input type="file" accept="image/*" ref={fileInputRef}*/}
                                    {/*                   onChange={handleFileChange} className="hidden"/>*/}
                                    {/*            <button onClick={() => fileInputRef.current?.click()}*/}
                                    {/*                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all">*/}
                                    {/*                <Upload*/}
                                    {/*                    className="w-4 h-4"/> {payer.status === 'REJECTED' ? 'แนบสลิปใหม่' : 'แนบสลิป / จ่ายแล้ว'}*/}
                                    {/*            </button>*/}
                                    {/*        </div>*/}
                                    {/*    )}*/}

                                    {/*    /!* SLIP PREVIEW & APPROVE *!/*/}
                                    {/*    {payer.status === 'SLIP_SENT' && payer.slipUrl && (*/}
                                    {/*        <div className="flex gap-3 w-full items-center justify-between">*/}
                                    {/*            <button*/}
                                    {/*                onClick={(e) => handleOpenSlip(e, payer.slipUrl!, user.name)} // เปิด Modal สลิป*/}
                                    {/*                className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-200 flex-1"*/}
                                    {/*            >*/}
                                    {/*                <ImageIcon className="w-4 h-4"/> ดูสลิป*/}
                                    {/*            </button>*/}

                                    {/*            {amIHost && (*/}
                                    {/*                <div className="flex gap-2">*/}
                                    {/*                    <button*/}
                                    {/*                        onClick={() => onVerifySlip(bill.id, payer.userId, false)}*/}
                                    {/*                        className="bg-red-50 text-red-500 px-3 py-2 rounded-lg text-xs font-bold border border-red-100">ไม่ใช่*/}
                                    {/*                    </button>*/}
                                    {/*                    <button*/}
                                    {/*                        onClick={() => onVerifySlip(bill.id, payer.userId, true)}*/}
                                    {/*                        className="bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm">ยืนยัน*/}
                                    {/*                        ✅*/}
                                    {/*                    </button>*/}
                                    {/*                </div>*/}
                                    {/*            )}*/}
                                    {/*            {isMe && <span*/}
                                    {/*                className="text-[10px] text-orange-400 font-bold">รอเพื่อนตรวจ...</span>}*/}
                                    {/*        </div>*/}
                                    {/*    )}*/}
                                    {/*</div>*/}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* MODAL สำหรับแสดงรูป */}
            {/*<ImagePreviewModal*/}
            {/*    isOpen={!!previewImage}*/}
            {/*    onClose={() => setPreviewImage(null)}*/}
            {/*    imageUrl={previewImage?.url || ''}*/}
            {/*    title={previewImage?.title || ''}*/}
            {/*    showDownload={previewImage?.showDownload}*/}
            {/*/>*/}
        </>
    );
};

export default BillCard;
