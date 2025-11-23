import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Trip } from '../types/trip.types';
import { MOCK_PARTICIPANTS } from '../config/constants';
import { useAuth } from './useAuth'; // ✅ เรียกใช้ Auth เพื่อเอา ID คนทำรายการ

const INITIAL_TRIP: Trip = {
    title: "",
    startDate: "TBD",
    endDate: "TBD",
    participants: MOCK_PARTICIPANTS
};

export function useTrip() {
    const { user } = useAuth(); // ดึง user ปัจจุบันมาใช้
    const [trip, setTrip] = useState<Trip>(INITIAL_TRIP);
    const [isLoading, setIsLoading] = useState(false);

    // 🔥 Listener: ฟังข้อมูล Realtime
    useEffect(() => {
        if (!user?.id) return;

        setIsLoading(true);
        const tripRef = doc(db, 'trips', user.id); // ใช้ user.id เป็น Document ID (1 User มี 1 Trip หลัก)

        const unsubscribe = onSnapshot(tripRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // แปลง Timestamp ของ Firebase เป็น Date object (ถ้าจำเป็น) หรือปล่อยไว้
                setTrip(data as Trip);
            } else {
                setTrip(INITIAL_TRIP);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user?.id]);

    // 🔥 Save Function: บันทึกพร้อม Audit Log
    const saveTrip = async (newTripData: Partial<Trip>) => {
        if (!user?.id) {
            alert("กรุณาล็อกอินก่อนบันทึกทริป!");
            return;
        }

        try {
            const tripRef = doc(db, 'trips', user.id);

            // เช็คว่าเป็น Create หรือ Update
            // ถ้าใน state ปัจจุบันยังไม่มี title หรือ createdAt แสดงว่าเพิ่งเริ่มสร้าง
            const isCreate = !trip.createdAt;

            const auditData = {
                ...newTripData,
                updatedAt: serverTimestamp(), // อัปเดตเวลาเสมอ
                updatedByName: user.name,         // อัปเดตคนแก้เสมอ
                createdBy: user.id,
                ...(isCreate && {             // ถ้าสร้างใหม่ ให้เพิ่ม 2 ฟิลด์นี้
                    createdAt: serverTimestamp(),
                    createdByName: user.name,
                    createdBy: user.id
                }),
                participants: trip.participants // คงผู้เข้าร่วมเดิมไว้ (ถ้าไม่ได้ส่งมาแก้)
            };

            // merge: true จะช่วยให้ field อื่นๆ ไม่หาย
            await setDoc(tripRef, auditData, { merge: true });

            console.log("✅ Trip saved successfully!");

        } catch (error) {
            console.error("❌ Error saving trip:", error);
            alert("บันทึกข้อมูลไม่สำเร็จ!");
        }
    };

    return { trip, saveTrip, isLoading };
}
