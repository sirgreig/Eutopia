// src/services/coastlineDetection.ts
// Detects coastline boundaries from land tiles for free-roam water system

import { 
  Position, 
  WaterPosition, 
  CoastlineSegment, 
  Coastline, 
  Island 
} from '../types';
import { GRID_WIDTH, GRID_HEIGHT } from '../constants/game';

/**
 * Generate coastline boundary data from island tiles
 * Creates line segments that boats cannot cross
 */
export function generateCoastline(island: Island): Coastline {
  const segments: CoastlineSegment[] = [];
  
  // Create a set of land positions for quick lookup
  const landSet = new Set<string>();
  island.tiles.forEach(tile => {
    landSet.add(`${tile.position.x},${tile.position.y}`);
  });
  
  const isLand = (x: number, y: number): boolean => {
    return landSet.has(`${x},${y}`);
  };
  
  const isWater = (x: number, y: number): boolean => {
    // Out of bounds is treated as water (boats can go to edge)
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
      return true;
    }
    return !isLand(x, y);
  };
  
  // For each land tile, check all 4 edges
  // If the adjacent cell is water, create a coastline segment
  island.tiles.forEach(tile => {
    const { x, y } = tile.position;
    
    // Top edge (y boundary between tile and tile above)
    if (isWater(x, y - 1)) {
      segments.push({
        start: { x: x, y: y },
        end: { x: x + 1, y: y },
        landTile: tile.position,
        normal: { x: 0, y: -1 }, // Points up (into water)
      });
    }
    
    // Bottom edge
    if (isWater(x, y + 1)) {
      segments.push({
        start: { x: x, y: y + 1 },
        end: { x: x + 1, y: y + 1 },
        landTile: tile.position,
        normal: { x: 0, y: 1 }, // Points down (into water)
      });
    }
    
    // Left edge
    if (isWater(x - 1, y)) {
      segments.push({
        start: { x: x, y: y },
        end: { x: x, y: y + 1 },
        landTile: tile.position,
        normal: { x: -1, y: 0 }, // Points left (into water)
      });
    }
    
    // Right edge
    if (isWater(x + 1, y)) {
      segments.push({
        start: { x: x + 1, y: y },
        end: { x: x + 1, y: y + 1 },
        landTile: tile.position,
        normal: { x: 1, y: 0 }, // Points right (into water)
      });
    }
  });
  
  return {
    segments,
    bounds: {
      minX: 0,
      maxX: GRID_WIDTH,
      minY: 0,
      maxY: GRID_HEIGHT,
    },
  };
}

/**
 * Check if a point is in valid water (not on land)
 */
export function isPointInWater(
  point: WaterPosition,
  island: Island
): boolean {
  // Check grid bounds
  if (point.x < 0 || point.x >= GRID_WIDTH || 
      point.y < 0 || point.y >= GRID_HEIGHT) {
    return false;
  }
  
  // Get the tile this point is in
  const tileX = Math.floor(point.x);
  const tileY = Math.floor(point.y);
  
  // Check if this tile is land
  const isLand = island.tiles.some(
    t => t.position.x === tileX && t.position.y === tileY
  );
  
  return !isLand;
}

/**
 * Check if a line segment from A to B intersects any coastline segment
 * Returns the intersection point closest to A, or null if no intersection
 */
export function checkCoastlineIntersection(
  from: WaterPosition,
  to: WaterPosition,
  coastline: Coastline
): WaterPosition | null {
  let closestIntersection: WaterPosition | null = null;
  let closestDistance = Infinity;
  
  for (const segment of coastline.segments) {
    const intersection = lineSegmentIntersection(
      from, to,
      segment.start, segment.end
    );
    
    if (intersection) {
      const dist = distance(from, intersection);
      if (dist < closestDistance) {
        closestDistance = dist;
        closestIntersection = intersection;
      }
    }
  }
  
  return closestIntersection;
}

