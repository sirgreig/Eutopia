// src/components/title/TitleScreen.tsx
//
// Animated title screen shown on launch, ahead of SetupScreen.
//
// Uses React Native's built-in Animated API only — no Reanimated (removed from the
// project) and no new dependencies.
//
// Artwork is OPTIONAL. If `backgroundSource` / `cloudSource` are not supplied the
// screen falls back to a painted SVG gradient, so this component works before the
// generated images exist and degrades gracefully if one is missing.
//
// Layout note: the background uses resizeMode="cover", so artwork is cropped
// differently on phone (very wide) versus tablet (4:3). Keep the meaningful content
// of the image centred and the top/bottom thirds visually empty — the title sits in
// the upper third and the buttons in the lower third.

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ImageSourcePropType,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Sounds } from '../../services/soundManager';

interface TitleScreenProps {
  onPlay: () => void;
  onSettings?: () => void;
  onHowToPlay?: () => void;
  /** Optional full-bleed background artwork (JPEG recommended — large PNGs are heavy). */
  backgroundSource?: ImageSourcePropType;
  /** Optional transparent cloud band that drifts horizontally for parallax (PNG with alpha). */
  cloudSource?: ImageSourcePropType;
  /** Skip entrance animation and ambient motion. */
  reduceMotion?: boolean;
  /** Shown small in the corner. Optional. */
  versionLabel?: string;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onPlay,
  onSettings,
  onHowToPlay,
  backgroundSource,
  cloudSource,
  reduceMotion = false,
  versionLabel,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Entrance animations
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(1.15)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(20)).current;

  // Ambient (looping) animations
  const bgScale = useRef(new Animated.Value(1)).current;
  const cloudX = useRef(new Animated.Value(0)).current;
  const titleFloat = useRef(new Animated.Value(0)).current;

  const [entranceDone, setEntranceDone] = useState(false);
  const entranceRef = useRef<Animated.CompositeAnimation | null>(null);

  /** Jump straight to the settled state — used on tap-to-skip and when reduceMotion. */
  const settleImmediately = () => {
    entranceRef.current?.stop();
    titleOpacity.setValue(1);
    titleScale.setValue(1);
    taglineOpacity.setValue(1);
    buttonOpacity.setValue(1);
    buttonTranslate.setValue(0);
    setEntranceDone(true);
  };

  // Entrance sequence
  useEffect(() => {
    if (reduceMotion) {
      settleImmediately();
      return;
    }

    const sequence = Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(titleScale, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslate, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    entranceRef.current = sequence;
    sequence.start(({ finished }) => {
      if (finished) setEntranceDone(true);
    });

    return () => sequence.stop();
  }, [reduceMotion]);

  // Ambient background drift — very slow, barely perceptible
  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bgScale, {
          toValue: 1.08,
          duration: 20000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bgScale, {
          toValue: 1,
          duration: 20000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion]);

  // Cloud parallax — two copies offset by one screen width, so the loop is seamless
  useEffect(() => {
    if (reduceMotion || !cloudSource) return;
    cloudX.setValue(0);
    const loop = Animated.loop(
      Animated.timing(cloudX, {
        toValue: -screenWidth,
        duration: 60000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, cloudSource, screenWidth]);

  // Title float — begins only after the entrance has settled
  useEffect(() => {
    if (reduceMotion || !entranceDone) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(titleFloat, {
          toValue: -4,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(titleFloat, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, entranceDone]);

  const handleScreenTap = () => {
    if (!entranceDone) settleImmediately();
  };

  const handlePlay = () => {
    Sounds.buttonClick();
    onPlay();
  };

  const handleSettings = () => {
    Sounds.buttonClick();
    onSettings?.();
  };

  const handleHowToPlay = () => {
    Sounds.buttonClick();
    onHowToPlay?.();
  };

  const isCompact = screenHeight < 420;

  return (
    <Pressable style={styles.root} onPress={handleScreenTap}>
      {/* Background: artwork if supplied, otherwise a painted gradient */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ scale: bgScale }] }]}
        pointerEvents="none"
      >
        {backgroundSource ? (
          <Image
            source={backgroundSource}
            style={{ width: screenWidth, height: screenHeight }}
            resizeMode="cover"
          />
        ) : (
          <Svg width={screenWidth} height={screenHeight}>
            <Defs>
              <LinearGradient id="titleSky" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#f5a361" />
                <Stop offset="0.35" stopColor="#5b8fb0" />
                <Stop offset="0.62" stopColor="#1f5f8b" />
                <Stop offset="1" stopColor="#0d3550" />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width={screenWidth} height={screenHeight} fill="url(#titleSky)" />
          </Svg>
        )}
      </Animated.View>

      {/* Drifting cloud band — two copies for a seamless loop */}
      {cloudSource && !reduceMotion && (
        <Animated.View
          style={[
            styles.cloudLayer,
            {
              width: screenWidth * 2,
              height: screenHeight * 0.45,
              transform: [{ translateX: cloudX }],
            },
          ]}
          pointerEvents="none"
        >
          <Image
            source={cloudSource}
            style={{ width: screenWidth, height: '100%' }}
            resizeMode="cover"
          />
          <Image
            source={cloudSource}
            style={{ width: screenWidth, height: '100%' }}
            resizeMode="cover"
          />
        </Animated.View>
      )}

      {/* Darkening scrim top and bottom so text stays legible over any artwork */}
      <View style={styles.scrimTop} pointerEvents="none" />
      <View style={styles.scrimBottom} pointerEvents="none" />

      {/* Title block */}
      <View style={styles.content} pointerEvents="box-none">
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ scale: titleScale }, { translateY: titleFloat }],
          }}
          pointerEvents="none"
        >
          <Text style={[styles.title, isCompact && styles.titleCompact]}>EUTOPIA</Text>
          <View style={styles.rule} />
        </Animated.View>

        <Animated.Text
          style={[styles.tagline, isCompact && styles.taglineCompact, { opacity: taglineOpacity }]}
          pointerEvents="none"
        >
          Build your island paradise
        </Animated.Text>

        <Animated.View
          style={[
            styles.buttonBlock,
            { opacity: buttonOpacity, transform: [{ translateY: buttonTranslate }] },
          ]}
        >
          <TouchableOpacity
            style={[styles.playButton, isCompact && styles.playButtonCompact]}
            onPress={handlePlay}
            activeOpacity={0.85}
          >
            <Text style={[styles.playButtonText, isCompact && styles.playButtonTextCompact]}>
              PLAY
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryRow}>
            {onHowToPlay && (
              <TouchableOpacity style={styles.settingsButton} onPress={handleHowToPlay}>
                <Text style={styles.settingsButtonText}>How to Play</Text>
              </TouchableOpacity>
            )}
            {onSettings && (
              <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
                <Text style={styles.settingsButtonText}>Settings</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>

      {versionLabel ? (
        <Text style={styles.version} pointerEvents="none">{versionLabel}</Text>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0d3550',
  },
  cloudLayer: {
    position: 'absolute',
    top: '8%',
    left: 0,
    flexDirection: 'row',
    opacity: 0.75,
  },
  scrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
    backgroundColor: 'rgba(6, 22, 36, 0.35)',
  },
  scrimBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: 'rgba(6, 22, 36, 0.42)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 62,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
  titleCompact: {
    fontSize: 44,
    letterSpacing: 7,
  },
  rule: {
    height: 2,
    backgroundColor: '#ffc107',
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 1,
    opacity: 0.9,
  },
  tagline: {
    marginTop: 12,
    fontSize: 15,
    color: '#dce8f0',
    letterSpacing: 1.6,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  taglineCompact: {
    fontSize: 13,
    marginTop: 8,
  },
  buttonBlock: {
    marginTop: 28,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    paddingHorizontal: 62,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  playButtonCompact: {
    paddingVertical: 10,
    paddingHorizontal: 48,
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  playButtonTextCompact: {
    fontSize: 18,
    letterSpacing: 3,
  },
  settingsButton: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButtonText: {
    color: '#c8d8e4',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  version: {
    position: 'absolute',
    bottom: 10,
    right: 14,
    fontSize: 10,
    color: 'rgba(220, 232, 240, 0.5)',
  },
});

export default TitleScreen;
