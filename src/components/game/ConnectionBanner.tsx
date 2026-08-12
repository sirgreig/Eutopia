// src/components/game/ConnectionBanner.tsx
// Phase 8E — shown when the opponent's heartbeat goes stale.
//
// Heartbeat source: PlayerState.updatedAt, written every 500ms by the existing
// multiplayer state interval. No extra Firebase writes are needed for this.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ConnectionBannerProps {
  opponentName: string;
  msSinceSeen: number;
  msUntilForfeit: number;
  visible: boolean;
}

const formatCountdown = (ms: number): string => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({
  opponentName,
  msSinceSeen,
  msUntilForfeit,
  visible,
}) => {
  if (!visible) return null;

  const seconds = Math.floor(msSinceSeen / 1000);
  const urgent = msUntilForfeit < 30000;

  return (
    <View style={[styles.banner, urgent && styles.bannerUrgent]}>
      <View style={[styles.dot, urgent && styles.dotUrgent]} />
      <Text style={styles.text} numberOfLines={1}>
        {opponentName} disconnected ({seconds}s)
      </Text>
      <Text style={[styles.countdown, urgent && styles.countdownUrgent]}>
        {formatCountdown(msUntilForfeit)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 62,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(40, 20, 10, 0.94)',
    borderWidth: 1,
    borderColor: '#c77b28',
    zIndex: 500,
  },
  bannerUrgent: {
    backgroundColor: 'rgba(50, 12, 12, 0.94)',
    borderColor: '#e53935',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c77b28',
  },
  dotUrgent: {
    backgroundColor: '#e53935',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f0d0a0',
  },
  countdown: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#c77b28',
    fontVariant: ['tabular-nums'],
  },
  countdownUrgent: {
    color: '#ff8a80',
  },
});

export default ConnectionBanner;
