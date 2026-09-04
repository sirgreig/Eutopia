// src/components/game/BattleOverlay.tsx
//
// Three-exchange battle between a PT boat and a pirate ship.
//
// IMPORTANT: the outcome is decided BEFORE this renders (see BALANCE.ptBoatLossChance).
// The damage numbers are generated backwards from that result so the loser's health
// lands on exactly zero at the third exchange. This is theatre over a decision
// already made — it must never alter the odds.
//
// Non-blocking by design: the round timer keeps running underneath, and in
// multiplayer it is host-authoritative and shared, so pausing is not an option.
// pointerEvents is 'none' throughout.
//
// No new artwork — reuses PTBoatIcon and PirateShipIcon with animated health bars.

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';
import { PTBoatIcon } from './Icons';
import { PirateShipIcon } from './PirateShip';
import { Sounds } from '../../services/soundManager';

export interface BattlePlan {
  /** Damage dealt TO the PT boat, per exchange */
  ptDamage: number[];
  /** Damage dealt TO the pirate, per exchange */
  pirateDamage: number[];
  ptWins: boolean;
}

interface BattleOverlayProps {
  plan: BattlePlan | null;
  onComplete: () => void;
}

const EXCHANGE_MS = 1150;
const RESULT_MS = 1300;
export const BATTLE_TOTAL_MS = EXCHANGE_MS * 3 + RESULT_MS; // ~4.75s

/**
 * Build a plan that reaches the predetermined outcome.
 * The loser's damage always totals exactly 100; the winner survives on 20-55%.
 */
export function buildBattlePlan(ptWins: boolean): BattlePlan {
  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  // Loser: three hits summing to 100, weighted so the final blow feels decisive
  const a = Math.round(rand(22, 34));
  const b = Math.round(rand(24, 38));
  const loserDamage = [a, b, 100 - a - b];

  // Winner: takes real damage but survives
  const total = Math.round(rand(45, 80));
  const x = Math.round(total * rand(0.25, 0.4));
  const y = Math.round(total * rand(0.25, 0.4));
  const winnerDamage = [x, y, total - x - y];

  return {
    ptWins,
    ptDamage: ptWins ? winnerDamage : loserDamage,
    pirateDamage: ptWins ? loserDamage : winnerDamage,
  };
}

const HealthBar: React.FC<{ health: number; color: string }> = ({ health, color }) => (
  <View style={styles.healthTrack}>
    <View
      style={[
        styles.healthFill,
        { width: `${Math.max(0, health)}%`, backgroundColor: color },
      ]}
    />
  </View>
);

export const BattleOverlay: React.FC<BattleOverlayProps> = ({ plan, onComplete }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [exchange, setExchange] = useState(0); // 0 = not started, 1-3 = exchanges, 4 = result
  const [ptHealth, setPtHealth] = useState(100);
  const [pirateHealth, setPirateHealth] = useState(100);
  const [lastPtHit, setLastPtHit] = useState<number | null>(null);
  const [lastPirateHit, setLastPirateHit] = useState<number | null>(null);

  const fade = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const timers = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (!plan) return;

    setExchange(0);
    setPtHealth(100);
    setPirateHealth(100);
    setLastPtHit(null);
    setLastPirateHit(null);

    Animated.timing(fade, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // Three exchanges, then the result
    for (let i = 0; i < 3; i++) {
      timers.current.push(
        setTimeout(() => {
          setExchange(i + 1);
          setLastPtHit(plan.ptDamage[i]);
          setLastPirateHit(plan.pirateDamage[i]);
          setPtHealth(h => Math.max(0, h - plan.ptDamage[i]));
          setPirateHealth(h => Math.max(0, h - plan.pirateDamage[i]));

          Sounds.cannonFire();

          // Recoil
          shake.setValue(0);
          Animated.sequence([
            Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
            Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
          ]).start();
        }, i * EXCHANGE_MS + 250)
      );
    }

    timers.current.push(
      setTimeout(() => {
        setExchange(4);
        Sounds.boatCrash();
      }, 3 * EXCHANGE_MS + 250)
    );

    timers.current.push(setTimeout(onComplete, BATTLE_TOTAL_MS));

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [plan]);

  if (!plan) return null;

  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-3, 3] });
  const cardWidth = Math.min(screenWidth * 0.62, 360);

  const resultText = exchange === 4
    ? (plan.ptWins ? 'PIRATES SUNK' : 'PT BOAT LOST')
    : `EXCHANGE ${Math.max(1, exchange)} OF 3`;

  return (
    <View
      style={[styles.overlay, { width: screenWidth, height: screenHeight }]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.card,
          { width: cardWidth, opacity: fade, transform: [{ translateX: shakeX }] },
        ]}
      >
        <Text style={styles.title}>NAVAL BATTLE</Text>

        <View style={styles.combatants}>
          {/* PT boat */}
          <View style={styles.side}>
            <View style={[styles.shipWrap, ptHealth === 0 && styles.defeated]}>
              <PTBoatIcon size={40} />
            </View>
            <Text style={styles.sideLabel}>PT BOAT</Text>
            <HealthBar health={ptHealth} color={ptHealth > 40 ? '#4ade80' : '#e53935'} />
            <View style={styles.hitRow}>
              <Text style={styles.healthText}>{ptHealth}%</Text>
              {lastPtHit != null && exchange > 0 && exchange < 4 && (
                <Text style={styles.damageText}>-{lastPtHit}</Text>
              )}
            </View>
          </View>

          <Text style={styles.versus}>VS</Text>

          {/* Pirate */}
          <View style={styles.side}>
            <View style={[styles.shipWrap, pirateHealth === 0 && styles.defeated]}>
              <PirateShipIcon size={44} />
            </View>
            <Text style={styles.sideLabel}>PIRATES</Text>
            <HealthBar health={pirateHealth} color={pirateHealth > 40 ? '#ffa726' : '#e53935'} />
            <View style={styles.hitRow}>
              <Text style={styles.healthText}>{pirateHealth}%</Text>
              {lastPirateHit != null && exchange > 0 && exchange < 4 && (
                <Text style={styles.damageText}>-{lastPirateHit}</Text>
              )}
            </View>
          </View>
        </View>

        <Text
          style={[
            styles.status,
            exchange === 4 && (plan.ptWins ? styles.statusWin : styles.statusLoss),
          ]}
        >
          {resultText}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 950,
  },
  card: {
    backgroundColor: 'rgba(14, 24, 33, 0.95)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3d5f75',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8fb8d4',
    letterSpacing: 2.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  combatants: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: {
    flex: 1,
    alignItems: 'center',
  },
  shipWrap: {
    height: 46,
    justifyContent: 'center',
  },
  defeated: {
    opacity: 0.25,
  },
  sideLabel: {
    fontSize: 9,
    color: '#9fb4c2',
    letterSpacing: 1.2,
    fontWeight: '600',
    marginBottom: 4,
  },
  versus: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#5f7d8f',
    marginHorizontal: 8,
    letterSpacing: 1,
  },
  healthTrack: {
    width: '85%',
    height: 6,
    backgroundColor: '#22313d',
    borderRadius: 3,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    borderRadius: 3,
  },
  hitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
    height: 14,
  },
  healthText: {
    fontSize: 11,
    color: '#d5e2ea',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  damageText: {
    fontSize: 11,
    color: '#ff8a80',
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  status: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#7d97a8',
    letterSpacing: 1.8,
    textAlign: 'center',
    marginTop: 10,
  },
  statusWin: {
    color: '#4ade80',
  },
  statusLoss: {
    color: '#ff8a80',
  },
});

export default BattleOverlay;
