/**
 * Search — Fuse.js search engine
 *
 * Provides fuzzy search across game metadata with weighted multi-field search.
 * Will be fully integrated in Phase 1.1 (Search & Filtering).
 */

import Fuse, { type IFuseOptions } from 'fuse.js';
import type { GameMetadata } from '@/types/game';

/** Fuse.js options for weighted multi-field search */
const SEARCH_OPTIONS: IFuseOptions<GameMetadata> = {
  keys: [
    { name: 'name', weight: 0.5 },       // Name matches are most important
    { name: 'tags', weight: 0.25 },       // Tags second
    { name: 'category', weight: 0.15 },   // Category third
    { name: 'description', weight: 0.1 }, // Description least important
  ],
  threshold: 0.3,       // Loose matching (kid-friendly misspellings)
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
};

let fuseInstance: Fuse<GameMetadata> | null = null;

/** Initialize the search engine with game metadata */
export function initSearch(games: GameMetadata[]): void {
  fuseInstance = new Fuse(games, SEARCH_OPTIONS);
}

/** Search games by query string */
export function searchGames(query: string): GameMetadata[] {
  if (!fuseInstance) {
    console.warn('Search engine not initialized. Call initSearch() first.');
    return [];
  }

  if (!query.trim()) {
    return [];
  }

  return fuseInstance.search(query).map((result) => result.item);
}

/** Get recent searches from localStorage */
export function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem('playbox-recent-searches');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/** Add a search query to recent searches (max 5) */
export function addRecentSearch(query: string): void {
  const recent = getRecentSearches().filter((s) => s !== query);
  recent.unshift(query);
  localStorage.setItem(
    'playbox-recent-searches',
    JSON.stringify(recent.slice(0, 5)),
  );
}

/** Clear recent searches */
export function clearRecentSearches(): void {
  localStorage.removeItem('playbox-recent-searches');
}
