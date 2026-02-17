// src/services/boatMovement.ts
// Free-roam boat movement system with waypoint-based pathfinding

import {
  WaterPosition,
  Velocity,
  FreeRoamBoat,
  BoatType,
  BoatPhysics,
  DEFAULT_BOAT_PHYSICS,
  Coastline,
  Island,
  Position,
  waterDistance,
  waterAngle,
  normalizeAngle,
  tileToWaterPosition,
} from '../types';
import {
  isPointInWater,
  getBoatSpawnPosition,
} from './coastlineDetection';
import { findPath } from './boatPathfinding';
import { GRID_WIDTH as GRID_WIDTH_IMPORT, GRID_HEIGHT as GRID_HEIGHT_IMPORT } from '../constants/game';

/**
 * Create a new free-roam boat at a spawn position
 */
export function createFreeRoamBoat(
  id: string,
  type: BoatType,
  spawnTile: Position,
  island: Island
): FreeRoamBoat | null {
  const spawnPos = getBoatSpawnPosition(spawnTile, island);
  
  if (!spawnPos) {
    console.warn(`Could not find valid water spawn position near tile (${spawnTile.x}, ${spawnTile.y})`);
    return null;
  }
  
  return {
    id,
    type,
    position: spawnPos,
    heading: 0, // Facing right initially
    velocity: { vx: 0, vy: 0 },
    destination: null,
    waypoints: [],
    currentWaypointIndex: 0,
    isMoving: false,
    spawnTile,
  };
}

/**
 * Set a new destination for a boat with pathfinding
 */
export function setBoatDestination(
  boat: FreeRoamBoat,
  destination: WaterPosition,
  island: Island
): FreeRoamBoat {
  // Verify destination is in valid water
  if (!isPointInWater(destination, island)) {
    console.warn('Attempted to set destination on land');
    return boat;
  }
  
  // Convert current position to tile for pathfinding
  const startTile: Position = {
    x: Math.floor(boat.position.x),
    y: Math.floor(boat.position.y),
  };
  
  // Convert destination to tile
  const endTile: Position = {
    x: Math.floor(destination.x),
    y: Math.floor(destination.y),
  };
  
  // If start and end are the same tile, just move directly
  if (startTile.x === endTile.x && startTile.y === endTile.y) {
    return {
      ...boat,
      destination,
      waypoints: [destination],
      currentWaypointIndex: 0,
      isMoving: true,
    };
  }
  
  // Use BFS to find path through water tiles
  const tilePath = findPath(startTile, endTile, island, boat.id);
  
  if (!tilePath || tilePath.length === 0) {
    console.warn('No path found to destination');
    return boat;
  }
  
  // Convert tile path to waypoints (center of each tile)
  const waypoints: WaterPosition[] = tilePath.map(tile => ({
    x: tile.x + 0.5,
    y: tile.y + 0.5,
  }));
  
  // Add final destination as last waypoint (exact position, not tile center)
  waypoints[waypoints.length - 1] = destination;
  
  return {
    ...boat,
    destination,
    waypoints,
    currentWaypointIndex: 0,
    isMoving: true,
  };
}

/**
 * Stop a boat's movement
 */
export function stopBoat(boat: FreeRoamBoat): FreeRoamBoat {
  return {
    ...boat,
    destination: null,
    waypoints: [],
    currentWaypointIndex: 0,
    isMoving: false,
    velocity: { vx: 0, vy: 0 },
  };
}

/**
 * Update boat position — direct movement toward waypoints
 * Call this every frame with deltaTime in seconds
 */
