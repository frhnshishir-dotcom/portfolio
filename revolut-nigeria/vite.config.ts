import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the production build can be served from any sub-path
// (for example a GitHub Pages project folder) without changes.
export default defineConfig({
  base: './',
  plugins: [react()],
  css: {
    modules: { localsConvention: 'camelCaseOnly' },
  },
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
  },
  server: { host: true },
  preview: { host: true },
});
