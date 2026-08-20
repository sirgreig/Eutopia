# Project Status: Eutopia

*Last Updated: August 11, 2026*

## Current Version
- **App Version:** 1.0.0 (pre-release)
- **SDK:** Expo 55 (on main branch as of this session)
- **Running on:** Android emulator (Pixel 4a) via Expo Go SDK 55; iOS paused (see below)
- **Dev System:** Windows PC
- **Local Path:** C:\Dev\Eutopiay

## Active Work: EAS Preview Build — iOS Verification

Phase 8 (multiplayer) is COMPLETE and tagged v0.8.0.

### Why this is the next step
Everything since the SDK 55 migration — the expo-audio rewrite and the whole of
Phase 8 multiplayer — has only ever run on Android emulator and web. iOS Expo Go
is still pinned to SDK 54 while the other Tartan Studios apps migrate, so the
current code has never executed on the primary release platform.

An EAS **preview** build (internal distribution) installs like a normal app and
does not turn the device into a registered developer phone.

### Next Steps (Priority Order)
1. EAS preview build for iOS; install and verify on real iPhone
2. Verify audio behaviour specifically (playsInSilentMode is iOS-specific)
3. Verify multiplayer end-to-end iPhone ↔ Android
4. Create AdMob interstitial ad unit; wire ads into round flow
5. Add react-native-iap (module must be in the binary before OTA can enable IAP)
6. App icon + splash screen (native — cannot be added OTA)
7. Production build → TestFlight → App Store
8. Phase 9 Enhanced Mode ships OTA via EAS Update

### Phase 8 Progress — COMPLETE
- **8A — Firebase + Data Model:** COMPLETE
- **8B — Lobby UI + Room Flow:** COMPLETE
- **8C — Game State Sync:** COMPLETE (8C.1 island, 8C.2 player state, 8C.3 round timer, 8C.4 spawn events)
- **8D — Opponent Minimap:** COMPLETE
- **8E — Disconnect Handling:** COMPLETE

### OTA Update Strategy
EAS Update ships JS, assets and styling over the air. Native changes require a new
binary and App Store submission: adding/removing native modules, SDK upgrades,
`app.json` native config, icon/splash.

- **Ships OTA:** Phase 9 Enhanced Mode (fog of war, scouting, 6 building effects),
  balance tuning, UI polish, bug fixes, multiplayer changes (Firebase JS SDK is pure JS)
- **Requires a new binary:** AdMob module, IAP module, icon, splash, any SDK bump

Implication: AdMob and IAP modules should be present in the FIRST production build
even if the features are disabled, otherwise enabling them later costs a resubmission.

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

### Disconnect Handling (8E)
- **Heartbeat:** `PlayerState.updatedAt` doubles as the heartbeat — rewritten every
  500ms by the existing state interval, so no extra Firebase traffic. Staleness is
  measured against a local 1s ticker, not snapshot arrivals (which stop on disconnect).
- **Thresholds:** 10s → disconnect banner; 180s → forfeit.
- **Round pause:** host stashes remaining seconds, writes `isActive: false`, and on
  recovery writes a fresh `endTime` of `now + remaining`. Weather and pirates pause
  for free since they already gate on `!isRoundActive`.
- **Host migration:** if the host goes stale the guest calls `promoteToHost`, which
  only succeeds if `hostId` still matches the departed player — a recovering host
  cannot produce two clients writing round state.
- **Auto-rejoin:** active session persisted to AsyncStorage (`@eutopia_active_session`).
  On launch, if the record exists and the room is still `playing` with the player's id
  present, setup and lobby are skipped and the island is restored from Firebase.
  Records expire after 6 hours. Cleared on game over and quit-to-menu.
- **Room code** is shown in the expanded opponent minimap as a manual fallback.
- **Known limitation:** boats return at last-synced positions with no destination;
  in-flight weather does not survive a rejoin. All scored state is fully restored.

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
- **Spawn types without a singleton guard must not double-spawn on the host.** Rain,
  storms and hurricanes bail early if one is already active, which dedupes the host's
  push-and-spawn-locally path. Pirates only check `maxActive`, so the host was spawning
  two per dice roll — surfacing as a duplicate React key. Host now pushes the event and
  waits for its own broadcast, same as the guest.
- The multiplayer end-game summary was comparing the player against the disabled AI
  hook's score and labelling the opponent "AI". It now takes the opponent's real score
  and name.

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

## Backlog — Agreed, Not Yet Scheduled

