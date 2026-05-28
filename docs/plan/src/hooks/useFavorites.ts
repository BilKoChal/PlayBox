import { useState, useEffect, useCallback } from 'react';
import { favoritesManager } from '@/lib/favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => favoritesManager.getAll());

  // Listen for external changes to favorites
  useEffect(() => {
    const unsubscribe = favoritesManager.onChange((updatedFavorites) => {
      setFavorites(updatedFavorites);
    });
    return unsubscribe;
  }, []);

  const toggleFavorite = useCallback((gameId: string) => {
    favoritesManager.toggle(gameId);
    // State will be updated via the change listener
  }, []);

  const isFavorite = useCallback(
    (gameId: string) => favorites.includes(gameId),
    [favorites],
  );

  const clearFavorites = useCallback(() => {
    favoritesManager.clear();
  }, []);

  const addFavorite = useCallback((gameId: string) => {
    favoritesManager.add(gameId);
  }, []);

  const removeFavorite = useCallback((gameId: string) => {
    favoritesManager.remove(gameId);
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    addFavorite,
    removeFavorite,
    maxFavorites: favoritesManager.getMaxFavorites(),
    isFull: favoritesManager.isFull(),
    count: favoritesManager.getCount(),
  };
}
