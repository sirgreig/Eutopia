// src/services/aiOpponent.ts
// AI opponent with utility-based decision making

import { Island, Tile, Position, BuildingType, BoatType, Boat, GameMode } from '../types';
import { BUILDINGS, BOAT_COSTS, BALANCE, GRID_WIDTH, GRID_HEIGHT, getAvailableBuildings } from '../constants/game';
import { findPath } from './boatPathfinding';

// AI difficulty settings
export interface AIDifficulty {
  name: 'easy' | 'normal' | 'hard';
  decisionDelay: number;      // ms between decisions
  buildChance: number;        // 0-1, chance to build each decision cycle
  optimalChoice: number;      // 0-1, how often AI picks best option vs random
  ptAggressionBase: number;   // base chance to send PT boat to attack
  ptAggressionPerRound: number; // additional aggression per round
  incomeMultiplier: number;   // bonus/penalty to AI income
}

export const AI_DIFFICULTIES: Record<string, AIDifficulty> = {
  easy: {
    name: 'easy',
    decisionDelay: 3000,
    buildChance: 0.6,
    optimalChoice: 0.5,
    ptAggressionBase: 0.1,
    ptAggressionPerRound: 0.02,
    incomeMultiplier: 0.8,
  },
  normal: {
    name: 'normal',
    decisionDelay: 2000,
    buildChance: 0.75,
    optimalChoice: 0.75,
    ptAggressionBase: 0.2,
    ptAggressionPerRound: 0.03,
    incomeMultiplier: 1.0,
  },
  hard: {
    name: 'hard',
    decisionDelay: 1500,
    buildChance: 0.9,
    optimalChoice: 0.95,
    ptAggressionBase: 0.35,
    ptAggressionPerRound: 0.05,
    incomeMultiplier: 1.2,
  },
};

// AI game state
export interface AIState {
  island: Island;
  gold: number;
  population: number;
  score: number;
  scoreBreakdown: { housing: number; food: number; welfare: number; gdp: number };
}

// Utility scores for different building types based on game state
interface BuildingUtility {
  type: BuildingType;
  score: number;
  reason: string;
}

/**
 * Calculate utility score for each building type
 */
