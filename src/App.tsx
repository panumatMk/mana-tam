import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { HamburgerDrawer } from './components/layout/HamburgerDrawer';
import { RegistrationScreen } from './features/auth/RegistrationScreen';
import { EditProfileModal } from './features/auth/EditProfileModal';
import { PlanScreen } from './features/plan/PlanScreen';
import { BillScreen } from './features/bill/BillScreen';
import { EditTripModal } from './features/plan/EditTripModal';
import type { User } from './types/user.types';
import type { Trip } from './types/trip.types';
import {getTrip, INITIAL_TRIP} from "./services/trip.service.ts";

// Mock Team
const MOCK_PARTICIPANTS: User[] = [
    { id: 'u1', name: 'Felix', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { id: 'u2', name: 'Jane', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
    { id: 'u3', name: 'Max', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max' },
];

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [screen, setScreen] = useState<'plan' | 'bill'>('plan');

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isTripEditOpen, setIsTripEditOpen] = useState(false);
    const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);


    const [trip, setTrip] = useState<Trip>(INITIAL_TRIP);
    const [isLoading, setIsLoading] = useState(true);

    // Real-time listener: ดึงข้อมูลทริปจาก Firestore
    useEffect(() => {
        const savedUser = localStorage.getItem('travelApp_user');
        if (savedUser) setUser(JSON.parse(savedUser));

        const unsubscribe = getTrip((newTripData) => {
            setTrip(newTripData);
            setIsLoading(false);
        });

        // Cleanup: ยกเลิกการเชื่อมต่อเมื่อ Component ถูก Unmount
        return () => {
            unsubscribe();
        };
    }, []); // Run only once

    // const handleSaveTrip = async (updatedTrip: Trip) => {
    //     try {
    //         await setTripS(updatedTrip); // เรียกใช้ Service เพื่อบันทึก
    //         // State จะถูกอัปเดตอัตโนมัติผ่าน onSnapshot listener
    //     } catch (error) {
    //         console.error("Failed to save trip:", error);
    //         // แสดง Modal แจ้งเตือน Error
    //     }
    // };

    const handleRegister = (newUser: User) => {
        setUser(newUser);
        localStorage.setItem('travelApp_user', JSON.stringify(newUser));
        if (!localStorage.getItem('travelApp_trip')) {
            const defaultTrip = { ...trip, participants: MOCK_PARTICIPANTS };
            setTrip(defaultTrip);
            localStorage.setItem('travelApp_trip', JSON.stringify(defaultTrip));
        }
    };

    const handleUpdateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('travelApp_user', JSON.stringify(updatedUser));
    };

    const handleSaveTrip = (newTrip: Trip) => {
        setTrip(newTrip);
        localStorage.setItem('travelApp_trip', JSON.stringify(newTrip));
        setIsTripEditOpen(false);
    };

    if (!user) return <RegistrationScreen onComplete={handleRegister} />;

    return (
        <div className="h-full flex flex-col bg-F3F4F6 w-full max-w-md mx-auto shadow-2xl overflow-hidden">

            <Header
                user={user}
                trip={trip}
                participants={trip.participants}
                onMenuClick={() => setIsDrawerOpen(true)}
                onEdit={() => setIsTripEditOpen(true)}
                isMinimized={false}
                activeTabLabel=""
            />

            <div className="flex-1 relative overflow-hidden">
                {screen === 'plan' ? <PlanScreen trip={trip} onSaveTrip={(trip) => handleSaveTrip(trip)}/> : <BillScreen />}
            </div>

            <HamburgerDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onNavigate={setScreen}
                activeScreen={screen}
                user={user}
                onLogout={() => {}}
                onEditProfile={() => {
                    setIsDrawerOpen(false); // ปิด Drawer ก่อน
                    setTimeout(() => setIsProfileEditOpen(true), 200); // รอแป๊บนึงแล้วค่อยเปิด Modal (Animation จะได้นุ่ม)
                }}
            />

            <EditTripModal
                isOpen={isTripEditOpen}
                onClose={() => setIsTripEditOpen(false)}
                onSave={handleSaveTrip}
                initialTrip={trip}
            />

            <EditProfileModal
                isOpen={isProfileEditOpen}
                onClose={() => setIsProfileEditOpen(false)}
                currentUser={user}
                onSave={handleUpdateUser}
            />

        </div>
    );
}

export default App;
