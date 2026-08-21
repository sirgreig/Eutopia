// src/services/whatsNewService.ts
//
// Tracks which release notes a player has already seen.
//
// Behaviour:
//  - Brand new install: nothing is shown. Someone opening the game for the first
//    time does not need to be told what changed since a version they never played.
//    The latest id is recorded silently so the panel appears on the NEXT update.
//  - Returning player after an update: every release note they haven't seen is
//    shown, newest first, so skipping updates doesn't skip announcements.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RELEASE_NOTES, LATEST_RELEASE_ID, ReleaseNote } from '../constants/whatsNew';

const SEEN_KEY = '@eutopia_whats_new_seen';

// Written by playerService on first ever launch. Used here to tell a genuine new
// install apart from a returning player who simply predates this feature.
const PLAYER_ID_KEY = '@eutopia_player_id';

// Sentinel written by resetReleaseNotesSeen(). Deliberately not a real release id,
// so it falls through to the "unknown id" branch and shows the latest note.
const RESET_SENTINEL = '__reset__';

/**
 * Which release notes should be shown right now.
 * Returns an empty array when there is nothing new (or on a first install).
 *
 * ORDERING NOTE: call this BEFORE playerService.getPlayer(), which creates a
 * player id if none exists. Once that id is written, a first launch becomes
 * indistinguishable from a returning player.
 */
export async function getUnseenReleaseNotes(): Promise<ReleaseNote[]> {
  try {
    const seenId = await AsyncStorage.getItem(SEEN_KEY);

    if (seenId === null) {
      const existingPlayerId = await AsyncStorage.getItem(PLAYER_ID_KEY);

      // Genuine first install — nothing to catch up on. Record the current
      // release so the panel appears on their next update.
      if (existingPlayerId === null) {
        await AsyncStorage.setItem(SEEN_KEY, LATEST_RELEASE_ID);
        return [];
      }

      // Returning player from before this feature existed — show the latest note.
      return RELEASE_NOTES.slice(0, 1);
    }

    if (seenId === LATEST_RELEASE_ID) return [];

    // Everything newer than the last seen id. Notes are ordered newest first, so
    // the unseen ones are those before the seen entry.
    const seenIndex = RELEASE_NOTES.findIndex((n) => n.id === seenId);

    // Unknown id (pruned notes, or the reset sentinel) — show only the newest to
    // avoid a wall of text.
    if (seenIndex === -1) return RELEASE_NOTES.slice(0, 1);

    return RELEASE_NOTES.slice(0, seenIndex);
  } catch {
    // Storage unavailable — better to show nothing than to nag on every launch.
    return [];
  }
}

/** Mark the current release as seen. Call when the player dismisses the panel. */
export async function markReleaseNotesSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(SEEN_KEY, LATEST_RELEASE_ID);
  } catch {
    // Non-fatal — worst case the panel appears once more next launch.
  }
}

/**
 * Testing helper: forget what has been seen so the panel shows again.
 *
 * Writes a sentinel rather than removing the key — removing it would look like a
 * first install on a device that already has a player id, and the panel would be
 * suppressed instead of shown.
 */
export async function resetReleaseNotesSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(SEEN_KEY, RESET_SENTINEL);
  } catch {
    // Non-fatal
  }
}
