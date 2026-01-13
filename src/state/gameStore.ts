import { create } from 'zustand';
import {
  GameState,
  GameMode,
  Position,
  BuildingType,
  Tile,
  Island,
  PlayerState,
} from '../types/game';
import { BALANCE } from '../constants/game';

interface GameActions {
  // Game setup
  initGame: (mode: GameMode, maxRounds: number) => void;
  setIslands: (playerIsland: Island, opponentIsland: Island) => void;
  
  // Round management
  startRound: () => void;
  endRound: () => void;
  tickRoundTimer: () => void;
  
  // Building
  placeBuilding: (position: Position, building: BuildingType) => void;
  
  // Selection
  selectTile: (position: Position | null) => void;
  selectBoat: (boatId: string | null) => void;
  
  // Boats
  spawnBoat: (type: 'fishing' | 'pt', position: Position) => void;
  moveBoat: (boatId: string, destination: Position) => void;
  
  // Economy
  updateGold: (amount: number) => void;
  calculateRoundIncome: () => void;
  
  // Population
  updatePopulation: () => void;
  
  // Scoring
  calculateScore: () => void;
  
  // Fog of war (enhanced mode)
  revealTile: (position: Position) => void;
}

const createInitialPlayerState = (): PlayerState => ({
  gold: BALANCE.startingGold,
  population: BALANCE.startingPopulation,
  score: 50, // Start at neutral
  island: {
    id: '',
    tiles: [],
    boats: [],
  },
});

