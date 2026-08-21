// src/services/rebels.ts
//
// Shared rebel placement, used by:
//  - endRound() when a low score triggers an uprising
//  - sabotage, when a player pays to inflict a rebel on their opponent
//  - the AI, both as sabotage target and as saboteur
//
// Keeping this in one place means fort protection can't drift between the paths.

import { Island, Tile } from '../types';
import { BALANCE } from '../constants/game';

/**
 * Choose a tile a rebel can appear on.
 *
 * Rules (matching the existing endRound behaviour):
 *  - never a tile that already has a rebel
 *  - never a fort itself
 *  - never a tile within BALANCE.fortRadius of a fort
 *
 * Preference: tiles WITH a building are chosen first. An uprising on bare grass
 * costs the victim nothing, which makes paid sabotage feel like a waste of gold.
 * Falls back to empty tiles when every developed tile is protected.
 *
 * Returns null when the island has no valid target at all.
 */
export function pickRebelTarget(island: Island): Tile | null {
  const fortPositions = island.tiles
    .filter((t) => t.building === 'fort')
    .map((t) => t.position);

  const isProtected = (pos: { x: number; y: number }): boolean =>
    fortPositions.some(
      (fort) =>
        Math.abs(pos.x - fort.x) <= BALANCE.fortRadius &&
        Math.abs(pos.y - fort.y) <= BALANCE.fortRadius
    );

  const eligible = island.tiles.filter((t) => {
    if (t.hasRebel) return false;
    if (t.building === 'fort') return false;
    return !isProtected(t.position);
  });

  if (eligible.length === 0) return null;

  const developed = eligible.filter((t) => t.building);
  const pool = developed.length > 0 ? developed : eligible;

  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Place a rebel on a tile, destroying whatever was built there.
 * Returns a new Island — does not mutate.
 */
export function applyRebelToIsland(island: Island, tileId: string): Island {
  return {
    ...island,
    tiles: island.tiles.map((t) =>
      t.id === tileId ? { ...t, hasRebel: true, building: undefined } : t
    ),
  };
}

/** Convenience: pick a target and apply it. Returns null if there was none. */
export function inflictRebel(
  island: Island
): { island: Island; destroyedBuilding?: string } | null {
  const target = pickRebelTarget(island);
  if (!target) return null;
  return {
    island: applyRebelToIsland(island, target.id),
    destroyedBuilding: target.building,
  };
}
