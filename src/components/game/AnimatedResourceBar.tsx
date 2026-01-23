// src/components/game/AnimatedResourceBar.tsx
// Resource display with animated flash effects on value changes

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface AnimatedResourceBarProps {
  icon: string;
  value: number;
  previousValue?: number;
  color: string;
  maxValue?: number;
  showBar?: boolean;
  label?: string;
}

export const AnimatedResourceBar: React.FC<AnimatedResourceBarProps> = ({
  icon,
  value,
  previousValue,
  color,
  maxValue,
  showBar = false,
  label,
}) => {
  const flashAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [changeIndicator, setChangeIndicator] = useState<{ amount: number; positive: boolean } | null>(null);
  const changeAnim = useRef(new Animated.Value(0)).current;
  const prevValueRef = useRef(value);
  
  useEffect(() => {
    const diff = value - prevValueRef.current;
    
    if (diff !== 0) {
      // Show change indicator
      setChangeIndicator({
        amount: Math.abs(diff),
        positive: diff > 0,
      });
      
      // Flash animation
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
            easing: Easing.out(Easing.quad),
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
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
      
      // Animate change indicator rising and fading
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
    
    prevValueRef.current = value;
  }, [value]);
  
  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0)', `${color}40`],
  });
  
  const indicatorOpacity = changeAnim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 1, 0],
  });
  
  const indicatorTranslateY = changeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.wrapper, { backgroundColor }]}>
        <Text style={styles.icon}>{icon}</Text>
        <Animated.Text 
          style={[
            styles.value, 
            { color, transform: [{ scale: scaleAnim }] }
          ]}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Animated.Text>
        {label && <Text style={styles.label}>{label}</Text>}
      </Animated.View>
      
      {showBar && maxValue && (
        <View style={styles.barContainer}>
          <View 
            style={[
              styles.barFill, 
              { 
                width: `${Math.min(100, (value / maxValue) * 100)}%`,
                backgroundColor: color,
              }
            ]} 
          />
        </View>
      )}
      
      {/* Change indicator floating up */}
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
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 60,
  },
  icon: {
    fontSize: 14,
    marginRight: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 10,
    color: '#88a4b8',
    marginLeft: 4,
  },
  barContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  changeIndicator: {
    position: 'absolute',
    top: -10,
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

export default AnimatedResourceBar;
