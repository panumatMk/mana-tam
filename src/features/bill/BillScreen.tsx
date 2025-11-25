import React, {useState, useMemo, useEffect} from 'react';
import {Search, LayoutList, Minimize2, Filter} from 'lucide-react';

import BillTabs from './BillTabs';
import BillCard from './BillCard';
import CreateBillFAB from './CreateBillFAB';
import CreateBillModal from './CreateBillModal';
import ConfirmModal from '../../components/common/ConfirmModal';

import type {BillItem, Payer} from "../../types/bill.types.ts";
import type {User} from '../../types/user.types';
import {PayerStatus} from '../../enums/bill.enums.ts';
import {useBills} from '../../hooks/useBills';
import {useTrip} from '../../hooks/useTrip';
import {useParams} from "react-router-dom";
import {MOCKGROUPID} from "../../config/constants.ts"; // ✅ 1. เพิ่ม import useTrip

interface BillScreenProps {
    user: User;
}

const BillScreen: React.FC<BillScreenProps> = ({user}) => {
    const {bills, addBill, updateBill, deleteBill} = useBills(MOCKGROUPID, user);

    // ✅ 2. เรียกใช้ข้อมูลทริป เพื่อเอาเพื่อนในทริปมาแสดง
    const {trip} = useTrip();

    // State
    const [currentTab, setCurrentTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<BillItem | null>(null);
    const [deletingBillId, setDeletingBillId] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterPerson, setFilterPerson] = useState<string>('ALL');
    const [expandedBillIds, setExpandedBillIds] = useState<string[]>([]);

    // ✅ 3. ใช้ participants จาก Firebase (ถ้าไม่มีให้ใช้ user ปัจจุบันไปก่อน)
    const USERS = (trip.participants && trip.participants.length > 0)
        ? trip.participants
        : [user];

    // ... (Logic ส่วน handleSaveBill, handleVerifySlip คงเดิม ไม่ต้องแก้) ...
    const handleSaveBill = async (data: any, isEdit: boolean) => {
        const createPayerList = (debtorsData: {
            userId: string,
            amount: number
        }[], existingDebtors: Payer[] = []): Payer[] => {
            return debtorsData.map(d => {
                const existing = existingDebtors.find(ex => ex.userId === d.userId);
                let status: PayerStatus = existing ? existing.status : PayerStatus.UNPAID;
                if (d.userId === user.id) status = PayerStatus.VERIFIED;

                return {
                    userId: d.userId,
                    amount: d.amount,
                    status: status,
                    slipUrl: existing?.slipUrl || ''
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
            console.log(e);
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

    const handleVerifySlip = async (billId: string, payerId: string, isApproved: boolean) => {
        const targetBill = bills.find(b => b.id === billId);
        if (!targetBill) return;
        const newDebtors = targetBill.debtors.map(d => d.userId === payerId ? {
            ...d,
            status: (isApproved ? 'VERIFIED' : 'REJECTED') as PayerStatus
        } : d);
        const allPaid = newDebtors.every(d => d.status === 'VERIFIED');
        await updateBill(billId, {debtors: newDebtors, isCompleted: allPaid});
    };

    const handleUploadSlip = async (billId: string, file: File) => {
        // Note: ของจริงต้องอัปโหลดไฟล์ไป Storage ก่อน แล้วเอา URL มาใส่
        const fakeUrl = "https://via.placeholder.com/300x500?text=Slip+Uploaded";
        const targetBill = bills.find(b => b.id === billId);
        if (!targetBill) return;
        const newDebtors = targetBill.debtors.map(d => {
            if (d.userId !== user.id) return d;
            return {...d, status: 'SLIP_SENT' as PayerStatus, slipUrl: fakeUrl};
        });
        await updateBill(billId, {debtors: newDebtors});
    };

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
            <div className="flex-none px-4 py-2 bg-F3F4F6 z-10">
                <BillTabs currentTab={currentTab} onTabChange={setCurrentTab}/>
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute top-2.5 left-3 w-4 h-4 text-gray-400"/>
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                               placeholder="ค้นหาบิล..."
                               className="w-full bg-white border border-gray-200 pl-9 pr-3 py-2 rounded-xl text-xs outline-none focus:border-blue-500"/>
                    </div>

                    {/* ✅ 4. แก้ไข Dropdown ให้ใช้ USERS ที่ดึงมา */}
                    <div className="relative">
                        <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)}
                                className="appearance-none bg-white border border-gray-200 text-gray-600 text-xs font-bold py-2 pl-3 pr-8 rounded-xl outline-none focus:border-blue-500">
                            <option value="ALL">ทุกคน</option>
                            {USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                        <Filter className="absolute top-2.5 right-2.5 w-3 h-3 text-gray-400 pointer-events-none"/>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar-completely px-4 pb-24 min-h-0">
                <div className="space-y-1">
                    {filteredBills.map(bill => (
                        <BillCard
                            key={bill.id}
                            bill={bill}
                            currentUser={user}
                            allUsers={USERS} // ✅ 5. ส่ง USERS ชุดใหม่ไปให้ BillCard
                            isOpen={expandedBillIds.includes(bill.id)}
                            onToggle={() => setExpandedBillIds(prev => prev.includes(bill.id) ? prev.filter(i => i !== bill.id) : [...prev, bill.id])}
                            onVerifySlip={handleVerifySlip}
                            onUploadSlip={handleUploadSlip}
                            onEdit={() => {
                                setEditingBill(bill);
                                setIsModalOpen(true);
                            }}
                        />
                    ))}
                    {filteredBills.length === 0 &&
                        <div className="text-center py-12 text-gray-400 text-xs">ไม่มีบิล</div>}
                </div>
            </div>

            <CreateBillFAB onClick={() => {
                setEditingBill(null);
                setIsModalOpen(true);
            }}/>

            <CreateBillModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                users={USERS} // ✅ 6. ส่ง USERS ชุดใหม่ไปให้ Modal
                currentUser={user}
                onSave={handleSaveBill}
                initialData={editingBill}
            />

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
