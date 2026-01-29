// src/components/game/AIIslandMinimap.tsx
// Minimap view of AI opponent's island - responsive for all screen sizes
// NOTE: Do NOT use Modal component - it crashes the app silently

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Svg, { Rect, Circle, G } from 'react-native-svg';
import { Island } from '../../types';
import { GRID_WIDTH, GRID_HEIGHT } from '../../constants/game';

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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  if (!visible || !island) return null;
  
  // Responsive sizing
  const isSmallScreen = screenWidth < 400;
  const MINI_TILE_SIZE = isSmallScreen ? 5 : 6;
  const EXPANDED_TILE_SIZE = isSmallScreen ? 10 : 14;
  const expandedWidth = Math.min(screenWidth * 0.92, 400);
  const expandedMaxHeight = screenHeight * 0.85;

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
      <View style={[styles.fullScreenOverlay, { width: screenWidth, height: screenHeight }]}>
        <Pressable 
          style={[styles.backdrop, { width: screenWidth, height: screenHeight }]} 
          onPress={() => setExpanded(false)} 
        />
        <View style={[styles.expandedContainer, { width: expandedWidth, maxHeight: expandedMaxHeight }]}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.expandedScrollContent}
          >
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
          </ScrollView>
          
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  expandedContainer: {
    backgroundColor: '#1a2a3a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3a5a6a',
  },
  expandedScrollContent: {
    paddingBottom: 8,
  },
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  expandedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  difficultyBadgeLarge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyTextLarge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000',
  },
  expandedStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    backgroundColor: '#0a1a2a',
    borderRadius: 10,
    padding: 10,
  },
  expandedStatItem: {
    alignItems: 'center',
  },
  expandedStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  expandedStatLabel: {
    fontSize: 10,
    color: '#88a4b8',
    marginTop: 2,
  },
  expandedMapContainer: {
    alignItems: 'center',
    backgroundColor: '#0a1a2a',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
  },
  legendContainer: {
    backgroundColor: '#0a1a2a',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  legendTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#88a4b8',
    marginBottom: 6,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
    minWidth: 70,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    fontSize: 9,
    color: '#ccc',
  },
  closeButton: {
    backgroundColor: '#2a4a5a',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AIIslandMinimap;
