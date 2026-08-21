// src/components/game/SinkingBoat.tsx
//
// Three-stage sinking animation, played where a boat was lost.
//
// No new artwork required — this reuses the existing BoatIcon and animates it:
//   1. LIST     (0-250ms)   the boat heels over to ~25 degrees, dips slightly
//   2. GOING    (250-650ms) heels further to ~55 degrees, bow drops, starts sinking
//   3. GONE     (650-1100ms) slides under, fades out, shrinks slightly with depth
//
// A ring of foam expands and fades over the whole sequence to sell the displacement.
//
// Uses the built-in Animated API only (Reanimated is not in this project).

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { FishingBoatIcon, PTBoatIcon } from './Icons';
import { PirateShipIcon } from './PirateShip';
import { BoatType, WaterPosition } from '../../types';

/** Pirates sink too — same animation, different hull. */
export type SinkableType = BoatType | 'pirate';

interface SinkingBoatProps {
  id: string;
  type: SinkableType;
  position: WaterPosition;
  tileSize: number;
  /** Called once the animation finishes so the parent can drop it from state. */
  onComplete: (id: string) => void;
}

const DURATION_LIST = 250;
const DURATION_GOING = 400;
const DURATION_GONE = 450;
export const SINK_ANIMATION_MS = DURATION_LIST + DURATION_GOING + DURATION_GONE;

export const SinkingBoat: React.FC<SinkingBoatProps> = ({
  id,
  type,
  position,
  tileSize,
  onComplete,
}) => {
  // Single 0→1 driver; every visual property interpolates off it, so the stages
  // stay in sync no matter how the timing is tuned.
  const progress = useRef(new Animated.Value(0)).current;
  const foam = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 0.33,
          duration: DURATION_LIST,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0.66,
          duration: DURATION_GOING,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 1,
          duration: DURATION_GONE,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(foam, {
        toValue: 1,
        duration: SINK_ANIMATION_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onComplete(id);
    });
  }, []);

  const boatSize = type === 'pirate' ? tileSize * 0.95 : tileSize * 0.7;

  // Heel over: upright → listing → capsizing
  const rotate = progress.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: ['0deg', '25deg', '55deg', '72deg'],
  });

  // Settle, then drop below the surface
  const translateY = progress.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [0, tileSize * 0.06, tileSize * 0.28, tileSize * 0.8],
  });

  // Hold full opacity while listing, then fade as it goes under
  const opacity = progress.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [1, 1, 0.75, 0],
  });

  // Slight shrink reads as depth rather than distance
  const scale = progress.interpolate({
    inputRange: [0, 0.66, 1],
    outputRange: [1, 0.94, 0.78],
  });

  const foamScale = foam.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1.6],
  });

  const foamOpacity = foam.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0, 0.55, 0],
  });

  return (
    <View
      style={[
        styles.container,
        {
          left: position.x * tileSize - boatSize / 2,
          top: position.y * tileSize - boatSize / 2,
          width: boatSize,
          height: boatSize,
        },
      ]}
      pointerEvents="none"
    >
      {/* Foam ring */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: foamOpacity, transform: [{ scale: foamScale }] },
        ]}
      >
        <Svg width={boatSize} height={boatSize}>
          <Circle
            cx={boatSize / 2}
            cy={boatSize / 2}
            r={boatSize / 2 - 1}
            fill="none"
            stroke="#dff1fb"
            strokeWidth={2}
          />
        </Svg>
      </Animated.View>

      {/* The boat itself */}
      <Animated.View
        style={{
          opacity,
          transform: [{ translateY }, { rotate }, { scale }],
        }}
      >
        {type === 'fishing' ? (
          <FishingBoatIcon size={boatSize} />
        ) : type === 'pt' ? (
          <PTBoatIcon size={boatSize} />
        ) : (
          <PirateShipIcon size={boatSize} />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60,
  },
});

export default SinkingBoat;
