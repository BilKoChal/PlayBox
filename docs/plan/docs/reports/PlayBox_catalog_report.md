# PlayBox Game Catalog & Features Report

> **Project:** PlayBox — Web-Based Game Station Platform  
> **Version:** v1.0.0 Catalog Specification  
> **Author:** Game Catalog & Features Specialist  
> **Date:** 2026-03-04  
> **Status:** Comprehensive Design Document  

---

## Table of Contents

1. [Complete 50+ Game List](#1-complete-50-game-list)
2. [Category & Filter System](#2-category--filter-system)
3. [Search Implementation](#3-search-implementation)
4. [Local High Scores](#4-local-high-scores)
5. [Favorites System](#5-favorites-system)
6. [Difficulty Selection](#6-difficulty-selection)
7. [Sound Management](#7-sound-management)
8. [Fullscreen API](#8-fullscreen-api)
9. [Game Metadata Schema](#9-game-metadata-schema)
10. [Game Loading & Transition Experience](#10-game-loading--transition-experience)

---

## 1. Complete 50+ Game List

The following table defines every game shipping in PlayBox v1.0.0. Games are organized by primary category and assigned to an engine tier based on their technical requirements: **Canvas** for pure logic/UI games, **Kaboom.js** for arcade-style games with simple sprites and collision, and **Phaser 3** for sprite-heavy or physics-intensive games. Each game includes the difficulty levels it supports and an estimated implementation complexity to aid sprint planning.

### Legend

| Column | Description |
|--------|-------------|
| **#** | Sequential ID for internal tracking |
| **Game Name** | Display name shown in catalog |
| **Category** | Primary category (Logic/Puzzle, Arcade, Board, Card, Strategy, Action, Sports, Casual) |
| **Engine** | Canvas / Kaboom.js / Phaser 3 |
| **Difficulties** | Available difficulty levels (E = Easy, M = Medium, H = Hard) |
| **Complexity** | Implementation effort: Easy (1–3 days), Medium (4–7 days), Hard (8–14 days) |

### Logic/Puzzle Games (12)

| # | Game Name | Category | Engine | Difficulties | Complexity |
|---|-----------|----------|--------|--------------|------------|
| 1 | Sudoku | Logic/Puzzle | Canvas | E, M, H | Easy |
| 2 | Minesweeper | Logic/Puzzle | Canvas | E, M, H | Easy |
| 3 | Nonogram | Logic/Puzzle | Canvas | E, M | Medium |
| 4 | 2048 | Logic/Puzzle | Canvas | E, M, H | Easy |
| 5 | 15-Puzzle | Logic/Puzzle | Canvas | E, M | Easy |
| 6 | Mastermind | Logic/Puzzle | Canvas | E, M, H | Easy |
| 7 | Lights Out | Logic/Puzzle | Canvas | E, M | Easy |
| 8 | Tower of Hanoi | Logic/Puzzle | Canvas | E, M, H | Easy |
| 9 | Picross | Logic/Puzzle | Canvas | E, M | Medium |
| 10 | Word Search | Logic/Puzzle | Canvas | E, M | Easy |
| 11 | Simon Says | Logic/Puzzle | Canvas | E, M, H | Easy |
| 12 | Pattern Memory | Logic/Puzzle | Canvas | E, M, H | Easy |

### Arcade Games (10)

| # | Game Name | Category | Engine | Difficulties | Complexity |
|---|-----------|----------|--------|--------------|------------|
| 13 | Snake | Arcade | Kaboom | E, M, H | Easy |
| 14 | Breakout | Arcade | Kaboom | E, M, H | Easy |
| 15 | Pong | Arcade | Kaboom | E, M, H | Easy |
| 16 | Space Invaders | Arcade | Kaboom | E, M, H | Medium |
| 17 | Flappy Bird | Arcade | Kaboom | E, M, H | Easy |
| 18 | Frogger | Arcade | Kaboom | E, M, H | Medium |
| 19 | Asteroids | Arcade | Phaser | E, M, H | Medium |
| 20 | Pac-Man | Arcade | Phaser | E, M, H | Hard |
| 21 | Galaga | Arcade | Phaser | E, M, H | Medium |
| 22 | Fruit Ninja | Arcade | Phaser | E, M, H | Medium |

### Board Games (8)

| # | Game Name | Category | Engine | Difficulties | Complexity |
|---|-----------|----------|--------|--------------|------------|
| 23 | Tic-Tac-Toe | Board | Canvas | E, M, H | Easy |
| 24 | Checkers | Board | Canvas | E, M, H | Medium |
| 25 | Chess | Board | Canvas | E, M, H | Hard |
| 26 | Reversi (Othello) | Board | Canvas | E, M, H | Medium |
| 27 | Connect Four | Board | Canvas | E, M, H | Easy |
| 28 | Go (9×9) | Board | Canvas | E, M, H | Hard |
| 29 | Backgammon | Board | Canvas | E, M, H | Hard |
| 30 | Ludo | Board | Kaboom | E, M | Medium |

### Card Games (5)

| # | Game Name | Category | Engine | Difficulties | Complexity |
|---|-----------|----------|--------|--------------|------------|
| 31 | Solitaire (Klondike) | Card | Canvas | E, M | Medium |
| 32 | Memory Match | Card | Canvas | E, M, H | Easy |
| 33 | Blackjack | Card | Canvas | E, M | Easy |
| 34 | Spider Solitaire | Card | Canvas | E, M, H | Medium |
| 35 | Crazy Eights | Card | Canvas | E, M | Medium |

### Strategy Games (4)

| # | Game Name | Category | Engine | Difficulties | Complexity |
|---|-----------|----------|--------|--------------|------------|
| 36 | Battleship | Strategy | Canvas | E, M, H | Medium |
| 37 | Tower Defense | Strategy | Phaser | E, M, H | Hard |
| 38 | Conway's Game of Life | Strategy | Canvas | E | Easy |
| 39 | Peg Solitaire | Strategy | Canvas | E, M | Easy |

### Action Games (5)

| # | Game Name | Category | Engine | Difficulties | Complexity |
|---|-----------|----------|--------|--------------|------------|
| 40 | Whack-a-Mole | Action | Kaboom | E, M, H | Easy |
| 41 | Doodle Jump | Action | Kaboom | E, M, H | Medium |
| 42 | Jetpack Joyride | Action | Phaser | E, M, H | Hard |
| 43 | Cookie Clicker | Action | Canvas | E | Easy |
| 44 | Stack Ball | Action | Kaboom | E, M, H | Medium |

### Sports Games (3)

| # | Game Name | Category | Engine | Difficulties | Complexity |
|---|-----------|----------|--------|--------------|------------|
| 45 | Air Hockey | Sports | Kaboom | E, M, H | Medium |
| 46 | Basketball Shots | Sports | Kaboom | E, M, H | Medium |
| 47 | Ping Pong 3D | Sports | Phaser | E, M, H | Hard |

### Casual Games (5)

| # | Game Name | Category | Engine | Difficulties | Complexity |
|---|-----------|----------|--------|--------------|------------|
| 48 | Bubble Shooter | Casual | Kaboom | E, M, H | Medium |
| 49 | Candy Match-3 | Casual | Kaboom | E, M, H | Medium |
| 50 | Coloring Book | Casual | Canvas | E | Easy |
| 51 | Dress-Up Doll | Casual | Canvas | E | Easy |
| 52 | Jigsaw Puzzle | Casual | Canvas | E, M, H | Medium |

### Bonus / Seasonal Games (3)

| # | Game Name | Category | Engine | Difficulties | Complexity |
|---|-----------|----------|--------|--------------|------------|
| 53 | Snowball Fight | Casual | Kaboom | E, M, H | Medium |
| 54 | Pumpkin Pop | Arcade | Kaboom | E, M, H | Easy |
| 55 | Egg Catch | Casual | Kaboom | E, M, H | Easy |

**Total: 55 games** across 8 categories and 3 engine tiers.

### Engine Distribution Summary

| Engine | Count | Percentage | Typical Use |
|--------|-------|------------|-------------|
| Canvas | 28 | 51% | Logic, board, card, casual games — no sprite animation needed |
| Kaboom.js | 16 | 29% | Arcade, action, casual games — simple sprites & collision |
| Phaser 3 | 11 | 20% | Sprite-heavy, physics-based, multi-scene games |

### Complexity Distribution

| Complexity | Count | Percentage |
|------------|-------|------------|
| Easy | 23 | 42% |
| Medium | 22 | 40% |
| Hard | 10 | 18% |

### MVP Subset (3 Games)

For the MVP milestone, we recommend these three games to validate the full platform pipeline:

1. **Sudoku** (Canvas, Logic/Puzzle) — Validates pure logic game flow, difficulty system, and score tracking.
2. **Snake** (Kaboom, Arcade) — Validates arcade engine integration, real-time gameplay, and sound management.
3. **Breakout** (Kaboom, Arcade) — Validates collision detection, sprite rendering, and high score leaderboards.

These three cover two engine tiers, two categories, multiple difficulty levels, and all platform features (scores, favorites, sound, fullscreen).

---

## 2. Category & Filter System

### Category Taxonomy

The PlayBox category system is designed to be intuitive for a kid-friendly audience while remaining extensible for future game additions. Every game has exactly one **primary category** and zero or more **secondary tags**. This two-level system allows for rich filtering without overwhelming users with too many top-level categories.

**Primary Categories (8):**

| Category | Icon | Description | Game Count |
|----------|------|-------------|------------|
| Logic/Puzzle | 🧩 | Brain teasers, number games, pattern matching | 12 |
| Arcade | 👾 | Classic arcade, reflex-based, high-score chasers | 10 |
| Board | ♟️ | Traditional board games, turn-based strategy | 8 |
| Card | 🃏 | Card games, memory matching, solitaire variants | 5 |
| Strategy | 🎯 | Planning, tactical thinking, resource management | 4 |
| Action | ⚡ | Fast reflexes, timing, hand-eye coordination | 5 |
| Sports | ⚽ | Sports-themed, competitive, physics-based | 3 |
| Casual | 🎈 | Relaxing, creative, no-pressure gameplay | 5 |

**Secondary Tags (extensible):**

Tags are additive descriptors that cross-cut categories. A game may have 0–4 tags. Examples:

- `multiplayer` — Supports 2+ players (e.g., Pong, Checkers, Air Hockey)
- `classic` — Well-known traditional game (e.g., Chess, Solitaire, Sudoku)
- `timed` — Time-based pressure element (e.g., Simon Says, Word Search)
- `relaxing` — No timer, no lose condition (e.g., Coloring Book, Conway's Game of Life)
- `retro` — Inspired by classic arcade era (e.g., Space Invaders, Asteroids, Galaga)
- `educational` — Learning-oriented (e.g., Sudoku, Mastermind, Pattern Memory)
- `physics` — Uses physics simulation (e.g., Basketball Shots, Stack Ball)
- `clicker` — Incremental/idle mechanics (e.g., Cookie Clicker)
- `seasonal` — Holiday or seasonal theme (e.g., Snowball Fight, Pumpkin Pop, Egg Catch)

### Tagging Implementation

```typescript
// Each game's metadata includes its category and tags
interface GameTagging {
  primaryCategory: GameCategory;
  tags: GameTag[];
}

// Example: Space Invaders
const spaceInvadersTags: GameTagging = {
  primaryCategory: 'arcade',
  tags: ['classic', 'retro', 'timed'],
};

// Example: Coloring Book
const coloringBookTags: GameTagging = {
  primaryCategory: 'casual',
  tags: ['relaxing'],
};
```

### Filter System Architecture

The filter system supports **multi-criteria filtering** with AND logic between different filter dimensions and OR logic within the same dimension. For example, a user can filter to see "Arcade OR Action" games that are also "Easy difficulty" — the category filter uses OR within itself but AND against the difficulty filter.

**Filter Dimensions:**

1. **Category Filter** — Select one or more of the 8 primary categories. Multiple selections use OR logic (show games in any selected category).
2. **Difficulty Filter** — Select one or more difficulty levels (Easy, Medium, Hard). A game appears if it supports *any* of the selected difficulties.
3. **Favorites Filter** — Toggle to show only favorited games. This is AND'd with other filters.
4. **Tag Filter** — Select one or more secondary tags. Multiple selections use OR logic.

**Hidden/Developer Filters (not exposed to users):**

5. **Engine Filter** — Filter by Canvas/Kaboom/Phaser. Used internally for development and QA, accessible via a hidden developer panel (activated with Ctrl+Shift+D).

### Filter State Management

```typescript
interface FilterState {
  categories: GameCategory[];    // Empty = show all
  difficulties: DifficultyLevel[]; // Empty = show all
  tags: GameTag[];               // Empty = show all
  favoritesOnly: boolean;        // false = show all
  searchQuery: string;           // '' = no search
}

function applyFilters(games: GameMetadata[], filters: FilterState): GameMetadata[] {
  return games.filter(game => {
    // Category filter (OR within)
    if (filters.categories.length > 0 && !filters.categories.includes(game.category)) {
      return false;
    }
    // Difficulty filter (game must support at least one selected difficulty)
    if (filters.difficulties.length > 0) {
      const hasMatchingDifficulty = game.difficulties.some(d =>
        filters.difficulties.includes(d)
      );
      if (!hasMatchingDifficulty) return false;
    }
    // Tag filter (OR within — game must have at least one selected tag)
    if (filters.tags.length > 0) {
      const hasMatchingTag = game.tags.some(t => filters.tags.includes(t));
      if (!hasMatchingTag) return false;
    }
    // Favorites filter
    if (filters.favoritesOnly && !isFavorite(game.id)) {
      return false;
    }
    return true;
  });
}
```

### URL-Based Filters for Sharing

Filters are serialized into URL search parameters so users can share filtered views. This is critical for social sharing and deep-linking.

**URL Schema:**

```
https://playbox.app/?cat=arcade,action&diff=easy,medium&tag=retro&fav=true&q=space
```

| Param | Maps To | Format | Example |
|-------|---------|--------|---------|
| `cat` | categories | Comma-separated category keys | `cat=arcade,board` |
| `diff` | difficulties | Comma-separated: `easy`, `medium`, `hard` | `diff=easy,hard` |
| `tag` | tags | Comma-separated tag keys | `tag=classic,retro` |
| `fav` | favoritesOnly | `true` or omitted | `fav=true` |
| `q` | searchQuery | URL-encoded string | `q=snake` |

**Serialization & Deserialization:**

```typescript
function serializeFilters(state: FilterState): string {
  const params = new URLSearchParams();
  if (state.categories.length) params.set('cat', state.categories.join(','));
  if (state.difficulties.length) params.set('diff', state.difficulties.join(','));
  if (state.tags.length) params.set('tag', state.tags.join(','));
  if (state.favoritesOnly) params.set('fav', 'true');
  if (state.searchQuery) params.set('q', state.searchQuery);
  return params.toString();
}

function deserializeFilters(url: string): FilterState {
  const params = new URLSearchParams(url.split('?')[1] || '');
  return {
    categories: (params.get('cat')?.split(',').filter(Boolean) || []) as GameCategory[],
    difficulties: (params.get('diff')?.split(',').filter(Boolean) || []) as DifficultyLevel[],
    tags: (params.get('tag')?.split(',').filter(Boolean) || []) as GameTag[],
    favoritesOnly: params.get('fav') === 'true',
    searchQuery: params.get('q') || '',
  };
}
```

The filter state is also synced to the browser's `history.replaceState` on every change, so the back button works naturally and users can bookmark filtered views. On page load, the URL is parsed first, and any stored filter state is treated as a fallback — URL always wins for consistency.

### UI Layout for Filters

On desktop, filters appear as a left sidebar with collapsible sections for each dimension. On mobile, filters are in a bottom sheet accessible via a funnel icon. Active filters are shown as pill-shaped chips above the game grid, each removable with an ×. A "Clear All" button resets everything.

---

## 3. Search Implementation

### Requirements

With 55 games, search might seem trivial, but the implementation must be designed for the v1.0.0 scope and beyond. Key requirements:

- **Instant results** — Results appear as the user types, with no visible delay (target: <16ms per keystroke).
- **Fuzzy matching** — "suduko" should find "Sudoku". "space invadr" should find "Space Invaders".
- **Multi-field search** — Search across game name, category, and tags.
- **Autocomplete/suggestions** — Show a dropdown of matching games and suggested queries.
- **Recent searches** — Store and display the last 5 search queries for quick re-access.
- **Offline-first** — All search is client-side; no server calls.

### Library Comparison

| Feature | Fuse.js | Lunr.js | Simple String Match |
|---------|---------|---------|---------------------|
| Fuzzy search | ✅ Best-in-class | ⚠️ Limited (stemming only) | ❌ Exact only |
| Bundle size | ~5 KB gzipped | ~8 KB gzipped | 0 KB |
| Index build time | <1ms for 55 items | ~5ms for 55 items | N/A |
| Search latency | <1ms for 55 items | <1ms for 55 items | <1ms for 55 items |
| Multi-field | ✅ Native | ✅ Native | Manual |
| Typo tolerance | ✅ Configurable threshold | ❌ No | ❌ No |
| Relevance scoring | ✅ | ✅ | ❌ |
| Highlighting | Manual (but easy) | ✅ Built-in | Manual |

**Recommendation: Fuse.js**

For a catalog of 55–100 games, Fuse.js is the clear winner. Its fuzzy matching is essential for a kid-friendly platform where users might misspell game names. Lunr.js is overkill for this dataset size and lacks true fuzzy matching. Simple string matching would fail on typos and provide a poor UX for our younger audience. Fuse.js's configurable `threshold` parameter lets us tune how "fuzzy" results are — we'll use a threshold of 0.3 for names (moderate fuzziness) and 0.4 for tags/categories (more lenient).

### Search Architecture

```typescript
import Fuse from 'fuse.js';

interface SearchableGame {
  id: string;
  name: string;
  category: GameCategory;
  tags: GameTag[];
  description: string;
}

const fuseOptions: Fuse.IFuseOptions<SearchableGame> = {
  keys: [
    { name: 'name', weight: 0.5 },        // Name matches are most important
    { name: 'category', weight: 0.2 },     // Category is secondary
    { name: 'tags', weight: 0.2 },         // Tags equally weighted
    { name: 'description', weight: 0.1 },  // Description is least weighted
  ],
  threshold: 0.35,       // Balance between strict and fuzzy
  distance: 100,         // How far to search for a match
  minMatchCharLength: 2,  // Minimum query length for matching
  includeScore: true,
  includeMatches: true,   // Needed for highlighting
  useExtendedSearch: false,
};

// Create the Fuse index once on catalog load
let searchIndex: Fuse<SearchableGame>;

function initSearchIndex(games: GameMetadata[]): void {
  const searchableGames: SearchableGame[] = games.map(g => ({
    id: g.id,
    name: g.name,
    category: g.category,
    tags: g.tags,
    description: g.description,
  }));
  searchIndex = new Fuse(searchableGames, fuseOptions);
}

function searchGames(query: string): Fuse.FuseResult<SearchableGame>[] {
  if (!query || query.length < 2) return [];
  return searchIndex.search(query);
}
```

### Search Suggestions & Autocomplete

The search bar shows a dropdown with two sections:

1. **Matching Games** — Top 5 games matching the query, showing icon + name + category badge.
2. **Suggested Queries** — If the query matches tags or categories, suggest clicking those as filters instead.

```typescript
interface SearchSuggestion {
  type: 'game' | 'category' | 'tag' | 'recent';
  label: string;
  gameId?: string;       // For game suggestions
  categoryKey?: string;  // For category suggestions
  tagKey?: string;       // For tag suggestions
}

function getSuggestions(query: string): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = [];

  // Recent searches (shown when query is empty or very short)
  if (query.length < 2) {
    const recent = getRecentSearches();
    suggestions.push(...recent.map(r => ({
      type: 'recent' as const,
      label: r,
    })));
    return suggestions.slice(0, 5);
  }

  // Game matches
  const results = searchGames(query);
  suggestions.push(...results.slice(0, 5).map(r => ({
    type: 'game' as const,
    label: r.item.name,
    gameId: r.item.id,
  })));

  // Category/tag suggestions
  const matchingCategories = CATEGORIES.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );
  suggestions.push(...matchingCategories.map(c => ({
    type: 'category' as const,
    label: c.label,
    categoryKey: c.key,
  })));

  return suggestions.slice(0, 8); // Max 8 suggestions
}
```

### Recent Searches

Recent searches are stored in `localStorage` as a JSON array of strings, limited to 5 entries. On each new search submission, the query is prepended (removing duplicates) and the array is trimmed to 5.

```typescript
const RECENT_SEARCHES_KEY = 'playbox_recent_searches';
const MAX_RECENT_SEARCHES = 5;

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
  } catch {
    return [];
  }
}

function addRecentSearch(query: string): void {
  const recent = getRecentSearches().filter(r => r !== query);
  recent.unshift(query);
  localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify(recent.slice(0, MAX_RECENT_SEARCHES))
  );
}

function clearRecentSearches(): void {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}
```

### Search Result Highlighting

When displaying search results, matched portions of the game name are highlighted using the `matches` data from Fuse.js. This gives users visual feedback about *why* a result matched, which is especially helpful for fuzzy matches.

```typescript
function highlightMatch(text: string, match: Fuse.FuseResultMatch): string {
  const indices = match.indices.sort((a, b) => a[0] - b[0]);
  let result = '';
  let lastIndex = 0;
  for (const [start, end] of indices) {
    result += text.slice(lastIndex, start);
    result += `<mark class="search-highlight">${text.slice(start, end + 1)}</mark>`;
    lastIndex = end + 1;
  }
  result += text.slice(lastIndex);
  return result;
}
```

### Debouncing

Although our dataset is small enough that search is near-instant, we still debounce input at 150ms to avoid unnecessary re-renders during fast typing. This is implemented with a simple `useDeferredValue` hook in React or a custom debounce utility.

---

## 4. Local High Scores

### Storage Decision: IndexedDB via Dexie.js

For high score storage, we choose **IndexedDB** over localStorage for several critical reasons:

1. **Storage capacity** — localStorage is limited to ~5MB per origin. With 55 games, each storing up to 10 scores per difficulty level (3 levels), that's potentially 1,650+ score records with metadata. IndexedDB offers essentially unlimited storage (typically hundreds of MB before browser prompts).
2. **Structured queries** — IndexedDB supports indexes and range queries, enabling efficient "top 10 by game and difficulty" lookups without loading all scores into memory.
3. **Schema evolution** — Dexie.js provides a clean migration system for updating the score schema in future versions.
4. **Performance** — IndexedDB operations are asynchronous and don't block the main thread, unlike localStorage's synchronous API.
5. **Data types** — IndexedDB natively handles dates, numbers, and complex objects without JSON serialization overhead.

**Dexie.js** is our wrapper of choice (~14 KB gzipped) because it provides a promise-based API, TypeScript support, and a migration system that raw IndexedDB lacks.

### Score Schema

```typescript
// Database definition
import Dexie, { Table } from 'dexie';

interface HighScore {
  id?: number;              // Auto-incremented primary key
  gameId: string;           // References GameMetadata.id
  playerName: string;       // User-entered display name (max 12 chars)
  score: number;            // Numeric score — higher is better for most games
  difficulty: DifficultyLevel; // Easy, Medium, or Hard
  date: number;             // Unix timestamp of when score was achieved
  duration?: number;        // Seconds spent playing (optional, for timed games)
  metadata?: Record<string, unknown>; // Game-specific extra data (level reached, etc.)
}

class PlayBoxDB extends Dexie {
  scores!: Table<HighScore, number>;

  constructor() {
    super('PlayBoxDB');
    this.version(1).stores({
      scores: '++id, gameId, [gameId+difficulty], score, date, playerName',
    });
  }
}

const db = new PlayBoxDB();
```

### Index Design

The compound index `[gameId+difficulty]` is the critical one — it enables the most common query pattern: "get top 10 scores for game X at difficulty Y."

| Index | Purpose |
|-------|---------|
| `++id` | Auto-incrementing primary key |
| `gameId` | Look up all scores for a game |
| `[gameId+difficulty]` | Top 10 per game per difficulty |
| `score` | Global leaderboard queries (optional) |
| `date` | Recent scores, date-range queries |
| `playerName` | Find all scores by a player |

### Score Submission Flow

```typescript
async function submitScore(
  gameId: string,
  score: number,
  difficulty: DifficultyLevel,
  duration?: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  // Get or prompt for player name (stored in localStorage)
  let playerName = localStorage.getItem('playbox_player_name');
  if (!playerName) {
    playerName = await promptPlayerName(); // Shows a modal
    localStorage.setItem('playbox_player_name', playerName);
  }

  await db.scores.add({
    gameId,
    playerName,
    score,
    difficulty,
    date: Date.now(),
    duration,
    metadata,
  });

  // Check if this is a new top-10 score
  const topScores = await getTopScores(gameId, difficulty, 10);
  const rank = topScores.findIndex(s => s.score <= score) + 1;
  if (rank <= 10) {
    showNewHighScoreNotification(rank, gameId, difficulty);
  }
}

async function getTopScores(
  gameId: string,
  difficulty: DifficultyLevel,
  limit: number = 10
): Promise<HighScore[]> {
  return db.scores
    .where('[gameId+difficulty]')
    .equals([gameId, difficulty])
    .sortBy('score')           // Sort ascending first
    .then(scores => scores.reverse().slice(0, limit)); // Then take top N
}
```

### Leaderboard Display

Each game's detail view and in-game pause menu show a leaderboard tab. The leaderboard displays:

- **Tabs for each difficulty** the game supports (e.g., Easy | Medium | Hard)
- **Top 10 table** with columns: Rank (#), Player Name, Score, Date
- **Current player's best** highlighted if it falls outside top 10
- **Score formatting** is game-specific (e.g., Sudoku shows time, Snake shows length)

```typescript
interface LeaderboardConfig {
  gameId: string;
  scoreLabel: string;          // "Score", "Time", "Length", etc.
  sortDirection: 'asc' | 'desc'; // asc for time-based (lower is better), desc for score-based
  formatScore: (score: number) => string; // e.g., (90) => "1:30"
}

// Example configurations
const leaderboardConfigs: Record<string, LeaderboardConfig> = {
  sudoku: { gameId: 'sudoku', scoreLabel: 'Time', sortDirection: 'asc', formatScore: s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}` },
  snake: { gameId: 'snake', scoreLabel: 'Length', sortDirection: 'desc', formatScore: s => String(s) },
  breakout: { gameId: 'breakout', scoreLabel: 'Score', sortDirection: 'desc', formatScore: s => s.toLocaleString() },
};
```

### Score Reset & Data Management

**Per-Game Reset:** Users can clear scores for a single game from the game's settings menu. This triggers a confirmation dialog ("Are you sure? This cannot be undone.").

**Global Reset:** The platform settings page offers "Reset All Scores" with a double-confirmation (type "RESET" to confirm).

```typescript
async function resetGameScores(gameId: string): Promise<void> {
  await db.scores.where('gameId').equals(gameId).delete();
}

async function resetAllScores(): Promise<void> {
  await db.scores.clear();
}
```

### Export & Import

Users can export their score data as a JSON file for backup or transfer between devices. Import merges with existing data (keeping the higher score for duplicates).

```typescript
async function exportScores(): Promise<string> {
  const allScores = await db.scores.toArray();
  return JSON.stringify({
    version: 1,
    exportDate: new Date().toISOString(),
    scores: allScores,
  }, null, 2);
}

async function importScores(jsonString: string): Promise<{ imported: number; skipped: number }> {
  const data = JSON.parse(jsonString);
  if (data.version !== 1) throw new Error('Unsupported export version');

  let imported = 0;
  let skipped = 0;

  for (const score of data.scores) {
    // Check for duplicate (same game, player, difficulty, score)
    const existing = await db.scores
      .where('[gameId+difficulty]')
      .equals([score.gameId, score.difficulty])
      .and(s => s.playerName === score.playerName && s.score === score.score)
      .first();

    if (existing) {
      skipped++;
    } else {
      await db.scores.add(score);
      imported++;
    }
  }

  return { imported, skipped };
}
```

---

## 5. Favorites System

### Overview

The favorites system lets users bookmark games for quick access. It's designed to be lightweight, instant, and deeply integrated into the browsing experience. Given the data volume (a list of game IDs), localStorage is sufficient — we don't need IndexedDB for this.

### Storage Design

```typescript
const FAVORITES_KEY = 'playbox_favorites';
const MAX_FAVORITES = 20;

function getFavoriteIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

function isFavorite(gameId: string): boolean {
  return getFavoriteIds().includes(gameId);
}

function toggleFavorite(gameId: string): boolean {
  const favorites = getFavoriteIds();
  const index = favorites.indexOf(gameId);

  if (index !== -1) {
    favorites.splice(index, 1);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return false; // Removed
  } else {
    if (favorites.length >= MAX_FAVORITES) {
      showMaxFavoritesWarning(MAX_FAVORITES);
      return true; // Still favorited, no change
    }
    favorites.unshift(gameId); // Most recent first
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true; // Added
  }
}
```

### Maximum Favorites Limit

We set a maximum of **20 favorites** for several reasons:

1. **UI constraint** — The favorites view should fit comfortably on one screen. With game cards at ~200px wide, 20 cards = 2–3 rows on desktop.
2. **Decision quality** — Unlimited favorites lead to "favorite everything," which defeats the purpose. A limit encourages curation.
3. **Performance** — While not a real concern at 55 games, a limit prevents degenerate cases.
4. **Kids UX** — A smaller collection is easier for children to browse.

When the limit is reached, the user sees a friendly message: "You've got 20 favorites! Remove one to add a new one." The existing favorites list is shown so they can choose which to remove.

### Toggle Points

Users can toggle favorites from two places:

1. **Game Card** — A heart/star icon in the top-right corner of each game card in the catalog grid. Clicking it toggles with a satisfying animation (heart fills/unfills with a scale bounce).
2. **In-Game** — A small favorite button in the game's top toolbar (next to fullscreen and sound toggles). This allows users to favorite a game while playing it — a common pattern when someone discovers they love a game mid-session.

### Favorites Filter & View

The catalog's filter bar includes a **Favorites** toggle button (heart icon). When active, only favorited games appear, and all other filters still apply on top. This means a user can see "My favorite Arcade games" by toggling both the Arcade category and the favorites filter.

Additionally, there's a dedicated **Favorites** section on the home page (above the full catalog) that shows favorited games in a horizontal scrollable row — similar to Netflix's "My List." This provides instant access to favorites without requiring any filtering.

### Favorite Animation

The toggle animation is a key delight moment:

- **Adding:** Heart icon fills with color, scales up 1.3×, then settles back with a slight bounce. A small particle burst (3–5 tiny hearts) emanates from the icon.
- **Removing:** Heart icon empties, scales down to 0.8×, then returns to normal. A subtle fade-out of the color.

The animation is implemented with CSS transitions and a small JS particle burst, keeping it lightweight (<2 KB of code).

### Sync Considerations

For the initial release, favorites are **device-local only** — stored in localStorage with no cross-device sync. However, we design the data format with future sync in mind:

```typescript
interface FavoriteData {
  gameId: string;
  addedAt: number; // Unix timestamp for conflict resolution
}
```

When sync is eventually implemented (via a backend or WebRTC), the `addedAt` timestamp enables last-write-wins conflict resolution. If a game appears in the favorites list on one device but not another, the most recent `addedAt` wins.

For PWA offline support, favorites work identically offline since localStorage is always available. No special offline handling is needed.

---

## 6. Difficulty Selection

### Design Philosophy

Difficulty in PlayBox is not a global setting — it's a **per-game, per-session** choice. Different games define what "Easy," "Medium," and "Hard" mean in their own context. Some games may only offer two levels, and a few (like Coloring Book) have no difficulty at all. The platform provides the framework; each game provides the specifics.

### Difficulty Level Definitions

```typescript
type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  level: DifficultyLevel;
  label: string;           // Display name, e.g., "Beginner"
  description: string;     // What changes, e.g., "5×5 grid, 3 mines"
  params: Record<string, unknown>; // Game-specific parameters
}
```

### How Difficulty Changes Per Game

Each game defines what changes at each difficulty level. The following table shows examples across different game types:

| Game | Easy | Medium | Hard |
|------|------|--------|------|
| **Sudoku** | 4×4 grid, 70% pre-filled | 6×6 grid, 50% pre-filled | 9×9 grid, 30% pre-filled |
| **Snake** | Slow speed, no walls | Medium speed, walls appear | Fast speed, walls + obstacles |
| **Minesweeper** | 8×8, 10 mines | 16×16, 40 mines | 30×16, 99 mines |
| **Chess** | AI depth 1 (random-ish) | AI depth 3 (decent) | AI depth 5 (strong) |
| **2048** | 5×5 grid | 4×4 grid | 3×3 grid |
| **Flappy Bird** | Wide pipe gap, slow | Normal gap, normal speed | Narrow gap, fast + moving pipes |
| **Pong** | Slow AI, large paddle | Normal AI, normal paddle | Fast AI, small paddle |
| **Breakout** | 3 rows, wide paddle | 5 rows, normal paddle | 7 rows, narrow paddle, speed increases |
| **Connect Four** | AI random + basic | AI with strategy | AI minimax depth 6 |
| **Memory Match** | 4×3 grid (6 pairs) | 4×4 grid (8 pairs) | 6×4 grid (12 pairs) |

### Where Difficulty Is Selected

Difficulty can be selected at two points in the user flow:

1. **Game Card (Quick Start)** — Each game card shows the difficulty selector as small buttons (E / M / H) below the game name. Clicking one immediately starts the game at that difficulty. The last-used difficulty is pre-selected (visually emphasized).

2. **In-Game (Before Start)** — When a game loads, it shows a brief "Ready?" screen with the difficulty options. This is the game's own start screen, not a platform overlay. The default selection is the last-used difficulty for this game.

We considered allowing mid-game difficulty changes but rejected it — most games would require a restart anyway, and it adds complexity. Instead, games show "Change Difficulty" in their pause menu, which restarts the game at the new level.

### Persisting Last-Used Difficulty

The last difficulty a user played (or selected on the game card) is persisted per game so it becomes the default next time.

```typescript
const DIFFICULTY_PREFS_KEY = 'playbox_difficulty_prefs';

function getSavedDifficulty(gameId: string): DifficultyLevel | null {
  try {
    const prefs = JSON.parse(localStorage.getItem(DIFFICULTY_PREFS_KEY) || '{}');
    return prefs[gameId] || null;
  } catch {
    return null;
  }
}

function saveDifficulty(gameId: string, difficulty: DifficultyLevel): void {
  try {
    const prefs = JSON.parse(localStorage.getItem(DIFFICULTY_PREFS_KEY) || '{}');
    prefs[gameId] = difficulty;
    localStorage.setItem(DIFFICULTY_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Silently fail — this is a preference, not critical data
  }
}
```

### Difficulty in High Scores

Difficulty is a first-class dimension in the scoring system. Leaderboards are partitioned by difficulty — an Easy Sudoku score doesn't compete against a Hard Sudoku score. This is handled by the `[gameId+difficulty]` compound index in IndexedDB (see Section 4).

### Games Without Difficulty

Some games (e.g., Coloring Book, Conway's Game of Life, Cookie Clicker) don't have meaningful difficulty levels. These games define `difficulties: ['easy']` in their metadata with a single entry. The difficulty selector is simply hidden for these games — no confusing "Easy" button that implies other options exist.

---

## 7. Sound Management

### Architecture Overview

The PlayBox sound system is a centralized service that manages all audio across the platform and all games. It follows a hierarchical mute/volume model where global settings take precedence over per-game settings, and provides a clean API for games to register and play sounds without worrying about global state.

### SoundManager Service

```typescript
type SoundCategory = 'ui' | 'game' | 'music';

interface SoundConfig {
  id: string;              // Unique identifier, e.g., 'snake_eat'
  category: SoundCategory; // Which volume/mute group this belongs to
  src: string;             // Path to audio file (or base64 for offline)
  volume?: number;         // Default volume 0.0–1.0
  loop?: boolean;          // For background music
  preload?: boolean;       // Load on registration vs. on first play
}

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, { config: SoundConfig; buffer: AudioBuffer | null }> = new Map();
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();

  // Volume levels per category (0.0–1.0)
  private volumes: Record<SoundCategory, number> = {
    ui: 0.7,
    game: 0.8,
    music: 0.5,
  };

  // Mute state per category
  private muted: Record<SoundCategory, boolean> = {
    ui: false,
    game: false,
    music: false,
  };

  // Global mute override
  private globalMuted: boolean = false;

  // Per-game mute override (keyed by gameId)
  private gameMuted: Map<string, boolean> = new Map();

  constructor() {
    this.loadPreferences();
  }

  // Initialize AudioContext on first user interaction (required by browsers)
  init(): void {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Register sounds for a game
  registerSounds(gameId: string, configs: SoundConfig[]): void {
    for (const config of configs) {
      const prefixedId = `${gameId}_${config.id}`;
      this.sounds.set(prefixedId, { config, buffer: null });
      if (config.preload) {
        this.loadSound(prefixedId, config.src);
      }
    }
  }

  // Unregister all sounds for a game (cleanup on game exit)
  unregisterSounds(gameId: string): void {
    const prefix = `${gameId}_`;
    for (const [id] of this.sounds) {
      if (id.startsWith(prefix)) {
        this.stopSound(id);
        this.sounds.delete(id);
      }
    }
  }

  // Play a sound
  async play(gameId: string, soundId: string): Promise<void> {
    this.init(); // Ensure AudioContext is active

    const prefixedId = `${gameId}_${soundId}`;

    // Check mute states
    if (this.globalMuted) return;
    if (this.gameMuted.get(gameId)) return;

    const entry = this.sounds.get(prefixedId);
    if (!entry) {
      console.warn(`Sound not found: ${prefixedId}`);
      return;
    }

    // Load if not yet loaded
    if (!entry.buffer) {
      await this.loadSound(prefixedId, entry.config.src);
      if (!entry.buffer) return; // Load failed
    }

    const category = entry.config.category;
    if (this.muted[category]) return;

    const source = this.audioContext!.createBufferSource();
    source.buffer = entry.buffer;

    const gainNode = this.audioContext!.createGain();
    const effectiveVolume = (entry.config.volume ?? 1.0) * this.volumes[category];
    gainNode.gain.value = effectiveVolume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);

    source.loop = entry.config.loop ?? false;
    source.start(0);

    if (entry.config.loop) {
      this.activeSources.set(prefixedId, source);
    }

    source.onended = () => {
      this.activeSources.delete(prefixedId);
    };
  }

  // Stop a specific sound (useful for looping sounds like music)
  stopSound(prefixedId: string): void {
    const source = this.activeSources.get(prefixedId);
    if (source) {
      source.stop();
      this.activeSources.delete(prefixedId);
    }
  }

  // Stop all sounds for a game
  stopGameSounds(gameId: string): void {
    const prefix = `${gameId}_`;
    for (const [id, source] of this.activeSources) {
      if (id.startsWith(prefix)) {
        source.stop();
        this.activeSources.delete(id);
      }
    }
  }

  // --- Global Controls ---

  setGlobalMute(muted: boolean): void {
    this.globalMuted = muted;
    if (muted) this.stopAllSounds();
    this.savePreferences();
  }

  getGlobalMute(): boolean {
    return this.globalMuted;
  }

  toggleGlobalMute(): boolean {
    this.setGlobalMute(!this.globalMuted);
    return this.globalMuted;
  }

  // --- Per-Game Controls ---

  setGameMute(gameId: string, muted: boolean): void {
    this.gameMuted.set(gameId, muted);
    if (muted) this.stopGameSounds(gameId);
    this.savePreferences();
  }

  // --- Volume Controls ---

  setVolume(category: SoundCategory, volume: number): void {
    this.volumes[category] = Math.max(0, Math.min(1, volume));
    this.savePreferences();
  }

  getVolume(category: SoundCategory): number {
    return this.volumes[category];
  }

  // --- Category Mute ---

  setCategoryMute(category: SoundCategory, muted: boolean): void {
    this.muted[category] = muted;
    if (muted) {
      // Stop currently playing sounds in this category
      for (const [id, entry] of this.sounds) {
        if (entry.config.category === category) {
          this.stopSound(id);
        }
      }
    }
    this.savePreferences();
  }

  // --- Private Helpers ---

  private async loadSound(id: string, src: string): Promise<void> {
    const entry = this.sounds.get(id);
    if (!entry || !this.audioContext) return;

    try {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      entry.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (err) {
      console.error(`Failed to load sound ${id}:`, err);
    }
  }

  private stopAllSounds(): void {
    for (const [, source] of this.activeSources) {
      source.stop();
    }
    this.activeSources.clear();
  }

  private savePreferences(): void {
    const prefs = {
      globalMuted: this.globalMuted,
      volumes: this.volumes,
      muted: this.muted,
      gameMuted: Object.fromEntries(this.gameMuted),
    };
    localStorage.setItem('playbox_sound_prefs', JSON.stringify(prefs));
  }

  private loadPreferences(): void {
    try {
      const raw = localStorage.getItem('playbox_sound_prefs');
      if (!raw) return;
      const prefs = JSON.parse(raw);
      this.globalMuted = prefs.globalMuted ?? false;
      this.volumes = { ...this.volumes, ...prefs.volumes };
      this.muted = { ...this.muted, ...prefs.muted };
      if (prefs.gameMuted) {
        this.gameMuted = new Map(Object.entries(prefs.gameMuted));
      }
    } catch {
      // Use defaults
    }
  }
}

// Singleton export
export const soundManager = new SoundManager();
```

### Sound Categories in Detail

| Category | Purpose | Volume Default | Mute Default | Examples |
|----------|---------|----------------|--------------|----------|
| **UI** | Platform chrome sounds | 0.7 | Off | Card click, filter toggle, menu open/close, notification |
| **Game** | In-game sound effects | 0.8 | Off | Snake eat, brick break, card flip, victory jingle |
| **Music** | Background music | 0.5 | Off | Game theme, menu ambience |

### Sound Format & Offline Support

All sounds are stored as **MP3** (for broad compatibility and small file size) and **OGG** (as a fallback for browsers that prefer it). For PWA offline support, all sound files are included in the service worker's cache manifest.

For games with many short sound effects, we use **audio sprites** — a single concatenated audio file with a manifest that defines start/end times for each sound. This reduces HTTP requests and cache entries.

```typescript
interface AudioSpriteManifest {
  file: string;
  sounds: Record<string, { start: number; end: number }>;
}
```

### Game Sound Registration Lifecycle

1. **Game registers sounds** — When a game module loads, it calls `soundManager.registerSounds(gameId, configs)`.
2. **Game plays sounds** — During gameplay, the game calls `soundManager.play(gameId, soundId)`.
3. **Game unregisters sounds** — When the user exits the game, `soundManager.unregisterSounds(gameId)` cleans up all loaded buffers and stops any playing audio.

This lifecycle ensures that audio resources are properly cleaned up and memory is freed when switching between games.

### Platform UI Sounds

The platform itself has a small set of UI sounds that are always registered and don't belong to any game:

```typescript
const UI_SOUNDS: SoundConfig[] = [
  { id: 'click', category: 'ui', src: '/sounds/ui/click.mp3', volume: 0.3, preload: true },
  { id: 'transition', category: 'ui', src: '/sounds/ui/transition.mp3', volume: 0.4, preload: true },
  { id: 'favorite', category: 'ui', src: '/sounds/ui/favorite.mp3', volume: 0.5, preload: true },
  { id: 'notification', category: 'ui', src: '/sounds/ui/notification.mp3', volume: 0.6, preload: true },
  { id: 'error', category: 'ui', src: '/sounds/ui/error.mp3', volume: 0.4, preload: true },
];
```

---

## 8. Fullscreen API

### Overview

Fullscreen mode is a critical feature for a game platform — players expect immersive, distraction-free gameplay. PlayBox implements fullscreen across three platforms: web browsers, Tauri (Windows desktop), and Capacitor (Android). The implementation uses a unified API that abstracts platform differences.

### Platform-Specific Implementation

#### Web (Fullscreen API)

```typescript
async function enterWebFullscreen(element: HTMLElement): Promise<void> {
  if (element.requestFullscreen) {
    await element.requestFullscreen();
  } else if ((element as any).webkitRequestFullscreen) {
    // Safari
    await (element as any).webkitRequestFullscreen();
  } else if ((element as any).msRequestFullscreen) {
    // IE11 (unlikely, but defensive)
    await (element as any).msRequestFullscreen();
  }
}

async function exitWebFullscreen(): Promise<void> {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    await (document.webkitExitFullscreen();
  } else if ((document as any).msExitFullscreen) {
    await (document.msExitFullscreen();
  }
}

function isWebFullscreen(): boolean {
  return !!(document.fullscreenElement ||
    (document as any).webkitFullscreenElement);
}
```

#### Tauri (Windows Desktop)

```typescript
// Tauri provides a window API for fullscreen
import { appWindow } from '@tauri-apps/api/window';

async function enterTauriFullscreen(): Promise<void> {
  await appWindow.setFullscreen(true);
}

async function exitTauriFullscreen(): Promise<void> {
  await appWindow.setFullscreen(false);
}
```

#### Capacitor (Android)

```typescript
// Capacitor's StatusBar and NavigationBar plugins for immersive mode
import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';

async function enterAndroidImmersive(): Promise<void> {
  await StatusBar.hide();
  await NavigationBar.hide();
}

async function exitAndroidImmersive(): Promise<void> {
  await StatusBar.show({ style: Style.Light });
  await NavigationBar.show();
}
```

### Unified Fullscreen Service

```typescript
type Platform = 'web' | 'tauri' | 'capacitor';

class FullscreenService {
  private platform: Platform;
  private isFullscreen: boolean = false;
  private preferenceKey = 'playbox_fullscreen';
  private listeners: Set<(isFullscreen: boolean) => void> = new Set();

  constructor() {
    this.platform = this.detectPlatform();
    this.setupEventListeners();
  }

  private detectPlatform(): Platform {
    if ((window as any).__TAURI__) return 'tauri';
    if ((window as any).Capacitor) return 'capacitor';
    return 'web';
  }

  private setupEventListeners(): void {
    // Listen for fullscreen changes (e.g., user presses Escape)
    const events = ['fullscreenchange', 'webkitfullscreenchange'];
    events.forEach(event => {
      document.addEventListener(event, () => {
        const wasFullscreen = this.isFullscreen;
        this.isFullscreen = this.checkFullscreen();

        if (wasFullscreen !== this.isFullscreen) {
          this.notifyListeners();
          this.savePreference();
        }
      });
    });
  }

  async toggle(element?: HTMLElement): Promise<void> {
    if (this.isFullscreen) {
      await this.exit();
    } else {
      await this.enter(element || document.documentElement);
    }
  }

  async enter(element: HTMLElement = document.documentElement): Promise<void> {
    switch (this.platform) {
      case 'web':
        await enterWebFullscreen(element);
        break;
      case 'tauri':
        await enterTauriFullscreen();
        break;
      case 'capacitor':
        await enterAndroidImmersive();
        break;
    }
    this.isFullscreen = true;
    this.notifyListeners();
    this.savePreference();
  }

  async exit(): Promise<void> {
    switch (this.platform) {
      case 'web':
        await exitWebFullscreen();
        break;
      case 'tauri':
        await exitTauriFullscreen();
        break;
      case 'capacitor':
        await exitAndroidImmersive();
        break;
    }
    this.isFullscreen = false;
    this.notifyListeners();
    this.savePreference();
  }

  getIsFullscreen(): boolean {
    return this.isFullscreen;
  }

  // --- Listener Pattern ---

  onChange(listener: (isFullscreen: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => fn(this.isFullscreen));
  }

  // --- Preference Persistence ---

  private savePreference(): void {
    localStorage.setItem(this.preferenceKey, String(this.isFullscreen));
  }

  getPreference(): boolean {
    return localStorage.getItem(this.preferenceKey) === 'true';
  }
}

export const fullscreenService = new FullscreenService();
```

### Toggle Button Placement

The fullscreen toggle button appears in three locations:

1. **Game Card** — A small maximize icon in the top-right corner. Clicking it opens the game directly in fullscreen mode (enters fullscreen + navigates to game in one action).
2. **In-Game Toolbar** — A floating toolbar at the top of the game screen, always visible. Contains: Back arrow, Game Name, Favorite toggle, Sound toggle, Fullscreen toggle. The toolbar auto-hides after 3 seconds of inactivity and reappears on mouse move or touch.
3. **Platform Header** — In the main catalog view, a small fullscreen icon in the top-right corner of the header. This makes the entire catalog fullscreen (useful on tablets in kiosk mode).

### Escape Key Behavior

- **In fullscreen with a game:** Escape exits fullscreen first (browser default behavior). A second Escape press shows the in-game pause menu.
- **In fullscreen on catalog:** Escape exits fullscreen.
- **Not fullscreen:** Escape has no special handling (browser default).

This two-step behavior prevents accidental game exits — the user must explicitly exit fullscreen, then explicitly choose to leave the game.

### Auto-Fullscreen for Games

Users can opt into "Always open games in fullscreen" via a platform setting. When enabled, clicking any game card automatically enters fullscreen mode before launching the game. This is stored as a preference:

```typescript
const AUTO_FULLSCREEN_KEY = 'playbox_auto_fullscreen';

function getAutoFullscreen(): boolean {
  return localStorage.getItem(AUTO_FULLSCREEN_KEY) === 'true';
}

function setAutoFullscreen(enabled: boolean): void {
  localStorage.setItem(AUTO_FULLSCREEN_KEY, String(enabled));
}
```

---

## 9. Game Metadata Schema

### Complete TypeScript Definitions

The game metadata schema is the **contract** between the PlayBox platform shell and each individual game. Every game must export a `GameMetadata` object conforming to these types. The platform shell reads this metadata to populate the catalog, configure filters, manage scores, and render game cards.

```typescript
// ============================================================
// PlayBox Game Metadata Schema — v1.0.0
// ============================================================

/**
 * Primary game categories. Each game has exactly one.
 * These are the top-level navigation groups in the catalog.
 */
type GameCategory =
  | 'logic-puzzle'
  | 'arcade'
  | 'board'
  | 'card'
  | 'strategy'
  | 'action'
  | 'sports'
  | 'casual';

/**
 * Secondary tags that cross-cut categories.
 * A game may have zero or more tags.
 */
type GameTag =
  | 'multiplayer'
  | 'classic'
  | 'timed'
  | 'relaxing'
  | 'retro'
  | 'educational'
  | 'physics'
  | 'clicker'
  | 'seasonal';

/**
 * Difficulty levels. Games may support any subset,
 * though most support all three.
 */
type DifficultyLevel = 'easy' | 'medium' | 'hard';

/**
 * Engine tier used by the game.
 * This is internal-only — not shown to users.
 */
type GameEngine = 'canvas' | 'kaboom' | 'phaser';

/**
 * Difficulty configuration for a single level.
 * The `params` field is game-specific — each game
 * defines what changes between difficulties.
 */
interface DifficultyConfig {
  level: DifficultyLevel;
  label: string;
  description: string;
  params: Record<string, unknown>;
}

/**
 * Leaderboard configuration — how scores are
 * displayed and sorted for this game.
 */
interface LeaderboardConfig {
  scoreLabel: string;
  sortDirection: 'asc' | 'desc';
  formatScore: (score: number) => string;
}

/**
 * Sound registration for a game. Each game declares
 * its sound effects and music so the platform can
 * manage them centrally.
 */
interface GameSoundDeclaration {
  id: string;
  category: 'ui' | 'game' | 'music';
  src: string;
  volume?: number;
  loop?: boolean;
  preload?: boolean;
}

/**
 * Color theme overrides for a game.
 * If provided, these override the platform theme
 * while the game is active.
 */
interface GameThemeOverrides {
  primaryColor?: string;
  backgroundColor?: string;
  accentColor?: string;
}

/**
 * The main game metadata interface.
 * This is the complete contract between the
 * platform shell and each game module.
 */
interface GameMetadata {
  /** Unique identifier, kebab-case (e.g., 'snake', 'space-invaders') */
  id: string;

  /** Display name shown in catalog and in-game */
  name: string;

  /** Short description for game card (max 80 chars) */
  description: string;

  /** Extended description for game detail view (supports markdown) */
  longDescription: string;

  /** Primary category */
  category: GameCategory;

  /** Secondary tags for filtering and search */
  tags: GameTag[];

  /** Engine tier (internal, not user-visible) */
  engine: GameEngine;

  /** Available difficulty levels and their configurations */
  difficulties: DifficultyConfig[];

  /** Implementation version of this game */
  version: string;

  /** Minimum platform version required */
  minPlatformVersion: string;

  /** Author/team credit */
  author: string;

  /** Thumbnail image path (used on game card) */
  thumbnail: string;

  /** Animated preview (GIF or video) for game detail view */
  preview?: string;

  /** Icon image path (small, used in header/toolbar) */
  icon: string;

  /** Category-specific color for visual grouping */
  color: string;

  /** Leaderboard configuration */
  leaderboard: LeaderboardConfig;

  /** Sound declarations for this game */
  sounds: GameSoundDeclaration[];

  /** Theme overrides while game is active */
  themeOverrides?: GameThemeOverrides;

  /** Whether the game supports save/resume state */
  supportsSaveState: boolean;

  /** Whether the game requires keyboard input */
  requiresKeyboard: boolean;

  /** Whether the game supports touch input */
  supportsTouch: boolean;

  /** Estimated load time in ms (for loading animation) */
  estimatedLoadTime: number;

  /** Game module entry point (dynamic import path) */
  entryPoint: () => Promise<GameModule>;
}

/**
 * The interface each game module must export.
 * This is what the platform shell receives after
 * dynamically importing a game.
 */
interface GameModule {
  /** Game metadata */
  metadata: GameMetadata;

  /** Initialize and mount the game into the given container */
  mount(container: HTMLElement, config: GameMountConfig): Promise<void>;

  /** Unmount and clean up the game */
  unmount(): Promise<void>;

  /** Pause the game (called when user switches tabs or opens menu) */
  pause(): void;

  /** Resume the game */
  resume(): void;

  /** Get current game state for persistence (if supportsSaveState) */
  getState?(): Record<string, unknown>;

  /** Restore game state (if supportsSaveState) */
  setState?(state: Record<string, unknown>): void;

  /** Handle difficulty change (restarts game with new params) */
  setDifficulty(level: DifficultyLevel): void;

  /** Handle sound toggle */
  setSoundEnabled(enabled: boolean): void;

  /** Handle fullscreen change */
  setFullscreen(isFullscreen: boolean): void;
}

/**
 * Configuration passed to a game when it's mounted.
 */
interface GameMountConfig {
  /** The difficulty level to start with */
  difficulty: DifficultyLevel;

  /** Whether sound is enabled */
  soundEnabled: boolean;

  /** Whether the game is in fullscreen */
  isFullscreen: boolean;

  /** Platform theme (light or dark) */
  theme: 'light' | 'dark';

  /** Callback to submit a score */
  onSubmitScore: (score: number, metadata?: Record<string, unknown>) => void;

  /** Callback to update the game's title in the toolbar */
  onUpdateTitle: (title: string) => void;

  /** Callback to request fullscreen toggle */
  onRequestFullscreen: () => void;

  /** Callback to request exit to catalog */
  onRequestExit: () => void;

  /** Saved state to restore (if any) */
  savedState?: Record<string, unknown>;
}

/**
 * The full game registry — an array of all game metadata.
 * This is compiled at build time and tree-shaken
 * for the MVP build (only 3 games).
 */
type GameRegistry = GameMetadata[];
```

### Example: Complete Game Metadata

```typescript
const snakeMetadata: GameMetadata = {
  id: 'snake',
  name: 'Snake',
  description: 'Guide the snake to eat food and grow longer!',
  longDescription: 'The classic **Snake** game! Use arrow keys or swipe to guide your snake. Eat the glowing food to grow, but don\'t hit the walls or your own tail. How long can you get?',
  category: 'arcade',
  tags: ['classic', 'retro'],
  engine: 'kaboom',
  version: '1.0.0',
  minPlatformVersion: '1.0.0',
  author: 'PlayBox Team',
  thumbnail: '/games/snake/thumbnail.webp',
  preview: '/games/snake/preview.gif',
  icon: '/games/snake/icon.svg',
  color: '#4CAF50',
  difficulties: [
    {
      level: 'easy',
      label: 'Slow',
      description: 'Slow speed, no walls',
      params: { speed: 4, walls: false, obstacles: 0 },
    },
    {
      level: 'medium',
      label: 'Normal',
      description: 'Medium speed, walls enabled',
      params: { speed: 7, walls: true, obstacles: 0 },
    },
    {
      level: 'hard',
      label: 'Fast',
      description: 'Fast speed, walls + obstacles',
      params: { speed: 11, walls: true, obstacles: 3 },
    },
  ],
  leaderboard: {
    scoreLabel: 'Length',
    sortDirection: 'desc',
    formatScore: (s) => String(s),
  },
  sounds: [
    { id: 'eat', category: 'game', src: '/games/snake/sounds/eat.mp3', volume: 0.6, preload: true },
    { id: 'die', category: 'game', src: '/games/snake/sounds/die.mp3', volume: 0.7, preload: true },
    { id: 'turn', category: 'game', src: '/games/snake/sounds/turn.mp3', volume: 0.3, preload: true },
    { id: 'music', category: 'music', src: '/games/snake/sounds/theme.mp3', volume: 0.4, loop: true },
  ],
  themeOverrides: {
    primaryColor: '#4CAF50',
    backgroundColor: '#1a1a2e',
  },
  supportsSaveState: true,
  requiresKeyboard: false,
  supportsTouch: true,
  estimatedLoadTime: 800,
  entryPoint: () => import('/games/snake/index.ts'),
};
```

---

## 10. Game Loading & Transition Experience

### Design Philosophy

The transition from the catalog to a game is a **critical UX moment**. It must feel snappy, delightful, and informative — not like a blank page loading. PlayBox uses a multi-phase loading sequence with playful animations that maintain the "joyful, kid-friendly" design language.

### Loading Sequence (7 Phases)

```
User clicks game card
        │
        ▼
┌─────────────────────────────────┐
│ Phase 1: Card Expand Animation  │  0–300ms
│ Game card scales up and fades   │
│ into the loading screen         │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ Phase 2: Loading Screen         │  300–1500ms
│ Show game icon, name, and a     │
│ fun loading animation           │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ Phase 3: Asset Preloading       │  concurrent with Phase 2
│ Game engine + assets load in    │
│ background; progress bar shown  │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ Phase 4: Engine Initialization  │  0–500ms after assets load
│ Kaboom/Phaser/Canvas sets up    │
│ the game canvas and scene       │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ Phase 5: Game "Ready?" Screen   │  Until user interacts
│ Show difficulty selection and   │
│ a big "Play!" button            │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ Phase 6: Countdown              │  3, 2, 1 — GO!
│ Brief countdown builds          │
│ anticipation                    │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ Phase 7: Game Active            │
│ Fullscreen (if preferred),      │
│ toolbar auto-hides              │
└─────────────────────────────────┘
```

### Phase Details

#### Phase 1: Card Expand Animation (0–300ms)

When the user clicks a game card, the card visually "expands" to fill the screen. This is achieved with the **View Transitions API** (Chrome 111+) with a fallback for unsupported browsers:

```typescript
async function openGame(gameId: string, difficulty: DifficultyLevel): Promise<void> {
  const gameCard = document.querySelector(`[data-game-id="${gameId}"]`);
  const mountConfig: GameMountConfig = {
    difficulty,
    soundEnabled: !soundManager.getGlobalMute(),
    isFullscreen: fullscreenService.getIsFullscreen(),
    theme: getCurrentTheme(),
    onSubmitScore: (score, metadata) => submitScore(gameId, score, difficulty, undefined, metadata),
    onUpdateTitle: (title) => updateToolbarTitle(title),
    onRequestFullscreen: () => fullscreenService.toggle(),
    onRequestExit: () => exitGame(),
  };

  // View Transitions API (modern browsers)
  if (document.startViewTransition) {
    const transition = document.startViewTransition(async () => {
      showLoadingScreen(gameId);
    });
    await transition.finished;
  } else {
    // Fallback: CSS animation
    if (gameCard) {
      gameCard.classList.add('card-expanding');
      await sleep(300);
    }
    showLoadingScreen(gameId);
  }

  // Dynamic import of game module
  const gameRegistry = getGameRegistry();
  const metadata = gameRegistry.find(g => g.id === gameId)!;
  const gameModule = await metadata.entryPoint();

  // Mount the game
  const container = document.getElementById('game-container')!;
  await gameModule.mount(container, mountConfig);

  // Hide loading screen
  hideLoadingScreen();
}
```

#### Phase 2: Loading Screen (300–1500ms)

The loading screen shows:

- **Game icon** (animated with a gentle bounce or spin)
- **Game name** (large, friendly font)
- **Category badge** (e.g., "🟢 Arcade")
- **Loading animation** — a custom animation per engine tier:
  - Canvas: A bouncing dot grid
  - Kaboom: A pixel character running
  - Phaser: A sprite spinning
- **Tip text** — Rotates through game-specific tips, e.g., "Tip: Eat the red food to grow!"

#### Phase 3: Asset Preloading (concurrent)

While the loading screen is visible, the game's assets are preloaded. For Phaser games, this uses Phaser's built-in loader. For Kaboom and Canvas games, we preload images and sounds:

```typescript
async function preloadGameAssets(metadata: GameMetadata): Promise<void> {
  const loadPromises: Promise<void>[] = [];

  // Preload sounds
  soundManager.registerSounds(metadata.id, metadata.sounds);

  // Preload images
  const images = [metadata.thumbnail, metadata.preview, metadata.icon].filter(Boolean);
  for (const src of images) {
    loadPromises.push(
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Don't block on failure
        img.src = src;
      })
    );
  }

  await Promise.all(loadPromises);
}
```

#### Phase 5: Game "Ready?" Screen

After loading completes, the game doesn't immediately start. Instead, it shows a "Ready?" screen that serves two purposes:

1. **Difficulty selection** — The user confirms or changes the difficulty. The last-used difficulty is pre-selected.
2. **Instructions** — A brief how-to-play overlay (2–3 lines + control icons).

```typescript
interface ReadyScreenConfig {
  gameName: string;
  selectedDifficulty: DifficultyLevel;
  availableDifficulties: DifficultyConfig[];
  instructions: string;
  controlIcons: ('keyboard' | 'mouse' | 'touch' | 'gamepad')[];
}
```

#### Phase 6: Countdown (3, 2, 1 — GO!)

A brief 3-second countdown builds anticipation and gives the player a moment to prepare. Each number appears with a scale-in + scale-out animation:

```
     3  →  2  →  1  →  GO!
    (1s)   (1s)   (1s)
```

The countdown can be skipped by clicking/tapping or pressing any key.

### Returning to Catalog

When the user wants to return to the catalog, the exit flow must handle several scenarios gracefully:

#### Scenario 1: Game Not Started (on "Ready?" screen)

Simple reverse animation — no confirmation needed. The loading screen fades out and the catalog fades back in.

#### Scenario 2: Game in Progress

If the game is active and the user presses the back arrow (or Escape on the toolbar):

1. **Pause the game** — `gameModule.pause()` is called immediately.
2. **Show exit confirmation modal** — "Are you sure? Your progress won't be saved." (or "Your progress has been saved!" if `supportsSaveState` is true).
3. **Options:**
   - **"Keep Playing"** — Resumes the game (`gameModule.resume()`).
   - **"Save & Exit"** — Only shown if `supportsSaveState`. Calls `gameModule.getState()`, saves to IndexedDB, then exits.
   - **"Exit"** — Discards progress and exits.

```typescript
interface SaveState {
  gameId: string;
  state: Record<string, unknown>;
  difficulty: DifficultyLevel;
  savedAt: number;
}

async function saveGameState(gameId: string, gameModule: GameModule): Promise<void> {
  if (!gameModule.getState) return;
  const state = gameModule.getState();
  const db = new PlayBoxDB();
  await db.saveStates.put({
    gameId,
    state,
    difficulty: getCurrentDifficulty(gameId),
    savedAt: Date.now(),
  });
}

async function loadGameState(gameId: string): Promise<SaveState | null> {
  const db = new PlayBoxDB();
  return db.saveStates.get(gameId);
}
```

#### Scenario 3: Game Over / Natural End

When a game ends naturally (win or lose), the game itself shows a results screen with:
- Score achieved
- Leaderboard position (if top 10)
- "Play Again" button (restarts at same difficulty)
- "Change Difficulty" button
- "Back to Catalog" button

The "Back to Catalog" button triggers a smooth transition:
1. Game screen shrinks back into a card position (reverse of Phase 1)
2. Catalog fades back in
3. If the game was fullscreen, fullscreen is exited (with a brief delay to avoid jarring transition)

### Transition Animations Technical Details

All transitions are CSS-driven for performance, using `transform` and `opacity` only (GPU-accelerated properties):

```css
/* Card expand animation */
.card-expanding {
  animation: cardExpand 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes cardExpand {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(1.05);
    opacity: 0;
  }
}

/* Loading screen entrance */
.loading-screen {
  animation: loadingFadeIn 200ms ease-out forwards;
}

@keyframes loadingFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Countdown number */
.countdown-number {
  animation: countdownPop 700ms ease-out forwards;
}

@keyframes countdownPop {
  0% { transform: scale(0); opacity: 0; }
  30% { transform: scale(1.3); opacity: 1; }
  70% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* Game container entrance */
.game-container {
  animation: gameSlideIn 250ms ease-out forwards;
}

@keyframes gameSlideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Loading Performance Budgets

| Phase | Budget | Notes |
|-------|--------|-------|
| Card expand | ≤ 300ms | CSS animation, always smooth |
| Loading screen visible | ≤ 1500ms | Most games: 300–800ms |
| Asset preloading | ≤ 2000ms | Canvas/Kaboom: ~200ms; Phaser: ~1000ms |
| Engine init | ≤ 500ms | Canvas: ~50ms; Kaboom: ~100ms; Phaser: ~300ms |
| Ready screen | User-controlled | No time budget; user clicks "Play" |
| Countdown | 3000ms (skippable) | Reduces to 0ms on skip |
| **Total click-to-play** | **≤ 5 seconds** | Target: 2–3 seconds for Canvas/Kaboom games |

For the MVP and v1.0.0, these budgets are achievable because all assets are local (bundled with the PWA). There are no network requests during game loading — everything is in the service worker cache.

### Error Handling During Loading

If loading fails at any phase (asset load error, engine crash, mount failure), the user sees a friendly error screen with:

- An illustrated sad character (matching the kid-friendly theme)
- "Oops! [Game Name] had a problem starting."
- A "Try Again" button (retries the full loading sequence)
- A "Back to Catalog" button
- The technical error is logged to the browser console for debugging but never shown to the user

```typescript
async function openGameSafe(gameId: string, difficulty: DifficultyLevel): Promise<void> {
  try {
    await openGame(gameId, difficulty);
  } catch (error) {
    console.error(`Failed to load game ${gameId}:`, error);
    showGameLoadError(gameId);
  }
}
```

---

## Appendix A: Build Configuration for MVP vs. Full Release

The game registry supports two build modes:

| Mode | Games Included | Bundle Size Target |
|------|----------------|-------------------|
| MVP (`PLAYBOX_MVP=true`) | Sudoku, Snake, Breakout | < 500 KB gzipped |
| Full (`PLAYBOX_MVP=false`) | All 55 games | < 3 MB gzipped (code-split per game) |

Each game is a separate dynamic import chunk, so the initial bundle only includes the catalog shell + the 3 MVP games. Other games are loaded on demand.

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/games/')) {
            const match = id.match(/\/games\/([^/]+)\//);
            if (match) return `game-${match[1]}`;
          }
        },
      },
    },
  },
});
```

---

## Appendix B: PWA Offline Strategy for Games

| Resource Type | Caching Strategy | Details |
|---------------|------------------|---------|
| App shell (HTML, CSS, JS) | Cache-first | Served from cache instantly; updated in background |
| Game modules | Cache-first | Downloaded once on first play; cached permanently |
| Game assets (images, sounds) | Cache-first | Pre-cached on game first load |
| Thumbnails & icons | Cache-first | All pre-cached on app install |
| Game preview GIFs | Lazy cache | Cached on first view of game detail page |

The service worker uses Workbox with a `registerRoute` for each pattern, ensuring full offline support after the first visit.

---

## Appendix C: Quick Reference — Platform Feature Matrix

| Feature | Storage | Sync | Offline |
|---------|---------|------|---------|
| High Scores | IndexedDB (Dexie.js) | Future | ✅ |
| Favorites | localStorage | Future | ✅ |
| Difficulty Prefs | localStorage | No | ✅ |
| Sound Prefs | localStorage | No | ✅ |
| Fullscreen Prefs | localStorage | No | ✅ |
| Recent Searches | localStorage | No | ✅ |
| Game Save States | IndexedDB (Dexie.js) | Future | ✅ |
| Filter State | URL params + React state | URL shareable | ✅ |

---

*End of PlayBox Game Catalog & Features Report — v1.0.0*
