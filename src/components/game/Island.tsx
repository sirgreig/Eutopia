import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Island as IslandType, Position, Tile, Boat } from '../../types/game';
import { GRID_WIDTH, GRID_HEIGHT } from '../../constants/game';
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
} from './Icons';

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
    default: return <ConstructionIcon size={iconSize} />;
  }
};

const BoatIcon = ({ type, size }: { type: string; size: number }) => {
  const iconSize = size * 0.85;
  switch (type) {
    case 'fishing': return <FishingBoatIcon size={iconSize} />;
    case 'pt': return <PTBoatIcon size={iconSize} />;
    default: return <FishingBoatIcon size={iconSize} />;
  }
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
            tile ? styles.landCell : styles.waterCell,
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
          {tile?.building && (
            <BuildingIcon type={tile.building} size={tileSize} />
          )}
          {boatHere && (
            <BoatIcon type={boatHere.type} size={tileSize} />
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
    backgroundColor: '#1e3a4c',
  },
  cell: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    margin: 1,
  },
  waterCell: {
    backgroundColor: '#2d6a8e',
  },
  landCell: {
    backgroundColor: '#5a8f5a',
    borderWidth: 1,
    borderColor: '#4a7a4a',
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  selectedBoatCell: {
    borderWidth: 2,
    borderColor: '#ffc107',
    backgroundColor: '#3d7a9e',
  },
});
