# Worklog — Task 6: PWA & Offline

**Task ID:** 6
**Phase:** 0.6
**Start Time:** 2026-05-28
**End Time:** 2026-05-28
**Status:** Complete ✅

---

## What Was Done

1. **Project Cleanup**:
   - Removed build artifacts from project root: `capacitor.config.js`, `capacitor.config.d.ts`, `capacitor.config.d.ts.map`, `vite.config.js`, `vite.config.d.ts`, `vite.config.d.ts.map`, `tsconfig.tsbuildinfo`, `tsconfig.node.tsbuildinfo`, `pnpm-workspace.yaml`
   - Removed `dist/` folder
   - Updated `.gitignore` to exclude `*.config.js`, `*.config.d.ts`, `*.config.d.ts.map`

2. **Generated PWA Icons**:
   - Used `z-ai-generate` to create source icon (1024x1024)
   - Used Python PIL to resize to: icon-192.png, icon-512.png, icon-maskable-192.png, icon-maskable-512.png
   - Generated favicon.ico (32x32)

3. **Configured vite-plugin-pwa** in `vite.config.ts`:
   - `registerType: 'autoUpdate'` — SW updates automatically
   - `includeAssets` — precache favicon, robots.txt, game thumbnails
   - Full `manifest` config with name, icons, shortcuts, categories
   - `workbox.globPatterns` — precache HTML, CSS, JS, ICO, PNG, SVG, WOFF2
   - 5 `runtimeCaching` strategies: engine chunks (30d), game chunks (7d), thumbnails (30d), Google Fonts CSS (1y), Google Fonts files (1y)
   - `skipWaiting: true`, `clientsClaim: true` — immediate activation
   - `navigateFallback: 'index.html'` — SPA routing works offline

4. **Registered Service Worker** in `src/main.tsx`:
   - Only registers in production (`import.meta.env.PROD`)
   - Listens for `updatefound` and `statechange` events
   - Logs when new version is available

5. **Created `useOnlineStatus` hook** (`src/hooks/useOnlineStatus.ts`):
   - Tracks `navigator.onLine` state
   - Listens to `online`/`offline` window events

6. **Added OfflineBanner component** in `src/App.tsx`:
   - Amber banner: "You are offline — cached games are still playable!"
   - Fixed position at top, z-50
   - Conditionally rendered based on `useOnlineStatus`

7. **Updated `index.html`**:
   - Added PWA meta tags: `mobile-web-app-capable`, `application-name`, `msapplication-TileColor`, `msapplication-navbutton-color`
   - Added `apple-touch-icon` and `icon` links
   - Removed static manifest `<link>` (vite-plugin-pwa injects it)

8. **Removed static `public/manifest.json`**:
   - vite-plugin-pwa generates `manifest.webmanifest` at build time

---

## Problems Encountered & Resolutions

| Problem | Resolution |
|---------|-----------|
| Build artifacts (.js, .d.ts, .tsbuildinfo) cluttering project root | Removed them and added gitignore patterns |
| `z-ai-generate` doesn't support 512x512 size | Generated at 1024x1024 then used PIL to resize |
| Static manifest.json conflicts with vite-plugin-pwa generated manifest | Removed static file, let plugin generate it |
| pnpm-workspace.yaml unnecessary for single-package project | Removed it |

---

## Files Changed

### Created (6 new files):
- `public/icons/icon-192.png` — PWA icon 192x192
- `public/icons/icon-512.png` — PWA icon 512x512
- `public/icons/icon-maskable-192.png` — Maskable icon 192x192
- `public/icons/icon-maskable-512.png` — Maskable icon 512x512
- `public/icons/icon-source.png` — Source icon 1024x1024
- `public/favicon.ico` — Favicon 32x32
- `src/hooks/useOnlineStatus.ts` — Online/offline status hook

### Modified (5 files):
- `vite.config.ts` — Added VitePWA plugin with full Workbox configuration
- `src/main.tsx` — Added SW registration + update listener
- `src/App.tsx` — Added OfflineBanner + useOnlineStatus import
- `index.html` — Full PWA meta tags, removed static manifest link
- `.gitignore` — Added *.config.js, *.config.d.ts, *.config.d.ts.map patterns

### Deleted (1 file):
- `public/manifest.json` — Replaced by vite-plugin-pwa generated manifest

---

## Build Results

- TypeScript: ✅ 0 errors
- Vite build: ✅ 84 modules, 4.13s
- PWA: ✅ generateSW mode, 31 precache entries (1301.86 KB)
- Files generated: `sw.js`, `workbox-835c8c05.js`, `manifest.webmanifest`, `registerSW.js`
- copy-404.js: ✅ Generated dist/404.html
