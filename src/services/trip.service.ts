// --- NOTE: This is a Mock Service using localStorage to simulate GET/SET ---
// --- No Firebase/Firestore is used, only simple GET/SET actions. ---
import { db } from "../config/firebase.ts";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import type { Trip } from "../types/trip.types.ts";

// Initial Trip Data (ค่าเริ่มต้นเมื่อไม่มีข้อมูล)
export const INITIAL_TRIP: Trip = {
    title: "",
    startDate: '', // ใช้ String ว่างแทน 'TBD' เพื่อให้ง่ายต่อการ Validate
    endDate: '',
    participants: [],
};

// --- Mock Data Constants (จำลองข้อมูลทริปที่บันทึกแล้ว) ---
const MOCK_SAVED_TRIP: Trip = {
    title: "Bangkok Food Tour",
    startDate: "2025-11-25",
    endDate: "2025-11-28",
    participants: [
        {id: 'u1', name: 'Felix', avatar: ''},
        {id: 'u2', name: 'Jane', avatar: ''},
    ],
};

const TRIP_ID = "my_trip_001";

/**
 * 1. Core Service Function: GET Trip (Mocking an API call)
 * @param callback - ฟังก์ชันที่จะถูกเรียกเมื่อข้อมูลมีการเปลี่ยนแปลง
 * @returns Unsubscribe function (Mock)
 */
export const getTrip = (callback: (trip: Trip) => void): (() => void) => {
    const docRef = doc(db, "trips", TRIP_ID);

    // onSnapshot คือฟีเจอร์เด็ดของ Firebase ที่จะทำงานทุกครั้งที่ข้อมูลใน DB เปลี่ยน
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            console.log("✅ อัปเดตข้อมูลทริปจาก Firebase!");
            callback(docSnap.data() as Trip);
        } else {
            // ถ้ายังไม่มีข้อมูลใน DB ให้ส่งค่าว่างกลับไป
            console.log("⚠️ ไม่พบข้อมูลทริป ใช้ค่าเริ่มต้น");
            callback(INITIAL_TRIP);
        }
    }, (error) => {
        console.error("❌ Error fetching trip:", error);
    });

    // ส่ง function สำหรับยกเลิกการฟังกลับไป (ใช้ตอน unmount component)
    return unsubscribe;
};


/**
 * 2. Core Service Function: SET Trip (Mocking a POST request)
 * @param trip - ข้อมูลทริปที่ต้องการบันทึก
 */
export const setTrip = async (trip: Trip): Promise<void> => {
    try {
        const docRef = doc(db, "trips", TRIP_ID);
        // merge: true หมายถึงถ้ามีข้อมูลเดิมอยู่ ให้ทับเฉพาะฟิลด์ที่ส่งไป (แต่ถ้าส่งไปทั้งก้อนก็ทับหมด)
        await setDoc(docRef, trip, { merge: true });
        console.log("✅ บันทึกทริปสำเร็จ!");
    } catch (e) {
        console.error("❌ Error saving trip: ", e);
        throw e;
    }
};


/**
 * 3. Utility: ใช้สำหรับดึง User ID (Mock)
 */
export const getUserId = () => {
    const storedUser = localStorage.getItem('travelApp_user');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            return user.id;
        } catch (e) {
            return 'guest';
        }
    }
    return 'guest';
};
