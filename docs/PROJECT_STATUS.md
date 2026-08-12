# Project Status: Eutopia

*Last Updated: August 11, 2026*

## Current Version
- **App Version:** 1.0.0 (pre-release)
- **SDK:** Expo 55 (on main branch as of this session)
- **Running on:** Android emulator (Pixel 4a) via Expo Go SDK 55; iOS paused (see below)
- **Dev System:** Windows PC
- **Local Path:** C:\Dev\Eutopia

## Active Work: Phase 8E — Disconnect Handling + Polish

### Next Steps (Priority Order)
1. Heartbeat timestamps (`lastSeen`) piggybacked on the existing 500ms state write
2. Stale-connection detection + "opponent connection lost" banner
3. Round pause while opponent is missing
4. 3-minute forfeit timeout → award win
5. Host migration if the host is the one who drops
6. Reconnection: rejoining an in-progress room restores the game
7. GitHub commit + tag after 8E complete

### Phase 8 Progress
- **8A — Firebase + Data Model:** COMPLETE
- **8B — Lobby UI + Room Flow:** COMPLETE
- **8C — Game State Sync:** COMPLETE (8C.1 island, 8C.2 player state, 8C.3 round timer, 8C.4 spawn events)
- **8D — Opponent Minimap:** COMPLETE
- **8E — Disconnect Handling:** IN PROGRESS

### iOS Testing Strategy
- Expo Go on iPhone stays on SDK 54 to protect other Tartan Studios apps
- Once ALL Tartan Studios apps migrated to SDK 55, update Expo Go in App Store
- Until then: Android emulator only for SDK 55 testing
- Dev builds (EAS) available as backup for iOS but cost credits
- Web (`npx expo start` then `w`) is used ONLY as a convenient second client for
  multiplayer testing. It is not a release target. Web-only defects are fixed only
  when they block testing; cosmetic web quirks are ignored.
- Two-client setup: Android emulator + browser tab, or regular Chrome tab +
  Incognito tab (separate localStorage → separate playerId)

## Multiplayer Architecture (Phases 8A–8D)

### Firebase Data Shape
```
rooms/{roomCode}/
  players/{playerId}     — name, isReady
  settings               — maxRounds, roundDuration, difficulty
  status                 — 'waiting' | 'playing'
  islands/{playerId}     — JSON-stringified Island
  state/{playerId}       — JSON-stringified PlayerState
  round                  — { number, isActive, endTime, duration, maxRounds }
  events/{pushId}        — { type, spawnedAt }
```

### Authority Model
- **Host-authoritative round timer.** Only the host sees START/NEXT; the guest sees
  a "Waiting for host..." pill. Host writes round state; both clients derive
  `timeRemaining` from `endTime - Date.now()`, recalculated every 250ms.
- **Independent scoring.** Each client runs `endRound()` locally on its own state.
  Either client may write `isActive: false` when its timer expires (idempotent).
- **Host-broadcast spawn events.** Host rolls dice for rain/storm/hurricane/pirate.
  On success it pushes an event AND spawns locally; guests spawn only from events.
  Result: identical frequency, independent positions.
- **No PvP combat.** Each player has their own island in their own coordinate space.
  Boats cannot interact across clients. Deferred — see Known Issues.

### Fog of War (8D)
- Opponent minimap shows score, gold, population, boat count and boat positions
- Building TYPES are deliberately hidden — occupied tiles render as a generic marker
- Rationale: seeing what an opponent builds gives away too much strategy

## Key Multiplayer Learnings
- Stale Firebase round data from a reused room causes premature NEXT buttons and
  unblocked building — host must write a clean round state before flipping status
  to 'playing', and clear the events node
- `onChildAdded` replays the entire existing node on subscribe; filter by a
  `subscribedAt` timestamp to ignore historical events
- react-native-web does not populate `nativeEvent.locationX/locationY`; it exposes
  `offsetX/offsetY`. Island.tsx falls back accordingly (iOS-safe additive change)
- Both browser tabs sharing localStorage produces the same playerId — use Incognito
  for the second client
- Tutorial must auto-skip in multiplayer (timed competitive play)

## SDK 55 Migration: COMPLETE

All items resolved and merged to main. Tagged v0.7.0.

### What Was Done
- expo-av → expo-audio migration (soundManager.ts rewritten)
- expo-audio pinned to 55.0.0 (55.0.8 had native arity mismatch with Expo Go)
- setAudioModeAsync property names corrected for expo-audio API
- initializeSounds() split into separate try/catch blocks (mode error no longer blocks preload)
- Island.tsx: removed overflow:hidden + borderRadius from landTile style (Android hardware layer conflict with useNativeDriver)
- App.tsx: audio init decoupled from image preload; image preload is now best-effort/silent-fail
- Full Android emulator test pass completed (all audio, visuals, gameplay, tutorial)
- sdk55-upgrade branch merged to main
- Tagged v0.7.0
- EAS Build profiles confirmed (development / development-device / preview / production)

