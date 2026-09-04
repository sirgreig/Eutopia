import { BuildingConfig, GameMode } from '../types/game';

// Grid configuration - wider for landscape mobile
export const GRID_WIDTH = 12;
export const GRID_HEIGHT = 7;
export const GRID_SIZE = Math.max(GRID_WIDTH, GRID_HEIGHT); // For compatibility

// Building configurations
export const BUILDINGS: BuildingConfig[] = [
  // Original buildings
  {
    type: 'farm',
    cost: 5,
    name: 'Crops',
    description: 'Generates 1 gold/sec when rained upon',
    enhanced: false,
  },
  {
    type: 'house',
    cost: 28,
    name: 'House',
    description: 'Increases fertility by 0.1%',
    enhanced: false,
  },
  {
    type: 'school',
    cost: 35,
    name: 'School',
    description: '+1 welfare, boosts factory productivity, -0.3% fertility',
    enhanced: false,
  },
  {
    type: 'factory',
    cost: 40,
    name: 'Factory',
    description: '+4 gold/round, +0.1% mortality',
    enhanced: false,
  },
  {
    type: 'fort',
    cost: 50,
    name: 'Fort',
    description: 'Protects 1-tile radius from rebels, protects parked boats',
    enhanced: false,
  },
  {
    type: 'hospital',
    cost: 75,
    name: 'Hospital',
    description: '+1 welfare, +0.3% fertility, -0.3% mortality, boosts productivity',
    enhanced: false,
  },
  // Enhanced mode buildings
  {
    type: 'apartment',
    cost: 60,
    name: 'Apartment',
    description: '3× housing capacity, -1 welfare',
    enhanced: true,
  },
  {
    type: 'dock',
    cost: 45,
    name: 'Dock',
    description: 'Adjacent fishing boats +50% income',
    enhanced: true,
  },
  {
    type: 'lighthouse',
    cost: 55,
    name: 'Lighthouse',
    description: 'Extends PT scouting radius, nearby boats resist storms',
    enhanced: true,
  },
  {
    type: 'granary',
    cost: 35,
    name: 'Granary',
    description: 'Stores food surplus, buffers bad rounds',
    enhanced: true,
  },
  {
    type: 'marketplace',
    cost: 50,
    name: 'Marketplace',
    description: 'Converts excess food score to bonus gold',
    enhanced: true,
  },
  {
    type: 'watchtower',
    cost: 40,
    name: 'Watchtower',
    description: 'Reveals fog on enemy island (stationary scouting)',
    enhanced: true,
  },
];

// Get buildings available for the current game mode
export function getAvailableBuildings(mode: GameMode): BuildingConfig[] {
  if (mode === 'enhanced') {
    return BUILDINGS; // All buildings available
  }
  return BUILDINGS.filter(b => !b.enhanced); // Only original buildings
}

/**
 * One-line effect summaries shown under each build menu tile.
 *
 * Players previously had to build something and then tap it to learn what it did,
 * which is a poor way to spend gold you cannot get back.
 *
 * Keep these SHORT — they render at ~9px on a landscape phone and must not wrap
 * past two lines. `gain` is shown in green, `cost` in red. Buildings with no real
 * downside simply omit `cost`.
 *
 * These numbers mirror BUILDINGS descriptions and the BALANCE constants below.
 * If you change a value there, change it here too.
 */
export const BUILD_STATS: Record<string, { gain: string; cost?: string }> = {
  // Original mode
  farm:        { gain: '1g/sec in rain' },
  house:       { gain: '+0.1% growth' },
  school:      { gain: '+welfare, +output', cost: '-0.3% growth' },
  factory:     { gain: '+4g/round',         cost: '+0.1% deaths' },
  fort:        { gain: 'shields 1 tile' },
  hospital:    { gain: '+welfare, +growth' },
  // Enhanced mode
  apartment:   { gain: '3x housing',        cost: '-1 welfare' },
  dock:        { gain: '+50% fishing' },
  lighthouse:  { gain: 'storm shelter' },
  granary:     { gain: 'stores food' },
  marketplace: { gain: 'food to gold' },
  watchtower:  { gain: 'reveals fog' },
  // Boats
  fishing:     { gain: '1g/sec on fish' },
  pt:          { gain: 'hunts pirates',     cost: 'can be sunk' },
};

// Boat configurations
export const BOAT_COSTS = {
  fishing: 15,
  pt: 25,
} as const;

