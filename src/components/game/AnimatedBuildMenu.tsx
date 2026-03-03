// src/components/game/AnimatedBuildMenu.tsx
// Build menu with responsive wrapped grid layout for all screen sizes
// Items wrap into rows automatically based on available width

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
  Easing,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { BuildingType, BoatType, GameMode } from '../../types';
import { BUILDINGS, BOAT_COSTS, getAvailableBuildings } from '../../constants/game';
import {
  HouseIcon,
  FarmIcon,
  FactoryIcon,
  HospitalIcon,
  SchoolIcon,
  FortIcon,
  ApartmentIcon,
  DockIcon,
  LighthouseIcon,
  GranaryIcon,
  MarketplaceIcon,
  WatchtowerIcon,
  FishingBoatIcon,
  PTBoatIcon,
  ConstructionIcon,
} from './Icons';
import { Sounds } from '../../services/soundManager';

const MenuBuildingIcon = ({ type, size }: { type: string; size: number }) => {
  switch (type) {
    case 'house': return <HouseIcon size={size} />;
    case 'farm': return <FarmIcon size={size} />;
    case 'factory': return <FactoryIcon size={size} />;
    case 'hospital': return <HospitalIcon size={size} />;
    case 'school': return <SchoolIcon size={size} />;
    case 'fort': return <FortIcon size={size} />;
    case 'apartment': return <ApartmentIcon size={size} />;
    case 'dock': return <DockIcon size={size} />;
    case 'lighthouse': return <LighthouseIcon size={size} />;
    case 'granary': return <GranaryIcon size={size} />;
    case 'marketplace': return <MarketplaceIcon size={size} />;
    case 'watchtower': return <WatchtowerIcon size={size} />;
    default: return <ConstructionIcon size={size} />;
  }
};

interface AnimatedBuildMenuProps {
  visible: boolean;
  gold: number;
  mode: GameMode;
  onSelectBuilding: (type: BuildingType) => void;
  onSelectBoat: (type: BoatType) => void;
  onClose: () => void;
}

export const AnimatedBuildMenu: React.FC<AnimatedBuildMenuProps> = ({
  visible,
  gold,
  mode,
  onSelectBuilding,
  onSelectBoat,
  onClose,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);
  
  const buildings = getAvailableBuildings(mode);
  
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });
  
  if (!visible) return null;
  
  const handleBuildingPress = (type: BuildingType) => {
    const building = BUILDINGS.find(b => b.type === type);
    if (building && gold >= building.cost) {
      Sounds.buttonClick();
      onSelectBuilding(type);
    } else {
      Sounds.buildError();
    }
  };
  
  const handleBoatPress = (type: BoatType) => {
    const cost = BOAT_COSTS[type];
    if (gold >= cost) {
      Sounds.buttonClick();
      onSelectBoat(type);
    } else {
      Sounds.buildError();
    }
  };
  
  const handleClose = () => {
    Sounds.buttonClick();
    onClose();
  };

  // All items unified
  const allItems = [
    ...buildings.map(b => ({ key: b.type, kind: 'building' as const, type: b.type, name: b.name, cost: b.cost })),
    { key: 'fishing', kind: 'boat' as const, type: 'fishing', name: 'Fishing', cost: BOAT_COSTS.fishing },
    { key: 'pt', kind: 'boat' as const, type: 'pt', name: 'PT Boat', cost: BOAT_COSTS.pt },
  ];

  // Responsive sizing: fit 7 items per row with padding
  const gridPadding = 8;
  const itemMargin = 3;
  const itemsPerRow = 7;
  const availableWidth = screenWidth - (gridPadding * 2);
  const itemWidth = Math.floor(availableWidth / itemsPerRow) - (itemMargin * 2);
  
  // Scale icon and text to item width (icon ~30% larger than before)
  const iconSize = Math.min(Math.floor(itemWidth * 0.72), 56);
  const labelSize = Math.max(Math.floor(itemWidth * 0.11), 9);

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.menu,
          { transform: [{ translateY }] },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>BUILD</Text>
          <View style={styles.goldBadge}>
            <Text style={styles.goldIcon}>💰</Text>
            <Text style={styles.gold}>{gold}</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {/* Wrapped grid — scrolls vertically if needed */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.gridContainer, { paddingHorizontal: gridPadding }]}
        >
          {allItems.map((item) => {
            const disabled = gold < item.cost;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.gridItem,
                  { width: itemWidth, margin: itemMargin, paddingVertical: 6, paddingHorizontal: 4 },
                  disabled && styles.itemDisabled,
                ]}
                onPress={() => item.kind === 'building' 
                  ? handleBuildingPress(item.type as BuildingType)
                  : handleBoatPress(item.type as BoatType)
                }
                activeOpacity={0.7}
              >
                {item.kind === 'building' 
                  ? <MenuBuildingIcon type={item.type} size={iconSize} />
                  : item.type === 'fishing' 
                    ? <FishingBoatIcon size={iconSize} />
                    : <PTBoatIcon size={iconSize} />
                }
                <View style={styles.labelRow}>
                  <Text style={[styles.gridItemName, { fontSize: labelSize }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.gridItemCost, { fontSize: labelSize }, disabled && styles.costDisabled]}>
                    {item.cost}g
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menu: {
    backgroundColor: '#1a2a3a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#3a5a6a',
    paddingBottom: 8,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3a4a',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goldIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  gold: {
    fontSize: 16,
    color: '#ffc107',
    fontWeight: 'bold',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3a4a5a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  gridItem: {
    backgroundColor: '#2a3a4a',
    borderRadius: 8,
    alignItems: 'center',
  },
  itemDisabled: {
    opacity: 0.4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 2,
  },
  gridItemName: {
    color: '#ccc',
    textAlign: 'center',
  },
  gridItemCost: {
    color: '#ffc107',
    fontWeight: 'bold',
  },
  costDisabled: {
    color: '#666',
  },
});

export default AnimatedBuildMenu;
