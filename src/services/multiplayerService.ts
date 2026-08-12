// src/services/multiplayerService.ts
// All Firebase Realtime DB operations for Eutopia multiplayer
//
// Room lifecycle:
//   Host creates room → gets 6-char code → shares with friend
//   Friend enters code → joins room → both ready up → game starts
//   Game ends → room is deleted
//
// No auth — players identified by a locally-generated playerId (see playerService.ts)

import { db } from '../config/firebaseConfig';
import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  off,
  push,
  onChildAdded,
} from 'firebase/database';
import { Island } from '../types';

// ============================================================
// TYPES
// ============================================================

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export type RoomPlayer = {
  name: string;
  isHost: boolean;
  isReady: boolean;
  connected: boolean;
};

export type RoomSettings = {
  maxRounds: number;
  roundDuration: number; // seconds
  difficulty: 'easy' | 'normal' | 'hard';
};

export type RoomRound = {
  current: number;
  endTime: number; // Unix ms timestamp; host is authoritative
};

export type Room = {
  status: RoomStatus;
  hostId: string;
  createdAt: number;
  settings: RoomSettings;
  players: Record<string, RoomPlayer>;
  round: RoomRound;
};

export type JoinResult =
  | { success: true }
  | { success: false; error: string };

// ============================================================
// ROOM CODE GENERATION
// ============================================================

// Safe alphabet — no 0/O or 1/I/L to avoid read-aloud confusion
const ROOM_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 6;

function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

async function roomExists(code: string): Promise<boolean> {
  const snapshot = await get(ref(db, `rooms/${code}`));
  return snapshot.exists();
}

async function generateUniqueRoomCode(): Promise<string> {
  let code = generateRoomCode();
  let attempts = 0;
  // Retry on the extraordinarily unlikely event of a collision
  while (await roomExists(code) && attempts < 10) {
    code = generateRoomCode();
    attempts++;
  }
  return code;
}

// ============================================================
// ROOM OPERATIONS
// ============================================================

/**
 * Create a new game room.
 * Returns the generated room code for the host to share.
 */
export async function createRoom(
  playerId: string,
  playerName: string,
  settings: RoomSettings
): Promise<string> {
  const roomCode = await generateUniqueRoomCode();

  await set(ref(db, `rooms/${roomCode}`), {
    status: 'waiting',
    hostId: playerId,
    createdAt: Date.now(),
    settings,
    players: {
      [playerId]: {
        name: playerName,
        isHost: true,
        isReady: false,
        connected: true,
      },
    },
    round: {
      current: 0,
      endTime: 0,
    },
  } satisfies Room);

  return roomCode;
}

/**
 * Join an existing room by code.
 * Validates the room exists, is waiting, and has space for one more player.
 */
export async function joinRoom(
  roomCode: string,
  playerId: string,
  playerName: string
): Promise<JoinResult> {
  try {
    const snapshot = await get(ref(db, `rooms/${roomCode}`));

    if (!snapshot.exists()) {
      return { success: false, error: 'Room not found. Check the code and try again.' };
    }

    const room = snapshot.val() as Room;

    if (room.status !== 'waiting') {
      return { success: false, error: 'That game has already started.' };
    }

    const currentPlayers = Object.keys(room.players || {});
    if (currentPlayers.length >= 2) {
      return { success: false, error: 'Room is full.' };
    }

    // Player might be rejoining after a disconnect
    if (currentPlayers.includes(playerId)) {
      await update(ref(db, `rooms/${roomCode}/players/${playerId}`), {
        connected: true,
      });
      return { success: true };
    }

    await update(ref(db, `rooms/${roomCode}/players`), {
      [playerId]: {
        name: playerName,
        isHost: false,
        isReady: false,
        connected: true,
      } satisfies RoomPlayer,
    });

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to join room. Please try again.' };
  }
}

/**
 * Subscribe to real-time updates for a room.
 * Calls callback immediately with current state, then on every change.
 * Returns an unsubscribe function — call it on component unmount.
 */
