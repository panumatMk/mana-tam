import React, { useState, useMemo } from 'react';
import { Search, LayoutList, Minimize2, Filter } from 'lucide-react';

import BillTabs from './BillTabs';
import BillCard from './BillCard';
import CreateBillFAB from './CreateBillFAB';
import CreateBillModal from './CreateBillModal';
import ConfirmModal from '../../components/common/ConfirmModal'; // Import ConfirmModal

import type { BillItem, Payer } from "../../types/bill.types.ts";
import { PayerStatus } from '../../enums/bill.enums.ts';
import { useAuth } from '../../hooks/useAuth';
import { useBills } from '../../hooks/useBills'; // ✅ ใช้ Hook จริง
import { MOCK_PARTICIPANTS } from '../../config/constants';
import type { User } from '../../types/user.types'; // ✅ Import User Type

interface BillScreenProps {
    user: User;
}

// ✅ รับ user ผ่าน props
const BillScreen: React.FC<BillScreenProps> = ({ user }) => {
    // ❌ ไม่เรียก useAuth() แล้ว

    // ✅ ส่ง user.id เข้าไปใน Hook
    const { bills, addBill, updateBill, deleteBill } = useBills(user.id);

    // State
    const [currentTab, setCurrentTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<BillItem | null>(null);
    const [deletingBillId, setDeletingBillId] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterPerson, setFilterPerson] = useState<string>('ALL');
    const [expandedBillIds, setExpandedBillIds] = useState<string[]>([]);

    // ใช้ User Mock หรือดึงจาก Trip Context จริงๆ ก็ได้ (ในที่นี้ใช้ Mock ไปก่อนเพื่อให้ UI ขึ้น)
    // จริงๆ ควรดึง users จาก Trip Context: const { trip } = useTrip(); const USERS = trip.participants;
    const USERS = MOCK_PARTICIPANTS.length > 0 ? MOCK_PARTICIPANTS : [user];

    // --- ACTIONS ---

    const handleSaveBill = async (data: any, isEdit: boolean) => {
        const createPayerList = (debtorsData: {userId: string, amount: number}[], existingDebtors: Payer[] = []): Payer[] => {
            return debtorsData.map(d => {
                const existing = existingDebtors.find(ex => ex.userId === d.userId);
                // ถ้าเป็นคนสร้างบิล ให้ถือว่าจ่ายแล้ว (VERIFIED)
                let status: PayerStatus = existing ? existing.status : PayerStatus.UNPAID;
                if (d.userId === user?.id) status = PayerStatus.VERIFIED;

                return {
                    userId: d.userId,
                    amount: d.amount,
                    status: status,
                    slipUrl: existing?.slipUrl
                };
            });
        };

        try {
            const debtorsList = createPayerList(data.debtors, isEdit ? editingBill?.debtors : []);

            if (isEdit && editingBill) {
                await updateBill(editingBill.id, {
                    title: data.title,
                    totalAmount: data.totalAmount,
                    paymentType: data.paymentType,
                    paymentValue: data.paymentValue,
                    debtors: debtorsList
                });
            } else {
                await addBill({
                    title: data.title,
                    totalAmount: data.totalAmount,
                    paymentType: data.paymentType,
                    paymentValue: data.paymentValue,
                    payerId: user.id,
                    debtors: debtorsList,
                    isCompleted: false
                });
            }
            setIsModalOpen(false);
            setEditingBill(null);
        } catch (e) {
            alert("บันทึกบิลไม่สำเร็จ T_T");
        }
    };

    const handleDeleteClick = (billId: string) => {
        setDeletingBillId(billId);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteBill = async () => {
        if (deletingBillId) {
            await deleteBill(deletingBillId);
            setDeletingBillId(null);
        }
    };

    // ... (Logic อื่นๆ เช่น handleVerifySlip, handleUploadSlip ใช้ updateBill จาก Hook ได้เลย)
    const handleVerifySlip = async (billId: string, payerId: string, isApproved: boolean) => {
        const targetBill = bills.find(b => b.id === billId);
        if(!targetBill) return;
        const newDebtors = targetBill.debtors.map(d => d.userId === payerId ? { ...d, status: (isApproved ? 'VERIFIED' : 'REJECTED') as PayerStatus } : d);
        const allPaid = newDebtors.every(d => d.status === 'VERIFIED');
        await updateBill(billId, { debtors: newDebtors, isCompleted: allPaid });
    };

    const handleUploadSlip = async (billId: string, file: File) => {
        const fakeUrl = "https://via.placeholder.com/300x500?text=Slip+Uploaded"; // Mock URL ไปก่อน
        const targetBill = bills.find(b => b.id === billId);
        if(!targetBill) return;
        const newDebtors = targetBill.debtors.map(d => {
            if (d.userId !== user?.id) return d;
            return { ...d, status: 'SLIP_SENT' as PayerStatus, slipUrl: fakeUrl };
        });
        await updateBill(billId, { debtors: newDebtors });
    };

    // Filter Logic
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
            {/* ... (Header & Filter UI คงเดิม) ... */}
            <div className="flex-none px-4 py-2 bg-F3F4F6 z-10">
                <BillTabs currentTab={currentTab} onTabChange={setCurrentTab} />
                {/* ... Search Bar Code ... */}
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="ค้นหาบิล..." className="w-full bg-white border border-gray-200 pl-9 pr-3 py-2 rounded-xl text-xs outline-none focus:border-blue-500"/>
                    </div>
                    {/* ... */}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24 min-h-0">
                <div className="space-y-1">
                    {filteredBills.map(bill => (
                        <BillCard
                            key={bill.id}
                            bill={bill}
                            currentUser={user!}
                            allUsers={USERS}
                            isOpen={expandedBillIds.includes(bill.id)}
                            onToggle={() => setExpandedBillIds(prev => prev.includes(bill.id) ? prev.filter(i => i !== bill.id) : [...prev, bill.id])}
                            onVerifySlip={handleVerifySlip}
                            onUploadSlip={handleUploadSlip}
                            onEdit={() => { setEditingBill(bill); setIsModalOpen(true); }}
                            // ✅ เพิ่ม Prop สำหรับลบ (ต้องแก้ BillCard.tsx ให้รับ Prop นี้ด้วย หรือจะใส่ปุ่มลบใน BillCard ก็ได้)
                            // onDelete={() => handleDeleteClick(bill.id)}
                        />
                    ))}
                    {/* Empty State */}
                    {filteredBills.length === 0 && <div className="text-center py-12 text-gray-400 text-xs">ไม่มีบิล</div>}
                </div>
            </div>

            <CreateBillFAB onClick={() => { setEditingBill(null); setIsModalOpen(true); }} />

            {/* Create/Edit Modal */}
            <CreateBillModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                users={USERS}
                currentUser={user!}
                onSave={handleSaveBill}
                initialData={editingBill}
            />

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteBill}
                title="ลบบิลนี้?"
                message="รายการเรียกเก็บเงินนี้จะหายไปตลอดกาลเลยนะ!"
            />
        </div>
    );
};

export default BillScreen;
