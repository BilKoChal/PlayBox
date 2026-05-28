import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'playbox-favorites';
const MAX_FAVORITES = 20;

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const toggleFavorite = useCallback((gameId: string) => {
    setFavorites((prev) => {
      if (prev.includes(gameId)) {
        return prev.filter((id) => id !== gameId);
      }
      if (prev.length >= MAX_FAVORITES) {
        // Remove oldest favorite to make room
        return [...prev.slice(1), gameId];
      }
      return [...prev, gameId];
    });
  }, []);

  const isFavorite = useCallback(
    (gameId: string) => favorites.includes(gameId),
    [favorites],
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    maxFavorites: MAX_FAVORITES,
  };
}
