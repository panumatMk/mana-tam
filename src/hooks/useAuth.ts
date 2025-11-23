import { useState, useEffect, useRef } from 'react'; // 1. เพิ่ม useRef
import liff from '@line/liff';
import type { User } from '../types/user.types';

const STORAGE_KEY = 'travelApp_user';
const LIFF_ID = import.meta.env.VITE_LIFF_ID || "";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 2. เพิ่ม Ref กันรันซ้ำ
    const isInitCalled = useRef(false);

    useEffect(() => {
        // 3. ถ้าเคยเรียก init ไปแล้ว ให้หยุดทันที (ป้องกัน Strict Mode รันซ้ำ)
        if (isInitCalled.current) return;
        isInitCalled.current = true;

        const initLiff = async () => {
            try {
                if (!LIFF_ID) {
                    console.warn("⚠️ ไม่พบ VITE_LIFF_ID");
                    throw new Error("VITE_LIFF_ID is missing");
                }

                // เริ่มต้น LIFF
                await liff.init({ liffId: LIFF_ID });

                // ถ้า Login แล้ว ให้ดึงข้อมูล
                if (liff.isLoggedIn()) {
                    const profile = await liff.getProfile();
                    const lineUser: User = {
                        id: profile.userId,
                        name: profile.displayName,
                        avatar: profile.pictureUrl || 'https://api.dicebear.com/9.x/micah/svg?seed=Default'
                    };
                    setUser(lineUser);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(lineUser));
                } else {
                    // ถ้ายังไม่ Login และไม่ได้อยู่ใน LINE App ให้ Auto Login เลยก็ได้ (Optional)
                    // liff.login();
                }
            } catch (err) {
                console.error('❌ LIFF Init Failed:', err);
                // ถ้าพังเพราะ code invalid ให้เคลียร์ URL ทิ้ง เพื่อให้ user ลองใหม่ได้
                if (window.location.search.includes("code=")) {
                    window.history.replaceState(null, "", window.location.pathname);
                    window.location.reload();
                }
            } finally {
                setIsLoading(false);
            }
        };

        initLiff();
    }, []);

    const loginWithLine = () => {
        if (!LIFF_ID) return;
        if (!liff.isLoggedIn()) {
            liff.login();
        }
    };

    const logout = () => {
        liff.logout();
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
        window.location.reload();
    };

    const updateProfile = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    };

    return {
        user,
        isLoading,
        loginWithLine,
        updateProfile,
        logout
    };
}
