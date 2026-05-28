import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'games/sudoku/thumbnail.png',
        'games/snake/thumbnail.png',
        'games/breakout/thumbnail.png',
      ],
      manifest: {
        name: 'PlayBox — Game Station',
        short_name: 'PlayBox',
        description:
          'PlayBox — A fun game station with 55 casual games for kids and families!',
        start_url: '/PlayBox/',
        scope: '/PlayBox/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#FFB830',
        background_color: '#FFFBF0',
        categories: ['games', 'entertainment', 'kids'],
        lang: 'en',
        dir: 'ltr',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [],
        shortcuts: [
          {
            name: 'Play Games',
            url: '/PlayBox/',
            description: 'Browse and play games',
          },
        ],
      },
      workbox: {
        // Precache the app shell (HTML, CSS, JS bundles)
        globPatterns: [
          '**/*.{html,css,js,ico,png,svg,woff2}',
        ],
        // Runtime caching for game assets loaded on demand
        runtimeCaching: [
          {
            // Cache game engine chunks (Kaboom, Phaser) on first play
            urlPattern: /\/assets\/engine-.*\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'engine-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache game chunk files on first play
            urlPattern: /\/assets\/index-.*\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'game-chunks-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache game thumbnails and static assets
            urlPattern: /\/games\/.*\.(png|jpg|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'game-assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache Google Fonts files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        // Skip waiting and claim clients immediately on update
        skipWaiting: true,
        clientsClaim: true,
        // Navigation fallback for SPA routing
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: false, // Don't register SW in dev mode
      },
    }),
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
    // Disable minification — Kaboom v3000 ships pre-minified and
    // re-minifying with esbuild causes "assignment to undeclared variable" errors.
    // Also keeps code readable for debugging.
    minify: false,
    // Generate sourcemaps for production debugging
    sourcemap: true,
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
