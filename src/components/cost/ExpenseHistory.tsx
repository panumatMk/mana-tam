import React from 'react';
import { Trash2 } from 'lucide-react';
import type { ExpenseItem, CategoryType } from './types';
import { CATEGORIES } from './types';

interface Props {
    expenses: ExpenseItem[];
    onDelete: (id: string) => void;
    onEdit: (id: string) => void; // เพิ่ม Props สำหรับแก้ไข
}

const ExpenseHistory: React.FC<Props> = ({ expenses, onDelete, onEdit }) => {
    return (
        <div className="space-y-3 pb-20">
            {expenses.length === 0 ? (
                <div className="text-center py-10 text-gray-300 text-xs">ยังไม่มีรายการใช้จ่าย</div>
            ) : (
                expenses.map((item) => {
                    // 🛡️ กันเหนียว: ถ้าหมวดหมู่ผิด หรือไม่มี ให้ใช้ 'other' แทน
                    const safeCategory = CATEGORIES[item.category] ? item.category : 'other';
                    const cat = CATEGORIES[safeCategory as CategoryType];

                    return (
                        <div
                            key={item.id}
                            onClick={() => onEdit(item.id)} // เพิ่ม onClick เพื่อแก้ไข
                            className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-transform cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                {/* Icon Box */}
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: cat.color }}>
                                    <cat.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                                    <span className="text-[10px] text-gray-400">{item.date} • {cat.label}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-800">- {item.amount.toLocaleString()}</span>
                                {/* ปุ่มลบต้องมี stopPropagation ไม่งั้นมันจะเด้ง Modal แก้ไขด้วย */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default ExpenseHistory;
