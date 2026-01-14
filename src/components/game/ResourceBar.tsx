import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface ResourceBarProps {
  icon: string;
  value: number;
  maxValue?: number;
  color: string;
  showBar?: boolean;
  flash?: boolean;
  compact?: boolean;
}

export function ResourceBar({ 
  icon, 
  value, 
  maxValue, 
  color, 
  showBar = false, 
  flash = false,
  compact = false,
}: ResourceBarProps) {
  const flashAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      // Flash and scale animation when value changes
      Animated.sequence([
        Animated.parallel([
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
      prevValue.current = value;
    }
  }, [value]);

  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', color + '40'],
  });

  const percentage = maxValue ? Math.min(100, (value / maxValue) * 100) : 0;

  const formatValue = (val: number) => {
    if (val >= 10000) return (val / 1000).toFixed(1) + 'k';
    if (val >= 1000) return val.toLocaleString();
    return val.toString();
  };

  return (
    <Animated.View style={[
      styles.container, 
      compact && styles.containerCompact,
      { backgroundColor }
    ]}>
      <View style={styles.iconContainer}>
        <Text style={[styles.icon, compact && styles.iconCompact]}>{icon}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Animated.Text 
          style={[
            styles.value, 
            compact && styles.valueCompact,
            { color, transform: [{ scale: scaleAnim }] }
          ]}
        >
          {formatValue(value)}
        </Animated.Text>
        {showBar && maxValue && (
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  containerCompact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
  },
  iconCompact: {
    fontSize: 14,
  },
  valueContainer: {
    alignItems: 'flex-start',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  valueCompact: {
    fontSize: 14,
  },
  barTrack: {
    width: 50,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});
