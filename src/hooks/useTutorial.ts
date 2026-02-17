// src/hooks/useTutorial.ts
// Tutorial state management with AsyncStorage persistence

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TUTORIAL_STORAGE_KEY = '@eutopia_tutorial_complete';

export interface TutorialStep {
  id: string;
  target: 'land_tile' | 'build_menu' | 'building_crops' | 'gold_display' | 'timer' | 'none';
  message: string;
  position: 'top' | 'bottom' | 'center';
  autoAdvanceMs?: number; // If set, auto-advance after this many ms
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    target: 'none',
    message: "Welcome to Eutopia! Let's learn the basics.",
    position: 'center',
    autoAdvanceMs: 2500,
  },
  {
    id: 'tap_tile',
    target: 'land_tile',
    message: 'Tap any green land tile to build',
    position: 'top',
  },
  {
    id: 'select_building',
    target: 'building_crops',
    message: "Select Crops — they're cheap and produce food",
    position: 'top',
  },
  {
    id: 'gold_info',
    target: 'gold_display',
    message: 'This is your gold. Buildings cost gold to build.',
    position: 'bottom',
  },
  {
    id: 'timer_info',
    target: 'timer',
    message: 'Build your island before the round ends!',
    position: 'bottom',
  },
  {
    id: 'complete',
    target: 'none',
    message: "You're ready! Good luck, Governor!",
    position: 'center',
  },
];

interface UseTutorialReturn {
  /** Whether tutorial is currently active */
  isActive: boolean;
  /** Current tutorial step (null if not active) */
  currentStep: TutorialStep | null;
  /** Current step index */
  stepIndex: number;
  /** Total number of steps */
  totalSteps: number;
  /** Advance to next step */
  nextStep: () => void;
  /** Skip the entire tutorial */
  skipTutorial: () => void;
  /** Reset tutorial (for Settings) */
  resetTutorial: () => Promise<void>;
  /** Check if tutorial has been completed before */
  hasCompletedTutorial: boolean;
  /** Start the tutorial */
  startTutorial: () => void;
  /** Called when user performs a tutorial action */
  onTutorialAction: (action: string) => void;
}

export const useTutorial = (): UseTutorialReturn => {
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(true); // Assume true until checked
  const [isLoaded, setIsLoaded] = useState(false);

  // Load tutorial state from storage on mount
  useEffect(() => {
    const loadTutorialState = async () => {
      try {
        const value = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
        const completed = value === 'true';
        setHasCompletedTutorial(completed);
        
        // Auto-start tutorial for new players
        if (!completed) {
          setIsActive(true);
          setStepIndex(0);
        }
      } catch (error) {
        console.log('[Tutorial] Error loading state:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTutorialState();
  }, []);

  // Mark tutorial as complete
  const completeTutorial = useCallback(async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
      setHasCompletedTutorial(true);
      setIsActive(false);
    } catch (error) {
      console.log('[Tutorial] Error saving state:', error);
    }
  }, []);

  // Advance to next step
  const nextStep = useCallback(() => {
    if (stepIndex < TUTORIAL_STEPS.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      // Tutorial complete
      completeTutorial();
    }
  }, [stepIndex, completeTutorial]);

  // Skip the entire tutorial
  const skipTutorial = useCallback(() => {
    completeTutorial();
  }, [completeTutorial]);

  // Reset tutorial (for Settings)
  const resetTutorial = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEY);
      setHasCompletedTutorial(false);
      setStepIndex(0);
      // Don't auto-start here - will start on next game
    } catch (error) {
      console.log('[Tutorial] Error resetting:', error);
    }
  }, []);

  // Start the tutorial manually
  const startTutorial = useCallback(() => {
    setStepIndex(0);
    setIsActive(true);
  }, []);

  // Handle tutorial actions (called when user does something)
  const onTutorialAction = useCallback((action: string) => {
    if (!isActive) return;

    const currentStepData = TUTORIAL_STEPS[stepIndex];
    
    // Check if action matches what we're waiting for
    switch (currentStepData?.id) {
      case 'tap_tile':
        if (action === 'tile_tapped') {
          nextStep();
        }
        break;
      case 'select_building':
        if (action === 'building_selected') {
          nextStep();
        }
        break;
      default:
        // Other steps advance via auto-advance or tap
        break;
    }
  }, [isActive, stepIndex, nextStep]);

  // Auto-advance for steps with autoAdvanceMs
  useEffect(() => {
    if (!isActive) return;

    const currentStepData = TUTORIAL_STEPS[stepIndex];
    if (currentStepData?.autoAdvanceMs) {
      const timer = setTimeout(() => {
        nextStep();
      }, currentStepData.autoAdvanceMs);

      return () => clearTimeout(timer);
    }
  }, [isActive, stepIndex, nextStep]);

  const currentStep = isActive ? TUTORIAL_STEPS[stepIndex] : null;

  return {
    isActive: isActive && isLoaded,
    currentStep,
    stepIndex,
    totalSteps: TUTORIAL_STEPS.length,
    nextStep,
    skipTutorial,
    resetTutorial,
    hasCompletedTutorial,
    startTutorial,
    onTutorialAction,
  };
};

// Standalone function to reset tutorial (for use outside the hook)
export const resetTutorialStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEY);
    console.log('[Tutorial] Reset complete - will show on next app launch');
  } catch (error) {
    console.log('[Tutorial] Error resetting:', error);
  }
};

export default useTutorial;
