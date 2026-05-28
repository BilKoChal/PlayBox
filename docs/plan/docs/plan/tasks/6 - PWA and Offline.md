# Task 6 — PWA & Offline

**Phase:** 0.6
**Date:** 2026-05-28
**Status:** ✅ Complete

---

## Objective

Make PlayBox installable as a PWA with full offline support. Users should be able to install the app from the browser, and once cached, play games offline.

## Prerequisites

- Phases 0.1–0.5 complete
- `vite-plugin-pwa` and `workbox-window` already in devDependencies

## Implementation Steps

### Step 1: Generate PWA Icons
- Generated source icon via `z-ai-generate` (1024x1024)
- Resized to: icon-192.png, icon-512.png, icon-maskable-192.png, icon-maskable-512.png
- Generated favicon.ico (32x32)

### Step 2: Configure vite-plugin-pwa
- Added `VitePWA()` plugin to `vite.config.ts`
- `registerType: 'autoUpdate'` — SW updates automatically on deploy
- `includeAssets` — precache favicon, robots.txt, game thumbnails
- `manifest` — full PWA manifest with name, icons, shortcuts, categories
- `workbox.globPatterns` — precache all HTML, CSS, JS, ICO, PNG, SVG, WOFF2
- `workbox.runtimeCaching` — 5 strategies for game engines, chunks, thumbnails, fonts
- `workbox.skipWaiting + clientsClaim` — activate new SW immediately
- `workbox.navigateFallback` — SPA routing works offline

### Step 3: Register Service Worker
- Updated `src/main.tsx` with SW registration in production mode
- Added update listener that logs when new version is available
- Only registers in production (not dev mode)

### Step 4: Create useOnlineStatus Hook
- New `src/hooks/useOnlineStatus.ts`
- Tracks `navigator.onLine` with `online`/`offline` event listeners

### Step 5: Add Offline Banner
- Added `OfflineBanner` component to `App.tsx`
- Amber bar at top of screen: "You are offline — cached games are still playable!"
- Fixed position, z-50, disappears when back online

### Step 6: Update index.html
- Added full PWA meta tags: apple-mobile-web-app-capable, mobile-web-app-capable, msapplication-TileColor
- Added apple-touch-icon link
- Removed static manifest link (vite-plugin-pwa injects it)

### Step 7: Remove Static manifest.json
- Deleted `public/manifest.json` — vite-plugin-pwa generates `manifest.webmanifest` at build time

### Step 8: Clean Up Project
- Removed build artifacts from project root (capacitor.config.js, .d.ts, .tsbuildinfo, etc.)
- Removed pnpm-workspace.yaml
- Updated .gitignore to exclude *.config.js, *.config.d.ts, *.config.d.ts.map
- Removed dist/ folder

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `public/icons/icon-192.png` | Created | PWA standard icon 192x192 |
| `public/icons/icon-512.png` | Created | PWA standard icon 512x512 |
| `public/icons/icon-maskable-192.png` | Created | PWA maskable icon 192x192 |
| `public/icons/icon-maskable-512.png` | Created | PWA maskable icon 512x512 |
| `public/icons/icon-source.png` | Created | Source icon (1024x1024) |
| `public/favicon.ico` | Created | Favicon (32x32) |
| `src/hooks/useOnlineStatus.ts` | Created | Online/offline status hook |
| `vite.config.ts` | Modified | Added VitePWA plugin with Workbox config |
| `src/main.tsx` | Modified | Added SW registration + update listener |
| `src/App.tsx` | Modified | Added OfflineBanner component |
| `index.html` | Modified | Full PWA meta tags |
| `public/manifest.json` | Deleted | Replaced by vite-plugin-pwa generated manifest |
| `.gitignore` | Modified | Added *.config.js, *.config.d.ts patterns |

## Acceptance Criteria

- [x] PWA manifest generated at build time with correct name, icons, theme
- [x] Service worker generated (sw.js + workbox runtime)
- [x] 31 entries precached (app shell)
- [x] Runtime caching for game engines, chunks, thumbnails, fonts
- [x] Offline fallback via navigateFallback
- [x] Offline banner shows when browser goes offline
- [x] PWA icons at all required sizes
- [x] Build passes: tsc 0 errors, vite 84 modules, PWA 31 precache entries
