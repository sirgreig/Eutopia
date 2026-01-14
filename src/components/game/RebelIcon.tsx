import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Rect, G, Polygon, Line } from 'react-native-svg';

interface RebelIconProps {
  size: number;
}

export function RebelIcon({ size }: RebelIconProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Warning background */}
        <Circle cx="50" cy="50" r="45" fill="#e53935" opacity="0.3" />
        
        {/* Rebel figure */}
        <G>
          {/* Body */}
          <Path d="M50,35 L35,70 L45,70 L50,55 L55,70 L65,70 Z" fill="#5d4037" />
          {/* Head */}
          <Circle cx="50" cy="28" r="12" fill="#ffcc80" />
          {/* Angry eyes */}
          <Line x1="44" y1="25" x2="48" y2="28" stroke="#333" strokeWidth="2" />
          <Line x1="52" y1="28" x2="56" y2="25" stroke="#333" strokeWidth="2" />
          <Circle cx="46" cy="28" r="2" fill="#333" />
          <Circle cx="54" cy="28" r="2" fill="#333" />
          {/* Frown */}
          <Path d="M45,34 Q50,31 55,34" stroke="#333" strokeWidth="2" fill="none" />
          {/* Bandana */}
          <Path d="M38,22 Q50,18 62,22 L60,26 Q50,23 40,26 Z" fill="#e53935" />
          {/* Arms raised with torch */}
          <Line x1="40" y1="45" x2="28" y2="35" stroke="#5d4037" strokeWidth="4" />
          <Line x1="60" y1="45" x2="72" y2="35" stroke="#5d4037" strokeWidth="4" />
          {/* Torch */}
          <Rect x="68" y="25" width="6" height="15" fill="#8d6e63" />
          <Path d="M71,25 Q65,15 71,8 Q77,15 71,25" fill="#ff9800" />
          <Path d="M71,22 Q68,16 71,12 Q74,16 71,22" fill="#ffeb3b" />
        </G>
        
        {/* Exclamation mark */}
        <Rect x="80" y="10" width="8" height="20" rx="2" fill="#ffeb3b" />
        <Circle cx="84" cy="38" r="4" fill="#ffeb3b" />
      </Svg>
    </Animated.View>
  );
}
