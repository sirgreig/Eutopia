// src/services/soundManager.ts
// Sound effects management for Eutopia
// Adapted from Inside Joke Battle Arena

import { createAudioPlayer, setAudioModeAsync, AudioPlayer, AudioSource } from 'expo-audio';
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
const SOUND_FILES: Partial<Record<SoundEffect, AudioSource>> = {
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
const MUSIC_FILES: Record<MusicTrack, AudioSource> = {
    menu: require('../../assets/audio/game_score1.mp3'),
    gameplay: require('../../assets/audio/gamePlay1.mp3'),
    tension: require('../../assets/audio/gameTension.mp3'),
    victory: require('../../assets/audio/gameOverWin.mp3'),
    defeat: require('../../assets/audio/gameOverLose.mp3'),
};

// Music state
let currentMusicPlayer: AudioPlayer | null = null;
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

// Preloaded sound players
const loadedSounds: Map<SoundEffect, AudioPlayer> = new Map();

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
    // Audio mode and preloading have separate try/catch blocks so a mode-setting
    // failure on any platform never prevents sounds from being preloaded.
    try {
        await setAudioModeAsync({
            playsInSilentMode: true,
            allowsRecording: false,
            interruptionMode: 'duckOthers',
            shouldPlayInBackground: false,
        });
        console.log('Sound system initialized');
    } catch (error) {
        console.warn('Failed to set audio mode (non-fatal):', error);
    }

    try {
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
        console.warn('Failed to preload sounds:', error);
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
            const player = createAudioPlayer(source);
            player.volume = (SOUND_VOLUMES[effect] ?? 1.0) * sfxVolume;
            loadedSounds.set(effect, player);
            console.log(`Preloaded: ${effect}`);
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
        // Use preloaded player if available
        const preloaded = loadedSounds.get(effect);
        if (preloaded) {
            preloaded.volume = volume;
            preloaded.seekTo(0);
            preloaded.play();
            return;
        }

        // Load and play on demand, then clean up after a generous window
        const player = createAudioPlayer(source);
        player.volume = volume;
        setTimeout(() => {
            try { player.play(); } catch {}
        }, 50);
        // Clean up after 30s max (covers any long SFX)
        setTimeout(() => {
            try { player.remove(); } catch {}
        }, 30000);
    } catch (error) {
        // Silently fail - don't spam console
    }
}

/**
 * Enable or disable sounds
 */
export function setSoundEnabled(enabled: boolean): void {
    soundEnabled = enabled;
    console.log(`Sound ${enabled ? 'enabled' : 'disabled'}`);
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
    console.log(`Sound volume: ${Math.round(sfxVolume * 100)}%`);
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
    if (currentMusicTrack === track && currentMusicPlayer) {
        return;
    }

    // If already crossfading, skip — next effect trigger will catch up
    if (isCrossfading) return;

    // Victory/defeat play once; everything else loops
    const shouldLoop = track !== 'victory' && track !== 'defeat';

    // If there's existing music, crossfade to new track
    if (currentMusicPlayer && currentMusicTrack) {
        await crossfadeToTrack(track, shouldLoop);
    } else {
        // No existing music — start fresh
        startTrack(track, shouldLoop);
    }
}

/**
 * Start a music track from scratch (no crossfade)
 */
function startTrack(track: MusicTrack, loop: boolean = true): void {
    try {
        const player = createAudioPlayer(MUSIC_FILES[track]);
        player.volume = musicVolume;
        player.loop = loop;
        // Small delay lets the native player finish loading before play() is called.
        // expo-audio loads asynchronously and play() is a no-op if called too early.
        setTimeout(() => { try { player.play(); } catch {} }, 150);
        currentMusicPlayer = player;
        currentMusicTrack = track;
        console.log(`Music started: ${track}`);
    } catch (error) {
        console.warn('Failed to start music:', error);
    }
}

/**
 * Crossfade from current track to new track
 */
async function crossfadeToTrack(track: MusicTrack, loop: boolean = true): Promise<void> {
    isCrossfading = true;
    const oldPlayer = currentMusicPlayer;

    try {
        // Create new track at volume 0
        const newPlayer = createAudioPlayer(MUSIC_FILES[track]);
        newPlayer.volume = 0;
        newPlayer.loop = loop;
        setTimeout(() => { try { newPlayer.play(); } catch {} }, 150);

        // Update current references immediately
        currentMusicPlayer = newPlayer;
        currentMusicTrack = track;

        // Perform crossfade over CROSSFADE_DURATION
        const stepDuration = CROSSFADE_DURATION / CROSSFADE_STEPS;
        for (let i = 1; i <= CROSSFADE_STEPS; i++) {
            const progress = i / CROSSFADE_STEPS;
            await new Promise(resolve => setTimeout(resolve, stepDuration));

            try {
                // Fade out old
                if (oldPlayer) {
                    oldPlayer.volume = musicVolume * (1 - progress);
                }
                // Fade in new (only if still the current player)
                if (currentMusicPlayer === newPlayer) {
                    newPlayer.volume = musicVolume * progress;
                }
            } catch {
                // Player may have been removed mid-fade
                break;
            }
        }

        // Cleanup old player
        if (oldPlayer) {
            try {
                oldPlayer.pause();
                oldPlayer.remove();
            } catch {
                // Ignore cleanup errors
            }
        }
    } catch (error) {
        console.warn('Crossfade failed, falling back to hard switch:', error);
        // Fallback: hard switch
        if (oldPlayer) {
            try { oldPlayer.pause(); oldPlayer.remove(); } catch {}
        }
        currentMusicPlayer = null;
        currentMusicTrack = null;
        startTrack(track, loop);
    } finally {
        isCrossfading = false;
    }
}

