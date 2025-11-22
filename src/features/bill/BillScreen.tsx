import React, { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';

// Import Types (แบบ Type-Only Import)
import type { Bill } from '../../types/bill.types';
import type { User } from '../../types/user.types';

// Import Enums (แบบ Value Import)
import { PayerStatus, PaymentMethod } from '../../enums/bill.enums';

// Import Components
import { CreateBillModal } from './CreateBillModal';
import { BillCard } from './BillCard'; // สมมติว่าแยก Card ออกมาด้วย

export const BillScreen: React.FC = () => {
    // ใช้ Enum ใน State หรือ Logic
    const [bills, setBills] = useState<Bill[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreate = (data: any) => {
        const amountPerHead = data.totalAmount / 2;

        const newBill: Bill = {
            id: Date.now().toString(),
            title: data.title,
            totalAmount: Number(data.amount),
            paymentType: PaymentMethod.QR, // ใช้ Enum Value
            payerId: 'me',
            debtors: [{
                userId: 'friend',
                amount: amountPerHead,
                status: PayerStatus.UNPAID // ใช้ Enum Value
            }],
            createdAt: Date.now(),
            isCompleted: false
        };
        setBills(prev => [newBill, ...prev]);
        setIsModalOpen(false);
    };

    return (
        <div className="flex flex-col h-full">
            {/* List Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 pb-24">
                {bills.length === 0 ? (
                    <div className="text-center py-12 text-gray-300 flex flex-col items-center">
                        <Receipt className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-xs">ยังไม่มีบิลเรียกเก็บ</p>
                    </div>
                ) : (
                    // Render Bills...
                    bills.map(bill => <BillCard key={bill.id} bill={bill} />)
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all z-30"
            >
                <Plus className="w-8 h-8" />
            </button>

            <CreateBillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleCreate} />
        </div>
    );
};
