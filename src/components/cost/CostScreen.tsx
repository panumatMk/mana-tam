import React, { useState } from 'react';
import DonutChart from './DonutChart';
import ExpenseHistory from './ExpenseHistory';
import CreateExpenseFAB from './CreateExpenseFAB';
import AddExpenseModal from './AddExpenseModal';
import type { ExpenseItem, CategoryType } from './types';

const CostScreen: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock Data
    const [expenses, setExpenses] = useState<ExpenseItem[]>([
        { id: '1', title: 'ตั๋วเครื่องบิน', amount: 12000, category: 'transport', date: '20 Dec' },
        { id: '2', title: 'โรงแรมคืนแรก', amount: 3500, category: 'stay', date: '20 Dec' },
        { id: '3', title: 'ซูชิสายพาน', amount: 1200, category: 'food', date: '21 Dec' },
        { id: '4', title: 'ของฝาก', amount: 5000, category: 'shopping', date: '22 Dec' },
    ]);

    const handleAddExpense = (title: string, amount: number, category: CategoryType) => {
        const newExpense: ExpenseItem = {
            id: Date.now().toString(),
            title,
            amount,
            category,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        };
        setExpenses(prev => [newExpense, ...prev]);
    };

    const handleDeleteExpense = (id: string) => {
        if(confirm('ลบรายการนี้?')) {
            setExpenses(prev => prev.filter(e => e.id !== id));
        }
    };

    return (
        <div className="p-4 pt-2 pb-24 min-h-full bg-F3F4F6 relative">

            {/* Chart Section */}
            <DonutChart expenses={expenses} />

            {/* List Section */}
            <ExpenseHistory expenses={expenses} onDelete={handleDeleteExpense} />

            {/* FAB */}
            <CreateExpenseFAB onClick={() => setIsModalOpen(true)} />

            {/* Modal */}
            <AddExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddExpense}
            />

        </div>
    );
};

export default CostScreen;
