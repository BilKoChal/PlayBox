/**
 * Leaderboard — Top 10 scores table with difficulty tabs
 *
 * Displays a compact leaderboard for a single difficulty level.
 * Shows rank, player name, score, and date achieved.
 * Highlights the current player's score if specified.
 */

import type { ScoreEntry, ScoreType } from '@/lib/storage';
import { ScoreFormatter } from '@/lib/storage';

interface LeaderboardProps {
  scores: ScoreEntry[];
  scoreType?: ScoreType;
  /** Highlight a specific player name (e.g., current user) */
  highlightName?: string;
  /** Maximum number of entries to display */
  maxDisplay?: number;
  className?: string;
}

export default function Leaderboard({
  scores,
  scoreType = 'points',
  highlightName,
  maxDisplay = 10,
  className = '',
}: LeaderboardProps) {
  const displayScores = scores.slice(0, maxDisplay);

  if (displayScores.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <span className="text-3xl">🎯</span>
        <p className="text-sm text-[var(--color-text-secondary)] font-[var(--font-body)] mt-2">
          No scores yet — be the first!
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-1">
        {displayScores.map((entry, idx) => {
          const isHighlighted = highlightName && entry.playerName === highlightName;
          const rank = idx + 1;
          const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`;

          return (
            <div
              key={entry.id ?? idx}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-[var(--font-body)]
                transition-colors
                ${isHighlighted
                  ? 'bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30'
                  : idx % 2 === 0
                    ? 'bg-[var(--color-bg)]'
                    : 'bg-transparent'
                }
              `}
            >
              {/* Rank */}
              <span className="w-7 text-center flex-shrink-0 text-base">
                {typeof rankIcon === 'string' && rankIcon.length > 1 ? rankIcon : (
                  <span className="text-xs font-bold text-[var(--color-text-muted)]">{rankIcon}</span>
                )}
              </span>

              {/* Player name */}
              <span className={`
                flex-1 truncate font-semibold
                ${isHighlighted ? 'text-[var(--color-primary-dark)]' : 'text-[var(--color-text)]'}
              `}>
                {entry.playerName}
              </span>

              {/* Score */}
              <span className={`
                font-bold tabular-nums text-right
                ${isHighlighted ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}
              `}>
                {ScoreFormatter.format(entry.score, scoreType)}
              </span>

              {/* Date */}
              <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0 hidden sm:block">
                {formatDate(entry.achievedAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Format a date to a compact display string */
function formatDate(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}
