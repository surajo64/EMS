import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../server/frontend-build', // ✅ this prevents overwriting backend public
    emptyOutDir: true,
  }
});
