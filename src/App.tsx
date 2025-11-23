import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { HamburgerDrawer } from './components/layout/HamburgerDrawer';
import { EditProfileModal } from './features/auth/EditProfileModal';
import { PlanScreen } from './features/plan/PlanScreen';
import { EditTripModal } from './features/plan/EditTripModal';
import BillScreen from "./features/bill/BillScreen";
import { useAuth } from './hooks/useAuth';
import { useTrip } from './hooks/useTrip';
import { Button } from "./components/ui/Button"; // Import Button

function App() {
    const { user, isLoading, loginWithLine, updateProfile, logout } = useAuth();
    const { trip, saveTrip, joinTripByHostId } = useTrip();

    const [screen, setScreen] = useState<'plan' | 'bill'>('plan');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isTripEditOpen, setIsTripEditOpen] = useState(false);
    const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

    useEffect(() => {
        // 1. ต้องมี User Login แล้วถึงจะจอยได้
        if (!user?.id) return;

        // 2. อ่านค่าจาก URL (?join=xxxx)
        const queryParams = new URLSearchParams(window.location.search);
        const hostIdToJoin = queryParams.get('join');

        if (hostIdToJoin) {
            console.log("🔗 Detect invite link for host:", hostIdToJoin);

            // 3. สั่งจอยทริป
            joinTripByHostId(hostIdToJoin).then(() => {
                // 4. (Optional) เคลียร์ URL ให้สะอาด
                window.history.replaceState({}, document.title, "/");
            });
        }
    }, [user]); // รันเมื่อ user โหลดเสร็จ (Login สำเร็จ)

    const handleShareLink = () => {
        if (!user?.id) return;
        const link = `${window.location.origin}/?join=${user.id}`;
        navigator.clipboard.writeText(link);
        alert("คัดลอกลิงก์แล้ว! ส่งให้เพื่อนในไลน์ได้เลย 🔗");
    };

    // 1. ถ้ากำลังโหลด LIFF ให้แสดง Loading
    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">กำลังเชื่อมต่อ LINE...</p>
                </div>
            </div>
        );
    }

    // 2. ถ้ายังไม่มี User (ยังไม่ Login) ให้แสดงปุ่ม Login LINE
    if (!user) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-white p-6 space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-extrabold text-green-600">Mana Travel</h1>
                    <p className="text-gray-400">เข้าสู่ระบบเพื่อเริ่มจัดการทริป</p>
                </div>
                <Button onClick={loginWithLine} className="bg-[#06C755] hover:bg-[#05b34c] text-white w-full max-w-xs py-4 text-lg shadow-green-200">
                    Log in with LINE
                </Button>
            </div>
        );
    }

    // 3. ถ้า Login แล้ว แสดงแอปปกติ
    const TAB_LABELS = { plan: 'Plan', bill: 'Bill' };

    return (
        <div className="h-full flex flex-col bg-[#F3F4F6] w-full max-w-md mx-auto shadow-2xl overflow-hidden">
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
                        setIsTripEditOpen(false);
                    }} />
                ) : (
                    <BillScreen user={user}/>
                )}
            </div>

            <HamburgerDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onNavigate={setScreen}
                activeScreen={screen}
                user={user}
                onLogout={() => {
                    if(confirm("ออกจากระบบ?")) logout();
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
