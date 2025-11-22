// --- NOTE: This is a Mock Service using localStorage to simulate GET/SET ---
// --- No Firebase/Firestore is used, only simple GET/SET actions. ---

// --- TYPES (Minimal definitions) ---
import type {Trip} from "../types/trip.types.ts";

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


/**
 * 1. Core Service Function: GET Trip (Mocking an API call)
 * @param callback - ฟังก์ชันที่จะถูกเรียกเมื่อข้อมูลมีการเปลี่ยนแปลง
 * @returns Unsubscribe function (Mock)
 */
export const getTrip = (callback: (trip: Trip) => void): (() => void) => {

    // ดึงข้อมูลทริปจาก LocalStorage (จำลองว่าเป็น DB)
    const storedTripString = localStorage.getItem('travelApp_mock_trip');

    let tripData: Trip;

    if (storedTripString) {
        tripData = JSON.parse(storedTripString);

    } else {
        // หากไม่มีข้อมูลใน LocalStorage ให้ใช้ค่าเริ่มต้น (ว่างเปล่า)
        tripData = INITIAL_TRIP;
    }

    // จำลองการโหลดข้อมูลแบบ Asynchronous
    callback(tripData);

    // Return function Mock สำหรับยกเลิกการเชื่อมต่อ
    return () => {
        console.log("SERVICE MOCK: Listener unsubscribed.");
    };
};


/**
 * 2. Core Service Function: SET Trip (Mocking a POST request)
 * @param trip - ข้อมูลทริปที่ต้องการบันทึก
 */
export const setTrip = async (trip: Trip): Promise<void> => {

    // จำลองการยิง POST Request ไป Server (สำเร็จเสมอ)
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("SERVICE MOCK: Sending trip data via POST simulation.");

            // บันทึกข้อมูลใหม่ลง LocalStorage
            localStorage.setItem('travelApp_mock_trip', JSON.stringify(trip));

            // ในแอปจริง ต้องเรียก Callback (re-fetch) หลังจาก POST สำเร็จ
            // แต่ใน Mock นี้ เราจะให้ Component จัดการ Load ใหม่เอง

            resolve();
        }, 300); // ดีเลย์ 300ms เพื่อจำลองการบันทึก
    });
};


/**
 * 3. Utility: ใช้สำหรับดึง User ID (Mock)
 */
export const getUserId = () => 'u1'; // Mock ID
