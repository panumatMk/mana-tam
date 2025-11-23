import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],

  // 🔴 ลบหรือแก้บรรทัด base เดิมที่เป็น '/mana-tam/' ออก
  // ✅ เปลี่ยนเป็น '/' หรือลบทิ้งไปเลย (ค่า Default คือ '/')
  base: '/',

  server: {
    host: true,
    allowedHosts: ['*', 'localhost', '127.0.0.1', '15ed17edb975.ngrok-free.app'],
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
