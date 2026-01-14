import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Path, Polygon, G, Rect } from 'react-native-svg';

interface EndGameSummaryProps {
  score: number;
  population: number;
  gold: number;
  buildings: {
    houses: number;
    farms: number;
    factories: number;
    schools: number;
    hospitals: number;
    forts: number;
  };
  boats: {
    fishing: number;
    pt: number;
  };
  onPlayAgain: () => void;
}

const TrophyIcon = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* Trophy cup */}
    <Path d="M30,20 L70,20 L65,55 Q50,65 35,55 Z" fill={color} />
    <Rect x="40" y="55" width="20" height="15" fill="#a08050" />
    <Rect x="30" y="70" width="40" height="10" fill="#8d6e63" rx="2" />
    <Rect x="25" y="78" width="50" height="8" fill="#6d4c41" rx="2" />
    {/* Handles */}
    <Path d="M30,25 Q15,25 15,40 Q15,50 25,50" stroke={color} strokeWidth="6" fill="none" />
    <Path d="M70,25 Q85,25 85,40 Q85,50 75,50" stroke={color} strokeWidth="6" fill="none" />
    {/* Star */}
    <Polygon points="50,28 53,38 63,38 55,44 58,54 50,48 42,54 45,44 37,38 47,38" fill="#fff" opacity="0.8" />
    {/* Shine */}
    <Path d="M35,25 Q40,35 35,45" stroke="#fff" strokeWidth="2" opacity="0.5" fill="none" />
  </Svg>
);

const getRank = (score: number): { title: string; color: string } => {
  if (score >= 90) return { title: 'UTOPIAN MASTER', color: '#ffd700' };
  if (score >= 75) return { title: 'PROSPERITY LEADER', color: '#c0c0c0' };
  if (score >= 60) return { title: 'CAPABLE GOVERNOR', color: '#cd7f32' };
  if (score >= 45) return { title: 'STRUGGLING ADMINISTRATOR', color: '#78909c' };
  if (score >= 30) return { title: 'TROUBLED RULER', color: '#e57373' };
  return { title: 'FAILED STATE', color: '#b71c1c' };
};

export function EndGameSummary({ 
  score, 
  population, 
  gold, 
  buildings, 
  boats, 
  onPlayAgain 
}: EndGameSummaryProps) {
  const rank = getRank(score);
  
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>GAME OVER</Text>
        
        <View style={styles.trophySection}>
          <TrophyIcon size={80} color={rank.color} />
          <Text style={[styles.rankTitle, { color: rank.color }]}>{rank.title}</Text>
        </View>
        
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>FINAL SCORE</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>👥</Text>
            <Text style={styles.statValue}>{population.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Population</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>💰</Text>
            <Text style={styles.statValue}>{gold}</Text>
            <Text style={styles.statLabel}>Gold</Text>
          </View>
        </View>
        
        <View style={styles.buildingsSection}>
          <Text style={styles.sectionTitle}>BUILDINGS</Text>
          <View style={styles.buildingsGrid}>
            <Text style={styles.buildingItem}>🏠 {buildings.houses}</Text>
            <Text style={styles.buildingItem}>🌾 {buildings.farms}</Text>
            <Text style={styles.buildingItem}>🏭 {buildings.factories}</Text>
            <Text style={styles.buildingItem}>🏫 {buildings.schools}</Text>
            <Text style={styles.buildingItem}>🏥 {buildings.hospitals}</Text>
            <Text style={styles.buildingItem}>🏰 {buildings.forts}</Text>
          </View>
        </View>
        
        <View style={styles.boatsSection}>
          <Text style={styles.sectionTitle}>BOATS</Text>
          <View style={styles.boatsGrid}>
            <Text style={styles.buildingItem}>🚣 {boats.fishing}</Text>
            <Text style={styles.buildingItem}>⛵ {boats.pt}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.playAgainBtn} onPress={onPlayAgain}>
          <Text style={styles.playAgainText}>PLAY AGAIN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  container: {
    backgroundColor: '#1a2530',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a3a4a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e0e0e0',
    marginBottom: 15,
    letterSpacing: 2,
  },
  trophySection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  rankTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    letterSpacing: 1,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(76,175,80,0.2)',
    borderRadius: 10,
  },
  scoreLabel: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#2a3a4a',
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
  },
  buildingsSection: {
    width: '100%',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 1,
    marginBottom: 5,
  },
  buildingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  buildingItem: {
    fontSize: 14,
    color: '#e0e0e0',
    marginHorizontal: 8,
    marginVertical: 2,
  },
  boatsSection: {
    width: '100%',
    marginBottom: 15,
  },
  boatsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  playAgainBtn: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  playAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
