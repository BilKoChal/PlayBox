import { useState, useMemo, useCallback } from 'react';
import type { GameMetadata } from '@/types/game';
import { searchGames, initSearch } from '@/lib/search';

export function useSearch(games: GameMetadata[]) {
  const [query, setQuery] = useState('');

  // Initialize search engine when games change
  useMemo(() => {
    initSearch(games);
  }, [games]);

  const results = useMemo(() => {
    if (!query.trim()) return games;
    return searchGames(query);
  }, [query, games]);

  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    results,
    handleSearch,
    clearSearch,
    isSearching: query.trim().length > 0,
  };
}
