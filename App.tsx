import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  useWindowDimensions,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Island } from './src/components/game/Island';
import { 
  HouseIcon, 
  FarmIcon, 
  FactoryIcon, 
  HospitalIcon, 
  SchoolIcon, 
  FortIcon,
  ApartmentIcon,
  DockIcon,
  LighthouseIcon,
  GranaryIcon,
  MarketplaceIcon,
  WatchtowerIcon,
  FishingBoatIcon,
  PTBoatIcon,
  ConstructionIcon,
} from './src/components/game/Icons';
import { RainCloud } from './src/components/game/RainCloud';
import { ScoreDisplay } from './src/components/game/ScoreDisplay';
import { EndGameSummary } from './src/components/game/EndGameSummary';
import { Toast } from './src/components/game/Toast';
import { RoundTransition } from './src/components/game/RoundTransition';
import { AnimatedResourceBar } from './src/components/game/AnimatedResourceBar';
import { AnimatedBuildMenu } from './src/components/game/AnimatedBuildMenu';
import { FreeRoamBoat, DestinationMarker } from './src/components/game/FreeRoamBoat';
import { generateIsland } from './src/services/islandGenerator';
import { generateCoastline } from './src/services/coastlineDetection';
import { 
  createFreeRoamBoat, 
  setBoatDestination, 
  updateBoat,
} from './src/services/boatMovement';
import { 
  Island as IslandType, 
  Position, 
  Tile, 
  BuildingType, 
  GameMode,
  BoatType,
  FreeRoamBoat as FreeRoamBoatType,
  WaterPosition,
  Coastline,
} from './src/types';
import { BUILDINGS, BOAT_COSTS, BALANCE, GRID_WIDTH, GRID_HEIGHT, getAvailableBuildings } from './src/constants/game';

// Audio imports - simple system adapted from IJBA
import { initializeSounds, Sounds } from './src/services/soundManager';
import { loadAudioSettings, useAudioSettings } from './src/hooks/useAudioSettings';
import { SettingsScreen } from './src/components/settings/SettingsScreen';
import { SetupScreen, GameConfig } from './src/components/setup/SetupScreen';

// AI Opponent imports
import { useAIOpponent } from './src/hooks/useAIOpponent';
import { AIIslandMinimap } from './src/components/game/AIIslandMinimap';

// Tutorial imports
import { useTutorial } from './src/hooks/useTutorial';
import { TutorialOverlay } from './src/components/game/TutorialOverlay';

const MENU_ICON_SIZE = 28;

const MenuBuildingIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'house': return <HouseIcon size={MENU_ICON_SIZE} />;
    case 'farm': return <FarmIcon size={MENU_ICON_SIZE} />;
    case 'factory': return <FactoryIcon size={MENU_ICON_SIZE} />;
    case 'hospital': return <HospitalIcon size={MENU_ICON_SIZE} />;
    case 'school': return <SchoolIcon size={MENU_ICON_SIZE} />;
    case 'fort': return <FortIcon size={MENU_ICON_SIZE} />;
    case 'apartment': return <ApartmentIcon size={MENU_ICON_SIZE} />;
    case 'dock': return <DockIcon size={MENU_ICON_SIZE} />;
    case 'lighthouse': return <LighthouseIcon size={MENU_ICON_SIZE} />;
    case 'granary': return <GranaryIcon size={MENU_ICON_SIZE} />;
    case 'marketplace': return <MarketplaceIcon size={MENU_ICON_SIZE} />;
    case 'watchtower': return <WatchtowerIcon size={MENU_ICON_SIZE} />;
    default: return <ConstructionIcon size={MENU_ICON_SIZE} />;
  }
};

