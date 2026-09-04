// src/components/game/MultiplayerIslandMinimap.tsx
// Minimap view of a HUMAN opponent's island (Phase 8D).
//
// Differs from AIIslandMinimap in one important way: building TYPES are hidden.
// Occupied tiles render as a generic "built" marker so the opponent's strategy
// isn't given away. Stats (score / gold / population / boats) and boat positions
// are visible.
//
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

// Boat snapshot shape as synced through Firebase (mirrors multiplayerService)
interface BoatSnapshot {
  id: string;
  type: 'fishing' | 'pt';
  x: number;
  y: number;
}

interface MultiplayerIslandMinimapProps {
  island: Island | null;
  score: number;
  gold: number;
  population: number;
  boats: BoatSnapshot[];
  opponentName: string;
  visible: boolean;
  /** Room code, shown in the expanded view so a player can rejoin if needed */
  roomCode?: string;
  /** Enhanced Mode: hide unscouted tiles */
  fogEnabled?: boolean;
  /** Tile keys ("x,y") this player has revealed */
  revealedTiles?: Set<string>;
  /** Phase 8E — true when the opponent's heartbeat has gone stale */
  isStale?: boolean;
  /** Phase 8E — ms since the opponent's last state write */
  msSinceSeen?: number;
}

// Fog-of-war palette — no per-building-type colours
const EMPTY_LAND_COLOR = '#c2b280';  // bare land
const BUILT_TILE_COLOR = '#7a6a52';  // occupied, type unknown
const BUILT_MARKER_COLOR = '#4a3f30'; // small centred block on built tiles
const WATER_COLOR = '#1a5276';
const FOG_COLOR = '#22303a';

export const MultiplayerIslandMinimap: React.FC<MultiplayerIslandMinimapProps> = ({
  island,
  score,
  gold,
  population,
  boats,
  opponentName,
  visible,
  roomCode,
  fogEnabled = false,
  revealedTiles,
  isStale = false,
  msSinceSeen = 0,
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

  const builtCount = island.tiles.filter((t) => t.building).length;

  const renderIsland = (tileSize: number) => {
    const width = GRID_WIDTH * tileSize;
    const height = GRID_HEIGHT * tileSize;
    const markerSize = tileSize * 0.45;

    return (
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Rect x={0} y={0} width={width} height={height} fill={WATER_COLOR} />
        {island.tiles.map((tile) => {
          const x = tile.position.x * tileSize;
          const y = tile.position.y * tileSize;
          const hidden = fogEnabled && !(revealedTiles?.has(`${tile.position.x},${tile.position.y}`) ?? false);
          const isBuilt = !hidden && !!tile.building;

          return (
            <G key={tile.id}>
              <Rect
                x={x}
                y={y}
                width={tileSize}
                height={tileSize}
                fill={hidden ? FOG_COLOR : isBuilt ? BUILT_TILE_COLOR : EMPTY_LAND_COLOR}
                stroke={WATER_COLOR}
                strokeWidth={0.5}
              />
              {/* Generic "something is built here" marker — type intentionally hidden */}
              {isBuilt && (
                <Rect
                  x={x + (tileSize - markerSize) / 2}
                  y={y + (tileSize - markerSize) / 2}
                  width={markerSize}
                  height={markerSize}
                  fill={BUILT_MARKER_COLOR}
                  rx={markerSize * 0.15}
                />
              )}
              {!hidden && tile.hasRebel && (
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
        {boats.map((boat) => {
          const x = boat.x * tileSize;
          const y = boat.y * tileSize;
          const boatColor = boat.type === 'fishing' ? '#4ade80' : '#e53935';

          return (
            <Rect
              key={boat.id}
              x={x - tileSize * 0.3}
              y={y - tileSize * 0.3}
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
              <Text style={styles.expandedTitle} numberOfLines={1}>{opponentName}</Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
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
              <Text style={styles.legendTitle}>Legend:</Text>
              <View style={styles.legendGrid}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: EMPTY_LAND_COLOR }]} />
                  <Text style={styles.legendText}>Empty</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: BUILT_TILE_COLOR }]} />
                  <Text style={styles.legendText}>Built</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#ff0000' }]} />
                  <Text style={styles.legendText}>Rebels</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#4ade80' }]} />
                  <Text style={styles.legendText}>Fishing</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#e53935' }]} />
                  <Text style={styles.legendText}>PT Boat</Text>
                </View>
              </View>
              <Text style={styles.legendNote}>
                Building types are hidden — you can see where they build, not what.
              </Text>
            </View>

            {roomCode && (
              <View style={styles.roomCodeBox}>
                <Text style={styles.roomCodeLabel}>ROOM CODE</Text>
                <Text style={styles.roomCodeValue}>{roomCode}</Text>
                <Text style={styles.roomCodeHint}>Use this to rejoin if you get disconnected</Text>
              </View>
            )}
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
      style={[styles.container, isStale && styles.containerStale]}
      onPress={() => setExpanded(true)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={[styles.title, isStale && styles.titleStale]} numberOfLines={1}>
          {opponentName}
        </Text>
      </View>

      <View style={[styles.statsRow, isStale && styles.dimmed]}>
        <Text style={styles.statText}>⭐{score}</Text>
        <Text style={styles.statText}>💰{gold}</Text>
        <Text style={styles.statText}>
          👥{population >= 1000 ? `${(population / 1000).toFixed(1)}k` : population}
        </Text>
      </View>

      <View style={[styles.minimapContainer, isStale && styles.dimmed]}>
        {renderIsland(MINI_TILE_SIZE)}
      </View>

      {isStale ? (
        <Text style={styles.staleNotice}>
          Last seen {Math.floor(msSinceSeen / 1000)}s ago
        </Text>
      ) : (
        <View style={styles.statsRow}>
          <Text style={styles.subStatText}>Built: {builtCount}</Text>
          <Text style={styles.subStatText}>Boats: {boats.length}</Text>
        </View>
      )}

      {fogEnabled && (
        <Text style={styles.fogHint}>
          {revealedTiles?.size ?? 0}/{island.tiles.length} scouted
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
    minWidth: 110,
    maxWidth: 150,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#88ccee',
  },
  containerStale: {
    borderColor: '#c77b28',
  },
  titleStale: {
    color: '#c77b28',
  },
  dimmed: {
    opacity: 0.35,
  },
  staleNotice: {
    fontSize: 9,
    color: '#c77b28',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 2,
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
  subStatText: {
    fontSize: 9,
    color: '#88a4b8',
  },
  minimapContainer: {
    alignItems: 'center',
    marginVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tapHint: {
    fontSize: 8,
    color: '#556677',
    textAlign: 'center',
    marginTop: 2,
  },
  fogHint: {
    fontSize: 9,
    color: '#8fb8d4',
    textAlign: 'center',
    fontWeight: '600',
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
    flex: 1,
  },
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#4ade80',
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0a1a0a',
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
  legendNote: {
    fontSize: 9,
    color: '#667788',
    fontStyle: 'italic',
    marginTop: 4,
  },
  roomCodeBox: {
    backgroundColor: '#0a1a2a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a4a5a',
  },
  roomCodeLabel: {
    fontSize: 9,
    color: '#667788',
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  roomCodeValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4ade80',
    letterSpacing: 4,
    marginVertical: 2,
  },
  roomCodeHint: {
    fontSize: 9,
    color: '#556677',
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

export default MultiplayerIslandMinimap;
