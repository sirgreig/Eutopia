// src/config/audioSettings.ts
// Audio configuration and sound key constants

export interface AudioSettings {
  musicVolume: number;      // 0-100
  effectsVolume: number;    // 0-100
  musicMuted: boolean;
  effectsMuted: boolean;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  musicVolume: 70,
  effectsVolume: 80,
  musicMuted: false,
  effectsMuted: false,
};

export const AUDIO_STORAGE_KEY = '@eutopia_audio_settings';

// Sound effect keys - maps to file names in assets/audio/
export const SOUND_KEYS = {
  // UI
  BUTTON_TAP: 'button_click',
  TILE_TAP: 'tile_click',
  MENU_OPEN: 'menu_open',
  MENU_CLOSE: 'menu_close',
  BUILD_PLACE: 'build_place',
  BUILD_ERROR: 'build_error',
  GOLD_SPEND: 'gold_spend',
  GOLD_RECEIVE: 'gold_receive',
  
  // Gameplay
  ROUND_START: 'round_start',
  ROUND_END: 'round_end',
  TIMER_WARNING: 'timer_warning',
  TIMER_TICK: 'timer_tick',
  
  // Population
  POPULATION_UP: 'population_up',
  POPULATION_DOWN: 'population_down',
  
  // Environment
  RAIN: 'rain',
  THUNDER: 'thunder',
  WAVES_AMBIENT: 'waves_ambient',
  SEAGULLS: 'seagulls',
  
  // Boats
  BOAT_LAUNCH: 'boat_launch',
  BOAT_MOVE: 'boat_move',
  BOAT_SELECT: 'boat_select',
  
  // Events
  REBEL_APPEAR: 'rebel_appear',
  REBELS_CLEARED: 'rebels_cleared',
  STABILITY_ACHIEVED: 'stability_achieved',
  
  // Game Over
  GAME_OVER_WIN: 'game_over_win',
  GAME_OVER_LOSE: 'game_over_lose',
} as const;

export type SoundKey = typeof SOUND_KEYS[keyof typeof SOUND_KEYS];

// Music track keys
export const MUSIC_KEYS = {
  GAMEPLAY: 'music_gameplay',
  GAMEPLAY_TENSE: 'music_tense',
  VICTORY: 'music_victory',
  DEFEAT: 'music_defeat',
} as const;

export type MusicKey = typeof MUSIC_KEYS[keyof typeof MUSIC_KEYS];
