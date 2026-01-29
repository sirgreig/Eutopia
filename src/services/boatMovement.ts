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
 * Update boat position based on physics and waypoints
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
  
  // If not moving or no waypoints, apply deceleration
  if (!boat.isMoving || boat.waypoints.length === 0) {
    return applyDeceleration(boat, deltaTime, physics);
  }
  
  // Get current waypoint
  const currentWaypoint = boat.waypoints[boat.currentWaypointIndex];
  if (!currentWaypoint) {
    return stopBoat(boat);
  }
  
  // Calculate distance and angle to current waypoint
  const distToWaypoint = waterDistance(boat.position, currentWaypoint);
  const angleToWaypoint = waterAngle(boat.position, currentWaypoint);
  
  // Check if we've reached current waypoint
  if (distToWaypoint < physics.arrivalThreshold) {
    // Move to next waypoint
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
      };
    }
    
    // Continue to next waypoint
    return {
      ...boat,
      currentWaypointIndex: nextIndex,
    };
  }
  
  // Update heading toward waypoint
  let newHeading = steerToward(boat.heading, angleToWaypoint, physics.turnRate, deltaTime);
  
  // Calculate speed
  const currentSpeed = Math.sqrt(boat.velocity.vx ** 2 + boat.velocity.vy ** 2);
  
  // Slow down when approaching waypoint (especially final one)
  const isFinalWaypoint = boat.currentWaypointIndex === boat.waypoints.length - 1;
  const slowdownDistance = isFinalWaypoint ? physics.maxSpeed * 0.5 : physics.maxSpeed * 0.2;
  const targetSpeed = distToWaypoint < slowdownDistance
    ? physics.maxSpeed * (distToWaypoint / slowdownDistance)
    : physics.maxSpeed;
  
  // Accelerate or decelerate toward target speed
  let newSpeed: number;
  if (currentSpeed < targetSpeed) {
    newSpeed = Math.min(currentSpeed + physics.acceleration * deltaTime, targetSpeed);
  } else {
    newSpeed = Math.max(currentSpeed - physics.deceleration * deltaTime, targetSpeed);
  }
  
  // Ensure minimum speed when moving
  newSpeed = Math.max(newSpeed, physics.maxSpeed * 0.3);
  
  // Calculate new velocity from heading and speed
  const newVelocity: Velocity = {
    vx: Math.cos(newHeading) * newSpeed,
    vy: Math.sin(newHeading) * newSpeed,
  };
  
  // Calculate new position
  let newPosition: WaterPosition = {
    x: boat.position.x + newVelocity.vx * deltaTime,
    y: boat.position.y + newVelocity.vy * deltaTime,
  };
  
  // Verify new position is valid water (shouldn't hit land if pathfinding is correct)
  if (!isPointInWater(newPosition, island)) {
    // This shouldn't happen with proper pathfinding, but handle it
    console.warn('Boat tried to enter land - stopping');
    return stopBoat(boat);
  }
  
  return {
    ...boat,
    position: newPosition,
    heading: newHeading,
    velocity: newVelocity,
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
