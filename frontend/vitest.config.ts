import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Minimal type relaxation to avoid duplicate vite type mismatch (vite vs vitest's internal vite).
  // This affects only this config file.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [react() as any],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'lcov'],
    },
  },
});
