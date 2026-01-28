// src/components/game/Island.tsx
// Main island map component with animated buildings and boats

import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop, G, Circle, Ellipse, Path } from 'react-native-svg';
import { Island as IslandType, Position, Tile, Boat } from '../../types';
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
} from './Icons';
import { Sounds } from '../../services/soundManager';

interface IslandProps {
  island: IslandType;
  tileSize: number;
  selectedTile: Position | null;
  selectedBoat: string | null;
  animationsEnabled?: boolean;
  onTilePress: (position: Position, tile: Tile) => void;
  onWaterPress: (position: Position) => void;
  onBoatPress: (boat: Boat) => void;
}

// Building icon component - all use consistent Icons.tsx
const BuildingIcon = ({ type, size }: { type: string; size: number }) => {
  const iconSize = size * 0.85;
  
  switch (type) {
    case 'house':
      return <HouseIcon size={iconSize} />;
    case 'factory':
      return <FactoryIcon size={iconSize} />;
    case 'farm':
      return <FarmIcon size={iconSize} />;
    case 'hospital':
      return <HospitalIcon size={iconSize} />;
    case 'school':
      return <SchoolIcon size={iconSize} />;
    case 'fort':
      return <FortIcon size={iconSize} />;
    case 'apartment':
      return <ApartmentIcon size={iconSize} />;
    case 'dock':
      return <DockIcon size={iconSize} />;
    case 'lighthouse':
      return <LighthouseIcon size={iconSize} />;
    case 'granary':
      return <GranaryIcon size={iconSize} />;
    case 'marketplace':
      return <MarketplaceIcon size={iconSize} />;
    case 'watchtower':
      return <WatchtowerIcon size={iconSize} />;
    default:
      return null;
  }
};

