import {useState, useEffect, useRef} from 'react';
import liff from '@line/liff';
import {doc, setDoc, serverTimestamp} from 'firebase/firestore'; // ✅ เพิ่ม Firestore
import {db} from '../config/firebase';
import type {User} from '../types/user.types';

const STORAGE_KEY = 'travelApp_user';
const LIFF_ID = import.meta.env.VITE_LIFF_ID || "";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isInitCalled = useRef(false);

    useEffect(() => {
        if (isInitCalled.current) return;
        isInitCalled.current = true;

        const initLiff = async () => {
            try {
                if (!LIFF_ID) throw new Error("VITE_LIFF_ID is missing");

                await liff.init({liffId: LIFF_ID});

                if (liff.isLoggedIn()) {
                    const profile = await liff.getProfile();
                    const context = await liff.getContext();
                    const lineUser: User = {
                        id: profile.userId,
                        name: profile.displayName,
                        groupIds: context?.groupId ? [context.groupId] : [],
                        roomIds: context?.roomId ? [context.roomId] : [],
                        avatar: profile.pictureUrl || 'https://api.dicebear.com/9.x/micah/svg?seed=Default'
                    };

                    setUser(lineUser);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(lineUser));

                    // 🔥 SAVE USER TO FIRESTORE IMMEDIATELY 🔥
                    // เก็บข้อมูล User ทุกคนที่ Login เข้ามา ไว้ใน Collection 'users'
                    const userRef = doc(db, 'users', lineUser.id);
                    await setDoc(userRef, {
                        ...lineUser,
                        lastLoginAt: serverTimestamp(),
                        // ถ้าเป็นการสร้างครั้งแรกให้ใส่ createdAt ด้วย (Firestore จัดการ merge ให้)
                    }, {merge: true});

                } else {
                    liff.login(); // บังคับ Login เลยถ้ายูสเซอร์กดลิงก์เข้ามา
                }
            } catch (err) {
                console.error('❌ LIFF Init Failed:', err);
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
