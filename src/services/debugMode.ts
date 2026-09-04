// src/services/debugMode.ts
//
// Hidden developer aid for testing.
//
// Enhanced Mode has twelve buildings and the most interesting interactions
// (granary banking, marketplace conversion, fog reveal rates) only become
// affordable late in a long game. Testing them by playing to round eight every time
// is impractical.
//
// Unlocked by tapping the Settings build footer five times. Deliberately:
//   - NOT persisted. It resets on every app launch, so it cannot be left on by
//     accident or discovered in storage.
//   - NOT mentioned in the UI, help, or release notes.
//   - NOT a gameplay feature. If a player finds it, they have cheated themselves
//     out of a game they chose to play; nothing else is at risk.

let debugEnabled = false;
const listeners = new Set<() => void>();

export function isDebugEnabled(): boolean {
  return debugEnabled;
}

export function setDebugEnabled(enabled: boolean): void {
  if (debugEnabled === enabled) return;
  debugEnabled = enabled;
  listeners.forEach((l) => l());
}

export function subscribeDebug(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Tap counter for the Settings footer unlock gesture. */
let tapCount = 0;
let lastTapAt = 0;
const TAPS_REQUIRED = 5;
const TAP_WINDOW_MS = 2000;

/**
 * Register a tap on the unlock target.
 * Returns true when this tap completed the gesture and toggled debug mode.
 */
export function registerUnlockTap(): boolean {
  const now = Date.now();
  if (now - lastTapAt > TAP_WINDOW_MS) {
    tapCount = 0;
  }
  lastTapAt = now;
  tapCount++;

  if (tapCount >= TAPS_REQUIRED) {
    tapCount = 0;
    setDebugEnabled(!debugEnabled);
    return true;
  }
  return false;
}
