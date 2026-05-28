# Task 2 — Platform Shell (Basic UI) (Phase 0, Sub-Phase 0.2)

**Task ID:** 2  
**Phase:** 0.2  
**Status:** In Progress  
**Created:** 2026-05-28  
**Depends On:** Task 1 (Project Scaffolding & Configuration) ✅

---

## Objective

Build the complete platform shell: React Router navigation, Header, HomePage with game grid, GameCard, GameWrapper (React ↔ PlayBoxGame bridge), GamePage with lazy loading, and page stubs for Favorites and Settings. Wire up ThemeContext and SoundContext into App.tsx.

---

## Prerequisites

- ✅ Task 1 complete: all configs, types, contexts, lib stubs in place
- ✅ `src/types/game.ts` — PlayBoxGame interface defined
- ✅ `src/contexts/ThemeContext.tsx`, `SoundContext.tsx`, `GameContext.tsx` — contexts ready
- ✅ `src/lib/` — audio, storage, platform, fullscreen, search stubs ready

---

## Step-by-Step Implementation

### Step 1: Update `App.tsx`
- Wrap app in ThemeProvider + SoundProvider + GameProvider
- Set up React Router with routes: `/`, `/game/:gameId`, `/favorites`, `/settings`
- Add layout structure (Header + main content area)

### Step 2: Build UI Components (`src/components/ui/`)
- `Button.tsx` — Reusable button with variants (primary, secondary, ghost, danger)
- `Toggle.tsx` — Toggle switch for sound/theme
- `SearchBar.tsx` — Search input with debounce
- `Badge.tsx` — Category badge with emoji + color
- `Modal.tsx` — Overlay modal dialog

### Step 3: Build Feedback Components (`src/components/feedback/`)
- `Toast.tsx` — Toast notification system
- `ScoreDisplay.tsx` — Score display with animation
- `EmptyState.tsx` — Empty state with illustration text

### Step 4: Build Layout Components (`src/components/layout/`)
- `Header.tsx` — Logo, search bar, sound/theme toggles
- `Footer.tsx` — Simple footer

### Step 5: Build Game Components (`src/components/game/`)
- `GameCard.tsx` — Thumbnail, title, category badge, difficulty stars, favorite heart
- `GameWrapper.tsx` — Bridge between React and PlayBoxGame (mount/unmount/pause/resume lifecycle)
- `GameOverlay.tsx` — Loading/error overlay for game page

### Step 6: Build Pages (`src/pages/`)
- `HomePage.tsx` — Responsive game grid (1-4 columns), category pills
- `GamePage.tsx` — Game display with lazy loading via dynamic imports
- `FavoritesPage.tsx` — Favorites collection
- `SettingsPage.tsx` — Global settings

### Step 7: Add Custom Hooks
- `useFavorites.ts` — Favorites management (localStorage)
- `useFullscreen.ts` — Fullscreen API hook
- `useSearch.ts` — Fuzzy search with debounce

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/App.tsx` | Modify | Add providers + routing + layout |
| `src/components/ui/Button.tsx` | Create | Reusable button |
| `src/components/ui/Toggle.tsx` | Create | Toggle switch |
| `src/components/ui/SearchBar.tsx` | Create | Search input |
| `src/components/ui/Badge.tsx` | Create | Category badge |
| `src/components/ui/Modal.tsx` | Create | Modal dialog |
| `src/components/feedback/Toast.tsx` | Create | Toast notifications |
| `src/components/feedback/ScoreDisplay.tsx` | Create | Score display |
| `src/components/feedback/EmptyState.tsx` | Create | Empty state |
| `src/components/layout/Header.tsx` | Create | App header |
| `src/components/layout/Footer.tsx` | Create | App footer |
| `src/components/game/GameCard.tsx` | Create | Game card |
| `src/components/game/GameWrapper.tsx` | Create | Game lifecycle bridge |
| `src/components/game/GameOverlay.tsx` | Create | Loading/error overlay |
| `src/pages/HomePage.tsx` | Create | Game catalog |
| `src/pages/GamePage.tsx` | Create | Game play page |
| `src/pages/FavoritesPage.tsx` | Create | Favorites page |
| `src/pages/SettingsPage.tsx` | Create | Settings page |
| `src/hooks/useFavorites.ts` | Create | Favorites hook |
| `src/hooks/useFullscreen.ts` | Create | Fullscreen hook |
| `src/hooks/useSearch.ts` | Create | Search hook |

---

## Testing Approach

- `tsc -b` — zero TypeScript errors
- `vite build` — production build succeeds
- Visual verification: dev server renders correctly

---

## Acceptance Criteria

- [ ] App renders with Header, routing between pages
- [ ] GameCard displays game metadata (name, category, difficulty, favorite)
- [ ] HomePage shows responsive game grid
- [ ] GameWrapper manages PlayBoxGame lifecycle (mount/unmount)
- [ ] GamePage loads games lazily
- [ ] Theme toggle works (light ↔ dark)
- [ ] Sound toggle works (mute/unmute)
- [ ] All routes accessible: /, /game/:gameId, /favorites, /settings
