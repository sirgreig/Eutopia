import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Ellipse, Line, Polygon, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

interface StormCloudProps {
  size: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration?: number;
  paused?: boolean;
  onComplete?: () => void;
}

export function StormCloud({ size, startX, startY, endX, endY, duration = 10000, paused = false, onComplete }: StormCloudProps) {
  const translateX = useRef(new Animated.Value(startX)).current;
  const translateY = useRef(new Animated.Value(startY)).current;
  const rainOpacity = useRef(new Animated.Value(0.5)).current;
  const lightningOpacity = useRef(new Animated.Value(0)).current;

  // Pause/resume tracking
  const moveAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const loopAnimsRef = useRef<Animated.CompositeAnimation[]>([]);
  const savedXRef = useRef(startX);
  const savedYRef = useRef(startY);
  const remainingDurationRef = useRef(duration);
  const startedAtRef = useRef(Date.now());
  const elapsedBeforePauseRef = useRef(0);

  const startLoopAnims = () => {
    const rainAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(rainOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(rainOpacity, {
          toValue: 0.4,
          duration: 200,
          useNativeDriver: false,
        }),
      ])
    );

    const lightningAnim = Animated.loop(
      Animated.sequence([
        Animated.delay(800 + Math.random() * 1500),
        Animated.timing(lightningOpacity, {
          toValue: 1,
          duration: 60,
          useNativeDriver: false,
        }),
        Animated.timing(lightningOpacity, {
          toValue: 0,
          duration: 80,
          useNativeDriver: false,
        }),
        Animated.delay(100),
        Animated.timing(lightningOpacity, {
          toValue: 0.7,
          duration: 50,
          useNativeDriver: false,
        }),
        Animated.timing(lightningOpacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: false,
        }),
      ])
    );

    rainAnim.start();
    lightningAnim.start();
    loopAnimsRef.current = [rainAnim, lightningAnim];
  };

  const startMoveAnim = (fromX: number, fromY: number, remainingMs: number) => {
    translateX.setValue(fromX);
    translateY.setValue(fromY);
    startedAtRef.current = Date.now();
    remainingDurationRef.current = remainingMs;

    const moveAnim = Animated.parallel([
      Animated.timing(translateX, {
        toValue: endX,
        duration: remainingMs,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      Animated.timing(translateY, {
        toValue: endY,
        duration: remainingMs,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]);

    moveAnimRef.current = moveAnim;
    moveAnim.start(({ finished }) => {
      if (finished) {
        loopAnimsRef.current.forEach(a => a.stop());
        onComplete?.();
      }
    });
  };

  // Initial start
  useEffect(() => {
    startLoopAnims();
    startMoveAnim(startX, startY, duration);

    return () => {
      loopAnimsRef.current.forEach(a => a.stop());
      moveAnimRef.current?.stop();
    };
  }, []);

  // Handle pause/resume
  useEffect(() => {
    if (paused) {
      translateX.stopAnimation(val => { savedXRef.current = val; });
      translateY.stopAnimation(val => { savedYRef.current = val; });
      moveAnimRef.current?.stop();
      loopAnimsRef.current.forEach(a => a.stop());

      const elapsedThisSegment = Date.now() - startedAtRef.current;
      elapsedBeforePauseRef.current += elapsedThisSegment;
      remainingDurationRef.current = Math.max(0, duration - elapsedBeforePauseRef.current);
    } else {
      if (remainingDurationRef.current > 0) {
        startLoopAnims();
        startMoveAnim(savedXRef.current, savedYRef.current, remainingDurationRef.current);
      }
    }
  }, [paused]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        transform: [{ translateX }, { translateY }],
        zIndex: 510,
      }}
    >
      <Svg width={size * 2.4} height={size * 2} viewBox="0 0 120 100">
        {/* Dark storm cloud body */}
        <G>
          <Ellipse cx="60" cy="22" rx="38" ry="20" fill="#37474f" />
          <Ellipse cx="35" cy="28" rx="25" ry="17" fill="#455a64" />
          <Ellipse cx="85" cy="28" rx="27" ry="16" fill="#455a64" />
          <Ellipse cx="60" cy="35" rx="42" ry="14" fill="#37474f" />
          {/* Purple-ish storm tint */}
          <Ellipse cx="50" cy="25" rx="20" ry="12" fill="#4a148c" opacity="0.2" />
          <Ellipse cx="70" cy="27" rx="18" ry="10" fill="#4a148c" opacity="0.15" />
          {/* Dark underbelly */}
          <Ellipse cx="60" cy="38" rx="35" ry="8" fill="#263238" opacity="0.6" />
        </G>
        
        {/* Lightning bolt (left) */}
        <AnimatedG opacity={lightningOpacity}>
          <Polygon
            points="45,42 50,56 46,56 52,72 43,58 47,58 42,42"
            fill="#fff9c4"
            stroke="#ffee58"
            strokeWidth="0.5"
          />
          {/* Glow effect */}
          <Polygon
            points="45,42 50,56 46,56 52,72 43,58 47,58 42,42"
            fill="#ffff00"
            opacity="0.3"
            strokeWidth="3"
            stroke="#ffff00"
          />
        </AnimatedG>
        
        {/* Lightning bolt (right, offset timing via opacity) */}
        <AnimatedG opacity={lightningOpacity}>
          <Polygon
            points="72,44 76,55 73,55 78,68 70,56 74,56 70,44"
            fill="#fff9c4"
            stroke="#ffee58"
            strokeWidth="0.5"
          />
        </AnimatedG>
        
        {/* Heavy rain drops — more dense than normal rain */}
        <G opacity="0.8">
          {/* Front row */}
          <Line x1="18" y1="48" x2="14" y2="68" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
          <Line x1="28" y1="50" x2="24" y2="72" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
          <Line x1="38" y1="48" x2="34" y2="70" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
          <Line x1="58" y1="50" x2="54" y2="74" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
          <Line x1="68" y1="48" x2="64" y2="68" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
          <Line x1="82" y1="49" x2="78" y2="71" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
          <Line x1="95" y1="48" x2="91" y2="66" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
          {/* Back row */}
          <Line x1="23" y1="55" x2="19" y2="78" stroke="#1e88e5" strokeWidth="2" strokeLinecap="round" />
          <Line x1="33" y1="54" x2="29" y2="76" stroke="#1e88e5" strokeWidth="2" strokeLinecap="round" />
          <Line x1="48" y1="53" x2="44" y2="80" stroke="#1e88e5" strokeWidth="2" strokeLinecap="round" />
          <Line x1="63" y1="55" x2="59" y2="79" stroke="#1e88e5" strokeWidth="2" strokeLinecap="round" />
          <Line x1="75" y1="54" x2="71" y2="76" stroke="#1e88e5" strokeWidth="2" strokeLinecap="round" />
          <Line x1="88" y1="53" x2="84" y2="74" stroke="#1e88e5" strokeWidth="2" strokeLinecap="round" />
          {/* Third row — lightest */}
          <Line x1="15" y1="60" x2="12" y2="82" stroke="#64b5f6" strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="42" y1="58" x2="38" y2="85" stroke="#64b5f6" strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="55" y1="60" x2="51" y2="84" stroke="#64b5f6" strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="78" y1="59" x2="74" y2="82" stroke="#64b5f6" strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="98" y1="57" x2="94" y2="78" stroke="#64b5f6" strokeWidth="1.5" strokeLinecap="round" />
        </G>
      </Svg>
    </Animated.View>
  );
}
