import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../server/public',  // Build into Express public folder
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['axios', 'lodash'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,  // Increase warning limit to 1000kb
  }
});