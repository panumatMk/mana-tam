import React from 'react';
import {X, LogOut, Edit2, Map, Receipt, Trash2, ChevronLeft} from 'lucide-react';
import type { User } from '../../types/user.types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (screen: 'plan' | 'bill') => void;
    activeScreen: string;
    user: User;
    onLogout: () => void;
    onEditProfile: () => void; // Call Edit Profile Modal
}

export const HamburgerDrawer: React.FC<Props> = ({ isOpen, onClose, onNavigate, activeScreen, user, onLogout, onEditProfile }) => {

    const handleClearCache = () => {
        if (confirm("ต้องการล้างข้อมูลในเครื่องทั้งหมดใช่ไหม? (แอปจะรีเซ็ตใหม่)")) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 z-[55] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                className={`fixed inset-y-0 left-0 w-[80%] max-w-[300px] bg-white shadow-2xl z-[60] flex flex-col transition-transform duration-300 ease-out rounded-r-3xl overflow-hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-black/5 active:scale-90 transition-all duration-200 z-20"
                >
                    <ChevronLeft className="w-6 h-6" strokeWidth={3} />
                </button>

                {/* Profile Header (เพิ่มปุ่ม Edit) */}
                <div className="pt-14 pb-8 px-6 bg-white relative">
                    <div className="flex items-center gap-4">
                        <div className="relative group cursor-pointer">
                            <img
                                src={user.avatar}
                                className="w-16 h-16 drop-shadow-lg hover:scale-110 transition-transform filter hover:brightness-110"
                                alt="avatar"
                            />
                            {/*coming soon*/}
                            {/*<button onClick={onEditProfile} className="absolute bottom-0 right-0 bg-white p-0.5 rounded-full shadow-sm border border-gray-100 text-gray-500">*/}
                            {/*    <Edit2 className="w-3 h-3" />*/}
                            {/*</button>*/}
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <h2 className="text-xl font-extrabold text-gray-800 leading-tight truncate">
                                {user.name}
                            </h2>
                            {/* Guanyin Element: Status Bar */}
                            <p className="text-xs text-orange-400 font-bold mt-0.5">
                                {/*<span className="text-red-500">บอทเตือน:</span> ไม่ได้ล็อกอินนานแล้ว! 😠*/}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mx-6 border-b border-gray-100 mb-6"></div>

                {/* Main Navigation (Minimal Line Icons) */}
                <nav className="flex-1 px-5 space-y-2 overflow-y-auto">

                    {/* Plan Button */}
                    <button
                        onClick={() => { onNavigate('plan'); onClose(); }}
                        className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all group ${activeScreen === 'plan' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${activeScreen === 'plan' ? 'bg-white shadow-sm text-green-600' : 'bg-gray-100 text-gray-400 group-hover:bg-white group-hover:shadow-sm'}`}>
                            <Map className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold">Plan</div>
                            <div className="text-[10px] opacity-70 font-medium">แผนเที่ยว</div>
                        </div>
                    </button>

                    {/* Bill Button */}
                    <button
                        onClick={() => { onNavigate('bill'); onClose(); }}
                        className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all group ${activeScreen === 'bill' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${activeScreen === 'bill' ? 'bg-white shadow-sm text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:bg-white group-hover:shadow-sm'}`}>
                            <Receipt className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold">Bill</div>
                            <div className="text-[10px] opacity-70 font-medium">ค่าใช้จ่าย</div>
                        </div>
                    </button>

                </nav>

                {/* Footer Actions */}
                <div className="p-6 mt-auto space-y-2">

                    {/* ปุ่ม Clear Cache (โคตรพิษภัย) */}
                    <button
                        onClick={handleClearCache}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-orange-500 bg-orange-50 rounded-xl text-xs font-bold hover:bg-orange-100 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" /> ล้างข้อมูลเครื่อง (อันตรายนะ!)
                    </button>

                    {/* Disabled Logout */}
                    <button
                        disabled
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-300 bg-gray-50 rounded-xl text-xs font-bold cursor-not-allowed opacity-60"
                    >
                        <LogOut className="w-4 h-4" /> ออกจากระบบ
                    </button>
                </div>
            </div>
        </>
    );
};
