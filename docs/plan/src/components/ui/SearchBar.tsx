/**
 * SearchBar — Enhanced with autocomplete dropdown and recent searches
 *
 * Phase 1.3 Polish:
 * - Smooth focus ring animation
 * - Animated dropdown appearance
 * - Better result items with hover effects
 * - Rounded search input matching design system
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { GameMetadata } from '@/types/game';
import { searchGames, initSearch, getRecentSearches, addRecentSearch, clearRecentSearches } from '@/lib/search';

interface SearchBarProps {
  onSearch: (query: string) => void;
  games?: GameMetadata[];
  placeholder?: string;
  className?: string;
  /** Whether to show autocomplete dropdown */
  showAutocomplete?: boolean;
}

export default function SearchBar({
  onSearch,
  games = [],
  placeholder = 'Find a game...',
  className = '',
  showAutocomplete = true,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize search engine
  useMemo(() => {
    if (games.length > 0) {
      initSearch(games);
    }
  }, [games]);

  // Autocomplete results (limited to 5)
  const autocompleteResults = useMemo(() => {
    if (!showAutocomplete || !query.trim() || !isFocused) return [];
    return searchGames(query).slice(0, 5);
  }, [query, showAutocomplete, isFocused, games]);

  // Recent searches
  const recentSearches = useMemo(() => {
    if (!showAutocomplete || query.trim() || !isFocused) return [];
    return getRecentSearches();
  }, [query, showAutocomplete, isFocused]);

  // Whether to show the dropdown
  const showDropdown = isFocused && (
    (query.trim() && autocompleteResults.length > 0) ||
    (!query.trim() && recentSearches.length > 0)
  );

  // Total selectable items in dropdown
  const totalItems = query.trim()
    ? autocompleteResults.length
    : recentSearches.length;

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (trimmed) {
        addRecentSearch(trimmed);
        onSearch(trimmed);
        setIsFocused(false);
      } else {
        onSearch('');
      }
    },
    [query, onSearch],
  );

  const handleSelectGame = useCallback(
    (game: GameMetadata) => {
      addRecentSearch(game.name);
      setQuery(game.name);
      onSearch(game.name);
      setIsFocused(false);
      inputRef.current?.blur();
    },
    [onSearch],
  );

  const handleSelectRecent = useCallback(
    (recentQuery: string) => {
      setQuery(recentQuery);
      onSearch(recentQuery);
      setIsFocused(false);
    },
    [onSearch],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  }, [onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        if (query.trim() && autocompleteResults[selectedIndex]) {
          handleSelectGame(autocompleteResults[selectedIndex]);
        } else if (!query.trim() && recentSearches[selectedIndex]) {
          handleSelectRecent(recentSearches[selectedIndex]);
        }
        setSelectedIndex(-1);
      } else if (e.key === 'Escape') {
        setIsFocused(false);
        setSelectedIndex(-1);
      }
    },
    [showDropdown, totalItems, selectedIndex, query, autocompleteResults, recentSearches, handleSelectGame, handleSelectRecent],
  );

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [autocompleteResults.length, recentSearches.length]);

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        {/* Search icon */}
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] transition-colors duration-200"
          style={{ color: isFocused ? 'var(--color-secondary)' : undefined }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value.trim()) onSearch('');
            // Live search: trigger onSearch on each keystroke
            if (e.target.value.trim()) onSearch(e.target.value.trim());
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-10 py-2.5
            bg-[var(--color-bg-card)] border border-[var(--color-border)]
            rounded-2xl text-[var(--color-text)] text-sm
            placeholder:text-[var(--color-text-muted)]
            focus:outline-none focus:ring-3 focus:ring-[var(--color-secondary)]/30 focus:border-[var(--color-secondary)]
            transition-all duration-200
            font-[var(--font-body)]
            min-h-[44px]
          "
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              w-6 h-6 flex items-center justify-center
              text-[var(--color-text-muted)] hover:text-[var(--color-text)]
              rounded-full transition-all duration-200
              hover:bg-[var(--color-bg-hover)]
              active:scale-90
            "
            aria-label="Clear search"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Autocomplete dropdown with animation */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="
            absolute top-full left-0 right-0 mt-1.5 z-50
            bg-[var(--color-bg-card)] border border-[var(--color-border)]
            rounded-xl shadow-[var(--shadow-lg)]
            dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)]
            overflow-hidden max-h-[320px] overflow-y-auto
            animate-[slideDown_150ms_ease-out]
          "
        >
          {/* Recent searches */}
          {!query.trim() && recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
                <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider font-[var(--font-body)]">
                  Recent Searches
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    clearRecentSearches();
                  }}
                  className="text-xs text-[var(--color-secondary)] hover:underline font-[var(--font-body)] transition-colors"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((recent, idx) => (
                <button
                  key={recent}
                  onClick={() => handleSelectRecent(recent)}
                  className={`
                    w-full text-left px-3 py-2.5 text-sm font-[var(--font-body)]
                    flex items-center gap-2 transition-all duration-150
                    ${selectedIndex === idx
                      ? 'bg-[var(--color-bg-hover)] text-[var(--color-text)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                    }
                  `}
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="truncate">{recent}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search results */}
          {query.trim() && autocompleteResults.length > 0 && (
            <div>
              <div className="px-3 py-2 border-b border-[var(--color-border)]">
                <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider font-[var(--font-body)]">
                  Games
                </span>
              </div>
              {autocompleteResults.map((game, idx) => (
                <button
                  key={game.id}
                  onClick={() => handleSelectGame(game)}
                  className={`
                    w-full text-left px-3 py-2.5 text-sm font-[var(--font-body)]
                    flex items-center gap-3 transition-all duration-150
                    ${selectedIndex === idx
                      ? 'bg-[var(--color-bg-hover)] text-[var(--color-text)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                    }
                  `}
                >
                  <span className="text-lg flex-shrink-0">
                    {game.category === 'logic-puzzle' ? '🧩' :
                     game.category === 'arcade' ? '👾' :
                     game.category === 'board' ? '🎲' :
                     game.category === 'card' ? '🃏' :
                     game.category === 'strategy' ? '♟️' :
                     game.category === 'action' ? '⚡' :
                     game.category === 'sports' ? '⚽' :
                     '🎈'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--color-text)] truncate">{game.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{game.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
