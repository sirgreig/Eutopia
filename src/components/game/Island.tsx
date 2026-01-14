import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import Svg, { Rect, Path, Defs, LinearGradient, Stop, Pattern, Circle } from 'react-native-svg';
import { Island as IslandType, Position, Tile, Boat } from '../../types/game';
import { GRID_WIDTH, GRID_HEIGHT } from '../../constants/game';
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
} from './Icons';
import { RebelIcon } from './RebelIcon';

interface IslandProps {
  island: IslandType;
  tileSize?: number;
  selectedTile?: Position | null;
  selectedBoat?: string | null;
  onTilePress?: (position: Position, tile: Tile) => void;
  onWaterPress?: (position: Position) => void;
  onBoatPress?: (boat: Boat) => void;
}

const BuildingIcon = ({ type, size }: { type: string; size: number }) => {
  const iconSize = size * 0.8;
  switch (type) {
    case 'house': return <HouseIcon size={iconSize} />;
    case 'farm': return <FarmIcon size={iconSize} />;
    case 'factory': return <FactoryIcon size={iconSize} />;
    case 'hospital': return <HospitalIcon size={iconSize} />;
    case 'school': return <SchoolIcon size={iconSize} />;
    case 'fort': return <FortIcon size={iconSize} />;
    case 'apartment': return <ApartmentIcon size={iconSize} />;
    case 'dock': return <DockIcon size={iconSize} />;
    case 'lighthouse': return <LighthouseIcon size={iconSize} />;
    case 'granary': return <GranaryIcon size={iconSize} />;
    case 'marketplace': return <MarketplaceIcon size={iconSize} />;
    case 'watchtower': return <WatchtowerIcon size={iconSize} />;
    default: return <ConstructionIcon size={iconSize} />;
  }
};

const BoatIconWrapper = ({ type, size }: { type: string; size: number }) => {
  const iconSize = size * 0.85;
  switch (type) {
    case 'fishing': return <FishingBoatIcon size={iconSize} />;
    case 'pt': return <PTBoatIcon size={iconSize} />;
    default: return <FishingBoatIcon size={iconSize} />;
  }
};

// Animated water tile component
const WaterTile = ({ size, isCoastal, coastalEdges }: { 
  size: number; 
  isCoastal: boolean;
  coastalEdges: { top: boolean; bottom: boolean; left: boolean; right: boolean };
}) => {
  const waveAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 3000 + Math.random() * 1000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: false,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const waveOffset = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 3, 0],
  });

  return (
    <Animated.View style={{ transform: [{ translateY: waveOffset }] }}>
      <Svg width={size - 2} height={size - 2} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3d7a9e" />
            <Stop offset="50%" stopColor="#2d6a8e" />
            <Stop offset="100%" stopColor="#1d5a7e" />
          </LinearGradient>
          <LinearGradient id="shallowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#4a9ebe" />
            <Stop offset="100%" stopColor="#3d8aae" />
          </LinearGradient>
        </Defs>
        
        {/* Base water */}
        <Rect x="0" y="0" width="100" height="100" fill={isCoastal ? "url(#shallowGrad)" : "url(#waterGrad)"} rx="4" />
        
        {/* Wave lines */}
        <Path 
          d="M10,30 Q25,25 40,30 T70,30 T100,30" 
          stroke="rgba(255,255,255,0.15)" 
          strokeWidth="2" 
          fill="none" 
        />
        <Path 
          d="M0,55 Q15,50 30,55 T60,55 T90,55" 
          stroke="rgba(255,255,255,0.12)" 
          strokeWidth="2" 
          fill="none" 
        />
        <Path 
          d="M10,80 Q25,75 40,80 T70,80 T100,80" 
          stroke="rgba(255,255,255,0.1)" 
          strokeWidth="2" 
          fill="none" 
        />
        
        {/* Coastal foam/sand edges */}
        {isCoastal && coastalEdges.top && (
          <Path d="M0,0 Q25,8 50,5 T100,0 L100,0 L0,0 Z" fill="rgba(255,255,255,0.2)" />
        )}
        {isCoastal && coastalEdges.bottom && (
          <Path d="M0,100 Q25,92 50,95 T100,100 L100,100 L0,100 Z" fill="rgba(255,255,255,0.2)" />
        )}
        {isCoastal && coastalEdges.left && (
          <Path d="M0,0 Q8,25 5,50 T0,100 L0,100 L0,0 Z" fill="rgba(255,255,255,0.2)" />
        )}
        {isCoastal && coastalEdges.right && (
          <Path d="M100,0 Q92,25 95,50 T100,100 L100,100 L100,0 Z" fill="rgba(255,255,255,0.2)" />
        )}
        
        {/* Sparkle highlights */}
        <Circle cx="25" cy="40" r="2" fill="rgba(255,255,255,0.3)" />
        <Circle cx="70" cy="65" r="1.5" fill="rgba(255,255,255,0.25)" />
        <Circle cx="85" cy="25" r="1" fill="rgba(255,255,255,0.2)" />
      </Svg>
    </Animated.View>
  );
};

