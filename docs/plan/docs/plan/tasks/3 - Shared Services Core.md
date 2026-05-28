# Task 3 — Shared Services (Core) (Phase 0, Sub-Phase 0.3)

**Task ID:** 3  
**Phase:** 0.3  
**Status:** In Progress  
**Created:** 2026-05-28  
**Depends On:** Task 1 ✅, Task 2 ✅

---

## Objective

Fully implement all shared services that games and the platform shell depend on:
SoundManager (Web Audio API), ScoreTracker (IndexedDB + Dexie), FavoritesManager (localStorage),
FullscreenService (cross-platform), and Platform detection (enhanced).

---

## Implementation Steps

### Step 1: Fully implement SoundManager (src/lib/audio.ts)
- Web Audio API with AudioContext, lazy initialization
- Sound registration per game (Map of gameId → sound definitions)
- Audio buffer loading and caching
- Play with volume, rate, and category-aware muting
- Procedural sounds (click, score, collision) as fallback when no audio files
- Music looping support
- Master volume control

### Step 2: Enhance ScoreTracker (src/lib/storage.ts)
- Already has submitScore, getTopScores, getHighScore, getScoresForGame, deleteScore, exportScores, importScores
- Add: deleteAllScoresForGame, getScoreCount, clearAllScores, getHighScoreAcrossDifficulties
- Add: PlayerNameManager (localStorage for default player name)
- Add: ScoreFormatter utility for different score types (time, length, points)

### Step 3: Create FavoritesManager (src/lib/favorites.ts)
- Dedicated service class (currently logic is in useFavorites hook)
- localStorage with max 20 favorites
- Toggle, isFavorite, getAll, clear, export, import
- Singleton pattern consistent with other services

### Step 4: Enhance Platform detection (src/lib/platform.ts)
- Add: isStandalone (PWA standalone mode detection)
- Add: hasServiceWorker support check
- Add: isOnline / isOffline detection
- Add: screen size category (mobile/tablet/desktop)
- Add: prefers-color-scheme and prefers-reduced-motion detection
- Add: event listener for online/offline changes

### Step 5: Enhance FullscreenService (src/lib/fullscreen.ts)
- Add: fullscreenchange event listener to track state
- Add: isSupported() check
- Add: Capacitor StatusBar plugin integration
- Add: onFullscreenChange callback registration

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/audio.ts` | Rewrite | Full Web Audio API SoundManager |
| `src/lib/storage.ts` | Enhance | Add ScoreTracker methods + PlayerNameManager + ScoreFormatter |
| `src/lib/favorites.ts` | Create | Dedicated FavoritesManager service |
| `src/lib/platform.ts` | Enhance | Add PWA detection, online status, screen info |
| `src/lib/fullscreen.ts` | Enhance | Add event listeners, isSupported, callbacks |
