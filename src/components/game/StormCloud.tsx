import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Ellipse, Line, Polygon, G, ClipPath, Rect, Defs } from 'react-native-svg';

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
  const lightningOpacity = useRef(new Animated.Value(0)).current;
  
  // Cascading rain rows — faster than normal rain
  const rainRow1 = useRef(new Animated.Value(0)).current;
  const rainRow2 = useRef(new Animated.Value(0)).current;
  const rainRow3 = useRef(new Animated.Value(0)).current;

  // Pause/resume tracking
  const moveAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const loopAnimsRef = useRef<Animated.CompositeAnimation[]>([]);
  const savedXRef = useRef(startX);
  const savedYRef = useRef(startY);
  const remainingDurationRef = useRef(duration);
  const startedAtRef = useRef(Date.now());
  const elapsedBeforePauseRef = useRef(0);

  const startLoopAnims = () => {
    // Faster cascade for storm intensity
    const makeRainCycle = (anim: Animated.Value, delay: number) => 
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0.1, duration: 250, useNativeDriver: false }),
        ])
      );

    const r1 = makeRainCycle(rainRow1, 0);
    const r2 = makeRainCycle(rainRow2, 140);
    const r3 = makeRainCycle(rainRow3, 280);
    
    r1.start();
    r2.start();
    r3.start();

    // Lightning flash — irregular bursts
    const lightningAnim = Animated.loop(
      Animated.sequence([
        Animated.delay(800 + Math.random() * 1500),
        Animated.timing(lightningOpacity, { toValue: 1, duration: 60, useNativeDriver: false }),
        Animated.timing(lightningOpacity, { toValue: 0, duration: 80, useNativeDriver: false }),
        Animated.delay(100),
        Animated.timing(lightningOpacity, { toValue: 0.7, duration: 50, useNativeDriver: false }),
        Animated.timing(lightningOpacity, { toValue: 0, duration: 120, useNativeDriver: false }),
      ])
    );
    lightningAnim.start();

    loopAnimsRef.current = [r1, r2, r3, lightningAnim];
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

  useEffect(() => {
    startLoopAnims();
    startMoveAnim(startX, startY, duration);
    return () => {
      loopAnimsRef.current.forEach(a => a.stop());
      moveAnimRef.current?.stop();
    };
  }, []);

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
        <Defs>
          <ClipPath id="stormRainClip">
            <Rect x="10" y="42" width="100" height="58" />
          </ClipPath>
        </Defs>
        
        {/* Dark storm cloud body */}
        <G>
          <Ellipse cx="60" cy="22" rx="38" ry="20" fill="#37474f" />
          <Ellipse cx="35" cy="28" rx="25" ry="17" fill="#455a64" />
          <Ellipse cx="85" cy="28" rx="27" ry="16" fill="#455a64" />
          <Ellipse cx="60" cy="35" rx="42" ry="14" fill="#37474f" />
          <Ellipse cx="50" cy="25" rx="20" ry="12" fill="#4a148c" opacity="0.2" />
          <Ellipse cx="70" cy="27" rx="18" ry="10" fill="#4a148c" opacity="0.15" />
          <Ellipse cx="60" cy="38" rx="35" ry="8" fill="#263238" opacity="0.6" />
        </G>
        
        {/* Lightning bolts */}
        <AnimatedG opacity={lightningOpacity}>
          <Polygon
            points="45,42 50,56 46,56 52,72 43,58 47,58 42,42"
            fill="#fff9c4"
            stroke="#ffee58"
            strokeWidth="0.5"
          />
          <Polygon
            points="45,42 50,56 46,56 52,72 43,58 47,58 42,42"
            fill="#ffff00"
            opacity="0.3"
            strokeWidth="3"
            stroke="#ffff00"
          />
          <Polygon
            points="72,44 76,55 73,55 78,68 70,56 74,56 70,44"
            fill="#fff9c4"
            stroke="#ffee58"
            strokeWidth="0.5"
          />
        </AnimatedG>
        
        {/* Heavy rain — 3 cascading rows, denser than normal rain */}
        <G clipPath="url(#stormRainClip)">
          {/* Row 1 — top */}
          <AnimatedG opacity={rainRow1}>
            <Line x1="18" y1="44" x2="14" y2="57" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="30" y1="45" x2="26" y2="58" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="42" y1="44" x2="38" y2="57" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="54" y1="45" x2="50" y2="58" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="66" y1="44" x2="62" y2="57" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="78" y1="45" x2="74" y2="58" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="90" y1="44" x2="86" y2="57" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="102" y1="45" x2="98" y2="58" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
          </AnimatedG>
          
          {/* Row 2 — middle */}
          <AnimatedG opacity={rainRow2}>
            <Line x1="14" y1="58" x2="10" y2="73" stroke="#1e88e5" strokeWidth="2.2" strokeLinecap="round" />
            <Line x1="26" y1="59" x2="22" y2="74" stroke="#1e88e5" strokeWidth="2.2" strokeLinecap="round" />
            <Line x1="38" y1="58" x2="34" y2="73" stroke="#1e88e5" strokeWidth="2.2" strokeLinecap="round" />
            <Line x1="50" y1="59" x2="46" y2="74" stroke="#1e88e5" strokeWidth="2.2" strokeLinecap="round" />
            <Line x1="62" y1="58" x2="58" y2="73" stroke="#1e88e5" strokeWidth="2.2" strokeLinecap="round" />
            <Line x1="74" y1="59" x2="70" y2="74" stroke="#1e88e5" strokeWidth="2.2" strokeLinecap="round" />
            <Line x1="86" y1="58" x2="82" y2="73" stroke="#1e88e5" strokeWidth="2.2" strokeLinecap="round" />
            <Line x1="98" y1="59" x2="94" y2="74" stroke="#1e88e5" strokeWidth="2.2" strokeLinecap="round" />
          </AnimatedG>
          
          {/* Row 3 — bottom */}
          <AnimatedG opacity={rainRow3}>
            <Line x1="20" y1="74" x2="16" y2="90" stroke="#64b5f6" strokeWidth="1.8" strokeLinecap="round" />
            <Line x1="34" y1="75" x2="30" y2="91" stroke="#64b5f6" strokeWidth="1.8" strokeLinecap="round" />
            <Line x1="48" y1="74" x2="44" y2="90" stroke="#64b5f6" strokeWidth="1.8" strokeLinecap="round" />
            <Line x1="60" y1="75" x2="56" y2="91" stroke="#64b5f6" strokeWidth="1.8" strokeLinecap="round" />
            <Line x1="72" y1="74" x2="68" y2="90" stroke="#64b5f6" strokeWidth="1.8" strokeLinecap="round" />
            <Line x1="84" y1="75" x2="80" y2="91" stroke="#64b5f6" strokeWidth="1.8" strokeLinecap="round" />
            <Line x1="96" y1="74" x2="92" y2="90" stroke="#64b5f6" strokeWidth="1.8" strokeLinecap="round" />
          </AnimatedG>
        </G>
      </Svg>
    </Animated.View>
  );
}
