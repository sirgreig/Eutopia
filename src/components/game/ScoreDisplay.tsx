import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';

interface ScoreDisplayProps {
  housing: number;
  food: number;
  welfare: number;
  gdp: number;
  total: number;
  maxCategory?: number;
}

const CategoryBar = ({ emoji, value, max, color }: { emoji: string; value: number; max: number; color: string }) => {
  const percentage = Math.min(100, (value / max) * 100);
  
  return (
    <View style={styles.categoryBar}>
      <Text style={styles.categoryEmoji}>{emoji}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.categoryValue}>{value}</Text>
    </View>
  );
};

export function ScoreDisplay({ housing, food, welfare, gdp, total, maxCategory = 30 }: ScoreDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  
  // Score change animation state
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const changeAnim = useRef(new Animated.Value(0)).current;
  const [changeIndicator, setChangeIndicator] = useState<{ amount: number; positive: boolean } | null>(null);
  const prevTotalRef = useRef(total);
  
  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  // Animate on score change
  useEffect(() => {
    const diff = total - prevTotalRef.current;
    
    if (diff !== 0) {
      setChangeIndicator({
        amount: Math.abs(diff),
        positive: diff > 0,
      });
      
      // Pulse the score badge
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
      
      // Floating change indicator
      changeAnim.setValue(0);
      Animated.timing(changeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setChangeIndicator(null);
      });
    }
    
    prevTotalRef.current = total;
  }, [total]);

  const containerWidth = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [56, 180],
  });

  const detailsOpacity = expandAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const indicatorOpacity = changeAnim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 1, 0],
  });

  const indicatorTranslateY = changeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const getScoreColor = () => {
    if (total >= 70) return '#4caf50';
    if (total >= 40) return '#ffc107';
    return '#f44336';
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.outerContainer}>
        <Animated.View style={[styles.container, { width: containerWidth }]}>
          {/* Always visible: Score badge */}
          <Animated.View style={[
            styles.scoreBadge,
            { transform: [{ scale: scaleAnim }] }
          ]}>
            <Text style={[styles.scoreValue, { color: getScoreColor() }]}>{total}</Text>
            <Text style={styles.scoreLabel}>⭐</Text>
          </Animated.View>
          
          {/* Expanded: Category breakdown */}
          <Animated.View style={[styles.details, { opacity: detailsOpacity }]}>
            <CategoryBar emoji="🏠" value={housing} max={maxCategory} color="#e8a838" />
            <CategoryBar emoji="🌾" value={food} max={maxCategory} color="#7cb342" />
            <CategoryBar emoji="❤️" value={welfare} max={maxCategory} color="#e53935" />
            <CategoryBar emoji="💰" value={gdp} max={maxCategory} color="#ffc107" />
          </Animated.View>
        </Animated.View>

        {/* Floating change indicator */}
        {changeIndicator && (
          <Animated.View 
            style={[
              styles.changeIndicator,
              {
                opacity: indicatorOpacity,
                transform: [{ translateY: indicatorTranslateY }],
              },
            ]}
          >
            <Text 
              style={[
                styles.changeText,
                { color: changeIndicator.positive ? '#4ade80' : '#e53935' }
              ]}
            >
              {changeIndicator.positive ? '+' : '-'}{changeIndicator.amount}
            </Text>
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
  },
  container: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  scoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 10,
    marginTop: -2,
  },
  details: {
    flex: 1,
    marginLeft: 10,
    gap: 3,
  },
  categoryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 12,
    width: 16,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#aaa',
    width: 16,
    textAlign: 'right',
  },
  changeIndicator: {
    position: 'absolute',
    top: -8,
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