// Land tile with texture
const LandTile = ({ size, isCoastal, coastalEdges }: { 
  size: number; 
  isCoastal: boolean;
  coastalEdges: { top: boolean; bottom: boolean; left: boolean; right: boolean };
}) => {
  return (
    <Svg width={size - 2} height={size - 2} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#6a9f5a" />
          <Stop offset="50%" stopColor="#5a8f4a" />
          <Stop offset="100%" stopColor="#4a7f3a" />
        </LinearGradient>
        <LinearGradient id="coastalLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#7aaf6a" />
          <Stop offset="100%" stopColor="#5a9f4a" />
        </LinearGradient>
      </Defs>
      
      {/* Base land */}
      <Rect 
        x="0" y="0" 
        width="100" height="100" 
        fill={isCoastal ? "url(#coastalLandGrad)" : "url(#landGrad)"} 
        rx="4" 
      />
      
      {/* Grass texture dots */}
      <Circle cx="15" cy="20" r="3" fill="rgba(90,160,70,0.5)" />
      <Circle cx="45" cy="15" r="2" fill="rgba(90,160,70,0.4)" />
      <Circle cx="75" cy="25" r="2.5" fill="rgba(90,160,70,0.45)" />
      <Circle cx="25" cy="50" r="2" fill="rgba(90,160,70,0.4)" />
      <Circle cx="60" cy="45" r="3" fill="rgba(90,160,70,0.5)" />
      <Circle cx="85" cy="55" r="2" fill="rgba(90,160,70,0.35)" />
      <Circle cx="20" cy="80" r="2.5" fill="rgba(90,160,70,0.45)" />
      <Circle cx="50" cy="75" r="2" fill="rgba(90,160,70,0.4)" />
      <Circle cx="80" cy="85" r="3" fill="rgba(90,160,70,0.5)" />
      
      {/* Sandy beach edges for coastal tiles */}
      {isCoastal && coastalEdges.top && (
        <Path d="M0,0 L100,0 L100,12 Q75,8 50,10 T0,12 Z" fill="#c2b280" opacity="0.6" />
      )}
      {isCoastal && coastalEdges.bottom && (
        <Path d="M0,100 L100,100 L100,88 Q75,92 50,90 T0,88 Z" fill="#c2b280" opacity="0.6" />
      )}
      {isCoastal && coastalEdges.left && (
        <Path d="M0,0 L0,100 L12,100 Q8,75 10,50 T12,0 Z" fill="#c2b280" opacity="0.6" />
      )}
      {isCoastal && coastalEdges.right && (
        <Path d="M100,0 L100,100 L88,100 Q92,75 90,50 T88,0 Z" fill="#c2b280" opacity="0.6" />
      )}
      
      {/* Subtle shadow/depth */}
      <Rect x="0" y="0" width="100" height="100" fill="url(#landGrad)" opacity="0" rx="4" />
    </Svg>
  );
};

export function Island({ 
  island, 
  tileSize = 48, 
  selectedTile,
  selectedBoat,
  onTilePress,
  onWaterPress,
  onBoatPress,
}: IslandProps) {
  const width = GRID_WIDTH * tileSize;
  const height = GRID_HEIGHT * tileSize;
  
  // Create lookup for quick tile access
  const tileMap = new Map<string, Tile>();
  island.tiles.forEach(tile => {
    tileMap.set(`${tile.position.x},${tile.position.y}`, tile);
  });
  
  const isLand = (x: number, y: number) => tileMap.has(`${x},${y}`);
  
  const getCoastalEdges = (x: number, y: number, forLand: boolean) => {
    if (forLand) {
      // For land tiles: edges where water is adjacent
      return {
        top: !isLand(x, y - 1),
        bottom: !isLand(x, y + 1),
        left: !isLand(x - 1, y),
        right: !isLand(x + 1, y),
      };
    } else {
      // For water tiles: edges where land is adjacent
      return {
        top: isLand(x, y - 1),
        bottom: isLand(x, y + 1),
        left: isLand(x - 1, y),
        right: isLand(x + 1, y),
      };
    }
  };
  
  const isSelected = (x: number, y: number) => 
    selectedTile?.x === x && selectedTile?.y === y;

  // Generate all grid cells
  const gridCells = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const tile = tileMap.get(`${x},${y}`);
      const selected = isSelected(x, y);
      const boatHere = island.boats.find(b => b.position.x === x && b.position.y === y);
      const isBoatSelected = boatHere && selectedBoat === boatHere.id;
      
      const coastalEdges = getCoastalEdges(x, y, !!tile);
      const isCoastal = Object.values(coastalEdges).some(v => v);
      
      gridCells.push(
        <Pressable
          key={`cell-${x}-${y}`}
          style={[
            styles.cell,
            { 
              left: x * tileSize, 
              top: y * tileSize, 
              width: tileSize - 2, 
              height: tileSize - 2,
            },
            selected && styles.selectedCell,
            isBoatSelected && styles.selectedBoatCell,
          ]}
          onPress={() => {
            if (boatHere) {
              onBoatPress?.(boatHere);
            } else if (tile) {
              onTilePress?.(tile.position, tile);
            } else {
              onWaterPress?.({ x, y });
            }
          }}
        >
          {tile ? (
            <>
              <LandTile size={tileSize} isCoastal={isCoastal} coastalEdges={coastalEdges} />
              {tile.building && (
                <View style={styles.buildingOverlay}>
                  <BuildingIcon type={tile.building} size={tileSize} />
                </View>
              )}
              {tile.hasRebel && (
                <View style={styles.rebelOverlay}>
                  <RebelIcon size={tileSize * 0.5} />
                </View>
              )}
            </>
          ) : (
            <>
              <WaterTile size={tileSize} isCoastal={isCoastal} coastalEdges={coastalEdges} />
              {boatHere && (
                <View style={styles.boatOverlay}>
                  <BoatIconWrapper type={boatHere.type} size={tileSize} />
                </View>
              )}
            </>
          )}
        </Pressable>
      );
    }
  }

  return (
    <View style={[styles.container, { width, height }]}>
      {gridCells}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#1a4a6a',
  },
  cell: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    overflow: 'hidden',
    borderRadius: 4,
  },
  selectedCell: {
    borderWidth: 3,
    borderColor: '#4caf50',
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  selectedBoatCell: {
    borderWidth: 3,
    borderColor: '#ffc107',
    shadowColor: '#ffc107',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  buildingOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rebelOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  boatOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