// Sabotage cost
export const REBEL_SPAWN_COST = 30;

// Game balance constants (from reverse-engineered original)
export const BALANCE = {
  // Starting values
  startingGold: 100,
  startingPopulation: 1000,
  maxPopulation: 9999,
  
  // Island
  tilesPerIsland: 18,
  // Enhanced Mode gets a larger island — twelve buildings need somewhere to go.
  // Buildable region is 10x5 = 50 tiles (a one-tile water ring is always reserved),
  // so 28 uses 56% of it. Above roughly 32 the generator struggles to find shapes
  // that leave all water connected.
  tilesPerIslandEnhanced: 28,
  
  // Round timing (seconds)
  defaultRoundDuration: 90,
  readyUpTimeout: 20,
  disconnectForfeitTime: 180,
  
  // Income
  baseRoundIncome: 10,
  factoryIncome: 4,
  fishingBoatIncome: 1,
  maxProductivityBonus: 30,
  
  // Fertility (percentage points)
  baseFertility: 5.0,
  fertilityPerCrop: 0.3,
  fertilityPerHospital: 0.3,
  fertilityPerHouse: 0.1,
  fertilityPerSchool: -0.3,
  // Apartments house three families' worth of score but contribute less growth than
  // three houses would — density without community. Still better than one house, so
  // they are not a dead end for population.
  fertilityPerApartment: 0.2,
  minFertility: 4.0,
  
  // Mortality (percentage points)
  baseMortality: 1.1,
  mortalityPerHospital: -0.3,
  mortalityPerFactory: 0.1,
  minMortality: 0.2,
  maxMortality: 4.0,
  
  // Scoring (max 30 per category, 100 total possible with bonus)
  maxCategoryScore: 30,
  
  // Rebellion thresholds
  rebellionScoreDrop: 10,
  rebellionLowScore: 30,
  stabilityScoreGain: 10,
  stabilityHighScore: 70,
  
  // Fort protection
  fortRadius: 1,                 // 1 = the 8 tiles immediately surrounding the fort
  fortBuildingProtection: 0.5,   // Halves the chance a protected building is destroyed
                                 // (and roughly halves rebel targeting). NOT immunity.
  // Boats within fortRadius are fully immune to weather — see fortProtection.ts
  
  // PT boat scouting radius (tiles)
  ptScoutRadius: 3,
  
  // Fish schools
  fishSchoolCount: 3,            // Number of active schools per round
  fishSchoolSpeed: 0.15,         // Drift speed (world units/second)
  fishSchoolSize: 0.75,          // Radius for overlap detection (world units)
  fishingGoldPerTick: 1,         // Gold earned per boat per detection tick
  fishGoldCheckInterval: 1500,   // ms between gold checks
  
  // Pirate ships
  pirateSpawnInterval: 8000,     // ms between spawn checks
  pirateMaxActive: 2,            // Max simultaneous pirates
  pirateSinkRadius: 0.6,         // Overlap radius to sink/be sunk (world units)
  pirateCasualtiesMin: 0,        // Min population lost when boat sunk
  pirateCasualtiesMax: 50,       // Max population lost when boat sunk
  // Chance a PT boat LOSES its fight with a pirate rather than winning it.
  // Hunting pirates is meant to carry real risk, not be a free kill.
  ptBoatLossChance: 0.30,
  // Difficulty-specific values set in PIRATE_DIFFICULTY below
  
  // Tropical storms
  stormSpawnInterval: 15000,     // ms between spawn checks
  stormDamageInterval: 1500,     // ms between damage checks while storm is active
  stormCasualtiesMin: 0,         // Min population lost per boat sunk
  stormCasualtiesMax: 30,        // Max population lost per boat sunk
  stormMaxBuildingsDestroyed: 1, // Hard cap per storm — storms are a nuisance, not a wipe
  stormMaxBoatsSunk: 1,          // Hard cap per storm
  // Difficulty-specific values set in STORM_DIFFICULTY below
  
  // Hurricanes
  hurricaneSpawnInterval: 15000, // ms between spawn checks
  hurricaneDamageInterval: 1200, // ms between damage checks (faster than storm)
  hurricaneCasualtiesMin: 10,    // Min population lost per boat sunk
  hurricaneCasualtiesMax: 80,    // Max population lost per boat sunk
  hurricaneMinRound: 4,          // Earliest round a hurricane can appear
  // Each hurricane rolls its own budget in this range at spawn, so severity varies
  // between hurricanes instead of always reaching the cap.
  hurricaneMinBuildingsDestroyed: 1,
  hurricaneMaxBuildingsDestroyed: 3,
  hurricaneMinBoatsSunk: 1,
  hurricaneMaxBoatsSunk: 2,
  // Difficulty-specific values set in HURRICANE_DIFFICULTY below

  // ==========================================================
  // ENHANCED MODE BUILDINGS (Phase 9)
  // ==========================================================

  // Apartment — dense housing at the cost of quality of life
  apartmentHousingUnits: 3,      // Counts as this many houses for housing score
  apartmentWelfarePenalty: 1,    // Welfare points lost per apartment

  // Dock — boosts fishing boats working nearby
  dockRadius: 1.5,               // World units from the dock tile centre
  dockFishingMultiplier: 1.5,    // Income multiplier for boats in range

  // Lighthouse — shelters boats from weather (not from pirates; that is the fort)
  lighthouseRadius: 2.5,         // World units from the lighthouse tile centre
  lighthouseStormProtection: 0.5,// Multiplies a boat's sink chance in range
  lighthouseScoutBonus: 2,       // Extra tiles of fog reveal for PT boats

  // Granary — banks surplus food and spends it on bad rounds
  granaryCapacityEach: 15,       // Food score points each granary can hold

  // Marketplace — sells food the island cannot use
  marketplacePointsEach: 25,     // Overflow food points each marketplace can convert
  marketplaceGoldPerPoint: 2,    // Gold per converted point

  // Watchtower — permanent fog reveal around a fixed point
  watchtowerRevealRadius: 2,     // Tiles revealed on the opponent island
} as const;

