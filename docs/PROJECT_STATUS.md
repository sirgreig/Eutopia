# Project Status: Eutopia

*Last Updated: March 6, 2026 (Session 13)*

## Current Version
- **App Version:** 1.0.0 (pre-release)
- **SDK:** Expo 55 (on main branch as of this session)
- **Running on:** Android emulator (Pixel 4a) via Expo Go SDK 55; iOS paused (see below)
- **Dev System:** Windows PC
- **Local Path:** C:\Dev\Eutopia

## Active Work: Phase 8A — Firebase + Multiplayer Data Model

### Next Steps (Priority Order)
1. Create dedicated Firebase project for Eutopia multiplayer
2. Configure Firebase Realtime DB
3. Define game room data structure
4. Write firebaseConfig.ts
5. Write service layer (create room, join room, listen for changes)
6. GitHub commit after 8A complete

### iOS Testing Strategy
- Expo Go on iPhone stays on SDK 54 to protect other Tartan Studios apps
- Once ALL Tartan Studios apps migrated to SDK 55, update Expo Go in App Store
- Until then: Android emulator only for SDK 55 testing
- Dev builds (EAS) available as backup for iOS but cost credits

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
None. SDK 55 migration complete. Phase 8A is next.

## Phase 8 - Multiplayer Sub-Phases
- **8A:** Firebase Project + Data Model (dedicated project, not shared with IJBA)
- **8B:** Lobby UI + Room Flow (host/join, room codes, ready-up)
- **8C:** Game State Sync (buildings, boats, resources, round timer authority)
- **8D:** Opponent Minimap + Visibility (read-only, tap to expand, live updates)
- **8E:** Disconnect Handling + Polish (3-min forfeit, reconnection, GitHub tag)
- GitHub commit after each sub-phase
- Firebase costs offset by between-round ad revenue

## Known Issues
- PT boat combat not yet implemented
- Enhanced mode building effects not yet implemented (Dock, Lighthouse, etc.)
- Tutorial spotlight positions are approximate/hardcoded
- Icon first-render delay on Android dev builds (preload silently fails; non-issue in production builds)
