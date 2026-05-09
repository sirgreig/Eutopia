// src/services/playerService.ts
// Manages local player identity for Eutopia multiplayer
//
// No auth required — identity is a random ID generated on first launch
// and stored in AsyncStorage. Persists across sessions on the same device.
// If the app is uninstalled, a fresh ID is generated (acceptable for v1).

import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYER_ID_KEY = '@eutopia_player_id';
const PLAYER_NAME_KEY = '@eutopia_player_name';

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
