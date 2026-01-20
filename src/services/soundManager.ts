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
    | 'gameOverLose'
    | 'rainStorm'
    | 'tripleBeep';

// Sound file mappings
const SOUND_FILES: Partial<Record<SoundEffect, AVPlaybackSource>> = {
    buttonClick: require('../../assets/audio/button_click.mp3'),
    tileClick: require('../../assets/audio/tile_click.mp3'),
    boatSelect: require('../../assets/audio/boat_select.mp3'),
    boatMove: require('../../assets/audio/boat_move.mp3'),
    buildPlace: require('../../assets/audio/buildPlace.mp3'),
    buildError: require('../../assets/audio/buildError.mp3'),
    roundStart: require('../../assets/audio/roundStart.mp3'),
    roundEnd: require('../../assets/audio/roundEnd.mp3'),
    goldReceive: require('../../assets/audio/goldReceive.mp3'),
    rebelAppear: require('../../assets/audio/rebelAppear.mp3'),
    stabilityAchieved: require('../../assets/audio/stabilityAchieved.mp3'),
    gameOverWin: require('../../assets/audio/gameOverWin.mp3'),
    gameOverLose: require('../../assets/audio/gameOverLose.mp3'),
    rainStorm: require('../../assets/audio/_rainStorm.mp3'),
    tripleBeep: require('../../assets/audio/tripleBeep.mp3'),
};

// Music files
const MUSIC_FILES = {
    menu: require('../../assets/audio/game_score1.mp3'),
    gameplay: require('../../assets/audio/gamePlay1.mp3'),
};

export type MusicTrack = 'menu' | 'gameplay';

// Music state
let currentMusicSound: Audio.Sound | null = null;
let currentMusicTrack: MusicTrack | null = null;
let musicEnabled = true;
let musicVolume = 0.5; // 0-1 scale

// Volume adjustments for specific sounds (1.0 = default)
const SOUND_VOLUMES: Partial<Record<SoundEffect, number>> = {
    buttonClick: 0.8,
    tileClick: 0.7,
    boatSelect: 0.8,
    boatMove: 0.8,
    buildPlace: 0.9,
    buildError: 0.7,
    roundStart: 1.0,
    roundEnd: 0.9,
    goldReceive: 0.8,
    rebelAppear: 1.0,
    stabilityAchieved: 0.9,
    gameOverWin: 1.0,
    gameOverLose: 0.9,
    rainStorm: 0.6,
    tripleBeep: 0.8,
};

// Preloaded sound objects
const loadedSounds: Map<SoundEffect, Audio.Sound> = new Map();

// Sound settings
let soundEnabled = true;
let sfxVolume = 1.0; // 0-1 scale

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
        await preloadSounds([
            'buttonClick', 
            'tileClick', 
            'boatSelect', 
            'boatMove',
            'buildPlace',
            'buildError',
            'roundStart',
            'roundEnd',
            'goldReceive',
            'rebelAppear',
            'stabilityAchieved',
        ]);
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
            const volume = (SOUND_VOLUMES[effect] ?? 1.0) * sfxVolume;
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

    const volume = (SOUND_VOLUMES[effect] ?? 1.0) * sfxVolume;

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
    sfxVolume = Math.max(0, Math.min(1, volume));
    console.log(`🔊 Sound volume: ${Math.round(sfxVolume * 100)}%`);
}

/**
 * Get current sound volume
 */
export function getSoundVolume(): number {
    return sfxVolume;
}

// ============================================
// MUSIC FUNCTIONS
// ============================================

/**
 * Play background music (loops)
 */
export async function playMusic(track: MusicTrack): Promise<void> {
    if (!musicEnabled) return;
    
    // If same track is already playing, do nothing
    if (currentMusicTrack === track && currentMusicSound) {
        return;
    }
    
    try {
        // Stop current music if playing
        if (currentMusicSound) {
            await currentMusicSound.stopAsync();
            await currentMusicSound.unloadAsync();
            currentMusicSound = null;
        }
        
        // Create and play new track
        const { sound } = await Audio.Sound.createAsync(MUSIC_FILES[track], {
            shouldPlay: true,
            isLooping: true,
            volume: musicVolume,
        });
        currentMusicSound = sound;
        currentMusicTrack = track;
        console.log(`🎵 Music started: ${track}`);
    } catch (error) {
        console.warn('Failed to play music:', error);
    }
}

/**
 * Stop background music
 */
export async function stopMusic(): Promise<void> {
    if (!currentMusicSound) return;
    
    try {
        await currentMusicSound.stopAsync();
        await currentMusicSound.unloadAsync();
        currentMusicSound = null;
        currentMusicTrack = null;
        console.log('🎵 Music stopped');
    } catch (error) {
        console.warn('Failed to stop music:', error);
    }
}

/**
 * Set music volume (0-1)
 */
export async function setMusicVolume(volume: number): Promise<void> {
    musicVolume = Math.max(0, Math.min(1, volume));
    if (currentMusicSound) {
        try {
            await currentMusicSound.setVolumeAsync(musicVolume);
        } catch (error) {
            // Ignore
        }
    }
    console.log(`🎵 Music volume: ${Math.round(musicVolume * 100)}%`);
}

/**
 * Get current music volume
 */
export function getMusicVolume(): number {
    return musicVolume;
}

/**
 * Set music enabled state
 */
export function setMusicEnabled(enabled: boolean): void {
    musicEnabled = enabled;
    if (!enabled) {
        stopMusic();
    }
    console.log(`🎵 Music ${enabled ? 'enabled' : 'disabled'}`);
}

/**
 * Check if music is enabled
 */
export function isMusicEnabled(): boolean {
    return musicEnabled;
}

/**
 * Get currently playing track
 */
export function getCurrentMusicTrack(): MusicTrack | null {
    return currentMusicTrack;
}

/**
 * Clean up all loaded sounds and music
 */
export async function cleanupSounds(): Promise<void> {
    // Clean up sound effects
    for (const sound of loadedSounds.values()) {
        try {
            await sound.unloadAsync();
        } catch (error) {
            // Ignore cleanup errors
        }
    }
    loadedSounds.clear();
    
    // Clean up music
    if (currentMusicSound) {
        try {
            await currentMusicSound.unloadAsync();
            currentMusicSound = null;
            currentMusicTrack = null;
        } catch (error) {
            // Ignore cleanup errors
        }
    }
    
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
    
    // Weather & misc
    rainStorm: () => playSound('rainStorm'),
    tripleBeep: () => playSound('tripleBeep'),

    // Music
    playMusic,
    stopMusic,
    setMusicVolume,
    getMusicVolume,
    setMusicEnabled,
    isMusicEnabled,
    getCurrentMusicTrack,

    // SFX Settings
    setEnabled: setSoundEnabled,
    isEnabled: isSoundEnabled,
    setVolume: setSoundVolume,
    getVolume: getSoundVolume,
};

export default Sounds;
