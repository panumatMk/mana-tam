import React, { useState, useMemo } from 'react';
import { Search, LayoutList, Minimize2, Filter } from 'lucide-react';
import BillTabs from './BillTabs';
import BillCard from './BillCard';
import CreateBillFAB from './CreateBillFAB';
import CreateBillModal from './CreateBillModal';
import type { BillItem, User, Payer } from './types';

// --- Mock Data ---
const USERS: User[] = [
    { id: 'u1', name: 'Me', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { id: 'u2', name: 'Jane', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
    { id: 'u3', name: 'Max', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max' },
    { id: 'u4', name: 'Bob', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
    { id: 'u5', name: 'Alice', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
];

const BillScreen: React.FC = () => {
    const [currentTab, setCurrentTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPerson, setFilterPerson] = useState<string>('ALL'); // Filter by debtor

    // State for Collapse/Expand All
    const [expandedBillIds, setExpandedBillIds] = useState<string[]>([]);

    const [bills, setBills] = useState<BillItem[]>([
        {
            id: 'b1',
            title: 'ค่าที่พัก Osaka 🏨',
            totalAmount: 12000,
            paymentType: 'QR',
            paymentValue: '',
            payerId: 'u1',
            createdAt: Date.now(),
            isCompleted: false,
            debtors: [
                { userId: 'u2', amount: 3000, status: 'SLIP_SENT' },
                { userId: 'u3', amount: 3000, status: 'UNPAID' },
                { userId: 'u4', amount: 3000, status: 'UNPAID' },
                { userId: 'u5', amount: 3000, status: 'VERIFIED' },
            ]
        }
    ]);

    // --- Logic ---

    const handleCreateBill = (data: any) => {
        const payers: Payer[] = data.debtors.map((uid: string) => ({
            userId: uid,
            amount: data.totalAmount / (data.debtors.length + 1), // หารรวมตัวเองด้วย (Mock logic)
            status: 'UNPAID'
        }));

        const newBill: BillItem = {
            id: Date.now().toString(),
            title: data.title,
            totalAmount: data.totalAmount,
            paymentType: data.paymentType,
            paymentValue: data.paymentValue,
            payerId: 'u1',
            debtors: payers,
            createdAt: Date.now(),
            isCompleted: false
        };
        setBills(prev => [newBill, ...prev]);
        // Auto expand new bill
        setExpandedBillIds(prev => [...prev, newBill.id]);
    };

    const handleVerifySlip = (billId: string, payerId: string) => {
        setBills(prev => prev.map(b => {
            if (b.id !== billId) return b;

            const newDebtors = b.debtors.map(d => d.userId === payerId ? { ...d, status: 'VERIFIED' as const } : d);

            // Check if all verified
            const allPaid = newDebtors.every(d => d.status === 'VERIFIED');

            return { ...b, debtors: newDebtors, isCompleted: allPaid };
        }));
    };

    const toggleExpand = (id: string) => {
        setExpandedBillIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleExpandAll = () => {
        if (expandedBillIds.length === filteredBills.length) {
            setExpandedBillIds([]); // Collapse All
        } else {
            setExpandedBillIds(filteredBills.map(b => b.id)); // Expand All
        }
    };

    // --- Filter Logic ---
    const filteredBills = useMemo(() => {
        return bills.filter(b => {
            // 1. Tab Filter
            if (currentTab === 'ACTIVE' && b.isCompleted) return false;
            if (currentTab === 'HISTORY' && !b.isCompleted) return false;

            // 2. Search
            if (!b.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;

            // 3. Person Filter (ดูว่าคนนี้ติดเงินในบิลนี้ไหม)
            if (filterPerson !== 'ALL') {
                const isDebtor = b.debtors.some(d => d.userId === filterPerson && d.status !== 'VERIFIED');
                if (!isDebtor) return false;
            }

            return true;
        });
    }, [bills, currentTab, searchTerm, filterPerson]);

    return (
        <div className="p-4 pt-2 pb-24 min-h-full bg-F3F4F6 relative">

            {/* Tabs */}
            <BillTabs currentTab={currentTab} onTabChange={setCurrentTab} />

            {/* Search & Tools */}
            <div className="flex gap-2 mb-4">
                {/* Search Box */}
                <div className="flex-1 relative">
                    <Search className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ค้นหาบิล..."
                        className="w-full bg-white border border-gray-200 pl-9 pr-3 py-2 rounded-xl text-xs outline-none focus:border-blue-500"
                    />
                </div>

                {/* Person Filter Dropdown */}
                <div className="relative">
                    <select
                        value={filterPerson}
                        onChange={(e) => setFilterPerson(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 text-gray-600 text-xs font-bold py-2 pl-3 pr-8 rounded-xl outline-none focus:border-blue-500"
                    >
                        <option value="ALL">ทุกคน</option>
                        {USERS.map(u => u.id !== 'u1' && <option key={u.id} value={u.id}>{u.name} ค้างจ่าย</option>)}
                    </select>
                    <Filter className="absolute top-2.5 right-2.5 w-3 h-3 text-gray-400 pointer-events-none"/>
                </div>

                {/* Expand/Collapse All Button */}
                <button
                    onClick={handleExpandAll}
                    className="bg-white border border-gray-200 w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50"
                >
                    {expandedBillIds.length === filteredBills.length ? <Minimize2 className="w-4 h-4"/> : <LayoutList className="w-4 h-4"/>}
                </button>
            </div>

            {/* Bill List */}
            <div className="space-y-1">
                {filteredBills.map(bill => (
                    <BillCard
                        key={bill.id}
                        bill={bill}
                        allUsers={USERS}
                        isOpen={expandedBillIds.includes(bill.id)}
                        onToggle={() => toggleExpand(bill.id)}
                        onVerifySlip={handleVerifySlip}
                    />
                ))}
                {filteredBills.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-xs">
                        {currentTab === 'ACTIVE' ? 'ไม่มีบิลรอเก็บ 🎉' : 'ยังไม่มีประวัติ'}
                    </div>
                )}
            </div>

            <CreateBillFAB onClick={() => setIsModalOpen(true)} />

            <CreateBillModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                users={USERS}
                currentUser={USERS[0]}
                onSave={handleCreateBill}
            />

        </div>
    );
};

export default BillScreen;
