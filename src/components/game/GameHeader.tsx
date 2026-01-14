import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/game';
import { GameMode } from '../../types/game';

interface GameHeaderProps {
  gold: number;
  population: number;
  score: number;
  round: number;
  maxRounds: number;
  timeRemaining: number;
  isRoundActive: boolean;
  mode: GameMode;
  onModeToggle: () => void;
  onStartRound: () => void;
}

export function GameHeader({
  gold,
  population,
  score,
  round,
  maxRounds,
  timeRemaining,
  isRoundActive,
  mode,
  onModeToggle,
  onStartRound,
}: GameHeaderProps) {
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getTimerColor = () => {
    if (!isRoundActive) return COLORS.textDim;
    if (timeRemaining <= 10) return COLORS.danger;
    if (timeRemaining <= 30) return COLORS.gold;
    return COLORS.selected;
  };
  
  return (
    <View style={styles.container}>
      {/* Top row: Resources */}
      <View style={styles.resourceRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>GOLD</Text>
          <Text style={[styles.statValue, { color: COLORS.gold }]}>{gold}</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statLabel}>POP</Text>
          <Text style={styles.statValue}>{population.toLocaleString()}</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statLabel}>SCORE</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        
        <TouchableOpacity style={styles.stat} onPress={onModeToggle}>
          <Text style={styles.statLabel}>MODE</Text>
          <Text style={[styles.statValue, styles.modeText]}>
            {mode === 'original' ? 'OG' : 'ENH'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Bottom row: Round and Timer */}
      <View style={styles.timerRow}>
        <View style={styles.roundInfo}>
          <Text style={styles.roundLabel}>ROUND</Text>
          <Text style={styles.roundValue}>{round} / {maxRounds}</Text>
        </View>
        
        <View style={styles.timerContainer}>
          {isRoundActive ? (
            <Text style={[styles.timer, { color: getTimerColor() }]}>
              {formatTime(timeRemaining)}
            </Text>
          ) : (
            <TouchableOpacity style={styles.startButton} onPress={onStartRound}>
              <Text style={styles.startButtonText}>
                {round === 0 ? 'START GAME' : round >= maxRounds ? 'GAME OVER' : 'NEXT ROUND'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {isRoundActive && (
          <View style={styles.activeIndicator}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>LIVE</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.panel,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.panelBorder,
  },
  resourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  stat: {
    alignItems: 'center',
    minWidth: 60,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textDim,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modeText: {
    fontSize: 14,
    color: COLORS.gold,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  roundInfo: {
    alignItems: 'center',
  },
  roundLabel: {
    fontSize: 9,
    color: COLORS.textDim,
    letterSpacing: 1,
  },
  roundValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  timerContainer: {
    alignItems: 'center',
    minWidth: 120,
  },
  timer: {
    fontSize: 32,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  startButton: {
    backgroundColor: COLORS.selected,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
  },
  activeText: {
    fontSize: 10,
    color: COLORS.danger,
    fontWeight: 'bold',
  },
});
