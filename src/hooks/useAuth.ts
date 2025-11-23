import { useState, useEffect } from 'react';
import type { User } from '../types/user.types';

const STORAGE_KEY = 'travelApp_user';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setUser(JSON.parse(saved));
    }, []);

    const register = (newUser: User) => {
        setUser(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    };

    const updateProfile = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    };

    const logout = () => {
        localStorage.removeItem(STORAGE_KEY);
        // ล้างค่าอื่นๆ ด้วยถ้าจำเป็น
        setUser(null);
    };

    return { user, register, updateProfile, logout };
}
