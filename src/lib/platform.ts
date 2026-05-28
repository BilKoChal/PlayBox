/**
 * Platform Detection
 *
 * Detects whether PlayBox is running on:
 * - Web (browser)
 * - Tauri (Windows desktop)
 * - Capacitor (Android)
 *
 * Provides platform-specific feature flags and utilities.
 */

export type PlatformType = 'web' | 'tauri' | 'capacitor';

export interface PlatformInfo {
  /** Which platform we're running on */
  type: PlatformType;

  /** Whether we're running on a mobile device */
  isMobile: boolean;

  /** Whether we're running on a desktop app */
  isDesktop: boolean;

  /** Whether the platform supports fullscreen API */
  supportsFullscreen: boolean;

  /** Whether the platform supports the keyboard */
  hasKeyboard: boolean;

  /** Whether the platform supports touch */
  hasTouch: boolean;

  /** Whether the platform supports gamepad */
  hasGamepad: boolean;
}

function detectPlatform(): PlatformInfo {
  const isTauri = !!(window as any).__TAURI_INTERNALS__;
  const isCapacitor = !!(window as any).Capacitor;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || isCapacitor;
  const isDesktop = !isMobile;

  return {
    type: isTauri ? 'tauri' : isCapacitor ? 'capacitor' : 'web',
    isMobile,
    isDesktop,
    supportsFullscreen: !!(document.fullscreenEnabled || (window as any).webkitFullscreenEnabled),
    hasKeyboard: isDesktop,
    hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    hasGamepad: !!navigator.getGamepads,
  };
}

/** Current platform info (computed once at module load) */
export const platform: PlatformInfo = detectPlatform();

/** Re-detect platform (useful if capabilities change) */
export function redetectPlatform(): PlatformInfo {
  return detectPlatform();
}
