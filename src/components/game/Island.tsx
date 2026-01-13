import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';
import { Island as IslandType, Position, Tile } from '../../types/game';
import { COLORS } from '../../constants/game';

interface IslandProps {
  island: IslandType;
  tileSize?: number;
  selectedTile?: Position | null;
  onTilePress?: (position: Position) => void;
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
                  onPress={() => onTilePress?.(tile.position)}
                />
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
});
