import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Island } from './src/components';
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
import { ResourceBar } from './src/components/game/ResourceBar';
import { generateIsland } from './src/services/islandGenerator';
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

// Audio imports
import AudioManager from './src/services/AudioManager';
import { playButtonTap, playSound } from './src/hooks/useAudio';
import { AudioSettingsModal } from './src/components/settings/AudioSettingsModal';
import { SOUND_KEYS } from './src/config/audioSettings';

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
  const [maxRounds] = useState(15);
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
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  
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
    setTimeRemaining(BALANCE.defaultRoundDuration);
    setIsRoundActive(false);
    setSelectedTile(null);
    setSelectedBoat(null);
    setShowBuildMenu(false);
    setShowRainCloud(false);
    setShowGameOver(false);
    setShowRoundTransition(null);
    setToast(null);
  }, []);

  // Initialize audio and game on mount
  useEffect(() => { 
    AudioManager.initialize();
    initGame(); 
  }, [initGame]);

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
    playButtonTap();
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
      setTimeRemaining(BALANCE.defaultRoundDuration);
      setIsRoundActive(true);
    } else if (showRoundTransition === 'end') {
      setShowRoundTransition(null);
    }
  };

  const endRound = () => {
    setIsRoundActive(false);
    setShowRainCloud(false);
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
        showToast('Rebel appeared!', 'rebel');
      }
    }
    
    // Clear rebels if score is high (stability)
    if (totalScore >= BALANCE.stabilityHighScore) {
      const rebelsCleared = updatedTiles.filter(t => t.hasRebel).length;
      if (rebelsCleared > 0) {
        updatedTiles = updatedTiles.map(t => ({ ...t, hasRebel: false }));
        showToast('Stability restored!', 'stability');
      }
    }
    
    setIsland({ ...island, tiles: updatedTiles });
    
    // Check for game over
    if (round >= maxRounds) {
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
    playSound(SOUND_KEYS.TILE_TAP);
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
    
    const tileSet = new Set(island.tiles.map(t => `${t.position.x},${t.position.y}`));
    if (tileSet.has(`${position.x},${position.y}`)) return;
    if (island.boats.find(b => b.id !== selectedBoat && b.position.x === position.x && b.position.y === position.y)) {
      showToast('Occupied', 'error');
      return;
    }
    
    playSound(SOUND_KEYS.BOAT_MOVE);
    setIsland({ ...island, boats: island.boats.map(b => b.id === selectedBoat ? { ...b, position } : b) });
    setSelectedBoat(null);
  };

  const handleBoatPress = (boat: Boat) => {
    playSound(SOUND_KEYS.BOAT_SELECT);
    setSelectedBoat(selectedBoat === boat.id ? null : boat.id);
    setSelectedTile(null);
  };

  const handleSelectBuilding = (type: BuildingType) => {
    if (!island || !selectedTile) return;
    const building = BUILDINGS.find(b => b.type === type);
    if (!building || gold < building.cost) return;
    
    playButtonTap();
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
    if (gold < cost) { showToast('Need more gold', 'error'); closeBuildMenu(); return; }
    if (!isCoastalTile(selectedTile)) { showToast('Coast tiles only', 'error'); closeBuildMenu(); return; }
    
    const spawnPos = findAdjacentWater(selectedTile);
    if (!spawnPos) { showToast('No water nearby', 'error'); closeBuildMenu(); return; }
    
    playButtonTap();
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
    playButtonTap();
    setShowBuildMenu(false);
    setSelectedTile(null);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const timerColor = !isRoundActive ? '#888' : timeRemaining <= 10 ? '#e53935' : timeRemaining <= 30 ? '#ffc107' : '#4ade80';

  const buildings = getAvailableBuildings(mode);

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.resourcesRow}>
          <ResourceBar icon="💰" value={gold} color="#ffc107" />
          <ResourceBar icon="👥" value={population} color="#64b5f6" />
          <ResourceBar icon="⭐" value={score} maxValue={100} color="#4caf50" showBar />
        </View>
        
        <View style={styles.headerCenter}>
          {isRoundActive ? (
            <View style={styles.timerContainer}>
              <Text style={[styles.timer, { color: timerColor }]}>{formatTime(timeRemaining)}</Text>
              <View style={styles.timerBar}>
                <View style={[styles.timerFill, { 
                  width: `${(timeRemaining / BALANCE.defaultRoundDuration) * 100}%`,
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
            onPress={() => { playButtonTap(); setMode(mode === 'original' ? 'enhanced' : 'original'); }} 
            style={styles.modeButton}
          >
            <Text style={styles.modeBtn}>{mode === 'original' ? 'OG' : 'ENH'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { playButtonTap(); setShowAudioSettings(true); }} 
            style={styles.resetButton}
          >
            <Text style={styles.newBtn}>🔊</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { playButtonTap(); initGame(); }} 
            style={styles.resetButton}
          >
            <Text style={styles.newBtn}>↻</Text>
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
          <Island
            island={island}
            tileSize={tileSize}
            selectedTile={selectedTile}
            selectedBoat={selectedBoat}
            onTilePress={handleTilePress}
            onWaterPress={handleWaterPress}
            onBoatPress={handleBoatPress}
          />
        )}
      </View>
      
      {/* Build Menu - Wide horizontal layout */}
      {showBuildMenu && (
        <View style={styles.menuOverlay}>
          <Pressable style={styles.menuBackdrop} onPress={closeBuildMenu} />
          <View style={styles.menu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>BUILD</Text>
              <Text style={styles.menuGold}>💰 {gold}</Text>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeBuildMenu} activeOpacity={0.7}>
                <Text style={styles.cancelText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.menuContent}>
              <View style={styles.buildingsSection}>
                <Text style={styles.sectionTitle}>BUILDINGS</Text>
                <View style={styles.grid}>
                  {buildings.map((b) => (
                    <TouchableOpacity
                      key={b.type}
                      style={[styles.gridItem, gold < b.cost && styles.gridItemDisabled]}
                      onPress={() => gold >= b.cost && handleSelectBuilding(b.type)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.gridIconContainer}>
                        <MenuBuildingIcon type={b.type} />
                      </View>
                      <Text style={styles.gridName}>{b.name}</Text>
                      <Text style={[styles.gridCost, gold < b.cost && styles.gridCostDisabled]}>{b.cost}g</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.boatsSection}>
                <Text style={styles.sectionTitle}>BOATS</Text>
                <View style={styles.boatRow}>
                  <TouchableOpacity
                    style={[styles.boatItem, gold < BOAT_COSTS.fishing && styles.gridItemDisabled]}
                    onPress={() => gold >= BOAT_COSTS.fishing && handleSelectBoat('fishing')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.gridIconContainer}>
                      <FishingBoatIcon size={MENU_ICON_SIZE} />
                    </View>
                    <Text style={styles.gridName}>Fishing</Text>
                    <Text style={[styles.gridCost, gold < BOAT_COSTS.fishing && styles.gridCostDisabled]}>{BOAT_COSTS.fishing}g</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.boatItem, gold < BOAT_COSTS.pt && styles.gridItemDisabled]}
                    onPress={() => gold >= BOAT_COSTS.pt && handleSelectBoat('pt')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.gridIconContainer}>
                      <PTBoatIcon size={MENU_ICON_SIZE} />
                    </View>
                    <Text style={styles.gridName}>PT Boat</Text>
                    <Text style={[styles.gridCost, gold < BOAT_COSTS.pt && styles.gridCostDisabled]}>{BOAT_COSTS.pt}g</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
      
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
      
      {/* Audio Settings Modal */}
      <AudioSettingsModal 
        visible={showAudioSettings} 
        onClose={() => setShowAudioSettings(false)} 
      />
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
});
