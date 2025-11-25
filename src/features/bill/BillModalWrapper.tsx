import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BillScreen from './BillScreen'; // ใช้แสดงหน้าจอหลักเบื้องหลัง
import CreateBillModal from './CreateBillModal';
import type { User } from '../../types/user.types';
import {useBills} from "../../hooks/useBills.ts";
import {useTrip} from "../../hooks/useTrip.ts";
import {MOCKGROUPID} from "../../config/constants.ts";

interface Props {
    user: User;
    mode: 'CREATE' | 'UPDATE';
}

// Component นี้จะทำหน้าที่เป็น Route Handler สำหรับ Modal
export const BillModalWrapper: React.FC<Props> = ({ user, mode }) => {
    const navigate = useNavigate();
    const { billId } = useParams<{ billId: string }>(); // ดึง ID จาก URL

    // ดึงข้อมูล Bills ทั้งหมด
    const { bills, addBill, updateBill } = useBills(MOCKGROUPID, user);
    const { trip } = useTrip();

    // ค้นหา Bill ที่จะแก้ไขจาก Bills ทั้งหมดที่โหลดมาแล้ว (In-memory lookup)
    const editingBill = useMemo(() => {
        if (mode === 'UPDATE' && billId && bills.length > 0) {
            return bills.find(b => b.id === billId) || null;
        }
        return null;
    }, [mode, billId, bills]); // จะถูก re-calculate เมื่อ bills เปลี่ยน

    // ถ้าเป็นโหมด UPDATE แต่หา bill ไม่เจอ (อาจจะโหลดไม่เสร็จ หรือ ID ผิด)
    useEffect(() => {
        if (mode === 'UPDATE' && billId && bills.length > 0 && !editingBill) {
            // ถอด Modal ออก และกลับไปหน้า Bill
            alert('ไม่พบข้อมูลบิลที่ต้องการแก้ไข!');
            navigate('/bill');
        }
    }, [mode, billId, bills, editingBill, navigate]);


    // Handlers (ใช้ Logic เดียวกันกับที่เคยอยู่ใน BillScreen)
    const handleSaveBill = async (data: any, isEdit: boolean) => {
        // ... (ใช้ logic save ที่เคยเขียนไว้) ...
        const debtorsList = createPayerList(data.debtors, isEdit ? editingBill?.debtors : []);

        if (isEdit && editingBill) {
            await updateBill(editingBill.id, {
                // ... update data ...
                debtors: debtorsList
            });
        } else {
            await addBill({
                // ... add data ...
                debtors: debtorsList
            });
        }
        navigate('/bill'); // ปิด Modal แล้วกลับไปหน้า /bill
    };

    // ต้องแน่ใจว่าได้ implement createPayerList ที่นี่ หรือดึงมาจาก BillScreen
    const createPayerList = (debtorsData: any, existingDebtors: any[] = []) => {
        // ... (Logic การสร้าง Payer List) ...
        return debtorsData.map(d => ({
            // ... simplify for example ...
            userId: d.userId,
            amount: d.amount,
            status: (d.userId === user.id) ? 'VERIFIED' : 'UNPAID',
            slipUrl: existingDebtors.find(ex => ex.userId === d.userId)?.slipUrl || ''
        }));
    };

    // ดึง participants จาก trip (ใช้ Logic เดียวกับ BillScreen)
    const USERS = (trip.participants && trip.participants.length > 0)
        ? trip.participants
        : [user];

    // ถ้ากำลังโหลดข้อมูล (หรือเป็นโหมดแก้ไขแต่ยังหาบิลไม่เจอ) ให้รอ
    const isReady = bills.length > 0 || mode === 'CREATE';
    if (!isReady) return null;

    return (
        <>
            {/* แสดง BillScreen เป็นฉากหลัง */}
            <BillScreen user={user} />

            {/* Modal จะเปิดเสมอเมื่ออยู่บน Route นี้ (isOpen={true}) */}
            <CreateBillModal
                isOpen={true} // เปิดเสมอ
                onClose={() => navigate('/bill')} // ปิด Modal แล้วกลับไปหน้า /bill
                users={USERS}
                currentUser={user}
                onSave={handleSaveBill}
                initialData={mode === 'UPDATE' ? editingBill : null}
            />
        </>
    );
};
