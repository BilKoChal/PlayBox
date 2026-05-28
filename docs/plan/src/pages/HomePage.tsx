/**
 * HomePage — Game catalog with search, filters, and favorites section
 *
 * Features:
 * - "My Favorites" horizontal scroll section (when user has favorites)
 * - CategoryFilter pills (horizontal scroll)
 * - DifficultySelector for filtering by difficulty
 * - URL-serialized filter state (?q=snake&cat=arcade&diff=easy)
 * - Responsive game grid
 * - Results count and clear filters
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { GameMetadata } from '@/types/game';
import { CATEGORIES } from '@/types/game';
import GameCard from '@/components/game/GameCard';
import EmptyState from '@/components/feedback/EmptyState';
import CategoryFilter from '@/components/ui/CategoryFilter';
import DifficultySelector from '@/components/ui/DifficultySelector';
import { useFilterState } from '@/hooks/useFilterState';

interface HomePageProps {
  games: GameMetadata[];
  isFavorite: (gameId: string) => boolean;
  onToggleFavorite: (gameId: string) => void;
  favorites: string[];
}

export default function HomePage({
  games,
  isFavorite,
  onToggleFavorite,
  favorites,
}: HomePageProps) {
  const {
    filters,
    filteredGames,
    setCategory,
    setDifficulty,
    clearFilters,
    hasActiveFilters,
  } = useFilterState(games);

  // Favorite games for the "My Favorites" section
  const favoriteGames = useMemo(
    () => games.filter((g) => favorites.includes(g.id)),
    [games, favorites],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* My Favorites horizontal scroll section (only when not filtering) */}
      {favoriteGames.length > 0 && !hasActiveFilters && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold font-[var(--font-heading)] text-[var(--color-text)] flex items-center gap-2">
              <span className="text-[var(--color-accent-red)]">❤️</span>
              My Favorites
            </h2>
            <Link
              to="/favorites"
              className="text-sm font-semibold text-[var(--color-secondary)] hover:underline font-[var(--font-body)]"
            >
              View All →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory">
            {favoriteGames.map((game) => (
              <div key={game.id} className="flex-shrink-0 w-56 snap-start">
                <GameCard
                  game={game}
                  isFavorite={isFavorite(game.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category filter pills */}
      <CategoryFilter
        selected={filters.category}
        onSelect={setCategory}
        className="mb-4"
      />

      {/* Difficulty filter */}
      <div className="mb-5">
        <DifficultySelector
          selected={filters.difficulty}
          onSelect={setDifficulty}
          size="sm"
        />
      </div>

      {/* Results info + clear filters */}
      {hasActiveFilters && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-[var(--color-text-secondary)] font-[var(--font-body)]">
            {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''} found
            {filters.query && ` matching "${filters.query}"`}
            {filters.category && ` in ${CATEGORIES[filters.category].label}`}
            {filters.difficulty && ` on ${filters.difficulty} difficulty`}
          </p>
          <button
            onClick={clearFilters}
            className="text-sm font-semibold text-[var(--color-secondary)] hover:underline font-[var(--font-body)]"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Game grid */}
      {filteredGames.length > 0 ? (
        <div className="
          grid gap-4
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
        ">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={isFavorite(game.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔍"
          title="No games found"
          description={
            filters.query
              ? `No games match "${filters.query}". Try a different search or clear filters.`
              : filters.category
                ? `No ${CATEGORIES[filters.category].label} games available yet.`
                : 'No games match the current filters.'
          }
          action={
            hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl font-semibold bg-[var(--color-primary)] text-[var(--color-text)] hover:bg-[var(--color-primary-dark)] transition-colors font-[var(--font-body)]"
              >
                Clear All Filters
              </button>
            ) : undefined
          }
        />
      )}

      {/* Game count footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-[var(--color-text-muted)] font-[var(--font-body)]">
          {games.length} games available • More coming soon!
        </p>
      </div>
    </div>
  );
}
