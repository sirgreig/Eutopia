import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Ellipse, Line, Circle, Path, G, ClipPath, Rect, Defs } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

interface HurricaneCloudProps {
  size: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration?: number;
  paused?: boolean;
  onComplete?: () => void;
}

export function HurricaneCloud({ size, startX, startY, endX, endY, duration = 10000, paused = false, onComplete }: HurricaneCloudProps) {
  const translateX = useRef(new Animated.Value(startX)).current;
  const translateY = useRef(new Animated.Value(startY)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const lightningOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  // Cascading rain rows — fastest for hurricane
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
    // Rotation — spiral effect
    const rotateAnim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );

    // Pulsing scale — breathing effect
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.08, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(pulseScale, { toValue: 0.95, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    );

    // Lightning — frequent intense flashes
    const lightningAnim = Animated.loop(
      Animated.sequence([
        Animated.delay(400 + Math.random() * 800),
        Animated.timing(lightningOpacity, { toValue: 1, duration: 40, useNativeDriver: false }),
        Animated.timing(lightningOpacity, { toValue: 0, duration: 60, useNativeDriver: false }),
        Animated.delay(50),
        Animated.timing(lightningOpacity, { toValue: 0.9, duration: 30, useNativeDriver: false }),
        Animated.timing(lightningOpacity, { toValue: 0, duration: 50, useNativeDriver: false }),
        Animated.delay(80),
        Animated.timing(lightningOpacity, { toValue: 0.6, duration: 40, useNativeDriver: false }),
        Animated.timing(lightningOpacity, { toValue: 0, duration: 100, useNativeDriver: false }),
      ])
    );

    // Fastest rain cascade for torrential downpour
    const makeRainCycle = (anim: Animated.Value, delay: number) => 
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0.05, duration: 180, useNativeDriver: false }),
        ])
      );

    const r1 = makeRainCycle(rainRow1, 0);
    const r2 = makeRainCycle(rainRow2, 100);
    const r3 = makeRainCycle(rainRow3, 200);

    rotateAnim.start();
    pulseAnim.start();
    lightningAnim.start();
    r1.start();
    r2.start();
    r3.start();
    loopAnimsRef.current = [rotateAnim, pulseAnim, lightningAnim, r1, r2, r3];
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

  const rotateInterpolated = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        transform: [{ translateX }, { translateY }],
        zIndex: 520,
      }}
    >
      {/* Rotating cloud body */}
      <Animated.View
        style={{
          width: size * 3,
          height: size * 3,
          transform: [
            { rotate: rotateInterpolated },
            { scale: pulseScale },
          ],
        }}
      >
        <Svg width={size * 3} height={size * 3} viewBox="0 0 150 150">
          {/* Outer dark mass */}
          <Ellipse cx="75" cy="75" rx="65" ry="60" fill="#1a237e" opacity="0.3" />
          <Ellipse cx="75" cy="75" rx="55" ry="50" fill="#263238" opacity="0.5" />
          
          {/* Spiral arms */}
          <Path
            d="M 75 75 Q 95 55 115 60 Q 130 70 120 90 Q 110 110 85 105"
            stroke="#37474f"
            strokeWidth="12"
            fill="none"
            opacity="0.7"
          />
          <Path
            d="M 75 75 Q 55 95 35 90 Q 20 80 30 60 Q 40 40 65 45"
            stroke="#37474f"
            strokeWidth="12"
            fill="none"
            opacity="0.7"
          />
          
          {/* Inner cloud layers */}
          <Ellipse cx="75" cy="65" rx="35" ry="28" fill="#263238" />
          <Ellipse cx="55" cy="75" rx="28" ry="22" fill="#2c3e50" />
          <Ellipse cx="95" cy="75" rx="30" ry="20" fill="#2c3e50" />
          <Ellipse cx="75" cy="82" rx="38" ry="18" fill="#1c2833" />
          
          {/* Purple storm tint */}
          <Ellipse cx="70" cy="70" rx="25" ry="18" fill="#4a148c" opacity="0.25" />
          <Ellipse cx="80" cy="78" rx="20" ry="14" fill="#b71c1c" opacity="0.15" />
          
          {/* Eye of the hurricane */}
          <Circle cx="75" cy="75" r="8" fill="#0d1b2a" />
          <Circle cx="75" cy="75" r="5" fill="#1b2838" opacity="0.8" />
          <Circle cx="75" cy="75" r="12" stroke="#455a64" strokeWidth="2" fill="none" opacity="0.5" />
        </Svg>
      </Animated.View>

      {/* Non-rotating rain and lightning layer */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size * 3,
          height: size * 3,
        }}
      >
        <Svg width={size * 3} height={size * 3} viewBox="0 0 150 150">
          <Defs>
            <ClipPath id="hurRainClip">
              <Rect x="10" y="85" width="130" height="65" />
            </ClipPath>
          </Defs>
          
          {/* Lightning bolts */}
          <AnimatedG opacity={lightningOpacity}>
            <Path d="M 55 60 L 60 80 L 56 80 L 63 100 L 52 82 L 57 82 L 50 60" fill="#fff9c4" stroke="#ffee58" strokeWidth="0.5" />
            <Path d="M 55 60 L 60 80 L 56 80 L 63 100 L 52 82 L 57 82 L 50 60" fill="#ffff00" opacity="0.4" strokeWidth="4" stroke="#ffff00" />
            <Path d="M 90 58 L 94 75 L 91 75 L 97 95 L 87 77 L 92 77 L 87 58" fill="#fff9c4" stroke="#ffee58" strokeWidth="0.5" />
            <Path d="M 72 65 L 76 82 L 73 82 L 79 105 L 69 85 L 74 85 L 68 65" fill="#fff9c4" stroke="#ffee58" strokeWidth="0.5" />
          </AnimatedG>
          
          {/* Torrential rain — 3 cascading rows */}
          <G clipPath="url(#hurRainClip)">
            {/* Row 1 — top */}
            <AnimatedG opacity={rainRow1}>
              <Line x1="20" y1="88" x2="14" y2="103" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
              <Line x1="35" y1="87" x2="29" y2="102" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
              <Line x1="50" y1="88" x2="44" y2="103" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
              <Line x1="65" y1="87" x2="59" y2="102" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
              <Line x1="80" y1="88" x2="74" y2="103" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
              <Line x1="95" y1="87" x2="89" y2="102" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
              <Line x1="110" y1="88" x2="104" y2="103" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
              <Line x1="125" y1="87" x2="119" y2="102" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
            </AnimatedG>
            
            {/* Row 2 — middle */}
            <AnimatedG opacity={rainRow2}>
              <Line x1="15" y1="105" x2="9" y2="122" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
              <Line x1="30" y1="106" x2="24" y2="123" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
              <Line x1="45" y1="105" x2="39" y2="122" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
              <Line x1="60" y1="106" x2="54" y2="123" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
              <Line x1="75" y1="105" x2="69" y2="122" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
              <Line x1="90" y1="106" x2="84" y2="123" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
              <Line x1="105" y1="105" x2="99" y2="122" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
              <Line x1="120" y1="106" x2="114" y2="123" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
            </AnimatedG>
            
            {/* Row 3 — bottom */}
            <AnimatedG opacity={rainRow3}>
              <Line x1="22" y1="124" x2="16" y2="142" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
              <Line x1="40" y1="125" x2="34" y2="143" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
              <Line x1="58" y1="124" x2="52" y2="142" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
              <Line x1="76" y1="125" x2="70" y2="143" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
              <Line x1="94" y1="124" x2="88" y2="142" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
              <Line x1="112" y1="125" x2="106" y2="143" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
              <Line x1="130" y1="124" x2="124" y2="142" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
            </AnimatedG>
          </G>
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}
