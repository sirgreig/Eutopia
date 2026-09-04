# Project Status: Eutopia

*Last Updated: August 31, 2026*

## Current Version
- **App Version:** 1.0.0, build 6 (build number auto-increments per EAS build)
- **SDK:** Expo 55
- **Release status:** In App Store review. Live on TestFlight with internal testers.
- **Dev System:** Windows PC
- **Local Path:** C:\dev\Eutopia

## App Store Connect — Reference
- Listing name: **"Eutopia: Island Builder"** (plain "Eutopia" was unavailable).
  Home-screen name remains "Eutopia" via `expo.name`.
- Bundle ID: `com.tartanstudios.eutopia`
- App Privacy published: Name + User ID, both App Functionality, Linked yes,
  Tracking NO (which keeps the app out of App Tracking Transparency entirely)
- Privacy policy: https://tartan-studios.com/eutopia/privacy.html
- Terms of use: https://tartan-studios.com/eutopia/terms.html
- Support URL: https://tartan-studios.com — support@tartan-studios.com
- Price tier: Free. Content Rights: no third-party content. Age rating: 4+
- Screenshots uploaded for iPhone and iPad (iPad support retained)
- Apple distribution certificate expires **18 December 2026** (shared portfolio-wide)

### Release scope (Option A — free tier only)
Decision: ship free and clean rather than delaying for monetization.
- Ads DISABLED via `ADS_ENABLED = false` master switch in `adService.ts`. The
  `react-native-google-mobile-ads` native module ships in the binary so ads can be
  turned on later via OTA, but the SDK never initialises. `showInterstitial()` is
  wired to fire after every 4th round end (solo only) once enabled.
- `react-native-iap` NOT installed. Adding it later costs one build, no review
  penalty. IAP also requires the Paid Applications Agreement (banking + tax
  details, several days to process) — **not yet started**.
- Enhanced Mode (the Premium tier) is Phase 9 and does not exist yet.

### TestFlight
- Internal testers: Greig, Aidan, Bryce, Ross
- Build 2 crashed on launch (see Key Learnings). Build 3+ stable.
- Builds expire after 90 days — OTA updates do NOT extend expiry

## Active Work: App Store Review — Build 6 Resubmitted

**Timeline:**
- Aug 19, 2026 — build 5 submitted for review
- Stalled ~10 days in "Waiting for Review". Cause: the Apple Developer Program
  License Agreement had been updated and required Account Holder acceptance. This
  blocks submissions at the ACCOUNT level and is only surfaced by a banner on the
  Apps list — the submission simply never enters the queue. Accepted, then filed a
  status inquiry with Apple Developer Support.
- Aug 31, 2026 — build 5 **REJECTED**, Guideline 2.5.4 Performance / Software
  Requirements. Reviewed on iPad Air 11-inch (M4) and iPhone 17 Pro Max.
- Aug 31, 2026 — build 6 submitted with the fix.

### The rejection, and the fix
Apple: the app declares `audio` in `UIBackgroundModes` but plays nothing while
backgrounded.

They were right. Eutopia deliberately PAUSES all audio on background
(`AppState` listener in App.tsx). The entry was never added intentionally — the
**expo-audio config plugin defaults `enableBackgroundPlayback` to `true`**, and
pushes `'audio'` into `UIBackgroundModes` on every build.

Fix, in `app.json`, converting the bare `"expo-audio"` plugin entry to the array form:
```json
["expo-audio", {
  "enableBackgroundPlayback": false,
  "enableBackgroundRecording": false,
  "recordAudioAndroid": false
}]
```
This also stops the plugin re-adding `RECORD_AUDIO`, `FOREGROUND_SERVICE` and
`FOREGROUND_SERVICE_MEDIA_PLAYBACK` on Android — the same permissions that were
manually stripped from `app.json` earlier and kept reappearing. The plugin was the
source all along.

### Build 6 contents
Build 6 carries everything built since build 5, so the reviewed binary matches what
ships: title screen, sabotage, water-tap boat building, name filter, Settings name
control, What's New panel, measured tutorial targets, toast fix, balance changes,
and the new native splash screen.

### Next Steps
1. Await review outcome
2. On approval: publish the held OTA backlog (see below)
3. Start the Paid Applications Agreement — long lead time, gates ALL in-app purchases
4. Phase 9: Enhanced Mode + entitlement model

### OTA updates being held
Nothing has been published to the `production` channel since submission. This is
deliberate: `expo-updates` would serve the latest bundle to a reviewer's device,
meaning they could run code Apple never received a binary for. Publish only after
approval.

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

## Key Learnings — iOS / Release

