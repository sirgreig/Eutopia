// src/services/AudioManager.ts
// Centralized audio management using Expo AV

import { Audio, AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
  AUDIO_STORAGE_KEY,
  SoundKey,
  MusicKey,
} from '../config/audioSettings';

// Map sound keys to require() calls for bundling
// Add new sounds here as they're added to assets/audio/
const SOUND_FILES: Partial<Record<SoundKey, any>> = {
  button_click: require('../../assets/audio/button_click.mp3'),
  tile_click: require('../../assets/audio/tile_click.mp3'),
  boat_select: require('../../assets/audio/boat_select.mp3'),
  boat_move: require('../../assets/audio/boat_move.mp3'),
  // Add more sounds as they become available:
  // menu_open: require('../../assets/audio/menu_open.mp3'),
  // build_place: require('../../assets/audio/build_place.mp3'),
  // etc.
};

const MUSIC_FILES: Partial<Record<MusicKey, any>> = {
  // Add music tracks as they become available:
  // music_gameplay: require('../../assets/audio/music_gameplay.mp3'),
};

class AudioManager {
  private static instance: AudioManager;
  private sounds: Map<string, Audio.Sound> = new Map();
  private currentMusic: Audio.Sound | null = null;
  private currentMusicKey: MusicKey | null = null;
  private settings: AudioSettings = DEFAULT_AUDIO_SETTINGS;
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize audio system - call once at app startup
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Configure audio mode for game
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load saved settings
      await this.loadSettings();

      // Preload common sounds
      await this.preloadSounds();

