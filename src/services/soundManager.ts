// src/services/soundManager.ts
// Sound effects management for Eutopia
// Adapted from Inside Joke Battle Arena

import { Audio, AVPlaybackSource, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

// Sound effect types used in Eutopia
export type SoundEffect =
    | 'buttonClick'
    | 'tileClick'
    | 'boatSelect'
    | 'boatMove'
    | 'buildPlace'
    | 'buildError'
    | 'roundStart'
    | 'roundEnd'
    | 'goldReceive'
    | 'rebelAppear'
    | 'stabilityAchieved'
    | 'gameOverWin'
    | 'gameOverLose';

// Sound file mappings - update paths as sounds are added
const SOUND_FILES: Partial<Record<SoundEffect, AVPlaybackSource>> = {
    buttonClick: require('../../assets/audio/button_click.mp3'),
    tileClick: require('../../assets/audio/tile_click.mp3'),
    boatSelect: require('../../assets/audio/boat_select.mp3'),
    boatMove: require('../../assets/audio/boat_move.mp3'),
    // Add more as they become available:
    // buildPlace: require('../../assets/audio/build_place.mp3'),
    // roundStart: require('../../assets/audio/round_start.mp3'),
};

// Volume adjustments for specific sounds (1.0 = default)
const SOUND_VOLUMES: Partial<Record<SoundEffect, number>> = {
    buttonClick: 0.8,
    tileClick: 0.7,
    boatSelect: 0.8,
    boatMove: 0.8,
};

// Preloaded sound objects
const loadedSounds: Map<SoundEffect, Audio.Sound> = new Map();

// Sound settings
let soundEnabled = true;
let masterVolume = 1.0;

/**
 * Initialize the audio system
 * Call this once at app startup
 */
export async function initializeSounds(): Promise<void> {
    try {
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            allowsRecordingIOS: false,
            interruptionModeIOS: InterruptionModeIOS.DuckOthers,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
            playThroughEarpieceAndroid: false,
            staysActiveInBackground: false,
        });

        console.log('🔊 Sound system initialized');

        // Preload frequently used sounds
        await preloadSounds(['buttonClick', 'tileClick', 'boatSelect', 'boatMove']);
    } catch (error) {
        console.warn('Failed to initialize sound system:', error);
    }
}

/**
 * Preload specific sounds for instant playback
 */
export async function preloadSounds(effects: SoundEffect[]): Promise<void> {
    for (const effect of effects) {
        const source = SOUND_FILES[effect];
        if (!source) continue;
        if (loadedSounds.has(effect)) continue;

        try {
            const volume = (SOUND_VOLUMES[effect] ?? 1.0) * masterVolume;
            const { sound } = await Audio.Sound.createAsync(source, {
                shouldPlay: false,
                volume: volume,
            });
            loadedSounds.set(effect, sound);
            console.log(`🔊 Preloaded: ${effect}`);
        } catch (error) {
            console.warn(`Failed to preload sound: ${effect}`, error);
        }
    }
}

/**
 * Play a sound effect
 */
export async function playSound(effect: SoundEffect): Promise<void> {
    if (!soundEnabled) return;

    const source = SOUND_FILES[effect];
    if (!source) return;

    const volume = (SOUND_VOLUMES[effect] ?? 1.0) * masterVolume;

    try {
        // Check for preloaded sound
        const preloaded = loadedSounds.get(effect);
        if (preloaded) {
            await preloaded.setPositionAsync(0);
            await preloaded.setVolumeAsync(volume);
            preloaded.playAsync(); // Fire and forget
            return;
        }

        // Load and play on demand
        const { sound } = await Audio.Sound.createAsync(source, {
            shouldPlay: true,
            volume: volume,
        });

        // Clean up after playback
        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
                sound.unloadAsync();
            }
        });
    } catch (error) {
        // Silently fail - don't spam console
    }
}

/**
 * Enable or disable sounds
 */
export function setSoundEnabled(enabled: boolean): void {
    soundEnabled = enabled;
    console.log(`🔊 Sound ${enabled ? 'enabled' : 'disabled'}`);
}

/**
 * Check if sounds are enabled
 */
export function isSoundEnabled(): boolean {
    return soundEnabled;
}

/**
 * Set the master sound volume (0.0 to 1.0)
 */
export function setSoundVolume(volume: number): void {
    masterVolume = Math.max(0, Math.min(1, volume));
    console.log(`🔊 Sound volume: ${Math.round(masterVolume * 100)}%`);
}

/**
 * Get current sound volume
 */
export function getSoundVolume(): number {
    return masterVolume;
}

/**
 * Clean up all loaded sounds
 */
export async function cleanupSounds(): Promise<void> {
    for (const sound of loadedSounds.values()) {
        try {
            await sound.unloadAsync();
        } catch (error) {
            // Ignore cleanup errors
        }
    }
    loadedSounds.clear();
    console.log('🔊 Sound system cleaned up');
}

/**
 * Quick play functions for common sounds
 */
export const Sounds = {
    // UI
    buttonClick: () => playSound('buttonClick'),
    tileClick: () => playSound('tileClick'),
    
    // Boats
    boatSelect: () => playSound('boatSelect'),
    boatMove: () => playSound('boatMove'),
    
    // Building
    buildPlace: () => playSound('buildPlace'),
    buildError: () => playSound('buildError'),
    
    // Game events
    roundStart: () => playSound('roundStart'),
    roundEnd: () => playSound('roundEnd'),
    goldReceive: () => playSound('goldReceive'),
    rebelAppear: () => playSound('rebelAppear'),
    stabilityAchieved: () => playSound('stabilityAchieved'),
    gameOverWin: () => playSound('gameOverWin'),
    gameOverLose: () => playSound('gameOverLose'),

    // Settings
    setEnabled: setSoundEnabled,
    isEnabled: isSoundEnabled,
    setVolume: setSoundVolume,
    getVolume: getSoundVolume,
};

export default Sounds;
