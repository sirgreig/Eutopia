// src/components/game/AnimatedBuilding.tsx
// Animated wrapper for building icons on the island map
// Uses React Native's built-in Animated API (no Reanimated dependency)

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface AnimatedBuildingProps {
  type: string;
  size: number;
  children: React.ReactNode;
  isNew?: boolean;
}

// Animation config per building type
const IDLE_CONFIG: Record<string, {
  type: 'breathe' | 'sway' | 'pulse' | 'vibrate' | 'bob' | 'none';
  intensity?: number;
  speed?: number;
}> = {
  house:       { type: 'breathe', intensity: 0.015, speed: 3000 },
  farm:        { type: 'sway',    intensity: 2.5,   speed: 2500 },
  factory:     { type: 'vibrate', intensity: 0.4,   speed: 150 },
  hospital:    { type: 'pulse',   intensity: 0.04,  speed: 2000 },
  school:      { type: 'bob',     intensity: 1.2,   speed: 2800 },
  fort:        { type: 'none' },
  apartment:   { type: 'breathe', intensity: 0.01,  speed: 3500 },
  dock:        { type: 'sway',    intensity: 2.0,   speed: 3000 },
  lighthouse:  { type: 'pulse',   intensity: 0.03,  speed: 2500 },
  granary:     { type: 'breathe', intensity: 0.012, speed: 3200 },
  marketplace: { type: 'sway',    intensity: 1.8,   speed: 2800 },
  watchtower:  { type: 'none' },
};

const AnimatedBuilding: React.FC<AnimatedBuildingProps> = ({
  type,
  size,
  children,
  isNew = false,
}) => {
  const entranceAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const idleAnim = useRef(new Animated.Value(0)).current;

  const config = IDLE_CONFIG[type] || { type: 'none' };

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [];

    // Entrance: bounce-in via spring
    if (isNew) {
      const entrance = Animated.spring(entranceAnim, {
        toValue: 1,
        friction: 5,
        tension: 180,
        useNativeDriver: true,
      });
      animations.push(entrance);
    }

    // Idle: looping animation with random start delay
    if (config.type !== 'none') {
      const speed = config.speed || 2500;
      const delay = Math.random() * 1000;

      const idleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(idleAnim, {
            toValue: 1,
            duration: speed,
            useNativeDriver: true,
          }),
          Animated.timing(idleAnim, {
            toValue: 0,
            duration: speed,
            useNativeDriver: true,
          }),
        ])
      );

      const delayed = Animated.sequence([
        Animated.delay(delay),
        idleLoop,
      ]);
      animations.push(delayed);
    }

    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }

    return () => {
      entranceAnim.stopAnimation();
      idleAnim.stopAnimation();
    };
  }, []);

  // Build transform based on animation type
  const getTransformStyle = () => {
    const intensity = config.intensity || 0;
    const transforms: any[] = [];

    // Entrance scale (always applied)
    transforms.push({ scale: entranceAnim });

    switch (config.type) {
      case 'breathe': {
        const breatheScale = idleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1 + intensity],
        });
        transforms.push({ scale: breatheScale });
        break;
      }

      case 'sway': {
        const rotate = idleAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [`-${intensity}deg`, `${intensity}deg`, `-${intensity}deg`],
        });
        transforms.push({ rotate });
        break;
      }

      case 'pulse': {
        const pulseScale = idleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1 + intensity],
        });
        const translateY = idleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -0.5],
        });
        transforms.push({ scale: pulseScale });
        transforms.push({ translateY });
        break;
      }

      case 'vibrate': {
        const translateX = idleAnim.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [-intensity, intensity, -intensity, intensity, -intensity],
        });
        transforms.push({ translateX });
        break;
      }

      case 'bob': {
        const translateY = idleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -intensity],
        });
        transforms.push({ translateY });
        break;
      }

      case 'none':
      default:
        break;
    }

    return { transform: transforms };
  };

  return (
    <Animated.View style={[styles.wrapper, { width: size, height: size }, getTransformStyle()]}>
      {children}
      {type === 'factory' && <SmokeOverlay size={size} variant="factory" />}
      {type === 'house' && <SmokeOverlay size={size} variant="house" />}
      {type === 'fort' && <FlagOverlay size={size} />}
    </Animated.View>
  );
};

// --- Smoke Overlay ---
// Factory: 3 larger particles, faster rise
// House: 2 smaller particles, gentle wisps

interface SmokeOverlayProps {
  size: number;
  variant: 'factory' | 'house';
}

const SMOKE_CONFIG = {
  factory: { count: 3, particleSize: 6, duration: 2000, opacity: 0.5, offsetX: 0.55, offsetY: 0.05, spread: 8, rise: 18 },
  house:   { count: 2, particleSize: 4, duration: 2800, opacity: 0.35, offsetX: 0.6, offsetY: 0.08, spread: 5, rise: 14 },
};

const SmokeParticle: React.FC<{
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  startX: number;
  startY: number;
  spread: number;
  rise: number;
}> = ({ delay, duration, size: particleSize, opacity, startX, startY, spread, rise }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => anim.stopAnimation();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -rise],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, spread, spread * 0.5],
  });

  const particleOpacity = anim.interpolate({
    inputRange: [0, 0.15, 0.6, 1],
    outputRange: [0, opacity, opacity * 0.4, 0],
  });

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1.4],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX - particleSize / 2,
        top: startY - particleSize / 2,
        width: particleSize,
        height: particleSize,
        borderRadius: particleSize / 2,
        backgroundColor: '#aaa',
        opacity: particleOpacity,
        transform: [{ translateX }, { translateY }, { scale }],
      }}
    />
  );
};

const SmokeOverlay: React.FC<SmokeOverlayProps> = ({ size, variant }) => {
  const cfg = SMOKE_CONFIG[variant];
  const startX = size * cfg.offsetX;
  const startY = size * cfg.offsetY;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: cfg.count }).map((_, i) => (
        <SmokeParticle
          key={i}
          delay={i * (cfg.duration / cfg.count)}
          duration={cfg.duration}
          size={cfg.particleSize}
          opacity={cfg.opacity}
          startX={startX + (i - cfg.count / 2) * 2}
          startY={startY}
          spread={cfg.spread * (i % 2 === 0 ? 1 : -1)}
          rise={cfg.rise}
        />
      ))}
    </View>
  );
};

// --- Fort Flag Overlay ---

interface FlagOverlayProps {
  size: number;
}

const FlagOverlay: React.FC<FlagOverlayProps> = ({ size }) => {
  const swayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.sequence([
      Animated.delay(Math.random() * 800),
      loop,
    ]).start();
    return () => swayAnim.stopAnimation();
  }, []);

  const rotate = swayAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-12deg', '12deg', '-12deg'],
  });

  const flagWidth = Math.max(6, size * 0.18);
  const flagHeight = Math.max(4, size * 0.12);
  const poleHeight = Math.max(6, size * 0.16);
  const poleX = size * 0.5;
  const poleY = size * 0.02;

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      {/* Pole */}
      <View
        style={{
          position: 'absolute',
          left: poleX - 0.5,
          top: poleY,
          width: 1,
          height: poleHeight,
          backgroundColor: '#888',
        }}
      />
      {/* Flag */}
      <Animated.View
        style={{
          position: 'absolute',
          left: poleX,
          top: poleY,
          width: flagWidth,
          height: flagHeight,
          backgroundColor: '#e53935',
          borderTopRightRadius: 1,
          borderBottomRightRadius: 1,
          transform: [{ rotate }],
          transformOrigin: 'left center',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimatedBuilding;
