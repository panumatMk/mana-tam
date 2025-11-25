import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'; // 1. Import Router tools
import { Header } from './components/layout/Header';
import { HamburgerDrawer } from './components/layout/HamburgerDrawer';
import { EditProfileModal } from './features/auth/EditProfileModal';
import { PlanScreen } from './features/plan/PlanScreen';
import { EditTripModal } from './features/plan/EditTripModal';
import { ActivityModal } from './features/plan/ActivityModal'; // Import สำหรับ create plan (Activity)
import BillScreen from "./features/bill/BillScreen";
// import { CreateBillModal } from './features/bill/CreateBillModal'; // Import สำหรับ create/update bill
import { useAuth } from './hooks/useAuth';
import { useTrip } from './hooks/useTrip';
import { Button } from "./components/ui/Button";
import { MOCKGROUPID } from "./config/constants.ts";
// import CreateBillModal from "./features/bill/CreateBillModal.tsx";
import {BillModalWrapper} from "./features/bill/BillModalWrapper.tsx";

function App() {
    const { user, isLoading, loginWithLine, updateProfile, logout } = useAuth();
    const { trip, saveTrip, joinTripByHostId } = useTrip();

    // ไม่ใช้ state screen แล้ว แต่จะใช้ navigate แทน
    const navigate = useNavigate();
    const location = useLocation();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

    // เช็คว่า User อยู่หน้าไหน เพื่อแสดงผล Header ให้ถูก
    const isPlanTab = location.pathname.startsWith('/plan');
    const activeTabLabel = isPlanTab ? 'Plan' : 'Bill';

    useEffect(() => {
        if (!user?.id) return;

        joinTripByHostId(MOCKGROUPID).then(() => {
            // ลบโค้ด clear history ออกชั่วคราว เพื่อให้ URL ทำงานได้ตาม Router
        });
    }, [user?.id]);

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

    // ฟังก์ชันช่วยปิด Modal และกลับไปหน้าหลักของ Tab นั้นๆ
    const closeAndBack = (tab: 'plan' | 'bill') => {
        navigate(`/${tab}`);
    };

    const USERS = (trip.participants && trip.participants.length > 0)
        ? trip.participants
        : [user];

    return (
        <div className="h-full flex flex-col bg-[#F3F4F6] w-full mx-auto shadow-2xl overflow-hidden">
            {/* Header ใช้ navigate ในการเปลี่ยนหน้า */}
            <Header
                user={user}
                trip={trip}
                participants={trip.participants}
                onMenuClick={() => setIsDrawerOpen(true)}
                onEdit={() => navigate('/plan/update')} // เปลี่ยนเป็น Route
                isMinimized={!isPlanTab}
                activeTabLabel={activeTabLabel}
                // (ถ้า Header มี Tab ให้กด ต้องแก้ props onTabChange ให้ใช้ navigate('/plan') หรือ navigate('/bill') ด้วยนะครับ)
            />

            <div className="flex-1 relative overflow-hidden">
                <Routes>
                    {/* Default Route: Redirect ไป /plan */}
                    <Route path="/" element={<Navigate to="/plan" replace />} />

                    {/* --- Plan Routes --- */}
                    <Route path="/plan" element={
                        <PlanScreen trip={trip} onSaveTrip={saveTrip} />
                    } />

                    {/* Create Plan (Activity) */}
                    <Route path="/plan/create" element={
                        <>
                            <PlanScreen trip={trip} onSaveTrip={saveTrip} />
                            <ActivityModal
                                isOpen={true}
                                onClose={() => closeAndBack('plan')}
                                onSave={() => { /* Logic save */ closeAndBack('plan'); }}
                                mode="create"
                            />
                        </>
                    } />

                    {/* Update Plan (Trip Settings) */}
                    <Route path="/plan/update" element={
                        <>
                            <PlanScreen trip={trip} onSaveTrip={saveTrip} />
                            <EditTripModal
                                isOpen={true}
                                onClose={() => closeAndBack('plan')}
                                onSave={(t) => {
                                    saveTrip(t);
                                    closeAndBack('plan');
                                }}
                                initialTrip={trip}
                            />
                        </>
                    } />

                    {/* --- Bill Routes --- */}
                    <Route path="/bill" element={<BillScreen user={user}/>} />

                    {/* Create Bill */}
                    <Route path="/bill/create" element={
                        <>
                            <BillModalWrapper user={user} mode="CREATE" />
                        </>
                    } />

                    {/* Update Bill */}
                    <Route path="/bill/update/:billId" element={
                        <>
                            <BillModalWrapper user={user} mode="UPDATE" />
                            {/*<BillScreen user={user} mode={'UPDATE'}/>*/}
                        </>
                    } />
                </Routes>
            </div>

            <HamburgerDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onNavigate={(screen) => navigate(`/${screen}`)} // แก้ให้ใช้ navigate
                activeScreen={isPlanTab ? 'plan' : 'bill'}
                user={user}
                onLogout={() => {
                    if(confirm("ออกจากระบบ?")) logout();
                }}
                onEditProfile={() => {
                    setIsDrawerOpen(false);
                    setTimeout(() => setIsProfileEditOpen(true), 200);
                }}
            />

            {/* Profile Modal ยังคงเป็น Global Modal ไม่ต้องเป็น Route ก็ได้ หรือจะทำเป็น Route ก็ได้ตามชอบ */}
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
