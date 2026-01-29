// src/components/game/Island.tsx
// Main island map component with two-layer rendering:
// Layer 1: Seamless water background
// Layer 2: Land tiles on top

import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, GestureResponderEvent } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop, G, Circle, Path } from 'react-native-svg';
import { Island as IslandType, Position, Tile, WaterPosition } from '../../types';
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

interface IslandProps {
  island: IslandType;
  tileSize: number;
  selectedTile: Position | null;
  selectedBoatId: string | null;
  onTilePress: (position: Position, tile: Tile) => void;
  onWaterTap: (waterPosition: WaterPosition, screenX: number, screenY: number) => void;
  children?: React.ReactNode; // For rendering boats on top
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
  selectedBoatId,
  onTilePress,
  onWaterTap,
  children,
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
  
  const isLand = (x: number, y: number) => tileMap.has(`${x},${y}`);
  
  const getCoastalEdges = (x: number, y: number) => ({
    top: y > 0 && !isLand(x, y - 1),
    bottom: y < GRID_HEIGHT - 1 && !isLand(x, y + 1),
    left: x > 0 && !isLand(x - 1, y),
    right: x < GRID_WIDTH - 1 && !isLand(x + 1, y),
  });
  
  // Unified tap handler - placed on top to catch all taps
  const handleMapPress = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    
    // Convert to grid coordinates
    const gridX = Math.floor(locationX / tileSize);
    const gridY = Math.floor(locationY / tileSize);
    
    // Check if tapped on land or water
    const tile = tileMap.get(`${gridX},${gridY}`);
    
    if (tile) {
      // Tapped on land - forward to tile handler
      onTilePress(tile.position, tile);
    } else {
      // Tapped on water - convert to continuous coordinates
      const waterX = locationX / tileSize;
      const waterY = locationY / tileSize;
      onWaterTap({ x: waterX, y: waterY }, locationX, locationY);
    }
  };
  
  // Generate wave pattern paths for seamless water
  const generateWaves = () => {
    const waves = [];
    const waveSpacing = 40; // pixels between wave rows
    const numWaves = Math.ceil(height / waveSpacing) + 1;
    
    for (let i = 0; i < numWaves; i++) {
      const y = i * waveSpacing;
      const offset = (i % 2) * 20; // Alternate offset for natural look
      waves.push(
        <Path
          key={`wave-${i}`}
          d={`M${-20 + offset},${y} Q${width * 0.25 + offset},${y - 8} ${width * 0.5 + offset},${y} T${width + 20 + offset},${y}`}
          stroke="#2a7aba"
          strokeWidth="1.5"
          fill="none"
          opacity={0.3 + (i % 3) * 0.1}
        />
      );
    }
    return waves;
  };
  
  // Generate sparkle highlights on water
  const generateSparkles = () => {
    const sparkles = [];
    const numSparkles = 30;
    
    for (let i = 0; i < numSparkles; i++) {
      // Pseudo-random positions based on index
      const x = ((i * 73) % width);
      const y = ((i * 47) % height);
      const size = 1 + (i % 3) * 0.5;
      const opacity = 0.2 + (i % 4) * 0.1;
      
      sparkles.push(
        <Circle
          key={`sparkle-${i}`}
          cx={x}
          cy={y}
          r={size}
          fill="#fff"
          opacity={opacity}
        />
      );
    }
    return sparkles;
  };
  
  // Generate land tiles (visual only - taps handled by unified tap layer)
  const landTiles = useMemo(() => {
    return island.tiles.map(tile => {
      const { x, y } = tile.position;
      const isSelected = selectedTile?.x === x && selectedTile?.y === y;
      const coastalEdges = getCoastalEdges(x, y);
      
      return (
        <View
          key={`land-${x}-${y}`}
          style={[
            styles.landTile,
            {
              left: x * tileSize + 1,
              top: y * tileSize + 1,
              width: tileSize - 2,
              height: tileSize - 2,
            },
            isSelected && styles.selectedCell,
          ]}
          pointerEvents="none"
        >
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
            {coastalEdges.top && (
              <Rect x="0" y="0" width={tileSize - 2} height="6" fill="#d4b896" rx="4" />
            )}
            {coastalEdges.bottom && (
              <Rect x="0" y={tileSize - 8} width={tileSize - 2} height="6" fill="#d4b896" />
            )}
            {coastalEdges.left && (
              <Rect x="0" y="0" width="6" height={tileSize - 2} fill="#d4b896" rx="4" />
            )}
            {coastalEdges.right && (
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
      );
    });
  }, [island.tiles, selectedTile, tileSize]);
  
  return (
    <View style={[styles.container, { width, height }]}>
      {/* Seamless water background (visual only) */}
      <View style={styles.waterBackground} pointerEvents="none">
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="waterGradient" x1="0" y1="0" x2="0.3" y2="1">
              <Stop offset="0" stopColor="#1e6091" />
              <Stop offset="0.5" stopColor="#155a8a" />
              <Stop offset="1" stopColor="#0d4a6f" />
            </LinearGradient>
          </Defs>
          {/* Water base */}
          <Rect x="0" y="0" width={width} height={height} fill="url(#waterGradient)" />
          {/* Wave patterns */}
          {generateWaves()}
          {/* Sparkle highlights */}
          {generateSparkles()}
        </Svg>
      </View>
      
      {/* Land tiles layer (visual only) */}
      {landTiles}
      
      {/* Tap layer - handles land and water taps */}
      <Pressable 
        style={styles.tapLayer}
        onPress={handleMapPress}
      />
      
      {/* Boats layer - boats on TOP so they can receive their own taps */}
      <View style={styles.boatsLayer} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  waterBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  landTile: {
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
  tileSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  buildingOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  rebelIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
  },
  boatsLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tapLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});

export default Island;
