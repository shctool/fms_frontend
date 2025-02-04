import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Change this to your desired port
    proxy: {
    '/api': {  // Proxy all API requests
        target: 'https://fms-backend-imgd.onrender.com',  // Your backend URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')  // Remove "/api" prefix
    }
  }
}
});
