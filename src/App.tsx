import { useState, useEffect } from 'react';
import { Calendar, PenLine, X, AlertCircle } from 'lucide-react';
import RegistrationScreen from './components/RegistrationScreen';
import BottomNav from './components/BottomNav';
import PlanScreen from './components/PlanScreen';

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

    const [activeTab, setActiveTab] = useState('plan');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formErrors, setFormErrors] = useState<{ title?: string; startDate?: string; endDate?: string }>({});

    useEffect(() => {
        const savedUser = localStorage.getItem('travelApp_user');
        const savedTrip = localStorage.getItem('travelApp_trip');
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedTrip) setTrip(JSON.parse(savedTrip));
    }, []);

    const handleRegister = (newUser: User) => {
        setUser(newUser);
        localStorage.setItem('travelApp_user', JSON.stringify(newUser));
        if (!localStorage.getItem('travelApp_trip')) {
            const defaultTrip = { title: "My Trip ✈️", startDate: "TBD", endDate: "TBD" };
            setTrip(defaultTrip);
            localStorage.setItem('travelApp_trip', JSON.stringify(defaultTrip));
        }
    };

    const handleSaveTrip = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const newTitle = formData.get('title') as string;
        const newStart = formData.get('startDate') as string;
        const newEnd = formData.get('endDate') as string;

        const errors: { title?: string; startDate?: string; endDate?: string } = {};
        let hasError = false;

        if (!newTitle.trim()) { errors.title = "กรุณาตั้งชื่อทริป"; hasError = true; }
        if (!newStart) { errors.startDate = "ระบุวันไป"; hasError = true; }
        if (!newEnd) { errors.endDate = "ระบุวันกลับ"; hasError = true; }
        if (newStart && newEnd && new Date(newStart) > new Date(newEnd)) {
            errors.endDate = "วันกลับต้องอยู่หลังวันไป";
            hasError = true;
        }

        if (hasError) { setFormErrors(errors); return; }

        const newTrip = { title: newTitle, startDate: newStart, endDate: newEnd };
        setTrip(newTrip);
        localStorage.setItem('travelApp_trip', JSON.stringify(newTrip));
        setIsEditModalOpen(false);
        setFormErrors({});
    };

    const handleReset = () => {
        setUser(null);
        localStorage.removeItem('travelApp_user');
        localStorage.removeItem('travelApp_trip');
        window.location.reload();
    };

    const renderStatusBadge = () => {
        if (trip.startDate === 'TBD') return null;
        const today = new Date(); today.setHours(0,0,0,0);
        const start = new Date(trip.startDate); start.setHours(0,0,0,0);
        const diffDays = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (today < start) return <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-100 flex flex-col items-center min-w-[70px]"><span className="text-[8px] uppercase font-bold opacity-60 tracking-wider">Coming in</span><div className="leading-none mt-0.5"><span className="text-base font-bold">{diffDays}</span><span className="text-[9px] font-bold ml-0.5">Days</span></div></div>;
        return <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg border border-orange-100 flex flex-col items-center min-w-[70px]"><span className="text-[8px] uppercase font-bold opacity-80 tracking-wider">Enjoy!</span></div>;
    };

    if (!user) return <RegistrationScreen onComplete={handleRegister} />;
    const isTripSetup = trip.startDate !== 'TBD';

    return (
        <div className="h-full flex flex-col bg-F3F4F6 w-full max-w-md mx-auto shadow-2xl overflow-hidden"> {/* Container หลักล็อคความสูง */}

            {/* === HEADER (Fixed Height) === */}
            <div className="bg-white px-5 pt-10 pb-4 shadow-sm rounded-b-3xl flex-none z-20 relative">
                <div className="flex justify-between items-start mb-2 h-[50px]">
                    <div className="flex items-start gap-2 pt-1">
                        <h1 className={`text-3xl font-bold leading-tight max-w-[200px] truncate ${!isTripSetup ? 'text-gray-300' : 'text-gray-800'}`}>{trip.title}</h1>
                        <button onClick={() => setIsEditModalOpen(true)} className="text-gray-300 hover:text-green-500 bg-gray-50 p-1.5 rounded-full transition-colors mt-1"><PenLine className="w-4 h-4" /></button>
                    </div>
                    {renderStatusBadge()}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 pr-3 pl-1 py-1 rounded-full border border-gray-100">
                        <img src={user.avatar} className="w-6 h-6 rounded-full bg-white p-0.5 border border-gray-200"/>
                        <span className="text-xs font-bold text-gray-600">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                        <Calendar className={`w-3.5 h-3.5 ${isTripSetup ? 'text-green-500' : 'text-gray-300'}`} />
                        <span>{isTripSetup ? `${trip.startDate} - ${trip.endDate}` : 'ยังไม่ระบุวัน'}</span>
                    </div>
                </div>
            </div>

            {/* === CONTENT AREA (Flex-1 & Hidden Overflow) === */}
            <div className="flex-1 relative overflow-hidden">
                {activeTab === 'plan' && <PlanScreen tripDate={trip.startDate} onSetupTrip={() => setIsEditModalOpen(true)} />}
                {activeTab !== 'plan' && (
                    <div className="h-full overflow-y-auto p-10 text-center text-gray-400">
                        Coming Soon...
                        <div className="mt-10"><button onClick={handleReset} className="text-[10px] text-red-300 underline">Reset App</button></div>
                    </div>
                )}
            </div>

            {/* === BOTTOM NAV (Fixed Height) === */}
            <div className="flex-none z-20 relative">
                <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* === MODAL === */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
                        <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200"><X className="w-4 h-4"/></button>
                        <div className="mb-6 text-center">
                            <h2 className="text-xl font-bold text-gray-800">ตั้งค่าทริป ✈️</h2>
                            <p className="text-xs text-gray-400 mt-1">ระบุรายละเอียดการเดินทางของคุณ</p>
                        </div>
                        <form onSubmit={handleSaveTrip} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">ชื่อทริป <span className="text-red-500">*</span></label>
                                <input name="title" type="text" defaultValue={trip.title === "My Trip ✈️" ? "" : trip.title} placeholder="เช่น Japan 2025" className={`w-full bg-gray-50 border rounded-xl p-3 font-bold focus:outline-none focus:border-green-500 ${formErrors.title ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} onChange={() => setFormErrors({...formErrors, title: undefined})}/>
                                {formErrors.title && <div className="flex items-center gap-1 mt-1 text-red-500"><AlertCircle className="w-3 h-3" /><span className="text-[10px] font-bold">{formErrors.title}</span></div>}
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">วันไป <span className="text-red-500">*</span></label>
                                    <input name="startDate" type="date" defaultValue={trip.startDate !== 'TBD' ? trip.startDate : ''} className={`w-full bg-gray-50 border rounded-xl p-3 text-sm focus:outline-none focus:border-green-500 ${formErrors.startDate ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} onChange={() => setFormErrors({...formErrors, startDate: undefined})} />
                                    {formErrors.startDate && <span className="text-[10px] text-red-500 font-bold mt-1 block">{formErrors.startDate}</span>}
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">วันกลับ <span className="text-red-500">*</span></label>
                                    <input name="endDate" type="date" defaultValue={trip.endDate !== 'TBD' ? trip.endDate : ''} className={`w-full bg-gray-50 border rounded-xl p-3 text-sm focus:outline-none focus:border-green-500 ${formErrors.endDate ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} onChange={() => setFormErrors({...formErrors, endDate: undefined})}/>
                                    {formErrors.endDate && <span className="text-[10px] text-red-500 font-bold mt-1 block">{formErrors.endDate}</span>}
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-200 mt-4 hover:bg-green-700 active:scale-95 transition-all">บันทึกข้อมูล</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
