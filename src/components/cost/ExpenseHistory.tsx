import React from 'react';
import { Trash2 } from 'lucide-react';
import type { ExpenseItem } from './types';
import { CATEGORIES } from './types'

interface Props {
    expenses: ExpenseItem[];
    onDelete: (id: string) => void;
}

const ExpenseHistory: React.FC<Props> = ({ expenses, onDelete }) => {
    return (
        <div className="space-y-3 pb-20">
            <h3 className="font-bold text-gray-700 ml-1 text-sm">ประวัติการใช้จ่าย 🧾</h3>

            {expenses.length === 0 ? (
                <div className="text-center py-10 text-gray-300 text-xs">ยังไม่มีรายการใช้จ่าย</div>
            ) : (
                expenses.map((item) => {
                    const cat = CATEGORIES[item.category];
                    return (
                        <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group">
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
                                <button onClick={() => onDelete(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
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
