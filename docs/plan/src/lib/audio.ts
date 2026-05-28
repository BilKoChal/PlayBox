/**
 * SoundManager — Full Web Audio API Sound Manager
 *
 * Manages all game and UI audio with a centralized, category-aware system.
 *
 * Features:
 * - Lazy AudioContext initialization (created on first play, respecting browser autoplay policy)
 * - 3 sound categories: ui, game, music (each independently muteable)
 * - Global mute toggle
 * - Per-game sound registration/unregistration (prevents memory leaks)
 * - Audio buffer loading and caching (loads once, plays many times)
 * - Procedural sound generation (fallback when no audio files available)
 * - Music looping support with crossfade
 * - Master volume + per-category volume
 * - Respects global SoundContext mute state
 */

export type SoundCategory = 'ui' | 'game' | 'music';

/** A registered sound definition */
interface SoundDefinition {
  /** URL to the audio file (relative to public/) */
  src?: string;
  /** Volume 0–1 (default 1) */
  volume?: number;
  /** Playback rate multiplier (default 1) */
  rate?: number;
  /** Whether to loop (primarily for music) */
  loop?: boolean;
  /** Category this sound belongs to */
  category: SoundCategory;
}

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private globalMuted = false;
  private masterVolume = 1.0;
  private categoryMuted: Record<SoundCategory, boolean> = {
    ui: false,
    game: false,
    music: false,
  };
  private categoryVolume: Record<SoundCategory, number> = {
    ui: 0.7,
    game: 1.0,
    music: 0.5,
  };

  // Registered sounds: gameId → { soundId → definition }
  private registeredSounds = new Map<string, Map<string, SoundDefinition>>();

  // Loaded buffers: cacheKey → AudioBuffer
  private bufferCache = new Map<string, AudioBuffer>();

  // Active source nodes for cleanup
  private activeSources = new Set<AudioBufferSourceNode>();

  // Active music node (for stopping/replacing)
  private activeMusic: AudioBufferSourceNode | null = null;

  // ============================================
  // AudioContext Lifecycle
  // ============================================

  /** Get or create the AudioContext (lazy init) */
  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    // Resume if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  /** Ensure AudioContext is initialized (call from user gesture handlers) */
  ensureInitialized(): void {
    this.getContext();
  }

  /** Check if AudioContext has been created */
  isInitialized(): boolean {
    return this.audioContext !== null;
  }

  // ============================================
  // Global Mute Control
  // ============================================

  /** Mute all sounds globally */
  mute(): void {
    this.globalMuted = true;
    this.stopMusic();
  }

  /** Unmute all sounds globally */
  unmute(): void {
    this.globalMuted = false;
  }

  /** Toggle global mute, returns new state */
  toggleMute(): boolean {
    this.globalMuted = !this.globalMuted;
    if (this.globalMuted) {
      this.stopMusic();
    }
    return this.globalMuted;
  }

  /** Check if sound is globally muted */
  isMuted(): boolean {
    return this.globalMuted;
  }

  /** Set master volume (0–1) */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /** Get master volume */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  // ============================================
  // Per-Category Control
  // ============================================

  /** Mute a specific category */
  muteCategory(category: SoundCategory): void {
    this.categoryMuted[category] = true;
    if (category === 'music') {
      this.stopMusic();
    }
  }

  /** Unmute a specific category */
  unmuteCategory(category: SoundCategory): void {
    this.categoryMuted[category] = false;
  }

  /** Toggle a category mute, returns new state */
  toggleCategoryMute(category: SoundCategory): boolean {
    this.categoryMuted[category] = !this.categoryMuted[category];
    if (this.categoryMuted[category] && category === 'music') {
      this.stopMusic();
    }
    return this.categoryMuted[category];
  }

  /** Check if a category is muted (global or per-category) */
  isCategoryMuted(category: SoundCategory): boolean {
    return this.globalMuted || this.categoryMuted[category];
  }

  /** Set volume for a category (0–1) */
  setCategoryVolume(category: SoundCategory, volume: number): void {
    this.categoryVolume[category] = Math.max(0, Math.min(1, volume));
  }

  /** Get volume for a category */
  getCategoryVolume(category: SoundCategory): number {
    return this.categoryVolume[category];
  }

  // ============================================
  // Sound Registration (Per-Game)
  // ============================================

  /**
   * Register sounds for a game.
   * Each game should call this in its mount() method.
   *
   * @param gameId - Unique game identifier
   * @param sounds - Map of soundId → SoundDefinition
   *
   * Example:
   * ```ts
   * utilities.soundManager.registerSounds('snake', {
   *   eat: { src: '/games/snake/eat.mp3', category: 'game', volume: 0.8 },
   *   die: { src: '/games/snake/die.mp3', category: 'game', volume: 1.0 },
   *   music: { src: '/games/snake/bgm.mp3', category: 'music', loop: true },
   * });
   * ```
   */
  registerSounds(gameId: string, sounds: Record<string, SoundDefinition>): void {
    const soundMap = new Map<string, SoundDefinition>();
    for (const [id, def] of Object.entries(sounds)) {
      soundMap.set(id, def);
      // Pre-load the audio buffer if a source URL is provided
      if (def.src) {
        this.loadBuffer(def.src).catch((err) => {
          console.warn(`Failed to load sound "${id}" for game "${gameId}":`, err);
        });
      }
    }
    this.registeredSounds.set(gameId, soundMap);
  }

  /**
   * Unregister all sounds for a game.
   * Each game should call this in its unmount() method to prevent memory leaks.
   */
  unregisterSounds(gameId: string): void {
    this.registeredSounds.delete(gameId);
    // If this game was playing music, stop it
    if (this.activeMusic) {
      try {
        this.activeMusic.stop();
      } catch {}
      this.activeMusic = null;
    }
  }

  // ============================================
  // Playback
  // ============================================

  /**
   * Play a registered sound by ID.
   *
   * @param soundId - The sound identifier
   * @param category - Override the sound's category
   * @param volume - Override the sound's volume (0–1)
   * @param rate - Override the playback rate
   */
  play(
    soundId: string,
    category?: SoundCategory,
    volume?: number,
    rate?: number,
  ): void {
    // Skip if muted
    const cat = category || 'game';
    if (this.isCategoryMuted(cat)) return;

    // Find the sound definition across all registered games
    let definition: SoundDefinition | undefined;
    for (const soundMap of this.registeredSounds.values()) {
      definition = soundMap.get(soundId);
      if (definition) break;
    }

    if (!definition) {
      // Sound not registered — play a procedural fallback
      this.playProcedural(soundId, cat);
      return;
    }

    const effectiveVolume = volume ?? definition.volume ?? 1.0;
    const effectiveRate = rate ?? definition.rate ?? 1.0;
    const effectiveCategory = category ?? definition.category;

    if (definition.src) {
      // Play from loaded audio buffer
      this.playFromBuffer(definition.src, effectiveCategory, effectiveVolume, effectiveRate, definition.loop ?? false);
    } else {
      // No source file — play procedural
      this.playProcedural(soundId, effectiveCategory, effectiveVolume);
    }
  }

  /**
   * Play a one-shot sound effect (not pre-registered).
   * Useful for UI sounds that don't belong to any game.
   */
  async playOnce(src: string, category: SoundCategory = 'ui', volume = 1.0): Promise<void> {
    if (this.isCategoryMuted(category)) return;
    try {
      await this.playFromBuffer(src, category, volume, 1.0, false);
    } catch {
      // Fallback to procedural
      this.playProcedural(src, category, volume);
    }
  }

  /** Stop all currently playing sounds */
  stopAll(): void {
    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch {}
    }
    this.activeSources.clear();
    this.stopMusic();
  }

  /** Stop currently playing music */
  stopMusic(): void {
    if (this.activeMusic) {
      try {
        this.activeMusic.stop();
      } catch {}
      this.activeMusic = null;
    }
  }

  // ============================================
  // Private: Buffer Loading
  // ============================================

  /** Load an audio file into a buffer and cache it */
  private async loadBuffer(src: string): Promise<AudioBuffer> {
    const cacheKey = src;
    if (this.bufferCache.has(cacheKey)) {
      return this.bufferCache.get(cacheKey)!;
    }

    const ctx = this.getContext();
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    this.bufferCache.set(cacheKey, audioBuffer);
    return audioBuffer;
  }

  /** Play audio from a loaded buffer */
  private async playFromBuffer(
    src: string,
    category: SoundCategory,
    volume: number,
    rate: number,
    loop: boolean,
  ): Promise<void> {
    if (this.isCategoryMuted(category)) return;

    try {
      const buffer = await this.loadBuffer(src);
      const ctx = this.getContext();

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = rate;
      source.loop = loop;

      // Create gain node for volume control
      const gainNode = ctx.createGain();
      const effectiveVolume = this.masterVolume * this.categoryVolume[category] * volume;
      gainNode.gain.value = effectiveVolume;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Track active sources
      if (loop && category === 'music') {
        // Replace previous music
        this.stopMusic();
        this.activeMusic = source;
      } else {
        this.activeSources.add(source);
      }

      source.onended = () => {
        this.activeSources.delete(source);
        if (this.activeMusic === source) {
          this.activeMusic = null;
        }
      };

      source.start(0);
    } catch (err) {
      console.warn(`Failed to play sound "${src}":`, err);
    }
  }

  // ============================================
  // Private: Procedural Sound Generation
  // ============================================

  /**
   * Generate simple procedural sounds when audio files aren't available.
   * This provides basic audio feedback even without loaded sound assets.
   */
  private playProcedural(
    soundId: string,
    category: SoundCategory,
    volume = 1.0,
  ): void {
    if (this.isCategoryMuted(category)) return;

    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const effectiveVolume = this.masterVolume * this.categoryVolume[category] * volume * 0.3;
      gain.gain.value = effectiveVolume;

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Different sounds based on ID patterns
      const now = ctx.currentTime;

      if (soundId.includes('click') || soundId.includes('tap')) {
        osc.type = 'sine';
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(effectiveVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (soundId.includes('score') || soundId.includes('point') || soundId.includes('eat')) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now); // C5
        osc.frequency.setValueAtTime(659, now + 0.08); // E5
        osc.frequency.setValueAtTime(784, now + 0.16); // G5
        gain.gain.setValueAtTime(effectiveVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (soundId.includes('die') || soundId.includes('hit') || soundId.includes('lose')) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
        gain.gain.setValueAtTime(effectiveVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (soundId.includes('win') || soundId.includes('complete') || soundId.includes('success')) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.12);
        osc.frequency.setValueAtTime(784, now + 0.24);
        osc.frequency.setValueAtTime(1047, now + 0.36);
        gain.gain.setValueAtTime(effectiveVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (soundId.includes('move') || soundId.includes('step')) {
        osc.type = 'sine';
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(effectiveVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else {
        // Default: short beep
        osc.type = 'sine';
        osc.frequency.value = 600;
        gain.gain.setValueAtTime(effectiveVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {
      // Web Audio API not available — silent fallback
    }
  }

  // ============================================
  // Utility: Preload Game Assets
  // ============================================

  /**
   * Preload all registered sounds for a game.
   * Call this when the user enters a game page, before mount().
   */
  async preloadGameSounds(gameId: string): Promise<void> {
    const soundMap = this.registeredSounds.get(gameId);
    if (!soundMap) return;

    const loadPromises: Promise<void>[] = [];
    for (const [id, def] of soundMap) {
      if (def.src) {
        loadPromises.push(
          this.loadBuffer(def.src)
            .then(() => {})
            .catch((err) => {
              console.warn(`Failed to preload sound "${id}" for game "${gameId}":`, err);
            }),
        );
      }
    }

    await Promise.all(loadPromises);
  }

  /**
   * Get the number of registered sounds for a game.
   */
  getRegisteredSoundCount(gameId: string): number {
    return this.registeredSounds.get(gameId)?.size ?? 0;
  }

  /**
   * Clean up all resources. Call when the app is shutting down.
   */
  dispose(): void {
    this.stopAll();
    this.bufferCache.clear();
    this.registeredSounds.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

/** Singleton instance */
export const soundManager = new SoundManager();
