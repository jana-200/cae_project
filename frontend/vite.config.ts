// eslint-disable-next-line spaced-comment
/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    deps: {
      inline: [
        '@mui/material',
        '@mui/x-charts',
        '@mui/icons-material',
        '@mui/x-data-grid',
      ],
    },
  },

  resolve: {
    alias: {
      '@mui/material/styles': '@mui/material/styles/index.js',
    },
  },

  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled'],
  },

  plugins: [
    react(),
    checker({
      typescript: true,
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
