// src/components/game/AnimatedBoat.tsx
// Boat component with animated tile-by-tile movement

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { Boat, Position } from '../../types';
import { FishingBoatIcon, PTBoatIcon } from './Icons';

interface AnimatedBoatProps {
  boat: Boat;
  tileSize: number;
  selected: boolean;
  path: Position[] | null;
  onPress: () => void;
  onMoveComplete: (boatId: string, newPosition: Position) => void;
  onPathComplete: (boatId: string) => void;
}

const MOVE_DURATION = 400; // ms per tile

export const AnimatedBoat: React.FC<AnimatedBoatProps> = ({
  boat,
  tileSize,
  selected,
  path,
  onPress,
  onMoveComplete,
  onPathComplete,
}) => {
  const posX = useRef(new Animated.Value(boat.position.x * tileSize)).current;
  const posY = useRef(new Animated.Value(boat.position.y * tileSize)).current;
  const bobAnim = useRef(new Animated.Value(0)).current;
  const pathIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  
  // Gentle bobbing animation
  useEffect(() => {
    const bobbing = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    bobbing.start();
    return () => bobbing.stop();
  }, []);
  
  // Handle path movement
  useEffect(() => {
    if (!path || path.length === 0) {
      // No path or empty path - just update position instantly
      posX.setValue(boat.position.x * tileSize);
      posY.setValue(boat.position.y * tileSize);
      isAnimatingRef.current = false;
      pathIndexRef.current = 0;
      return;
    }
    
    // Start animating along path
    pathIndexRef.current = 0;
    isAnimatingRef.current = true;
    animateToNextTile();
  }, [path]);
  
  // Update position when boat position changes externally (without path)
  useEffect(() => {
    if (!path || path.length === 0) {
      posX.setValue(boat.position.x * tileSize);
      posY.setValue(boat.position.y * tileSize);
    }
  }, [boat.position.x, boat.position.y, tileSize]);
  
  const animateToNextTile = () => {
    if (!path || pathIndexRef.current >= path.length) {
      isAnimatingRef.current = false;
      onPathComplete(boat.id);
      return;
    }
    
    const nextPos = path[pathIndexRef.current];
    
    Animated.parallel([
      Animated.timing(posX, {
        toValue: nextPos.x * tileSize,
        duration: MOVE_DURATION,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(posY, {
        toValue: nextPos.y * tileSize,
        duration: MOVE_DURATION,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        // Notify parent of position update
        onMoveComplete(boat.id, nextPos);
        pathIndexRef.current++;
        
        // Continue to next tile
        if (pathIndexRef.current < path.length) {
          animateToNextTile();
        } else {
          isAnimatingRef.current = false;
          onPathComplete(boat.id);
        }
      }
    });
  };
  
  const bobTranslateY = bobAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });
  
  const BoatIcon = boat.type === 'fishing' ? FishingBoatIcon : PTBoatIcon;
  
  return (
    <Animated.View
      style={[
        styles.boatContainer,
        {
          width: tileSize - 4,
          height: tileSize - 4,
          transform: [
            { translateX: posX },
            { translateY: posY },
            { translateY: bobTranslateY },
          ],
        },
      ]}
    >
      <Pressable
        style={[
          styles.boatPressable,
          selected && styles.selectedBoat,
        ]}
        onPress={onPress}
      >
        <BoatIcon size={tileSize * 0.8} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  boatContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    zIndex: 10,
  },
  boatPressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  selectedBoat: {
    borderWidth: 2,
    borderColor: '#ffc107',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    shadowColor: '#ffc107',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default AnimatedBoat;
