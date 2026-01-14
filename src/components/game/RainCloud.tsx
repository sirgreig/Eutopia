import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Ellipse, Line, G } from 'react-native-svg';

interface RainCloudProps {
  size: number;
  startX: number;
  y: number;
  duration?: number;
  onComplete?: () => void;
}

export function RainCloud({ size, startX, y, duration = 8000, onComplete }: RainCloudProps) {
  const translateX = useRef(new Animated.Value(startX)).current;
  const rainOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rain animation
    const rainAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(rainOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(rainOpacity, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: false,
        }),
      ])
    );
    rainAnim.start();

    // Movement animation
    const moveAnim = Animated.timing(translateX, {
      toValue: startX + 500,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    
    moveAnim.start(() => {
      rainAnim.stop();
      onComplete?.();
    });

    return () => {
      rainAnim.stop();
      moveAnim.stop();
    };
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: y,
        left: 0,
        transform: [{ translateX }],
        zIndex: 500,
      }}
    >
      <Svg width={size * 2} height={size * 1.5} viewBox="0 0 100 75">
        {/* Cloud body */}
        <G>
          <Ellipse cx="50" cy="25" rx="30" ry="18" fill="#78909c" />
          <Ellipse cx="30" cy="30" rx="20" ry="15" fill="#90a4ae" />
          <Ellipse cx="70" cy="30" rx="22" ry="14" fill="#90a4ae" />
          <Ellipse cx="50" cy="35" rx="35" ry="12" fill="#78909c" />
          {/* Cloud highlights */}
          <Ellipse cx="40" cy="20" rx="12" ry="8" fill="#b0bec5" opacity="0.6" />
          <Ellipse cx="60" cy="22" rx="10" ry="6" fill="#b0bec5" opacity="0.5" />
        </G>
        
        {/* Rain drops */}
        <G opacity="0.7">
          <Line x1="25" y1="45" x2="22" y2="60" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
          <Line x1="35" y1="48" x2="32" y2="68" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
          <Line x1="45" y1="45" x2="42" y2="63" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
          <Line x1="55" y1="47" x2="52" y2="67" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
          <Line x1="65" y1="45" x2="62" y2="62" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
          <Line x1="75" y1="46" x2="72" y2="58" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" />
          {/* Second row of drops */}
          <Line x1="30" y1="52" x2="27" y2="70" stroke="#42a5f5" strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="50" y1="50" x2="47" y2="72" stroke="#42a5f5" strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="70" y1="51" x2="67" y2="68" stroke="#42a5f5" strokeWidth="1.5" strokeLinecap="round" />
        </G>
      </Svg>
    </Animated.View>
  );
}
