import { useState, useEffect } from 'react';
import {
    collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
// ❌ ลบ import { useAuth } ... ออก
import type { BillItem } from '../types/bill.types';
import {MOCKGROUPID} from "../config/constants.ts";

// ✅ รับ userId เข้ามาเป็น Argument
export function useBills(userId?: string) {
    const [bills, setBills] = useState<BillItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Realtime Listener
    useEffect(() => {
        if (!userId) return; // เช็ค userId ที่รับมา

        const billsRef = collection(db, 'trips', MOCKGROUPID, 'bills');
        const q = query(billsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedBills = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as BillItem[];

            setBills(loadedBills);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    // 2. Add Bill
    const addBill = async (billData: Omit<BillItem, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!userId) return;
        try {
            const billsRef = collection(db, 'trips', MOCKGROUPID, 'bills');
            await addDoc(billsRef, {
                ...billData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: userId,
                // createdByName: ... (ถ้าจะเก็บชื่อ ต้องส่ง name มาด้วย หรือเอาแค่ ID ไปก่อน)
                updatedBy: userId,
            });
        } catch (error) {
            console.error("Error adding bill:", error);
            throw error;
        }
    };

    // 3. Update Bill
    const updateBill = async (billId: string, updateData: Partial<BillItem>) => {
        if (!userId) return;
        try {
            const billRef = doc(db, 'trips', userId, 'bills', billId);
            const { id, createdAt, createdBy, ...data } = updateData as any;

            await updateDoc(billRef, {
                ...data,
                updatedAt: serverTimestamp(),
                updatedBy: userId,
            });
        } catch (error) {
            console.error("Error updating bill:", error);
            throw error;
        }
    };

    // 4. Delete Bill
    const deleteBill = async (billId: string) => {
        if (!userId) return;
        try {
            await deleteDoc(doc(db, 'trips', userId, 'bills', billId));
        } catch (error) {
            console.error("Error deleting bill:", error);
            throw error;
        }
    };

    return { bills, isLoading, addBill, updateBill, deleteBill };
}
