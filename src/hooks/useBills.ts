import { useState, useEffect } from 'react';
import {
    collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
// ❌ ลบ import { useAuth } ... ออก
import type { BillItem } from '../types/bill.types';
import {MOCKGROUPID} from "../config/constants.ts";
import type {User} from "../types/user.types.ts";

// ✅ รับ userId เข้ามาเป็น Argument
export function useBills(groupId?: string, user: User) {
    const [bills, setBills] = useState<BillItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Realtime Listener
    useEffect(() => {
        if (!groupId) return; // เช็ค userId ที่รับมา

        const billsRef = collection(db, 'trips', groupId, 'bills');
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
    }, [groupId]);

    // 2. Add Bill
    const addBill = async (billData: Omit<BillItem, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!groupId) return;
        try {
            const billsRef = collection(db, 'trips', groupId, 'bills');
            await addDoc(billsRef, {
                ...billData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: user.id,
                createdByName: user.name,
                updatedBy: user.id,
                updatedByName: user.name
            });
        } catch (error) {
            console.error("Error adding bill:", error);
            throw error;
        }
    };

    // 3. Update Bill
    const updateBill = async (billId: string, updateData: Partial<BillItem>) => {
        if (!groupId) return;
        try {
            const billRef = doc(db, 'trips', groupId, 'bills', billId);
            const { id, createdAt, createdBy, ...data } = updateData as any;

            await updateDoc(billRef, {
                ...data,
                updatedAt: serverTimestamp(),
                updatedBy: user.id,
                updatedByName: user.name
            });
        } catch (error) {
            console.error("Error updating bill:", error);
            throw error;
        }
    };

    // 4. Delete Bill
    const deleteBill = async (billId: string) => {
        if (!groupId) return;
        try {
            await deleteDoc(doc(db, 'trips', groupId, 'bills', billId));
        } catch (error) {
            console.error("Error deleting bill:", error);
            throw error;
        }
    };

    return { bills, isLoading, addBill, updateBill, deleteBill };
}
