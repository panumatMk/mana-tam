import React, { useState, useEffect } from 'react';
import { Save, Plus, X, MapPin, Link as LinkIcon, Trash2 } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import type { LinkItem } from '../../types/plan.types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
}

export const ActivityModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
    const [time, setTime] = useState('08:00'); // Default 08:00
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');

    // Multiple Links State
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [newLinkType, setNewLinkType] = useState<'url' | 'map'>('map');

    // Reset or Load Data
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTime(initialData.time);
                setTitle(initialData.title);
                setNote(initialData.note || '');
                setLinks(initialData.links || []);
            } else {
                setTime('08:00'); setTitle(''); setNote(''); setLinks([]); setNewLinkUrl('');
            }
        }
    }, [isOpen, initialData]);

    const handleAddLink = () => {
        if (!newLinkUrl.trim()) return;
        setLinks([...links, { type: newLinkType, url: newLinkUrl, title: newLinkType === 'map' ? 'Map' : 'Link' }]);
        setNewLinkUrl('');
    };

    const handleRemoveLink = (index: number) => {
        setLinks(prev => prev.filter((_, i) => i !== index));
    };

    const footerContent = (
        <button
            onClick={() => { if(title) onSave({time, title, note, links}); }}
            className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-green-700"
        >
            <Save className="w-5 h-5" /> บันทึกกิจกรรม
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="เพิ่มกิจกรรมใหม่" footer={footerContent}>
            <div className="space-y-5">

                {/* Time & Title Row */}
                <div>
                    <div >
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">เวลา</label>
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-bold text-center outline-none focus:ring-2 ring-green-500/20 focus:bg-white transition-all" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">กิจกรรม <span className="text-red-500">*</span></label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white border-2 border-gray-100 p-3 rounded-xl font-bold outline-none focus:border-green-500 transition-all" placeholder="ทำอะไรดี?" autoFocus />
                    </div>
                </div>

                {/* Note */}
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">รายละเอียด</label>
                    <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} className="w-full bg-gray-50 border-none p-3 rounded-xl text-sm outline-none focus:ring-2 ring-green-500/20 resize-none placeholder-gray-300" placeholder="Note..."></textarea>
                </div>

                {/* Multiple Links Section */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                    <label className="block text-[10px] font-bold text-blue-400 mb-2 uppercase">แนบลิงก์ / แผนที่</label>

                    {/* List of added links */}
                    {links.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {links.map((l, i) => (
                                <div key={i} className="flex items-center gap-1 bg-white border border-blue-100 px-2 py-1.5 rounded-lg text-xs text-gray-600 shadow-sm">
                                    {l.type === 'map' ? <MapPin className="w-3 h-3 text-red-500"/> : <LinkIcon className="w-3 h-3 text-blue-500"/>}
                                    <span className="max-w-[120px] truncate font-medium">{l.url}</span>
                                    <button onClick={() => handleRemoveLink(i)} className="text-gray-300 hover:text-red-500 ml-1 p-0.5 rounded hover:bg-red-50"><X className="w-3 h-3"/></button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Link Input */}
                    <div className="flex gap-2">
                        <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                            <button onClick={() => setNewLinkType('map')} className={`p-2 rounded-md transition-all ${newLinkType === 'map' ? 'bg-red-50 text-red-500 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}><MapPin className="w-4 h-4"/></button>
                            <button onClick={() => setNewLinkType('url')} className={`p-2 rounded-md transition-all ${newLinkType === 'url' ? 'bg-blue-50 text-blue-500 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}><LinkIcon className="w-4 h-4"/></button>
                        </div>
                        <input
                            type="text"
                            value={newLinkUrl}
                            onChange={e => setNewLinkUrl(e.target.value)}
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-3 text-xs outline-none focus:border-green-500 shadow-sm"
                            placeholder={newLinkType === 'map' ? "Google Maps URL..." : "Link URL..."}
                        />
                        <button onClick={handleAddLink} className="bg-gray-800 text-white p-2.5 rounded-lg hover:bg-black shadow-md active:scale-95 transition-transform"><Plus className="w-4 h-4"/></button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
