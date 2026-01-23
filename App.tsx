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
import { AnimatedBoat } from './src/components/game/AnimatedBoat';
import { generateIsland } from './src/services/islandGenerator';
import { findPath } from './src/services/boatPathfinding';
import { 
  Island as IslandType, 
  Position, 
  Tile, 
  BuildingType, 
  GameMode,
  Boat,
  BoatType,
} from './src/types';
import { BUILDINGS, BOAT_COSTS, BALANCE, GRID_WIDTH, GRID_HEIGHT, getAvailableBuildings } from './src/constants/game';

// Audio imports - simple system adapted from IJBA
import { initializeSounds, Sounds } from './src/services/soundManager';
import { loadAudioSettings, useAudioSettings } from './src/hooks/useAudioSettings';
import { SettingsScreen } from './src/components/settings/SettingsScreen';
import { SetupScreen, GameConfig } from './src/components/setup/SetupScreen';

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
  const [showRainCloud, setShowRainCloud] = useState(false);
  const [rainCloudY, setRainCloudY] = useState(50);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showRoundTransition, setShowRoundTransition] = useState<'start' | 'end' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSetup, setShowSetup] = useState(true); // Start on setup screen
  const [showQuitConfirm, setShowQuitConfirm] = useState(false); // Quit confirmation dialog
  const [boatPaths, setBoatPaths] = useState<Map<string, Position[]>>(new Map()); // Boat movement paths
  const [animationsEnabled, setAnimationsEnabled] = useState(true); // Toggle for animations
  
  // Audio settings hook
  const { isAudioEnabled, toggleAllAudio } = useAudioSettings();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const rainTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: 'gold' | 'population' | 'rebel' | 'rain' | 'round' | 'build' | 'error' | 'stability' = 'round') => {
    setToast({ message, type });
  };

  const initGame = useCallback(() => {
    const newIsland = generateIsland();
    setIsland(newIsland);
    setGold(BALANCE.startingGold);
    setPopulation(BALANCE.startingPopulation);
    setScore(50);
    setScoreBreakdown({ housing: 0, food: 0, welfare: 0, gdp: 0 });
    setRound(0);
    setTimeRemaining(roundDuration);
    setIsRoundActive(false);
    setSelectedTile(null);
    setSelectedBoat(null);
    setShowBuildMenu(false);
    setShowRainCloud(false);
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
    setGold(BALANCE.startingGold);
    setPopulation(BALANCE.startingPopulation);
    setScore(50);
    setScoreBreakdown({ housing: 0, food: 0, welfare: 0, gdp: 0 });
    setRound(0);
    setTimeRemaining(config.roundDuration);
    setIsRoundActive(false);
    setSelectedTile(null);
    setSelectedBoat(null);
    setShowBuildMenu(false);
    setShowRainCloud(false);
    setShowGameOver(false);
    setShowRoundTransition(null);
    setToast(null);
  }, []);

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
        if (Math.random() < 0.3) { // 30% chance each check
          setRainCloudY(50 + Math.random() * (GRID_HEIGHT * tileSize - 100));
          setShowRainCloud(true);
          Sounds.rainStorm();
          
          // Give gold for farms under rain
          if (island) {
            const farms = island.tiles.filter(t => t.building === 'farm').length;
            if (farms > 0) {
              setGold(g => g + farms);
              showToast(`+${farms}g from rain!`, 'rain');
            }
          }
        }
      };
      
      rainTimerRef.current = setInterval(spawnRain, 5000);
      return () => { if (rainTimerRef.current) clearInterval(rainTimerRef.current); };
    }
  }, [isRoundActive, island, tileSize]);

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
    setShowRainCloud(false);
    Sounds.roundEnd();
    if (!island) return;
    
    const tiles = island.tiles;
    const boats = island.boats;
    const factories = tiles.filter(t => t.building === 'factory').length;
    const schools = tiles.filter(t => t.building === 'school').length;
    const hospitals = tiles.filter(t => t.building === 'hospital').length;
    const fishingBoats = boats.filter(b => b.type === 'fishing').length;
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
    let updatedTiles = [...tiles];
    if (totalScore < BALANCE.rebellionLowScore && Math.random() < 0.4) {
      // Spawn rebel on random non-fort-protected tile
      const fortPositions = tiles.filter(t => t.building === 'fort').map(t => t.position);
      const unprotectedTiles = tiles.filter(t => {
        if (t.hasRebel) return false;
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
        updatedTiles = updatedTiles.map(t => 
          t.id === rebelTile.id ? { ...t, hasRebel: true } : t
        );
        Sounds.rebelAppear();
        showToast('Rebel appeared!', 'rebel');
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
    
    // Check for game over
    if (round >= maxRounds) {
      if (totalScore >= 70) {
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

  const handleWaterPress = (position: Position) => {
    if (!island || !selectedBoat) return;
    
    const boat = island.boats.find(b => b.id === selectedBoat);
    if (!boat) return;
    
    // Check if destination is valid water
    const tileSet = new Set(island.tiles.map(t => `${t.position.x},${t.position.y}`));
    if (tileSet.has(`${position.x},${position.y}`)) return;
    
    // Check if destination is occupied by another boat
    if (island.boats.find(b => b.id !== selectedBoat && b.position.x === position.x && b.position.y === position.y)) {
      Sounds.buildError();
      showToast('Occupied', 'error');
      return;
    }
    
    // Find path using BFS
    const path = findPath(boat.position, position, island, boat.id);
    
    if (!path || path.length === 0) {
      Sounds.buildError();
      showToast('No path', 'error');
      return;
    }
    
    // Start animated movement
    Sounds.boatMove();
    setBoatPaths(prev => new Map(prev).set(boat.id, path));
    setSelectedBoat(null);
  };

  // Handle boat movement updates during animation
  const handleBoatMoveComplete = useCallback((boatId: string, newPosition: Position) => {
    setIsland(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        boats: prev.boats.map(b => 
          b.id === boatId ? { ...b, position: newPosition } : b
        ),
      };
    });
  }, []);

  // Handle when boat finishes entire path
  const handleBoatPathComplete = useCallback((boatId: string) => {
    setBoatPaths(prev => {
      const next = new Map(prev);
      next.delete(boatId);
      return next;
    });
  }, []);

  const handleBoatPress = (boat: Boat) => {
    Sounds.boatSelect();
    setSelectedBoat(selectedBoat === boat.id ? null : boat.id);
    setSelectedTile(null);
  };

  const handleSelectBuilding = (type: BuildingType) => {
    if (!island || !selectedTile) return;
    const building = BUILDINGS.find(b => b.type === type);
    if (!building || gold < building.cost) return;
    
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
    
    const spawnPos = findAdjacentWater(selectedTile);
    if (!spawnPos) { Sounds.buildError(); showToast('No water nearby', 'error'); closeBuildMenu(); return; }
    
    Sounds.buildPlace();
    setIsland({ 
      ...island, 
      boats: [...island.boats, { 
        id: `boat-${Date.now()}`, 
        type, 
        position: spawnPos, 
        owner: 'player', 
        isMoving: false, 
        destination: null 
      }] 
    });
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
              selectedBoat={selectedBoat}
              animationsEnabled={animationsEnabled}
              onTilePress={handleTilePress}
              onWaterPress={handleWaterPress}
              onBoatPress={handleBoatPress}
            />
            
            {/* Animated Boats Layer */}
            <View style={styles.boatsLayer} pointerEvents="box-none">
              {island.boats.map(boat => (
                <AnimatedBoat
                  key={boat.id}
                  boat={boat}
                  tileSize={tileSize}
                  selected={selectedBoat === boat.id}
                  path={boatPaths.get(boat.id) || null}
                  onPress={() => handleBoatPress(boat)}
                  onMoveComplete={handleBoatMoveComplete}
                  onPathComplete={handleBoatPathComplete}
                />
              ))}
            </View>
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
      {showRainCloud && (
        <RainCloud 
          size={tileSize}
          startX={-100}
          y={rainCloudY}
          duration={8000}
          onComplete={() => setShowRainCloud(false)}
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
      
      {/* End Game Summary */}
      {showGameOver && island && (
        <EndGameSummary
          score={score}
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
            fishing: island.boats.filter(b => b.type === 'fishing').length,
            pt: island.boats.filter(b => b.type === 'pt').length,
          }}
          onPlayAgain={initGame}
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
      />
      
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
