// src/services/boatPathfinding.ts
// BFS pathfinding for boats through water tiles

import { Position, Island, Boat } from '../types';
import { GRID_WIDTH, GRID_HEIGHT } from '../constants/game';

interface PathNode {
  position: Position;
  parent: PathNode | null;
}

/**
 * Find path from start to end position using BFS
 * Avoids land tiles and other boats
 */
export function findPath(
  start: Position,
  end: Position,
  island: Island,
  currentBoatId: string
): Position[] | null {
  // Create set of blocked positions (land tiles)
  const landTiles = new Set<string>();
  island.tiles.forEach(tile => {
    landTiles.add(`${tile.position.x},${tile.position.y}`);
  });
  
  // Create set of boat positions (excluding current boat)
  const boatPositions = new Set<string>();
  island.boats.forEach(boat => {
    if (boat.id !== currentBoatId) {
      boatPositions.add(`${boat.position.x},${boat.position.y}`);
    }
  });
  
  // Check if end position is valid
  const endKey = `${end.x},${end.y}`;
  if (landTiles.has(endKey) || boatPositions.has(endKey)) {
    return null;
  }
  
  // BFS
  const visited = new Set<string>();
  const queue: PathNode[] = [{ position: start, parent: null }];
  visited.add(`${start.x},${start.y}`);
  
  const directions = [
    { x: 0, y: -1 },  // up
    { x: 0, y: 1 },   // down
    { x: -1, y: 0 },  // left
    { x: 1, y: 0 },   // right
  ];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Found destination
    if (current.position.x === end.x && current.position.y === end.y) {
      // Reconstruct path
      const path: Position[] = [];
      let node: PathNode | null = current;
      while (node !== null) {
        path.unshift(node.position);
        node = node.parent;
      }
      // Remove starting position (boat is already there)
      path.shift();
      return path;
    }
    
    // Explore neighbors
    for (const dir of directions) {
      const nextX = current.position.x + dir.x;
      const nextY = current.position.y + dir.y;
      const key = `${nextX},${nextY}`;
      
      // Check bounds
      if (nextX < 0 || nextX >= GRID_WIDTH || nextY < 0 || nextY >= GRID_HEIGHT) {
        continue;
      }
      
      // Check if already visited
      if (visited.has(key)) {
        continue;
      }
      
      // Check if blocked by land
      if (landTiles.has(key)) {
        continue;
      }
      
      // Check if blocked by another boat (except destination)
      if (boatPositions.has(key) && key !== endKey) {
        continue;
      }
      
      visited.add(key);
      queue.push({
        position: { x: nextX, y: nextY },
        parent: current,
      });
    }
  }
  
  // No path found
  return null;
}

/**
 * Check if a position is valid water (not land, in bounds)
 */
export function isValidWaterPosition(
  position: Position,
  island: Island
): boolean {
  // Check bounds
  if (position.x < 0 || position.x >= GRID_WIDTH || 
      position.y < 0 || position.y >= GRID_HEIGHT) {
    return false;
  }
  
  // Check if it's a land tile
  const isLand = island.tiles.some(
    t => t.position.x === position.x && t.position.y === position.y
  );
  
  return !isLand;
}

/**
 * Get adjacent water positions for a land tile
 */
export function getAdjacentWaterPositions(
  position: Position,
  island: Island
): Position[] {
  const directions = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];
  
  const waterPositions: Position[] = [];
  
  for (const dir of directions) {
    const pos = { x: position.x + dir.x, y: position.y + dir.y };
    if (isValidWaterPosition(pos, island)) {
      waterPositions.push(pos);
    }
  }
  
  return waterPositions;
}

export default {
  findPath,
  isValidWaterPosition,
  getAdjacentWaterPositions,
};