// Pirate difficulty scaling
export const PIRATE_DIFFICULTY = {
  easy:   { spawnChance: 0.10, maxActive: 1, speed: 0.6 },
  normal: { spawnChance: 0.15, maxActive: 2, speed: 0.8 },
  hard:   { spawnChance: 0.25, maxActive: 3, speed: 1.0 },
} as const;

// Tropical storm difficulty scaling
// spawnChance reduced ~25% (Aug 2026) — storms were appearing too often
export const STORM_DIFFICULTY = {
  easy:   { spawnChance: 0.075, buildingDestroy: 0.20, boatSink: 0.20, speed: 20 },
  normal: { spawnChance: 0.135, buildingDestroy: 0.30, boatSink: 0.25, speed: 22 },
  hard:   { spawnChance: 0.21,  buildingDestroy: 0.40, boatSink: 0.35, speed: 28 },
} as const;

// Hurricane difficulty scaling — much more destructive, can destroy forts
export const HURRICANE_DIFFICULTY = {
  easy:   { spawnChance: 0.08, buildingDestroy: 0.45, fortDestroy: 0.14, boatSink: 0.68, speed: 15 },
  normal: { spawnChance: 0.12, buildingDestroy: 0.60, fortDestroy: 0.23, boatSink: 0.81, speed: 18 },
  hard:   { spawnChance: 0.18, buildingDestroy: 0.72, fortDestroy: 0.32, boatSink: 0.86, speed: 20 },
} as const;

// Color palette
export const COLORS = {
  // Water
  waterDeep: '#1a4b6e',
  waterMid: '#2d6a8e',
  waterLight: '#4a8fad',
  waterHighlight: '#6bb3d0',
  
  // Land
  land: '#5cb85c',
  landLight: '#7ed07e',
  landDark: '#3d8b3d',
  
  // Buildings
  house: '#e8a838',
  factory: '#708090',
  farm: '#7cb342',
  fort: '#8b6f4e',
  hospital: '#f5f5f5',
  school: '#5c6bc0',
  dock: '#8d6e63',
  lighthouse: '#f5f5dc',
  
  // UI
  panel: '#1a2530',
  panelLight: '#2d3d4d',
  panelBorder: '#3d5060',
  text: '#eceff1',
  textDim: '#78909c',
  gold: '#ffc107',
  
  // Boats
  fishingBoat: '#ffd54f',
  ptBoat: '#90a4ae',
  
  // Effects
  fog: 'rgba(26, 37, 48, 0.7)',
  selected: '#4caf50',
  rain: '#64b5f6',
  danger: '#e53935',
} as const;
