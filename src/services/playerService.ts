// src/services/playerService.ts
// Manages local player identity for Eutopia multiplayer
//
// No auth required — identity is a random ID generated on first launch
// and stored in AsyncStorage. Persists across sessions on the same device.
// If the app is uninstalled, a fresh ID is generated (acceptable for v1).

import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYER_ID_KEY = '@eutopia_player_id';
const PLAYER_NAME_KEY = '@eutopia_player_name';
const ACTIVE_SESSION_KEY = '@eutopia_active_session';

/**
 * Generate a random player ID.
 * Not a UUID, but collision probability is negligible for this use case.
 */
function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/**
 * Get the stored player ID, or create and store a new one on first launch.
 */
export async function getOrCreatePlayerId(): Promise<string> {
  try {
    let id = await AsyncStorage.getItem(PLAYER_ID_KEY);
    if (!id) {
      id = generatePlayerId();
      await AsyncStorage.setItem(PLAYER_ID_KEY, id);
    }
    return id;
  } catch {
    // AsyncStorage failure — return ephemeral ID (non-fatal)
    return generatePlayerId();
  }
}

/**
 * Get the player's stored display name, or null if not yet set.
 */
export async function getPlayerName(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PLAYER_NAME_KEY);
  } catch {
    return null;
  }
}

/**
 * Save the player's display name.
 * Called once on first launch, or if the player updates their name in settings.
 */
export async function setPlayerName(name: string): Promise<void> {
  try {
    await AsyncStorage.setItem(PLAYER_NAME_KEY, name.trim());
  } catch {
    // Non-fatal — name just won't persist
  }
}

/**
 * Get both player ID and name in one call.
 * Use this at app startup to initialise multiplayer identity.
 */
export async function getPlayer(): Promise<{ id: string; name: string | null }> {
  const [id, name] = await Promise.all([
    getOrCreatePlayerId(),
    getPlayerName(),
  ]);
  return { id, name };
}

/**
 * Check whether the player has set a display name yet.
 * Use this to decide whether to show the name prompt on first launch.
 */
export async function hasPlayerName(): Promise<boolean> {
  const name = await getPlayerName();
  return name !== null && name.trim().length > 0;
}

// ============================================================
// ACTIVE MULTIPLAYER SESSION (Phase 8E)
// ============================================================
//
// Written when a multiplayer game starts so a player who force-quits, crashes,
// or loses connection can be dropped straight back into the game on relaunch
// without having to remember the room code.
//
// Cleared on game over and on quit-to-menu.

export type ActiveSession = {
  roomCode: string;
  opponentId: string;
  opponentName: string;
  isHost: boolean;
  startedAt: number;
};

// Sessions older than this are ignored on relaunch — a stale record from a game
// abandoned days ago should not hijack the setup screen.
const SESSION_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function saveActiveSession(session: ActiveSession): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Non-fatal — reconnection just won't be automatic
  }
}

export async function getActiveSession(): Promise<ActiveSession | null> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as ActiveSession;
    if (!session.roomCode || !session.opponentId) return null;
    if (Date.now() - session.startedAt > SESSION_MAX_AGE_MS) {
      await clearActiveSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function clearActiveSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {
    // Non-fatal
  }
}
