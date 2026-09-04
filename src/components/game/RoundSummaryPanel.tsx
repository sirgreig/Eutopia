// src/components/game/RoundSummaryPanel.tsx
//
// Shown at the end of every round except the last, summarising what the player
// earned and how their nation changed.
//
// IMPORTANT: not a React Native <Modal> — see the project's Critical Implementation
// Rules. Modal aborts the process on iOS under landscape lock.
//
// Two-column layout, deliberately: gold on the left, score and population on the
// right. It must fit a landscape phone WITHOUT scrolling, so nothing here may grow
// unbounded — rows with a zero value are omitted rather than shown as "+0".
//
// Positioned below the header so the host can still reach NEXT in multiplayer, and
// non-blocking: any tap dismisses it.

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

export interface ScoreParts {
  housing: number;
  food: number;
  welfare: number;
  gdp: number;
}

export interface RoundSummaryData {
  round: number;
  /** Gold earned at round end */
  baseIncome: number;
  factoryIncome: number;
  productivityBonus: number;
  /** Gold earned live during the round */
  fishingGold: number;
  rainGold: number;
  /** Enhanced Mode: gold from marketplaces selling surplus food */
  marketplaceGold?: number;
  /** Enhanced Mode: food score points drawn from granary storage */
  granaryFood?: number;
  /** Population and score before/after this round's calculation */
  populationBefore: number;
  populationAfter: number;
  scoreBefore: number;
  scoreAfter: number;
  scorePartsBefore: ScoreParts;
  scorePartsAfter: ScoreParts;
}

interface RoundSummaryPanelProps {
  summary: RoundSummaryData | null;
  onDismiss: () => void;
  reduceMotion?: boolean;
  autoDismissMs?: number | null;
  primaryLabel?: string;
  onPrimaryAction?: () => void;
}

const signed = (n: number): string => (n > 0 ? `+${n}` : `${n}`);

const GAIN = '#7fd6a0';
const LOSS = '#ff8a80';

const Row: React.FC<{
  label: string;
  value: string;
  delta?: number;
  muted?: boolean;
}> = ({ label, value, delta, muted }) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, muted && styles.rowLabelMuted]} numberOfLines={1}>
      {label}
    </Text>
    <View style={styles.rowValueGroup}>
      <Text style={styles.rowValue}>{value}</Text>
      {delta !== undefined && delta !== 0 && (
        <Text style={[styles.rowDelta, { color: delta > 0 ? GAIN : LOSS }]}>
          {signed(delta)}
        </Text>
      )}
    </View>
  </View>
);

export const RoundSummaryPanel: React.FC<RoundSummaryPanelProps> = ({
  summary,
  onDismiss,
  reduceMotion = false,
  autoDismissMs = null,
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

  const marketplaceGold = summary.marketplaceGold ?? 0;
  const totalGold =
    summary.fishingGold +
    summary.rainGold +
    summary.baseIncome +
    summary.factoryIncome +
    summary.productivityBonus +
    marketplaceGold;

  const popDelta = summary.populationAfter - summary.populationBefore;
  const scoreDelta = summary.scoreAfter - summary.scoreBefore;

  const before = summary.scorePartsBefore;
  const after = summary.scorePartsAfter;

  const cardWidth = Math.min(screenWidth * 0.82, 520);

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

        <View style={styles.columns}>
          {/* Gold */}
          <View style={styles.column}>
            <Text style={styles.sectionLabel}>Gold Earned</Text>
            {summary.factoryIncome > 0 && (
              <Row label="Factories" value={`+${summary.factoryIncome}`} />
            )}
            {summary.productivityBonus > 0 && (
              <Row label="Productivity" value={`+${summary.productivityBonus}`} />
            )}
            {summary.fishingGold > 0 && (
              <Row label="Fishing" value={`+${summary.fishingGold}`} />
            )}
            {summary.rainGold > 0 && <Row label="Rain on crops" value={`+${summary.rainGold}`} />}
            {marketplaceGold > 0 && <Row label="Marketplace" value={`+${marketplaceGold}`} />}
            <Row label="Base income" value={`+${summary.baseIncome}`} muted />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>+{totalGold}g</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Score */}
          <View style={styles.column}>
            <Text style={styles.sectionLabel}>Score</Text>
            <Row label="Housing" value={`${after.housing}`} delta={after.housing - before.housing} />
            <Row label="Food" value={`${after.food}`} delta={after.food - before.food} />
            <Row label="Welfare" value={`${after.welfare}`} delta={after.welfare - before.welfare} />
            <Row label="Wealth" value={`${after.gdp}`} delta={after.gdp - before.gdp} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <View style={styles.rowValueGroup}>
                <Text style={styles.totalValue}>{summary.scoreAfter}</Text>
                {scoreDelta !== 0 && (
                  <Text style={[styles.rowDelta, { color: scoreDelta > 0 ? GAIN : LOSS }]}>
                    {signed(scoreDelta)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.popRow}>
              <Row
                label="Population"
                value={summary.populationAfter.toLocaleString()}
                delta={popDelta}
              />
              {(summary.granaryFood ?? 0) > 0 && (
                <Row label="Granary used" value={`${summary.granaryFood}`} />
              )}
            </View>
          </View>
        </View>

        {onPrimaryAction && primaryLabel ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onPrimaryAction}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
          </TouchableOpacity>
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
  tapCatcher: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    backgroundColor: 'rgba(18, 30, 40, 0.97)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2f4d5f',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  rule: {
    height: 2,
    width: 32,
    alignSelf: 'center',
    backgroundColor: '#ffc107',
    borderRadius: 1,
    marginTop: 4,
    marginBottom: 8,
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#25384a',
    marginHorizontal: 12,
  },
  sectionLabel: {
    fontSize: 9,
    color: '#7d97a8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  rowLabel: {
    fontSize: 12,
    color: '#c3d3de',
    flexShrink: 1,
  },
  rowLabelMuted: {
    color: '#7d97a8',
  },
  rowValueGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  rowValue: {
    fontSize: 12,
    color: '#ffd76a',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  rowDelta: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    minWidth: 26,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#25384a',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffc107',
    fontVariant: ['tabular-nums'],
  },
  popRow: {
    marginTop: 6,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#25384a',
  },
  hint: {
    fontSize: 9,
    color: '#556d7d',
    textAlign: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});

export default RoundSummaryPanel;
