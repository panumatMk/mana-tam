// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import liff from '@line/liff';
import type { User } from '../types/user.types';

const STORAGE_KEY = 'travelApp_user';
// 🔴 ใส่ LIFF ID ของคุณตรงนี้
const LIFF_ID = import.meta.env.VITE_LIFF_ID || "";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true); // เพิ่มสถานะโหลด

    useEffect(() => {
        const initLiff = async () => {
            try {
                // 1. Initialize LIFF
                await liff.init({ liffId: LIFF_ID });

                // 2. เช็คว่า Login หรือยัง (ถ้าเปิดใน LINE จะ Login อัตโนมัติ)
                if (liff.isLoggedIn()) {
                    const profile = await liff.getProfile();

                    const lineUser: User = {
                        id: profile.userId, // ใช้ Line User ID จริง
                        name: profile.displayName,
                        avatar: profile.pictureUrl || 'https://api.dicebear.com/9.x/micah/svg?seed=Default' // กันเหนียวถ้ารูปไม่มี
                    };

                    setUser(lineUser);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(lineUser));
                } else {
                    // ถ้ายังไม่ Login (เปิดใน Browser ธรรมดา)
                    // กรณีนี้เราจะไม่ Auto Login เพื่อให้ User กดปุ่มเอง หรือจะสั่ง liff.login() เลยก็ได้
                    // liff.login();
                }
            } catch (err) {
                console.error('LIFF Init Failed', err);
            } finally {
                setIsLoading(false);
            }
        };

        initLiff();
    }, []);

    // ฟังก์ชัน Login สำหรับปุ่มกด (กรณีเปิด Chrome แล้วยังไม่ได้ล็อกอิน)
    const loginWithLine = () => {
        liff.login();
    };

    const logout = () => {
        liff.logout();
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
        window.location.reload();
    };

    // ฟังก์ชัน updateProfile อาจจะไม่จำเป็นแล้วเพราะดึงจาก LINE แต่เก็บไว้เผื่อแก้ชื่อเล่นในแอป
    const updateProfile = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    };

    return {
        user,
        isLoading, // ส่งค่าโหลดออกไป
        loginWithLine, // ส่งฟังก์ชันล็อกอิน
        register: updateProfile, // map ของเดิมเข้ากับอันใหม่
        updateProfile,
        logout
    };
}