export const Island: React.FC<IslandProps> = ({
  island,
  tileSize,
  selectedTile,
  selectedBoat,
  animationsEnabled = true,
  onTilePress,
  onWaterPress,
  onBoatPress,
}) => {
  const width = GRID_WIDTH * tileSize;
  const height = GRID_HEIGHT * tileSize;
  
  // Create tile lookup map for efficiency
  const tileMap = useMemo(() => {
    const map = new Map<string, Tile>();
    island.tiles.forEach(tile => {
      map.set(`${tile.position.x},${tile.position.y}`, tile);
    });
    return map;
  }, [island.tiles]);
  
  // Create boat lookup map
  const boatMap = useMemo(() => {
    const map = new Map<string, Boat>();
    island.boats.forEach(boat => {
      map.set(`${boat.position.x},${boat.position.y}`, boat);
    });
    return map;
  }, [island.boats]);
  
  const isLand = (x: number, y: number) => tileMap.has(`${x},${y}`);
  
  const getCoastalEdges = (x: number, y: number) => ({
    top: y > 0 && !isLand(x, y - 1),
    bottom: y < GRID_HEIGHT - 1 && !isLand(x, y + 1),
    left: x > 0 && !isLand(x - 1, y),
    right: x < GRID_WIDTH - 1 && !isLand(x + 1, y),
  });
  
  const handleCellPress = (x: number, y: number) => {
    const tile = tileMap.get(`${x},${y}`);
    const boat = boatMap.get(`${x},${y}`);
    
    if (boat) {
      Sounds.boatSelect();
      onBoatPress(boat);
    } else if (tile) {
      Sounds.tileClick();
      onTilePress(tile.position, tile);
    } else {
      Sounds.tileClick();
      onWaterPress({ x, y });
    }
  };
  
  // Generate all grid cells
  const cells = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const tile = tileMap.get(`${x},${y}`);
      const boat = boatMap.get(`${x},${y}`);
      const isSelected = selectedTile?.x === x && selectedTile?.y === y;
      const isBoatSelected = boat && selectedBoat === boat.id;
      const coastalEdges = tile ? getCoastalEdges(x, y) : null;
      
      cells.push(
        <Pressable
          key={`cell-${x}-${y}`}
          style={[
            styles.cell,
            {
              left: x * tileSize + 1,
              top: y * tileSize + 1,
              width: tileSize - 2,
              height: tileSize - 2,
            },
            isSelected && styles.selectedCell,
            isBoatSelected && styles.selectedBoatCell,
          ]}
          onPress={() => handleCellPress(x, y)}
        >
          {tile ? (
            <View style={styles.landTile}>
              {/* Land background */}
              <Svg width={tileSize - 2} height={tileSize - 2} style={styles.tileSvg}>
                <Defs>
                  <LinearGradient id={`landGrad-${x}-${y}`} x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#6b8e4e" />
                    <Stop offset="1" stopColor="#4a7c3b" />
                  </LinearGradient>
                </Defs>
                <Rect 
                  x="0" y="0" 
                  width={tileSize - 2} height={tileSize - 2} 
                  fill={`url(#landGrad-${x}-${y})`}
                  rx="4"
                />
                {/* Sandy beach edges */}
                {coastalEdges?.top && (
                  <Rect x="0" y="0" width={tileSize - 2} height="6" fill="#d4b896" rx="4" />
                )}
                {coastalEdges?.bottom && (
                  <Rect x="0" y={tileSize - 8} width={tileSize - 2} height="6" fill="#d4b896" />
                )}
                {coastalEdges?.left && (
                  <Rect x="0" y="0" width="6" height={tileSize - 2} fill="#d4b896" rx="4" />
                )}
                {coastalEdges?.right && (
                  <Rect x={tileSize - 8} y="0" width="6" height={tileSize - 2} fill="#d4b896" />
                )}
                {/* Grass texture dots */}
                {!tile.building && (
                  <G>
                    <Circle cx={tileSize * 0.25} cy={tileSize * 0.3} r="2" fill="#5a9c3e" opacity="0.6" />
                    <Circle cx={tileSize * 0.6} cy={tileSize * 0.5} r="1.5" fill="#5a9c3e" opacity="0.5" />
                    <Circle cx={tileSize * 0.4} cy={tileSize * 0.7} r="2" fill="#5a9c3e" opacity="0.4" />
                  </G>
                )}
              </Svg>
              
              {/* Building overlay */}
              {tile.building && (
                <View style={styles.buildingOverlay}>
                  <BuildingIcon 
                    type={tile.building} 
                    size={tileSize} 
                  />
                </View>
              )}
              
              {/* Rebel indicator */}
              {tile.hasRebel && (
                <View style={styles.rebelIndicator}>
                  <Svg width={20} height={20} viewBox="0 0 100 100">
                    <Circle cx="50" cy="50" r="45" fill="#e53935" />
                    <Path d="M50 25 L55 45 L75 50 L55 55 L50 75 L45 55 L25 50 L45 45 Z" fill="#fff" />
                  </Svg>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.waterTile}>
              {/* Water background with animated wave pattern */}
              <Svg width={tileSize - 2} height={tileSize - 2} style={styles.tileSvg}>
                <Defs>
                  <LinearGradient id={`waterGrad-${x}-${y}`} x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#1a5a8a" />
                    <Stop offset="1" stopColor="#0d3a5a" />
                  </LinearGradient>
                </Defs>
                <Rect 
                  x="0" y="0" 
                  width={tileSize - 2} height={tileSize - 2} 
                  fill={`url(#waterGrad-${x}-${y})`}
                  rx="2"
                />
                {/* Wave lines */}
                <Path 
                  d={`M0,${tileSize * 0.3} Q${tileSize * 0.25},${tileSize * 0.25} ${tileSize * 0.5},${tileSize * 0.3} T${tileSize},${tileSize * 0.3}`}
                  stroke="#2a7aba"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.5"
                />
                <Path 
                  d={`M0,${tileSize * 0.6} Q${tileSize * 0.25},${tileSize * 0.55} ${tileSize * 0.5},${tileSize * 0.6} T${tileSize},${tileSize * 0.6}`}
                  stroke="#2a7aba"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.4"
                />
                {/* Sparkle highlights */}
                <Circle cx={tileSize * 0.2} cy={tileSize * 0.4} r="1" fill="#fff" opacity="0.4" />
                <Circle cx={tileSize * 0.7} cy={tileSize * 0.2} r="1" fill="#fff" opacity="0.3" />
              </Svg>
            </View>
          )}
        </Pressable>
      );
    }
  }
  
  return (
    <View style={[styles.container, { width, height }]}>
      {cells}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#0d3a5a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cell: {
    position: 'absolute',
    borderRadius: 4,
    overflow: 'hidden',
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: '#4ade80',
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  selectedBoatCell: {
    borderWidth: 2,
    borderColor: '#ffc107',
    shadowColor: '#ffc107',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  landTile: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterTile: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  buildingOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rebelIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
  },
});

export default Island;
