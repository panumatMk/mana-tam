import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_TRIP, getTrip, setTrip } from '../services/trip.service';
import type {Trip} from "../types/trip.types.ts";
import type {User} from "../types/user.types.ts"; // Import Service

// 1. กำหนด Type ของ Context ที่ส่งออกไป
interface TripContextType {
    trip: Trip;
    isLoading: boolean;
    // ฟังก์ชันสำหรับบันทึกข้อมูลทริป (เรียก service.setTrip)
    saveTrip: (updatedTrip: Trip) => Promise<void>;
}

// 2. สร้าง Context และกำหนด Default Value
const TripContext = createContext<TripContextType>({
    trip : {
        title: '',
        startDate: null,
        endDate: null,
        participants: []
    },
    isLoading: false
});

// Hook สำหรับดึง Context
export const useTrip = () => {
    return useContext(TripContext);
};

// 3. Component Provider หลัก
interface TripProviderProps {
    children: React.ReactNode;
}

export const TripProvider: React.FC<TripProviderProps> = ({ children }) => {
    const [trip, setTripState] = useState<Trip>(INITIAL_TRIP);
    const [isLoading, setIsLoading] = useState(true);

    // --- Logic: Load Data (Connect to Service) ---
    useEffect(() => {
        // ใช้ service.getTrip เพื่อดึงข้อมูลเริ่มต้น (Mock/Local Storage)
        const unsubscribe = getTrip((initialTripData: Trip) => {
            setTripState(initialTripData);
            setIsLoading(false);
        });

        // Cleanup: ยกเลิก listener เมื่อ Component ถูก Unmount
        return () => {
            unsubscribe();
        };
    }, []); // รันแค่ครั้งเดียวตอน Mount

    // --- Logic: Save Data (Connect to Service) ---
    const saveTrip = async (updatedTrip: Trip): Promise<void> => {
        setIsLoading(true);
        try {
            await setTrip(updatedTrip); // 1. บันทึกผ่าน Service Mock (ซึ่งจะลง LocalStorage)

            // 2. ถ้า service สำเร็จ -> ดึงข้อมูลล่าสุดมาแสดงผล
            //    (ใน Mock Service ของเรา, getTrip จะดึงจาก LocalStorage ตัวล่าสุดเอง)

            // Optional: ถ้าอยากให้ UI อัปเดตทันทีโดยไม่ต้องรอ Fetch (Optimistic UI)
            setTripState(updatedTrip);

        } catch (error) {
            console.error("Failed to save trip:", error);
            // แสดง Error Modal ที่นี่
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const contextValue = {
        trip,
        isLoading,
        saveTrip,
    };

    return (
        <TripContext.Provider value={contextValue}>
            {children}
        </TripContext.Provider>
    );
};