const createInitialState = (): GameState => ({
  mode: 'original',
  round: 0,
  maxRounds: 15,
  roundTimeRemaining: BALANCE.defaultRoundDuration,
  roundDuration: BALANCE.defaultRoundDuration,
  isRoundActive: false,
  player: createInitialPlayerState(),
  opponent: createInitialPlayerState(),
  fishSchools: [],
  pirates: [],
  weather: { type: 'clear', position: null, duration: 0 },
  selectedTile: null,
  selectedBoat: null,
});

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...createInitialState(),
  
  initGame: (mode, maxRounds) => {
    set({
      ...createInitialState(),
      mode,
      maxRounds,
    });
  },
  
  setIslands: (playerIsland, opponentIsland) => {
    set(state => ({
      player: { ...state.player, island: playerIsland },
      opponent: { ...state.opponent, island: opponentIsland },
    }));
  },
  
  startRound: () => {
    set(state => ({
      round: state.round + 1,
      roundTimeRemaining: state.roundDuration,
      isRoundActive: true,
    }));
  },
  
  endRound: () => {
    const { calculateRoundIncome, updatePopulation, calculateScore } = get();
    calculateRoundIncome();
    updatePopulation();
    calculateScore();
    set({ isRoundActive: false });
  },
  
  tickRoundTimer: () => {
    set(state => {
      const newTime = state.roundTimeRemaining - 1;
      if (newTime <= 0) {
        return { roundTimeRemaining: 0, isRoundActive: false };
      }
      return { roundTimeRemaining: newTime };
    });
  },
  
  placeBuilding: (position, building) => {
    set(state => {
      const tile = state.player.island.tiles.find(
        t => t.position.x === position.x && t.position.y === position.y
      );
      if (!tile || !tile.isLand || tile.building) return state;
      
      const buildingCost = getBuildingCost(building);
      if (state.player.gold < buildingCost) return state;
      
      const updatedTiles = state.player.island.tiles.map(t =>
        t.position.x === position.x && t.position.y === position.y
          ? { ...t, building }
          : t
      );
      
      return {
        player: {
          ...state.player,
          gold: state.player.gold - buildingCost,
          island: { ...state.player.island, tiles: updatedTiles },
        },
        selectedTile: null,
      };
    });
  },
  
  selectTile: (position) => set({ selectedTile: position, selectedBoat: null }),
  
  selectBoat: (boatId) => set({ selectedBoat: boatId, selectedTile: null }),
  
  spawnBoat: (type, position) => {
    set(state => {
      const cost = type === 'fishing' ? 28 : 40;
      if (state.player.gold < cost) return state;
      
      const newBoat = {
        id: `boat-${Date.now()}`,
        type,
        position,
        owner: 'player' as const,
        isMoving: false,
        destination: null,
      };
      
      return {
        player: {
          ...state.player,
          gold: state.player.gold - cost,
          island: {
            ...state.player.island,
            boats: [...state.player.island.boats, newBoat],
          },
        },
      };
    });
  },
  
  moveBoat: (boatId, destination) => {
    set(state => ({
      player: {
        ...state.player,
        island: {
          ...state.player.island,
          boats: state.player.island.boats.map(b =>
            b.id === boatId
              ? { ...b, destination, isMoving: true }
              : b
          ),
        },
      },
      selectedBoat: null,
    }));
  },
  
  updateGold: (amount) => {
    set(state => ({
      player: {
        ...state.player,
        gold: Math.max(0, state.player.gold + amount),
      },
    }));
  },
  
  calculateRoundIncome: () => {
    set(state => {
      const tiles = state.player.island.tiles;
      const boats = state.player.island.boats;
      
      const factories = tiles.filter(t => t.building === 'factory').length;
      const schools = tiles.filter(t => t.building === 'school').length;
      const hospitals = tiles.filter(t => t.building === 'hospital').length;
      const fishingBoats = boats.filter(b => b.type === 'fishing').length;
      
      // Base + factories + fishing + productivity bonus
      const productivity = Math.min(
        BALANCE.maxProductivityBonus,
        (schools + hospitals) * factories + hospitals
      );
      
      const income =
        BALANCE.baseRoundIncome +
        factories * BALANCE.factoryIncome +
        fishingBoats * BALANCE.fishingBoatIncome +
        productivity;
      
      return {
        player: {
          ...state.player,
          gold: state.player.gold + income,
        },
      };
    });
  },
  
  updatePopulation: () => {
    set(state => {
      const tiles = state.player.island.tiles;
      
      const crops = tiles.filter(t => t.building === 'farm').length;
      const houses = tiles.filter(t => t.building === 'house').length;
      const hospitals = tiles.filter(t => t.building === 'hospital').length;
      const schools = tiles.filter(t => t.building === 'school').length;
      const factories = tiles.filter(t => t.building === 'factory').length;
      
      // Fertility calculation
      const fertility = Math.max(
        BALANCE.minFertility,
        BALANCE.baseFertility +
          crops * BALANCE.fertilityPerCrop +
          hospitals * BALANCE.fertilityPerHospital +
          houses * BALANCE.fertilityPerHouse +
          schools * BALANCE.fertilityPerSchool
      ) / 100;
      
      // Mortality calculation
      const mortality = Math.min(
        BALANCE.maxMortality,
        Math.max(
          BALANCE.minMortality,
          BALANCE.baseMortality +
            hospitals * BALANCE.mortalityPerHospital +
            factories * BALANCE.mortalityPerFactory
        )
      ) / 100;
      
      const pop = state.player.population;
      const newPop = Math.min(
        BALANCE.maxPopulation,
        Math.floor(pop + pop * fertility - pop * mortality)
      );
      
      return {
        player: {
          ...state.player,
          population: newPop,
        },
      };
    });
  },
  
  calculateScore: () => {
    set(state => {
      const tiles = state.player.island.tiles;
      const boats = state.player.island.boats;
      const pop = state.player.population;
      
      const houses = tiles.filter(t => t.building === 'house').length;
      const crops = tiles.filter(t => t.building === 'farm').length;
      const schools = tiles.filter(t => t.building === 'school').length;
      const hospitals = tiles.filter(t => t.building === 'hospital').length;
      const fishingBoats = boats.filter(b => b.type === 'fishing').length;
      
      // Four subscores (max 30 each)
      const housingScore = Math.min(30, ((houses * 500) / (pop / 100)) / 3);
      const foodScore = Math.min(30, (((fishingBoats + crops) * 500) / (pop / 100)) / 3);
      const welfareScore = Math.min(30, schools + hospitals);
      // GDP score would need round income tracking - simplified for now
      const gdpScore = Math.min(30, 15); // Placeholder
      
      const totalScore = Math.round(housingScore + foodScore + welfareScore + gdpScore);
      
      return {
        player: {
          ...state.player,
          score: Math.min(100, totalScore),
        },
      };
    });
  },
  
  revealTile: (position) => {
    set(state => ({
      opponent: {
        ...state.opponent,
        island: {
          ...state.opponent.island,
          tiles: state.opponent.island.tiles.map(t =>
            t.position.x === position.x && t.position.y === position.y
              ? { ...t, isRevealed: true }
              : t
          ),
        },
      },
    }));
  },
}));

// Helper to get building cost
function getBuildingCost(type: BuildingType): number {
  const costs: Record<BuildingType, number> = {
    farm: 3,
    house: 28,
    school: 35,
    factory: 40,
    fort: 50,
    hospital: 75,
    apartment: 60,
    dock: 45,
    lighthouse: 55,
    granary: 35,
    marketplace: 50,
    watchtower: 40,
  };
  return costs[type];
}
