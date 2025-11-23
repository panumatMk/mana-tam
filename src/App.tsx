import { useState } from 'react';
import { Header } from './components/layout/Header';
import { HamburgerDrawer } from './components/layout/HamburgerDrawer';
import { RegistrationScreen } from './features/auth/RegistrationScreen';
import { EditProfileModal } from './features/auth/EditProfileModal';
import { PlanScreen } from './features/plan/PlanScreen';
import { EditTripModal } from './features/plan/EditTripModal';
import BillScreen from "./features/bill/BillScreen";

// Import Hooks ที่แยกไว้
import { useAuth } from './hooks/useAuth';
import { useTrip } from './hooks/useTrip';

function App() {
    // Logic ถูกซ่อนไว้ใน Hooks หมดแล้ว
    const { user, register, updateProfile, logout } = useAuth();
    const { trip, saveTrip } = useTrip();

    const [screen, setScreen] = useState<'plan' | 'bill'>('plan');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isTripEditOpen, setIsTripEditOpen] = useState(false);
    const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

    // ถ้าไม่มี User ให้แสดงหน้า Register
    if (!user) return <RegistrationScreen onComplete={register} />;

    const TAB_LABELS = { plan: 'Plan', bill: 'Bill' };

    return (
        <div className="h-full flex flex-col bg-F3F4F6 w-full max-w-md mx-auto shadow-2xl overflow-hidden">

            <Header
                user={user}
                trip={trip}
                participants={trip.participants}
                onMenuClick={() => setIsDrawerOpen(true)}
                onEdit={() => setIsTripEditOpen(true)}
                isMinimized={screen !== 'plan'}
                activeTabLabel={TAB_LABELS[screen]}
            />

            <div className="flex-1 relative overflow-hidden">
                {screen === 'plan' ? (
                    <PlanScreen trip={trip} onSaveTrip={(t) => {
                        saveTrip(t);
                        setIsTripEditOpen(false); // ปิด Modal หลังเซฟ
                    }} />
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
                onLogout={() => {
                    if(confirm("Reset?")) logout(); // ยังใช้ confirm ได้ถ้ารีบ แต่แนะนำ Custom Modal
                }}
                onEditProfile={() => {
                    setIsDrawerOpen(false);
                    setTimeout(() => setIsProfileEditOpen(true), 200);
                }}
            />

            <EditTripModal
                isOpen={isTripEditOpen}
                onClose={() => setIsTripEditOpen(false)}
                onSave={(t) => {
                    saveTrip(t);
                    setIsTripEditOpen(false);
                }}
                initialTrip={trip}
            />

            <EditProfileModal
                isOpen={isProfileEditOpen}
                onClose={() => setIsProfileEditOpen(false)}
                currentUser={user}
                onSave={updateProfile}
            />
        </div>
    );
}

export default App;
