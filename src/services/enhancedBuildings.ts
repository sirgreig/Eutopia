// src/services/enhancedBuildings.ts
//
// Effects for the Enhanced Mode buildings (Phase 9).
//
// These six buildings existed in the build menu and in BUILDINGS for a long time
// with no gameplay effect at all — a player could spend 60 gold on an Apartment and
// receive nothing. Enhanced Mode was hidden in the setup screen until this landed.
//
// Everything here is deterministic and local. None of it needs to sync in
// multiplayer: each client computes its own island's effects from its own tiles.

import { Island, WaterPosition, BuildingType } from '../types';
import { BALANCE } from '../constants/game';

/** Centre point of a land tile in water (continuous) coordinates. */
function tileCentre(x: number, y: number): WaterPosition {
  return { x: x + 0.5, y: y + 0.5 };
}

/** Positions of every tile holding a given building. */
export function buildingPositions(island: Island, type: BuildingType): WaterPosition[] {
  return island.tiles
    .filter((t) => t.building === type)
    .map((t) => tileCentre(t.position.x, t.position.y));
}

/** True when a point is within `radius` of any of the given positions. */
export function isNear(
  pos: WaterPosition,
  targets: WaterPosition[],
  radius: number
): boolean {
  return targets.some((t) => Math.hypot(pos.x - t.x, pos.y - t.y) <= radius);
}

/**
 * Income multiplier for a fishing boat, based on dock proximity.
 * Returns 1 when no dock is in range.
 */
export function dockMultiplierFor(
  boatPos: WaterPosition,
  dockPositions: WaterPosition[]
): number {
  return isNear(boatPos, dockPositions, BALANCE.dockRadius)
    ? BALANCE.dockFishingMultiplier
    : 1;
}

/**
 * Multiplier applied to a boat's storm/hurricane sink chance.
 * Lighthouses shelter boats from WEATHER only — pirates are the fort's job.
 */
export function lighthouseSinkMultiplier(
  boatPos: WaterPosition,
  lighthousePositions: WaterPosition[]
): number {
  return isNear(boatPos, lighthousePositions, BALANCE.lighthouseRadius)
    ? BALANCE.lighthouseStormProtection
    : 1;
}

export interface FoodEconomyResult {
  /** Food score after granary top-up, capped at maxCategoryScore */
  foodScore: number;
  /** Gold earned by marketplaces converting unusable surplus */
  marketplaceGold: number;
  /** New granary bank level to carry into the next round */
  granaryBank: number;
  /** Points drawn out of the bank this round (for the round summary) */
  granaryUsed: number;
}

/**
 * Resolve food surplus and shortfall through granaries and marketplaces.
 *
 * Order matters and is deliberate:
 *   1. Surplus above the score cap fills granaries first (storage beats selling).
 *   2. Whatever a granary cannot hold is offered to marketplaces for gold.
 *   3. Anything still left over is simply lost — the cap is a real ceiling.
 *   4. A shortfall below the cap draws from the bank to top the score back up.
 *
 * A granary alone smooths bad rounds. A marketplace alone turns waste into gold.
 * Together the granary fills first and the marketplace sells the rest, which is
 * why building both is worth more than two of either.
 */
export function resolveFoodEconomy(
  rawFoodScore: number,
  granaries: number,
  marketplaces: number,
  currentBank: number
): FoodEconomyResult {
  const cap = BALANCE.maxCategoryScore;
  const bankCapacity = granaries * BALANCE.granaryCapacityEach;

  let bank = Math.min(currentBank, bankCapacity); // Shrinks if a granary was destroyed
  let marketplaceGold = 0;
  let granaryUsed = 0;
  let foodScore = Math.min(cap, rawFoodScore);

  if (rawFoodScore > cap) {
    let surplus = rawFoodScore - cap;

    // 1. Granaries store what they can
    const canStore = Math.max(0, bankCapacity - bank);
    const stored = Math.min(surplus, canStore);
    bank += stored;
    surplus -= stored;

    // 2. Marketplaces sell the remainder
    if (surplus > 0 && marketplaces > 0) {
      const sellable = Math.min(surplus, marketplaces * BALANCE.marketplacePointsEach);
      marketplaceGold = Math.round(sellable * BALANCE.marketplaceGoldPerPoint);
    }
    // 3. Anything left is lost
  } else if (rawFoodScore < cap && bank > 0) {
    // 4. Draw down the bank to cover a shortfall
    granaryUsed = Math.min(bank, cap - rawFoodScore);
    bank -= granaryUsed;
    foodScore = rawFoodScore + granaryUsed;
  }

  return { foodScore, marketplaceGold, granaryBank: bank, granaryUsed };
}
