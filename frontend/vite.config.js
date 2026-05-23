import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import tailwindcss from '@tailwindcss/vite'


// Load environment variables from the .env file
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: process.env.VITE_REACT_APP_BACKEND_BASEURL,
        changeOrigin: true,
        secure: false,
        credentials: 'include'
      },
    }
  },
})
