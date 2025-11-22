import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { HamburgerDrawer } from './components/layout/HamburgerDrawer';
import { RegistrationScreen } from './features/auth/RegistrationScreen';
import { EditProfileModal } from './features/auth/EditProfileModal';
import { PlanScreen } from './features/plan/PlanScreen';
import { EditTripModal } from './features/plan/EditTripModal';
import type { User } from './types/user.types';
import type { Trip } from './types/trip.types';
import { MOCK_PARTICIPANTS } from './config/constants';
import BillScreen from "./features/bill/BillScreen.tsx";

// ค่าเริ่มต้นเมื่อยังไม่มีทริป
const INITIAL_TRIP: Trip = {
    title: "",
    startDate: "TBD",
    endDate: "TBD",
    participants: MOCK_PARTICIPANTS
};

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [screen, setScreen] = useState<'plan' | 'bill'>('plan');

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isTripEditOpen, setIsTripEditOpen] = useState(false);
    const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

    const [trip, setTrip] = useState<Trip>(INITIAL_TRIP);

    // Load Data on Mount
    useEffect(() => {
        const savedUser = localStorage.getItem('travelApp_user');
        if (savedUser) setUser(JSON.parse(savedUser));

        // โหลดข้อมูลทริปจาก LocalStorage โดยตรง (เพื่อให้ซิงค์กับตอนบันทึก)
        const savedTrip = localStorage.getItem('travelApp_trip');
        if (savedTrip) {
            setTrip({ ...JSON.parse(savedTrip), participants: MOCK_PARTICIPANTS });
        }
    }, []);

    const handleRegister = (newUser: User) => {
        setUser(newUser);
        localStorage.setItem('travelApp_user', JSON.stringify(newUser));
        // ถ้ายังไม่มีทริป ให้สร้างค่าเริ่มต้นเก็บไว้
        if (!localStorage.getItem('travelApp_trip')) {
            localStorage.setItem('travelApp_trip', JSON.stringify(INITIAL_TRIP));
            setTrip(INITIAL_TRIP);
        }
    };

    const handleUpdateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('travelApp_user', JSON.stringify(updatedUser));
        setIsProfileEditOpen(false);
    };

    // ฟังก์ชันบันทึกทริป (เชื่อมโยง Header กับ LocalStorage)
    const handleSaveTrip = (newTrip: Trip) => {
        // รวมข้อมูลใหม่กับ participants เดิม
        const updatedTrip = { ...newTrip, participants: trip.participants };

        // 1. อัปเดต State (Header จะเปลี่ยนทันที)
        setTrip(updatedTrip);

        // 2. บันทึกลง LocalStorage (จำค่าไว้)
        localStorage.setItem('travelApp_trip', JSON.stringify(updatedTrip));

        setIsTripEditOpen(false);
    };

    // Reset App (Clear Data)
    const handleReset = () => {
        if(confirm("ล้างข้อมูลทั้งหมดและเริ่มใหม่?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    if (!user) return <RegistrationScreen onComplete={handleRegister} />;

    const isHeaderMinimized = screen !== 'plan';
    const TAB_LABELS = { plan: 'Plan', bill: 'Bill' };

    return (
        <div className="h-full flex flex-col bg-F3F4F6 w-full max-w-md mx-auto shadow-2xl overflow-hidden">

            {/* Header แสดงข้อมูลจริงจาก State 'trip' */}
            <Header
                user={user}
                trip={trip}
                participants={trip.participants}
                onMenuClick={() => setIsDrawerOpen(true)}
                onEdit={() => setIsTripEditOpen(true)}
                isMinimized={isHeaderMinimized}
                activeTabLabel={TAB_LABELS[screen]}
            />

            <div className="flex-1 relative overflow-hidden">
                {screen === 'plan' ? (
                    <PlanScreen
                        trip={trip}
                        onSaveTrip={handleSaveTrip} // ส่งฟังก์ชันบันทึกไปให้ PlanScreen ใช้ตอนกดปุ่มเขียว
                    />
                ) : (
                    <BillScreen />
                )}
            </div>

            <HamburgerDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onNavigate={setScreen}
                activeScreen={screen}
                user={user}
                onLogout={handleReset}
                onEditProfile={() => {
                    setIsDrawerOpen(false);
                    setTimeout(() => setIsProfileEditOpen(true), 200);
                }}
            />

            {/* Modal แก้ไขทริป (ใช้ handleSaveTrip เดียวกัน) */}
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
