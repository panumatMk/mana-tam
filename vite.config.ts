import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// ดึงชื่อ Repository จาก URL ของ Git (สมมติว่าชื่อ repo คือ my-travel-app)
// **FIX THIS:** กรุณาเปลี่ยน 'my-travel-app' เป็นชื่อ Repository จริงของคุณ
const repoName = 'my-travel-app';

export default defineConfig({
  plugins: [react()],

  // 💡 สำคัญ: ตั้งค่า Base Path เพื่อให้ Vite รู้ว่าไฟล์จะอยู่ใต้ /repo-name/
  base: `/${repoName}/`,

  server: {
    host: true,
    allowedHosts: ['*', 'localhost', '127.0.0.1'],
  },

  build: {
    outDir: 'dist', // โฟลเดอร์ที่ Build เสร็จแล้วจะไปอยู่
    sourcemap: true,
  },
});
