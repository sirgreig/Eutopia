import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { BuildingConfig, GameMode } from '../../types/game';
import { getAvailableBuildings, BOAT_COSTS } from '../../constants/game';

interface BuildMenuProps {
  visible: boolean;
  gold: number;
  mode: GameMode;
  onSelectBuilding: (type: BuildingConfig['type']) => void;
  onSelectBoat: (type: 'fishing' | 'pt') => void;
  onClose: () => void;
}

const BUILDING_ICONS: Record<string, string> = {
  farm: '🌾',
  house: '🏠',
  school: '🏫',
  factory: '🏭',
  fort: '🏰',
  hospital: '🏥',
  apartment: '🏢',
  dock: '⚓',
  lighthouse: '🗼',
  granary: '🛏️',
  marketplace: '🪙',
  watchtower: '🗽',
};

export function BuildMenu({ 
  visible, 
  gold, 
  mode, 
  onSelectBuilding, 
  onSelectBoat,
  onClose 
}: BuildMenuProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isLandscape = screenWidth > screenHeight;
  
  if (!visible) return null;
  
  const buildings = getAvailableBuildings(mode);
  const canAfford = (cost: number) => gold >= cost;
  
  // Responsive sizing
  const maxMenuHeight = isLandscape ? screenHeight * 0.92 : screenHeight * 0.85;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.menu, { maxHeight: maxMenuHeight }]} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>BUILD</Text>
            <Text style={styles.goldText}>💰 {gold}</Text>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={true} bounces={false}>
            <Text style={styles.sectionTitle}>Buildings</Text>
            <View style={styles.grid}>
              {buildings.map((building) => {
                const affordable = canAfford(building.cost);
                return (
                  <TouchableOpacity
                    key={building.type}
                    style={[styles.item, !affordable && styles.itemDisabled]}
                    onPress={() => affordable && onSelectBuilding(building.type)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.itemIcon}>{BUILDING_ICONS[building.type] || '🏗️'}</Text>
                    <Text style={styles.itemName}>{building.name}</Text>
                    <Text style={[styles.itemCost, !affordable && styles.costDisabled]}>
                      {building.cost}g
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <Text style={styles.sectionTitle}>Boats</Text>
            <View style={styles.boatRow}>
              <TouchableOpacity
                style={[styles.boatItem, !canAfford(BOAT_COSTS.fishing) && styles.itemDisabled]}
                onPress={() => canAfford(BOAT_COSTS.fishing) && onSelectBoat('fishing')}
                activeOpacity={0.7}
              >
                <Text style={styles.boatEmoji}>🚣</Text>
                <Text style={styles.itemName}>Fishing</Text>
                <Text style={[styles.itemCost, !canAfford(BOAT_COSTS.fishing) && styles.costDisabled]}>
                  {BOAT_COSTS.fishing}g
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.boatItem, !canAfford(BOAT_COSTS.pt) && styles.itemDisabled]}
                onPress={() => canAfford(BOAT_COSTS.pt) && onSelectBoat('pt')}
                activeOpacity={0.7}
              >
                <Text style={styles.boatEmoji}>⛵</Text>
                <Text style={styles.itemName}>PT Boat</Text>
                <Text style={[styles.itemCost, !canAfford(BOAT_COSTS.pt) && styles.costDisabled]}>
                  {BOAT_COSTS.pt}g
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: '#1a2530',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2a3a4a',
    width: '85%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  goldText: {
    fontSize: 16,
    color: '#ffc107',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '48%',
    backgroundColor: '#2a3a4a',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  itemDisabled: {
    opacity: 0.4,
  },
  itemIcon: {
    fontSize: 36,
  },
  itemName: {
    fontSize: 13,
    color: '#e0e0e0',
    marginTop: 4,
    textAlign: 'center',
  },
  itemCost: {
    fontSize: 15,
    color: '#ffc107',
    fontWeight: 'bold',
    marginTop: 3,
  },
  costDisabled: {
    color: '#666',
  },
  boatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boatItem: {
    width: '48%',
    backgroundColor: '#2a3a4a',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  boatEmoji: {
    fontSize: 36,
  },
  closeButton: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#2a3a4a',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: {
    color: '#888',
    fontSize: 14,
  },
});
