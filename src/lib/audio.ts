/**
 * SoundManager — Web Audio API sound manager
 *
 * Manages game audio with 3 categories:
 * - ui: UI interaction sounds (clicks, toggles)
 * - game: In-game sound effects (jump, collision, score)
 * - music: Background music
 *
 * Features:
 * - Global mute toggle
 * - Per-category mute
 * - Per-game sound registration/unregistration
 * - Lazy initialization (audio context created on first play)
 *
 * Will be fully implemented in Phase 0.3 (Shared Services).
 */

export type SoundCategory = 'ui' | 'game' | 'music';

export class SoundManager {
  private globalMuted = false;
  private categoryMuted: Record<SoundCategory, boolean> = {
    ui: false,
    game: false,
    music: false,
  };

  /** Mute all sounds globally */
  mute(): void {
    this.globalMuted = true;
  }

  /** Unmute all sounds globally */
  unmute(): void {
    this.globalMuted = false;
  }

  /** Toggle global mute */
  toggleMute(): boolean {
    this.globalMuted = !this.globalMuted;
    return this.globalMuted;
  }

  /** Check if sound is globally muted */
  isMuted(): boolean {
    return this.globalMuted;
  }

  /** Mute a specific category */
  muteCategory(category: SoundCategory): void {
    this.categoryMuted[category] = true;
  }

  /** Unmute a specific category */
  unmuteCategory(category: SoundCategory): void {
    this.categoryMuted[category] = false;
  }

  /** Check if a category is muted */
  isCategoryMuted(category: SoundCategory): boolean {
    return this.globalMuted || this.categoryMuted[category];
  }

  /** Play a sound (stub — will use Web Audio API in Phase 0.3) */
  play(_soundId: string, _category: SoundCategory = 'game'): void {
    // Stub: will be implemented in Phase 0.3
  }

  /** Register sounds for a game */
  registerSounds(_gameId: string, _sounds: Record<string, string>): void {
    // Stub: will be implemented in Phase 0.3
  }

  /** Unregister all sounds for a game */
  unregisterSounds(_gameId: string): void {
    // Stub: will be implemented in Phase 0.3
  }
}

/** Singleton instance */
export const soundManager = new SoundManager();
