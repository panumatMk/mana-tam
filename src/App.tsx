import React, { useState, useEffect } from 'react';
import RegistrationScreen from './components/main/RegistrationScreen.tsx';
import BottomNav from './components/main/BottomNav.tsx';
import PlanScreen from './components/plan/PlanScreen.tsx';
import Header from './components/main/Header.tsx';
import EditTripModal from './components/main/EditTripModal.tsx';
import VoteScreen from "./components/vote/VoteScreen.tsx";
import TaskScreen from "./components/task/TaskScreen.tsx";
import RandomWinnerModal from "./components/random/randomWinnerModal.tsx";
import CostScreen from "./components/cost/CostScreen.tsx";

interface User {
    name: string;
    avatar: string;
}

interface Trip {
    title: string;
    startDate: string;
    endDate: string;
}

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [trip, setTrip] = useState<Trip>({
        title: "My Trip ✈️",
        startDate: "TBD",
        endDate: "TBD"
    });

    // --- MOCK DATA 5 คน (สำหรับสุ่ม) ---
    const MOCK_GROUP_USERS = [
        { id: 'u1', name: 'ตั้ง', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
        { id: 'u2', name: 'บอน', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
        { id: 'u3', name: 'ดัชชี่', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max' },
        { id: 'u4', name: 'โย', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nana' },
        { id: 'u5', name: 'สู', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ploy' },
    ];

    const [activeTab, setActiveTab] = useState('plan');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRandomModalOpen, setIsRandomModalOpen] = useState(false); // State เปิดปิดเกมสุ่ม

    // --- Load Data ---
    useEffect(() => {
        const savedUser = localStorage.getItem('travelApp_user');
        const savedTrip = localStorage.getItem('travelApp_trip');
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedTrip) setTrip(JSON.parse(savedTrip));
    }, []);

    // --- Actions ---
    const handleRegister = (newUser: User) => {
        setUser(newUser);
        localStorage.setItem('travelApp_user', JSON.stringify(newUser));
        if (!localStorage.getItem('travelApp_trip')) {
            const defaultTrip = { title: "My Trip ✈️", startDate: "TBD", endDate: "TBD" };
            setTrip(defaultTrip);
            localStorage.setItem('travelApp_trip', JSON.stringify(defaultTrip));
        }
    };

    const handleSaveTrip = (newTrip: Trip) => {
        setTrip(newTrip);
        localStorage.setItem('travelApp_trip', JSON.stringify(newTrip));
        setIsEditModalOpen(false);
    };

    const handleReset = () => {
        setUser(null);
        localStorage.removeItem('travelApp_user');
        localStorage.removeItem('travelApp_trip');
        window.location.reload();
    };

    if (!user) return <RegistrationScreen onComplete={handleRegister} />;

    return (
        <div className="h-full flex flex-col bg-F3F4F6 w-full max-w-md mx-auto shadow-2xl overflow-hidden">

            {/* 1. HEADER */}
            <Header
                user={user}
                trip={trip}
                onEdit={() => setIsEditModalOpen(true)}
                onRandomClick={() => setIsRandomModalOpen(true)}
            />

            {/* 2. CONTENT AREA (อัปเดตตรงนี้) */}
            <div className="flex-1 relative overflow-hidden">

                {/* หน้า Plan */}
                {activeTab === 'plan' && (
                    <PlanScreen
                        tripDate={trip.startDate}
                        onSetupTrip={() => setIsEditModalOpen(true)}
                    />
                )}

                {/* หน้า Vote (เพิ่มเข้ามาใหม่) */}
                {activeTab === 'vote' && <VoteScreen />}

                {activeTab === 'task' && <TaskScreen />}

                {activeTab === 'cost' && <CostScreen />}

                {/* หน้าอื่นๆ ที่ยังไม่ได้ทำ (Coming Soon) */}
                {activeTab !== 'plan' && activeTab !== 'vote' && (
                    <div className="h-full overflow-y-auto p-10 text-center text-gray-400">
                        Coming Soon... ({activeTab})
                        <div className="mt-10">
                            <button onClick={handleReset} className="text-[10px] text-red-300 underline">
                                Reset App
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-none z-20 relative">
                <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <EditTripModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveTrip}
                initialTrip={trip}
            />

            <RandomWinnerModal
                isOpen={isRandomModalOpen}
                onClose={() => setIsRandomModalOpen(false)}
                users={MOCK_GROUP_USERS} // ส่งรายชื่อ 5 คนเข้าไป
            />

        </div>
    );
}

export default App;