### CRITICAL: config plugin defaults can get you rejected
**expo-audio's plugin defaults `enableBackgroundPlayback` to `true`**, which injects
`'audio'` into `UIBackgroundModes`. Any app that declares that but doesn't actually
play audio while backgrounded is an automatic **Guideline 2.5.4 rejection**. Eutopia
deliberately pauses audio on background, so it was declaring a capability it not only
lacked but actively refused to use.

It also silently re-adds `RECORD_AUDIO`, `FOREGROUND_SERVICE` and
`FOREGROUND_SERVICE_MEDIA_PLAYBACK` on Android — which is why those permissions kept
reappearing in `app.json` after being manually removed.

**Applies to every Tartan Studios app using expo-audio.** Always pass the options
explicitly rather than trusting defaults:
```json
["expo-audio", {
  "enableBackgroundPlayback": false,
  "enableBackgroundRecording": false,
  "recordAudioAndroid": false
}]
```
More generally: **audit the generated Info.plist and AndroidManifest, not just
app.json.** Plugins add things you never asked for, and Apple reviews the output.

### An unaccepted License Agreement blocks submissions silently
The updated Apple Developer Program License Agreement requires Account Holder
acceptance before any app can be submitted or updated. Until accepted, a submission
sits in "Waiting for Review" and **never enters the queue** — there is no error, only
a banner on the Apps list. This cost roughly ten days. Check the Apps list banner
first whenever a submission seems stalled. It blocks the whole portfolio, not one app.

### CRITICAL: never use React Native `<Modal>` in this app
`<Modal>` presents a separate UIViewController on iOS. With the app locked to
landscape (`orientation: "landscape"` + `requireFullScreen: true` in app.json),
UIKit finds no valid orientation for the presented controller, throws from
`__supportedInterfaceOrientations`, and aborts the process with SIGABRT.

**This crashed TestFlight build 2 on launch.** `NamePromptModal` used `<Modal>`, and
a fresh install has no stored player name, so the prompt rendered immediately and
killed the app before anything else ran.

Harmless on Android and web — this failure mode is iOS-only and cannot be found by
emulator or browser testing. It also predated the multiplayer work: any iOS build
since Phase 8B would have died the same way.

**Rule:** all overlays use absolutely-positioned Views with a high `zIndex`.
See `NamePromptModal`, `WhatsNewPanel`, `AIIslandMinimap`, `MultiplayerIslandMinimap`,
`SettingsScreen`. This applies to every Tartan Studios app that locks orientation.

### react-native-reanimated was unused and broke the iOS build
Pod install failed: Reanimated 4.2.1 requires react-native-worklets 0.7.x, but npm
resolved 0.8.3. Eutopia never used Reanimated — the built-in `Animated` API is used
throughout — so it was removed entirely along with the Babel plugin. Note
`babel-preset-expo` adds the Reanimated plugin automatically when the package is
present, so the explicit plugin entry was redundant anyway.

### expo-updates had to be installed before OTA could work
`app.json` had an `updates` block configured, but the package itself was missing.
EAS installs it and then requires the build command to be re-run. This is a
bootstrap dependency: it cannot be added over the air, because it IS the mechanism
that delivers over-the-air updates.

### OTA updates apply on the NEXT launch, not the current one
With `checkAutomatically: ON_LOAD` and `fallbackToCacheTimeout: 0`, a new bundle
downloads in the background and applies on the following launch. The app must be
fully quit and reopened TWICE after `eas update` to run new code. This wasted
significant debugging time on the What's New panel — the panel was correct, the
bundle simply hadn't been applied.

**Mitigation:** Settings now shows a build footer with app version, running OTA
update id, its publish time, and the release-notes id (`src/services/updateInfo.ts`).
Check it before debugging "my change didn't work".

### OTA vs new binary
- **Ships OTA:** all JS, assets, styling. Phase 9 Enhanced Mode, balance, UI, and
  all multiplayer changes (Firebase JS SDK is pure JS).
- **Needs a new binary:** native modules added/removed, SDK bumps, `app.json`
  native config, app icon, splash screen.
- `runtimeVersion` policy is `appVersion`, so OTA updates only reach builds with a
  matching version string. Bumping `1.0.0` → `1.1.0` orphans existing testers until
  they install a new binary. Build number increments do NOT affect this.

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

### August 31, 2026 - Gameplay, UX, and App Store Rejection Fix
**Added:**
- src/services/rebels.ts (shared rebel placement — used by endRound, sabotage, AI)
- src/services/fortProtection.ts (single source of truth for fort rules)
- src/components/game/SinkingBoat.tsx (3-stage sink animation, no new artwork)
- src/services/adService.web.ts (web stub — see Key Learnings)

