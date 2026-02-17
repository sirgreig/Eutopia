import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Ellipse, Line, Circle, Path, G } from 'react-native-svg';

interface HurricaneCloudProps {
  size: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration?: number;
  onComplete?: () => void;
}

export function HurricaneCloud({ size, startX, startY, endX, endY, duration = 10000, onComplete }: HurricaneCloudProps) {
  const translateX = useRef(new Animated.Value(startX)).current;
  const translateY = useRef(new Animated.Value(startY)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const lightningOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Continuous rotation — spiral effect
    const rotateAnim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    rotateAnim.start();

    // Pulsing scale — breathing effect
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.08,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseScale, {
          toValue: 0.95,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    pulseAnim.start();

    // Lightning — frequent intense flashes
    const lightningAnim = Animated.loop(
      Animated.sequence([
        Animated.delay(400 + Math.random() * 800),
        Animated.timing(lightningOpacity, {
          toValue: 1,
          duration: 40,
          useNativeDriver: false,
        }),
        Animated.timing(lightningOpacity, {
          toValue: 0,
          duration: 60,
          useNativeDriver: false,
        }),
        Animated.delay(50),
        Animated.timing(lightningOpacity, {
          toValue: 0.9,
          duration: 30,
          useNativeDriver: false,
        }),
        Animated.timing(lightningOpacity, {
          toValue: 0,
          duration: 50,
          useNativeDriver: false,
        }),
        Animated.delay(80),
        Animated.timing(lightningOpacity, {
          toValue: 0.6,
          duration: 40,
          useNativeDriver: false,
        }),
        Animated.timing(lightningOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }),
      ])
    );
    lightningAnim.start();

    // Movement animation
    const moveAnim = Animated.parallel([
      Animated.timing(translateX, {
        toValue: endX,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      Animated.timing(translateY, {
        toValue: endY,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]);
    
    moveAnim.start(() => {
      rotateAnim.stop();
      pulseAnim.stop();
      lightningAnim.stop();
      onComplete?.();
    });

    return () => {
      rotateAnim.stop();
      pulseAnim.stop();
      lightningAnim.stop();
      moveAnim.stop();
    };
  }, []);

  const rotateInterpolated = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const AnimatedSvg = Animated.createAnimatedComponent(Svg);

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
          {/* Lightning bolts */}
          <G opacity={lightningOpacity as any}>
            {/* Left bolt */}
            <Path
              d="M 55 60 L 60 80 L 56 80 L 63 100 L 52 82 L 57 82 L 50 60"
              fill="#fff9c4"
              stroke="#ffee58"
              strokeWidth="0.5"
            />
            <Path
              d="M 55 60 L 60 80 L 56 80 L 63 100 L 52 82 L 57 82 L 50 60"
              fill="#ffff00"
              opacity="0.4"
              strokeWidth="4"
              stroke="#ffff00"
            />
            {/* Right bolt */}
            <Path
              d="M 90 58 L 94 75 L 91 75 L 97 95 L 87 77 L 92 77 L 87 58"
              fill="#fff9c4"
              stroke="#ffee58"
              strokeWidth="0.5"
            />
            {/* Center bolt */}
            <Path
              d="M 72 65 L 76 82 L 73 82 L 79 105 L 69 85 L 74 85 L 68 65"
              fill="#fff9c4"
              stroke="#ffee58"
              strokeWidth="0.5"
            />
          </G>
          
          {/* Torrential rain */}
          <G opacity="0.85">
            <Line x1="20" y1="95" x2="14" y2="125" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
            <Line x1="32" y1="92" x2="26" y2="128" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
            <Line x1="45" y1="94" x2="39" y2="130" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
            <Line x1="55" y1="96" x2="49" y2="132" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
            <Line x1="68" y1="93" x2="62" y2="128" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
            <Line x1="80" y1="95" x2="74" y2="130" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
            <Line x1="92" y1="92" x2="86" y2="126" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
            <Line x1="105" y1="94" x2="99" y2="128" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
            <Line x1="118" y1="93" x2="112" y2="125" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
            <Line x1="130" y1="95" x2="124" y2="124" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />
            {/* Second row */}
            <Line x1="26" y1="100" x2="20" y2="135" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="50" y1="98" x2="44" y2="138" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="74" y1="100" x2="68" y2="140" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="98" y1="99" x2="92" y2="136" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="122" y1="98" x2="116" y2="132" stroke="#42a5f5" strokeWidth="2.5" strokeLinecap="round" />
          </G>
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}
