// Core game types for Eutopía

export type BuildingType =
  // Original buildings
  | 'house'
  | 'farm'
  | 'factory'
  | 'fort'
  | 'hospital'
  | 'school'
  // Enhanced mode buildings
  | 'apartment'
  | 'dock'
  | 'lighthouse'
  | 'granary'
  | 'marketplace'
  | 'watchtower';

export type BoatType = 'fishing' | 'pt';

export type WeatherType = 'clear' | 'rain' | 'storm' | 'hurricane';

export type GameMode = 'original' | 'enhanced';

export interface Position {
  x: number;
  y: number;
}

export interface Tile {
  id: string;
  position: Position;
  isLand: boolean;
  building: BuildingType | null;
  isRevealed: boolean; // For fog of war
  hasRebel: boolean;
}

export interface Boat {
  id: string;
  type: BoatType;
  position: Position;
  owner: 'player' | 'opponent';
  isMoving: boolean;
  destination: Position | null;
}

export interface Island {
  id: string;
  tiles: Tile[];
  boats: Boat[];
}

export interface FishSchool {
  id: string;
  position: Position;
}

export interface Pirate {
  id: string;
  position: Position;
}

export interface Weather {
  type: WeatherType;
  position: Position | null; // null for clear, position for localized weather
  duration: number; // seconds remaining
}

export interface PlayerState {
  gold: number;
  population: number;
  score: number;
  island: Island;
}

export interface GameState {
  mode: GameMode;
  round: number;
  maxRounds: number;
  roundTimeRemaining: number;
  roundDuration: number;
  isRoundActive: boolean;
  player: PlayerState;
  opponent: PlayerState;
  fishSchools: FishSchool[];
  pirates: Pirate[];
  weather: Weather;
  selectedTile: Position | null;
  selectedBoat: string | null;
}

export interface BuildingConfig {
  type: BuildingType;
  cost: number;
  name: string;
  description: string;
  enhanced: boolean; // true if only available in enhanced mode
}

// Island generator types
export interface IslandMetrics {
  compactness: number;      // 0-1, higher = more compact shape
  coastlineLength: number;  // Number of water-adjacent edges
  fortEfficiency: number;   // Tiles protectable by optimal fort placement
}

export interface IslandGeneratorConfig {
  tileCount: number;        // Target tiles (29 for original)
  minCompactness: number;   // Minimum acceptable compactness
  maxAttempts: number;      // Generation attempts before fallback
}
