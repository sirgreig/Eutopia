// src/hooks/useAudioSettings.ts
// Manages audio settings with AsyncStorage persistence
// Supports separate music and SFX volume controls

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sounds } from '../services/soundManager';

const STORAGE_KEY = '@eutopia_audio_settings';

export type AudioSettings = {
    musicEnabled: boolean;
    musicVolume: number;  // 0-1
    sfxEnabled: boolean;
    sfxVolume: number;    // 0-1
};

const DEFAULT_SETTINGS: AudioSettings = {
    musicEnabled: true,
    musicVolume: 0.5,
    sfxEnabled: true,
    sfxVolume: 1.0,
};

// Global state to share across components
let globalSettings: AudioSettings = { ...DEFAULT_SETTINGS };
let listeners: Set<() => void> = new Set();

function notifyListeners() {
    listeners.forEach(listener => listener());
}

/**
 * Load saved audio settings and apply them
 * Call once at app startup
 */
export async function loadAudioSettings(): Promise<AudioSettings> {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as AudioSettings;
            globalSettings = { ...DEFAULT_SETTINGS, ...parsed };
        }
        
        // Apply loaded settings to sound systems
        Sounds.setMusicEnabled(globalSettings.musicEnabled);
        Sounds.setMusicVolume(globalSettings.musicVolume);
        Sounds.setEnabled(globalSettings.sfxEnabled);
        Sounds.setVolume(globalSettings.sfxVolume);
        
        console.log('🔊 Audio settings loaded:', globalSettings);
        return globalSettings;
    } catch (error) {
        console.warn('Failed to load audio settings:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Save audio settings to AsyncStorage
 */
async function saveAudioSettings(settings: AudioSettings): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.warn('Failed to save audio settings:', error);
    }
}

/**
 * Get current global settings (for components that don't use hook)
 */
export function getAudioSettings(): AudioSettings {
    return { ...globalSettings };
}

/**
 * Hook to access and modify audio settings
 */
export function useAudioSettings() {
    const [settings, setLocalSettings] = useState<AudioSettings>(globalSettings);
    
    // Subscribe to global changes
    useEffect(() => {
        const listener = () => {
            setLocalSettings({ ...globalSettings });
        };
        listeners.add(listener);
        
        return () => {
            listeners.delete(listener);
        };
    }, []);
    
    // Toggle Music on/off
    const toggleMusic = useCallback(async () => {
        globalSettings.musicEnabled = !globalSettings.musicEnabled;
        Sounds.setMusicEnabled(globalSettings.musicEnabled);
        await saveAudioSettings(globalSettings);
        notifyListeners();
    }, []);
    
    // Toggle SFX on/off
    const toggleSfx = useCallback(async () => {
        globalSettings.sfxEnabled = !globalSettings.sfxEnabled;
        Sounds.setEnabled(globalSettings.sfxEnabled);
        await saveAudioSettings(globalSettings);
        notifyListeners();
    }, []);
    
    // Toggle all audio on/off
    const toggleAllAudio = useCallback(async () => {
        const newEnabled = !(globalSettings.musicEnabled || globalSettings.sfxEnabled);
        globalSettings.musicEnabled = newEnabled;
        globalSettings.sfxEnabled = newEnabled;
        Sounds.setMusicEnabled(newEnabled);
        Sounds.setEnabled(newEnabled);
        await saveAudioSettings(globalSettings);
        notifyListeners();
    }, []);
    
    // Check if any audio is enabled
    const isAudioEnabled = settings.musicEnabled || settings.sfxEnabled;
    
    // Set Music volume (0-1)
    const setMusicVolume = useCallback(async (volume: number) => {
        globalSettings.musicVolume = Math.max(0, Math.min(1, volume));
        await Sounds.setMusicVolume(globalSettings.musicVolume);
        await saveAudioSettings(globalSettings);
        notifyListeners();
    }, []);
    
    // Set SFX volume (0-1)
    const setSfxVolume = useCallback(async (volume: number) => {
        globalSettings.sfxVolume = Math.max(0, Math.min(1, volume));
        Sounds.setVolume(globalSettings.sfxVolume);
        await saveAudioSettings(globalSettings);
        notifyListeners();
    }, []);
    
    return {
        settings,
        isAudioEnabled,
        toggleMusic,
        toggleSfx,
        toggleAllAudio,
        setMusicVolume,
        setSfxVolume,
    };
}

export default useAudioSettings;