export function evaluateBuildingUtilities(
  state: AIState,
  mode: GameMode,
  round: number,
  maxRounds: number
): BuildingUtility[] {
  const { island, gold, population, score, scoreBreakdown } = state;
  const tiles = island.tiles;
  const boats = island.boats;
  
  // Count existing buildings
  const buildingCounts = {
    house: tiles.filter(t => t.building === 'house').length,
    farm: tiles.filter(t => t.building === 'farm').length,
    factory: tiles.filter(t => t.building === 'factory').length,
    hospital: tiles.filter(t => t.building === 'hospital').length,
    school: tiles.filter(t => t.building === 'school').length,
    fort: tiles.filter(t => t.building === 'fort').length,
  };
  
  const fishingBoats = boats.filter(b => b.type === 'fishing').length;
  const emptyTiles = tiles.filter(t => !t.building && !t.hasRebel).length;
  const coastalTiles = tiles.filter(t => !t.building && isCoastalTile(t.position, island)).length;
  
  // Game phase (early, mid, late)
  const gameProgress = round / maxRounds;
  const isEarlyGame = gameProgress < 0.3;
  const isMidGame = gameProgress >= 0.3 && gameProgress < 0.7;
  const isLateGame = gameProgress >= 0.7;
  
  const utilities: BuildingUtility[] = [];
  const availableBuildings = getAvailableBuildings(mode);
  
  for (const building of availableBuildings) {
    if (gold < building.cost) continue;
    
    let utility = 50; // Base utility
    let reason = '';
    
    switch (building.type) {
      case 'farm':
        // High priority early game for food score
        if (scoreBreakdown.food < 15) {
          utility += 40;
          reason = 'need food';
        } else if (scoreBreakdown.food < 25) {
          utility += 20;
          reason = 'more food';
        }
        if (isEarlyGame) utility += 15;
        // Cheap and always useful
        utility += 10;
        break;
        
      case 'house':
        // Important for housing score
        if (scoreBreakdown.housing < 15) {
          utility += 35;
          reason = 'need housing';
        } else if (scoreBreakdown.housing < 25) {
          utility += 15;
          reason = 'more housing';
        }
        // Scale with population
        if (population > buildingCounts.house * 600) {
          utility += 20;
          reason = 'population growing';
        }
        break;
        
      case 'factory':
        // Good for income, especially mid-game
        if (isMidGame || isLateGame) utility += 20;
        if (gold < 50) {
          utility += 25;
          reason = 'need income';
        }
        // Synergy with schools/hospitals
        if (buildingCounts.school > 0 || buildingCounts.hospital > 0) {
          utility += 15;
          reason = 'productivity bonus';
        }
        // Don't over-build factories
        if (buildingCounts.factory >= 3) utility -= 20;
        break;
        
      case 'hospital':
        // Good for welfare and population growth
        if (scoreBreakdown.welfare < 15) {
          utility += 30;
          reason = 'need welfare';
        }
        // Helps with population
        if (population < 1500) {
          utility += 15;
          reason = 'population growth';
        }
        // Expensive, limit quantity
        if (buildingCounts.hospital >= 2) utility -= 25;
        break;
        
      case 'school':
        // Good for welfare and factory synergy
        if (scoreBreakdown.welfare < 20) {
          utility += 25;
          reason = 'need welfare';
        }
        // Synergy with factories
        if (buildingCounts.factory > 0) {
          utility += 15;
          reason = 'factory synergy';
        }
        if (buildingCounts.school >= 2) utility -= 20;
        break;
        
      case 'fort':
        // Defensive, mainly if score is low or has rebels
        const hasRebels = tiles.some(t => t.hasRebel);
        if (hasRebels) {
          utility += 40;
          reason = 'suppress rebels';
        } else if (score < 40) {
          utility += 25;
          reason = 'prevent rebels';
        }
        // Late game protection
        if (isLateGame && buildingCounts.fort === 0) {
          utility += 20;
          reason = 'late game security';
        }
        if (buildingCounts.fort >= 2) utility -= 30;
        break;
        
      default:
        // Enhanced mode buildings - lower priority for now
        utility = 30;
        break;
    }
    
    // Adjust for cost efficiency
    utility -= building.cost / 10;
    
    // Random variation (+/- 10%)
    utility *= 0.9 + Math.random() * 0.2;
    
    utilities.push({
      type: building.type,
      score: Math.max(0, utility),
      reason,
    });
  }
  
  // Sort by utility score
  return utilities.sort((a, b) => b.score - a.score);
}

/**
 * Evaluate whether to build a boat
 */
export function evaluateBoatUtility(
  state: AIState,
  boatType: BoatType,
  round: number,
  difficulty: AIDifficulty
): number {
  const { island, gold, scoreBreakdown } = state;
  const boats = island.boats;
  const cost = BOAT_COSTS[boatType];
  
  if (gold < cost) return 0;
  
  const fishingBoats = boats.filter(b => b.type === 'fishing' && b.owner === 'ai').length;
  const ptBoats = boats.filter(b => b.type === 'pt' && b.owner === 'ai').length;
  
  let utility = 30;
  
  if (boatType === 'fishing') {
    // Fishing boats for income and food
    if (scoreBreakdown.food < 20) utility += 30;
    if (fishingBoats < 2) utility += 25;
    if (fishingBoats >= 4) utility -= 30;
    // More valuable early/mid game
    if (round < 10) utility += 15;
  } else if (boatType === 'pt') {
    // PT boats for aggression
    const aggression = difficulty.ptAggressionBase + (round * difficulty.ptAggressionPerRound);
    utility = aggression * 100;
    if (ptBoats >= 2) utility -= 40;
    // More valuable mid/late game
    if (round > 5) utility += 20;
  }
  
  return Math.max(0, utility);
}

/**
 * Find best tile to place a building
 */