export function listenToRoom(
  roomCode: string,
  callback: (room: Room | null) => void
): () => void {
  const roomRef = ref(db, `rooms/${roomCode}`);

  onValue(roomRef, (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as Room) : null);
  });

  return () => off(roomRef);
}

/**
 * Mark a player as ready (or not ready) in the lobby.
 */
export async function setPlayerReady(
  roomCode: string,
  playerId: string,
  isReady: boolean
): Promise<void> {
  await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { isReady });
}

/**
 * Update a player's connected state.
 * Call with false when the app backgrounds or the player disconnects.
 */
export async function setPlayerConnected(
  roomCode: string,
  playerId: string,
  connected: boolean
): Promise<void> {
  await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { connected });
}

/**
 * Update room status (host only).
 */
export async function updateRoomStatus(
  roomCode: string,
  status: RoomStatus
): Promise<void> {
  await update(ref(db, `rooms/${roomCode}`), { status });
}

/**
 * Delete the room entirely (host action, or on game end).
 */
export async function deleteRoom(roomCode: string): Promise<void> {
  await remove(ref(db, `rooms/${roomCode}`));
}

/**
 * Leave a room.
 * If the host leaves, the room is deleted (no host migration for v1).
 * If a guest leaves, only their player entry is removed.
 */
export async function leaveRoom(
  roomCode: string,
  playerId: string,
  isHost: boolean
): Promise<void> {
  if (isHost) {
    await deleteRoom(roomCode);
  } else {
    await remove(ref(db, `rooms/${roomCode}/players/${playerId}`));
  }
}

/**
 * Convenience: get a one-time snapshot of a room without subscribing.
 */
export async function getRoom(roomCode: string): Promise<Room | null> {
  const snapshot = await get(ref(db, `rooms/${roomCode}`));
  return snapshot.exists() ? (snapshot.val() as Room) : null;
}

// ============================================================
// ISLAND SYNC (Phase 8C.1)
// ============================================================
//
// Each player writes their own island to rooms/{code}/islands/{playerId}
// and listens to the opponent's island under the same path.
// Stored as JSON string for atomic writes — refined to per-tile updates in 8C.2.

/**
 * Write the player's island to Firebase.
 * Call once after island generation, then on every meaningful change in 8C.2.
 */
export async function setIsland(
  roomCode: string,
  playerId: string,
  island: Island
): Promise<void> {
  await set(
    ref(db, `rooms/${roomCode}/islands/${playerId}`),
    JSON.stringify(island)
  );
}

/**
 * Subscribe to a specific player's island.
 * In multiplayer this is called with the opponent's playerId to render their state.
 * Returns an unsubscribe function — call it on component unmount.
 */
export function listenToIsland(
  roomCode: string,
  playerId: string,
  callback: (island: Island | null) => void
): () => void {
  const islandRef = ref(db, `rooms/${roomCode}/islands/${playerId}`);

  onValue(islandRef, (snapshot) => {
    const data = snapshot.val();
    if (typeof data === 'string') {
      try {
        callback(JSON.parse(data) as Island);
      } catch {
        callback(null);
      }
    } else {
      callback(null);
    }
  });

  return () => off(islandRef);
}

// ============================================================
// PLAYER STATE SYNC (Phase 8C.2)
// ============================================================
//
// Resources, score, and boat snapshots written periodically (~2 Hz)
// while in multiplayer. Stored as JSON string for atomic writes.

export type BoatSnapshot = {
  id: string;
  type: 'fishing' | 'pt';
  x: number;
  y: number;
};

export type PlayerState = {
  gold: number;
  population: number;
  score: number;
  scoreBreakdown: {
    housing: number;
    food: number;
    welfare: number;
    gdp: number;
  };
  boats: BoatSnapshot[];
  updatedAt: number;
};

/**
 * Write the player's current state to Firebase.
 * Called periodically (every ~500ms) by the App while in multiplayer.
 */
export async function setPlayerState(
  roomCode: string,
  playerId: string,
  state: PlayerState
): Promise<void> {
  await set(
    ref(db, `rooms/${roomCode}/state/${playerId}`),
    JSON.stringify(state)
  );
}

