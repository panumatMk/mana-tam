// src/hooks/useTrip.ts
import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Trip } from '../types/trip.types';
import { MOCK_PARTICIPANTS } from '../config/constants';

const INITIAL_TRIP: Trip = {
    title: "",
    startDate: "TBD",
    endDate: "TBD",
    participants: MOCK_PARTICIPANTS
};

export function useTrip(userId?: string) {
    const [trip, setTrip] = useState<Trip>(INITIAL_TRIP);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;

        setIsLoading(true);
        // 🔥 ฟังข้อมูล Realtime จาก Firestore
        // เก็บข้อมูลที่ path: trips/{userId}
        const tripRef = doc(db, 'trips', userId);

        const unsubscribe = onSnapshot(tripRef, (docSnap) => {
            if (docSnap.exists()) {
                setTrip(docSnap.data() as Trip);
            } else {
                // ถ้ายังไม่มีข้อมูลใน DB ให้ใช้ค่าเริ่มต้น
                setTrip(INITIAL_TRIP);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    const saveTrip = async (newTrip: Trip) => {
        if (!userId) return;
        try {
            // บันทึกลง Firestore
            await setDoc(doc(db, 'trips', userId), {
                ...newTrip,
                participants: trip.participants // คงผู้เข้าร่วมไว้ (หรือจะอัปเดตด้วยก็ได้)
            }, { merge: true });
        } catch (error) {
            console.error("Error saving trip:", error);
            alert("บันทึกข้อมูลไม่สำเร็จ!");
        }
    };

    return { trip, saveTrip, isLoading };
}
