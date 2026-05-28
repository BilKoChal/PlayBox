/**
 * Game Registry Lookup Helpers
 *
 * Convenience functions for working with the auto-generated game registry.
 */

import type { GameRegistry, GameMetadata, GameRegistryEntry } from '@/types/game';

// The auto-generated registry will be imported here
// import { gameRegistry } from '@/game-registry.generated';

/** Get all registered game metadata (without loading game code) */
export function getAllGameMetas(registry: GameRegistry): GameMetadata[] {
  return Object.values(registry).map((entry) => entry.metadata);
}

/** Get metadata for a specific game */
export function getGameMeta(
  registry: GameRegistry,
  gameId: string,
): GameMetadata | undefined {
  return registry[gameId]?.metadata;
}

/** Load a game by ID (lazy-loads game code + engine chunk) */
export async function loadGame(
  registry: GameRegistry,
  gameId: string,
): Promise<{ default: import('@/types/game').PlayBoxGame } | null> {
  const entry: GameRegistryEntry | undefined = registry[gameId];
  if (!entry) {
    console.warn(`Game "${gameId}" not found in registry.`);
    return null;
  }
  return entry.load();
}

/** Get games filtered by category */
export function getGamesByCategory(
  registry: GameRegistry,
  category: import('@/types/game').GameCategory,
): GameMetadata[] {
  return Object.values(registry)
    .map((entry) => entry.metadata)
    .filter((meta) => meta.category === category);
}

/** Get games filtered by engine type */
export function getGamesByEngine(
  registry: GameRegistry,
  engine: import('@/types/game').EngineType,
): GameMetadata[] {
  return Object.values(registry)
    .map((entry) => entry.metadata)
    .filter((meta) => meta.engine === engine);
}

/** Get the total number of registered games */
export function getGameCount(registry: GameRegistry): number {
  return Object.keys(registry).length;
}