/**
 * Subscribe to a specific player's state (typically the opponent's).
 * Returns an unsubscribe function — call it on component unmount.
 */
export function listenToPlayerState(
  roomCode: string,
  playerId: string,
  callback: (state: PlayerState | null) => void
): () => void {
  const stateRef = ref(db, `rooms/${roomCode}/state/${playerId}`);

  onValue(stateRef, (snapshot) => {
    const data = snapshot.val();
    if (typeof data === 'string') {
      try {
        callback(JSON.parse(data) as PlayerState);
      } catch {
        callback(null);
      }
    } else {
      callback(null);
    }
  });

  return () => off(stateRef);
}

// ============================================================
// ROUND STATE SYNC (Phase 8C.3 — Host-Authoritative Timer)
// ============================================================
//
// Host writes round state to Firebase when a round starts.
// Both clients derive their displayed timer from `endTime`.
// Either client can write `isActive: false` when their local timer expires.

export type RoundState = {
  number: number;       // 0 = pre-game, 1..N = active round number
  isActive: boolean;    // true while round is in progress
  endTime: number;      // epoch ms when round ends (only meaningful when isActive=true)
  duration: number;     // round duration in seconds (echoed for sanity)
  maxRounds: number;    // total rounds in the game
};

/**
 * Write the round state. Typically called by the host on START / NEXT,
 * and by either client when their local timer expires (isActive=false).
 */
export async function setRoundState(
  roomCode: string,
  state: RoundState
): Promise<void> {
  await set(ref(db, `rooms/${roomCode}/round`), state);
}

/**
 * Subscribe to the round state.
 * Returns an unsubscribe function — call it on component unmount.
 */
export function listenToRoundState(
  roomCode: string,
  callback: (state: RoundState | null) => void
): () => void {
  const roundRef = ref(db, `rooms/${roomCode}/round`);

  onValue(roundRef, (snapshot) => {
    const data = snapshot.val();
    if (data && typeof data === 'object') {
      callback(data as RoundState);
    } else {
      callback(null);
    }
  });

  return () => off(roundRef);
}

// ============================================================
// SPAWN EVENT BROADCAST (Phase 8C.4)
// ============================================================
//
// Host rolls the dice for weather and pirate spawns; on success it pushes
// a typed event under rooms/{code}/events/. Both clients listen and
// instantiate the corresponding entity locally with their own random
// positions — frequency stays in lockstep, positions remain independent.

export type SpawnEventType = 'rain' | 'storm' | 'hurricane' | 'pirate';

export type SpawnEvent = {
  type: SpawnEventType;
  spawnedAt: number; // epoch ms; used to filter out replays from previous sessions
};

/**
 * Push a new spawn event. Host calls this when its local dice roll succeeds.
 */
export async function pushSpawnEvent(
  roomCode: string,
  event: SpawnEvent
): Promise<void> {
  const eventsRef = ref(db, `rooms/${roomCode}/events`);
  await push(eventsRef, event);
}

/**
 * Subscribe to spawn events. Fires once per new event added under
 * rooms/{code}/events/ AFTER subscription begins (events written before
 * the subscriber attached are ignored via timestamp filter).
 */
export function listenToSpawnEvents(
  roomCode: string,
  callback: (event: SpawnEvent) => void
): () => void {
  const eventsRef = ref(db, `rooms/${roomCode}/events`);
  const subscribedAt = Date.now();

  onChildAdded(eventsRef, (snapshot) => {
    const event = snapshot.val();
    if (event && typeof event === 'object' && event.spawnedAt >= subscribedAt) {
      callback(event as SpawnEvent);
    }
  });

  return () => off(eventsRef);
}

/**
 * Clear all spawn events for a room. Called by host when starting a new game
 * to wipe stale events from prior sessions.
 */
export async function clearSpawnEvents(roomCode: string): Promise<void> {
  await remove(ref(db, `rooms/${roomCode}/events`));
}