/**
 * Stop background music
 */
export function stopMusic(): void {
    if (!currentMusicPlayer) return;

    try {
        currentMusicPlayer.pause();
        currentMusicPlayer.remove();
        currentMusicPlayer = null;
        currentMusicTrack = null;
        console.log('Music stopped');
    } catch (error) {
        console.warn('Failed to stop music:', error);
    }
}

/**
 * Pause music (for app backgrounding)
 */
export function pauseMusic(): void {
    if (!currentMusicPlayer || !currentMusicTrack) return;

    try {
        currentMusicPlayer.pause();
        musicPausedTrack = currentMusicTrack;
        console.log('Music paused');
    } catch (error) {
        console.warn('Failed to pause music:', error);
    }
}

/**
 * Resume music (for app foregrounding)
 */
export function resumeMusic(): void {
    if (!musicEnabled) return;

    if (currentMusicPlayer && musicPausedTrack) {
        try {
            currentMusicPlayer.play();
            musicPausedTrack = null;
            console.log('Music resumed');
        } catch (error) {
            console.warn('Failed to resume music:', error);
        }
    }
}

/**
 * Set music volume (0-1)
 */
export function setMusicVolume(volume: number): void {
    musicVolume = Math.max(0, Math.min(1, volume));
    if (currentMusicPlayer) {
        try {
            currentMusicPlayer.volume = musicVolume;
        } catch (error) {
            // Ignore
        }
    }
    console.log(`Music volume: ${Math.round(musicVolume * 100)}%`);
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
    console.log(`Music ${enabled ? 'enabled' : 'disabled'}`);
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
        if (currentMusicPlayer && currentMusicTrack) {
            wasPlayingBeforeBackground = currentMusicTrack;
            try { currentMusicPlayer.pause(); } catch {}
            console.log('Music paused (app backgrounded)');
        }
    } else if (nextAppState === 'active') {
        if (wasPlayingBeforeBackground && musicEnabled && currentMusicPlayer) {
            try { currentMusicPlayer.play(); } catch {}
            console.log('Music resumed (app foregrounded)');
            wasPlayingBeforeBackground = null;
        }
    }
}

export function startAppStateListener(): void {
    if (appStateSubscription) return;
    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    console.log('App state listener started');
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
let oceanWavesPlayer: AudioPlayer | null = null;
let oceanWavesPlaying = false;
const OCEAN_WAVES_VOLUME = 0.15; // Quiet background ambience

/**
 * Start ocean waves ambient loop
 */
export function startOceanWaves(): void {
    if (!soundEnabled || oceanWavesPlaying) return;

    try {
        if (!oceanWavesPlayer) {
            oceanWavesPlayer = createAudioPlayer(OCEAN_WAVES_FILE);
            oceanWavesPlayer.loop = true;
        }
        oceanWavesPlayer.volume = OCEAN_WAVES_VOLUME * sfxVolume;
        setTimeout(() => { try { oceanWavesPlayer?.play(); } catch {} }, 150);
        oceanWavesPlaying = true;
    } catch (error) {
        console.warn('Failed to start ocean waves:', error);
    }
}

/**
 * Stop ocean waves ambient loop
 */
export function stopOceanWaves(): void {
    if (!oceanWavesPlayer) return;

    try {
        oceanWavesPlayer.pause();
        oceanWavesPlaying = false;
    } catch (error) {
        console.warn('Failed to stop ocean waves:', error);
    }
}

/**
 * Pause ocean waves (for backgrounding)
 */
export function pauseOceanWaves(): void {
    if (!oceanWavesPlayer || !oceanWavesPlaying) return;
    try {
        oceanWavesPlayer.pause();
    } catch {
        // Ignore
    }
}

/**
 * Resume ocean waves (for foregrounding)
 */
export function resumeOceanWaves(): void {
    if (!soundEnabled || !oceanWavesPlayer || !oceanWavesPlaying) return;
    try {
        oceanWavesPlayer.play();
    } catch {
        // Ignore
    }
}

/**
 * Clean up all loaded sounds, music, and ambient
 */
export function cleanupSounds(): void {
    // Stop app state listener
    stopAppStateListener();

    // Clean up sound effects
    for (const player of loadedSounds.values()) {
        try {
            player.remove();
        } catch {
            // Ignore cleanup errors
        }
    }
    loadedSounds.clear();

    // Clean up music
    if (currentMusicPlayer) {
        try {
            currentMusicPlayer.pause();
            currentMusicPlayer.remove();
            currentMusicPlayer = null;
            currentMusicTrack = null;
        } catch {
            // Ignore cleanup errors
        }
    }

    // Clean up ocean waves
    if (oceanWavesPlayer) {
        try {
            oceanWavesPlayer.pause();
            oceanWavesPlayer.remove();
            oceanWavesPlayer = null;
            oceanWavesPlaying = false;
        } catch {
            // Ignore cleanup errors
        }
    }

    console.log('Sound system cleaned up');
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
