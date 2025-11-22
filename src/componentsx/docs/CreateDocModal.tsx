import React, { useState, useEffect, useRef } from 'react';
import { X, Save, User, FileText, Image as ImageIcon, Trash2, Plus, Tag, Settings2, MinusCircle } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable';

import type { DocType, DocItem } from './types';
import { SortableTag } from './SortableTag';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any, isEdit: boolean) => void;
    existingTags: string[];
    initialData?: DocItem | null;
}

const CreateDocModal: React.FC<Props> = ({ isOpen, onClose, onSave, existingTags, initialData }) => {
    const [type, setType] = useState<DocType>('general');
    const [title, setTitle] = useState('');
    const [detail, setDetail] = useState('');

    // Passport Fields
    const [ppName, setPpName] = useState('');
    const [ppNo, setPpNo] = useState('');
    const [ppExp, setPpExp] = useState('');
    const [ppDob, setPpDob] = useState('');

    // Tags & Image
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [attachedImage, setAttachedImage] = useState<string | null>(null);

    // Local Suggestions (เพื่อให้ลบได้ในหน้านี้)
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isManageTagMode, setIsManageTagMode] = useState(false); // โหมดลบแท็กแนะนำ

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sensors for Drag & Drop
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Load Data
    useEffect(() => {
        if (isOpen) {
            // Load existing tags to local suggestions
            setSuggestions(existingTags.filter(t => t !== '#Passport'));

            if (initialData) {
                // Edit Mode
                setType(initialData.type);
                setTitle(initialData.title);
                setDetail(initialData.detail || '');
                setSelectedTags(initialData.tags);
                setAttachedImage(initialData.attachedImage || null);
                if (initialData.passportData) {
                    setPpName(initialData.passportData.fullName);
                    setPpNo(initialData.passportData.passportNo);
                    setPpExp(initialData.passportData.expiryDate);
                    setPpDob(initialData.passportData.dob);
                }
            } else {
                // Create Mode
                setType('general');
                setTitle('');
                setDetail('');
                setPpName(''); setPpNo(''); setPpExp(''); setPpDob('');
                setSelectedTags([]);
                setAttachedImage(null);
            }
        }
    }, [isOpen, initialData, existingTags]);

    // Auto Add #Passport
    useEffect(() => {
        if (isOpen && type === 'passport') {
            if (!selectedTags.includes('#Passport')) setSelectedTags(prev => ['#Passport', ...prev]);
        }
    }, [type, isOpen]);

    const addTag = (tag: string) => {
        if (!selectedTags.includes(tag)) setSelectedTags(prev => [...prev, tag]);
        setTagInput('');
    };

    const removeSelectedTag = (tag: string) => {
        setSelectedTags(prev => prev.filter(t => t !== tag));
    };

    // ลบแท็กออกจากกล่องแนะนำ (ถาวรเฉพาะใน session นี้)
    const deleteSuggestion = (tagToDelete: string) => {
        setSuggestions(prev => prev.filter(t => t !== tagToDelete));
    };

    const handleTagDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setSelectedTags((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over!.id as string);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            let val = tagInput.trim();
            if (val) {
                if (!val.startsWith('#')) val = '#' + val;
                addTag(val);
            }
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAttachedImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const payload: any = {
            type,
            title,
            tags: selectedTags,
            attachedImage: attachedImage || undefined
        };

        if (type === 'general') payload.detail = detail;
        else payload.passportData = { fullName: ppName, passportNo: ppNo, expiryDate: ppExp, dob: ppDob };

        onSave(payload, !!initialData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{initialData ? 'แก้ไขข้อมูล ✏️' : 'เพิ่มข้อมูลใหม่ 📂'}</h3>
                    <button onClick={onClose} className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200"><X className="w-4 h-4"/></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button type="button" onClick={() => !initialData && setType('general')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${type === 'general' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><FileText className="w-4 h-4"/> โน้ตทั่วไป</button>
                        <button type="button" onClick={() => !initialData && setType('passport')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${type === 'passport' ? 'bg-white shadow text-blue-900' : 'text-gray-500'}`}><User className="w-4 h-4"/> พาสปอร์ต</button>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">{type === 'passport' ? 'ชื่อเจ้าของ' : 'หัวข้อ'} <span className="text-red-500">*</span></label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ระบุชื่อ..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500" autoFocus />
                    </div>

                    {/* PASSPORT FORM */}
                    {type === 'passport' && (
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 space-y-3">
                            <div><label className="block text-[9px] font-bold text-blue-400 mb-1 uppercase">Full Name</label><input type="text" value={ppName} onChange={(e) => setPpName(e.target.value)} className="w-full bg-white border border-blue-200 rounded-lg p-2 text-sm outline-none uppercase" /></div>
                            <div><label className="block text-[9px] font-bold text-blue-400 mb-1 uppercase">No.</label><input type="text" value={ppNo} onChange={(e) => setPpNo(e.target.value)} className="w-full bg-white border border-blue-200 rounded-lg p-2 text-sm font-mono font-bold outline-none uppercase" /></div>
                            <div className="flex gap-2">
                                <div className="w-1/2"><label className="block text-[9px] font-bold text-blue-400 mb-1 uppercase">EXP</label><input type="date" value={ppExp} onChange={(e) => setPpExp(e.target.value)} className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs outline-none" /></div>
                                <div className="w-1/2"><label className="block text-[9px] font-bold text-blue-400 mb-1 uppercase">DOB</label><input type="date" value={ppDob} onChange={(e) => setPpDob(e.target.value)} className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs outline-none" /></div>
                            </div>
                        </div>
                    )}

                    {/* GENERAL FORM */}
                    {type === 'general' && (
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">รายละเอียด</label>
                            <textarea rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none resize-none focus:border-blue-500" />
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">รูปประกอบ</label>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                        {!attachedImage ? (
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-xl p-3 flex items-center justify-center gap-2 text-gray-400 hover:bg-gray-50 hover:border-blue-300 transition-all"><ImageIcon className="w-5 h-5"/><span className="text-xs">อัปโหลดรูป</span></button>
                        ) : (
                            <div className="relative h-32 w-full rounded-xl overflow-hidden border border-gray-200 group"><img src={attachedImage} className="w-full h-full object-cover" /><button type="button" onClick={() => setAttachedImage(null)} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-red-500"><Trash2 className="w-4 h-4"/></button></div>
                        )}
                    </div>

                    {/* TAGS MANAGER (Drag & Drop + Delete) */}
                    {type !== 'passport' && (
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Tags (ลากเพื่อสลับ)</label>
                                {/* ปุ่มเปิดโหมดลบ Suggestions */}
                                <button type="button" onClick={() => setIsManageTagMode(!isManageTagMode)} className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded ${isManageTagMode ? 'bg-red-100 text-red-500 font-bold' : 'text-gray-400 hover:text-gray-600'}`}>
                                    <Settings2 className="w-3 h-3"/> {isManageTagMode ? 'เสร็จสิ้น' : 'แก้ไขตัวเลือก'}
                                </button>
                            </div>

                            {/* Selected Tags (Draggable) */}
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTagDragEnd}>
                                <SortableContext items={selectedTags} strategy={rectSortingStrategy}>
                                    <div className="flex flex-wrap gap-2 mb-3 min-h-[30px] p-1">
                                        {selectedTags.map(tag => (
                                            <SortableTag
                                                key={tag}
                                                tag={tag}
                                                onRemove={removeSelectedTag}
                                                isPassportTag={tag === '#Passport' && type === 'passport'}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>

                            {/* Input */}
                            <div className="flex gap-2 items-center mb-2">
                                <div className="relative flex-1"><Tag className="absolute top-2.5 left-3 w-3 h-3 text-gray-400" /><input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagInputKeyDown} placeholder="พิมพ์แท็กใหม่..." className="w-full bg-white border border-gray-200 rounded-xl pl-8 p-2 text-xs outline-none focus:border-blue-500" /></div>
                                <button type="button" onClick={() => {if(tagInput) addTag(tagInput.startsWith('#')?tagInput:'#'+tagInput)}} className="bg-white border border-gray-200 p-2 rounded-lg text-gray-600 hover:bg-gray-50"><Plus className="w-4 h-4"/></button>
                            </div>

                            {/* Suggestions List */}
                            <div className="flex gap-1 flex-wrap">
                                {suggestions.filter(t => !selectedTags.includes(t)).map(tag => (
                                    <div key={tag} className="relative group">
                                        <button
                                            type="button"
                                            onClick={() => !isManageTagMode && addTag(tag)}
                                            className={`px-2 py-1 rounded-md border text-[10px] transition-all ${isManageTagMode ? 'border-red-200 bg-red-50 text-gray-400' : 'border-gray-200 text-gray-500 hover:bg-white hover:border-blue-300 hover:text-blue-500 bg-white'}`}
                                        >
                                            + {tag}
                                        </button>
                                        {isManageTagMode && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteSuggestion(tag); }}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center"
                                            >
                                                <MinusCircle className="w-2 h-2" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl shadow-lg mt-2">บันทึก</button>
                </form>
            </div>
        </div>
    );
};

export default CreateDocModal;
