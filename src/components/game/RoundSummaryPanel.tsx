// src/components/game/RoundSummaryPanel.tsx
//
// Shown at the end of every round except the last, summarising what the player
// earned and how their nation changed.
//
// IMPORTANT: not a React Native <Modal> — see the project's Critical Implementation
// Rules. Modal aborts the process on iOS under landscape lock.
//
// Positioned below the header so the host can still reach NEXT in multiplayer, and
// non-blocking: it auto-dismisses on a timer, and any tap dismisses it early.

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';

export interface RoundSummaryData {
  round: number;
  /** Gold earned at round end */
  baseIncome: number;
  factoryIncome: number;
  productivityBonus: number;
  /** Gold earned live during the round */
  fishingGold: number;
  rainGold: number;
  /** Population and score before/after this round's calculation */
  populationBefore: number;
  populationAfter: number;
  scoreBefore: number;
  scoreAfter: number;
}

interface RoundSummaryPanelProps {
  summary: RoundSummaryData | null;
  onDismiss: () => void;
  reduceMotion?: boolean;
  /**
   * How long before it dismisses itself. Pass null to require an explicit action —
   * used in solo, where the panel carries the Next Round button and there is nobody
   * waiting on the player.
   */
  autoDismissMs?: number | null;
  /** Optional primary action rendered as a button (e.g. "Next Round"). */
  primaryLabel?: string;
  onPrimaryAction?: () => void;
}

const Row: React.FC<{ label: string; value: string; muted?: boolean; accent?: string }> = ({
  label,
  value,
  muted,
  accent,
}) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, muted && styles.rowLabelMuted]}>{label}</Text>
    <Text style={[styles.rowValue, accent ? { color: accent } : null]}>{value}</Text>
  </View>
);

const signed = (n: number): string => (n > 0 ? `+${n}` : `${n}`);

export const RoundSummaryPanel: React.FC<RoundSummaryPanelProps> = ({
  summary,
  onDismiss,
  reduceMotion = false,
  autoDismissMs = 5000,
  primaryLabel,
  onPrimaryAction,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(12)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!summary) return;

    if (reduceMotion) {
      fade.setValue(1);
      rise.setValue(0);
    } else {
      fade.setValue(0);
      rise.setValue(12);
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rise, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (autoDismissMs != null) {
      timerRef.current = setTimeout(onDismiss, autoDismissMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [summary, reduceMotion, autoDismissMs]);

  if (!summary) return null;

  const liveGold = summary.fishingGold + summary.rainGold;
  const endGold = summary.baseIncome + summary.factoryIncome + summary.productivityBonus;
  const totalGold = liveGold + endGold;

  const popDelta = summary.populationAfter - summary.populationBefore;
  const scoreDelta = summary.scoreAfter - summary.scoreBefore;

  const cardWidth = Math.min(screenWidth * 0.6, 340);

  return (
    <View
      style={[styles.overlay, { width: screenWidth, height: screenHeight }]}
      pointerEvents="box-none"
    >
      <Pressable style={styles.tapCatcher} onPress={onDismiss} />

      <Animated.View
        style={[
          styles.card,
          { width: cardWidth, opacity: fade, transform: [{ translateY: rise }] },
        ]}
      >
        <Text style={styles.title}>Round {summary.round} Complete</Text>
        <View style={styles.rule} />

        <Text style={styles.sectionLabel}>Gold Earned</Text>
        {summary.factoryIncome > 0 && (
          <Row label="Factories" value={`+${summary.factoryIncome}`} />
        )}
        {summary.productivityBonus > 0 && (
          <Row label="Productivity" value={`+${summary.productivityBonus}`} />
        )}
        {summary.fishingGold > 0 && <Row label="Fishing" value={`+${summary.fishingGold}`} />}
        {summary.rainGold > 0 && <Row label="Rain on crops" value={`+${summary.rainGold}`} />}
        <Row label="Base income" value={`+${summary.baseIncome}`} muted />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>+{totalGold}g</Text>
        </View>

        <View style={styles.divider} />

        <Row
          label="Population"
          value={`${summary.populationAfter.toLocaleString()} (${signed(popDelta)})`}
          accent={popDelta >= 0 ? '#7fd6a0' : '#ff8a80'}
        />
        <Row
          label="Score"
          value={`${summary.scoreAfter} (${signed(scoreDelta)})`}
          accent={scoreDelta >= 0 ? '#7fd6a0' : '#ff8a80'}
        />

        {onPrimaryAction && primaryLabel ? (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onPrimaryAction}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
            </TouchableOpacity>
            <Text style={styles.hint}>Tap outside to review the board</Text>
          </>
        ) : (
          <Text style={styles.hint}>Tap to continue</Text>
        )}
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
    zIndex: 900,
  },
  // Covers the map area only, leaving the header reachable (NEXT in multiplayer)
  tapCatcher: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    backgroundColor: 'rgba(18, 30, 40, 0.96)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2f4d5f',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  rule: {
    height: 2,
    width: 36,
    alignSelf: 'center',
    backgroundColor: '#ffc107',
    borderRadius: 1,
    marginTop: 5,
    marginBottom: 9,
  },
  sectionLabel: {
    fontSize: 9,
    color: '#7d97a8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  rowLabel: {
    fontSize: 12,
    color: '#c3d3de',
  },
  rowLabelMuted: {
    color: '#7d97a8',
  },
  rowValue: {
    fontSize: 12,
    color: '#ffd76a',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#25384a',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffc107',
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: '#25384a',
    marginVertical: 8,
  },
  hint: {
    fontSize: 9,
    color: '#556d7d',
    textAlign: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});

export default RoundSummaryPanel;
