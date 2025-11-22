import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // === เพิ่ม Block นี้เข้ามา ===
  server: {
    // 1. อนุญาตให้ ngrok Host นี้เข้าถึงได้
    allowedHosts: [
      '86f96c3aabec.ngrok-free.app',
      'localhost',
      '127.0.0.1',
      // *เพิ่ม Wildcard เพื่อกัน Host เปลี่ยนในการรันครั้งหน้า*
      '*.ngrok-free.app',
    ],
    // 2. ตั้ง host เป็น true เพื่อให้เข้าถึงจากภายนอกได้
    host: true,
  },
  // ==========================

})
