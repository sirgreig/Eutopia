// src/hooks/useAudio.ts
// React hook for audio playback and settings management

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AudioManager from '../services/AudioManager';
import { AudioSettings, SoundKey, MusicKey, SOUND_KEYS } from '../config/audioSettings';

interface UseAudioReturn {
  // State
  settings: AudioSettings;
  isInitialized: boolean;
  
  // Sound effects
  playSound: (key: SoundKey) => void;
  playButtonTap: () => void;
  
  // Music
  playMusic: (key: MusicKey, crossfade?: boolean) => Promise<void>;
  stopMusic: (fadeOut?: boolean) => Promise<void>;
  
  // Volume controls
  setMusicVolume: (volume: number) => Promise<void>;
  setEffectsVolume: (volume: number) => void;
  
  // Mute toggles
  toggleMusicMute: () => Promise<boolean>;
  toggleEffectsMute: () => boolean;
  
  // Settings persistence
  saveSettings: () => Promise<void>;
}

export function useAudio(): UseAudioReturn {
  const [settings, setSettings] = useState<AudioSettings>(AudioManager.getSettings());
  const [isInitialized, setIsInitialized] = useState(false);
  const appState = useRef(AppState.currentState);

  // Initialize audio system on mount
  useEffect(() => {
    // AudioManager is initialized in App.tsx, just sync settings here
    setSettings(AudioManager.getSettings());
    setIsInitialized(true);

    // Handle app state changes (background/foreground)
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // Pause/resume audio based on app state
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
      // App going to background
      AudioManager.pauseAll();
    } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App coming to foreground
      AudioManager.resumeAll();
    }
    appState.current = nextAppState;
  }, []);

  // Play a sound effect (fire-and-forget)
  const playSound = useCallback((key: SoundKey) => {
    AudioManager.playSound(key);
  }, []);

  // Convenience method for button taps
  const playButtonTap = useCallback(() => {
    AudioManager.playSound(SOUND_KEYS.BUTTON_TAP);
  }, []);

  // Play background music
  const playMusic = useCallback(async (key: MusicKey, crossfade: boolean = true) => {
    await AudioManager.playMusic(key, crossfade);
  }, []);

  // Stop background music
  const stopMusic = useCallback(async (fadeOut: boolean = true) => {
    await AudioManager.stopMusic(fadeOut);
  }, []);

  // Set music volume
  const setMusicVolume = useCallback(async (volume: number) => {
    await AudioManager.setMusicVolume(volume);
    setSettings(AudioManager.getSettings());
  }, []);

  // Set effects volume
  const setEffectsVolume = useCallback((volume: number) => {
    AudioManager.setEffectsVolume(volume);
    setSettings(AudioManager.getSettings());
  }, []);

  // Toggle music mute
  const toggleMusicMute = useCallback(async () => {
    const muted = await AudioManager.toggleMusicMute();
    setSettings(AudioManager.getSettings());
    return muted;
  }, []);

  // Toggle effects mute
  const toggleEffectsMute = useCallback(() => {
    const muted = AudioManager.toggleEffectsMute();
    setSettings(AudioManager.getSettings());
    return muted;
  }, []);

  // Save settings to AsyncStorage
  const saveSettings = useCallback(async () => {
    await AudioManager.saveSettings(settings);
  }, [settings]);

  return {
    settings,
    isInitialized,
    playSound,
    playButtonTap,
    playMusic,
    stopMusic,
    setMusicVolume,
    setEffectsVolume,
    toggleMusicMute,
    toggleEffectsMute,
    saveSettings,
  };
}

// Standalone function for quick sound playback without hook
export function playSound(key: SoundKey): void {
  AudioManager.playSound(key);
}

export function playButtonTap(): void {
  AudioManager.playSound(SOUND_KEYS.BUTTON_TAP);
}
