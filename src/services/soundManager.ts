// src/services/soundManager.ts
// Sound effects management for Eutopia
// Adapted from Inside Joke Battle Arena

import { Audio, AVPlaybackSource, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { AppState, AppStateStatus } from 'react-native';

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
    | 'thunderCrack'
    | 'tripleBeep'
    | 'boatCrash'
    | 'boatFishing'
    | 'boatLaunch'
    | 'populationBoost'
    | 'menuOpen';

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
    thunderCrack: require('../../assets/audio/thunderCrack.mp3'),
    tripleBeep: require('../../assets/audio/tripleBeep.mp3'),
    boatCrash: require('../../assets/audio/boatCrash.mp3'),
    boatFishing: require('../../assets/audio/boatFishing.mp3'),
    boatLaunch: require('../../assets/audio/boatLaunch.mp3'),
    populationBoost: require('../../assets/audio/populationBoost.mp3'),
    menuOpen: require('../../assets/audio/switch31.mp3'),
};

// Music track type
export type MusicTrack = 'menu' | 'gameplay' | 'tension' | 'victory' | 'defeat';

// Music files
const MUSIC_FILES: Record<MusicTrack, AVPlaybackSource> = {
    menu: require('../../assets/audio/game_score1.mp3'),
    gameplay: require('../../assets/audio/gamePlay1.mp3'),
    tension: require('../../assets/audio/gameTension.mp3'),
    victory: require('../../assets/audio/gameOverWin.mp3'),
    defeat: require('../../assets/audio/gameOverLose.mp3'),
};

// Music state
let currentMusicSound: Audio.Sound | null = null;
let currentMusicTrack: MusicTrack | null = null;
let musicEnabled = true;
let musicVolume = 0.5; // 0-1 scale
let isCrossfading = false;
let musicPausedTrack: MusicTrack | null = null; // Track to resume after foreground

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
    thunderCrack: 0.9,
    tripleBeep: 0.8,
    boatCrash: 1.0,
    boatFishing: 0.7,
    boatLaunch: 0.9,
    populationBoost: 0.8,
    menuOpen: 0.7,
};

// Preloaded sound objects
const loadedSounds: Map<SoundEffect, Audio.Sound> = new Map();

// Sound settings
let soundEnabled = true;
let sfxVolume = 1.0; // 0-1 scale

// Crossfade settings
const CROSSFADE_DURATION = 1500; // ms
const CROSSFADE_STEPS = 15;

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
            'boatFishing',
            'boatLaunch',
            'thunderCrack',
            'menuOpen',
            'populationBoost',
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
 * Play background music with crossfade (loops by default)
 * Victory/defeat tracks play once without looping.
 */
export async function playMusic(track: MusicTrack): Promise<void> {
    if (!musicEnabled) return;
    
    // If same track is already playing, do nothing
    if (currentMusicTrack === track && currentMusicSound) {
        return;
    }
    
    // If already crossfading, skip — next effect trigger will catch up
    if (isCrossfading) return;
    
    // Victory/defeat play once; everything else loops
    const shouldLoop = track !== 'victory' && track !== 'defeat';
    
    // If there's existing music, crossfade to new track
    if (currentMusicSound && currentMusicTrack) {
        await crossfadeToTrack(track, shouldLoop);
    } else {
        // No existing music — start fresh
        await startTrack(track, shouldLoop);
    }
}

/**
 * Start a music track from scratch (no crossfade)
 */
async function startTrack(track: MusicTrack, loop: boolean = true): Promise<void> {
    try {
        const { sound } = await Audio.Sound.createAsync(MUSIC_FILES[track], {
            shouldPlay: true,
            isLooping: loop,
            volume: musicVolume,
        });
        currentMusicSound = sound;
        currentMusicTrack = track;
        console.log(`🎵 Music started: ${track}`);
    } catch (error) {
        console.warn('Failed to start music:', error);
    }
}