### Key SDK 55 Learnings
- expo-audio@55.0.0 is the correct version for Expo Go SDK 55; later patches (55.0.8) have a native JSI arity mismatch
- AudioPlayer constructor takes (source, updateInterval, keepAudioSessionActive, preferredForwardBufferDuration) — 4 args
- createAudioPlayer() loads asynchronously; play() called immediately is a no-op for large files — use setTimeout delay
- addListener on AudioPlayer triggers a native JSI call that fails in Expo Go — avoid entirely
- setAudioModeAsync uses playsInSilentMode / allowsRecording / shouldPlayInBackground (not the expo-av names)
- overflow:hidden on a View parent of an Animated.View with useNativeDriver:true causes the parent background to disappear on Android
- expo-asset downloadAsync fails on Android dev builds (Metro HTTP delivery) — must be wrapped in try/catch

## Completed Sessions

### August 11, 2026 - Phase 8C.4 + Phase 8D
**Added:**
- src/components/game/MultiplayerIslandMinimap.tsx (fog-of-war opponent minimap)

**Modified:**
- src/services/multiplayerService.ts (pushSpawnEvent / listenToSpawnEvents / clearSpawnEvents)
- src/components/multiplayer/MultiplayerLobby.tsx (clearSpawnEvents on start; opponentName in onStartGame)
- App.tsx (spawn-locally callbacks extracted; four spawn intervals gated for MP guest;
  spawn event listener; minimap swapped solo/MP; 8C.2 debug readout removed)
- src/components/game/AnimatedBuilding.tsx (farm idle sway removed — crops no longer rock)

**Verified:**
- Weather events fire simultaneously on both clients with independent paths
- Opponent minimap shows name, stats, generic build markers, boat positions
- Solo play unchanged (AI minimap with difficulty badge and last-action ticker)

### Session 13 (March 6, 2026) - SDK 55 Migration Complete
**Modified:**
- src/services/soundManager.ts (expo-av → expo-audio full rewrite)
- src/components/game/Island.tsx (removed overflow:hidden from landTile)
- App.tsx (audio/image preload decoupled; image preload best-effort)

**Commands run:**
- npm install expo-audio@55.0.0
- npm uninstall expo-av
- git checkout main && git merge sdk55-upgrade
- git tag v0.7.0 && git push origin v0.7.0

**Docs Updated:**
- PROJECT_STATUS.md (this file)
- PORTFOLIO_OVERVIEW.md
- project-tracker.md

### Session 12 (March 6, 2026) - Phase 6 Completion + SDK 55 Migration Start
**Modified:**
- src/constants/game.ts (crop cost 3 → 5)
- src/components/game/Icons.tsx (exported ICON_IMAGES for preloading)
- App.tsx (added expo-asset import, image preloading in init useEffect)
- src/components/game/AnimatedBuildMenu.tsx (icon size 0.55→0.72 multiplier, combined name+cost labelRow)
- src/components/game/ScoreDisplay.tsx (score change pulse + floating +/- indicator)
- src/components/game/AnimatedBuilding.tsx (SmokeOverlay for factory/house, FlagOverlay for fort)

**Docs Created:**
- MIGRATION_PLAN.md

**Safe to Delete:**
- src/components/ui/BuildMenu.tsx (legacy, replaced by AnimatedBuildMenu)

### Session 11 (March 3, 2026) - Phase 6 Building Animations + UI Polish
**Added:**
- src/components/game/AnimatedBuilding.tsx

**Modified:**
- src/components/game/Island.tsx
- src/components/game/AnimatedBuildMenu.tsx
- src/components/setup/SetupScreen.tsx

### Session 10 (Mar 1, 2026) - PNG Art Icons
- Replaced all SVG building icons with DALL-E generated PNG art
- Icons.tsx rewritten from SVG to Image components
- All 14 assets: 6 original + 6 enhanced + 2 boats

### Sessions 6-9 (Feb 2026) - Weather, Sound, Polish
- Weather system complete (rain, storms, hurricanes)
- Fish schools, pirate ships, boat waypoint pathfinding
- Complete sound system with music crossfading and tension variants
- Victory screen redesign, build menu enlargement
- Setup screen, tutorial modal, dual toast notification system

## Blockers
None. Phases 8A–8D complete and tested. Phase 8E is next.

## Phase 8 - Multiplayer Sub-Phases
- **8A:** Firebase Project + Data Model — COMPLETE
- **8B:** Lobby UI + Room Flow — COMPLETE
- **8C:** Game State Sync — COMPLETE
- **8D:** Opponent Minimap + Visibility — COMPLETE
- **8E:** Disconnect Handling + Polish — IN PROGRESS
- GitHub commit after each sub-phase
- Firebase costs offset by between-round ad revenue

## Known Issues
- **PvP combat not implemented and not currently possible.** Each player generates
  their own island in their own coordinate space; there is no shared water. Adding
  boat-vs-boat combat (as in the 1981 original) would require a single shared grid
  containing both islands, ~10Hz boat position sync with interpolation, and
  host-authoritative collision adjudication. Deferred to Phase 9/10 pending a
  decision.
- Enhanced mode building effects not yet implemented (Dock, Lighthouse, etc.)
- Tutorial spotlight positions are approximate/hardcoded
- Icon first-render delay on Android dev builds (preload silently fails; non-issue in production builds)
- Music occasionally fails to start on a cold Android emulator boot — `play()` is a
  silent no-op if called before the native player finishes loading. The 150ms
  setTimeout in startTrack/crossfadeToTrack/startOceanWaves is a guess, not a
  guarantee. Backgrounding and foregrounding the app fixes it. Durable fix would be
  to subscribe to a readiness event instead of guessing a delay.
