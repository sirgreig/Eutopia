// src/components/game/AnimatedBuildMenu.tsx
// Compact build menu optimized for landscape mode on all screen sizes

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
  
  // Detect if we're in landscape with limited height (iPhone landscape)
  const isLandscapeLimited = screenHeight < 450;
  const iconSize = isLandscapeLimited ? 20 : 24;
  const itemPadding = isLandscapeLimited ? 4 : 6;
  
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
    outputRange: [200, 0],
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

  // Compact single-row layout for landscape iPhone
  if (isLandscapeLimited) {
    return (
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.compactMenu,
            { transform: [{ translateY }] },
          ]}
        >
          {/* Header row */}
          <View style={styles.compactHeader}>
            <Text style={styles.compactTitle}>BUILD</Text>
            <Text style={styles.compactGold}>💰 {gold}</Text>
            <TouchableOpacity style={styles.compactCloseBtn} onPress={handleClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {/* Single scrollable row with all items */}
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.compactScrollContent}
          >
            {/* Buildings */}
            {buildings.map((b) => {
              const disabled = gold < b.cost;
              return (
                <TouchableOpacity
                  key={b.type}
                  style={[
                    styles.compactItem,
                    { padding: itemPadding },
                    disabled && styles.itemDisabled
                  ]}
                  onPress={() => handleBuildingPress(b.type)}
                  activeOpacity={0.7}
                >
                  <MenuBuildingIcon type={b.type} size={iconSize} />
                  <Text style={styles.compactItemName} numberOfLines={1}>{b.name}</Text>
                  <Text style={[styles.compactItemCost, disabled && styles.costDisabled]}>{b.cost}g</Text>
                </TouchableOpacity>
              );
            })}
            
            {/* Divider */}
            <View style={styles.divider} />
            
            {/* Boats */}
            <TouchableOpacity
              style={[
                styles.compactItem,
                { padding: itemPadding },
                gold < BOAT_COSTS.fishing && styles.itemDisabled
              ]}
              onPress={() => handleBoatPress('fishing')}
              activeOpacity={0.7}
            >
              <FishingBoatIcon size={iconSize} />
              <Text style={styles.compactItemName}>Fishing</Text>
              <Text style={[styles.compactItemCost, gold < BOAT_COSTS.fishing && styles.costDisabled]}>
                {BOAT_COSTS.fishing}g
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.compactItem,
                { padding: itemPadding },
                gold < BOAT_COSTS.pt && styles.itemDisabled
              ]}
              onPress={() => handleBoatPress('pt')}
              activeOpacity={0.7}
            >
              <PTBoatIcon size={iconSize} />
              <Text style={styles.compactItemName}>PT Boat</Text>
              <Text style={[styles.compactItemCost, gold < BOAT_COSTS.pt && styles.costDisabled]}>
                {BOAT_COSTS.pt}g
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    );
  }
  
  // Standard layout for iPad / larger screens
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
          <Text style={styles.gold}>💰 {gold}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Buildings */}
          {buildings.map((b) => {
            const disabled = gold < b.cost;
            return (
              <TouchableOpacity
                key={b.type}
                style={[styles.item, disabled && styles.itemDisabled]}
                onPress={() => handleBuildingPress(b.type)}
                activeOpacity={0.7}
              >
                <MenuBuildingIcon type={b.type} size={iconSize} />
                <Text style={styles.itemName} numberOfLines={1}>{b.name}</Text>
                <Text style={[styles.itemCost, disabled && styles.costDisabled]}>{b.cost}g</Text>
              </TouchableOpacity>
            );
          })}
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Boats */}
          <TouchableOpacity
            style={[styles.item, gold < BOAT_COSTS.fishing && styles.itemDisabled]}
            onPress={() => handleBoatPress('fishing')}
            activeOpacity={0.7}
          >
            <FishingBoatIcon size={iconSize} />
            <Text style={styles.itemName}>Fishing</Text>
            <Text style={[styles.itemCost, gold < BOAT_COSTS.fishing && styles.costDisabled]}>
              {BOAT_COSTS.fishing}g
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.item, gold < BOAT_COSTS.pt && styles.itemDisabled]}
            onPress={() => handleBoatPress('pt')}
            activeOpacity={0.7}
          >
            <PTBoatIcon size={iconSize} />
            <Text style={styles.itemName}>PT Boat</Text>
            <Text style={[styles.itemCost, gold < BOAT_COSTS.pt && styles.costDisabled]}>
              {BOAT_COSTS.pt}g
            </Text>
          </TouchableOpacity>
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
  
  // Compact layout for landscape iPhone
  compactMenu: {
    backgroundColor: '#1a2a3a',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#3a5a6a',
    paddingBottom: 8,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3a4a',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  compactGold: {
    fontSize: 12,
    color: '#ffc107',
    fontWeight: 'bold',
  },
  compactCloseBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3a4a5a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactScrollContent: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  compactItem: {
    backgroundColor: '#2a3a4a',
    borderRadius: 6,
    marginHorizontal: 3,
    alignItems: 'center',
    minWidth: 52,
  },
  compactItemName: {
    fontSize: 8,
    color: '#ccc',
    marginTop: 2,
    textAlign: 'center',
  },
  compactItemCost: {
    fontSize: 9,
    color: '#ffc107',
    fontWeight: 'bold',
    marginTop: 1,
  },
  
  // Standard layout for iPad
  menu: {
    backgroundColor: '#1a2a3a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#3a5a6a',
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3a4a',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  gold: {
    fontSize: 14,
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
  closeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  item: {
    backgroundColor: '#2a3a4a',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    minWidth: 65,
  },
  itemDisabled: {
    opacity: 0.4,
  },
  itemName: {
    fontSize: 9,
    color: '#ccc',
    marginTop: 4,
    textAlign: 'center',
  },
  itemCost: {
    fontSize: 11,
    color: '#ffc107',
    fontWeight: 'bold',
    marginTop: 2,
  },
  costDisabled: {
    color: '#666',
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: '#3a5a6a',
    marginHorizontal: 8,
  },
});

export default AnimatedBuildMenu;
