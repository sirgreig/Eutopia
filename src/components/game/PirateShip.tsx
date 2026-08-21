// src/components/game/PirateShip.tsx
// Animated pirate ship that threatens fishing boats

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { G, Path, Rect, Circle, Line, Polygon } from 'react-native-svg';
import { PirateShip as PirateShipType } from '../../types';
import { waterToScreenPosition } from '../../services/boatMovement';

interface PirateShipProps {
  pirate: PirateShipType;
  tileSize: number;
  mapOffsetX?: number;
  mapOffsetY?: number;
}

/**
 * The pirate ship artwork on its own, so it can be reused outside the moving
 * ship component — notably by SinkingBoat when a PT boat takes one down.
 */
export const PirateShipIcon: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 60 60">
    {/* Hull - dark wood */}
    <Path
      d="M8,38 L14,48 L46,48 L52,38 Z"
      fill="#2d1b0e"
      stroke="#1a0f06"
      strokeWidth="1"
    />
    {/* Hull stripe */}
    <Path d="M11,42 L49,42" stroke="#8b0000" strokeWidth="2" />

    {/* Mast */}
    <Line x1="30" y1="14" x2="30" y2="42" stroke="#3e2723" strokeWidth="2.5" />

    {/* Sail - tattered dark */}
    <Path d="M32,16 L48,22 L46,34 L32,36 Z" fill="#1a1a1a" opacity={0.85} />

    {/* Skull on sail */}
    <Circle cx="39" cy="24" r="4" fill="#e0e0e0" />
    <Circle cx="37.5" cy="23.5" r="1" fill="#1a1a1a" />
    <Circle cx="40.5" cy="23.5" r="1" fill="#1a1a1a" />
    <Line x1="35" y1="30" x2="43" y2="33" stroke="#e0e0e0" strokeWidth="1.2" />
    <Line x1="43" y1="30" x2="35" y2="33" stroke="#e0e0e0" strokeWidth="1.2" />

    {/* Flag at top - red/black */}
    <Polygon points="30,14 30,10 38,12" fill="#8b0000" />

    {/* Wake/water line */}
    <Path
      d="M6,46 Q15,44 30,46 Q45,48 54,46"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="1"
      fill="none"
    />
  </Svg>
);

export const PirateShipComponent: React.FC<PirateShipProps> = ({
  pirate,
  tileSize,
  mapOffsetX = 0,
  mapOffsetY = 0,
}) => {
  const bobAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bob = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    bob.start();
    return () => bob.stop();
  }, []);

  const screenPos = waterToScreenPosition(
    pirate.position,
    tileSize,
    mapOffsetX,
    mapOffsetY
  );

  const shipSize = tileSize * 0.95;

  const bobY = bobAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  // Flip ship horizontally based on movement direction
  const facingLeft = pirate.velocity.vx < 0;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: shipSize,
          height: shipSize,
          left: screenPos.x - shipSize / 2,
          top: screenPos.y - shipSize / 2,
          transform: [
            { translateY: bobY },
            { scaleX: facingLeft ? -1 : 1 },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <PirateShipIcon size={shipSize} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 9, // Below player boats (10) but above fish (4)
  },
});

export default PirateShipComponent;
