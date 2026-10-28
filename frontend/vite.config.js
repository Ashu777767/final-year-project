import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // If 5173 is busy Vite falls back to the next free port. That is fine now
    // because the dev server proxies /api to the backend (same origin), so no
    // CORS whitelist can go stale.
    strictPort: false,
    // Bind every local interface (IPv4 + IPv6) so both http://localhost:5173
    // and http://127.0.0.1:5173 reach the dev server. Without this, Vite binds
    // only ::1 and 127.0.0.1 is refused (ERR_CONNECTION_REFUSED).
    host: true,
    open: false,
    proxy: {
      // Same-origin API access in development - removes CORS from the picture
      // entirely and keeps working on whatever port Vite ends up using.
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:8085',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:8085',
        changeOrigin: true,
      },
    },
  },
});
