import React, { useState } from 'react';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import type { ChecklistItem } from './types';

const ChecklistPanel: React.FC = () => {
    const [items, setItems] = useState<ChecklistItem[]>([
        { id: '1', text: 'พาสปอร์ต 🛂', checked: false },
        { id: '2', text: 'ยาแก้แพ้ / ยาประจำตัว 💊', checked: false },
        { id: '3', text: 'SIM Card / Pocket WiFi 📶', checked: true },
    ]);
    const [newItem, setNewItem] = useState('');

    const toggleCheck = (id: string) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    };

    const addItem = () => {
        if (!newItem.trim()) return;
        setItems(prev => [{ id: Date.now().toString(), text: newItem, checked: false }, ...prev]);
        setNewItem('');
    };

    const deleteItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    return (
        <div className="bg-yellow-100 rounded-xl shadow-md p-5 border-t-8 border-yellow-200 relative overflow-hidden mb-6 transform -rotate-1 transition-transform hover:rotate-0">
            {/* Tape Effect */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-yellow-200/50 rotate-2"></div>

            <h3 className="font-bold text-yellow-800 text-lg mb-3 flex items-center gap-2" style={{ fontFamily: 'cursive' }}>
                📝 สิ่งที่ต้องเตรียม
            </h3>

            {/* Input */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="เพิ่มรายการ..."
                    className="flex-1 bg-white/60 border-b-2 border-yellow-300 px-2 py-1 text-sm outline-none focus:bg-white transition-colors placeholder-yellow-600/50"
                />
                <button onClick={addItem} className="text-yellow-700 hover:text-yellow-900 bg-yellow-300/50 p-1 rounded-full">
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between group">
                        <div
                            onClick={() => toggleCheck(item.id)}
                            className={`flex items-center gap-2 cursor-pointer transition-all ${item.checked ? 'opacity-50 line-through text-yellow-700' : 'text-gray-800'}`}
                        >
                            {item.checked ? <CheckSquare className="w-4 h-4 text-yellow-600"/> : <Square className="w-4 h-4 text-yellow-600"/>}
                            <span className="text-sm font-medium">{item.text}</span>
                        </div>
                        <button onClick={() => deleteItem(item.id)} className="text-yellow-600/0 group-hover:text-yellow-600/100 transition-opacity">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChecklistPanel;