export function findBestBuildingLocation(
  island: Island,
  buildingType: BuildingType
): Position | null {
  const emptyTiles = island.tiles.filter(t => !t.building && !t.hasRebel);
  
  if (emptyTiles.length === 0) return null;
  
  // For forts, prioritize tiles near rebels or center
  if (buildingType === 'fort') {
    const rebelTiles = island.tiles.filter(t => t.hasRebel);
    if (rebelTiles.length > 0) {
      // Find tile closest to a rebel
      let bestTile = emptyTiles[0];
      let bestDist = Infinity;
      for (const tile of emptyTiles) {
        for (const rebel of rebelTiles) {
          const dist = Math.abs(tile.position.x - rebel.position.x) + 
                       Math.abs(tile.position.y - rebel.position.y);
          if (dist < bestDist) {
            bestDist = dist;
            bestTile = tile;
          }
        }
      }
      return bestTile.position;
    }
  }
  
  // For other buildings, pick randomly (could be smarter later)
  const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
  return randomTile.position;
}

/**
 * Find coastal tile for boat spawning
 */
export function findCoastalTileForBoat(island: Island): Position | null {
  const coastalTiles = island.tiles.filter(t => 
    !t.building && isCoastalTile(t.position, island)
  );
  
  if (coastalTiles.length === 0) {
    // Fall back to any empty tile
    const emptyTiles = island.tiles.filter(t => !t.building);
    if (emptyTiles.length === 0) return null;
    return emptyTiles[Math.floor(Math.random() * emptyTiles.length)].position;
  }
  
  return coastalTiles[Math.floor(Math.random() * coastalTiles.length)].position;
}

/**
 * Find adjacent water position for boat spawn
 */
export function findAdjacentWater(position: Position, island: Island): Position | null {
  const tileSet = new Set(island.tiles.map(t => `${t.position.x},${t.position.y}`));
  const directions = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];
  
  for (const dir of directions) {
    const newX = position.x + dir.x;
    const newY = position.y + dir.y;
    if (newX >= 0 && newX < GRID_WIDTH && newY >= 0 && newY < GRID_HEIGHT) {
      if (!tileSet.has(`${newX},${newY}`)) {
        // Check not occupied by another boat
        if (!island.boats.find(b => b.position.x === newX && b.position.y === newY)) {
          return { x: newX, y: newY };
        }
      }
    }
  }
  
  return null;
}

/**
 * Check if a tile is coastal (adjacent to water)
 */
