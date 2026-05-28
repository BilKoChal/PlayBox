/**
 * HomePage — Game catalog with search, filters, and favorites section
 *
 * Phase 1.3 Polish:
 * - Staggered card fade-in animation
 * - Favorites section with horizontal scroll + snap
 * - Better section headers with accent colors
 * - Skeleton loading state
 * - Responsive grid with proper spacing
 * - Results count with animated transition
 */

import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { GameMetadata } from '@/types/game';
import { CATEGORIES } from '@/types/game';
import GameCard from '@/components/game/GameCard';
import EmptyState from '@/components/feedback/EmptyState';
import LoadingSkeleton from '@/components/feedback/LoadingSkeleton';
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

  // Simulate brief loading state for polish
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Favorite games for the "My Favorites" section
  const favoriteGames = useMemo(
    () => games.filter((g) => favorites.includes(g.id)),
    [games, favorites],
  );

  // Show skeleton on initial load
  if (isInitialLoad) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <LoadingSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* My Favorites horizontal scroll section (only when not filtering) */}
      {favoriteGames.length > 0 && !hasActiveFilters && (
        <section className="mb-8 animate-[slideUp_400ms_ease-out]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold font-[var(--font-heading)] text-[var(--color-text)] flex items-center gap-2">
              <span className="text-[var(--color-accent-red)]">❤️</span>
              My Favorites
              <span className="text-xs font-semibold text-[var(--color-text-secondary)] bg-[var(--color-bg-hover)] px-2 py-0.5 rounded-full">
                {favoriteGames.length}
              </span>
            </h2>
            <Link
              to="/favorites"
              className="text-sm font-semibold text-[var(--color-secondary)] hover:underline font-[var(--font-body)] transition-colors hover:text-[var(--color-secondary-dark)]"
            >
              View All →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory">
            {favoriteGames.map((game, index) => (
              <div key={game.id} className="flex-shrink-0 w-56 snap-start">
                <GameCard
                  game={game}
                  isFavorite={isFavorite(game.id)}
                  onToggleFavorite={onToggleFavorite}
                  staggerIndex={index}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category filter pills */}
      <section className="mb-4 animate-[slideUp_400ms_ease-out_50ms_both]">
        <CategoryFilter
          selected={filters.category}
          onSelect={setCategory}
        />
      </section>

      {/* Difficulty filter */}
      <section className="mb-5 animate-[slideUp_400ms_ease-out_100ms_both]">
        <DifficultySelector
          selected={filters.difficulty}
          onSelect={setDifficulty}
          size="sm"
        />
      </section>

      {/* Results info + clear filters */}
      {hasActiveFilters && (
        <div className="mb-4 flex items-center justify-between animate-[fadeIn_200ms_ease-out]">
          <p className="text-sm text-[var(--color-text-secondary)] font-[var(--font-body)]">
            <span className="font-semibold text-[var(--color-text)]">{filteredGames.length}</span> game{filteredGames.length !== 1 ? 's' : ''} found
            {filters.query && (
              <span> matching "<span className="font-semibold text-[var(--color-primary-dark)]">{filters.query}</span>"</span>
            )}
            {filters.category && ` in ${CATEGORIES[filters.category].label}`}
            {filters.difficulty && ` on ${filters.difficulty} difficulty`}
          </p>
          <button
            onClick={clearFilters}
            className="text-sm font-semibold text-[var(--color-secondary)] hover:underline font-[var(--font-body)] transition-colors hover:text-[var(--color-secondary-dark)]"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Game grid */}
      {filteredGames.length > 0 ? (
        <div className="
          grid gap-4 lg:gap-5
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
        ">
          {filteredGames.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={isFavorite(game.id)}
              onToggleFavorite={onToggleFavorite}
              staggerIndex={index}
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
                className="px-5 py-2.5 rounded-xl font-semibold bg-[var(--color-primary)] text-[var(--color-text)] hover:bg-[var(--color-primary-dark)] transition-all duration-200 font-[var(--font-body)] shadow-[0_2px_8px_rgba(255,184,48,0.3)] active:scale-95"
              >
                Clear All Filters
              </button>
            ) : undefined
          }
        />
      )}

      {/* Game count footer */}
      <div className="mt-10 text-center animate-[fadeIn_400ms_ease-out_600ms_both]">
        <p className="text-xs text-[var(--color-text-muted)] font-[var(--font-body)]">
          {games.length} games available • More coming soon! 🎮
        </p>
      </div>
    </div>
  );
}
