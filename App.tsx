import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Island, BuildMenu } from './src/components';
import { generateIsland, calculateMetrics } from './src/services/islandGenerator';
import { Island as IslandType, Position, IslandMetrics, Tile, BuildingType, GameMode } from './src/types';
import { COLORS, BUILDINGS } from './src/constants/game';

export default function App() {
  const [island, setIsland] = useState<IslandType | null>(null);
  const [metrics, setMetrics] = useState<IslandMetrics | null>(null);
  const [selectedTile, setSelectedTile] = useState<Position | null>(null);
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [gold, setGold] = useState(100);
  const [mode, setMode] = useState<GameMode>('original');

  const regenerateIsland = () => {
    const newIsland = generateIsland();
    const newMetrics = calculateMetrics(newIsland.tiles);
    setIsland(newIsland);
    setMetrics(newMetrics);
    setSelectedTile(null);
    setGold(100);
  };

  useEffect(() => {
    regenerateIsland();
  }, []);

  const handleTilePress = (position: Position, tile: Tile) => {
    if (tile.building) {
      // Tile has building - show info (TODO)
      setSelectedTile(position);
      return;
    }
    
    // Empty tile - show build menu
    setSelectedTile(position);
    setShowBuildMenu(true);
  };

  const handleSelectBuilding = (type: BuildingType) => {
    if (!island || !selectedTile) return;
    
    const building = BUILDINGS.find(b => b.type === type);
    if (!building || gold < building.cost) return;
    
    // Update the tile with the building
    const updatedTiles = island.tiles.map(tile => 
      tile.position.x === selectedTile.x && tile.position.y === selectedTile.y
        ? { ...tile, building: type }
        : tile
    );
    
    setIsland({ ...island, tiles: updatedTiles });
    setGold(gold - building.cost);
    setShowBuildMenu(false);
    setSelectedTile(null);
  };

  const handleSelectBoat = (type: 'fishing' | 'pt') => {
    // TODO: Implement boat spawning
    console.log('Spawn boat:', type);
    setShowBuildMenu(false);
  };

  const toggleMode = () => {
    setMode(mode === 'original' ? 'enhanced' : 'original');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <Text style={styles.title}>EUTOPÍA</Text>
      
      {/* Status bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>GOLD</Text>
          <Text style={styles.statusValue}>{gold}</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>MODE</Text>
          <TouchableOpacity onPress={toggleMode}>
            <Text style={[styles.statusValue, styles.modeText]}>
              {mode.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>TILES</Text>
          <Text style={styles.statusValue}>{island?.tiles.length ?? 0}</Text>
        </View>
      </View>
      
      {island && (
        <View style={styles.islandContainer}>
          <Island
            island={island}
            tileSize={44}
            selectedTile={selectedTile}
            onTilePress={handleTilePress}
          />
        </View>
      )}
      
      {metrics && (
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>Island Metrics</Text>
          <View style={styles.metricsRow}>
            <Text style={styles.metric}>
              Compact: {(metrics.compactness * 100).toFixed(0)}%
            </Text>
            <Text style={styles.metric}>
              Coast: {metrics.coastlineLength}
            </Text>
            <Text style={styles.metric}>
              Depth: {metrics.maxInlandDepth}
            </Text>
          </View>
        </View>
      )}
      
      <TouchableOpacity style={styles.button} onPress={regenerateIsland}>
        <Text style={styles.buttonText}>New Island</Text>
      </TouchableOpacity>
      
      <Text style={styles.hint}>
        Tap empty tile to build • Tap building for info
      </Text>
      
      <BuildMenu
        visible={showBuildMenu}
        gold={gold}
        mode={mode}
        onSelectBuilding={handleSelectBuilding}
        onSelectBoat={handleSelectBoat}
        onClose={() => {
          setShowBuildMenu(false);
          setSelectedTile(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.panel,
    alignItems: 'center',
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gold,
    letterSpacing: 4,
    marginBottom: 8,
  },
  statusBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.panelLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    width: '90%',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 10,
    color: COLORS.textDim,
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modeText: {
    color: COLORS.gold,
    fontSize: 14,
  },
  islandContainer: {
    marginVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.panelBorder,
  },
  metricsContainer: {
    backgroundColor: COLORS.panelLight,
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    width: '90%',
  },
  metricsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textDim,
    marginBottom: 6,
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    fontSize: 12,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.selected,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 11,
    color: COLORS.textDim,
    marginTop: 12,
  },
});
