import React from 'react';
import { X } from 'lucide-react';
import {CloseButton} from "./CloseButton.tsx";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex-none px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                <CloseButton onClick={onClose} />
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {children}
            </div>

            {/* Footer (Optional) */}
            {footer && (
                <div className="flex-none p-5 border-t border-gray-100 bg-white">
                    {footer}
                </div>
            )}
        </div>
    );
};
