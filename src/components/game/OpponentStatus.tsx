// src/components/game/OpponentStatus.tsx
// Compact display of AI opponent's status

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface OpponentStatusProps {
  score: number;
  gold: number;
  population: number;
  difficulty: 'easy' | 'normal' | 'hard';
  visible: boolean;
}

export const OpponentStatus: React.FC<OpponentStatusProps> = ({
  score,
  gold,
  population,
  difficulty,
  visible,
}) => {
  if (!visible) return null;
  
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
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI</Text>
        <View style={[styles.difficultyBadge, { backgroundColor: difficultyColors[difficulty] }]}>
          <Text style={styles.difficultyText}>{difficultyLabels[difficulty]}</Text>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>{gold}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>👥</Text>
          <Text style={styles.statValue}>{population >= 1000 ? `${(population/1000).toFixed(1)}k` : population}</Text>
        </View>
      </View>
      
      {/* Score comparison bar */}
      <View style={styles.comparisonBar}>
        <View style={[styles.scoreFill, { width: `${Math.min(100, score)}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(26, 42, 58, 0.95)',
    borderRadius: 12,
    padding: 10,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#3a5a6a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 10,
    marginRight: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  comparisonBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    backgroundColor: '#e53935',
    borderRadius: 2,
  },
});

export default OpponentStatus;