/**
 * Crossfade from current track to new track
 */
async function crossfadeToTrack(track: MusicTrack, loop: boolean = true): Promise<void> {
    isCrossfading = true;
    const oldSound = currentMusicSound;
    
    try {
        // Create new track at volume 0
        const { sound: newSound } = await Audio.Sound.createAsync(MUSIC_FILES[track], {
            shouldPlay: true,
            isLooping: loop,
            volume: 0,
        });
        
        // Update current references immediately
        currentMusicSound = newSound;
        currentMusicTrack = track;
        
        // Perform crossfade over CROSSFADE_DURATION
        const stepDuration = CROSSFADE_DURATION / CROSSFADE_STEPS;
        for (let i = 1; i <= CROSSFADE_STEPS; i++) {
            const progress = i / CROSSFADE_STEPS;
            await new Promise(resolve => setTimeout(resolve, stepDuration));
            
            try {
                // Fade out old
                if (oldSound) {
                    await oldSound.setVolumeAsync(musicVolume * (1 - progress));
                }
                // Fade in new (only if still the current sound)
                if (currentMusicSound === newSound) {
                    await newSound.setVolumeAsync(musicVolume * progress);
                }
            } catch {
                // Sound may have been unloaded mid-fade
                break;
            }
        }
        
        // Cleanup old sound
        if (oldSound) {
            try {
                await oldSound.stopAsync();
                await oldSound.unloadAsync();
            } catch {
                // Ignore cleanup errors
            }
        }
    } catch (error) {
        console.warn('Crossfade failed, falling back to hard switch:', error);
        // Fallback: hard switch
        if (oldSound) {
            try { await oldSound.stopAsync(); await oldSound.unloadAsync(); } catch {}
        }
        currentMusicSound = null;
        currentMusicTrack = null;
        await startTrack(track, loop);
    } finally {
        isCrossfading = false;
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
 * Pause music (for app backgrounding)
 */
export async function pauseMusic(): Promise<void> {
    if (!currentMusicSound || !currentMusicTrack) return;
    
    try {
        await currentMusicSound.pauseAsync();
        musicPausedTrack = currentMusicTrack;
        console.log('🎵 Music paused');
    } catch (error) {
        console.warn('Failed to pause music:', error);
    }
}

/**
 * Resume music (for app foregrounding)
 */
export async function resumeMusic(): Promise<void> {
    if (!musicEnabled) return;
    
    if (currentMusicSound && musicPausedTrack) {
        try {
            await currentMusicSound.playAsync();
            musicPausedTrack = null;
            console.log('🎵 Music resumed');
        } catch (error) {
            console.warn('Failed to resume music:', error);
        }
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

// ============================================
// BACKGROUND / FOREGROUND MANAGEMENT
// ============================================

let wasPlayingBeforeBackground: MusicTrack | null = null;
let appStateSubscription: any = null;

function handleAppStateChange(nextAppState: AppStateStatus): void {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (currentMusicSound && currentMusicTrack) {
            wasPlayingBeforeBackground = currentMusicTrack;
            currentMusicSound.pauseAsync().catch(() => {});
            console.log('🎵 Music paused (app backgrounded)');
        }
    } else if (nextAppState === 'active') {
        if (wasPlayingBeforeBackground && musicEnabled && currentMusicSound) {
            currentMusicSound.playAsync().catch(() => {});
            console.log('🎵 Music resumed (app foregrounded)');
            wasPlayingBeforeBackground = null;
        }
    }
}

export function startAppStateListener(): void {
    if (appStateSubscription) return;
    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    console.log('🔊 App state listener started');
}

export function stopAppStateListener(): void {
    if (appStateSubscription) {
        appStateSubscription.remove();
        appStateSubscription = null;
    }
}

// ============================================
// AMBIENT SOUND (Ocean Waves)
// ============================================

const OCEAN_WAVES_FILE = require('../../assets/audio/oceanWaves.mp3');
let oceanWavesSound: Audio.Sound | null = null;
let oceanWavesPlaying = false;
const OCEAN_WAVES_VOLUME = 0.15; // Quiet background ambience

/**
 * Start ocean waves ambient loop
 */
export async function startOceanWaves(): Promise<void> {
    if (!soundEnabled || oceanWavesPlaying) return;
    
    try {
        if (!oceanWavesSound) {
            const { sound } = await Audio.Sound.createAsync(OCEAN_WAVES_FILE, {
                shouldPlay: true,
                isLooping: true,
                volume: OCEAN_WAVES_VOLUME * sfxVolume,
            });
            oceanWavesSound = sound;
        } else {
            await oceanWavesSound.setVolumeAsync(OCEAN_WAVES_VOLUME * sfxVolume);
            await oceanWavesSound.playAsync();
        }
        oceanWavesPlaying = true;
    } catch (error) {
        console.warn('Failed to start ocean waves:', error);
    }
}

/**
 * Stop ocean waves ambient loop
 */
export async function stopOceanWaves(): Promise<void> {
    if (!oceanWavesSound) return;
    
    try {
        await oceanWavesSound.pauseAsync();
        oceanWavesPlaying = false;
    } catch (error) {
        console.warn('Failed to stop ocean waves:', error);
    }
}

/**
 * Pause ocean waves (for backgrounding)
 */
export async function pauseOceanWaves(): Promise<void> {
    if (!oceanWavesSound || !oceanWavesPlaying) return;
    try {
        await oceanWavesSound.pauseAsync();
    } catch (error) {
        // Ignore
    }
}

/**
 * Resume ocean waves (for foregrounding)
 */
export async function resumeOceanWaves(): Promise<void> {
    if (!soundEnabled || !oceanWavesSound || !oceanWavesPlaying) return;
    try {
        await oceanWavesSound.playAsync();
    } catch (error) {
        // Ignore
    }
}

/**
 * Clean up all loaded sounds, music, and ambient
 */
export async function cleanupSounds(): Promise<void> {
    // Stop app state listener
    stopAppStateListener();
    
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
    
    // Clean up ocean waves
    if (oceanWavesSound) {
        try {
            await oceanWavesSound.unloadAsync();
            oceanWavesSound = null;
            oceanWavesPlaying = false;
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
    boatFishing: () => playSound('boatFishing'),
    boatCrash: () => playSound('boatCrash'),
    boatLaunch: () => playSound('boatLaunch'),
    
    // Building
    buildPlace: () => playSound('buildPlace'),
    buildError: () => playSound('buildError'),
    menuOpen: () => playSound('menuOpen'),
    
    // Game events
    roundStart: () => playSound('roundStart'),
    roundEnd: () => playSound('roundEnd'),
    goldReceive: () => playSound('goldReceive'),
    populationBoost: () => playSound('populationBoost'),
    rebelAppear: () => playSound('rebelAppear'),
    stabilityAchieved: () => playSound('stabilityAchieved'),
    gameOverWin: () => playSound('gameOverWin'),
    gameOverLose: () => playSound('gameOverLose'),
    
    // Weather & misc
    rainStorm: () => playSound('rainStorm'),
    thunderCrack: () => playSound('thunderCrack'),
    tripleBeep: () => playSound('tripleBeep'),

    // Music
    playMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    setMusicVolume,
    getMusicVolume,
    setMusicEnabled,
    isMusicEnabled,
    getCurrentMusicTrack,

    // Background/foreground
    startAppStateListener,
    stopAppStateListener,

    // SFX Settings
    setEnabled: setSoundEnabled,
    isEnabled: isSoundEnabled,
    setVolume: setSoundVolume,
    getVolume: getSoundVolume,

    // Ambient
    startOceanWaves,
    stopOceanWaves,
    pauseOceanWaves,
    resumeOceanWaves,
};

export default Sounds;
