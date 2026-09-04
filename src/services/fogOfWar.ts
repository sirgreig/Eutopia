// src/services/fogOfWar.ts
//
// Fog of war over the opponent's island — Enhanced Mode only.
//
// DESIGN NOTE: this is deliberately an abstraction, not a simulation.
//
// Each player's boats sail in their OWN water; there is no shared map (the same
// constraint that ruled out PvP boat combat). So a PT boat cannot literally sail
// over to scout the enemy coast. Instead PT boats are treated as patrolling and
// reporting back: each one you own reveals a few tiles of the opponent's island per
// round. Watchtowers and lighthouses add to that.
//
// The practical effect is that PT boats become dual-purpose in Enhanced Mode —
// pirate defence AND reconnaissance — which gives a reason to build them beyond
// escorting a fishing fleet.
//
// Revealed tiles are LOCAL to each player and never synced. Your knowledge of their
// island is yours; it has no business travelling over the wire.

import { Island } from '../types';
import { BALANCE } from '../constants/game';

/** Stable key for a tile position. */
export function tileKey(x: number, y: number): string {
  return `${x},${y}`;
}

/**
 * How many new tiles are revealed at the end of a round.
 *
 * PT boats do the scouting; lighthouses extend their range; watchtowers are fixed
 * installations that report a larger area.
 */
export function computeRevealCount(
  ptBoatCount: number,
  lighthouses: number,
  watchtowers: number
): number {
  const fromBoats = ptBoatCount * BALANCE.ptScoutRadius;
  const fromLighthouses = ptBoatCount > 0 ? lighthouses * BALANCE.lighthouseScoutBonus : 0;
  const fromTowers = watchtowers * (BALANCE.watchtowerRevealRadius * 4);
  return fromBoats + fromLighthouses + fromTowers;
}

/**
 * Reveal up to `count` additional tiles of the opponent's island.
 *
 * Returns a NEW set. Tiles already revealed stay revealed — knowledge is never
 * lost, even if the boats that earned it are sunk.
 *
 * Reveals are random rather than spatial. With no shared coordinate space there is
 * no meaningful "direction" to scout from, and random reveal keeps the tension of
 * an incomplete picture without pretending to a geography that doesn't exist.
 */
export function revealTiles(
  opponentIsland: Island | null,
  alreadyRevealed: Set<string>,
  count: number
): Set<string> {
  if (!opponentIsland || count <= 0) return alreadyRevealed;

  const hidden = opponentIsland.tiles
    .map((t) => tileKey(t.position.x, t.position.y))
    .filter((k) => !alreadyRevealed.has(k));

  if (hidden.length === 0) return alreadyRevealed;

  // Fisher-Yates partial shuffle — only as far as we need
  const toReveal = Math.min(count, hidden.length);
  for (let i = 0; i < toReveal; i++) {
    const j = i + Math.floor(Math.random() * (hidden.length - i));
    [hidden[i], hidden[j]] = [hidden[j], hidden[i]];
  }

  const next = new Set(alreadyRevealed);
  for (let i = 0; i < toReveal; i++) next.add(hidden[i]);
  return next;
}

/** True when a tile should be drawn as fog rather than as terrain. */
export function isTileHidden(
  fogEnabled: boolean,
  revealed: Set<string>,
  x: number,
  y: number
): boolean {
  if (!fogEnabled) return false;
  return !revealed.has(tileKey(x, y));
}
