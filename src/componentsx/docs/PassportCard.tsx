import React, { useState } from 'react';
import { Copy, Eye, Edit3, Trash2 } from 'lucide-react';
import type { DocItem } from './types';
import ImagePreviewModal from "../bill/ImagePreviewModal.tsx";

interface Props {
    doc: DocItem;
    onEdit: (doc: DocItem) => void;
    onDelete: (id: string) => void;
}

const PassportCard: React.FC<Props> = ({ doc, onEdit, onDelete }) => {
    const data = doc.passportData!;
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleCopyAll = () => {
        const textToCopy = `Name: ${data.fullName}\nNo: ${data.passportNo}\nExp: ${data.expiryDate}\nDOB: ${data.dob}`;
        navigator.clipboard.writeText(textToCopy);
        alert(`คัดลอกข้อมูลของ ${doc.title} แล้ว!`);
    };

    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.title}`;

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-3 flex flex-col relative group">

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <button onClick={() => onEdit(doc)} className="bg-white border border-gray-200 p-1.5 rounded-full text-gray-400 hover:text-blue-500 shadow-sm"><Edit3 className="w-3 h-3" /></button>
                    <button onClick={() => onDelete(doc.id)} className="bg-white border border-gray-200 p-1.5 rounded-full text-gray-400 hover:text-red-500 shadow-sm"><Trash2 className="w-3 h-3" /></button>
                </div>

                <div className="h-1.5 bg-blue-900 w-full"></div>

                <div className="p-4 pb-2 flex gap-3 items-start">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex-shrink-0 overflow-hidden border border-gray-200 mt-1">
                        <img src={avatarUrl} className="w-full h-full object-cover" alt="avatar" />
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                        <h4 className="font-bold text-gray-800 mb-2">{doc.title}</h4>
                        <div className="space-y-1 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <div className="grid grid-cols-[40px_1fr]"><span className="text-gray-400">Name:</span> <span className="font-bold truncate">{data.fullName}</span></div>
                            <div className="grid grid-cols-[40px_1fr]"><span className="text-gray-400">No:</span> <span className="font-mono font-bold text-blue-700">{data.passportNo}</span></div>
                            <div className="flex gap-4">
                                <div className="flex gap-1"><span className="text-gray-400">Exp:</span> <span>{data.expiryDate}</span></div>
                                <div className="flex gap-1"><span className="text-gray-400">DOB:</span> <span>{data.dob}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Image Thumb */}
                    {doc.attachedImage && (
                        <button onClick={() => setIsPreviewOpen(true)} className="w-8 h-8 bg-gray-100 rounded border border-gray-300 overflow-hidden mt-1">
                            <img src={doc.attachedImage} className="w-full h-full object-cover" />
                        </button>
                    )}
                </div>

                <div className="px-4 pb-3 pt-1 flex justify-end">
                    <button onClick={handleCopyAll} className="flex items-center gap-1 text-blue-600 text-[10px] font-bold hover:bg-blue-50 px-2 py-1 rounded transition-colors border border-blue-100">
                        <Copy className="w-3 h-3" /> Copy Data
                    </button>
                </div>
            </div>

            <ImagePreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                imageUrl={doc.attachedImage || ''}
                title={`Passport: ${doc.title}`}
                showDownload={true}
            />
        </>
    );
};

export default PassportCard;
