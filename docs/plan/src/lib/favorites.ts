/**
 * FavoritesManager — Dedicated Favorites Service
 *
 * Manages the user's favorite games with localStorage persistence.
 *
 * Features:
 * - Add/remove favorites by game ID
 * - Maximum 20 favorites (oldest removed when exceeded)
 * - Check if a game is favorited
 * - Get all favorites in order (most recent first)
 * - Export/import as JSON
 * - Change listener callbacks
 */

export type FavoritesChangeListener = (gameIds: string[]) => void;

export class FavoritesManager {
  private static STORAGE_KEY = 'playbox-favorites';
  private static MAX_FAVORITES = 20;

  private favorites: string[] = [];
  private listeners = new Set<FavoritesChangeListener>();

  constructor() {
    this.load();
  }

  // ============================================
  // CRUD Operations
  // ============================================

  /**
   * Add a game to favorites.
   * If already at max capacity, removes the oldest favorite.
   */
  add(gameId: string): void {
    if (this.favorites.includes(gameId)) return; // Already favorited

    if (this.favorites.length >= FavoritesManager.MAX_FAVORITES) {
      // Remove oldest (last in array)
      this.favorites.pop();
    }

    this.favorites.unshift(gameId); // Most recent first
    this.save();
    this.notifyListeners();
  }

  /**
   * Remove a game from favorites.
   */
  remove(gameId: string): void {
    const index = this.favorites.indexOf(gameId);
    if (index === -1) return; // Not favorited

    this.favorites.splice(index, 1);
    this.save();
    this.notifyListeners();
  }

  /**
   * Toggle a game's favorite status.
   * Returns true if now favorited, false if removed.
   */
  toggle(gameId: string): boolean {
    if (this.isFavorite(gameId)) {
      this.remove(gameId);
      return false;
    }
    this.add(gameId);
    return true;
  }

  /**
   * Check if a game is favorited.
   */
  isFavorite(gameId: string): boolean {
    return this.favorites.includes(gameId);
  }

  /**
   * Get all favorite game IDs (most recent first).
   */
  getAll(): string[] {
    return [...this.favorites];
  }

  /**
   * Get the number of favorites.
   */
  getCount(): number {
    return this.favorites.length;
  }

  /**
   * Get the maximum number of favorites allowed.
   */
  getMaxFavorites(): number {
    return FavoritesManager.MAX_FAVORITES;
  }

  /**
   * Check if favorites is at capacity.
   */
  isFull(): boolean {
    return this.favorites.length >= FavoritesManager.MAX_FAVORITES;
  }

  /**
   * Clear all favorites.
   */
  clear(): void {
    this.favorites = [];
    this.save();
    this.notifyListeners();
  }

  // ============================================
  // Export / Import
  // ============================================

  /**
   * Export favorites as a JSON string.
   */
  exportJSON(): string {
    return JSON.stringify(this.favorites, null, 2);
  }

  /**
   * Import favorites from a JSON string.
   * Replaces all current favorites.
   * Returns the number of favorites imported.
   */
  importJSON(json: string): number {
    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid format: expected array');
      }

      // Validate and deduplicate
      const valid = parsed
        .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
        .filter((id, index, arr) => arr.indexOf(id) === index) // Deduplicate
        .slice(0, FavoritesManager.MAX_FAVORITES);

      this.favorites = valid;
      this.save();
      this.notifyListeners();
      return valid.length;
    } catch (err) {
      console.warn('Failed to import favorites:', err);
      return 0;
    }
  }

  // ============================================
  // Change Listeners
  // ============================================

  /**
   * Register a callback that fires when favorites change.
   * Returns an unsubscribe function.
   */
  onChange(listener: FavoritesChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // ============================================
  // Private: Persistence
  // ============================================

  private load(): void {
    try {
      const stored = localStorage.getItem(FavoritesManager.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.favorites = parsed.filter(
            (id): id is string => typeof id === 'string',
          );
        }
      }
    } catch {
      this.favorites = [];
    }
  }

  private save(): void {
    try {
      localStorage.setItem(
        FavoritesManager.STORAGE_KEY,
        JSON.stringify(this.favorites),
      );
    } catch {}
  }

  private notifyListeners(): void {
    const snapshot = this.getAll();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.warn('Favorites listener error:', err);
      }
    }
  }
}

/** Singleton instance */
export const favoritesManager = new FavoritesManager();
