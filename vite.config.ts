import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // PWA plugin will be added in Phase 0.6
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // Base path for GitHub Pages deployment
  base: '/PlayBox/',

  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Manual chunks for engine code splitting
        // Users only download engines for games they play
        manualChunks: {
          'engine-kaboom': ['kaboom'],
          'engine-phaser': ['phaser'],
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-search': ['fuse.js'],
          'vendor-storage': ['dexie'],
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 400,
  },

  // Development server
  server: {
    port: 3000,
    open: true,
  },

  // Preview server (for testing production build locally)
  preview: {
    port: 4000,
  },
});
