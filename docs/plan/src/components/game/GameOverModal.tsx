/**
 * GameOverModal — Score submission flow with player name prompt
 *
 * Shows when a game ends:
 * 1. Final score display
 * 2. "New High Score!" celebration if applicable
 * 3. Player name input (with saved name from localStorage)
 * 4. Submit score button
 * 5. Leaderboard tab showing top 10 scores
 *
 * Uses ScoreTracker for persistence and PlayerNameManager for name.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Difficulty, GameMetadata } from '@/types/game';
import { DIFFICULTIES } from '@/types/game';
import { scoreTracker, playerNameManager } from '@/lib/storage';
import type { ScoreType, ScoreEntry } from '@/lib/storage';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Leaderboard from '@/components/game/Leaderboard';
import Confetti from '@/components/game/Confetti';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameMetadata;
  difficulty: Difficulty;
  finalScore: number;
  scoreType?: ScoreType;
  onPlayAgain?: () => void;
}

export default function GameOverModal({
  isOpen,
  onClose,
  game,
  difficulty,
  finalScore,
  scoreType = 'points',
  onPlayAgain,
}: GameOverModalProps) {
  const [playerName, setPlayerName] = useState('');
  const [isNewHigh, setIsNewHigh] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topScores, setTopScores] = useState<ScoreEntry[]>([]);

  // Load saved player name on mount
  useEffect(() => {
    if (isOpen) {
      setPlayerName(playerNameManager.getName());
      setHasSubmitted(false);
      setIsNewHigh(false);

      // Check if this is a new high score
      scoreTracker
        .isNewHighScore(game.id, difficulty, finalScore, scoreType)
        .then((result) => setIsNewHigh(result))
        .catch(() => {});

      // Load current leaderboard
      scoreTracker
        .getTopScores(game.id, difficulty, 10, scoreType)
        .then((scores) => setTopScores(scores))
        .catch(() => setTopScores([]));
    }
  }, [isOpen, game.id, difficulty, finalScore, scoreType]);

  const handleSubmit = useCallback(async () => {
    if (hasSubmitted || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const name = playerName.trim() || 'Player';
      playerNameManager.setName(name);
      await scoreTracker.submitScore(game.id, difficulty, name, finalScore);

      // Refresh leaderboard
      const scores = await scoreTracker.getTopScores(game.id, difficulty, 10, scoreType);
      setTopScores(scores);
      setHasSubmitted(true);
    } catch (err) {
      console.warn('Score submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [hasSubmitted, isSubmitting, playerName, game.id, difficulty, finalScore, scoreType]);

  const difficultyInfo = DIFFICULTIES[difficulty];

  return (
    <>
      {isNewHigh && isOpen && <Confetti />}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Game Over!"
      >
        <div className="space-y-4">
          {/* Score display */}
          <div className="text-center py-4">
            {isNewHigh && (
              <div className="mb-2 animate-bounce">
                <span className="text-3xl">🏆</span>
                <p className="text-lg font-extrabold font-[var(--font-heading)] text-[var(--color-primary)]">
                  New High Score!
                </p>
              </div>
            )}
            <p className="text-4xl font-extrabold font-[var(--font-heading)] text-[var(--color-text)]">
              {finalScore.toLocaleString()}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] font-[var(--font-body)] mt-1">
              {game.name} • {difficultyInfo.emoji} {difficultyInfo.label}
            </p>
          </div>

          {/* Player name input (before submission) */}
          {!hasSubmitted && (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="player-name"
                  className="block text-sm font-semibold text-[var(--color-text)] font-[var(--font-body)] mb-1"
                >
                  Your Name
                </label>
                <input
                  id="player-name"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="
                    w-full px-3 py-2 rounded-lg text-sm
                    bg-[var(--color-bg)] border border-[var(--color-border)]
                    text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]
                    font-[var(--font-body)]
                  "
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                  }}
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Save Score'}
              </Button>
            </div>
          )}

          {/* Score submitted confirmation */}
          {hasSubmitted && (
            <div className="text-center py-2">
              <span className="text-2xl">✅</span>
              <p className="text-sm font-semibold text-[var(--color-accent-green)] font-[var(--font-body)] mt-1">
                Score saved!
              </p>
            </div>
          )}

          {/* Leaderboard */}
          <div className="border-t border-[var(--color-border)] pt-4">
            <h3 className="text-sm font-bold text-[var(--color-text)] font-[var(--font-heading)] mb-3">
              Top Scores
            </h3>
            <Leaderboard
              scores={topScores}
              scoreType={scoreType}
              highlightName={hasSubmitted ? playerName : undefined}
              maxDisplay={5}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {onPlayAgain && (
              <Button
                variant="primary"
                size="md"
                onClick={onPlayAgain}
                className="flex-1"
              >
                Play Again
              </Button>
            )}
            <Button
              variant="ghost"
              size="md"
              onClick={onClose}
              className={onPlayAgain ? '' : 'flex-1'}
            >
              Back to Games
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