**Sabotage (Phase 9, first piece — from the 1981 original):**
- Header button: 30 gold, once per round, sends rebels to the opponent's island
- Multiplayer: targeted Firebase channel at `rooms/{code}/actions/{targetPlayerId}`.
  The first TRUE cross-player action — weather is broadcast and resolved locally,
  sabotage directly modifies another player's board.
- Solo works both directions: the player can hit the AI, and the AI retaliates
  (gated by difficulty, once per round, at a random moment mid-round)

**Boat building reworked — tap water, not land:**
- Players who developed every land tile could no longer build boats AT ALL, losing
  access to fishing income and pirate defence permanently. An unwinnable trap that
  punished exactly the behaviour scoring rewards.
- Land tap → buildings menu. Water tap → boats menu, boat spawns where tapped.
- Selected boat ALWAYS treats a water tap as its destination; deselect by tapping
  the boat itself. Added `createFreeRoamBoatAt()` to spawn at a water position.

**Balance:**
- Hurricanes roll a per-storm budget at spawn (1-3 buildings, 1-2 boats) instead of
  grinding to a fixed cap. They always destroyed exactly 3 because `buildingDestroy`
  is 0.60 — the cap was deterministic, not the damage.
- Storms spawn ~25% less often; capped at 1 building and 1 boat
- Forts reworked: buildings get 50% protection (halved destroy chance, NOT immunity),
  boats get 100% protection including from hurricanes, rebels ~half as likely to
  target a protected tile. Hurricanes previously ignored forts entirely.

**UX:**
- Toasts no longer intercept taps (`pointerEvents="none"`) and moved over the header.
  They were swallowing presses aimed at boats underneath, worst during active rounds.
- How to Play rewritten: forts, sabotage, storms vs hurricanes, multiplayer, and the
  new boat-building model. Three sections were factually wrong, not just incomplete.
- Pirates now play the sinking animation too

**App Store:**
- Build 5 rejected (2.5.4) and fixed — see Active Work
- Native splash screen replaced with the title artwork (`resizeMode: cover`)

### August 19, 2026 - Release Track + UX
**Added:**
- src/components/title/TitleScreen.tsx (animated title with background artwork,
  drifting cloud parallax, tap-to-skip; falls back to an SVG gradient if artwork missing)
- src/services/nameFilter.ts (display name validation — profanity, slurs, impersonation)
- src/services/tutorialTargets.ts (runtime spotlight measurement registry)
- src/constants/whatsNew.ts + src/services/whatsNewService.ts +
  src/components/common/WhatsNewPanel.tsx (What's New panel)
- src/services/updateInfo.ts (running OTA identity, adapted from the Kemby app)
- assets/images/title-bg.jpg, title-clouds.png

**Modified:**
- App.tsx (title screen, What's New, measured tutorial targets, preload artwork)
- src/components/multiplayer/NamePromptModal.tsx (Modal → overlay; name validation)
- src/components/settings/SettingsScreen.tsx (player name control, build footer)
- src/components/game/AnimatedBuildMenu.tsx (measures its Crops item for the tutorial)
- src/services/adService.ts (ADS_ENABLED master switch, off for 1.0)
- app.json (removed RECORD_AUDIO + duplicate permissions; deduped SKAdNetwork 100→50)
- eas.json (autoIncrement on the production profile)
- package.json / babel.config.js (removed react-native-reanimated; added expo-updates)

**Website (C:\dev\tartan-studios-website):**
- public/eutopia/privacy.html and terms.html — Eutopia-specific, site-styled
- public/privacy.html — corrected the Eutopia row (it wrongly claimed email collection)
- Firebase Hosting: `firebase deploy --only hosting`

**Fixed:**
- iOS launch crash — `<Modal>` under landscape lock (TestFlight build 2)
- iOS build failure — reanimated/worklets version mismatch
- Tutorial spotlights pointing at empty space (now measured, not calculated)
- What's New never appearing for existing players (first-install detection)
- MP end-game summary comparing against the disabled AI hook

**Balance:**
- Fishing boat 28 → 15 gold; PT boat 40 → 25 gold
- Storm damage capped at 1 building; hurricane at 3 (was an uncapped storm vs a
  hardcoded 2 for hurricanes, which made them feel identical)
- Farm idle sway animation removed

**Milestone:** first successful iOS build; submitted to the App Store for review.

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
Awaiting App Store review (submitted August 19, 2026).

**Paid Applications Agreement: ACTIVE.** Verified in App Store Connect → Business
(Sept 2026). Paid Apps Agreement, Wells Fargo USD bank account, W-9, and Digital
Services Act compliance are all Active. IAP products can be created whenever wanted
— the only remaining blocker for selling anything is the `react-native-iap` module,
which is native and needs a new binary.

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
