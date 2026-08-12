# Portfolio Overview: Eutopia

*Last Updated: August 11, 2026*

## App Identity
- **Name:** Eutopia (Greek: good place - etymological root of "Utopia")
- **Category:** Strategy / City Builder / God Game
- **Tagline:** Build Your Island Paradise
- **Inspiration:** Utopia (1981) for Intellivision - widely considered the first god game
- **Target Audience:** Retro gaming enthusiasts + casual strategy gamers

## Current Stage: Active Development (Pre-Release)

### Phase Progress
| Phase | Description | Status |
|-------|-------------|--------|
| 1-5 | Core gameplay, UI, sound, setup | Complete |
| 6 | Animations & Polish | Complete |
| 7 | AI Opponent | Complete (basic) |
| SDK 55 | Migration + expo-audio | Complete — merged to main, tagged v0.7.0 |
| 8 | Multiplayer (8A-8E) | In progress — 8A-8D complete, 8E active |
| 9 | Enhanced Mode Features | Planned |
| 10 | Final Polish & Deployment | Planned |

### Completion Summary
- Core gameplay loop, building system (12 types), AI opponent
- Weather system (rain, storms, hurricanes), rebel mechanics, boat pathfinding
- Sound/music with crossfading and tension variants (expo-audio, SDK 55 compatible)
- Responsive iPhone/iPad design (landscape optimized)
- DALL-E PNG building art (14 assets), building placement + idle animations
- Building overlays (factory smoke, house chimney smoke, fort flag sway)
- Score change animation, gold flash, image preloading
- Setup screen with mode/rounds/difficulty, How to Play tutorial
- SDK 55 upgrade complete — on main branch, v0.7.0 tagged
- Multiplayer 8A-8D complete: Firebase rooms, lobby with room codes, full state sync,
  host-authoritative round timer, synchronised weather, fog-of-war opponent minimap
- Remaining: 8E disconnect handling, enhanced mode features, deployment

## Brand Integration

| Attribute | Value |
|-----------|-------|
| Parent Brand | Tartan Studios |
| Division | Entertainment |
| Brand Position | Direct child (no sub-brand) |
| Website | Listed at tartan-studios.com |
| Support Email | support@tartan-studios.com |
| Privacy Policy | https://tartan-studios.com/privacy.html |
| Terms of Service | https://tartan-studios.com/terms.html |

## Cross-App Dependencies
- Dedicated Firebase project for multiplayer (not shared with IJBA or other apps)
- Shared AdMob publisher account (pub-7909587764339962)
- Firebase Realtime DB costs offset by between-round ad revenue
- Same privacy/terms infrastructure as other Tartan Studios apps
- SDK 55 upgrade complete for Eutopia; other Tartan Studios apps still to migrate

## Monetization Model

| Tier | Price | Includes |
|------|-------|----------|
| Free | $0 | Original Mode, video ads between rounds |
| Ad-Free | $2.99 (IAP) | Original Mode, no ads |
| Premium | $4.99 (IAP) | Enhanced Mode + Ad-Free |
| Tip Jar | $0.99-9.99 (IAP) | Optional support, no gameplay benefit |

**Principles:** No pay-to-win, no energy/lives, no loot boxes, ads only at natural pause points.

## Tech Stack
- React Native + Expo SDK 55 (on main branch)
- TypeScript, Zustand, AsyncStorage
- expo-audio@55.0.0 (migrated from expo-av; pinned to 55.0.0 for Expo Go compatibility)
- Custom sound manager with music crossfading and tension variants
- Google AdMob + react-native-iap (planned)
- Firebase Realtime DB for multiplayer (LIVE — dedicated project `eutopia-2f19f`,
  Firebase JS SDK, no auth, player identity via AsyncStorage random ID)
- Firebase Analytics + Crashlytics (planned)
- EAS Build profiles configured (development / development-device / preview / production)

## Key Milestones

**Achieved:**
- Jan 2026: Project inception, design doc, first prototype
- Jan 2026: Core gameplay loop functional
- Feb 2026: Weather, sound, UI polish complete
- Mar 2026: PNG art assets, building animations, responsive layouts
- Mar 2026: Phase 6 complete (all animations, overlays, score effects, image preloading)
- Mar 2026: SDK 55 migration complete — expo-audio, Android fixes, full test pass, v0.7.0 tagged
- Aug 2026: Multiplayer 8A-8D complete — Firebase backend, lobby, state sync,
  round timer authority, spawn event parity, opponent minimap

**Upcoming:**
- Phase 8E: disconnect handling, forfeit timeout, reconnection, host migration
- Phase 9 enhanced features
- EAS preview build for iOS verification on a real device (after Phase 8)
- TestFlight beta
- App Store submission
- Update Expo Go on iOS once all Tartan Studios apps on SDK 55

**Deferred decision:** PvP boat combat (as in the 1981 original) is not implemented
and would require a shared-grid rework — single map containing both islands, high-rate
boat position sync, host-authoritative collision. Parked for Phase 9/10.

## Action Items for Portfolio Coordination
- AdMob interstitial ad unit creation in console (still outstanding — blocks TestFlight)
- App Store / Play Store listings preparation
- GitHub commits after each Phase 8 sub-phase
- Coordinate SDK 55 Expo Go update with other Tartan Studios app migrations (Eutopia done; others pending)
- Monitor Firebase Realtime DB usage now that multiplayer is live — costs are intended
  to be offset by between-round ad revenue, which is not yet implemented
