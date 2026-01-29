// src/components/game/FreeRoamBoat.tsx
// Boat component for free-roam water system with continuous positioning

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { FreeRoamBoat as FreeRoamBoatType, WaterPosition } from '../../types';
import { FishingBoatIcon, PTBoatIcon } from './Icons';
import { waterToScreenPosition } from '../../services/boatMovement';

interface FreeRoamBoatProps {
  boat: FreeRoamBoatType;
  tileSize: number;
  selected: boolean;
  onPress: () => void;
  mapOffsetX?: number;
  mapOffsetY?: number;
}

export const FreeRoamBoat: React.FC<FreeRoamBoatProps> = ({
  boat,
  tileSize,
  selected,
  onPress,
  mapOffsetX = 0,
  mapOffsetY = 0,
}) => {
  // Animated values for smooth rendering
  const posX = useRef(new Animated.Value(0)).current;
  const posY = useRef(new Animated.Value(0)).current;
  const bobAnim = useRef(new Animated.Value(0)).current;
  
  // Update position smoothly
  useEffect(() => {
    const screenPos = waterToScreenPosition(
      boat.position,
      tileSize,
      mapOffsetX,
      mapOffsetY
    );
    
    // Smooth animation to new position
    Animated.parallel([
      Animated.timing(posX, {
        toValue: screenPos.x,
        duration: 50, // Quick but smooth updates
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(posY, {
        toValue: screenPos.y,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  }, [boat.position.x, boat.position.y, tileSize, mapOffsetX, mapOffsetY]);
  
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
  
  // Interpolate bobbing
  const bobTranslateY = bobAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });
  
  const BoatIcon = boat.type === 'fishing' ? FishingBoatIcon : PTBoatIcon;
  const boatSize = tileSize * 0.9;
  
  return (
    <Animated.View
      style={[
        styles.boatContainer,
        {
          width: boatSize,
          height: boatSize,
          transform: [
            { translateX: Animated.subtract(posX, boatSize / 2) },
            { translateY: Animated.subtract(posY, boatSize / 2) },
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
        <BoatIcon size={boatSize * 0.85} />
      </Pressable>
    </Animated.View>
  );
};

/**
 * Destination marker component - shows where a selected boat is heading
 */
interface DestinationMarkerProps {
  destination: WaterPosition;
  tileSize: number;
  mapOffsetX?: number;
  mapOffsetY?: number;
}

export const DestinationMarker: React.FC<DestinationMarkerProps> = ({
  destination,
  tileSize,
  mapOffsetX = 0,
  mapOffsetY = 0,
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);
  
  const screenPos = waterToScreenPosition(
    destination,
    tileSize,
    mapOffsetX,
    mapOffsetY
  );
  
  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });
  
  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 0.5],
  });
  
  const markerSize = tileSize * 0.4;
  
  return (
    <Animated.View
      style={[
        styles.destinationMarker,
        {
          left: screenPos.x - markerSize / 2,
          top: screenPos.y - markerSize / 2,
          width: markerSize,
          height: markerSize,
          borderRadius: markerSize / 2,
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  boatContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
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
  destinationMarker: {
    position: 'absolute',
    backgroundColor: '#4ade80',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 5,
  },
});

export default FreeRoamBoat;