function isCoastalTile(position: Position, island: Island): boolean {
  const tileSet = new Set(island.tiles.map(t => `${t.position.x},${t.position.y}`));
  const directions = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];
  
  for (const dir of directions) {
    const checkX = position.x + dir.x;
    const checkY = position.y + dir.y;
    if (checkX >= 0 && checkX < GRID_WIDTH && checkY >= 0 && checkY < GRID_HEIGHT) {
      if (!tileSet.has(`${checkX},${checkY}`)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * AI decision result
 */
export interface AIDecision {
  action: 'build' | 'boat' | 'move_pt' | 'none';
  buildingType?: BuildingType;
  boatType?: BoatType;
  position?: Position;
  boatId?: string;
  destination?: Position;
  reason?: string;
}

/**
 * Main AI decision function - called periodically during rounds
 */
export function makeAIDecision(
  state: AIState,
  playerIsland: Island,
  mode: GameMode,
  round: number,
  maxRounds: number,
  difficulty: AIDifficulty
): AIDecision {
  const { island, gold } = state;
  
  // Random chance to skip this decision cycle
  if (Math.random() > difficulty.buildChance) {
    return { action: 'none', reason: 'waiting' };
  }
  
  // Evaluate all options
  const buildingUtilities = evaluateBuildingUtilities(state, mode, round, maxRounds);
  const fishingUtility = evaluateBoatUtility(state, 'fishing', round, difficulty);
  const ptUtility = evaluateBoatUtility(state, 'pt', round, difficulty);
  
  // Check for PT boat movement opportunity
  const aiPTBoats = island.boats.filter(b => b.type === 'pt' && b.owner === 'ai' && !b.isMoving);
  if (aiPTBoats.length > 0 && Math.random() < difficulty.ptAggressionBase + round * difficulty.ptAggressionPerRound) {
    // Try to find a target in player's waters
    const ptBoat = aiPTBoats[Math.floor(Math.random() * aiPTBoats.length)];
    const targetPos = findPTBoatTarget(ptBoat, playerIsland, island);
    if (targetPos) {
      return {
        action: 'move_pt',
        boatId: ptBoat.id,
        destination: targetPos,
        reason: 'attacking player',
      };
    }
  }
  
  // Decide between building and boats
  const bestBuilding = buildingUtilities[0];
  const bestBuildingScore = bestBuilding?.score || 0;
  
  // Use optimal choice probability
  const useOptimal = Math.random() < difficulty.optimalChoice;
  
  // Compare utilities
  const options: { type: 'building' | 'fishing' | 'pt'; score: number }[] = [];
  if (bestBuilding && gold >= (BUILDINGS.find(b => b.type === bestBuilding.type)?.cost || Infinity)) {
    options.push({ type: 'building', score: bestBuildingScore });
  }
  if (fishingUtility > 0) {
    options.push({ type: 'fishing', score: fishingUtility });
  }
  if (ptUtility > 0) {
    options.push({ type: 'pt', score: ptUtility });
  }
  
  if (options.length === 0) {
    return { action: 'none', reason: 'no affordable options' };
  }
  
  // Sort by score
  options.sort((a, b) => b.score - a.score);
  
  // Pick option (optimal or random)
  const choice = useOptimal ? options[0] : options[Math.floor(Math.random() * options.length)];
  
  if (choice.type === 'building') {
    const selectedBuilding = useOptimal ? bestBuilding : 
      buildingUtilities[Math.floor(Math.random() * Math.min(3, buildingUtilities.length))];
    
    if (!selectedBuilding) return { action: 'none' };
    
    const position = findBestBuildingLocation(island, selectedBuilding.type);
    if (!position) return { action: 'none', reason: 'no space' };
    
    return {
      action: 'build',
      buildingType: selectedBuilding.type,
      position,
      reason: selectedBuilding.reason,
    };
  } else if (choice.type === 'fishing' || choice.type === 'pt') {
    const coastalTile = findCoastalTileForBoat(island);
    if (!coastalTile) return { action: 'none', reason: 'no coastal tile' };
    
    const spawnPos = findAdjacentWater(coastalTile, island);
    if (!spawnPos) return { action: 'none', reason: 'no water' };
    
    return {
      action: 'boat',
      boatType: choice.type === 'fishing' ? 'fishing' : 'pt',
      position: spawnPos,
      reason: choice.type === 'fishing' ? 'income' : 'aggression',
    };
  }
  
  return { action: 'none' };
}

/**
 * Find a target position for PT boat attack
 */
function findPTBoatTarget(
  ptBoat: Boat,
  playerIsland: Island,
  aiIsland: Island
): Position | null {
  // Look for player's fishing boats
  const playerFishingBoats = playerIsland.boats.filter(b => b.type === 'fishing');
  
  if (playerFishingBoats.length > 0) {
    // Target closest fishing boat
    let closestBoat = playerFishingBoats[0];
    let closestDist = Infinity;
    
    for (const boat of playerFishingBoats) {
      const dist = Math.abs(boat.position.x - ptBoat.position.x) + 
                   Math.abs(boat.position.y - ptBoat.position.y);
      if (dist < closestDist) {
        closestDist = dist;
        closestBoat = boat;
      }
    }
    
    // Return position adjacent to target (not on top of it)
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];
    
    for (const dir of directions) {
      const pos = {
        x: closestBoat.position.x + dir.x,
        y: closestBoat.position.y + dir.y,
      };
      // Check if valid water position
      if (pos.x >= 0 && pos.x < GRID_WIDTH && pos.y >= 0 && pos.y < GRID_HEIGHT) {
        const onLand = playerIsland.tiles.some(t => 
          t.position.x === pos.x && t.position.y === pos.y
        ) || aiIsland.tiles.some(t => 
          t.position.x === pos.x && t.position.y === pos.y
        );
        if (!onLand) {
          return pos;
        }
      }
    }
  }
  
  // No fishing boats, target random water near player island
  const playerCoastalWater: Position[] = [];
  for (const tile of playerIsland.tiles) {
    const adjacentWater = findAdjacentWater(tile.position, playerIsland);
    if (adjacentWater) {
      playerCoastalWater.push(adjacentWater);
    }
  }
  
  if (playerCoastalWater.length > 0) {
    return playerCoastalWater[Math.floor(Math.random() * playerCoastalWater.length)];
  }
  
  return null;
}

/**
 * Calculate AI end-of-round income and state updates
 */
export function calculateAIRoundEnd(
  state: AIState,
  difficulty: AIDifficulty
): AIState {
  const { island, gold, population } = state;
  const tiles = island.tiles;
  const boats = island.boats.filter(b => b.owner === 'ai');
  
  const factories = tiles.filter(t => t.building === 'factory').length;
  const schools = tiles.filter(t => t.building === 'school').length;
  const hospitals = tiles.filter(t => t.building === 'hospital').length;
  const fishingBoats = boats.filter(b => b.type === 'fishing').length;
  const crops = tiles.filter(t => t.building === 'farm').length;
  const houses = tiles.filter(t => t.building === 'house').length;
  
  // Income calculation (same as player, with difficulty multiplier)
  const productivity = Math.min(BALANCE.maxProductivityBonus, (schools + hospitals) * factories + hospitals);
  const baseIncome = BALANCE.baseRoundIncome + factories * BALANCE.factoryIncome + fishingBoats * BALANCE.fishingBoatIncome + productivity;
  const income = Math.floor(baseIncome * difficulty.incomeMultiplier);
  
  // Population calculation
  const fertility = Math.max(BALANCE.minFertility, BALANCE.baseFertility + crops * BALANCE.fertilityPerCrop + hospitals * BALANCE.fertilityPerHospital + houses * BALANCE.fertilityPerHouse + schools * BALANCE.fertilityPerSchool) / 100;
  const mortality = Math.min(BALANCE.maxMortality, Math.max(BALANCE.minMortality, BALANCE.baseMortality + hospitals * BALANCE.mortalityPerHospital + factories * BALANCE.mortalityPerFactory)) / 100;
  const newPopulation = Math.min(BALANCE.maxPopulation, Math.max(1, Math.floor(population + population * fertility - population * mortality)));
  
  // Score calculation
  const housingScore = Math.min(30, Math.floor((houses * 500) / Math.max(1, newPopulation / 100) / 3));
  const foodScore = Math.min(30, Math.floor(((fishingBoats + crops) * 500) / Math.max(1, newPopulation / 100) / 3));
  const welfareScore = Math.min(30, (schools + hospitals) * 5);
  const gdpScore = Math.min(30, Math.floor(income / 4));
  const totalScore = Math.min(100, housingScore + foodScore + welfareScore + gdpScore);
  
  return {
    island,
    gold: gold + income,
    population: newPopulation,
    score: totalScore,
    scoreBreakdown: { housing: housingScore, food: foodScore, welfare: welfareScore, gdp: gdpScore },
  };
}

/**
 * Initialize AI state with a new island
 */
export function initializeAIState(island: Island): AIState {
  return {
    island: {
      ...island,
      boats: [], // AI starts with no boats
    },
    gold: BALANCE.startingGold,
    population: BALANCE.startingPopulation,
    score: 50,
    scoreBreakdown: { housing: 0, food: 0, welfare: 0, gdp: 0 },
  };
}

export default {
  AI_DIFFICULTIES,
  makeAIDecision,
  calculateAIRoundEnd,
  initializeAIState,
  evaluateBuildingUtilities,
};
