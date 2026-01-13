import { Island, Tile, Position, IslandMetrics, IslandGeneratorConfig } from '../types/game';
import { BALANCE } from '../constants/game';

const DEFAULT_CONFIG: IslandGeneratorConfig = {
  tileCount: BALANCE.tilesPerIsland,
  minCompactness: 0.25, // Lower to allow peninsulas and odd shapes
  maxAttempts: 100,
};

/**
 * Generate a random island with fairness constraints
 */
export function generateIsland(config: Partial<IslandGeneratorConfig> = {}): Island {
  const { tileCount, minCompactness, maxAttempts } = { ...DEFAULT_CONFIG, ...config };
  
  let bestIsland: Tile[] | null = null;
  let bestMetrics: IslandMetrics | null = null;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const tiles = generateIslandShape(tileCount);
    const metrics = calculateMetrics(tiles);
    
    // Accept islands that meet minimum compactness (ensures playability)
    // but don't optimize for maximum compactness (allows interesting shapes)
    if (metrics.compactness >= minCompactness) {
      // Accept first valid island to preserve variety
      return {
        id: `island-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        tiles,
        boats: [],
      };
    }
    
    // Track best attempt as fallback
    if (!bestMetrics || metrics.compactness > bestMetrics.compactness) {
      bestIsland = tiles;
      bestMetrics = metrics;
    }
  }
  
  // Fallback to last attempt if none met criteria
  if (!bestIsland) {
    bestIsland = generateIslandShape(tileCount);
  }
  
  return {
    id: `island-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tiles: bestIsland,
    boats: [],
  };
}

/**
 * Generate a contiguous island shape with organic features
 * Uses weighted random growth that allows peninsulas and irregular shapes
 */
function generateIslandShape(targetTiles: number): Tile[] {
  const landPositions = new Set<string>();
  const posKey = (p: Position) => `${p.x},${p.y}`;
  
  // Start from center
  const start: Position = { x: 4, y: 3 };
  landPositions.add(posKey(start));
  
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 },  // right
  ];
  
  // Track growth direction for creating elongated features
  let preferredDir = directions[Math.floor(Math.random() * 4)];
  let directionStreak = 0;
  
  // Grow island by adding adjacent tiles
  while (landPositions.size < targetTiles) {
    // Get all positions adjacent to current land
    const candidates: { pos: Position; adjacentCount: number; isPreferredDir: boolean }[] = [];
    
    for (const key of landPositions) {
      const [x, y] = key.split(',').map(Number);
      
      for (const dir of directions) {
        const newPos = { x: x + dir.x, y: y + dir.y };
        const newKey = posKey(newPos);
        
        // Valid bounds and not already land
        if (
          newPos.x >= 0 && newPos.x < 8 &&
          newPos.y >= 0 && newPos.y < 8 &&
          !landPositions.has(newKey)
        ) {
          // Count adjacent land tiles
          let adjacentCount = 0;
          for (const d of directions) {
            if (landPositions.has(posKey({ x: newPos.x + d.x, y: newPos.y + d.y }))) {
              adjacentCount++;
            }
          }
          
          const isPreferredDir = dir.x === preferredDir.x && dir.y === preferredDir.y;
          candidates.push({ pos: newPos, adjacentCount, isPreferredDir });
        }
      }
    }
    
    if (candidates.length === 0) break;
    
    // Remove duplicates (same position from different source tiles)
    const uniqueCandidates = new Map<string, typeof candidates[0]>();
    for (const c of candidates) {
      const key = posKey(c.pos);
      if (!uniqueCandidates.has(key) || c.adjacentCount < uniqueCandidates.get(key)!.adjacentCount) {
        uniqueCandidates.set(key, c);
      }
    }
    
    const candidateList = Array.from(uniqueCandidates.values());
    
    // Weighted selection favoring variety
    // - Low adjacency (1) = peninsula growth, interesting shapes
    // - High adjacency (3-4) = filling gaps, compact areas
    // - Preferred direction = creates elongated features
    
    const weights = candidateList.map(c => {
      let weight = 1;
      
      // Favor peninsulas (adjacency 1) sometimes, but not always
      if (c.adjacentCount === 1) {
        weight = Math.random() < 0.4 ? 3 : 1; // 40% chance to strongly favor
      } else if (c.adjacentCount === 2) {
        weight = 2; // Good balance
      } else if (c.adjacentCount >= 3) {
        weight = Math.random() < 0.3 ? 2 : 0.5; // Usually avoid filling, sometimes do
      }
      
      // Boost preferred direction for streaky growth
      if (c.isPreferredDir && directionStreak < 4) {
        weight *= 1.5;
      }
      
      return weight;
    });
    
    // Weighted random selection
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let chosenIndex = 0;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        chosenIndex = i;
        break;
      }
    }
    
    const chosen = candidateList[chosenIndex];
    landPositions.add(posKey(chosen.pos));
    
    // Update preferred direction occasionally
    if (Math.random() < 0.15 || directionStreak > 5) {
      preferredDir = directions[Math.floor(Math.random() * 4)];
      directionStreak = 0;
    } else {
      directionStreak++;
    }
  }
  
  // Convert to tiles
  const tiles: Tile[] = [];
  let tileIndex = 0;
  
  for (const key of landPositions) {
    const [x, y] = key.split(',').map(Number);
    tiles.push({
      id: `tile-${tileIndex++}`,
      position: { x, y },
      isLand: true,
      building: null,
      isRevealed: true,
      hasRebel: false,
    });
  }
  
  return tiles;
}

/**
 * Calculate fairness metrics for an island
 */