export default function App() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  const availableHeight = screenHeight - 60;
  const availableWidth = screenWidth - 20;
  const tileSize = Math.min(
    Math.floor(availableWidth / GRID_WIDTH),
    Math.floor(availableHeight / GRID_HEIGHT)
  );
  
  const [island, setIsland] = useState<IslandType | null>(null);
  const [gold, setGold] = useState(BALANCE.startingGold);
  const [population, setPopulation] = useState(BALANCE.startingPopulation);
  const [score, setScore] = useState(50);
  const [scoreBreakdown, setScoreBreakdown] = useState({ housing: 0, food: 0, welfare: 0, gdp: 0 });
  const [mode, setMode] = useState<GameMode>('original');
  const [round, setRound] = useState(0);
  const [maxRounds, setMaxRounds] = useState(15);
  const [roundDuration, setRoundDuration] = useState(BALANCE.defaultRoundDuration);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [timeRemaining, setTimeRemaining] = useState(BALANCE.defaultRoundDuration);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [selectedTile, setSelectedTile] = useState<Position | null>(null);
  const [selectedBoat, setSelectedBoat] = useState<string | null>(null);
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'gold' | 'population' | 'rebel' | 'rain' | 'round' | 'build' | 'error' | 'stability' } | null>(null);
  const [rainCloud, setRainCloud] = useState<{
    startX: number; startY: number;
    endX: number; endY: number;
    duration: number;
  } | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showRoundTransition, setShowRoundTransition] = useState<'start' | 'end' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSetup, setShowSetup] = useState(true); // Start on setup screen
  const [showQuitConfirm, setShowQuitConfirm] = useState(false); // Quit confirmation dialog
  const [animationsEnabled, setAnimationsEnabled] = useState(true); // Toggle for animations
  
  // Free-roam boat system state
  const [freeRoamBoats, setFreeRoamBoats] = useState<FreeRoamBoatType[]>([]);
  const [coastline, setCoastline] = useState<Coastline | null>(null);
  const [destinationMarker, setDestinationMarker] = useState<WaterPosition | null>(null);
  const boatUpdateRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  
  // Audio settings hook
  const { isAudioEnabled, toggleAllAudio } = useAudioSettings();
  
  // AI Opponent hook
  const {
    aiIsland,
    aiGold,
    aiPopulation,
    aiScore,
    aiScoreBreakdown,
    initializeAI,
    processAIRoundEnd,
    lastAIAction,
  } = useAIOpponent({
    difficulty,
    mode,
    isRoundActive,
    round,
    maxRounds,
    playerIsland: island,
    enabled: true, // AI is always enabled for now
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const rainTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rainStartTimeRef = useRef<number>(0);
  const rainGoldIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rainGoldAccumRef = useRef(0);

  // Tutorial hook
  const {
    isActive: isTutorialActive,
    currentStep: tutorialStep,
    stepIndex: tutorialStepIndex,
    totalSteps: tutorialTotalSteps,
    nextStep: tutorialNextStep,
    skipTutorial,
    resetTutorial,
    startTutorial,
    onTutorialAction,
  } = useTutorial();

  // Combined function to reset and immediately start tutorial
  const handleReplayTutorial = useCallback(async () => {
    await resetTutorial();
    startTutorial();
  }, [resetTutorial, startTutorial]);

  const showToast = (message: string, type: 'gold' | 'population' | 'rebel' | 'rain' | 'round' | 'build' | 'error' | 'stability' = 'round') => {
    setToast({ message, type });
  };

  const initGame = useCallback(() => {
    const newIsland = generateIsland();
    setIsland(newIsland);
    setCoastline(generateCoastline(newIsland));
    setFreeRoamBoats([]);
    setGold(BALANCE.startingGold);
    setPopulation(BALANCE.startingPopulation);
    setScore(50);
    setScoreBreakdown({ housing: 0, food: 0, welfare: 0, gdp: 0 });
    setRound(0);
    setTimeRemaining(roundDuration);
    setIsRoundActive(false);
    setSelectedTile(null);
    setSelectedBoat(null);
    setDestinationMarker(null);
    setShowBuildMenu(false);
    setRainCloud(null);
    setShowGameOver(false);
    setShowRoundTransition(null);
    setToast(null);
  }, [roundDuration]);

  // Start game with config from setup screen
  const startGameWithConfig = useCallback((config: GameConfig) => {
    setMode(config.mode);
    setMaxRounds(config.rounds);
    setRoundDuration(config.roundDuration);
    setDifficulty(config.difficulty);
    setShowSetup(false);
    
    // Initialize game with new config
    const newIsland = generateIsland();
    setIsland(newIsland);
    setCoastline(generateCoastline(newIsland));
    setFreeRoamBoats([]);
    setGold(BALANCE.startingGold);
    setPopulation(BALANCE.startingPopulation);
    setScore(50);
    setScoreBreakdown({ housing: 0, food: 0, welfare: 0, gdp: 0 });
    setRound(0);
    setTimeRemaining(config.roundDuration);
    setIsRoundActive(false);
    setSelectedTile(null);
    setSelectedBoat(null);
    setDestinationMarker(null);
    setShowBuildMenu(false);
    setRainCloud(null);
    setShowGameOver(false);
    setShowRoundTransition(null);
    setToast(null);
    
    // Initialize AI opponent
    setTimeout(() => initializeAI(), 100);
  }, [initializeAI]);

  // Return to setup screen
  const returnToSetup = useCallback(() => {
    setShowSetup(true);
    setShowGameOver(false);
    Sounds.playMusic('menu');
  }, []);

  // Initialize audio on mount (game waits for setup screen)
  useEffect(() => { 
    const init = async () => {
      await initializeSounds();
      await loadAudioSettings();
      // Start menu music (setup screen)
      Sounds.playMusic('menu');
    };
    init(); 
  }, []);

  // Toggle music based on game state
  // Menu music: setup screen, before game starts, between rounds
  // Gameplay music: during active rounds
  useEffect(() => {
    if (showSetup) {
      Sounds.playMusic('menu');
    } else if (isRoundActive) {
      Sounds.playMusic('gameplay');
    } else if (round < maxRounds) {
      Sounds.playMusic('menu');
    } else {
      // Game over - stop music
      Sounds.stopMusic();
    }
  }, [showSetup, isRoundActive, round, maxRounds]);

  // Timer effect
  useEffect(() => {
    if (isRoundActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => setTimeRemaining(t => t - 1), 1000);
    } else if (isRoundActive && timeRemaining === 0) {
      endRound();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isRoundActive, timeRemaining]);

  // Rain cloud spawning during rounds
  useEffect(() => {
    if (isRoundActive) {
      const spawnRain = () => {
        if (rainCloud) return; // Only one cloud at a time
        if (Math.random() < 0.3) { // 30% chance each check
          const cloudWidth = tileSize * 2;
          const cloudHeight = tileSize * 1.5;
          const margin = 20; // Start just off-screen
          
          // Grid area bounds for targeting cloud path through island
          const gridW = GRID_WIDTH * tileSize;
          const gridH = GRID_HEIGHT * tileSize;
          const gridX = (screenWidth - gridW) / 2;
          const gridY = 56 + ((screenHeight - 56) - gridH) / 2;
          
          // Random position within island area for perpendicular axis
          const randIslandY = gridY + Math.random() * gridH - cloudHeight / 2;
          const randIslandX = gridX + Math.random() * gridW - cloudWidth / 2;
          
          // Slight angle variation so paths aren't perfectly straight
          const angleVariation = (Math.random() - 0.5) * screenHeight * 0.15;
          
          // Pick random direction: 0-3 cardinal, 4-7 diagonal
          const dir = Math.floor(Math.random() * 8);
          let sX: number, sY: number, eX: number, eY: number;
          
          switch (dir) {
            case 0: // Left to right
              sX = -margin; sY = randIslandY;
              eX = screenWidth + margin; eY = randIslandY + angleVariation;
              break;
            case 1: // Right to left
              sX = screenWidth + margin; sY = randIslandY;
              eX = -margin; eY = randIslandY + angleVariation;
              break;
            case 2: // Top to bottom
              sX = randIslandX; sY = -margin;
              eX = randIslandX + angleVariation; eY = screenHeight + margin;
              break;
            case 3: // Bottom to top
              sX = randIslandX; sY = screenHeight + margin;
              eX = randIslandX + angleVariation; eY = -margin;
              break;
            case 4: // Top-left to bottom-right
              sX = -margin; sY = -margin;
              eX = screenWidth + margin; eY = screenHeight + margin;
              break;
            case 5: // Top-right to bottom-left
              sX = screenWidth + margin; sY = -margin;
              eX = -margin; eY = screenHeight + margin;
              break;
            case 6: // Bottom-left to top-right
              sX = -margin; sY = screenHeight + margin;
              eX = screenWidth + margin; eY = -margin;
              break;
            case 7: // Bottom-right to top-left
            default:
              sX = screenWidth + margin; sY = screenHeight + margin;
              eX = -margin; eY = -margin;
              break;
          }
          
          // Duration proportional to path length for consistent speed
          const pathLength = Math.sqrt(Math.pow(eX - sX, 2) + Math.pow(eY - sY, 2));
          const speed = 25; // pixels per second
          const dur = Math.max(10000, Math.min(60000, (pathLength / speed) * 1000));
          
          rainStartTimeRef.current = Date.now();
          rainGoldAccumRef.current = 0;
          setRainCloud({ startX: sX, startY: sY, endX: eX, endY: eY, duration: dur });
        }
      };
      
      rainTimerRef.current = setInterval(spawnRain, 5000);
      return () => { if (rainTimerRef.current) clearInterval(rainTimerRef.current); };
    }
  }, [isRoundActive, island, tileSize, screenWidth, screenHeight, rainCloud]);

  // Rain gold detection — check crop overlap every second while cloud is active
  useEffect(() => {
    if (!rainCloud || !island) {
      if (rainGoldIntervalRef.current) {
        clearInterval(rainGoldIntervalRef.current);
        rainGoldIntervalRef.current = null;
      }
      return;
    }
    
    const cloudWidth = tileSize * 2;
    const cloudHeight = tileSize * 1.5;
    const gridW = GRID_WIDTH * tileSize;
    const gridH = GRID_HEIGHT * tileSize;
    const gridOriginX = (screenWidth - gridW) / 2;
    const gridOriginY = 56 + ((screenHeight - 56) - gridH) / 2;
    
    rainGoldIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - rainStartTimeRef.current;
      const progress = Math.min(1, elapsed / rainCloud.duration);
      
      // Calculate current cloud position
      const cloudX = rainCloud.startX + (rainCloud.endX - rainCloud.startX) * progress;
      const cloudY = rainCloud.startY + (rainCloud.endY - rainCloud.startY) * progress;
      
      // Check which crop tiles the cloud overlaps
      const cropTiles = island.tiles.filter(t => t.building === 'farm');
      let wateredCrops = 0;
      
      for (const crop of cropTiles) {
        const tileScreenX = gridOriginX + crop.position.x * tileSize;
        const tileScreenY = gridOriginY + crop.position.y * tileSize;
        
        // Bounding box overlap check
        if (
          cloudX < tileScreenX + tileSize &&
          cloudX + cloudWidth > tileScreenX &&
          cloudY < tileScreenY + tileSize &&
          cloudY + cloudHeight > tileScreenY
        ) {
          wateredCrops++;
        }
      }
      
      if (wateredCrops > 0) {
        Sounds.rainStorm();
        setGold(g => g + wateredCrops);
        rainGoldAccumRef.current += wateredCrops;
        showToast(`+${wateredCrops}g from rain!`, 'rain');
      }
    }, 1000);
    
    return () => {
      if (rainGoldIntervalRef.current) {
        clearInterval(rainGoldIntervalRef.current);
        rainGoldIntervalRef.current = null;
      }
    };
  }, [rainCloud, island, tileSize, screenWidth, screenHeight]);

  // Free-roam boat physics game loop
  useEffect(() => {
    if (!coastline || !island || freeRoamBoats.length === 0) {
      return;
    }
    
    const updateBoats = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTimeRef.current) / 1000; // Convert to seconds
      lastUpdateTimeRef.current = now;
      
      // Cap deltaTime to prevent huge jumps
      const dt = Math.min(deltaTime, 0.1);
      
      setFreeRoamBoats(prevBoats => {
        return prevBoats.map(boat => 
          updateBoat(boat, dt, coastline, island, prevBoats)
        );
      });
      
      // Clear destination marker when boat arrives
      const selectedBoatObj = freeRoamBoats.find(b => b.id === selectedBoat);
      if (selectedBoatObj && !selectedBoatObj.isMoving && destinationMarker) {
        setDestinationMarker(null);
      }
      
      boatUpdateRef.current = requestAnimationFrame(updateBoats);
    };
    
    lastUpdateTimeRef.current = Date.now();
    boatUpdateRef.current = requestAnimationFrame(updateBoats);
    
    return () => {
      if (boatUpdateRef.current) {
        cancelAnimationFrame(boatUpdateRef.current);
      }
    };
  }, [coastline, island, freeRoamBoats.length > 0, selectedBoat, destinationMarker]);

  const startRound = () => {
    Sounds.buttonClick();
    if (round >= maxRounds) {
      setShowGameOver(true);
      return;
    }
    const newRound = round + 1;
    setRound(newRound);
    setShowRoundTransition('start');
  };

  const onRoundTransitionComplete = () => {
    if (showRoundTransition === 'start') {
      setShowRoundTransition(null);
      setTimeRemaining(roundDuration);
      setIsRoundActive(true);
      Sounds.roundStart();
    } else if (showRoundTransition === 'end') {
      setShowRoundTransition(null);
    }
  };

  const endRound = () => {
    setIsRoundActive(false);
    setRainCloud(null);
    Sounds.roundEnd();
    if (!island) return;
    
    const tiles = island.tiles;
    const factories = tiles.filter(t => t.building === 'factory').length;
    const schools = tiles.filter(t => t.building === 'school').length;
    const hospitals = tiles.filter(t => t.building === 'hospital').length;
    const fishingBoats = freeRoamBoats.filter(b => b.type === 'fishing').length;
    const crops = tiles.filter(t => t.building === 'farm').length;
    const houses = tiles.filter(t => t.building === 'house').length;
    const forts = tiles.filter(t => t.building === 'fort').length;
    
    // Income calculation
    const productivity = Math.min(BALANCE.maxProductivityBonus, (schools + hospitals) * factories + hospitals);
    const income = BALANCE.baseRoundIncome + factories * BALANCE.factoryIncome + fishingBoats * BALANCE.fishingBoatIncome + productivity;
    setGold(g => g + income);
    Sounds.goldReceive();
    
    // Population calculation
    const fertility = Math.max(BALANCE.minFertility, BALANCE.baseFertility + crops * BALANCE.fertilityPerCrop + hospitals * BALANCE.fertilityPerHospital + houses * BALANCE.fertilityPerHouse + schools * BALANCE.fertilityPerSchool) / 100;
    const mortality = Math.min(BALANCE.maxMortality, Math.max(BALANCE.minMortality, BALANCE.baseMortality + hospitals * BALANCE.mortalityPerHospital + factories * BALANCE.mortalityPerFactory)) / 100;
    const newPopulation = Math.min(BALANCE.maxPopulation, Math.max(1, Math.floor(population + population * fertility - population * mortality)));
    setPopulation(newPopulation);
    
    // Score breakdown calculation
    const housingScore = Math.min(30, Math.floor((houses * 500) / Math.max(1, newPopulation / 100) / 3));
    const foodScore = Math.min(30, Math.floor(((fishingBoats + crops) * 500) / Math.max(1, newPopulation / 100) / 3));
    const welfareScore = Math.min(30, (schools + hospitals) * 5);
    const gdpScore = Math.min(30, Math.floor(income / 4));
    const totalScore = Math.min(100, housingScore + foodScore + welfareScore + gdpScore);
    
    setScoreBreakdown({ housing: housingScore, food: foodScore, welfare: welfareScore, gdp: gdpScore });
    setScore(totalScore);
    
    // Rebel spawning (low score = more rebels)
    // Authentic Utopia behavior: rebels destroy buildings on the tile
    let updatedTiles = [...tiles];
    if (totalScore < BALANCE.rebellionLowScore && Math.random() < 0.4) {
      // Spawn rebel on random non-fort-protected tile
      const fortPositions = tiles.filter(t => t.building === 'fort').map(t => t.position);
      const unprotectedTiles = tiles.filter(t => {
        if (t.hasRebel) return false;
        if (t.building === 'fort') return false; // Forts can't be rebelled
        // Check if within fort radius
        for (const fort of fortPositions) {
          if (Math.abs(t.position.x - fort.x) <= BALANCE.fortRadius && 
              Math.abs(t.position.y - fort.y) <= BALANCE.fortRadius) {
            return false;
          }
        }
        return true;
      });
      
      if (unprotectedTiles.length > 0) {
        const rebelTile = unprotectedTiles[Math.floor(Math.random() * unprotectedTiles.length)];
        const destroyedBuilding = rebelTile.building;
        updatedTiles = updatedTiles.map(t => 
          t.id === rebelTile.id ? { ...t, hasRebel: true, building: undefined } : t
        );
        Sounds.rebelAppear();
        if (destroyedBuilding) {
          const buildingName = BUILDINGS.find(b => b.type === destroyedBuilding)?.name || destroyedBuilding;
          showToast(`Rebels destroyed ${buildingName}!`, 'rebel');
        } else {
          showToast('Rebel appeared!', 'rebel');
        }
      }
    }
    
    // Clear rebels if score is high (stability)
    if (totalScore >= BALANCE.stabilityHighScore) {
      const rebelsCleared = updatedTiles.filter(t => t.hasRebel).length;
      if (rebelsCleared > 0) {
        updatedTiles = updatedTiles.map(t => ({ ...t, hasRebel: false }));
        Sounds.stabilityAchieved();
        showToast('Stability restored!', 'stability');
      }
    }
    
    setIsland({ ...island, tiles: updatedTiles });
    
    // Process AI round end
    processAIRoundEnd();
    
    // Check for game over
    if (round >= maxRounds) {
      // Determine winner: player vs AI
      const playerWins = totalScore > aiScore;
      const tie = totalScore === aiScore;
      if (playerWins || (tie && totalScore >= 70)) {
        Sounds.gameOverWin();
      } else {
        Sounds.gameOverLose();
      }
      setTimeout(() => setShowGameOver(true), 1500);
    } else {
      showToast(`+${income}g income`, 'gold');
    }
  };

  const isCoastalTile = (position: Position): boolean => {
    if (!island) return false;
    const tileSet = new Set(island.tiles.map(t => `${t.position.x},${t.position.y}`));
    for (const dir of [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]) {
      if (!tileSet.has(`${position.x + dir.x},${position.y + dir.y}`)) return true;
    }
    return false;
  };

  const findAdjacentWater = (position: Position): Position | null => {
    if (!island) return null;
    const tileSet = new Set(island.tiles.map(t => `${t.position.x},${t.position.y}`));
    for (const dir of [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]) {
      const newX = position.x + dir.x, newY = position.y + dir.y;
      if (newX >= 0 && newX < GRID_WIDTH && newY >= 0 && newY < GRID_HEIGHT && !tileSet.has(`${newX},${newY}`)) {
        if (!island.boats.find(b => b.position.x === newX && b.position.y === newY)) {
          return { x: newX, y: newY };
        }
      }
    }
    return null;
  };

  const handleTilePress = (position: Position, tile: Tile) => {
    Sounds.tileClick();
    
    if (selectedBoat) { 
      setSelectedBoat(null); 
      showToast('Boats move on water', 'error');
      return; 
    }
    if (tile.building) { 
      const b = BUILDINGS.find(b => b.type === tile.building);
      showToast(b?.name || '', 'build');
      return; 
    }
    if (tile.hasRebel) {
      showToast('Rebels occupy this tile!', 'rebel');
      return;
    }
    
    // During tutorial "tap_tile" step, allow building even before round starts
    if (isTutorialActive && tutorialStep?.id === 'tap_tile') {
      setSelectedTile(position);
      setShowBuildMenu(true);
      // Advance tutorial AFTER opening build menu
      onTutorialAction('tile_tapped');
      return;
    }
    
    if (round === 0) {
      showToast('Press START to begin', 'round');
      return;
    }
    if (!isRoundActive && round > 0 && round < maxRounds) { 
      showToast('Start next round', 'round'); 
      return; 
    }
    if (round >= maxRounds) {
      showToast('Game Over', 'round');
      return;
    }
    setSelectedTile(position);
    setShowBuildMenu(true);
  };

  // Handle tap on water for free-roam boat movement
  const handleWaterTap = (waterPosition: WaterPosition, screenX: number, screenY: number) => {
    if (!island || !coastline) return;
    
    // If a boat is selected, set its destination
    if (selectedBoat) {
      const boat = freeRoamBoats.find(b => b.id === selectedBoat);
      if (!boat) return;
      
      // Try to set the destination (will use pathfinding)
      const updatedBoat = setBoatDestination(boat, waterPosition, island);
      
      // Check if path was found (waypoints would be set)
      if (updatedBoat.waypoints.length === 0) {
        Sounds.buildError();
        showToast('No path', 'error');
        return;
      }
      
      Sounds.boatMove();
      setFreeRoamBoats(prev => prev.map(b => 
        b.id === selectedBoat ? updatedBoat : b
      ));
      setDestinationMarker(waterPosition);
      setSelectedBoat(null);
    }
  };

  // Handle tapping on a free-roam boat
  const handleBoatPress = (boat: FreeRoamBoatType) => {
    Sounds.boatSelect();
    if (selectedBoat === boat.id) {
      setSelectedBoat(null);
      setDestinationMarker(null);
    } else {
      setSelectedBoat(boat.id);
      setDestinationMarker(boat.destination);
    }
    setSelectedTile(null);
  };

  const handleSelectBuilding = (type: BuildingType) => {
    if (!island || !selectedTile) return;
    const building = BUILDINGS.find(b => b.type === type);
    if (!building || gold < building.cost) return;
    
    // Check if tile has rebel - can't build until rebel is cleared
    const tile = island.tiles.find(t => 
      t.position.x === selectedTile.x && t.position.y === selectedTile.y
    );
    if (tile?.hasRebel) {
      Sounds.buildError();
      showToast('Clear rebels first!', 'error');
      closeBuildMenu();
      return;
    }
    
    // Tutorial: notify that a building was selected
    if (isTutorialActive) {
      onTutorialAction('building_selected');
    }
    
    Sounds.buildPlace();
    setIsland({ ...island, tiles: island.tiles.map(tile => 
      tile.position.x === selectedTile.x && tile.position.y === selectedTile.y 
        ? { ...tile, building: type } 
        : tile
    )});
    setGold(gold - building.cost);
    setShowBuildMenu(false);
    setSelectedTile(null);
    showToast(`Built ${building.name}`, 'build');
  };

  const handleSelectBoat = (type: BoatType) => {
    if (!island || !selectedTile) return;
    const cost = BOAT_COSTS[type];
    if (gold < cost) { Sounds.buildError(); showToast('Need more gold', 'error'); closeBuildMenu(); return; }
    if (!isCoastalTile(selectedTile)) { Sounds.buildError(); showToast('Coast tiles only', 'error'); closeBuildMenu(); return; }
    
    // Create free-roam boat
    const newBoat = createFreeRoamBoat(
      `boat-${Date.now()}`,
      type,
      selectedTile,
      island
    );
    
    if (!newBoat) { 
      Sounds.buildError(); 
      showToast('No water nearby', 'error'); 
      closeBuildMenu(); 
      return; 
    }
    
    Sounds.buildPlace();
    setFreeRoamBoats(prev => [...prev, newBoat]);
    setGold(gold - cost);
    closeBuildMenu();
    showToast(`${type === 'fishing' ? 'Fishing boat' : 'PT boat'} launched`, 'build');
  };

  const closeBuildMenu = () => {
    Sounds.buttonClick();
    setShowBuildMenu(false);
    setSelectedTile(null);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const timerColor = !isRoundActive ? '#888' : timeRemaining <= 10 ? '#e53935' : timeRemaining <= 30 ? '#ffc107' : '#4ade80';

  const buildings = getAvailableBuildings(mode);

  // Tutorial element positions for spotlight effect
  const tutorialElementPositions = island ? {
    land_tile: {
      x: (screenWidth - GRID_WIDTH * tileSize) / 2 + island.tiles[Math.floor(island.tiles.length / 2)].position.x * tileSize,
      y: 60 + island.tiles[Math.floor(island.tiles.length / 2)].position.y * tileSize,
      width: tileSize,
      height: tileSize,
    },
    gold_display: {
      x: 10,
      y: 8,
      width: 80,
      height: 40,
    },
    timer: {
      x: screenWidth / 2 - 50,
      y: 8,
      width: 100,
      height: 44,
    },
    building_crops: {
      x: 20,
      y: screenHeight - 120,
      width: 60,
      height: 70,
    },
  } : {};

  // Show setup screen before game starts
  if (showSetup) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" hidden />
        <SetupScreen 
          onStartGame={startGameWithConfig}
          onOpenSettings={() => setShowSettings(true)}
        />
        <SettingsScreen 
          visible={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.resourcesRow}>
          <AnimatedResourceBar icon="💰" value={gold} color="#ffc107" />
          <AnimatedResourceBar icon="👥" value={population} color="#64b5f6" />
          <AnimatedResourceBar icon="⭐" value={score} maxValue={100} color="#4caf50" showBar />
        </View>
        
        <View style={styles.headerCenter}>
          {isRoundActive ? (
            <View style={styles.timerContainer}>
              <Text style={[styles.timer, { color: timerColor }]}>{formatTime(timeRemaining)}</Text>
              <View style={styles.timerBar}>
                <View style={[styles.timerFill, { 
                  width: `${(timeRemaining / roundDuration) * 100}%`,
                  backgroundColor: timerColor 
                }]} />
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.startBtn} onPress={startRound}>
              <Text style={styles.startBtnText}>
                {round === 0 ? '▶ START' : round >= maxRounds ? 'DONE' : '▶ NEXT'}
              </Text>
            </TouchableOpacity>
          )}
          <Text style={styles.roundText}>Round {round}/{maxRounds}</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={toggleAllAudio} 
            style={styles.resetButton}
          >
            <Text style={styles.newBtn}>{isAudioEnabled ? '🔊' : '🔇'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { Sounds.buttonClick(); setShowSettings(true); }} 
            style={styles.resetButton}
          >
            <Text style={styles.newBtn}>⚙️</Text>
          </TouchableOpacity>
          {round === 0 && (
            <TouchableOpacity 
              onPress={() => { Sounds.buttonClick(); initGame(); }} 
              style={styles.resetButton}
            >
              <Text style={styles.newBtn}>↻</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => { Sounds.buttonClick(); setShowQuitConfirm(true); }} 
            style={styles.resetButton}
          >
            <Text style={styles.newBtn}>🏠</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Toast Notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onHide={() => setToast(null)} 
        />
      )}
      
      {/* Map */}
      <View style={styles.mapArea}>
        {island && (
          <View style={styles.mapContainer}>
            <Island
              island={island}
              tileSize={tileSize}
              selectedTile={selectedTile}
              selectedBoatId={selectedBoat}
              onTilePress={handleTilePress}
              onWaterTap={handleWaterTap}
            >
              {/* Free-roam boats rendered as children */}
              {freeRoamBoats.map(boat => (
                <FreeRoamBoat
                  key={boat.id}
                  boat={boat}
                  tileSize={tileSize}
                  selected={selectedBoat === boat.id}
                  onPress={() => handleBoatPress(boat)}
                />
              ))}
              
              {/* Destination marker for selected boat */}
              {destinationMarker && selectedBoat && (
                <DestinationMarker
                  destination={destinationMarker}
                  tileSize={tileSize}
                />
              )}
            </Island>
          </View>
        )}
      </View>
      
      {/* Animated Build Menu */}
      <AnimatedBuildMenu
        visible={showBuildMenu}
        gold={gold}
        mode={mode}
        onSelectBuilding={handleSelectBuilding}
        onSelectBoat={handleSelectBoat}
        onClose={closeBuildMenu}
      />
      
      {/* Rain Cloud */}
      {rainCloud && (
        <RainCloud 
          size={tileSize}
          startX={rainCloud.startX}
          startY={rainCloud.startY}
          endX={rainCloud.endX}
          endY={rainCloud.endY}
          duration={rainCloud.duration}
          onComplete={() => setRainCloud(null)}
        />
      )}
      
      {/* Score Display - shown during gameplay */}
      {round > 0 && !showBuildMenu && !showGameOver && (
        <View style={styles.scoreDisplayContainer}>
          <ScoreDisplay 
            housing={scoreBreakdown.housing}
            food={scoreBreakdown.food}
            welfare={scoreBreakdown.welfare}
            gdp={scoreBreakdown.gdp}
            total={score}
          />
        </View>
      )}
      
      {/* AI Opponent Minimap */}
      <AIIslandMinimap
        island={aiIsland}
        score={aiScore}
        gold={aiGold}
        population={aiPopulation}
        difficulty={difficulty}
        visible={round > 0 && !showBuildMenu && !showGameOver}
        lastAction={lastAIAction}
      />
      
      {/* End Game Summary */}
      {showGameOver && island && (
        <EndGameSummary
          score={score}
          scoreBreakdown={scoreBreakdown}
          population={population}
          gold={gold}
          buildings={{
            houses: island.tiles.filter(t => t.building === 'house').length,
            farms: island.tiles.filter(t => t.building === 'farm').length,
            factories: island.tiles.filter(t => t.building === 'factory').length,
            schools: island.tiles.filter(t => t.building === 'school').length,
            hospitals: island.tiles.filter(t => t.building === 'hospital').length,
            forts: island.tiles.filter(t => t.building === 'fort').length,
          }}
          boats={{
            fishing: freeRoamBoats.filter(b => b.type === 'fishing').length,
            pt: freeRoamBoats.filter(b => b.type === 'pt').length,
          }}
          aiScore={aiScore}
          aiScoreBreakdown={aiScoreBreakdown}
          difficulty={difficulty}
          onPlayAgain={() => { initGame(); initializeAI(); }}
          onMainMenu={returnToSetup}
        />
      )}
      
      {/* Round Transition Animation */}
      {showRoundTransition && (
        <RoundTransition
          round={round}
          maxRounds={maxRounds}
          type={showRoundTransition}
          onComplete={onRoundTransitionComplete}
        />
      )}
      
      {/* Settings Screen */}
      <SettingsScreen 
        visible={showSettings} 
        onClose={() => setShowSettings(false)}
        onResetTutorial={handleReplayTutorial}
      />
      
      {/* Tutorial Overlay */}
      {isTutorialActive && tutorialStep && (
        <TutorialOverlay
          step={tutorialStep}
          stepIndex={tutorialStepIndex}
          totalSteps={tutorialTotalSteps}
          onNext={tutorialNextStep}
          onSkip={skipTutorial}
          elementPositions={tutorialElementPositions}
        />
      )}
      
      {/* Quit Confirmation Dialog */}
      {showQuitConfirm && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBackdrop} />
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>Quit Game?</Text>
            <Text style={styles.confirmMessage}>
              Your current game progress will be lost.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={styles.confirmCancelBtn}
                onPress={() => { Sounds.buttonClick(); setShowQuitConfirm(false); }}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmQuitBtn}
                onPress={() => { Sounds.buttonClick(); setShowQuitConfirm(false); returnToSetup(); }}
              >
                <Text style={styles.confirmQuitText}>Quit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a4c',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  resourcesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timer: {
    fontSize: 22,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  timerBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 2,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 2,
  },
  roundText: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  startBtn: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modeButton: {
    backgroundColor: 'rgba(255,193,7,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modeBtn: {
    color: '#ffc107',
    fontSize: 11,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newBtn: {
    color: '#aaa',
    fontSize: 18,
  },
  mapArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    position: 'relative',
  },
  boatsLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scoreDisplayContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    zIndex: 100,
  },
  // Menu styles - NO MODAL
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  menu: {
    backgroundColor: '#1a2530',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#2a3a4a',
    width: '95%',
    maxWidth: 700,
    maxHeight: '85%',
    zIndex: 1001,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3a4a',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  menuGold: {
    fontSize: 16,
    color: '#ffc107',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  menuContent: {
    flexDirection: 'row',
  },
  buildingsSection: {
    flex: 1,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#2a3a4a',
  },
  boatsSection: {
    width: 100,
    paddingLeft: 10,
  },
  sectionTitle: {
    fontSize: 10,
    color: '#888',
    marginBottom: 6,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '16%',
    backgroundColor: '#2a3a4a',
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
    marginRight: '0.5%',
    marginBottom: 6,
  },
  gridItemDisabled: {
    opacity: 0.4,
  },
  gridIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridName: {
    fontSize: 8,
    color: '#e0e0e0',
    marginTop: 2,
    textAlign: 'center',
  },
  gridCost: {
    fontSize: 10,
    color: '#ffc107',
    fontWeight: 'bold',
    marginTop: 1,
  },
  gridCostDisabled: {
    color: '#666',
  },
  boatRow: {
    flexDirection: 'column',
  },
  boatItem: {
    backgroundColor: '#2a3a4a',
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
    marginBottom: 6,
  },
  cancelBtn: {
    backgroundColor: '#3a4a5a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelText: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  confirmBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  confirmDialog: {
    backgroundColor: '#1a2a3a',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
    borderWidth: 2,
    borderColor: '#2a4a5a',
    alignItems: 'center',
    zIndex: 2001,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 15,
    color: '#88a4b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmCancelBtn: {
    flex: 1,
    backgroundColor: '#2a4a5a',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#88a4b8',
  },
  confirmQuitBtn: {
    flex: 1,
    backgroundColor: '#e53935',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmQuitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
