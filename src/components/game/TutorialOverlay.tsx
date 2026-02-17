// src/components/game/TutorialOverlay.tsx
// Interactive tutorial overlay with spotlight effect and tooltips

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { TutorialStep } from '../../hooks/useTutorial';

interface TutorialOverlayProps {
  step: TutorialStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  /** Positions of highlightable elements, provided by parent */
  elementPositions?: {
    land_tile?: { x: number; y: number; width: number; height: number };
    build_menu?: { x: number; y: number; width: number; height: number };
    building_crops?: { x: number; y: number; width: number; height: number };
    gold_display?: { x: number; y: number; width: number; height: number };
    timer?: { x: number; y: number; width: number; height: number };
  };
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onSkip,
  elementPositions = {},
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Pulse animation for spotlight
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [step.id]);

  // Get spotlight position based on target
  const getSpotlightStyle = () => {
    const target = step.target;
    const pos = elementPositions[target];

    if (!pos || target === 'none') {
      return null; // No spotlight for 'none' target
    }

    return {
      position: 'absolute' as const,
      left: pos.x - 8,
      top: pos.y - 8,
      width: pos.width + 16,
      height: pos.height + 16,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: '#ffc107',
      backgroundColor: 'transparent',
    };
  };

  // Get tooltip position based on step configuration
  const getTooltipStyle = () => {
    const target = step.target;
    const pos = elementPositions[target];

    if (step.position === 'center' || !pos) {
      return {
        position: 'absolute' as const,
        left: screenWidth * 0.1,
        right: screenWidth * 0.1,
        top: screenHeight * 0.35,
        alignItems: 'center' as const,
      };
    }

    if (step.position === 'top') {
      // Tooltip above the element — needs enough clearance for full tooltip height (~150px)
      return {
        position: 'absolute' as const,
        left: Math.max(16, Math.min(pos.x - 50, screenWidth - 296)),
        top: Math.max(16, pos.y - 170),
      };
    }

    // Tooltip below the element
    return {
      position: 'absolute' as const,
      left: Math.max(16, Math.min(pos.x - 50, screenWidth - 220)),
      top: pos.y + pos.height + 16,
    };
  };

  const spotlightStyle = getSpotlightStyle();
  const tooltipStyle = getTooltipStyle();

  // Determine if this step requires user to interact with game elements
  const isInteractiveStep = step.id === 'tap_tile' || step.id === 'select_building';

  // For steps without auto-advance, tapping the overlay advances (if not interactive)
  const handleOverlayTap = () => {
    if (!step.autoAdvanceMs && !isInteractiveStep) {
      onNext();
    }
  };

  return (
    <Animated.View 
      style={[styles.overlay, { opacity: fadeAnim }]}
      pointerEvents={isInteractiveStep ? 'box-none' : 'auto'}
    >
      {/* Semi-transparent background - pass through taps for interactive steps */}
      {!isInteractiveStep && (
        <Pressable style={styles.backdrop} onPress={handleOverlayTap}>
          <View style={styles.backdropInner} />
        </Pressable>
      )}
      
      {/* Dimmed background for interactive steps (no touch blocking) */}
      {isInteractiveStep && (
        <View style={styles.dimmedBackdrop} pointerEvents="none" />
      )}

      {/* Spotlight highlight */}
      {spotlightStyle && (
        <Animated.View
          style={[
            spotlightStyle,
            { transform: [{ scale: pulseAnim }] },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Tooltip */}
      <View style={[styles.tooltipContainer, tooltipStyle]} pointerEvents="box-none">
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>{step.message}</Text>
          
          {/* Progress dots */}
          <View style={styles.progressContainer}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i === stepIndex && styles.progressDotActive,
                  i < stepIndex && styles.progressDotComplete,
                ]}
              />
            ))}
          </View>

          {/* Action buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipButtonText}>Skip Tutorial</Text>
            </TouchableOpacity>

            {!step.autoAdvanceMs && !isInteractiveStep && (
              <TouchableOpacity style={styles.nextButton} onPress={onNext}>
                <Text style={styles.nextButtonText}>
                  {stepIndex === totalSteps - 1 ? "Let's Go!" : 'Next'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Arrow pointer (for non-center tooltips) */}
        {step.position !== 'center' && spotlightStyle && (
          <View
            style={[
              styles.arrow,
              step.position === 'top' ? styles.arrowDown : styles.arrowUp,
            ]}
          />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropInner: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  dimmedBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tooltipContainer: {
    maxWidth: 280,
  },
  tooltip: {
    backgroundColor: '#1a2a3a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#ffc107',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipText: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3a5a6a',
  },
  progressDotActive: {
    backgroundColor: '#ffc107',
    width: 20,
  },
  progressDotComplete: {
    backgroundColor: '#4ade80',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipButtonText: {
    fontSize: 12,
    color: '#6a8a9a',
  },
  nextButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  nextButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1a2a3a',
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
  },
  arrowUp: {
    top: -10,
    borderBottomWidth: 10,
    borderBottomColor: '#ffc107',
  },
  arrowDown: {
    bottom: -10,
    borderTopWidth: 10,
    borderTopColor: '#ffc107',
  },
});

export default TutorialOverlay;
