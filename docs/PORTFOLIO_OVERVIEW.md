# Portfolio Overview: Eutopia

*Last Updated: March 6, 2026 (Session 12)*

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
| SDK 55 | Migration + expo-audio | In Progress (blocker for Phase 8) |
| 8 | Multiplayer (8A-8E) | Planned (after SDK 55) |
| 9 | Enhanced Mode Features | Planned |
| 10 | Final Polish & Deployment | Planned |

### Completion Summary
- Core gameplay loop, building system (12 types), AI opponent
- Weather system (rain, storms, hurricanes), rebel mechanics, boat pathfinding
- Sound/music with crossfading and tension variants (expo-av; migrating to expo-audio for SDK 55)
- Responsive iPhone/iPad design (landscape optimized)
- DALL-E PNG building art (14 assets), building placement + idle animations
- Building overlays (factory smoke, house chimney smoke, fort flag sway)
- Score change animation, gold flash, image preloading
- Setup screen with mode/rounds/difficulty, How to Play tutorial
- SDK 55 upgrade in progress (expo-audio migration is the blocker)
- Remaining: multiplayer (Firebase, sub-phased 8A-8E), enhanced mode features, deployment

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
- SDK 55 upgrade coordinated with other Tartan Studios apps (all must migrate before Expo Go iOS update)

## Monetization Model

| Tier | Price | Includes |
|------|-------|----------|
| Free | $0 | Original Mode, video ads between rounds |
| Ad-Free | $2.99 (IAP) | Original Mode, no ads |
| Premium | $4.99 (IAP) | Enhanced Mode + Ad-Free |
| Tip Jar | $0.99-9.99 (IAP) | Optional support, no gameplay benefit |

**Principles:** No pay-to-win, no energy/lives, no loot boxes, ads only at natural pause points.

## Tech Stack
- React Native + Expo SDK 55 (upgrading from 54; sdk55-upgrade branch)
- TypeScript, Zustand, AsyncStorage
- expo-av for audio (migrating to expo-audio for SDK 55 compatibility)
- Custom sound manager with music crossfading and tension variants
- Google AdMob + react-native-iap (planned)
- Firebase Realtime DB for multiplayer (planned, dedicated project)
- Firebase Analytics + Crashlytics (planned)

## Key Milestones

**Achieved:**
- Jan 2026: Project inception, design doc, first prototype
- Jan 2026: Core gameplay loop functional
- Feb 2026: Weather, sound, UI polish complete
- Mar 2026: PNG art assets, building animations, responsive layouts
- Mar 2026: Phase 6 complete (all animations, overlays, score effects, image preloading)
- Mar 2026: SDK 55 upgrade started, project migrated to new dev system

**Upcoming:**
- Complete expo-av → expo-audio migration (SDK 55 blocker)
- Merge SDK 55 upgrade, tag v0.7.0
- Configure EAS Build profiles (development/preview/production)
- Phase 8A: Firebase project + multiplayer data model
- Phase 8B-8E: Lobby, sync, minimap, disconnect handling
- Phase 9 enhanced features
- TestFlight beta
- App Store submission

## Action Items for Portfolio Coordination
- expo-av → expo-audio migration (immediate — SDK 55 blocker)
- Firebase project creation for multiplayer (Phase 8A)
- AdMob interstitial ad unit creation in console
- App Store / Play Store listings preparation
- GitHub commits planned after each Phase 8 sub-phase
- Coordinate SDK 55 Expo Go update with other Tartan Studios app migrations
