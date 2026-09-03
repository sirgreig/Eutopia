// src/types/index.ts
// Type definitions for Eutopía

// ============================================
// CORE TYPES (Original tile-based system)
// ============================================

export interface Position {
  x: number;
  y: number;
}

export type BuildingType = 
  | 'house' 
  | 'farm' 
  | 'factory' 
  | 'hospital' 
  | 'school' 
  | 'fort'
  | 'apartment'
  | 'dock'
  | 'lighthouse'
  | 'granary'
  | 'marketplace'
  | 'watchtower';

export type BoatType = 'fishing' | 'pt';

export type GameMode = 'original' | 'enhanced';

export interface Tile {
  id: string;
  position: Position;
  building?: BuildingType;
  hasRebel?: boolean;
}

export interface Boat {
  id: string;
  position: Position;
  type: BoatType;
}

export interface Island {
  id: string;
  tiles: Tile[];
  boats: Boat[];
}

// ============================================
// FREE-ROAM WATER SYSTEM TYPES
// ============================================

/**
 * Continuous position on the water surface (float coordinates)
 * Coordinates are in "world units" where 1 unit = 1 tile size
 * This allows boats to be at position (5.3, 7.8) instead of just (5, 7)
 */
export interface WaterPosition {
  x: number;  // float - horizontal position in world units
  y: number;  // float - vertical position in world units
}

/**
 * Velocity vector for boat movement
 * Units are world units per second
 */
export interface Velocity {
  vx: number;  // horizontal velocity (world units/second)
  vy: number;  // vertical velocity (world units/second)
}

/**
 * Boat state for free-roam water system
 */
export interface FreeRoamBoat {
  id: string;
  type: BoatType;
  
  // Current state
  position: WaterPosition;      // Current position (continuous)
  heading: number;              // Direction boat is facing (radians, 0 = right, PI/2 = down)
  velocity: Velocity;           // Current velocity
  
  // Navigation with waypoints (for pathfinding around land)
  destination: WaterPosition | null;  // Final destination
  waypoints: WaterPosition[];         // Intermediate points to navigate through
  currentWaypointIndex: number;       // Which waypoint we're heading to
  isMoving: boolean;                  // Whether boat is currently in motion
  
  // Spawn info
  spawnTile: Position;          // The dock/coastal tile this boat spawned from
}

// ============================================
// FISH SCHOOL TYPES
// ============================================

/**
 * A school of fish that drifts through water.
 * Fishing boats earn gold while overlapping.
 */
export interface FishSchool {
  id: string;
  position: WaterPosition;     // Current position (continuous, world units)
  velocity: Velocity;          // Drift direction and speed
  size: number;                // Radius in world units (for overlap detection)
}

/**
 * A pirate ship that targets fish schools and sinks fishing boats.
 * PT boats destroy pirates on contact.
 */
export interface PirateShip {
  id: string;
  position: WaterPosition;     // Current position (continuous, world units)
  velocity: Velocity;          // Current movement direction
  speed: number;               // Movement speed (world units/sec)
  targetFishId: string | null; // ID of fish school being pursued

  /**
   * Persistent wander destination, used when no fish school is safe to approach.
   * Without this the pirate picks a NEW random point every tick and jitters in
   * place instead of travelling — which is how they end up pinned against a coast.
   */
  wanderTarget?: WaterPosition | null;
  /**
   * Consecutive ticks during which the pirate failed to move. Used to detect and
   * break out of a stuck state against land.
   */
  stuckTicks?: number;
}

/**
 * A line segment representing part of the coastline boundary
 */
export interface CoastlineSegment {
  start: WaterPosition;
  end: WaterPosition;
  // The land tile this segment borders
  landTile: Position;
  // Direction the segment faces (into water)
  normal: { x: number; y: number };
}

/**
 * Complete coastline data for an island
 */
export interface Coastline {
  segments: CoastlineSegment[];
  // Bounding box of all water area
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

/**
 * Configuration for boat movement physics
 */
export interface BoatPhysics {
  maxSpeed: number;           // Maximum speed (world units/second)
  acceleration: number;       // Acceleration rate (world units/second²)
  deceleration: number;       // Deceleration rate when stopping
  turnRate: number;           // How fast the boat can turn (radians/second)
  arrivalThreshold: number;   // How close to destination to consider "arrived"
}

/**
 * Default physics settings per boat type
 */
export const DEFAULT_BOAT_PHYSICS: Record<BoatType, BoatPhysics> = {
  fishing: {
    maxSpeed: 2.0,          // Slower, steady
    acceleration: 1.0,
    deceleration: 1.5,
    turnRate: Math.PI,      // 180° per second
    arrivalThreshold: 0.1,
  },
  pt: {
    maxSpeed: 3.5,          // Faster, more agile
    acceleration: 2.0,
    deceleration: 2.5,
    turnRate: Math.PI * 1.5, // 270° per second
    arrivalThreshold: 0.1,
  },
};

// ============================================
// GAME STATE TYPES
// ============================================

export interface GameConfig {
  mode: GameMode;
  difficulty: 'easy' | 'normal' | 'hard';
  roundCount: number;
  roundDuration: number;
}

export interface ScoreBreakdown {
  housing: number;
  food: number;
  welfare: number;
  gdp: number;
}

export interface PlayerState {
  island: Island;
  gold: number;
  population: number;
  score: number;
  scoreBreakdown: ScoreBreakdown;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Convert tile position to water position (center of tile)
 */
export function tileToWaterPosition(tile: Position): WaterPosition {
  return {
    x: tile.x + 0.5,
    y: tile.y + 0.5,
  };
}

/**
 * Convert water position to nearest tile position
 */
export function waterToTilePosition(water: WaterPosition): Position {
  return {
    x: Math.floor(water.x),
    y: Math.floor(water.y),
  };
}

/**
 * Calculate distance between two water positions
 */
export function waterDistance(a: WaterPosition, b: WaterPosition): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle from position a to position b (in radians)
 */
export function waterAngle(from: WaterPosition, to: WaterPosition): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

/**
 * Normalize an angle to [-PI, PI]
 */
export function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}
