/**
 * useHighScore — Score persistence hook
 *
 * Provides React-friendly access to ScoreTracker with state management.
 * Used by GamePage and Leaderboard components.
 */

import { useState, useEffect, useCallback } from 'react';
import { scoreTracker } from '@/lib/storage';
import type { ScoreEntry, ScoreType } from '@/lib/storage';
import type { Difficulty } from '@/types/game';

export function useHighScore(
  gameId: string,
  difficulty: Difficulty,
  scoreType: ScoreType = 'points',
) {
  const [highScore, setHighScore] = useState<ScoreEntry | undefined>(undefined);
  const [topScores, setTopScores] = useState<ScoreEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [hs, top] = await Promise.all([
        scoreTracker.getHighScore(gameId, difficulty, scoreType),
        scoreTracker.getTopScores(gameId, difficulty, 10, scoreType),
      ]);
      setHighScore(hs);
      setTopScores(top);
    } catch (err) {
      console.warn('Failed to load scores:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gameId, difficulty, scoreType]);

  useEffect(() => {
    setIsLoading(true);
    refresh();
  }, [refresh]);

  const submitScore = useCallback(
    async (playerName: string, score: number): Promise<boolean> => {
      try {
        await scoreTracker.submitScore(gameId, difficulty, playerName, score);
        const isHigh = await scoreTracker.isNewHighScore(gameId, difficulty, score, scoreType);
        await refresh();
        return isHigh;
      } catch (err) {
        console.warn('Score submission failed:', err);
        return false;
      }
    },
    [gameId, difficulty, scoreType, refresh],
  );

  const isHighScore = useCallback(
    async (score: number): Promise<boolean> => {
      try {
        return scoreTracker.isNewHighScore(gameId, difficulty, score, scoreType);
      } catch {
        return false;
      }
    },
    [gameId, difficulty, scoreType],
  );

  return {
    highScore,
    topScores,
    isLoading,
    submitScore,
    isHighScore,
    refresh,
  };
}
