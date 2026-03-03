# Portfolio Overview: Eutopia

*Last Updated: March 3, 2026 (Session 12)*

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
| 8 | Multiplayer | In Progress (sub-phased 8A-8E) |
| 9 | Enhanced Mode Features | Planned |
| 10 | Final Polish & Deployment | Planned |

### Completion Summary
- Core gameplay loop, building system (12 types), AI opponent
- Weather system (rain, storms, hurricanes), rebel mechanics, boat pathfinding
- Sound/music with crossfading and tension variants
- Responsive iPhone/iPad design (landscape optimized)
- DALL-E PNG building art (14 assets), building placement + idle animations
- Building overlays (factory smoke, house smoke, fort flag)
- Score change animation, gold flash, image preloading
- Setup screen with mode/rounds/difficulty, How to Play tutorial
- Remaining: multiplayer (Firebase), enhanced mode features, deployment

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

## Monetization Model

| Tier | Price | Includes |
|------|-------|----------|
| Free | $0 | Original Mode, video ads between rounds |
| Ad-Free | $2.99 (IAP) | Original Mode, no ads |
| Premium | $4.99 (IAP) | Enhanced Mode + Ad-Free |
| Tip Jar | $0.99-9.99 (IAP) | Optional support, no gameplay benefit |

**Principles:** No pay-to-win, no energy/lives, no loot boxes, ads only at natural pause points.

## Tech Stack
- React Native + Expo SDK 54 (upgrading to 55)
- TypeScript, Zustand, AsyncStorage
- expo-av for audio, custom sound manager with crossfading
- Google AdMob + react-native-iap (planned)
- Firebase Analytics + Crashlytics (planned)

## Key Milestones

**Achieved:**
- Jan 2026: Project inception, design doc, first prototype
- Jan 2026: Core gameplay loop functional
- Feb 2026: Weather, sound, UI polish complete
- Mar 2026: PNG art assets, building animations, responsive layouts
- Mar 2026: Phase 6 complete (all animations, overlays, score effects)

**Upcoming:**
- Phase 8A: Firebase project + multiplayer data model
- Phase 8B-8E: Lobby, sync, minimap, disconnect handling
- SDK 55 upgrade (after other apps migrate)
- Phase 9 enhanced features
- TestFlight beta
- App Store submission

## Action Items for Portfolio Coordination
- Firebase project needs creation for multiplayer (Phase 8A)
- AdMob interstitial ad unit needs creation in console
- App Store / Play Store listings need preparation
- GitHub updates planned after each Phase 8 sub-phase
