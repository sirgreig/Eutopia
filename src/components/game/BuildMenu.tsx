import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { BuildingIcon } from './BuildingIcon';
import { BuildingConfig, GameMode } from '../../types/game';
import { getAvailableBuildings, COLORS, BOAT_COSTS } from '../../constants/game';

interface BuildMenuProps {
  visible: boolean;
  gold: number;
  mode: GameMode;
  onSelectBuilding: (type: BuildingConfig['type']) => void;
  onSelectBoat: (type: 'fishing' | 'pt') => void;
  onClose: () => void;
}

export function BuildMenu({ 
  visible, 
  gold, 
  mode, 
  onSelectBuilding, 
  onSelectBoat,
  onClose 
}: BuildMenuProps) {
  const buildings = getAvailableBuildings(mode);
  
  const canAfford = (cost: number) => gold >= cost;
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.menu}>
              <View style={styles.header}>
                <Text style={styles.title}>BUILD</Text>
                <Text style={styles.goldText}>💰 {gold}</Text>
              </View>
              
              <Text style={styles.sectionTitle}>Buildings</Text>
              <View style={styles.grid}>
                {buildings.map((building) => (
                  <TouchableOpacity
                    key={building.type}
                    style={[
                      styles.item,
                      !canAfford(building.cost) && styles.itemDisabled
                    ]}
                    onPress={() => canAfford(building.cost) && onSelectBuilding(building.type)}
                    disabled={!canAfford(building.cost)}
                  >
                    <BuildingIcon type={building.type} size={36} />
                    <Text style={styles.itemName}>{building.name}</Text>
                    <Text style={[
                      styles.itemCost,
                      !canAfford(building.cost) && styles.costDisabled
                    ]}>
                      {building.cost}g
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.sectionTitle}>Boats</Text>
              <View style={styles.boatRow}>
                <TouchableOpacity
                  style={[
                    styles.boatItem,
                    !canAfford(BOAT_COSTS.fishing) && styles.itemDisabled
                  ]}
                  onPress={() => canAfford(BOAT_COSTS.fishing) && onSelectBoat('fishing')}
                  disabled={!canAfford(BOAT_COSTS.fishing)}
                >
                  <Text style={styles.boatEmoji}>🚣</Text>
                  <Text style={styles.itemName}>Fishing</Text>
                  <Text style={[
                    styles.itemCost,
                    !canAfford(BOAT_COSTS.fishing) && styles.costDisabled
                  ]}>
                    {BOAT_COSTS.fishing}g
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.boatItem,
                    !canAfford(BOAT_COSTS.pt) && styles.itemDisabled
                  ]}
                  onPress={() => canAfford(BOAT_COSTS.pt) && onSelectBoat('pt')}
                  disabled={!canAfford(BOAT_COSTS.pt)}
                >
                  <Text style={styles.boatEmoji}>⛵</Text>
                  <Text style={styles.itemName}>PT Boat</Text>
                  <Text style={[
                    styles.itemCost,
                    !canAfford(BOAT_COSTS.pt) && styles.costDisabled
                  ]}>
                    {BOAT_COSTS.pt}g
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
  menuContainer: {
    width: '90%',
    maxWidth: 360,
  },
  menu: {
    backgroundColor: COLORS.panel,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.panelBorder,
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
    color: COLORS.text,
  },
  goldText: {
    fontSize: 16,
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.textDim,
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
    width: '31%',
    backgroundColor: COLORS.panelLight,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  itemDisabled: {
    opacity: 0.4,
  },
  itemName: {
    fontSize: 11,
    color: COLORS.text,
    marginTop: 4,
  },
  itemCost: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: 'bold',
    marginTop: 2,
  },
  costDisabled: {
    color: COLORS.textDim,
  },
  boatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  boatItem: {
    width: '45%',
    backgroundColor: COLORS.panelLight,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  boatEmoji: {
    fontSize: 28,
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.panelLight,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: {
    color: COLORS.textDim,
    fontSize: 14,
  },
});
