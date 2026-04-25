import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/prescriptions': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/medicine': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/reminders': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/chatbot': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/voice': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/upload-prescription': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/docs': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/redoc': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    }
  }
});
