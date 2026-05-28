# Worklog — Task 3: Shared Services (Core)

**Task ID:** 3  
**Phase:** 0.3  
**Start Time:** 2026-05-28  
**End Time:** 2026-05-28  
**Status:** Complete ✅

---

## What Was Done

1. **Fully implemented SoundManager** (`src/lib/audio.ts`):
   - Lazy AudioContext initialization (respects browser autoplay policy)
   - 3 sound categories: ui, game, music — each independently muteable
   - Per-game sound registration/unregistration (prevents memory leaks)
   - Audio buffer loading and caching via fetch + decodeAudioData
   - Procedural sound generation (5 patterns: click, score, die, win, move)
   - Music looping support with activeMusic tracking
   - Master volume + per-category volume controls
   - Preload method for game sounds before mount
   - Dispose method for cleanup

2. **Enhanced ScoreTracker** (`src/lib/storage.ts`):
   - Added: `getHighScoreAcrossDifficulties()` — best score across all difficulties
   - Added: `getScoreCount()` / `getTotalScoreCount()` — score counting
   - Added: `deleteAllScoresForGame()` — bulk delete per game
   - Added: `clearAllScores()` — wipe all scores
   - Added: `isNewHighScore()` — check before celebration
   - Added: `ScoreType` enum ('points' | 'time' | 'length' | 'moves') — affects sort order
   - Added: `ScoreFormatter` class — format time as MM:SS, points with locale, etc.
   - Added: `PlayerNameManager` class — persist default player name in localStorage
   - Added: `SettingsManager` class — structured app settings with typed get/set/update/reset

3. **Created FavoritesManager** (`src/lib/favorites.ts`):
   - Dedicated service class with singleton pattern
   - localStorage persistence with max 20 favorites
   - add, remove, toggle, isFavorite, getAll, clear operations
   - Export/import as JSON
   - Change listener callbacks (onChange → unsubscribe function)
   - isFull(), getCount(), getMaxFavorites() query methods

4. **Enhanced Platform detection** (`src/lib/platform.ts`):
   - Added: `isStandalone` — PWA standalone mode detection (3 methods)
   - Added: `hasServiceWorker` — Service Worker support check
   - Added: `isOnline` — current online status
   - Added: `screenSize` — mobile/tablet/desktop category
   - Added: `prefersDarkMode` — system color scheme preference
   - Added: `prefersReducedMotion` — reduced motion preference
   - Added: `language`, `viewportWidth`, `viewportHeight`, `devicePixelRatio`
   - Added: `onOnlineStatusChange()` — listener for online/offline events
   - Added: `onViewportChange()` — debounced resize listener
   - Added: `onPreferenceChange()` — color scheme / reduced motion listener

5. **Enhanced FullscreenService** (`src/lib/fullscreen.ts`):
   - Added: `isSupported()` — check if fullscreen is available
   - Added: `onFullscreenChange()` — callback registration with unsubscribe
   - Added: `fullscreenchange` / `webkitfullscreenchange` event listeners
   - Added: Automatic state tracking via native events
   - Improved: Early return if already in/not in fullscreen
   - Improved: Better error messages for unsupported platforms

6. **Updated useFavorites hook** (`src/hooks/useFavorites.ts`):
   - Now uses `favoritesManager` singleton instead of local state
   - Listens to `favoritesManager.onChange()` for external changes
   - Exposes additional methods: addFavorite, removeFavorite, isFull, count

---

## Problems Encountered & Resolutions

| Problem | Resolution |
|---------|-----------|
| `LoadedSound` interface declared but unused | Removed the unused interface |
| `Promise<void | AudioBuffer>` not assignable to `Promise<void>` | Added `.then(() => {})` to normalize return type |
| No TypeScript errors, no build errors | Clean pass |

---

## Files Changed

### Created (1 new file):
- `src/lib/favorites.ts` — Dedicated FavoritesManager service

### Modified (5 files):
- `src/lib/audio.ts` — Complete rewrite: full Web Audio API implementation
- `src/lib/storage.ts` — Major enhancement: ScoreFormatter, PlayerNameManager, SettingsManager, new ScoreTracker methods
- `src/lib/platform.ts` — Major enhancement: PWA detection, online/offline, screen size, preference detection, event systems
- `src/lib/fullscreen.ts` — Enhancement: isSupported, onFullscreenChange, event listeners, auto state tracking
- `src/hooks/useFavorites.ts` — Rewrite: uses FavoritesManager singleton with change listener

---

## Tests Run & Results

| Test | Command | Result |
|------|---------|--------|
| TypeScript compilation | `npx tsc -b` | ✅ Pass (zero errors) |
| Vite production build | `npx vite build` | ✅ Pass (8 chunks, 4.21s) |
