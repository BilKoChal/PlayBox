/**
 * Header — Top navigation bar with logo, search, and controls
 *
 * Features:
 * - PlayBox logo (links to home)
 * - SearchBar with autocomplete (hidden on game pages)
 * - Navigation links (desktop: inline, mobile: bottom nav)
 * - Sound and theme toggles
 * - Mobile-responsive layout
 */

import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useSoundContext } from '@/contexts/SoundContext';
import SearchBar from '@/components/ui/SearchBar';
import type { GameMetadata } from '@/types/game';

interface HeaderProps {
  onSearch: (query: string) => void;
  games?: GameMetadata[];
}

export default function Header({ onSearch, games = [] }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { isMuted, toggleMute } = useSoundContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const isGamePage = location.pathname.startsWith('/game/');

  const handleSearch = (query: string) => {
    // Navigate to home if not already there (so search results show)
    if (location.pathname !== '/') {
      navigate('/');
    }
    // Update URL params
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (query.trim()) {
        next.set('q', query.trim());
      } else {
        next.delete('q');
      }
      return next;
    });
    onSearch(query);
  };

  return (
    <header className="
      sticky top-0 z-40
      bg-[var(--color-bg-card)]/95 backdrop-blur-sm
      border-b border-[var(--color-border)]
      shadow-[var(--shadow-sm)]
    ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
              🎮
            </span>
            <span className="
              text-xl font-extrabold font-[var(--font-heading)]
              text-[var(--color-primary)] hidden sm:inline
              group-hover:text-[var(--color-primary-dark)] transition-colors
            ">
              PlayBox
            </span>
          </Link>

          {/* Search bar — hidden on game page for more space */}
          {!isGamePage && (
            <div className="flex-1 max-w-md hidden sm:block">
              <SearchBar
                onSearch={handleSearch}
                games={games}
                placeholder="Search games..."
              />
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-1">
            {/* Navigation links — desktop */}
            <nav className="hidden md:flex items-center gap-1 mr-2">
              <Link
                to="/"
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-semibold font-[var(--font-body)]
                  transition-colors min-h-[36px] flex items-center
                  ${location.pathname === '/'
                    ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary-dark)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                  }
                `}
              >
                Games
              </Link>
              <Link
                to="/favorites"
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-semibold font-[var(--font-body)]
                  transition-colors min-h-[36px] flex items-center gap-1
                  ${location.pathname === '/favorites'
                    ? 'bg-[var(--color-accent-pink)]/15 text-[var(--color-accent-pink)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                  }
                `}
              >
                <span>❤️</span> Favorites
              </Link>
              <Link
                to="/settings"
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-semibold font-[var(--font-body)]
                  transition-colors min-h-[36px] flex items-center gap-1
                  ${location.pathname === '/settings'
                    ? 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                  }
                `}
              >
                <span>⚙️</span> Settings
              </Link>
            </nav>

            {/* Sound toggle */}
            <button
              onClick={toggleMute}
              className="
                w-9 h-9 flex items-center justify-center
                rounded-lg text-lg
                text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]
                transition-colors touch-target
              "
              aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
              title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="
                w-9 h-9 flex items-center justify-center
                rounded-lg text-lg
                text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]
                transition-colors touch-target
              "
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Mobile search — shown below header on non-game pages */}
        {!isGamePage && (
          <div className="sm:hidden pb-3">
            <SearchBar
              onSearch={handleSearch}
              games={games}
              placeholder="Search games..."
            />
          </div>
        )}
      </div>

      {/* Mobile bottom navigation */}
      <nav className="
        md:hidden fixed bottom-0 left-0 right-0 z-40
        bg-[var(--color-bg-card)] border-t border-[var(--color-border)]
        flex items-center justify-around py-1 px-2
      ">
        <Link
          to="/"
          className={`
            flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg
            text-xs font-semibold font-[var(--font-body)]
            transition-colors min-w-[56px]
            ${location.pathname === '/'
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--color-text-muted)]'
            }
          `}
        >
          <span className="text-lg">🎮</span>
          Games
        </Link>
        <Link
          to="/favorites"
          className={`
            flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg
            text-xs font-semibold font-[var(--font-body)]
            transition-colors min-w-[56px]
            ${location.pathname === '/favorites'
              ? 'text-[var(--color-accent-pink)]'
              : 'text-[var(--color-text-muted)]'
            }
          `}
        >
          <span className="text-lg">❤️</span>
          Favorites
        </Link>
        <Link
          to="/settings"
          className={`
            flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg
            text-xs font-semibold font-[var(--font-body)]
            transition-colors min-w-[56px]
            ${location.pathname === '/settings'
              ? 'text-[var(--color-secondary)]'
              : 'text-[var(--color-text-muted)]'
            }
          `}
        >
          <span className="text-lg">⚙️</span>
          Settings
        </Link>
      </nav>
    </header>
  );
}
