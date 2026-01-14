import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface RoundTransitionProps {
  round: number;
  maxRounds: number;
  type: 'start' | 'end';
  onComplete?: () => void;
}

export function RoundTransition({ round, maxRounds, type, onComplete }: RoundTransitionProps) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      // Animate out
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => onComplete?.());
  }, []);

  const isStart = type === 'start';
  const isFinalRound = round === maxRounds;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
        <Text style={styles.label}>{isStart ? 'ROUND' : 'ROUND COMPLETE'}</Text>
        <Animated.Text style={[styles.roundNumber, { opacity: textOpacity }]}>
          {round}
        </Animated.Text>
        <Animated.Text style={[styles.subLabel, { opacity: textOpacity }]}>
          {isStart 
            ? (isFinalRound ? 'FINAL ROUND!' : `of ${maxRounds}`)
            : 'Calculating results...'
          }
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1800,
  },
  content: {
    alignItems: 'center',
    padding: 40,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
    letterSpacing: 3,
    marginBottom: 10,
  },
  roundNumber: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#4caf50',
    textShadowColor: 'rgba(76, 175, 80, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subLabel: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 10,
    letterSpacing: 1,
  },
});
