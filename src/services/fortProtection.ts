// src/services/fortProtection.ts
//
// Single source of truth for what a fort protects and how much.
//
// Previously this logic was reimplemented inline in the storm handler, the
// hurricane handler, the pirate handler and endRound — with subtly different rules
// in each. Hurricanes ignored forts entirely, and storms treated protection as
// total immunity.
//
// Current rules:
//   BUILDINGS  — 50% protection. A protected building's chance of being destroyed
//                is halved. Forts make an area resilient, not invulnerable.
//   BOATS      — 100% protection. A boat sitting within the fort's radius is safe
//                from storms, hurricanes and pirates. Parking under a fort is a
//                real tactic, and a partial guarantee would make it useless.
//   REBELS     — 50% protection, applied as roughly halved targeting odds.
//
// Radius is BALANCE.fortRadius (1), i.e. the eight tiles immediately surrounding
// the fort plus the fort's own tile.

import { Island, Position, WaterPosition } from '../types';
import { BALANCE } from '../constants/game';

/** All fort tile positions on an island. */
export function getFortPositions(island: Island): Position[] {
  return island.tiles
    .filter((t) => t.building === 'fort')
    .map((t) => t.position);
}

/** True when a land tile falls inside any fort's radius. */
export function isTileFortProtected(pos: Position, forts: Position[]): boolean {
  return forts.some(
    (fort) =>
      Math.abs(pos.x - fort.x) <= BALANCE.fortRadius &&
      Math.abs(pos.y - fort.y) <= BALANCE.fortRadius
  );
}

/**
 * True when a boat is inside any fort's radius.
 * Boats use continuous water coordinates, so the fort's centre is offset by half a
 * tile and the radius gets a half-tile of slack.
 */
export function isBoatFortProtected(pos: WaterPosition, forts: Position[]): boolean {
  return forts.some((fort) => {
    const dx = pos.x - (fort.x + 0.5);
    const dy = pos.y - (fort.y + 0.5);
    return Math.sqrt(dx * dx + dy * dy) <= BALANCE.fortRadius + 0.5;
  });
}

/**
 * Apply fort protection to a building's destroy chance.
 * Returns the effective probability after protection.
 */
export function effectiveBuildingDestroyChance(
  baseChance: number,
  isProtected: boolean
): number {
  return isProtected ? baseChance * BALANCE.fortBuildingProtection : baseChance;
}

/** Roll a random budget in an inclusive range. Used for per-storm damage caps. */
export function rollBudget(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
