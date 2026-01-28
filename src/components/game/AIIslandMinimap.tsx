// src/components/game/AIIslandMinimap.tsx
// Minimap view of AI opponent's island
// NOTE: Do NOT use Modal component - it crashes the app silently

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from 'react-native';
import Svg, { Rect, Circle, G } from 'react-native-svg';
import { Island } from '../../types';
import { GRID_WIDTH, GRID_HEIGHT } from '../../constants/game';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AIIslandMinimapProps {
  island: Island | null;
  score: number;
  gold: number;
  population: number;
  difficulty: 'easy' | 'normal' | 'hard';
  visible: boolean;
  lastAction?: string | null;
}

// Mini building colors
const BUILDING_COLORS: Record<string, string> = {
  house: '#8B4513',
  farm: '#228B22',
  factory: '#696969',
  hospital: '#FF6B6B',
  school: '#4169E1',
  fort: '#8B8B00',
  apartment: '#A0522D',
  dock: '#DEB887',
  lighthouse: '#FFD700',
  granary: '#DAA520',
  marketplace: '#9932CC',
  watchtower: '#2F4F4F',
};

const difficultyColors = {
  easy: '#4ade80',
  normal: '#ffc107',
  hard: '#e53935',
};

const difficultyLabels = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
};

export const AIIslandMinimap: React.FC<AIIslandMinimapProps> = ({
  island,
  score,
  gold,
  population,
  difficulty,
  visible,
  lastAction,
}) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!visible || !island) return null;
  
  const MINI_TILE_SIZE = 6;
  const EXPANDED_TILE_SIZE = 14;

  const renderIsland = (tileSize: number) => {
    const width = GRID_WIDTH * tileSize;
    const height = GRID_HEIGHT * tileSize;
    
    return (
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Rect x={0} y={0} width={width} height={height} fill="#1a5276" />
        {island.tiles.map((tile) => {
          const x = tile.position.x * tileSize;
          const y = tile.position.y * tileSize;
          const buildingColor = tile.building ? BUILDING_COLORS[tile.building] || '#666' : '#c2b280';
          
          return (
            <G key={tile.id}>
              <Rect
                x={x}
                y={y}
                width={tileSize}
                height={tileSize}
                fill={buildingColor}
                stroke="#1a5276"
                strokeWidth={0.5}
              />
              {tile.hasRebel && (
                <Circle
                  cx={x + tileSize / 2}
                  cy={y + tileSize / 2}
                  r={tileSize / 4}
                  fill="#ff0000"
                />
              )}
            </G>
          );
        })}
        {island.boats.map((boat) => {
          const x = boat.position.x * tileSize;
          const y = boat.position.y * tileSize;
          const boatColor = boat.type === 'fishing' ? '#4ade80' : '#e53935';
          
          return (
            <Rect
              key={boat.id}
              x={x + tileSize * 0.2}
              y={y + tileSize * 0.2}
              width={tileSize * 0.6}
              height={tileSize * 0.6}
              fill={boatColor}
              rx={tileSize * 0.1}
            />
          );
        })}
      </Svg>
    );
  };

  // Expanded full-screen overlay
  if (expanded) {
    return (
      <View style={styles.fullScreenOverlay}>
        <Pressable style={styles.backdrop} onPress={() => setExpanded(false)} />
        <View style={styles.expandedContainer}>
          <View style={styles.expandedHeader}>
            <Text style={styles.expandedTitle}>🤖 AI Opponent</Text>
            <View style={[styles.difficultyBadgeLarge, { backgroundColor: difficultyColors[difficulty] }]}>
              <Text style={styles.difficultyTextLarge}>{difficultyLabels[difficulty]}</Text>
            </View>
          </View>
          
          <View style={styles.expandedStats}>
            <View style={styles.expandedStatItem}>
              <Text style={styles.expandedStatValue}>{score}</Text>
              <Text style={styles.expandedStatLabel}>Score</Text>
            </View>
            <View style={styles.expandedStatItem}>
              <Text style={styles.expandedStatValue}>{gold}</Text>
              <Text style={styles.expandedStatLabel}>Gold</Text>
            </View>
            <View style={styles.expandedStatItem}>
              <Text style={styles.expandedStatValue}>{population.toLocaleString()}</Text>
              <Text style={styles.expandedStatLabel}>Population</Text>
            </View>
          </View>
          
          <View style={styles.expandedMapContainer}>
            {renderIsland(EXPANDED_TILE_SIZE)}
          </View>
          
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Buildings:</Text>
            <View style={styles.legendGrid}>
              {[
                { color: '#8B4513', label: 'House' },
                { color: '#228B22', label: 'Farm' },
                { color: '#696969', label: 'Factory' },
                { color: '#FF6B6B', label: 'Hospital' },
                { color: '#4169E1', label: 'School' },
                { color: '#8B8B00', label: 'Fort' },
              ].map(({ color, label }) => (
                <View key={label} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: color }]} />
                  <Text style={styles.legendText}>{label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.legendGrid}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4ade80' }]} />
                <Text style={styles.legendText}>Fishing</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#e53935' }]} />
                <Text style={styles.legendText}>PT Boat</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.closeButton} onPress={() => setExpanded(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Compact minimap
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setExpanded(true)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI</Text>
        <View style={[styles.difficultyBadge, { backgroundColor: difficultyColors[difficulty] }]}>
          <Text style={styles.difficultyText}>{difficultyLabels[difficulty]}</Text>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <Text style={styles.statText}>⭐{score}</Text>
        <Text style={styles.statText}>💰{gold}</Text>
        <Text style={styles.statText}>👥{population >= 1000 ? `${(population/1000).toFixed(1)}k` : population}</Text>
      </View>
      
      <View style={styles.minimapContainer}>
        {renderIsland(MINI_TILE_SIZE)}
      </View>
      
      {lastAction && (
        <Text style={styles.lastAction} numberOfLines={1}>
          {lastAction}
        </Text>
      )}
      
      <Text style={styles.tapHint}>Tap to expand</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Compact minimap styles
  container: {
    position: 'absolute',
    top: 70,
    right: 10,
    backgroundColor: 'rgba(26, 42, 58, 0.95)',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#3a5a6a',
    minWidth: 100,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  difficultyBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  difficultyText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#000',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statText: {
    fontSize: 10,
    color: '#e0e0e0',
  },
  minimapContainer: {
    alignItems: 'center',
    marginVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  lastAction: {
    fontSize: 8,
    color: '#88a4b8',
    textAlign: 'center',
    marginTop: 2,
  },
  tapHint: {
    fontSize: 8,
    color: '#556677',
    textAlign: 'center',
    marginTop: 2,
  },
  
  // Full-screen overlay styles
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  expandedContainer: {
    backgroundColor: '#1a2a3a',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#3a5a6a',
  },
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  expandedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  difficultyBadgeLarge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyTextLarge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  expandedStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    backgroundColor: '#0a1a2a',
    borderRadius: 10,
    padding: 12,
  },
  expandedStatItem: {
    alignItems: 'center',
  },
  expandedStatValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  expandedStatLabel: {
    fontSize: 11,
    color: '#88a4b8',
    marginTop: 2,
  },
  expandedMapContainer: {
    alignItems: 'center',
    backgroundColor: '#0a1a2a',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  legendContainer: {
    backgroundColor: '#0a1a2a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#88a4b8',
    marginBottom: 8,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#ccc',
  },
  closeButton: {
    backgroundColor: '#2a4a5a',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AIIslandMinimap;
