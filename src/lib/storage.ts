/**
 * Storage — IndexedDB + localStorage abstraction
 *
 * Uses Dexie.js for IndexedDB (high scores) and localStorage for simple data (favorites, settings).
 * Will be fully implemented in Phase 0.3 (Shared Services).
 */

import Dexie, { type Table } from 'dexie';
import type { Difficulty } from '@/types/game';

// ============================================
// Score Types
// ============================================

export interface ScoreEntry {
  id?: number; // Auto-incremented
  gameId: string;
  difficulty: Difficulty;
  playerName: string;
  score: number;
  achievedAt: Date;
}

// ============================================
// PlayBox Database
// ============================================

class PlayBoxDB extends Dexie {
  scores!: Table<ScoreEntry, number>;

  constructor() {
    super('PlayBoxDB');
    this.version(1).stores({
      // Compound index for efficient top-10 queries
      scores: '++id, gameId, [gameId+difficulty], score, achievedAt',
    });
  }
}

const db = new PlayBoxDB();

// ============================================
// ScoreTracker
// ============================================

export class ScoreTracker {
  /** Submit a score for a game at a difficulty level */
  async submitScore(
    gameId: string,
    difficulty: Difficulty,
    playerName: string,
    score: number,
  ): Promise<number> {
    const id = await db.scores.add({
      gameId,
      difficulty,
      playerName,
      score,
      achievedAt: new Date(),
    });
    return id;
  }

  /** Get the top N scores for a game at a difficulty level */
  async getTopScores(
    gameId: string,
    difficulty: Difficulty,
    limit: number = 10,
  ): Promise<ScoreEntry[]> {
    return db.scores
      .where('[gameId+difficulty]')
      .equals([gameId, difficulty])
      .reverse()
      .sortBy('score')
      .then((entries) => entries.slice(0, limit));
  }

  /** Get the highest score for a game at a difficulty level */
  async getHighScore(
    gameId: string,
    difficulty: Difficulty,
  ): Promise<ScoreEntry | undefined> {
    const scores = await this.getTopScores(gameId, difficulty, 1);
    return scores[0];
  }

  /** Get all scores for a game */
  async getScoresForGame(gameId: string): Promise<ScoreEntry[]> {
    return db.scores.where('gameId').equals(gameId).reverse().sortBy('score');
  }

  /** Delete a score by ID */
  async deleteScore(id: number): Promise<void> {
    await db.scores.delete(id);
  }

  /** Export all scores as JSON */
  async exportScores(): Promise<string> {
    const allScores = await db.scores.toArray();
    return JSON.stringify(allScores, null, 2);
  }

  /** Import scores from JSON */
  async importScores(jsonString: string): Promise<number> {
    const scores: ScoreEntry[] = JSON.parse(jsonString);
    // Validate and add
    let count = 0;
    for (const score of scores) {
      if (score.gameId && score.difficulty && score.score !== undefined) {
        await db.scores.add({
          gameId: score.gameId,
          difficulty: score.difficulty,
          playerName: score.playerName || 'Anonymous',
          score: score.score,
          achievedAt: score.achievedAt ? new Date(score.achievedAt) : new Date(),
        });
        count++;
      }
    }
    return count;
  }
}

/** Singleton instance */
export const scoreTracker = new ScoreTracker();
