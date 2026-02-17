import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Polygon, Rect, G, Text as SvgText } from 'react-native-svg';

type ToastType = 'gold' | 'population' | 'rebel' | 'rain' | 'round' | 'build' | 'error' | 'stability';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

// Compact types show as small floating pill near gold counter
const COMPACT_TYPES: ToastType[] = ['gold', 'rain'];

const ToastIcon = ({ type, size = 24 }: { type: ToastType; size?: number }) => {
  switch (type) {
    case 'gold':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" fill="#ffc107" />
          <Circle cx="50" cy="50" r="35" fill="#ffca28" />
          <SvgText x="50" y="68" fontSize="45" fontWeight="bold" fill="#ff8f00" textAnchor="middle">$</SvgText>
        </Svg>
      );
    case 'population':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx="50" cy="30" r="20" fill="#90caf9" />
          <Path d="M20,90 Q20,55 50,55 Q80,55 80,90 Z" fill="#64b5f6" />
          <Circle cx="25" cy="40" r="12" fill="#bbdefb" />
          <Path d="M5,90 Q5,65 25,65 Q45,65 45,90 Z" fill="#90caf9" />
          <Circle cx="75" cy="40" r="12" fill="#bbdefb" />
          <Path d="M55,90 Q55,65 75,65 Q95,65 95,90 Z" fill="#90caf9" />
        </Svg>
      );
    case 'rebel':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" fill="#e53935" opacity="0.3" />
          <Polygon points="50,15 58,40 85,40 63,55 72,85 50,68 28,85 37,55 15,40 42,40" fill="#e53935" />
          <Circle cx="50" cy="50" r="15" fill="#ffeb3b" />
          <Rect x="47" y="35" width="6" height="18" fill="#e53935" />
          <Circle cx="50" cy="60" r="4" fill="#e53935" />
        </Svg>
      );
    case 'rain':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx="35" cy="35" r="20" fill="#78909c" />
          <Circle cx="60" cy="35" r="25" fill="#90a4ae" />
          <Circle cx="50" cy="45" r="22" fill="#78909c" />
          <Path d="M25,60 L20,80" stroke="#64b5f6" strokeWidth="4" strokeLinecap="round" />
          <Path d="M45,60 L40,85" stroke="#64b5f6" strokeWidth="4" strokeLinecap="round" />
          <Path d="M65,60 L60,80" stroke="#64b5f6" strokeWidth="4" strokeLinecap="round" />
          <Path d="M80,55 L75,75" stroke="#64b5f6" strokeWidth="4" strokeLinecap="round" />
        </Svg>
      );
    case 'round':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" fill="none" stroke="#4caf50" strokeWidth="8" />
          <Path d="M50,20 L50,50 L70,65" stroke="#4caf50" strokeWidth="8" strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'build':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Rect x="30" y="50" width="40" height="40" fill="#8d6e63" />
          <Polygon points="50,20 20,50 80,50" fill="#a1887f" />
          <Rect x="42" y="65" width="16" height="25" fill="#5d4037" />
          <Rect x="25" y="35" width="10" height="20" fill="#ffb74d" />
          <Circle cx="70" cy="30" r="15" fill="#ffd54f" />
        </Svg>
      );
    case 'error':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" fill="#f44336" />
          <Rect x="25" y="45" width="50" height="10" fill="#fff" rx="5" transform="rotate(45 50 50)" />
          <Rect x="25" y="45" width="50" height="10" fill="#fff" rx="5" transform="rotate(-45 50 50)" />
        </Svg>
      );
    case 'stability':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" fill="#4caf50" opacity="0.3" />
          <Path d="M25,50 L45,70 L80,30" stroke="#4caf50" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    default:
      return null;
  }
};

const getBackgroundColor = (type: ToastType): string => {
  switch (type) {
    case 'gold': return 'rgba(255, 193, 7, 0.95)';
    case 'population': return 'rgba(33, 150, 243, 0.95)';
    case 'rebel': return 'rgba(229, 57, 53, 0.95)';
    case 'rain': return 'rgba(120, 144, 156, 0.95)';
    case 'round': return 'rgba(76, 175, 80, 0.95)';
    case 'build': return 'rgba(121, 85, 72, 0.95)';
    case 'error': return 'rgba(244, 67, 54, 0.95)';
    case 'stability': return 'rgba(76, 175, 80, 0.95)';
    default: return 'rgba(0, 0, 0, 0.85)';
  }
};

const getTextColor = (type: ToastType): string => {
  switch (type) {
    case 'gold': return '#5d4037';
    case 'population': return '#fff';
    case 'rebel': return '#fff';
    case 'rain': return '#fff';
    case 'round': return '#fff';
    case 'build': return '#fff';
    case 'error': return '#fff';
    case 'stability': return '#fff';
    default: return '#fff';
  }
};

export function Toast({ message, type = 'round', duration = 2000, onHide }: ToastProps) {
  const isCompact = COMPACT_TYPES.includes(type);
  const translateY = useRef(new Animated.Value(isCompact ? -20 : -100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(isCompact ? 0.8 : 1)).current;

  useEffect(() => {
    const compactDuration = Math.min(duration, 1200);
    const effectiveDuration = isCompact ? compactDuration : duration;

    // Animate in
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: isCompact ? 150 : 300,
        easing: isCompact ? Easing.out(Easing.ease) : Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: isCompact ? 100 : 200,
        useNativeDriver: true,
      }),
      ...(isCompact ? [Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 200,
        useNativeDriver: true,
      })] : []),
    ]).start();

    // Animate out
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: isCompact ? -10 : -100,
          duration: isCompact ? 200 : 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: isCompact ? 150 : 200,
          useNativeDriver: true,
        }),
      ]).start(() => onHide?.());
    }, effectiveDuration);

    return () => clearTimeout(timer);
  }, []);

  if (isCompact) {
    return (
      <Animated.View
        style={[
          styles.compactContainer,
          {
            backgroundColor: type === 'rain' ? 'rgba(100, 181, 246, 0.9)' : 'rgba(255, 193, 7, 0.9)',
            transform: [{ translateY }, { scale }],
            opacity,
          },
        ]}
        pointerEvents="none"
      >
        <ToastIcon type={type} size={18} />
        <Text style={[styles.compactMessage, { color: type === 'rain' ? '#fff' : '#5d4037' }]}>
          {message}
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(type),
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <ToastIcon type={type} size={28} />
      <Text style={[styles.message, { color: getTextColor(type) }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Full-width banner for important events
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    zIndex: 1500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 12,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  // Compact floating pill for gold-earning events
  compactContainer: {
    position: 'absolute',
    top: 52,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    zIndex: 1500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    gap: 6,
  },
  compactMessage: {
    fontSize: 13,
    fontWeight: '700',
  },
});
