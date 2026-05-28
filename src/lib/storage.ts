/**
 * Storage — IndexedDB + localStorage abstraction
 *
 * Full implementation of all persistence services:
 * - ScoreTracker: High scores via IndexedDB (Dexie.js)
 * - PlayerNameManager: Default player name via localStorage
 * - ScoreFormatter: Utility for formatting different score types
 * - SettingsManager: App settings persistence via localStorage
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

/** Score type determines how scores are formatted and compared */
export type ScoreType = 'points' | 'time' | 'length' | 'moves';

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
  /**
   * Submit a score for a game at a difficulty level.
   * Returns the auto-generated ID.
   */
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

  /**
   * Get the top N scores for a game at a difficulty level.
   * For 'time' scores, lower is better (ascending order).
   * For all others, higher is better (descending order).
   */
  async getTopScores(
    gameId: string,
    difficulty: Difficulty,
    limit: number = 10,
    scoreType: ScoreType = 'points',
  ): Promise<ScoreEntry[]> {
    const entries = await db.scores
      .where('[gameId+difficulty]')
      .equals([gameId, difficulty])
      .toArray();

    if (scoreType === 'time') {
      // For time-based scores, sort ascending (lower is better)
      entries.sort((a, b) => a.score - b.score);
    } else {
      // For points/length/moves, sort descending (higher is better)
      entries.sort((a, b) => b.score - a.score);
    }

    return entries.slice(0, limit);
  }

  /**
   * Get the highest (or best) score for a game at a difficulty level.
   */
  async getHighScore(
    gameId: string,
    difficulty: Difficulty,
    scoreType: ScoreType = 'points',
  ): Promise<ScoreEntry | undefined> {
    const scores = await this.getTopScores(gameId, difficulty, 1, scoreType);
    return scores[0];
  }

  /**
   * Get the best score across all difficulties for a game.
   */
  async getHighScoreAcrossDifficulties(
    gameId: string,
    scoreType: ScoreType = 'points',
  ): Promise<ScoreEntry | undefined> {
    const allScores = await db.scores.where('gameId').equals(gameId).toArray();

    if (allScores.length === 0) return undefined;

    if (scoreType === 'time') {
      allScores.sort((a, b) => a.score - b.score);
    } else {
      allScores.sort((a, b) => b.score - a.score);
    }

    return allScores[0];
  }

  /**
   * Get all scores for a game, sorted by score.
   */
  async getScoresForGame(
    gameId: string,
    scoreType: ScoreType = 'points',
  ): Promise<ScoreEntry[]> {
    const entries = await db.scores.where('gameId').equals(gameId).toArray();

    if (scoreType === 'time') {
      entries.sort((a, b) => a.score - b.score);
    } else {
      entries.sort((a, b) => b.score - a.score);
    }

    return entries;
  }

  /**
   * Get the total number of scores for a game.
   */
  async getScoreCount(gameId: string): Promise<number> {
    return db.scores.where('gameId').equals(gameId).count();
  }

  /**
   * Get the total number of scores across all games.
   */
  async getTotalScoreCount(): Promise<number> {
    return db.scores.count();
  }

  /**
   * Delete a specific score by ID.
   */
  async deleteScore(id: number): Promise<void> {
    await db.scores.delete(id);
  }

  /**
   * Delete all scores for a specific game.
   */
  async deleteAllScoresForGame(gameId: string): Promise<number> {
    const entries = await db.scores.where('gameId').equals(gameId).toArray();
    const ids = entries.map((e) => e.id).filter((id): id is number => id !== undefined);
    await db.scores.bulkDelete(ids);
    return ids.length;
  }

  /**
   * Clear all scores from the database.
   */
  async clearAllScores(): Promise<void> {
    await db.scores.clear();
  }

  /**
   * Export all scores as a JSON string.
   */
  async exportScores(): Promise<string> {
    const allScores = await db.scores.toArray();
    return JSON.stringify(allScores, null, 2);
  }

  /**
   * Import scores from a JSON string.
   * Returns the number of scores imported.
   */
  async importScores(jsonString: string): Promise<number> {
    const scores: ScoreEntry[] = JSON.parse(jsonString);
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

  /**
   * Check if a score is a new high score.
   * Compares against existing scores for the same game + difficulty.
   */
  async isNewHighScore(
    gameId: string,
    difficulty: Difficulty,
    score: number,
    scoreType: ScoreType = 'points',
  ): Promise<boolean> {
    const current = await this.getHighScore(gameId, difficulty, scoreType);
    if (!current) return true; // No existing score — this is a high score

    if (scoreType === 'time') {
      return score < current.score; // Lower time is better
    }
    return score > current.score; // Higher score is better
  }
}

