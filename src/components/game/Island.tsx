import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';
import { Island as IslandType, Position, Tile } from '../../types/game';
import { COLORS } from '../../constants/game';
import { BuildingIcon } from './BuildingIcon';

interface IslandProps {
  island: IslandType;
  tileSize?: number;
  selectedTile?: Position | null;
  onTilePress?: (position: Position, tile: Tile) => void;
}

const GRID_SIZE = 8;

export function Island({ 
  island, 
  tileSize = 48, 
  selectedTile,
  onTilePress 
}: IslandProps) {
  const width = GRID_SIZE * tileSize;
  const height = GRID_SIZE * tileSize;
  
  // Create lookup for quick tile access
  const tileMap = new Map<string, Tile>();
  island.tiles.forEach(tile => {
    tileMap.set(`${tile.position.x},${tile.position.y}`, tile);
  });
  
  const isSelected = (x: number, y: number) => 
    selectedTile?.x === x && selectedTile?.y === y;
  
  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Water background */}
        <Rect x={0} y={0} width={width} height={height} fill={COLORS.waterDeep} />
        
        {/* Water wave lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <Rect 
            key={`wave-${i}`}
            x={0} 
            y={i * tileSize * 0.8} 
            width={width} 
            height={2} 
            fill={COLORS.waterMid} 
            opacity={0.3} 
          />
        ))}
        
        {/* Land tiles */}
        <G>
          {island.tiles.map((tile) => {
            const x = tile.position.x * tileSize;
            const y = tile.position.y * tileSize;
            const selected = isSelected(tile.position.x, tile.position.y);
            
            return (
              <G key={tile.id}>
                {/* Tile shadow */}
                <Rect
                  x={x + 2}
                  y={y + 2}
                  width={tileSize - 4}
                  height={tileSize - 4}
                  fill="rgba(0,0,0,0.25)"
                  rx={6}
                />
                {/* Land tile */}
                <Rect
                  x={x}
                  y={y}
                  width={tileSize - 4}
                  height={tileSize - 4}
                  fill={COLORS.land}
                  stroke={selected ? COLORS.selected : COLORS.landDark}
                  strokeWidth={selected ? 3 : 1}
                  rx={6}
                  onPress={() => onTilePress?.(tile.position, tile)}
                />
              </G>
            );
          })}
        </G>
      </Svg>
      
      {/* Buildings rendered as overlay (React Native views for better interaction) */}
      {island.tiles.map((tile) => {
        if (!tile.building) return null;
        
        const x = tile.position.x * tileSize;
        const y = tile.position.y * tileSize;
        const buildingSize = tileSize - 8;
        
        return (
          <TouchableOpacity
            key={`building-${tile.id}`}
            style={[
              styles.buildingContainer,
              {
                left: x + 2,
                top: y + 2,
                width: buildingSize,
                height: buildingSize,
              }
            ]}
            onPress={() => onTilePress?.(tile.position, tile)}
            activeOpacity={0.8}
          >
            <BuildingIcon type={tile.building} size={buildingSize} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  buildingContainer: {
    position: 'absolute',
  },
});
