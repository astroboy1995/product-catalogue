import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'client/dist' },
  server: { proxy: { '/api': 'http://localhost:3001' } },
  test: { environment: 'jsdom', setupFiles: './client/src/test-setup.ts' },
});
