/**
 * Header — Top navigation bar with logo, search, and controls
 *
 * Phase 1.3 Polish:
 * - Glassmorphism backdrop blur effect
 * - Dark mode glow on active elements
 * - Smooth icon transitions for theme/sound toggles
 * - Better mobile bottom nav with active indicators
 * - Logo hover animation
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
    <>
      <header className="
        sticky top-0 z-40
        bg-[var(--color-bg-card)]/90 backdrop-blur-xl
        border-b border-[var(--color-border)]
        shadow-[var(--shadow-sm)]
        dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]
        safe-top
      ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 flex-shrink-0 group"
            >
              <span className="text-2xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 ease-out">
                🎮
              </span>
              <span className="
                text-xl font-extrabold font-[var(--font-heading)]
                text-[var(--color-primary)] hidden sm:inline
                group-hover:text-[var(--color-primary-dark)] transition-colors duration-200
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
                  placeholder="Find a game..."
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              {/* Navigation links — desktop */}
              <nav className="hidden md:flex items-center gap-1 mr-2">
                <Link
                  to="/"
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-semibold font-[var(--font-body)]
                    transition-all duration-200 min-h-[36px] flex items-center
                    ${location.pathname === '/'
                      ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary-dark)] dark:glow-primary'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                    }
                  `}
                >
                  🎮 Games
                </Link>
                <Link
                  to="/favorites"
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-semibold font-[var(--font-body)]
                    transition-all duration-200 min-h-[36px] flex items-center gap-1
                    ${location.pathname === '/favorites'
                      ? 'bg-[var(--color-accent-red)]/15 text-[var(--color-accent-red)] dark:glow-accent'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                    }
                  `}
                >
                  ❤️ Favorites
                </Link>
                <Link
                  to="/settings"
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-semibold font-[var(--font-body)]
                    transition-all duration-200 min-h-[36px] flex items-center gap-1
                    ${location.pathname === '/settings'
                      ? 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] dark:glow-secondary'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                    }
                  `}
                >
                  ⚙️ Settings
                </Link>
              </nav>

              {/* Sound toggle */}
              <button
                onClick={toggleMute}
                className="
                  w-9 h-9 flex items-center justify-center
                  rounded-xl text-lg
                  text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]
                  transition-all duration-200 touch-target
                  active:scale-90
                "
                aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
                title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
              >
                <span className="transition-transform duration-300 hover:scale-110">
                  {isMuted ? '🔇' : '🔊'}
                </span>
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="
                  w-9 h-9 flex items-center justify-center
                  rounded-xl text-lg
                  text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]
                  transition-all duration-200 touch-target
                  active:scale-90
                "
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="inline-block transition-transform duration-500 hover:rotate-180">
                  {theme === 'dark' ? '☀️' : '🌙'}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile search — shown below header on non-game pages */}
          {!isGamePage && (
            <div className="sm:hidden pb-3 animate-[slideDown_200ms_ease-out]">
              <SearchBar
                onSearch={handleSearch}
                games={games}
                placeholder="Find a game..."
              />
            </div>
          )}
        </div>
      </header>

      {/* Mobile bottom navigation — only visible on small screens */}
      <nav className="
        md:hidden fixed bottom-0 left-0 right-0 z-40
        bg-[var(--color-bg-card)]/95 backdrop-blur-xl
        border-t border-[var(--color-border)]
        dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)]
        safe-bottom
        animate-[slideUp_300ms_ease-out]
      ">
        <div className="flex items-center justify-around py-1 px-2 max-w-md mx-auto">
          <Link
            to="/"
            className={`
              flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
              text-xs font-semibold font-[var(--font-body)]
              transition-all duration-200 min-w-[56px] min-h-[44px]
              justify-center
              ${location.pathname === '/'
                ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10 dark:glow-primary'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }
            `}
          >
            <span className={`text-lg transition-transform duration-200 ${location.pathname === '/' ? 'scale-110' : ''}`}>
              🎮
            </span>
            <span>Games</span>
          </Link>
          <Link
            to="/favorites"
            className={`
              flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
              text-xs font-semibold font-[var(--font-body)]
              transition-all duration-200 min-w-[56px] min-h-[44px]
              justify-center
              ${location.pathname === '/favorites'
                ? 'text-[var(--color-accent-red)] bg-[var(--color-accent-red)]/10 dark:glow-accent'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }
            `}
          >
            <span className={`text-lg transition-transform duration-200 ${location.pathname === '/favorites' ? 'scale-110' : ''}`}>
              ❤️
            </span>
            <span>Favorites</span>
          </Link>
          <Link
            to="/settings"
            className={`
              flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
              text-xs font-semibold font-[var(--font-body)]
              transition-all duration-200 min-w-[56px] min-h-[44px]
              justify-center
              ${location.pathname === '/settings'
                ? 'text-[var(--color-secondary)] bg-[var(--color-secondary)]/10 dark:glow-secondary'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }
            `}
          >
            <span className={`text-lg transition-transform duration-200 ${location.pathname === '/settings' ? 'scale-110' : ''}`}>
              ⚙️
            </span>
            <span>Settings</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
