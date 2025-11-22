import React, { useState, useMemo } from 'react';
import { ArrowDownWideNarrow } from 'lucide-react';
import DonutChart from './DonutChart';
import ExpenseHistory from './ExpenseHistory';
import CreateExpenseFAB from './CreateExpenseFAB';
import AddExpenseModal from './AddExpenseModal';
import { CATEGORIES } from './types';
import type { ExpenseItem, CategoryType } from './types';

const CostScreen: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'ALL' | CategoryType>('ALL');

    // Mock Data
    const [expenses, setExpenses] = useState<ExpenseItem[]>([
        { id: '1', title: 'ตั๋วเครื่องบิน', amount: 12000, category: 'transport', date: '20 Dec' },
        { id: '2', title: 'โรงแรมคืนแรก', amount: 3500, category: 'stay', date: '20 Dec' },
        { id: '3', title: 'ซูชิสายพาน', amount: 1200, category: 'food', date: '21 Dec' },
    ]);

    // --- ACTIONS ---
    const handleSaveExpense = (data: { title: string; amount: number; category: CategoryType }, isEdit: boolean) => {
        if (isEdit && editingId) {
            setExpenses(prev => prev.map(e => e.id === editingId ? { ...e, ...data } : e));
        } else {
            const newExpense: ExpenseItem = {
                id: Date.now().toString(),
                ...data,
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
            };
            setExpenses(prev => [newExpense, ...prev]);
        }
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleDeleteExpense = (id: string) => {
        if(confirm('ลบรายการนี้?')) {
            setExpenses(prev => prev.filter(e => e.id !== id));
        }
    };

    const openEdit = (id: string) => {
        setEditingId(id);
        setIsModalOpen(true);
    };

    const openCreate = () => {
        setEditingId(null);
        setIsModalOpen(true);
    };

    // --- FILTER & SORT ---
    const displayExpenses = useMemo(() => {
        let result = [...expenses];
        if (activeFilter !== 'ALL') {
            result = result.filter(e => e.category === activeFilter);
        }
        result.sort((a, b) => b.amount - a.amount);
        return result;
    }, [expenses, activeFilter]);

    // หาข้อมูลที่จะแก้
    const editingData = expenses.find(e => e.id === editingId);

    return (
        <div className="h-full flex flex-col bg-F3F4F6 relative">

            {/* Header */}
            <div className="flex-none p-4 pb-2 z-10 bg-F3F4F6">
                <DonutChart expenses={expenses} />

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button onClick={() => setActiveFilter('ALL')} className={`px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all ${activeFilter === 'ALL' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200'}`}>ทั้งหมด</button>
                    {(Object.keys(CATEGORIES) as CategoryType[]).map(cat => (
                        <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all flex items-center gap-1 ${activeFilter === cat ? 'bg-white text-gray-800 border-blue-500 ring-1 ring-blue-500' : 'bg-white text-gray-500 border-gray-200'}`}>
                            {CATEGORIES[cat].label}
                        </button>
                    ))}
                </div>

                <div className="flex justify-between items-end mt-2 px-1">
                    <h3 className="font-bold text-gray-700 text-sm">ประวัติการใช้จ่าย 🧾</h3>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1"><ArrowDownWideNarrow className="w-3 h-3"/> เรียง มากไปน้อย</div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24">
                <ExpenseHistory
                    expenses={displayExpenses}
                    onDelete={handleDeleteExpense}
                    onEdit={openEdit} // ส่งฟังก์ชันแก้เข้าไปแล้ว!
                />
            </div>

            <CreateExpenseFAB onClick={openCreate} />

            <AddExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveExpense}
                initialData={editingData}
            />
        </div>
    );
};

export default CostScreen;
