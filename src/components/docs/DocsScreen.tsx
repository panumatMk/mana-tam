import React, { useState, useMemo, useEffect } from 'react';
import { Search, CheckSquare, User, Layers, Settings2, XCircle } from 'lucide-react';
import ChecklistPanel from './ChecklistPanel';
import PassportCard from './PassportCard';
import GeneralDocCard from './GeneralDocCard';
import CreateDocFAB from './CreateDocFAB';
import CreateDocModal from './CreateDocModal'; // ต้อง Import Modal มาใช้
import type { DocItem } from './types';
import { MOCK_DOCS } from './types';

const DocsScreen: React.FC = () => {
    const [docs, setDocs] = useState<DocItem[]>(MOCK_DOCS);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<string>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<DocItem | null>(null);

    // Tag Management State
    const [savedTags, setSavedTags] = useState<string[]>(['#Transport', '#Hotel', '#Ticket']);
    const [isManageTagMode, setIsManageTagMode] = useState(false);

    // --- SYNC TAGS ---
    useEffect(() => {
        const usedTags = new Set<string>();
        docs.forEach(d => d.tags.forEach(t => {
            if(t !== '#Passport') usedTags.add(t);
        }));

        setSavedTags(prev => {
            const newTags = Array.from(usedTags).filter(t => !prev.includes(t));
            return [...prev, ...newTags];
        });
    }, [docs]);

    // --- ACTIONS ---
    const handleSaveDoc = (data: any, isEdit: boolean) => {
        if (isEdit && editingDoc) {
            setDocs(prev => prev.map(d => d.id === editingDoc.id ? { ...d, ...data } : d));
        } else {
            const newDoc: DocItem = {
                id: Date.now().toString(),
                ...data,
                passportData: data.type === 'passport' ? data.passportData : undefined
            };
            setDocs(prev => [newDoc, ...prev]);
        }
        setIsModalOpen(false);
        setEditingDoc(null);
    };

    const handleDeleteDoc = (id: string) => {
        if (confirm('ลบข้อมูลนี้?')) setDocs(prev => prev.filter(d => d.id !== id));
    };

    const handleEditDoc = (doc: DocItem) => {
        setEditingDoc(doc);
        setIsModalOpen(true);
    };

    const handleDeleteTag = (tagToDelete: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const isInUse = docs.some(d => d.tags.includes(tagToDelete));
        if (isInUse) {
            alert(`❌ ลบไม่ได้!\nแท็ก "${tagToDelete}" ยังถูกใช้อยู่`);
        } else {
            if(confirm(`ยืนยันลบแท็ก "${tagToDelete}"?`)) {
                setSavedTags(prev => prev.filter(t => t !== tagToDelete));
            }
        }
    };

    // --- FILTER ---
    const filteredDocs = docs.filter(d => {
        if (activeFilter === 'CHECKLIST') return false;

        const matchSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || d.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchTag = activeFilter === 'ALL' || activeFilter === '#Passport' ? d.tags.includes('#Passport') : d.tags.includes(activeFilter);

        if (activeFilter === 'ALL') return matchSearch;
        if (activeFilter === '#Passport') return matchSearch && d.type === 'passport';

        return matchSearch && matchTag;
    });

    return (
        <div className="h-full flex flex-col bg-F3F4F6 relative">

            {/* HEADER */}
            <div className="flex-none p-4 pb-2 bg-F3F4F6 z-10 space-y-3">
                <div className="relative">
                    <Search className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ค้นหา..."
                        className="w-full bg-white border border-gray-200 pl-9 pr-3 py-2 rounded-xl text-xs outline-none focus:border-yellow-500"
                    />
                </div>

                <div className="flex gap-2 items-center">
                    <button onClick={() => setIsManageTagMode(!isManageTagMode)} className={`p-2 rounded-lg border transition-colors flex-shrink-0 ${isManageTagMode ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-400 border-gray-200'}`}>
                        <Settings2 className="w-4 h-4" />
                    </button>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 flex-1">
                        <button onClick={() => setActiveFilter('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border whitespace-nowrap flex items-center gap-1 transition-all ${activeFilter === 'ALL' ? 'bg-black text-white border-black shadow-lg ring-2 ring-black/20' : 'bg-white text-gray-500 border-gray-200'}`}>
                            <Layers className="w-3 h-3"/> รวมทุกอย่าง
                        </button>
                        <button onClick={() => setActiveFilter('CHECKLIST')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border whitespace-nowrap flex items-center gap-1 transition-all ${activeFilter === 'CHECKLIST' ? 'bg-yellow-400 text-white border-yellow-400 shadow-md' : 'bg-white text-gray-500 border-gray-200'}`}>
                            <CheckSquare className="w-3 h-3"/> สิ่งที่ต้องเตรียม
                        </button>
                        <button onClick={() => setActiveFilter('#Passport')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border whitespace-nowrap flex items-center gap-1 transition-all ${activeFilter === '#Passport' ? 'bg-blue-900 text-white border-blue-900 shadow-md' : 'bg-white text-gray-500 border-gray-200'}`}>
                            <User className="w-3 h-3"/> พาสปอร์ต
                        </button>
                        {savedTags.map(tag => (
                            <button key={tag} onClick={() => !isManageTagMode && setActiveFilter(tag)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border whitespace-nowrap flex items-center gap-1 transition-all ${activeFilter === tag ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'bg-white text-gray-500 border-gray-200'} ${isManageTagMode ? 'pr-1 border-red-200 bg-red-50 text-red-500 cursor-default' : ''}`}>
                                {tag}
                                {isManageTagMode && <div onClick={(e) => handleDeleteTag(tag, e)} className="p-1 hover:bg-red-200 rounded-full cursor-pointer"><XCircle className="w-3 h-3" /></div>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24">
                {(activeFilter === 'ALL' || activeFilter === 'CHECKLIST') && (
                    <div className="mb-4 animate-fade-in">
                        {activeFilter === 'ALL' && <div className="text-xs font-bold text-gray-400 mb-2 ml-1 uppercase tracking-wider">1. เตรียมตัว</div>}
                        <ChecklistPanel />
                    </div>
                )}

                {activeFilter !== 'CHECKLIST' && (
                    <div className="space-y-3 animate-fade-in">
                        {activeFilter === 'ALL' && filteredDocs.length > 0 && <div className="text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">2. เอกสาร & โน้ต</div>}

                        {filteredDocs.map(doc => (
                            doc.type === 'passport'
                                ? <PassportCard key={doc.id} doc={doc} onEdit={handleEditDoc} onDelete={handleDeleteDoc} />
                                : <GeneralDocCard key={doc.id} doc={doc} onEdit={handleEditDoc} onDelete={handleDeleteDoc} />
                        ))}

                        {filteredDocs.length === 0 && activeFilter !== 'ALL' && (
                            <div className="text-center py-12 text-gray-300 text-xs flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">📂</div>
                                ไม่พบเอกสาร
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ปุ่มบวก + Modal */}
            <CreateDocFAB onClick={() => { setEditingDoc(null); setIsModalOpen(true); }} />

            <CreateDocModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDoc}
                existingTags={savedTags}
                initialData={editingDoc}
            />

        </div>
    );
};

export default DocsScreen;
