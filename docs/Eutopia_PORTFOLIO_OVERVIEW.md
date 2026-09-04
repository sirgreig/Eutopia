# Portfolio Overview: Eutopia

*Last Updated: August 31, 2026*

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
| 8 | Multiplayer (8A-8E) | Complete — v0.8.0 tagged |
| — | EAS preview build / iOS verification | Complete — iOS verified |
| — | App Store submission | Build 5 rejected (2.5.4, fixed); build 6 in review |
| 9 | Enhanced Mode + Sabotage | Sabotage complete; Enhanced Mode planned |
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
- Multiplayer complete (8A-8E): Firebase rooms, lobby with room codes, full state sync,
  host-authoritative round timer, synchronised weather, fog-of-war opponent minimap,
  disconnect handling with forfeit, host migration and auto-rejoin
- Remaining: iOS verification, ads/IAP modules, icon and splash, enhanced mode, deployment

## Brand Integration

| Attribute | Value |
|-----------|-------|
| Parent Brand | Tartan Studios |
| Division | Entertainment |
| Brand Position | Direct child (no sub-brand) |
| Website | Listed at tartan-studios.com |
| Support Email | support@tartan-studios.com |
| Privacy Policy | https://tartan-studios.com/eutopia/privacy.html |
| Terms of Service | https://tartan-studios.com/eutopia/terms.html |

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
- expo-audio (migrated from expo-av). **Plugin options must be passed explicitly** —
  its defaults declare background audio and caused an App Store rejection.
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
- Aug 2026: Phase 8 complete — disconnect handling, forfeit, host migration,
  auto-rejoin. Tagged v0.8.0
- Aug 2026: First successful iOS build; TestFlight beta live with internal testers
- Aug 2026: **Submitted to the App Store** as "Eutopia: Island Builder"
- Aug 2026: Build 5 rejected (Guideline 2.5.4 — expo-audio's config plugin silently
  declared background audio the app never uses). Fixed; build 6 resubmitted.
- Aug 2026: Sabotage shipped — send rebels to your opponent, the game's first true
  cross-player action. Boat building moved from land tiles to open water, fixing a
  dead-end where a fully developed island could never build another boat.

**Live URLs:**
- Privacy: https://tartan-studios.com/eutopia/privacy.html
- Terms: https://tartan-studios.com/eutopia/terms.html
- Support: support@tartan-studios.com (Cloudflare Email Routing → Gmail)

**Upcoming:**
- Paid Applications Agreement (banking + tax; several days; gates ALL in-app purchases)
- Phase 9 Enhanced Mode — ships OTA via EAS Update
- react-native-iap (native — needs a build) once Enhanced Mode exists
- AdMob interstitial ad unit + enable ads (JS, ships OTA; currently wired but
  disabled via a master switch, and solo-only pending a multiplayer design answer)

**Release strategy:** 1.0 ships free with no ads and no IAP. The AdMob native module
is already in the binary so ads can be enabled over the air. Enhanced Mode (Premium)
is pure JS and can be delivered OTA once built, but selling it requires the IAP
module and the Paid Applications Agreement.

**Deferred decision:** PvP boat combat (as in the 1981 original) is **explicitly
declined**, not merely deferred. It would require a shared-grid rework — a single map
containing both islands, high-rate boat position sync, host-authoritative collision.
Sabotage (sending rebels) delivers cross-player interaction at a fraction of the cost.

## Action Items for Portfolio Coordination
- **Paid Applications Agreement: ACTIVE** (verified Sept 2026) — bank account, W-9 and
  DSA compliance all in place. IAP is unblocked at the account level for every
  Tartan Studios app; only the `react-native-iap` module is still missing.
- AdMob interstitial ad unit created; app status is "Requires review" in the AdMob
  console, which is why ads report no-fill
- Apple distribution certificate **expires 18 December 2026** — shared across ALL
  Tartan Studios apps. Renewal is portfolio-wide, not Eutopia-specific.
- Coordinate SDK 55 Expo Go update with other Tartan Studios app migrations
- Monitor Firebase Realtime DB usage now that multiplayer is live — costs are
  intended to be offset by ad revenue, which is not yet implemented
- **Reusable learnings for the whole portfolio:**
  - **Config plugin defaults can get you rejected.** `expo-audio` defaults
    `enableBackgroundPlayback: true`, declaring background audio in Info.plist.
    That is an automatic Guideline 2.5.4 rejection for any app not actually playing
    audio in the background — it cost Eutopia a full review cycle. Pass plugin
    options explicitly and audit the GENERATED Info.plist and AndroidManifest.
  - **An unaccepted Developer Program License Agreement blocks every app.**
    Submissions sit in "Waiting for Review" and never enter the queue. No error, just
    a banner on the Apps list. Cost roughly ten days.
  - **React Native `<Modal>` aborts on iOS under `requireFullScreen`** in any
    landscape-locked app. Use absolute overlays.
