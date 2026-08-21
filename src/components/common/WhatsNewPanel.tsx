// src/components/common/WhatsNewPanel.tsx
//
// "What's New" panel shown after an update.
//
// IMPORTANT: Do NOT use React Native's <Modal> here.
//
// Modal presents a separate UIViewController on iOS. With the app locked to
// landscape (`orientation: "landscape"` + `requireFullScreen: true` in app.json),
// UIKit finds no valid orientation for the presented controller and throws from
// __supportedInterfaceOrientations, aborting the process. This crashed the first
// iOS build on launch. Use an absolutely-positioned overlay, matching
// NamePromptModal and the minimaps.
//
// Layout is built for landscape phones, where usable height is around 390px:
// the card is capped at 82% of screen height and the notes scroll.

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { ReleaseNote } from '../../constants/whatsNew';
import { Sounds } from '../../services/soundManager';

interface WhatsNewPanelProps {
  visible: boolean;
  notes: ReleaseNote[];
  onDismiss: () => void;
  reduceMotion?: boolean;
}

export const WhatsNewPanel: React.FC<WhatsNewPanelProps> = ({
  visible,
  notes,
  onDismiss,
  reduceMotion = false,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const fade = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const rise = useRef(new Animated.Value(reduceMotion ? 0 : 16)).current;

  useEffect(() => {
    if (!visible || reduceMotion) return;
    fade.setValue(0);
    rise.setValue(16);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, reduceMotion]);

  if (!visible || notes.length === 0) return null;

  const handleDismiss = () => {
    Sounds.buttonClick();
    onDismiss();
  };

  const cardWidth = Math.min(screenWidth * 0.86, 460);
  const cardMaxHeight = screenHeight * 0.82;

  return (
    <View
      style={[styles.overlay, { width: screenWidth, height: screenHeight }]}
      pointerEvents="box-none"
    >
      <View style={styles.backdrop} pointerEvents="none" />

      <Animated.View
        style={[
          styles.card,
          {
            width: cardWidth,
            maxHeight: cardMaxHeight,
            opacity: fade,
            transform: [{ translateY: rise }],
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>What's New</Text>
          <View style={styles.rule} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {notes.map((note, noteIndex) => (
            <View key={note.id} style={noteIndex > 0 ? styles.laterNote : undefined}>
              <View style={styles.noteHeader}>
                <Text style={styles.noteDate}>{note.date}</Text>
                {note.headline ? (
                  <Text style={styles.noteHeadline}>{note.headline}</Text>
                ) : null}
              </View>

              {note.items.map((item, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={handleDismiss} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Continue</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 18, 28, 0.82)',
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
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
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
  },
  scrollContent: {
    paddingBottom: 4,
  },
  laterNote: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#25384a',
  },
  noteHeader: {
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 11,
    color: '#7d97a8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  noteHeadline: {
    fontSize: 14,
    color: '#9fd6b4',
    fontWeight: '600',
    marginTop: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 7,
    paddingRight: 4,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ffc107',
    marginTop: 7,
    marginRight: 9,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#d5e2ea',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#4caf50',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});

export default WhatsNewPanel;
