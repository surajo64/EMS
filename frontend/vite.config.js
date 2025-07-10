import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Vite default dev server port
  },
  build: {
    outDir: '../server/public', // Build directly into Express public folder
    emptyOutDir: true, // Clear the directory before building
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});