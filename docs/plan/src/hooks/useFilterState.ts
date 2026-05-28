/**
 * useFilterState — Filter State with URL Serialization
 *
 * Manages filter state (search query, category, difficulty) and serializes
 * it to URL search params for shareable filter links (e.g., ?q=snake&cat=arcade&diff=easy).
 *
 * Uses react-router-dom's useSearchParams for URL sync.
 * Filtering logic: AND between dimensions (search ∧ category ∧ difficulty),
 * search applied on top of category+difficulty filters.
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { GameCategory, Difficulty, GameMetadata } from '@/types/game';
import { searchGames, initSearch } from '@/lib/search';

export interface FilterState {
  query: string;
  category: GameCategory | null;
  difficulty: Difficulty | null;
}

/** Serialize filter state to URL search params */
function filtersToSearchParams(filters: FilterState): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.query.trim()) params.q = filters.query.trim();
  if (filters.category) params.cat = filters.category;
  if (filters.difficulty) params.diff = filters.difficulty;
  return params;
}

/** Parse filter state from URL search params */
function searchParamsToFilters(params: URLSearchParams): FilterState {
  return {
    query: params.get('q') || '',
    category: (params.get('cat') as GameCategory) || null,
    difficulty: (params.get('diff') as Difficulty) || null,
  };
}

export function useFilterState(games: GameMetadata[]) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => searchParamsToFilters(searchParams),
    [searchParams],
  );

  // Initialize search engine when games change
  useMemo(() => {
    initSearch(games);
  }, [games]);

  // Apply all filters: search → category → difficulty (AND between dimensions)
  const filteredGames = useMemo(() => {
    let result = games;

    // 1. Apply search filter (Fuse.js fuzzy matching)
    if (filters.query.trim()) {
      result = searchGames(filters.query);
    }

    // 2. Apply category filter (AND with search)
    if (filters.category) {
      result = result.filter((g) => g.category === filters.category);
    }

    // 3. Apply difficulty filter (AND with search + category)
    if (filters.difficulty) {
      result = result.filter((g) => g.difficulties.includes(filters.difficulty!));
    }

    return result;
  }, [games, filters]);

  const setQuery = useCallback(
    (query: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (query.trim()) {
          next.set('q', query.trim());
        } else {
          next.delete('q');
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const setCategory = useCallback(
    (category: GameCategory | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (category) {
          next.set('cat', category);
        } else {
          next.delete('cat');
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const setDifficulty = useCallback(
    (difficulty: Difficulty | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (difficulty) {
          next.set('diff', difficulty);
        } else {
          next.delete('diff');
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const setFilters = useCallback(
    (partial: Partial<FilterState>) => {
      const newFilters = { ...filters, ...partial };
      setSearchParams(filtersToSearchParams(newFilters));
    },
    [filters, setSearchParams],
  );

  const hasActiveFilters =
    filters.query.trim().length > 0 ||
    filters.category !== null ||
    filters.difficulty !== null;

  return {
    filters,
    filteredGames,
    setQuery,
    setCategory,
    setDifficulty,
    clearFilters,
    setFilters,
    hasActiveFilters,
  };
}
