import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Island } from './src/components';
import { generateIsland, calculateMetrics } from './src/services/islandGenerator';
import { Island as IslandType, Position, IslandMetrics } from './src/types';
import { COLORS } from './src/constants/game';

export default function App() {
  const [island, setIsland] = useState<IslandType | null>(null);
  const [metrics, setMetrics] = useState<IslandMetrics | null>(null);
  const [selectedTile, setSelectedTile] = useState<Position | null>(null);

  const regenerateIsland = () => {
    const newIsland = generateIsland();
    const newMetrics = calculateMetrics(newIsland.tiles);
    setIsland(newIsland);
    setMetrics(newMetrics);
    setSelectedTile(null);
  };

  useEffect(() => {
    regenerateIsland();
  }, []);

  const handleTilePress = (position: Position) => {
    setSelectedTile(
      selectedTile?.x === position.x && selectedTile?.y === position.y
        ? null
        : position
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <Text style={styles.title}>EUTOPÍA</Text>
      <Text style={styles.subtitle}>Island Generator Test</Text>
      
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
          <Text style={styles.metric}>
            Tiles: {island?.tiles.length ?? 0}
          </Text>
          <Text style={styles.metric}>
            Compactness: {(metrics.compactness * 100).toFixed(1)}%
          </Text>
          <Text style={styles.metric}>
            Coastline: {metrics.coastlineLength} edges
          </Text>
          <Text style={styles.metric}>
            Fort Efficiency: {(metrics.fortEfficiency * 100).toFixed(1)}%
          </Text>
          <Text style={styles.metric}>
            Max Inland Depth: {metrics.maxInlandDepth} tiles
          </Text>
        </View>
      )}
      
      {selectedTile && (
        <Text style={styles.selectedText}>
          Selected: ({selectedTile.x}, {selectedTile.y})
        </Text>
      )}
      
      <TouchableOpacity style={styles.button} onPress={regenerateIsland}>
        <Text style={styles.buttonText}>Generate New Island</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.panel,
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.gold,
    letterSpacing: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textDim,
    marginBottom: 20,
  },
  islandContainer: {
    marginVertical: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.panelBorder,
  },
  metricsContainer: {
    backgroundColor: COLORS.panelLight,
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
  },
  metricsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  metric: {
    fontSize: 13,
    color: COLORS.textDim,
    marginVertical: 2,
  },
  selectedText: {
    fontSize: 14,
    color: COLORS.selected,
    marginVertical: 10,
  },
  button: {
    backgroundColor: COLORS.selected,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
