// src/components/game/AnimatedBuildMenu.tsx
// Compact build menu with slide animation

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

const ICON_SIZE = 24;

const MenuBuildingIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'house': return <HouseIcon size={ICON_SIZE} />;
    case 'farm': return <FarmIcon size={ICON_SIZE} />;
    case 'factory': return <FactoryIcon size={ICON_SIZE} />;
    case 'hospital': return <HospitalIcon size={ICON_SIZE} />;
    case 'school': return <SchoolIcon size={ICON_SIZE} />;
    case 'fort': return <FortIcon size={ICON_SIZE} />;
    case 'apartment': return <ApartmentIcon size={ICON_SIZE} />;
    case 'dock': return <DockIcon size={ICON_SIZE} />;
    case 'lighthouse': return <LighthouseIcon size={ICON_SIZE} />;
    case 'granary': return <GranaryIcon size={ICON_SIZE} />;
    case 'marketplace': return <MarketplaceIcon size={ICON_SIZE} />;
    case 'watchtower': return <WatchtowerIcon size={ICON_SIZE} />;
    default: return <ConstructionIcon size={ICON_SIZE} />;
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
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Buildings */}
          <Text style={styles.sectionLabel}>BUILDINGS</Text>
          <View style={styles.grid}>
            {buildings.map((b) => {
              const disabled = gold < b.cost;
              return (
                <TouchableOpacity
                  key={b.type}
                  style={[styles.item, disabled && styles.itemDisabled]}
                  onPress={() => handleBuildingPress(b.type)}
                  activeOpacity={0.7}
                >
                  <MenuBuildingIcon type={b.type} />
                  <Text style={styles.itemName} numberOfLines={1}>{b.name}</Text>
                  <Text style={[styles.itemCost, disabled && styles.costDisabled]}>{b.cost}g</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Boats */}
          <Text style={styles.sectionLabel}>BOATS</Text>
          <View style={styles.boatRow}>
            <TouchableOpacity
              style={[styles.boatItem, gold < BOAT_COSTS.fishing && styles.itemDisabled]}
              onPress={() => handleBoatPress('fishing')}
              activeOpacity={0.7}
            >
              <FishingBoatIcon size={ICON_SIZE} />
              <Text style={styles.itemName}>Fishing</Text>
              <Text style={[styles.itemCost, gold < BOAT_COSTS.fishing && styles.costDisabled]}>
                {BOAT_COSTS.fishing}g
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.boatItem, gold < BOAT_COSTS.pt && styles.itemDisabled]}
              onPress={() => handleBoatPress('pt')}
              activeOpacity={0.7}
            >
              <PTBoatIcon size={ICON_SIZE} />
              <Text style={styles.itemName}>PT Boat</Text>
              <Text style={[styles.itemCost, gold < BOAT_COSTS.pt && styles.costDisabled]}>
                {BOAT_COSTS.pt}g
              </Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '50%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#3a5a6a',
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
  scroll: {
    maxHeight: 300,
  },
  content: {
    padding: 8,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6a8a9a',
    marginBottom: 8,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  item: {
    width: 70,
    backgroundColor: '#2a3a4a',
    borderRadius: 8,
    padding: 6,
    margin: 3,
    alignItems: 'center',
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
  boatRow: {
    flexDirection: 'row',
  },
  boatItem: {
    width: 90,
    backgroundColor: '#2a3a4a',
    borderRadius: 8,
    padding: 8,
    margin: 3,
    alignItems: 'center',
  },
});

export default AnimatedBuildMenu;