/**
 * Find intersection point of two line segments, or null if they don't intersect
 * Uses parametric line intersection
 */
function lineSegmentIntersection(
  p1: WaterPosition,
  p2: WaterPosition,
  p3: WaterPosition,
  p4: WaterPosition
): WaterPosition | null {
  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y;
  const x4 = p4.x, y4 = p4.y;
  
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  
  // Lines are parallel
  if (Math.abs(denom) < 0.0001) {
    return null;
  }
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  
  // Check if intersection is within both line segments
  // Use small epsilon to handle edge cases
  const epsilon = 0.0001;
  if (t >= epsilon && t <= 1 - epsilon && u >= epsilon && u <= 1 - epsilon) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1),
    };
  }
  
  return null;
}

/**
 * Calculate distance between two points
 */
function distance(a: WaterPosition, b: WaterPosition): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Clamp a boat position to stay within water bounds
 * If the boat would enter land, return the closest valid water position
 */
export function clampToWater(
  position: WaterPosition,
  coastline: Coastline,
  island: Island,
  boatRadius: number = 0.3  // How far from coastline to keep boats
): WaterPosition {
  // First, clamp to grid bounds
  let x = Math.max(boatRadius, Math.min(GRID_WIDTH - boatRadius, position.x));
  let y = Math.max(boatRadius, Math.min(GRID_HEIGHT - boatRadius, position.y));
  
  // Check if we're in water
  if (isPointInWater({ x, y }, island)) {
    return { x, y };
  }
  
  // We're on land - find nearest water
  // Simple approach: push away from the land tile center
  const tileX = Math.floor(position.x);
  const tileY = Math.floor(position.y);
  const tileCenterX = tileX + 0.5;
  const tileCenterY = tileY + 0.5;
  
  // Direction from tile center to our position
  const dx = position.x - tileCenterX;
  const dy = position.y - tileCenterY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist < 0.001) {
    // We're exactly at center, push in any direction
    return { x: tileX - boatRadius, y: tileY + 0.5 };
  }
  
  // Normalize and push out to edge of tile + radius
  const nx = dx / dist;
  const ny = dy / dist;
  
  // Push to just outside the tile boundary
  x = tileCenterX + nx * (0.5 + boatRadius);
  y = tileCenterY + ny * (0.5 + boatRadius);
  
  // Verify this is water, if not, search nearby
  if (!isPointInWater({ x, y }, island)) {
    // Try all 4 cardinal directions
    const directions = [
      { x: -1, y: 0 }, { x: 1, y: 0 },
      { x: 0, y: -1 }, { x: 0, y: 1 },
    ];
    
    for (const dir of directions) {
      const testX = tileX + 0.5 + dir.x * (0.5 + boatRadius);
      const testY = tileY + 0.5 + dir.y * (0.5 + boatRadius);
      if (isPointInWater({ x: testX, y: testY }, island)) {
        return { x: testX, y: testY };
      }
    }
  }
  
  return { x, y };
}

/**
 * Get valid spawn position for a boat near a dock or coastal tile
 */
export function getBoatSpawnPosition(
  coastalTile: Position,
  island: Island,
  boatRadius: number = 0.3
): WaterPosition | null {
  // Check all 4 adjacent positions
  const directions = [
    { x: 0, y: -1 },  // up
    { x: 0, y: 1 },   // down
    { x: -1, y: 0 },  // left
    { x: 1, y: 0 },   // right
  ];
  
  for (const dir of directions) {
    const waterX = coastalTile.x + 0.5 + dir.x;
    const waterY = coastalTile.y + 0.5 + dir.y;
    
    if (isPointInWater({ x: waterX, y: waterY }, island)) {
      return { x: waterX, y: waterY };
    }
  }
  
  return null;
}

export default {
  generateCoastline,
  isPointInWater,
  checkCoastlineIntersection,
  clampToWater,
  getBoatSpawnPosition,
};
