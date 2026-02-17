import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Ellipse, Line, G, ClipPath, Rect, Defs } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

interface RainCloudProps {
  size: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration?: number;
  paused?: boolean;
  onComplete?: () => void;
}

export function RainCloud({ size, startX, startY, endX, endY, duration = 10000, paused = false, onComplete }: RainCloudProps) {
  const translateX = useRef(new Animated.Value(startX)).current;
  const translateY = useRef(new Animated.Value(startY)).current;
  
  // Three rain rows with staggered opacity for falling effect
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
    // Cascading rain: each row fades in top-to-bottom then out, staggered
    const makeRainCycle = (anim: Animated.Value, delay: number) => 
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0.15, duration: 350, useNativeDriver: false }),
        ])
      );

    const r1 = makeRainCycle(rainRow1, 0);
    const r2 = makeRainCycle(rainRow2, 200);
    const r3 = makeRainCycle(rainRow3, 400);
    
    r1.start();
    r2.start();
    r3.start();
    loopAnimsRef.current = [r1, r2, r3];
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
        zIndex: 500,
      }}
    >
      <Svg width={size * 2} height={size * 1.5} viewBox="0 0 100 75">
        <Defs>
          <ClipPath id="rainClipArea">
            <Rect x="15" y="40" width="70" height="35" />
          </ClipPath>
        </Defs>
        
        {/* Cloud body */}
        <G>
          <Ellipse cx="50" cy="25" rx="30" ry="18" fill="#78909c" />
          <Ellipse cx="30" cy="30" rx="20" ry="15" fill="#90a4ae" />
          <Ellipse cx="70" cy="30" rx="22" ry="14" fill="#90a4ae" />
          <Ellipse cx="50" cy="35" rx="35" ry="12" fill="#78909c" />
          <Ellipse cx="40" cy="20" rx="12" ry="8" fill="#b0bec5" opacity="0.6" />
          <Ellipse cx="60" cy="22" rx="10" ry="6" fill="#b0bec5" opacity="0.5" />
        </G>
        
        {/* Rain — 3 cascading rows clipped to rain zone */}
        <G clipPath="url(#rainClipArea)">
          {/* Row 1 — top, falls first */}
          <AnimatedG opacity={rainRow1}>
            <Line x1="25" y1="42" x2="22" y2="52" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
            <Line x1="38" y1="41" x2="35" y2="51" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
            <Line x1="50" y1="42" x2="47" y2="52" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
            <Line x1="62" y1="41" x2="59" y2="51" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
            <Line x1="75" y1="42" x2="72" y2="52" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
          </AnimatedG>
          
          {/* Row 2 — middle */}
          <AnimatedG opacity={rainRow2}>
            <Line x1="30" y1="52" x2="27" y2="62" stroke="#42a5f5" strokeWidth="1.8" strokeLinecap="round" />
            <Line x1="44" y1="53" x2="41" y2="63" stroke="#42a5f5" strokeWidth="1.8" strokeLinecap="round" />
            <Line x1="56" y1="52" x2="53" y2="62" stroke="#42a5f5" strokeWidth="1.8" strokeLinecap="round" />
            <Line x1="68" y1="53" x2="65" y2="63" stroke="#42a5f5" strokeWidth="1.8" strokeLinecap="round" />
          </AnimatedG>
          
          {/* Row 3 — bottom, falls last */}
          <AnimatedG opacity={rainRow3}>
            <Line x1="22" y1="62" x2="19" y2="72" stroke="#90caf9" strokeWidth="1.5" strokeLinecap="round" />
            <Line x1="36" y1="63" x2="33" y2="73" stroke="#90caf9" strokeWidth="1.5" strokeLinecap="round" />
            <Line x1="50" y1="62" x2="47" y2="72" stroke="#90caf9" strokeWidth="1.5" strokeLinecap="round" />
            <Line x1="64" y1="63" x2="61" y2="73" stroke="#90caf9" strokeWidth="1.5" strokeLinecap="round" />
            <Line x1="78" y1="62" x2="75" y2="72" stroke="#90caf9" strokeWidth="1.5" strokeLinecap="round" />
          </AnimatedG>
        </G>
      </Svg>
    </Animated.View>
  );
}
