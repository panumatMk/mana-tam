// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ค่าเหล่านี้ควรอยู่ใน .env (VITE_FIREBASE_API_KEY, ฯลฯ)
// แต่เพื่อความง่ายในตอนนี้ ใส่ตรงๆ ไปก่อน แล้วค่อยย้ายไป .env ทีหลังได้ครับ
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "ใส่_API_KEY_จาก_FIREBASE_CONSOLE",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ใส่_AUTH_DOMAIN",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ใส่_PROJECT_ID",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ใส่_STORAGE_BUCKET",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "ใส่_MESSAGING_SENDER_ID",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "ใส่_APP_ID"
};

// เริ่มต้น Firebase App
const app = initializeApp(firebaseConfig);

// Export Database เพื่อเอาไปใช้ที่อื่น
export const db = getFirestore(app);
