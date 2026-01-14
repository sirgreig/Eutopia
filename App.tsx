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
  FishingBoatIcon,
  PTBoatIcon,
  ConstructionIcon,
} from './src/components/game/Icons';
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

const MENU_ICON_SIZE = 32;

const MenuBuildingIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'house': return <HouseIcon size={MENU_ICON_SIZE} />;
    case 'farm': return <FarmIcon size={MENU_ICON_SIZE} />;
    case 'factory': return <FactoryIcon size={MENU_ICON_SIZE} />;
    case 'hospital': return <HospitalIcon size={MENU_ICON_SIZE} />;
    case 'school': return <SchoolIcon size={MENU_ICON_SIZE} />;
    case 'fort': return <FortIcon size={MENU_ICON_SIZE} />;
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
  const [mode, setMode] = useState<GameMode>('original');
  const [round, setRound] = useState(0);
  const [maxRounds] = useState(15);
  const [timeRemaining, setTimeRemaining] = useState(BALANCE.defaultRoundDuration);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [selectedTile, setSelectedTile] = useState<Position | null>(null);
  const [selectedBoat, setSelectedBoat] = useState<string | null>(null);
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [message, setMessage] = useState<string>('Tap START');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const initGame = useCallback(() => {
    const newIsland = generateIsland();
    setIsland(newIsland);
    setGold(BALANCE.startingGold);
    setPopulation(BALANCE.startingPopulation);
    setScore(50);
    setRound(0);
    setTimeRemaining(BALANCE.defaultRoundDuration);
    setIsRoundActive(false);
    setSelectedTile(null);
    setSelectedBoat(null);
    setShowBuildMenu(false);
    setMessage('Tap START');
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  useEffect(() => {
    if (isRoundActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => setTimeRemaining(t => t - 1), 1000);
    } else if (isRoundActive && timeRemaining === 0) {
      endRound();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isRoundActive, timeRemaining]);

  const startRound = () => {
    if (round >= maxRounds) return;
    setRound(r => r + 1);
    setTimeRemaining(BALANCE.defaultRoundDuration);
    setIsRoundActive(true);
    showMsg(`Round ${round + 1}`);
  };

  const endRound = () => {
    setIsRoundActive(false);
    if (!island) return;
    
    const tiles = island.tiles;
    const boats = island.boats;
    const factories = tiles.filter(t => t.building === 'factory').length;
    const schools = tiles.filter(t => t.building === 'school').length;
    const hospitals = tiles.filter(t => t.building === 'hospital').length;
    const fishingBoats = boats.filter(b => b.type === 'fishing').length;
    const crops = tiles.filter(t => t.building === 'farm').length;
    const houses = tiles.filter(t => t.building === 'house').length;
    
    const productivity = Math.min(BALANCE.maxProductivityBonus, (schools + hospitals) * factories + hospitals);
    const income = BALANCE.baseRoundIncome + factories * BALANCE.factoryIncome + fishingBoats * BALANCE.fishingBoatIncome + productivity;
    setGold(g => g + income);
    
    const fertility = Math.max(BALANCE.minFertility, BALANCE.baseFertility + crops * BALANCE.fertilityPerCrop + hospitals * BALANCE.fertilityPerHospital + houses * BALANCE.fertilityPerHouse + schools * BALANCE.fertilityPerSchool) / 100;
    const mortality = Math.min(BALANCE.maxMortality, Math.max(BALANCE.minMortality, BALANCE.baseMortality + hospitals * BALANCE.mortalityPerHospital + factories * BALANCE.mortalityPerFactory)) / 100;
    setPopulation(pop => Math.min(BALANCE.maxPopulation, Math.max(1, Math.floor(pop + pop * fertility - pop * mortality))));
    
    showMsg(`+${income}g`);
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
    if (selectedBoat) { 
      setSelectedBoat(null); 
      showMsg('Boats move on water');
      return; 
    }
    if (tile.building) { 
      const b = BUILDINGS.find(b => b.type === tile.building);
      showMsg(b?.name || '');
      return; 
    }
    if (!isRoundActive && round > 0 && round < maxRounds) { 
      showMsg('Start next round'); 
      return; 
    }
    if (round >= maxRounds) {
      showMsg('Game Over');
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
      showMsg('Occupied');
      return;
    }
    
    setIsland({ ...island, boats: island.boats.map(b => b.id === selectedBoat ? { ...b, position } : b) });
    setSelectedBoat(null);
    showMsg('Moved');
  };

  const handleBoatPress = (boat: Boat) => {
    setSelectedBoat(selectedBoat === boat.id ? null : boat.id);
    setSelectedTile(null);
    showMsg(boat.type === 'fishing' ? 'Fishing boat' : 'PT boat');
  };

  const handleSelectBuilding = (type: BuildingType) => {
    if (!island || !selectedTile) return;
    const building = BUILDINGS.find(b => b.type === type);
    if (!building || gold < building.cost) return;
    
    setIsland({ ...island, tiles: island.tiles.map(tile => 
      tile.position.x === selectedTile.x && tile.position.y === selectedTile.y 
        ? { ...tile, building: type } 
        : tile
    )});
    setGold(gold - building.cost);
    setShowBuildMenu(false);
    setSelectedTile(null);
    showMsg(`Built ${building.name}`);
  };

  const handleSelectBoat = (type: BoatType) => {
    if (!island || !selectedTile) return;
    const cost = BOAT_COSTS[type];
    if (gold < cost) { showMsg('Need more gold'); closeBuildMenu(); return; }
    if (!isCoastalTile(selectedTile)) { showMsg('Coast tiles only'); closeBuildMenu(); return; }
    
    const spawnPos = findAdjacentWater(selectedTile);
    if (!spawnPos) { showMsg('No water nearby'); closeBuildMenu(); return; }
    
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
    showMsg(`${type === 'fishing' ? 'Fishing boat' : 'PT boat'} launched`);
  };

  const closeBuildMenu = () => {
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
        <View style={styles.stats}>
          <Text style={styles.gold}>💰 {gold}</Text>
          <Text style={styles.stat}>👥 {population.toLocaleString()}</Text>
          <Text style={styles.stat}>⭐ {score}</Text>
        </View>
        
        <View style={styles.headerCenter}>
          {isRoundActive ? (
            <Text style={[styles.timer, { color: timerColor }]}>{formatTime(timeRemaining)}</Text>
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
          <TouchableOpacity onPress={() => setMode(mode === 'original' ? 'enhanced' : 'original')}>
            <Text style={styles.modeBtn}>{mode === 'original' ? 'OG' : 'ENH'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={initGame}>
            <Text style={styles.newBtn}>↻</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Message */}
      {message ? (
        <View style={styles.msgBar}>
          <Text style={styles.msgText}>{message}</Text>
        </View>
      ) : null}
      
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
      
      {/* Build Menu - NO MODAL, just an overlay View */}
      {showBuildMenu && (
        <View style={styles.menuOverlay}>
          <Pressable style={styles.menuBackdrop} onPress={closeBuildMenu} />
          <View style={styles.menu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>BUILD</Text>
              <Text style={styles.menuGold}>💰 {gold}</Text>
            </View>
            
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
            
            <TouchableOpacity style={styles.cancelBtn} onPress={closeBuildMenu} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
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
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  gold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffc107',
  },
  stat: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  roundText: {
    fontSize: 10,
    color: '#888',
  },
  startBtn: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  startBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modeBtn: {
    color: '#ffc107',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newBtn: {
    color: '#888',
    fontSize: 20,
  },
  msgBar: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  msgText: {
    color: '#fff',
    fontSize: 13,
  },
  mapArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 16,
    borderWidth: 2,
    borderColor: '#2a3a4a',
    width: '85%',
    maxWidth: 380,
    zIndex: 1001,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  menuGold: {
    fontSize: 16,
    color: '#ffc107',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 11,
    color: '#888',
    marginTop: 8,
    marginBottom: 8,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '31%',
    backgroundColor: '#2a3a4a',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginRight: '2%',
    marginBottom: 8,
  },
  gridItemDisabled: {
    opacity: 0.4,
  },
  gridIconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridName: {
    fontSize: 10,
    color: '#e0e0e0',
    marginTop: 2,
    textAlign: 'center',
  },
  gridCost: {
    fontSize: 12,
    color: '#ffc107',
    fontWeight: 'bold',
    marginTop: 2,
  },
  gridCostDisabled: {
    color: '#666',
  },
  boatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boatItem: {
    width: '48%',
    backgroundColor: '#2a3a4a',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#2a3a4a',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#888',
    fontSize: 14,
  },
});
