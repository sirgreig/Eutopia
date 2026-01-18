// src/audio/index.ts
// Barrel exports for audio system

export { default as AudioManager } from '../services/AudioManager';
export { useAudio, playSound, playButtonTap } from '../hooks/useAudio';
export { AudioSettingsModal } from '../components/settings/AudioSettingsModal';
export {
  AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
  SOUND_KEYS,
  MUSIC_KEYS,
  SoundKey,
  MusicKey,
} from '../config/audioSettings';