export function calculateMetrics(tiles: Tile[]): IslandMetrics {
  const positions = tiles.map(t => t.position);
  
  // Compactness: ratio of actual perimeter to minimum possible perimeter
  const compactness = calculateCompactness(positions);
  
  // Coastline: count water-adjacent edges
  const coastlineLength = calculateCoastline(positions);
  
  // Fort efficiency: how many tiles can be protected with optimal fort placement
  const fortEfficiency = calculateFortEfficiency(positions);
  
  // Max inland depth: furthest any tile is from the coast
  const maxInlandDepth = calculateMaxInlandDepth(positions);
  
  return {
    compactness,
    coastlineLength,
    fortEfficiency,
    maxInlandDepth,
  };
}

/**
 * Calculate compactness (0-1, higher = more compact)
 * Uses ratio of area to perimeter squared
 */
function calculateCompactness(positions: Position[]): number {
  const area = positions.length;
  const perimeter = calculateCoastline(positions);
  
  // For a circle: compactness = 4π * area / perimeter²
  // For our grid: normalize to 0-1 range
  // Perfect square of 29 tiles would have perimeter ~22
  const idealPerimeter = Math.sqrt(area) * 4;
  
  return Math.min(1, idealPerimeter / perimeter);
}

/**
 * Calculate coastline length (water-adjacent edges)
 */
function calculateCoastline(positions: Position[]): number {
  const posSet = new Set(positions.map(p => `${p.x},${p.y}`));
  const directions = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];
  
  let coastline = 0;
  
  for (const pos of positions) {
    for (const dir of directions) {
      const neighbor = `${pos.x + dir.x},${pos.y + dir.y}`;
      if (!posSet.has(neighbor)) {
        coastline++;
      }
    }
  }
  
  return coastline;
}

/**
 * Calculate max inland depth - the furthest any tile is from the coast
 * Uses BFS from all coastal tiles simultaneously
 */
function calculateMaxInlandDepth(positions: Position[]): number {
  const posSet = new Set(positions.map(p => `${p.x},${p.y}`));
  const directions = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];
  
  // Find coastal tiles (tiles with at least one water neighbor)
  const coastalTiles: Position[] = [];
  for (const pos of positions) {
    for (const dir of directions) {
      const neighbor = `${pos.x + dir.x},${pos.y + dir.y}`;
      if (!posSet.has(neighbor)) {
        coastalTiles.push(pos);
        break;
      }
    }
  }
  
  // BFS from all coastal tiles to find max distance
  const distances = new Map<string, number>();
  const queue: { pos: Position; dist: number }[] = [];
  
  for (const pos of coastalTiles) {
    const key = `${pos.x},${pos.y}`;
    distances.set(key, 0);
    queue.push({ pos, dist: 0 });
  }
  
  let maxDepth = 0;
  
  while (queue.length > 0) {
    const { pos, dist } = queue.shift()!;
    
    for (const dir of directions) {
      const newPos = { x: pos.x + dir.x, y: pos.y + dir.y };
      const key = `${newPos.x},${newPos.y}`;
      
      if (posSet.has(key) && !distances.has(key)) {
        const newDist = dist + 1;
        distances.set(key, newDist);
        maxDepth = Math.max(maxDepth, newDist);
        queue.push({ pos: newPos, dist: newDist });
      }
    }
  }
  
  return maxDepth;
}

/**
 * Calculate fort efficiency - what percentage of tiles can be protected
 * by optimally placed forts
 */
function calculateFortEfficiency(positions: Position[]): number {
  const posSet = new Set(positions.map(p => `${p.x},${p.y}`));
  const radius = BALANCE.fortRadius;
  
  // Greedy: find best fort placement, mark covered tiles, repeat
  const uncovered = new Set(posSet);
  let fortsNeeded = 0;
  
  while (uncovered.size > 0) {
    let bestPos: Position | null = null;
    let bestCoverage = 0;
    
    // Check each land tile as potential fort location
    for (const pos of positions) {
      let coverage = 0;
      
      // Count uncovered tiles within radius
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const key = `${pos.x + dx},${pos.y + dy}`;
          if (uncovered.has(key)) {
            coverage++;
          }
        }
      }
      
      if (coverage > bestCoverage) {
        bestCoverage = coverage;
        bestPos = pos;
      }
    }
    
    if (!bestPos || bestCoverage === 0) break;
    
    // Mark covered tiles
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        uncovered.delete(`${bestPos.x + dx},${bestPos.y + dy}`);
      }
    }
    
    fortsNeeded++;
  }
  
  // Efficiency: fewer forts needed = more efficient shape
  // Normalize: 29 tiles / 9 coverage per fort = ~3.2 forts minimum
  const minForts = Math.ceil(positions.length / 9);
  return minForts / fortsNeeded;
}

/**
 * Generate a pair of fair islands for a game
 * Ensures both islands have similar metrics
 */
export function generateFairIslandPair(): [Island, Island] {
  const maxDiff = 0.15; // Maximum allowed difference in metrics
  const maxAttempts = 50;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const island1 = generateIsland();
    const island2 = generateIsland();
    
    const metrics1 = calculateMetrics(island1.tiles);
    const metrics2 = calculateMetrics(island2.tiles);
    
    const compactnessDiff = Math.abs(metrics1.compactness - metrics2.compactness);
    const coastlineDiff = Math.abs(metrics1.coastlineLength - metrics2.coastlineLength) / 
      Math.max(metrics1.coastlineLength, metrics2.coastlineLength);
    const fortDiff = Math.abs(metrics1.fortEfficiency - metrics2.fortEfficiency);
    
    if (compactnessDiff < maxDiff && coastlineDiff < maxDiff && fortDiff < maxDiff) {
      return [island1, island2];
    }
  }
  
  // Fallback: just return two islands
  return [generateIsland(), generateIsland()];
}
