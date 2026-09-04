// src/components/title/QuickStartPanel.tsx
//
// Short "How to Play" overview shown from the title screen.
//
// Deliberately brief. This is for someone deciding whether to press PLAY, not
// someone looking up a rule — the full reference lives in Settings > How to Play.
// Five sections, one or two lines each, readable in about twenty seconds.
//
// IMPORTANT: not a React Native <Modal>. See Critical Implementation Rules —
// Modal aborts the process on iOS under landscape lock.

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Sounds } from '../../services/soundManager';

interface QuickStartPanelProps {
  visible: boolean;
  onClose: () => void;
  reduceMotion?: boolean;
}

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: 'The goal',
    body:
      'Build the most successful island nation before the rounds run out. Highest score wins — against the computer, or against a friend.',
  },
  {
    heading: 'Building',
    body:
      'Tap any empty land tile to build. Houses grow your population, farms feed it, factories earn gold, schools and hospitals keep people content.',
  },
  {
    heading: 'The sea',
    body:
      'Tap open water to build a boat there. Fishing boats earn gold while sitting over a school of fish. PT boats hunt pirates, though they do not always win.',
  },
  {
    heading: 'Trouble',
    body:
      'Storms and hurricanes wreck buildings and sink boats. Pirates hunt your fishing fleet. Neglect your people and rebels rise. A fort shields everything around it.',
  },
  {
    heading: 'Scoring',
    body:
      'Your score comes from housing, food, welfare and wealth. Neglect any one of them and it will cost you.',
  },
];

export const QuickStartPanel: React.FC<QuickStartPanelProps> = ({
  visible,
  onClose,
  reduceMotion = false,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    if (!visible) return;
    if (reduceMotion) {
      fade.setValue(1);
      rise.setValue(0);
      return;
    }
    fade.setValue(0);
    rise.setValue(14);
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
  }, [visible, reduceMotion]);

  if (!visible) return null;

  const handleClose = () => {
    Sounds.buttonClick();
    onClose();
  };

  const cardWidth = Math.min(screenWidth * 0.82, 460);
  const cardMaxHeight = screenHeight * 0.84;

  return (
    <View
      style={[styles.overlay, { width: screenWidth, height: screenHeight }]}
      pointerEvents="box-none"
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
        <View style={styles.backdrop} />
      </Pressable>

      <Animated.View
        style={[
          styles.card,
          { width: cardWidth, maxHeight: cardMaxHeight, opacity: fade, transform: [{ translateY: rise }] },
        ]}
      >
        <Text style={styles.title}>How to Play</Text>
        <View style={styles.rule} />

        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {SECTIONS.map((section) => (
            <View key={section.heading} style={styles.section}>
              <Text style={styles.heading}>{section.heading}</Text>
              <Text style={styles.body}>{section.body}</Text>
            </View>
          ))}
          <Text style={styles.footnote}>
            Full details are in Settings once you are in a game.
          </Text>
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={handleClose} activeOpacity={0.85}>
          <Text style={styles.buttonText}>GOT IT</Text>
        </TouchableOpacity>
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
    zIndex: 10500,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 18, 28, 0.86)',
  },
  card: {
    backgroundColor: '#16232f',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2f4d5f',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  rule: {
    height: 2,
    width: 44,
    backgroundColor: '#ffc107',
    borderRadius: 1,
    marginTop: 6,
    marginBottom: 12,
  },
  section: {
    marginBottom: 12,
  },
  heading: {
    fontSize: 11,
    color: '#9fd6b4',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 3,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    color: '#d5e2ea',
  },
  footnote: {
    fontSize: 11,
    color: '#667d8c',
    fontStyle: 'italic',
    marginTop: 2,
    marginBottom: 4,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#4caf50',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});

export default QuickStartPanel;
