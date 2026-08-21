// src/services/updateInfo.ts
//
// Reports which JS bundle is actually running.
//
// Why this exists: `eas update` with checkAutomatically ON_LOAD and
// fallbackToCacheTimeout 0 downloads a new bundle in the BACKGROUND and applies it
// on the NEXT launch. So the first time you open the app after publishing, you are
// still running the old code. Without a visible signal there is no way to tell
// "the update hasn't arrived" from "the update arrived and my change is broken" —
// which wastes a lot of debugging time.
//
// Adapted from the same approach used in the Kemby app.

import * as Updates from 'expo-updates';

export interface UpdateInfo {
  /** Short id of the running OTA update, or null when running the embedded build. */
  updateId: string | null;
  /** When that update was published. */
  createdAt: Date | null;
  /** EAS Update channel (e.g. "production"). */
  channel: string | null;
  /** True when running the binary's built-in bundle (no OTA applied yet). */
  embedded: boolean;
}

/**
 * Read the running OTA identity. Defensive: returns an embedded/null shape when
 * the module isn't active (Expo Go, dev builds). Never throws.
 */
export function getUpdateInfo(): UpdateInfo {
  try {
    const U = Updates as any;
    return {
      updateId: typeof U.updateId === 'string' ? U.updateId : null,
      createdAt: U.createdAt instanceof Date ? U.createdAt : null,
      channel: typeof U.channel === 'string' ? U.channel : null,
      embedded: !!U.isEmbeddedLaunch,
    };
  } catch {
    return { updateId: null, createdAt: null, channel: null, embedded: true };
  }
}

/** A compact one-line descriptor suitable for a Settings footer. */
export function updateLine(info: UpdateInfo): string {
  if (info.embedded || !info.updateId) return 'Build: embedded (no OTA applied)';
  const shortId = info.updateId.slice(0, 8);
  const when = info.createdAt
    ? info.createdAt.toISOString().slice(0, 16).replace('T', ' ') + ' UTC'
    : 'unknown date';
  return `Update ${shortId} · ${when}`;
}
