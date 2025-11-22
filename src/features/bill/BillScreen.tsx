import React, { useState, useMemo } from 'react';
import { Search, LayoutList, Minimize2, Filter } from 'lucide-react';

import BillTabs from './BillTabs';
import BillCard from './BillCard';
import CreateBillFAB from './CreateBillFAB';
import CreateBillModal from './CreateBillModal';
import type { BillItem, Payer } from "../../types/bill.types.ts";
import type {User} from "../../types/user.types.ts";
import { PayerStatus } from '../../enums/bill.enums.ts';


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
    const [editingBill, setEditingBill] = useState<BillItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPerson, setFilterPerson] = useState<string>('ALL');
    const [expandedBillIds, setExpandedBillIds] = useState<string[]>([]);

    const [bills, setBills] = useState<BillItem[]>([
        // ... (ข้อมูล Mock เดิม)
        {
            id: 'b1',
            title: 'ค่าที่พัก Osaka 🏨',
            totalAmount: 12000,
            paymentType: 'QR',
            paymentValue: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PromptPay', // Mock QR จริง
            payerId: 'u1',
            createdAt: Date.now(),
            isCompleted: false,
            debtors: [
                { userId: 'u1', amount: 3000, status: PayerStatus.VERIFIED }, // ตัวเอง จ่ายแล้วเสมอ
                { userId: 'u3', amount: 3000, status: PayerStatus.SLIP_SENT, slipUrl: 'https://via.placeholder.com/300x500?text=Slip+Image' },
                { userId: 'u4', amount: 3000, status: PayerStatus.UNPAID },
                { userId: 'u5', amount: 3000, status: PayerStatus.VERIFIED },
            ]
        }
    ]);

    const handleSaveBill = (data: any, isEdit: boolean) => {
        // คำนวณหารยาว
        // data.debtors คือ array ของ userIds ที่ถูกเลือก
        // สูตร: ยอดรวม / จำนวนคนหาร (รวมคนจ่ายด้วยไหม? ในที่นี้สมมติว่า selectedUserIds คือทุกคนที่ต้องหาร)
        const amountPerHead = data.totalAmount / data.debtors.length;

        const createPayerList = (userIds: string[], existingDebtors: Payer[] = []): Payer[] => {
            return userIds.map(uid => {
                const existing = existingDebtors.find(d => d.userId === uid);

                // ✨ LOGIC ใหม่: ถ้าเป็นคนสร้างบิล (Me / u1) ให้ถือว่าจ่ายแล้ว (VERIFIED) ทันที
                // หรือถ้ามีสถานะเดิมอยู่แล้วก็ใช้สถานะเดิม
                let status: PayerStatus = existing ? existing.status : PayerStatus.UNPAID;
                if (uid === 'u1') status = PayerStatus.VERIFIED; // <-- AUTO VERIFY MYSELF

                return {
                    userId: uid,
                    amount: amountPerHead,
                    status: status,
                    slipUrl: existing?.slipUrl
                };
            });
        };

        if (isEdit && editingBill) {
            setBills(prev => prev.map(b => {
                if (b.id !== editingBill.id) return b;
                return {
                    ...b,
                    title: data.title,
                    totalAmount: data.totalAmount,
                    paymentType: data.paymentType,
                    paymentValue: data.paymentValue,
                    debtors: createPayerList(data.debtors, b.debtors)
                };
            }));
        } else {
            const newBill: BillItem = {
                id: Date.now().toString(),
                title: data.title,
                totalAmount: data.totalAmount,
                paymentType: data.paymentType,
                paymentValue: data.paymentValue,
                payerId: 'u1',
                debtors: createPayerList(data.debtors),
                createdAt: Date.now(),
                isCompleted: false
            };
            setBills(prev => [newBill, ...prev]);
            setExpandedBillIds(prev => [...prev, newBill.id]);
        }
        setIsModalOpen(false);
        setEditingBill(null);
    };

    // ... (ฟังก์ชันอื่นเหมือนเดิม handleVerifySlip, handleUploadSlip, etc.)
    const handleVerifySlip = (billId: string, payerId: string, isApproved: boolean) => {
        setBills(prev => prev.map(b => {
            if (b.id !== billId) return b;
            const newDebtors = b.debtors.map(d => d.userId === payerId ? { ...d, status: (isApproved ? 'VERIFIED' : 'REJECTED') as PayerStatus } : d);
            const allPaid = newDebtors.every(d => d.status === 'VERIFIED');
            return { ...b, debtors: newDebtors, isCompleted: allPaid };
        }));
    };

    const handleUploadSlip = (billId: string, file: File) => {
        const fakeUrl = URL.createObjectURL(file);
        setBills(prev => prev.map(b => {
            if (b.id !== billId) return b;
            const newDebtors = b.debtors.map(d => {
                if (d.userId !== 'u1') return d;
                return { ...d, status: 'SLIP_SENT' as PayerStatus, slipUrl: fakeUrl };
            });
            return { ...b, debtors: newDebtors };
        }));
    };

    const handleEditBill = (bill: BillItem) => { setEditingBill(bill); setIsModalOpen(true); };
    const toggleExpand = (id: string) => { setExpandedBillIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); };
    const handleExpandAll = () => { if (expandedBillIds.length === filteredBills.length) setExpandedBillIds([]); else setExpandedBillIds(filteredBills.map(b => b.id)); };

    const filteredBills = useMemo(() => {
        return bills.filter(b => {
            if (currentTab === 'ACTIVE' && b.isCompleted) return false;
            if (currentTab === 'HISTORY' && !b.isCompleted) return false;
            if (!b.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (filterPerson !== 'ALL') {
                const isDebtor = b.debtors.some(d => d.userId === filterPerson && d.status !== 'VERIFIED');
                if (!isDebtor) return false;
            }
            return true;
        });
    }, [bills, currentTab, searchTerm, filterPerson]);

    return (
        <div className="h-full flex flex-col bg-F3F4F6 relative">
            <div className="flex-none p-4 pb-2 bg-F3F4F6 z-10">
                <BillTabs currentTab={currentTab} onTabChange={setCurrentTab} />
                <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="ค้นหาบิล..." className="w-full bg-white border border-gray-200 pl-9 pr-3 py-2 rounded-xl text-xs outline-none focus:border-blue-500"/>
                    </div>
                    <div className="relative">
                        <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)} className="appearance-none bg-white border border-gray-200 text-gray-600 text-xs font-bold py-2 pl-3 pr-8 rounded-xl outline-none focus:border-blue-500">
                            <option value="ALL">ทุกคน</option>
                            {USERS.map(u => u.id !== 'u1' && <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                        <Filter className="absolute top-2.5 right-2.5 w-3 h-3 text-gray-400 pointer-events-none"/>
                    </div>
                    <button onClick={handleExpandAll} className="bg-white border border-gray-200 w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50">
                        {expandedBillIds.length === filteredBills.length && filteredBills.length > 0 ? <Minimize2 className="w-4 h-4"/> : <LayoutList className="w-4 h-4"/>}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24 min-h-0">
                <div className="space-y-1">
                    {filteredBills.map(bill => (
                        <BillCard
                            key={bill.id}
                            bill={bill}
                            currentUser={USERS[0]}
                            allUsers={USERS}
                            isOpen={expandedBillIds.includes(bill.id)}
                            onToggle={() => toggleExpand(bill.id)}
                            onVerifySlip={handleVerifySlip}
                            onUploadSlip={handleUploadSlip}
                            onEdit={() => handleEditBill(bill)}
                        />
                    ))}
                    {filteredBills.length === 0 && <div className="text-center py-12 text-gray-400 text-xs">{currentTab === 'ACTIVE' ? 'ไม่มีบิลรอเก็บ 🎉' : 'ยังไม่มีประวัติ'}</div>}
                </div>
            </div>

            <CreateBillFAB onClick={() => { setEditingBill(null); setIsModalOpen(true); }} />

            <CreateBillModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                users={USERS}
                currentUser={USERS[0]}
                onSave={handleSaveBill}
                initialData={editingBill}
            />
        </div>
    );
};

export default BillScreen;
