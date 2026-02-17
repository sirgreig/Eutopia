// src/components/game/FishSchool.tsx
// Animated fish school that drifts through water

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { G, Path, Ellipse } from 'react-native-svg';
import { FishSchool as FishSchoolType } from '../../types';
import { waterToScreenPosition } from '../../services/boatMovement';

interface FishSchoolProps {
  school: FishSchoolType;
  tileSize: number;
  mapOffsetX?: number;
  mapOffsetY?: number;
}

export const FishSchoolComponent: React.FC<FishSchoolProps> = ({
  school,
  tileSize,
  mapOffsetX = 0,
  mapOffsetY = 0,
}) => {
  const swimAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const swim = Animated.loop(
      Animated.sequence([
        Animated.timing(swimAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swimAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    swim.start();
    return () => swim.stop();
  }, []);

  const screenPos = waterToScreenPosition(
    school.position,
    tileSize,
    mapOffsetX,
    mapOffsetY
  );

  const schoolSize = tileSize * 0.85;
  
  // Gentle side-to-side sway
  const translateX = swimAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-2, 2],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: schoolSize,
          height: schoolSize,
          left: screenPos.x - schoolSize / 2,
          top: screenPos.y - schoolSize / 2,
          transform: [{ translateX }],
        },
      ]}
      pointerEvents="none"
    >
      <Svg width={schoolSize} height={schoolSize} viewBox="0 0 60 60">
        {/* Fish 1 - top left, facing right */}
        <G transform="translate(8, 12)">
          <Ellipse cx="8" cy="5" rx="8" ry="4" fill="#f5a623" opacity={0.85} />
          <Path d="M16 5 L22 1 L22 9 Z" fill="#f5a623" opacity={0.85} />
          <Ellipse cx="5" cy="4" rx="1.2" ry="1.2" fill="#333" />
        </G>
        
        {/* Fish 2 - center right, facing right */}
        <G transform="translate(22, 24)">
          <Ellipse cx="9" cy="5.5" rx="9" ry="4.5" fill="#e8963a" opacity={0.8} />
          <Path d="M18 5.5 L25 1 L25 10 Z" fill="#e8963a" opacity={0.8} />
          <Ellipse cx="5.5" cy="4.5" rx="1.3" ry="1.3" fill="#333" />
        </G>
        
        {/* Fish 3 - bottom left, facing right */}
        <G transform="translate(5, 36)">
          <Ellipse cx="7" cy="5" rx="7" ry="3.5" fill="#ffc857" opacity={0.75} />
          <Path d="M14 5 L19 2 L19 8 Z" fill="#ffc857" opacity={0.75} />
          <Ellipse cx="4.5" cy="4" rx="1.1" ry="1.1" fill="#333" />
        </G>
        
        {/* Fish 4 - small, center top */}
        <G transform="translate(30, 8)">
          <Ellipse cx="6" cy="4" rx="6" ry="3" fill="#f0b84d" opacity={0.7} />
          <Path d="M12 4 L16 1.5 L16 6.5 Z" fill="#f0b84d" opacity={0.7} />
          <Ellipse cx="4" cy="3.2" rx="1" ry="1" fill="#333" />
        </G>
        
        {/* Subtle shimmer/sparkle dots */}
        <Ellipse cx="18" cy="20" rx="1" ry="1" fill="#fff" opacity={0.3} />
        <Ellipse cx="38" cy="38" rx="0.8" ry="0.8" fill="#fff" opacity={0.25} />
        <Ellipse cx="45" cy="15" rx="0.8" ry="0.8" fill="#fff" opacity={0.2} />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 4, // Below boats (10) but above water
  },
});

export default FishSchoolComponent;
