import {useState, useEffect} from 'react';
import {doc, onSnapshot, setDoc, serverTimestamp, updateDoc, arrayUnion, getDoc} from 'firebase/firestore';
import {db} from '../config/firebase';
import type {Trip} from '../types/trip.types';
import type {User} from '../types/user.types';
import {MOCK_PARTICIPANTS} from '../config/constants';
import {useAuth} from './useAuth';

const INITIAL_TRIP: Trip = {
    title: "",
    startDate: "TBD",
    endDate: "TBD",
    participants: [], // เริ่มต้นเป็นว่าง
};

export function useTrip() {
    const {user} = useAuth();
    const [trip, setTrip] = useState<Trip>(INITIAL_TRIP);
    const [isLoading, setIsLoading] = useState(false);

    // 1. Realtime Listener
    useEffect(() => {
        if (!user?.id) return;

        setIsLoading(true);
        const tripRef = doc(db, 'trips', user.id);

        const unsubscribe = onSnapshot(tripRef, (docSnap) => {
            if (docSnap.exists()) {
                setTrip(docSnap.data() as Trip);
            } else {
                setTrip(INITIAL_TRIP);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user?.id]);

    // 2. 🔥 Auto-Join Logic (แก้ปัญหา "ตัวเองไม่ขึ้น")
    useEffect(() => {
        if (!user?.id || !trip.title) return; // รอให้มี User และ Trip โหลดเสร็จก่อน

        // เช็คว่ามีตัวเองใน participants หรือยัง?
        const isMeInList = trip.participants?.some(p => p.id === user.id);

        if (!isMeInList) {
            console.log("Auto-joining trip...");
            const myUserEntry: User = {
                ...user,
                isGuest: false,
                createdAt: new Date(), // ใช้ Date ธรรมดาเพื่อเลี่ยง Loop ของ serverTimestamp
                createdBy: 'SYSTEM',
                createdByName: 'Auto Join'
            };
            // อัปเดตเฉพาะ field participants
            const tripRef = doc(db, 'trips', user.id);
            updateDoc(tripRef, {
                participants: arrayUnion(myUserEntry)
            }).catch(err => console.error("Auto-join failed:", err));
        }
    }, [user, trip.participants, trip.title]);


    // 3. Save Trip (Function เดิม)
    const saveTrip = async (newTripData: Partial<Trip>) => {
        if (!user?.id) return;
        try {
            const tripRef = doc(db, 'trips', user.id);
            const isCreate = !trip.createdAt;

            const auditData = {
                ...newTripData,
                updatedAt: serverTimestamp(),
                updatedBy: user.id,
                updatedByName: user.name,
                ...(isCreate && {
                    createdAt: serverTimestamp(),
                    createdBy: user.id,
                    createdByName: user.name,
                    // ถ้าสร้างทริปใหม่ ให้ใส่ตัวเองเป็นคนแรกเลย
                    participants: [{
                        ...user,
                        isGuest: false,
                        createdAt: new Date(),
                        createdBy: user.id,
                        createdByName: user.name
                    }]
                }),
            };

            await setDoc(tripRef, auditData, {merge: true});
        } catch (error) {
            console.error("Error saving trip:", error);
            alert("บันทึกข้อมูลไม่สำเร็จ!");
        }
    };

    // 4. 🔥 Add Participant (เพิ่มเพื่อน)
    const addParticipant = async (name: string) => {
        if (!user?.id) return;
        try {
            // สร้าง Guest User
            const newGuest: User = {
                id: `guest_${Date.now()}`, // Gen ID มั่วๆ ไปก่อน
                name: name,
                avatar: `https://api.dicebear.com/9.x/micah/svg?seed=${name}`, // Gen รูปตามชื่อ
                isGuest: true,

                // ✨ Audit Log สำหรับคนนี้
                createdAt: new Date(), // ใช้ Client Time ไปก่อนเพื่อให้ใช้ง่ายกับ Array
                createdBy: user.id,
                createdByName: user.name,
                updatedAt: new Date(),
                updatedBy: user.id,
                updatedByName: user.name
            };

            const tripRef = doc(db, 'trips', user.id);
            await updateDoc(tripRef, {
                participants: arrayUnion(newGuest)
            });

        } catch (error) {
            console.error("Error adding participant:", error);
            alert("เพิ่มเพื่อนไม่สำเร็จ");
        }
    };
// 🔥 ฟังก์ชันใหม่: จอยทริปชาวบ้าน (ผ่าน Link)
    const joinTripByHostId = async (hostId: string) => {
        if (!user?.id) return;
        if (hostId === user.id) return; // จอยทริปตัวเองไม่ได้ (มันมีอยู่แล้ว)

        try {
            const tripRef = doc(db, 'trips', hostId);
            const tripSnap = await getDoc(tripRef);

            if (tripSnap.exists()) {
                // เช็คว่ามีเราอยู่แล้วหรือยัง?
                const currentData = tripSnap.data() as Trip;
                const isAlreadyJoined = currentData.participants?.some(p => p.id === user.id);

                if (!isAlreadyJoined) {
                    // เตรียมข้อมูลตัวเราพร้อม Audit Log
                    const myUserEntry = {
                        ...user,
                        isGuest: false,
                        joinedAt: new Date(), // บันทึกเวลาที่กด Link เข้ามา
                        joinedMethod: 'line_link'
                    };

                    // ยัดใส่ Array
                    await updateDoc(tripRef, {
                        participants: arrayUnion(myUserEntry)
                    });
                    console.log(`✅ Joined trip of ${hostId} successfully!`);
                    alert("เข้าร่วมทริปสำเร็จ! 🎉");
                }
            }
        } catch (error) {
            console.error("Failed to join trip:", error);
        }
    };

    return {trip, saveTrip, addParticipant, joinTripByHostId, isLoading}; // export joinTripByHostId ออกไป
}