export function updateBoat(
  boat: FreeRoamBoat,
  deltaTime: number,
  coastline: Coastline,
  island: Island,
  otherBoats: FreeRoamBoat[] = []
): FreeRoamBoat {
  const physics = DEFAULT_BOAT_PHYSICS[boat.type];
  
  // If not moving or no waypoints, just return as-is
  if (!boat.isMoving || boat.waypoints.length === 0) {
    return boat;
  }
  
  // Get current waypoint
  const currentWaypoint = boat.waypoints[boat.currentWaypointIndex];
  if (!currentWaypoint) {
    return stopBoat(boat);
  }
  
  // Calculate distance to current waypoint
  const distToWaypoint = waterDistance(boat.position, currentWaypoint);
  
  // Check if we've reached current waypoint
  if (distToWaypoint < physics.arrivalThreshold) {
    const nextIndex = boat.currentWaypointIndex + 1;
    
    if (nextIndex >= boat.waypoints.length) {
      // Reached final destination
      return {
        ...boat,
        position: currentWaypoint,
        destination: null,
        waypoints: [],
        currentWaypointIndex: 0,
        isMoving: false,
        velocity: { vx: 0, vy: 0 },
        heading: boat.heading,
      };
    }
    
    // Snap to waypoint and advance
    return {
      ...boat,
      position: currentWaypoint,
      currentWaypointIndex: nextIndex,
    };
  }
  
  // Move directly toward waypoint
  const isFinalWaypoint = boat.currentWaypointIndex === boat.waypoints.length - 1;
  const slowdownDistance = isFinalWaypoint ? 0.3 : 0.1;
  
  let speed = physics.maxSpeed;
  if (distToWaypoint < slowdownDistance) {
    speed = Math.max(physics.maxSpeed * 0.3, physics.maxSpeed * (distToWaypoint / slowdownDistance));
  }
  
  // Direction vector toward waypoint
  const dx = currentWaypoint.x - boat.position.x;
  const dy = currentWaypoint.y - boat.position.y;
  const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
  const dirX = dx / dist;
  const dirY = dy / dist;
  
  // Calculate movement this frame (don't overshoot)
  const moveDistance = Math.min(speed * deltaTime, distToWaypoint);
  
  const newPosition: WaterPosition = {
    x: boat.position.x + dirX * moveDistance,
    y: boat.position.y + dirY * moveDistance,
  };
  
  // Update heading to face direction of movement (for visual rotation)
  const newHeading = Math.atan2(dirY, dirX);
  
  // Boundary safety — clamp to valid water area instead of stopping
  const clampedPosition: WaterPosition = {
    x: Math.max(0.05, Math.min(GRID_WIDTH_IMPORT - 0.05, newPosition.x)),
    y: Math.max(0.05, Math.min(GRID_HEIGHT_IMPORT - 0.05, newPosition.y)),
  };
  
  // If new position is on land, skip to next waypoint or stop
  if (!isPointInWater(clampedPosition, island)) {
    const nextIndex = boat.currentWaypointIndex + 1;
    if (nextIndex < boat.waypoints.length) {
      // Skip this waypoint and try the next one
      return {
        ...boat,
        currentWaypointIndex: nextIndex,
      };
    }
    // No more waypoints — stop at current position (don't move into land)
    return stopBoat(boat);
  }
  
  return {
    ...boat,
    position: clampedPosition,
    heading: newHeading,
    velocity: { vx: dirX * speed, vy: dirY * speed },
  };
}

/**
 * Smoothly steer toward a target angle
 */
function steerToward(
  currentHeading: number,
  targetHeading: number,
  turnRate: number,
  deltaTime: number
): number {
  // Normalize both angles
  const current = normalizeAngle(currentHeading);
  const target = normalizeAngle(targetHeading);
  
  // Find shortest rotation direction
  let diff = normalizeAngle(target - current);
  
  // Calculate maximum turn this frame
  const maxTurn = turnRate * deltaTime;
  
  // Clamp the turn
  if (Math.abs(diff) < maxTurn) {
    return target;
  }
  
  if (diff > 0) {
    return current + maxTurn;
  } else {
    return current - maxTurn;
  }
}

/**
 * Apply deceleration to a boat that's moving but has no destination
 */
function applyDeceleration(
  boat: FreeRoamBoat,
  deltaTime: number,
  physics: BoatPhysics
): FreeRoamBoat {
  const speed = Math.sqrt(boat.velocity.vx ** 2 + boat.velocity.vy ** 2);
  
  if (speed < 0.01) {
    // Fully stopped
    return {
      ...boat,
      velocity: { vx: 0, vy: 0 },
      isMoving: false,
    };
  }
  
  // Apply deceleration
  const newSpeed = Math.max(0, speed - physics.deceleration * deltaTime);
  const ratio = newSpeed / speed;
  
  return {
    ...boat,
    velocity: {
      vx: boat.velocity.vx * ratio,
      vy: boat.velocity.vy * ratio,
    },
  };
}

/**
 * Convert pixel coordinates (from tap) to water position
 */
export function screenToWaterPosition(
  screenX: number,
  screenY: number,
  tileSize: number,
  mapOffsetX: number = 0,
  mapOffsetY: number = 0
): WaterPosition {
  return {
    x: (screenX - mapOffsetX) / tileSize,
    y: (screenY - mapOffsetY) / tileSize,
  };
}

/**
 * Convert water position to screen coordinates for rendering
 */
export function waterToScreenPosition(
  position: WaterPosition,
  tileSize: number,
  mapOffsetX: number = 0,
  mapOffsetY: number = 0
): { x: number; y: number } {
  return {
    x: position.x * tileSize + mapOffsetX,
    y: position.y * tileSize + mapOffsetY,
  };
}

/**
 * Check if a screen tap is on water (for setting boat destinations)
 */
export function isScreenPositionOnWater(
  screenX: number,
  screenY: number,
  tileSize: number,
  island: Island,
  mapOffsetX: number = 0,
  mapOffsetY: number = 0
): boolean {
  const waterPos = screenToWaterPosition(screenX, screenY, tileSize, mapOffsetX, mapOffsetY);
  return isPointInWater(waterPos, island);
}

export default {
  createFreeRoamBoat,
  setBoatDestination,
  stopBoat,
  updateBoat,
  screenToWaterPosition,
  waterToScreenPosition,
  isScreenPositionOnWater,
};
