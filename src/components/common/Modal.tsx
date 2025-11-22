import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
    const [isRendered, setIsRendered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
            requestAnimationFrame(() => {
                setIsVisible(true);
            });
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => {
                setIsRendered(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isRendered) return null;

    return (
        // Backdrop: Fade In/Out
        <div
            // Lock screen, Z-index สูง
            className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            {/* Backdrop (คลิกเพื่อปิด) */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Panel: Slide Up/Down (FIXED for Full Screen Mobile) */}
            <div
                className={`
          bg-white w-full max-w-md 
          
          /* Mobile Fix: เต็มจอจากล่างขึ้นบน */
          h-full max-h-full rounded-none sm:rounded-[2rem] 
          
          shadow-2xl relative flex flex-col 
          transform transition-transform duration-300 cubic-bezier(0.2, 0.8, 0.2, 1)
          
          /* Animation: สไลด์เต็มจอ */
          ${isVisible
                    ? 'translate-y-0 scale-100' // โชว์
                    : 'translate-y-full sm:translate-y-10 sm:scale-95' // ซ่อน
                }
        `}
            >

                {/* Header */}
                <div className="flex-none px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">{title}</h2>

                    {/* ปุ่มปิด (ลูกศรชี้ลง) */}
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-all active:scale-90 bg-gray-50/50"
                        aria-label="Close Modal"
                    >
                        <ChevronDown className="w-6 h-6" strokeWidth={3} />
                    </button>
                </div>

                {/* Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {children}
                </div>

                {/* Footer (Fixed) */}
                {footer && (
                    <div className="flex-none p-6 pt-4 border-t border-gray-50 bg-white pb-8 sm:pb-6">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
