import React from 'react';
import { X, Download } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    title: string;
    showDownload?: boolean;
}

const ImagePreviewModal: React.FC<Props> = ({ isOpen, onClose, imageUrl, title, showDownload = false }) => {
    if (!isOpen) return null;

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${title}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white/80 hover:text-white p-2"
                >
                    <X className="w-8 h-8" />
                </button>

                {/* Image Container */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">{title}</h3>
                        {showDownload && (
                            <button
                                onClick={handleDownload}
                                className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 hover:bg-blue-100"
                            >
                                <Download className="w-3 h-3" /> บันทึกรูป
                            </button>
                        )}
                    </div>

                    <div className="p-1 bg-gray-100">
                        <img src={imageUrl} alt={title} className="w-full h-auto object-contain max-h-[60vh]" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ImagePreviewModal;
