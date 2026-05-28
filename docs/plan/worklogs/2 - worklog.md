# Worklog — Task 2: Platform Shell (Basic UI)

**Task ID:** 2  
**Phase:** 0.2  
**Start Time:** 2026-05-28  
**End Time:** 2026-05-28  
**Status:** Complete ✅

---

## What Was Done

1. **Updated `App.tsx`** with full provider stack and routing:
   - ThemeProvider + SoundProvider + GameProvider wrapping the app
   - BrowserRouter with routes: `/`, `/game/:gameId`, `/favorites`, `/settings`
   - Game registry integration (loadGame, getGameMeta)
   - Toast notification system wired into favorite toggles
   - Layout: Header + main content + Footer

2. **Built UI Components** (`src/components/ui/`):
   - `Button.tsx` — 4 variants (primary, secondary, ghost, danger), 3 sizes, icon support
   - `Toggle.tsx` — Switch component for sound/theme toggles
   - `SearchBar.tsx` — Search input with clear button, form submission, debouncing
   - `Badge.tsx` — Category badge with emoji + color from design tokens
   - `Modal.tsx` — Overlay dialog with backdrop, ESC close, scroll lock

3. **Built Feedback Components** (`src/components/feedback/`):
   - `Toast.tsx` — Toast notification system with useToast hook, auto-dismiss
   - `ScoreDisplay.tsx` — Animated score counter with tabular-nums
   - `EmptyState.tsx` — Empty state with icon, title, description, action

4. **Built Layout Components** (`src/components/layout/`):
   - `Header.tsx` — Logo, search bar (desktop/mobile), navigation links, sound/theme toggles
   - Responsive: desktop nav links vs mobile bottom navigation bar
   - `Footer.tsx` — Simple branding footer

5. **Built Game Components** (`src/components/game/`):
   - `GameCard.tsx` — Thumbnail (emoji placeholder), category badge, difficulty stars, favorite heart, Play button, hover lift animation
   - `GameWrapper.tsx` — React ↔ PlayBoxGame lifecycle bridge (mount/unmount/pause/resume), visibility change handling, safety cleanup
   - `GameOverlay.tsx` — Loading spinner + error state with retry/back buttons

6. **Built Pages** (`src/pages/`):
   - `HomePage.tsx` — Category filter pills, responsive grid (1–4 columns), search integration, empty state
   - `GamePage.tsx` — Game loading with lazy import, difficulty selector, score display, back navigation, game info panel
   - `FavoritesPage.tsx` — Favorite games grid, clear all button, empty state with browse action
   - `SettingsPage.tsx` — Theme toggle, sound toggle, about section (version, platform, license)

7. **Added Custom Hooks**:
   - `useFavorites.ts` — localStorage persistence, max 20, toggle, clear
   - `useFullscreen.ts` — Web fullscreen API + Tauri/Capacitor bridge
   - `useSearch.ts` — Fuse.js search with query state

8. **Created `game-registry.generated.ts`** — Empty placeholder registry (no games yet)

9. **Fixed Tauri API build issue**:
   - Changed from `import('@tauri-apps/api/window')` to runtime `__TAURI_INTERNALS__` access
   - This prevents Rollup from trying to resolve the Tauri package during web builds
   - Removed module declaration from vite-env.d.ts
   - Removed external config from vite.config.ts

---

## Problems Encountered & Resolutions

| Problem | Resolution |
|---------|-----------|
| `useState` used instead of `useEffect` in GamePage | Changed to `useEffect` with proper dependency array |
| `Difficulty` enum imported as type, used as value | Changed to value import alongside type import for PlayBoxGame |
| `Suspense` imported but unused in GamePage | Removed unused import |
| `handleSearch` unused in HomePage | Renamed to `_handleSearch` with void expression |
| Tauri dynamic import fails Rollup build | Replaced with runtime `__TAURI_INTERNALS__` access pattern |
| Empty engine chunks in build | Expected — no games import them yet |

---

## Files Changed

### Created (17 new files):
- `src/components/ui/Button.tsx`
- `src/components/ui/Toggle.tsx`
- `src/components/ui/SearchBar.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/feedback/Toast.tsx`
- `src/components/feedback/ScoreDisplay.tsx`
- `src/components/feedback/EmptyState.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/game/GameCard.tsx`
- `src/components/game/GameWrapper.tsx`
- `src/components/game/GameOverlay.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/GamePage.tsx`
- `src/pages/FavoritesPage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/hooks/useFavorites.ts`
- `src/hooks/useFullscreen.ts`
- `src/hooks/useSearch.ts`
- `src/game-registry.generated.ts`

### Modified (5 files):
- `src/App.tsx` — Complete rewrite with providers, routing, game registry
- `src/lib/fullscreen.ts` — Runtime Tauri API access instead of static imports
- `src/vite-env.d.ts` — Removed Tauri module declaration
- `vite.config.ts` — Removed external Tauri config

---

## Tests Run & Results

| Test | Command | Result |
|------|---------|--------|
| TypeScript compilation | `npx tsc -b` | ✅ Pass (zero errors) |
| Vite production build | `npx vite build` | ✅ Pass (8 chunks, 4.29s) |

---

## Deviations from Task Plan

- GamePage uses `useEffect` for game loading instead of React.lazy/Suspense — more control over loading states
- Tauri API accessed via `__TAURI_INTERNALS__` instead of npm package — better for cross-platform builds
- Added Toast notification system (was planned for later, but needed for favorites UX)
- Mobile bottom navigation implemented as part of Header (plan had it as separate component)