      this.isInitialized = true;
      console.log('[AudioManager] Initialized successfully');
    } catch (error) {
      console.error('[AudioManager] Initialization error:', error);
    }
  }

  /**
   * Preload frequently used sounds for instant playback
   */
  private async preloadSounds(): Promise<void> {
    const preloadKeys: SoundKey[] = ['button_click', 'tile_click', 'boat_select', 'boat_move'];
    
    for (const key of preloadKeys) {
      if (SOUND_FILES[key]) {
        try {
          const { sound } = await Audio.Sound.createAsync(SOUND_FILES[key]);
          this.sounds.set(key, sound);
        } catch (error) {
          console.warn(`[AudioManager] Failed to preload sound: ${key}`, error);
        }
      }
    }
  }

  /**
   * Load settings from AsyncStorage
   */
  async loadSettings(): Promise<AudioSettings> {
    try {
      const stored = await AsyncStorage.getItem(AUDIO_STORAGE_KEY);
      if (stored) {
        this.settings = { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('[AudioManager] Failed to load settings:', error);
      this.settings = DEFAULT_AUDIO_SETTINGS;
    }
    return this.settings;
  }

  /**
   * Save settings to AsyncStorage
   */
  async saveSettings(settings: Partial<AudioSettings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    try {
      await AsyncStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('[AudioManager] Failed to save settings:', error);
    }
  }

  /**
   * Get current audio settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Update settings (does not persist - call saveSettings to persist)
   */
  updateSettings(settings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...settings };
    
    // Update currently playing music volume if needed
    if (this.currentMusic && settings.musicVolume !== undefined) {
      const volume = this.settings.musicMuted ? 0 : this.settings.musicVolume / 100;
      this.currentMusic.setVolumeAsync(volume);
    }
  }

  /**
   * Play a sound effect
   */
  async playSound(key: SoundKey): Promise<void> {
    if (this.settings.effectsMuted) return;
    
    const soundFile = SOUND_FILES[key];
    if (!soundFile) {
      console.warn(`[AudioManager] Sound not found: ${key}`);
      return;
    }

    try {
      // Check if sound is preloaded
      let sound = this.sounds.get(key);
      
      if (sound) {
        // Fire-and-forget for preloaded sounds (avoids seeking race condition on rapid taps)
        sound.setVolumeAsync(this.settings.effectsVolume / 100);
        sound.replayAsync().catch(() => {
          // Silently ignore seeking errors - sound will play on next tap
        });
      } else {
        // Load and play on demand
        const { sound: newSound } = await Audio.Sound.createAsync(
          soundFile,
          { 
            volume: this.settings.effectsVolume / 100,
            shouldPlay: true,
          }
        );
        
        // Clean up after playback
        newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (status.isLoaded && status.didJustFinish) {
            newSound.unloadAsync();
          }
        });
      }
    } catch (error) {
      // Only log non-seeking errors
      const errorMsg = error instanceof Error ? error.message : '';
      if (!errorMsg.includes('Seeking interrupted')) {
        console.error(`[AudioManager] Error playing sound ${key}:`, error);
      }
    }
  }

  /**
   * Play background music (with optional crossfade)
   */
  async playMusic(key: MusicKey, crossfade: boolean = true): Promise<void> {
    if (key === this.currentMusicKey && this.currentMusic) return;
    
    const musicFile = MUSIC_FILES[key];
    if (!musicFile) {
      console.warn(`[AudioManager] Music not found: ${key}`);
      return;
    }

    try {
      const volume = this.settings.musicMuted ? 0 : this.settings.musicVolume / 100;
      
      // Create new music track
      const { sound: newMusic } = await Audio.Sound.createAsync(
        musicFile,
        {
          volume: crossfade ? 0 : volume,
          isLooping: true,
          shouldPlay: true,
        }
      );

      // Crossfade if there's existing music
      if (crossfade && this.currentMusic) {
        await this.crossfade(this.currentMusic, newMusic, volume, 1000);
      } else if (this.currentMusic) {
        await this.currentMusic.stopAsync();
        await this.currentMusic.unloadAsync();
      }

      this.currentMusic = newMusic;
      this.currentMusicKey = key;
      
      if (!crossfade) {
        await newMusic.setVolumeAsync(volume);
      }
    } catch (error) {
      console.error(`[AudioManager] Error playing music ${key}:`, error);
    }
  }

  /**
   * Crossfade between two audio tracks
   */
  private async crossfade(
    fromSound: Audio.Sound,
    toSound: Audio.Sound,
    targetVolume: number,
    durationMs: number
  ): Promise<void> {
    const steps = 20;
    const stepDuration = durationMs / steps;
    const volumeStep = targetVolume / steps;

    for (let i = 0; i <= steps; i++) {
      const fadeOutVolume = targetVolume * (1 - i / steps);
      const fadeInVolume = volumeStep * i;
      
      await Promise.all([
        fromSound.setVolumeAsync(fadeOutVolume),
        toSound.setVolumeAsync(fadeInVolume),
      ]);
      
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }

    await fromSound.stopAsync();
    await fromSound.unloadAsync();
  }

  /**
   * Stop current music
   */
  async stopMusic(fadeOut: boolean = true): Promise<void> {
    if (!this.currentMusic) return;

    try {
      if (fadeOut) {
        // Fade out over 500ms
        const steps = 10;
        const status = await this.currentMusic.getStatusAsync();
        if (status.isLoaded) {
          const startVolume = status.volume;
          for (let i = steps; i >= 0; i--) {
            await this.currentMusic.setVolumeAsync(startVolume * (i / steps));
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
      }

      await this.currentMusic.stopAsync();
      await this.currentMusic.unloadAsync();
      this.currentMusic = null;
      this.currentMusicKey = null;
    } catch (error) {
      console.error('[AudioManager] Error stopping music:', error);
    }
  }

  /**
   * Pause all audio (for app going to background)
   */
  async pauseAll(): Promise<void> {
    if (this.currentMusic) {
      await this.currentMusic.pauseAsync();
    }
  }

  /**
   * Resume audio (for app coming to foreground)
   */
  async resumeAll(): Promise<void> {
    if (this.currentMusic && !this.settings.musicMuted) {
      await this.currentMusic.playAsync();
    }
  }

  /**
   * Set music volume (0-100)
   */
  async setMusicVolume(volume: number): Promise<void> {
    this.settings.musicVolume = Math.max(0, Math.min(100, volume));
    if (this.currentMusic && !this.settings.musicMuted) {
      await this.currentMusic.setVolumeAsync(this.settings.musicVolume / 100);
    }
  }

  /**
   * Set effects volume (0-100)
   */
  setEffectsVolume(volume: number): void {
    this.settings.effectsVolume = Math.max(0, Math.min(100, volume));
  }

  /**
   * Toggle music mute
   */
  async toggleMusicMute(): Promise<boolean> {
    this.settings.musicMuted = !this.settings.musicMuted;
    if (this.currentMusic) {
      const volume = this.settings.musicMuted ? 0 : this.settings.musicVolume / 100;
      await this.currentMusic.setVolumeAsync(volume);
    }
    return this.settings.musicMuted;
  }

  /**
   * Toggle effects mute
   */
  toggleEffectsMute(): boolean {
    this.settings.effectsMuted = !this.settings.effectsMuted;
    return this.settings.effectsMuted;
  }

  /**
   * Clean up all audio resources
   */
  async cleanup(): Promise<void> {
    // Unload all preloaded sounds
    for (const sound of this.sounds.values()) {
      await sound.unloadAsync();
    }
    this.sounds.clear();

    // Stop and unload music
    if (this.currentMusic) {
      await this.currentMusic.unloadAsync();
      this.currentMusic = null;
      this.currentMusicKey = null;
    }

    this.isInitialized = false;
  }
}

export default AudioManager.getInstance();
