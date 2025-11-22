import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// FIX: ใช้ชื่อ Repository ของคุณ
const repoName = 'mana-tam';

export default defineConfig({
  plugins: [react()],

  // 💡 FIX 1: ตั้งค่า Base Path ให้ชี้ไปที่ชื่อ Repository
  base: `/${repoName}/`,

  server: {
    host: true,
    allowedHosts: ['*', 'localhost', '127.0.0.1'],
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
