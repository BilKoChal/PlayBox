/**
 * Fullscreen Service — Enhanced Cross-Platform Support
 *
 * Supports:
 * - Web: Fullscreen API (with webkit prefix fallback)
 * - Tauri: Window API via __TAURI_INTERNALS__ (no static imports)
 * - Capacitor: StatusBar plugin (future integration)
 *
 * Features:
 * - Event listeners for fullscreen state changes
 * - isSupported() detection
 * - onFullscreenChange callback registration
 * - Automatic state tracking via fullscreenchange event
 */

import { platform } from './platform';

export type FullscreenChangeListener = (isFullscreen: boolean) => void;

export class FullscreenService {
  private isFullscreenState = false;
  private listeners = new Set<FullscreenChangeListener>();

  constructor() {
    this.setupEventListeners();
  }

  // ============================================
  // State Query
  // ============================================

  /** Check if currently in fullscreen mode */
  isFullscreen(): boolean {
    return this.isFullscreenState;
  }

  /** Check if the platform supports fullscreen */
  isSupported(): boolean {
    if (platform.type === 'tauri') return true;
    if (platform.type === 'capacitor') return true;
    return !!(
      document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled
    );
  }

  // ============================================
  // Fullscreen Control
  // ============================================

  /** Enter fullscreen mode */
  async enterFullscreen(): Promise<void> {
    if (this.isFullscreenState) return; // Already fullscreen

    if (platform.type === 'tauri') {
      try {
        await this.tauriSetFullscreen(true);
        this.setFullscreenState(true);
        return;
      } catch {
        // Fallback to web API
      }
    }
    await this.webEnterFullscreen();
  }

  /** Exit fullscreen mode */
  async exitFullscreen(): Promise<void> {
    if (!this.isFullscreenState) return; // Not fullscreen

    if (platform.type === 'tauri') {
      try {
        await this.tauriSetFullscreen(false);
        this.setFullscreenState(false);
        return;
      } catch {
        // Fallback to web API
      }
    }
    await this.webExitFullscreen();
  }

  /** Toggle fullscreen mode */
  async toggleFullscreen(): Promise<void> {
    if (this.isFullscreenState) {
      await this.exitFullscreen();
    } else {
      await this.enterFullscreen();
    }
  }

  // ============================================
  // Change Listeners
  // ============================================

  /**
   * Register a callback for fullscreen state changes.
   * Returns an unsubscribe function.
   */
  onFullscreenChange(listener: FullscreenChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // ============================================
  // Private: Event Listeners
  // ============================================

  private setupEventListeners(): void {
    // Listen for native fullscreen changes (web)
    document.addEventListener('fullscreenchange', () => {
      const isFullscreen = !!document.fullscreenElement;
      this.setFullscreenState(isFullscreen);
    });

    document.addEventListener('webkitfullscreenchange', () => {
      const isFullscreen = !!(document as any).webkitFullscreenElement;
      this.setFullscreenState(isFullscreen);
    });
  }

  private setFullscreenState(isFullscreen: boolean): void {
    const changed = this.isFullscreenState !== isFullscreen;
    this.isFullscreenState = isFullscreen;

    if (changed) {
      for (const listener of this.listeners) {
        try {
          listener(isFullscreen);
        } catch (err) {
          console.warn('Fullscreen listener error:', err);
        }
      }
    }
  }

  // ============================================
  // Private: Platform-Specific
  // ============================================

  /**
   * Access Tauri fullscreen API via the global runtime.
   * No static imports — prevents Rollup resolution errors.
   */
  private async tauriSetFullscreen(flag: boolean): Promise<void> {
    const internals = (window as any).__TAURI_INTERNALS__;
    if (!internals) {
      throw new Error('Tauri internals not available');
    }

    // Try window API
    if (internals.window) {
      const win = internals.window.getCurrent();
      if (win?.setFullscreen) {
        await win.setFullscreen(flag);
        return;
      }
    }

    // Try invoke protocol
    if (internals.invoke) {
      await internals.invoke('plugin:window|set_fullscreen', { label: null, flag });
      return;
    }

    throw new Error('Could not access Tauri window API');
  }

  private async webEnterFullscreen(): Promise<void> {
    const elem = document.documentElement as any;
    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      await elem.webkitRequestFullscreen();
    } else {
      console.warn('Fullscreen API not available on this platform');
    }
  }

  private async webExitFullscreen(): Promise<void> {
    const doc = document as any;
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    } else {
      console.warn('Fullscreen API not available on this platform');
    }
  }
}

/** Singleton instance */
export const fullscreenService = new FullscreenService();
