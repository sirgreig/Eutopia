# Project Status: Eutopia

*Last Updated: March 6, 2026 (Session 12)*

## Current Version
- **App Version:** 1.0.0 (pre-release)
- **SDK:** Expo 55 (upgrade in progress on sdk55-upgrade branch)
- **Previous SDK:** Expo 54 (still on main branch; iOS Expo Go testing uses this)
- **Running on:** Android emulator (Pixel 4a) via Expo Go SDK 55; iOS paused
- **Dev System:** Windows PC (migrated from original system this session)
- **Local Path:** C:\Dev\Eutopia

## Active Work: SDK 55 Migration (BLOCKER before Phase 8)

### Immediate Next Step: expo-av to expo-audio Migration
- **Problem:** expo-av removed from Expo Go in SDK 55 — app crashes on launch with "Cannot find native module 'ExponentAV'"
- **Solution:** Rewrite sound system from expo-av to expo-audio
- **Files to modify:**
  - src/services/soundManager.ts (main sound engine — music, SFX, crossfading, ambient)
  - src/hooks/useAudioSettings.ts (volume controls, mute state, AsyncStorage persistence)
- **Key API changes:**
  - `import { Audio } from 'expo-av'` → `import { Audio } from 'expo-audio'` (or useAudioPlayer hook)
  - playAsync() → play()
  - pauseAsync() → pause()
  - stopAsync() → stop() / remove()
  - setVolumeAsync(vol) → setVolume(vol)
  - setIsLoopingAsync(true) → setIsLooping(true)
  - unloadAsync() → remove()
- **After migration:** `npm uninstall expo-av` then `npx expo install expo-audio`
- **Test:** All audio — music playback, crossfading between variants, SFX triggers, volume sliders with preview, ocean ambient, weather sounds, boat sounds

### SDK 55 Upgrade Status
- [x] Packages upgraded (`npx expo install expo@^55.0.0` + `--fix`)
- [x] react-native-reanimated updated (worklets mismatch resolved)
- [x] Project cloned and running on new Windows dev system
- [x] Android emulator (Pixel 4a) set up with Expo Go SDK 55
- [ ] expo-av → expo-audio migration (BLOCKER — app crashes without this)
- [ ] Full feature test pass on Android emulator
- [ ] Merge sdk55-upgrade branch to main
- [ ] Tag v0.7.0
- [ ] EAS Build profiles configured (development/preview/production)

### iOS Testing Strategy
- Expo Go on iPhone stays on SDK 54 to protect other Tartan Studios apps
- Once ALL apps migrated to SDK 55, update Expo Go in App Store → free local testing resumes
- Until then: Android emulator only for SDK 55 testing
- Dev builds (EAS) available as backup for iOS but cost credits

### Completed This Session (Session 12)
- Crop cost rebalanced: 3 gold → 5 gold (game.ts)
- PNG icon preloading via expo-asset at app startup (Icons.tsx exported ICON_IMAGES, App.tsx preloads)
- Build menu icon size increased ~30%, name+cost combined into single row (AnimatedBuildMenu.tsx)
- Score change animation: badge pulse + floating +/- indicator (ScoreDisplay.tsx)
- Building overlays: factory smoke, house chimney smoke, fort flag (AnimatedBuilding.tsx)
- Phase 6 marked complete (all items including stretch goals)
- Phase 8 Multiplayer planned and sub-phased (8A-8E)
- No-emoji rule established (exceptions: title menu bar and ScoreDisplay only)
- Title standardized to "Eutopia" (no accented i)
- SDK 55 upgrade started: packages updated, project migrated to new Windows PC
- Identified expo-av removal as SDK 55 blocker
- MIGRATION_PLAN.md created with full step-by-step

### Phase 6 - Animations & Polish: COMPLETE
All items delivered including stretch goals (factory smoke, house chimney smoke, fort flag, score animation, gold flash, image preloading, build menu enlargement).

### Phase 8 - Multiplayer Sub-Phases (After SDK 55 Migration)
- **8A:** Firebase Project + Data Model (dedicated project, not shared with IJBA)
- **8B:** Lobby UI + Room Flow (host/join, room codes, ready-up)
- **8C:** Game State Sync (buildings, boats, resources, round timer authority)
- **8D:** Opponent Minimap + Visibility (read-only, tap to expand, live updates)
- **8E:** Disconnect Handling + Polish (3-min forfeit, reconnection, GitHub tag)
- GitHub commit after each sub-phase
- Firebase costs offset by between-round ad revenue

## Blockers
- **expo-av → expo-audio migration** must complete before any further SDK 55 work or Phase 8

## Next Steps (Priority Order)
1. Migrate soundManager.ts and useAudioSettings.ts from expo-av to expo-audio
2. Test all audio on Android emulator
3. Complete SDK 55 feature test pass
4. Merge sdk55-upgrade to main, tag v0.7.0
5. Configure EAS Build profiles
6. Begin Phase 8A: Firebase project setup

## Changelog

### Session 12 (March 6, 2026) - Phase 6 Completion + SDK 55 Migration Start
**Modified:**
- src/constants/game.ts (crop cost 3 → 5)
- src/components/game/Icons.tsx (exported ICON_IMAGES for preloading)
- App.tsx (added expo-asset import, ICON_IMAGES import, image preloading in init useEffect)
- src/components/game/AnimatedBuildMenu.tsx (icon size 0.55→0.72 multiplier, cap 40→56, combined name+cost labelRow)
- src/components/game/ScoreDisplay.tsx (score change pulse + floating +/- indicator, outerContainer wrapper)
- src/components/game/AnimatedBuilding.tsx (added SmokeOverlay for factory/house, FlagOverlay for fort, wrapper gets explicit width/height)

**Docs Created:**
- MIGRATION_PLAN.md (GitHub → new system → SDK 55 → EAS profiles)

**Docs Updated:**
- project-tracker.md (Phase 6 complete, Phase 8 sub-phases, crop cost, title, SDK 55 notes)
- PROJECT_STATUS.md (this file)
- PORTFOLIO_OVERVIEW.md (phases, milestones, cross-app deps)

**Safe to Delete:**
- src/components/ui/BuildMenu.tsx (legacy, replaced by AnimatedBuildMenu)

### Session 11 (March 3, 2026) - Phase 6 Building Animations + UI Polish
**Added:**
- src/components/game/AnimatedBuilding.tsx (new - building animation wrapper)

**Modified:**
- src/components/game/Island.tsx (wraps buildings in AnimatedBuilding)
- src/components/game/AnimatedBuildMenu.tsx (responsive grid, larger icons/text)
- src/components/setup/SetupScreen.tsx (landscape 2-column layout)

### Session 10 (Mar 1, 2026) - PNG Art Icons
- Replaced all SVG building icons with DALL-E generated PNG art
- Icons.tsx rewritten from SVG to Image components
- Front-facing perspective, transparency, 97% tile fill
- All 14 assets: 6 original + 6 enhanced + 2 boats

### Sessions 6-9 (Feb 2026) - Weather, Sound, Polish
- Weather system complete (rain, storms, hurricanes with pause/resume)
- Fish schools, pirate ships, boat waypoint pathfinding
- Complete sound system with music crossfading and tension variants
- Victory screen redesign, build menu enlargement
- Setup screen with mode/rounds/difficulty
- How to Play tutorial modal
- Dual independent toast notification system
- Hurricane balance tuning (2 building cap, 10% destruction reduction)