// ============================================
// ScoreFormatter
// ============================================

export class ScoreFormatter {
  /**
   * Format a score value based on its type.
   */
  static format(score: number, type: ScoreType): string {
    switch (type) {
      case 'time':
        return ScoreFormatter.formatTime(score);
      case 'length':
        return `${score} items`;
      case 'moves':
        return `${score} moves`;
      case 'points':
      default:
        return score.toLocaleString();
    }
  }

  /**
   * Format a time value in seconds to MM:SS or MM:SS.ms format.
   */
  static formatTime(seconds: number, showMs = false): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    if (showMs) {
      const ms = Math.floor((seconds % 1) * 100);
      return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }

    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Format a score with a label.
   */
  static formatWithLabel(score: number, type: ScoreType): string {
    const formatted = ScoreFormatter.format(score, type);
    switch (type) {
      case 'time':
        return `Time: ${formatted}`;
      case 'length':
        return `Length: ${formatted}`;
      case 'moves':
        return `Moves: ${formatted}`;
      case 'points':
      default:
        return `Score: ${formatted}`;
    }
  }
}

// ============================================
// PlayerNameManager
// ============================================

const PLAYER_NAME_KEY = 'playbox-player-name';

export class PlayerNameManager {
  /**
   * Get the saved player name, or default to "Player".
   */
  getName(): string {
    try {
      return localStorage.getItem(PLAYER_NAME_KEY) || 'Player';
    } catch {
      return 'Player';
    }
  }

  /**
   * Save the player name.
   */
  setName(name: string): void {
    try {
      localStorage.setItem(PLAYER_NAME_KEY, name.trim() || 'Player');
    } catch {}
  }

  /**
   * Check if a player name has been set.
   */
  hasName(): boolean {
    try {
      return !!localStorage.getItem(PLAYER_NAME_KEY);
    } catch {
      return false;
    }
  }

  /**
   * Clear the saved player name.
   */
  clearName(): void {
    try {
      localStorage.removeItem(PLAYER_NAME_KEY);
    } catch {}
  }
}

// ============================================
// SettingsManager
// ============================================

export interface AppSettings {
  theme: 'light' | 'dark';
  soundMuted: boolean;
  musicVolume: number;
  effectsVolume: number;
  reducedMotion: boolean;
}

const SETTINGS_KEY = 'playbox-settings';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  soundMuted: false,
  musicVolume: 0.5,
  effectsVolume: 1.0,
  reducedMotion: false,
};

export class SettingsManager {
  /**
   * Get all settings.
   */
  getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {}
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Get a single setting value.
   */
  get<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.getSettings()[key];
  }

  /**
   * Set a single setting value.
   */
  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    const settings = this.getSettings();
    settings[key] = value;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }

  /**
   * Update multiple settings at once.
   */
  update(partial: Partial<AppSettings>): void {
    const settings = { ...this.getSettings(), ...partial };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }

  /**
   * Reset all settings to defaults.
   */
  reset(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch {}
  }
}

// ============================================
// Singleton Instances
// ============================================

export const scoreTracker = new ScoreTracker();
export const playerNameManager = new PlayerNameManager();
export const settingsManager = new SettingsManager();