### Sabotage: buy a rebel and inflict it on your opponent
From the 1981 original. `REBEL_SPAWN_COST = 30` already exists in constants but is
never used. Player spends gold to spawn a rebel on the opponent's island.

Architecturally this is the **first true cross-player action** — weather events are
broadcast but each client resolves them against its own island, whereas sabotage is
one player directly modifying another player's board. Needs:
- A targeted action channel in Firebase (e.g. `rooms/{code}/actions/{targetPlayerId}`)
- Receiving client applies the rebel to its own island, then syncs back normally
- Fort protection rules must apply (rebels cannot spawn on or adjacent to forts —
  matches the existing `endRound` rebel logic)
- UI affordance to trigger it, and a notification for the victim
- Solo equivalent: the AI should be able to sabotage the player, and vice versa

Much cheaper than boat combat (no shared grid, no high-rate sync) — a single discrete
event. Scheduled after Phase 9 and the release track are settled.

### Enhanced Mode in multiplayer — entitlement model
Enhanced buildings confer real advantages, so asymmetric play is unfair; both players
in a room must be on the same mode.

**Agreed approach: the host's entitlement covers the room.** If the host owns Premium,
both players get Enhanced Mode for that match. The guest experiences the full feature
set and hits the upgrade prompt later when they want to host their own enhanced game.

Rejected alternative: prompting the guest to upgrade mid-lobby and falling back to
Original Mode on decline. That places a paywall at the exact moment someone has just
accepted a friend's invitation — the point they are most likely to abandon rather than
pay.

Blocked on: Phase 9 (Enhanced Mode itself), `react-native-iap`, and an entitlement
flag in the room record so the lobby can check it.

### PvP boat combat — DECLINED
Considered and explicitly declined. Would require a single shared grid containing both
islands, ~10Hz boat position sync with interpolation, and host-authoritative collision
adjudication. Not proceeding.

## Completed Sessions

### August 11, 2026 (later) - Phase 8E — Disconnect Handling
**Added:**
- src/components/game/ConnectionBanner.tsx

**Modified:**
- src/services/multiplayerService.ts (promoteToHost, rejoinRoom)
- src/services/playerService.ts (saveActiveSession / getActiveSession / clearActiveSession)
- src/components/game/EndGameSummary.tsx (opponentName + wonByForfeit props; MP no longer labelled "AI")
- src/components/game/MultiplayerIslandMinimap.tsx (stale state dimming, room code in expanded view)
- App.tsx (heartbeat staleness, pause/resume, forfeit, host migration, auto-rejoin,
  duplicate pirate spawn fix)

**Fixed:**
- Duplicate pirate spawn on the host in multiplayer (duplicate React key warning)
- MP end-game summary compared against the disabled AI hook instead of the real opponent

**Tagged:** v0.8.0 — Phase 8 complete

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
None. Phase 8 complete and tagged v0.8.0.

**Next gate:** iOS has never run SDK 55 code or any multiplayer. An EAS preview build
is required before any further phase work is considered verified.

## Phase 8 - Multiplayer Sub-Phases — ALL COMPLETE
- **8A:** Firebase Project + Data Model — COMPLETE
- **8B:** Lobby UI + Room Flow — COMPLETE
- **8C:** Game State Sync — COMPLETE
- **8D:** Opponent Minimap + Visibility — COMPLETE
- **8E:** Disconnect Handling + Polish — COMPLETE
- Tagged v0.8.0
- Firebase costs offset by between-round ad revenue (ads not yet implemented)

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
- **Unconfirmed, watch for recurrence:** during a host disconnect the guest briefly
  saw a message identifying the wrong player as host before host migration settled.
  Seen once, not reproduced. Suspected render frame where the promotion flag and
  `mpRoundState` were momentarily out of step. Do not change code until seen again.

## Balance Changes (August 2026)
- Fishing boat: 28 → 15 gold
- PT boat: 40 → 25 gold
- Farm idle sway animation removed (crops no longer rock)
- **Storm damage capped at 1 building per storm** (`BALANCE.stormMaxBuildingsDestroyed`).
  Previously uncapped — a storm crossing six tiles could flatten six buildings, which
  made storms feel identical to hurricanes.
- **Hurricane damage capped at 3 buildings** (`BALANCE.hurricaneMaxBuildingsDestroyed`,
  raised from a hardcoded 2). Hurricanes also ignore fort protection and can destroy
  forts themselves.
- Both caps live in constants and are read by the shared damage code, so solo and
  multiplayer are guaranteed identical.
