# Project Tracker: Eutopia

## Project Overview

A mobile game inspired by the 1981 Intellivision classic "Utopia" — widely considered the first god game/city builder. This project aims to honor the original while making it accessible to modern players.

**Title:** Eutopia *(Greek: εὐτοπία, "good place" — the etymological root of "Utopia")*

**Target Platforms:** iOS (iPhone) and Android

**Player Modes:** 
- 2-player (original experience)
- 1-player vs AI opponent

---

## Design Pillars

### Pillar 1: Vintage Fidelity
> "Obvious to vintage game lovers who appreciated Intellivision that this is a remake that will enable them to enjoy the old game they loved but in a new modern way."

- Core mechanics match original game loop
- Visual style evokes Intellivision aesthetic (simple shapes, limited palette)
- Round-based structure with scoring preserved
- Same building types and their functions
- Weather/event system intact

### Pillar 2: Modern Accessibility
> "Fun for new players unfamiliar with Intellivision gaming. Option enhancements for modern game players."

- Intuitive touch controls (no controller translation friction)
- Optional tutorial/guided first game
- Quality-of-life improvements (undo placement, info tooltips)
- Optional "enhanced mode" with expanded features
- AI opponent for solo play

---

## Original Utopia Mechanics (Reference)

*Source: Reverse-engineered code by Joe Zbiciak (Intvnut)*

### Game Structure
- Two players, each controlling one island
- Configurable round duration: 45-120 seconds (default: 60 seconds)
- Configurable game length: number of rounds (default: 15 rounds)
- Real-time gameplay within rounds
- Victory by highest cumulative score at end

### Starting Conditions
- 100 gold bars
- 1,000 population
- Each island has exactly **29 buildable tiles**

### Buildings & Costs

| Building | Cost (Gold) | Function |
|----------|-------------|----------|
| Crops/Farm | 5 | Food source; generates 1 gold/second ONLY when rained upon |
| Housing | ~25-30 | Increases population capacity; +0.1% fertility per house |
| School | 35 | +1 welfare point; -0.3% fertility; boosts factory productivity |
| Factory | 40 | +4 gold/round; +0.1% mortality; benefits from schools/hospitals |
| PT Boat | 40 | Military vessel; sinks enemy fishing boats & pirates; cannot fish |
| Fort | 50 | Protects 1-tile radius from rebels; protects nearby parked ships |
| Hospital | 75 | +1 welfare point; +0.3% fertility; -0.3% mortality; boosts productivity |
| Fishing Boat | ~25-30 | Income source; generates gold when over fish schools |
| Spawn Rebel (on enemy) | 30 | Sabotage action; creates rebel on opponent's island |

### Income System (Per Round)

**During Round:**
- Fishing boats over fish schools: continuous income
- Crops during rain: 1 gold/second per crop tile

**End of Round:**
- Base income: 10 gold bars (does not count toward GDP)
- Per factory: +4 gold bars
- Per fishing boat: +1 gold bar
- Productivity bonus: `((Schools + Hospitals) × Factories) + Hospitals` (max 30 gold)

### Population Dynamics

**Fertility (birth rate):**
- Base: 5.0%
- +0.3% per crop
- +0.3% per hospital
- +0.1% per house
- -0.3% per school
- Minimum: 4.0%

**Mortality (death rate):**
- Base: 1.1%
- -0.3% per hospital (min 0.2% before factory penalty)
- +0.1% per factory
- Maximum (all factories): 4.0%

**New Population = Population + (Population × Fertility) - (Population × Mortality)**
- Maximum population: 9,999

### Round Scoring System (0-100 "Approval Rating")

Four subscores, each capped at 30:

1. **Housing Score:** `((Houses × 500) / (Population / 100)) / 3`
2. **Per-Capita GDP:** `((Round GDP × 100) / (Population / 100)) / 12`
3. **Food Supply:** `(((Fishing Boats + Crops) × 500) / (Population / 100)) / 3`
4. **General Welfare:** 1 point per school + 1 point per hospital

**Total Round Score = Sum of subscores (max 100)**

### Rebellion System

Rebels spawn/despawn based on score changes:
- **Add rebel if:** Score dropped >10 points OR score below 30
- **Remove rebel if:** Score increased >10 points OR score above 70
- Rebels can destroy buildings (unless protected by fort)
- Rebels cause casualties: 0-101 per incident

### Weather & Events

| Event | Effect |
|-------|--------|
| Rain | Waters crops (triggers income); beneficial |
| Tropical Storm | Waters crops OR destroys them; may sink moving boats |
| Hurricane | 5× more destructive than tropical storms; 2/3 chance to destroy anything in path; sinks moving boats (anchored boats may survive) |
| Pirates | Spawn randomly; sink fishing boats; can be blocked/sunk by PT boats |
| Fish Schools | Move randomly; fishing boats must follow to generate income |

**Weather damage:** 0-101 casualties per destroyed structure

### Combat & Boats

- PT Boats sink enemy fishing boats by occupying same space
- PT Boats sink pirate ships
- PT Boats can ONLY be sunk by hurricanes/tropical storms
- Forts protect parked ships within 1-tile radius
- Pirates never intentionally sail toward parked PT boats

### Known Original Bugs (For Reference)
- Scoring overflows if >65 crops + fishing boats combined
- Scoring overflows if >255 gold earned in single turn
- "Float off bottom of screen" boat bug

---

## Adaptation Decisions

### Confirmed Decisions

**Multiplayer Architecture:**
- 2-player mode assumes **2 devices** (networked play)
- Each player sees own island full-screen + **minimap of opponent's island**
- Tap minimap to expand/inspect opponent's island
- Leverage existing room-based infrastructure from trivia game

**Island Generation:**
- Keep 29-tile limit per island (matches original constraint)
- **Randomly generated island shapes each game** (vs. fixed layout in original)
- **Asymmetric maps with fairness constraints:**
  - Both islands evaluated for "strategic quality" metrics
  - Generator ensures comparable: total coastline, compactness, fort-coverage potential
  - Allows visual variety while preventing lopsided advantages
- Adds replayability; rain patterns will vary, placement strategy varies

**Game Length Options:**
- Round count: **15-30 rounds** (player selectable)
- Round duration: **1-3 minutes** (player selectable)
- Total game time range: 15 minutes to 90 minutes
- *Subject to change based on playtesting*

**AI Aggression & Sabotage:**
- Keep the "spawn rebel on enemy" mechanic (30 gold cost)
- AI aggression level scales with difficulty setting
- **Expose tuning parameters for playtesting** — need easy way to adjust:
  - Frequency of AI sabotage attempts
  - AI's threshold for when to sabotage vs. build
  - Response to player aggression

**Game Modes (Pre-Game Toggle):**
- **Original Mode:** Full visibility of opponent's island (authentic experience)
- **Enhanced Mode:** Fog of war on opponent's island — see terrain but not buildings until scouted
- Toggle presented at game setup; both players must agree in multiplayer

**Between-Round Flow:**
- **Manual continue** — Round ends, summary displayed, player taps to ready up
- **Timeout: 20 seconds** — Auto-ready if player doesn't tap (keeps momentum)
- Prevents stalling while allowing brief strategic pause

**Save State & Disconnection:**
- **AI vs Human:** Full save state; resume anytime
- **Human vs Human:** **3-minute timeout** — forfeit if disconnected player doesn't return
- No async/turn-based hybrid — keeps real-time feel intact

**Minimap Interaction:**
- Tap minimap to expand to larger overlay view
- Read-only — cannot queue actions on opponent's island
- In Enhanced Mode, fog of war applies to minimap too

### Controls (Mobile)

**Confirmed:**
| Action | Control |
|--------|---------|
| Select building type | Tap empty tile → contextual popup menu |
| Place building | Tap building in popup |
| Get building info | Long-press on existing building |
| Select boat | Tap on boat |
| Move boat | Tap-tap (select boat, then tap destination) |
| View opponent island | Tap minimap → expanded overlay (read-only) |

**Design notes:**
- Contextual popup maximizes map visibility
- Tap-tap for boats avoids gesture conflicts with map pan
- No drag gestures for boats (precision issues on small screens)

### Visual Style

**Approach: Modern & Detailed with Retro Inspiration**
- Clean, visually appealing modern rendering
- Detailed building icons with depth, shadows, and recognizable features
- Smooth rounded corners on tiles
- Limited but vibrant color palette inspired by original
- System fonts for readability
- Sized for iPhone touch targets (48px tiles)

**Building icon details:**
- House: Detailed roof with shingles, chimney with smoke, door with handle, multi-pane windows
- Factory: Tall smokestack with animated smoke puffs, lit windows, gear details
- Farm: Crop rows with individual plants, fence posts
- Fort: Crenellated battlements, stone texture, arched gate with portcullis bars, flag
- Hospital: White building with prominent red cross, windows
- School: Bell tower with golden bell, clock face, multiple windows

**New Enhanced buildings:**
- Dock: Wooden planks, support posts in water, mooring post, rope coil

**Animations (implemented via built-in Animated API — no Reanimated dependency in Expo Go SDK 54):**
| Building | Animation |
|----------|-----------|
| Factory | Smoke puffs rise and fade, windows flicker, gear rotates |
| House | Gentle chimney smoke wisps |
| School | Bell swings back and forth, clock minute hand rotates |
| Fort | Flag waves in the wind |
| Hospital | Red cross pulses subtly |
| Farm | Crops sway gently in breeze |
| Fish school | Fish swim together in pattern |

*Visual style approved — ready for implementation*

### Tutorial System

**Approach: Contextual First-Time Hints**
- Show tooltip/hint the first time each action is taken:
  - First time tapping empty tile → explains building menu
  - First time selecting each building type → explains function
  - First time selecting boat → explains movement
  - First time round ends → explains scoring
- Non-intrusive; doesn't require separate tutorial mode
- Hints can be dismissed and don't repeat
- Optional "reset hints" in settings for returning players

### Enhanced Mode (Optional Features for Modern Players)

**Confirmed for Enhanced Mode:**

**Fog of War:**
- Fog of war on opponent's island (requires scouting to reveal buildings)
- **Scouting via PT boat proximity:**
  - PT boats reveal opponent's island tiles within X radius
  - Radius must be large enough that a full coastal patrol reveals 100% of island
  - Creates dual-purpose for PT boats: combat + reconnaissance
  - Risk/reward: Send boat to scout = expose it to enemy PT boats and storms
  - Revealed tiles stay revealed (no re-fogging)

**Additional Buildings (Enhanced Mode Only):**

| Building | Cost | Function |
|----------|------|----------|
| **Apartment** | 60 | +3x housing capacity of House, but -1 welfare point |
| **Dock** | 45 | Fishing boats launched from adjacent water generate +50% income |
| **Lighthouse** | 55 | Extends PT boat scouting radius; nearby boats resist storm damage |
| **Granary** | 35 | Stores food surplus; buffers against bad rounds |
| **Marketplace** | 50 | Converts excess food score into bonus gold each round |
| **Watchtower** | 40 | Reveals fog on enemy island within radius (stationary scouting) |

*Building list subject to playtesting; may add/remove/rebalance*

**NOT changing in Enhanced Mode (keep original feel):**
- Original building types and costs still available
- Scoring formulas (enhanced buildings plug into existing system)
- Population dynamics
- Round structure

---

## Monetization Strategy

### Revenue Model Overview

Eutopia uses a **freemium model** with four non-intrusive revenue streams designed to respect the player experience while supporting development.

### Pricing Tiers

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | Original Mode, video ads between rounds |
| **Ad-Free** | $2.99 (IAP) | Original Mode, no ads |
| **Premium** | $4.99 (IAP) | Enhanced Mode + Ad-Free |
| **Tip Jar** | $0.99-9.99 (IAP) | Optional support, no gameplay benefit |

### Revenue Stream Details

#### 1. Video Ads Between Rounds
- **Placement:** After round summary, before next round begins
- **Type:** Rewarded or interstitial video (15-30 seconds)
- **Frequency:** Every round (skippable after 5 seconds for interstitial)
- **Why it works:** Natural pause point; doesn't interrupt gameplay flow
- **Ad networks:** AdMob (primary), Unity Ads (fallback)

#### 2. Ad-Free Purchase ($2.99)
- One-time IAP to permanently remove all advertisements
- Available from Settings menu and prompted after 3rd ad view
- Non-intrusive prompt: "Enjoying Eutopia? Remove ads for $2.99"

#### 3. Premium/Enhanced Mode ($4.99)
- Unlocks all Enhanced Mode features:
  - Fog of war gameplay
  - 6 additional building types (Apartment, Dock, Lighthouse, Granary, Marketplace, Watchtower)
  - Future enhanced features
- **Includes Ad-Free** — premium players never see ads
- Presented on game setup screen with clear feature comparison
- Free players can preview Enhanced buildings in a "Coming in Premium" info panel

#### 4. Tip Jar (Non-Intrusive)
- **Location:** Settings menu only (not prompted during gameplay)
- **Options:**
  - ☕ "Buy me a coffee" — $0.99
  - 🍕 "Buy me lunch" — $4.99
  - 🎉 "You're amazing!" — $9.99
- **Presentation:** Small, friendly section at bottom of Settings
- **Message:** "Eutopia is a passion project. Tips help keep it updated!"
- **No rewards** — purely voluntary support, no gameplay benefit
- **Thank you:** Simple "Thank you! 💙" toast after purchase

### What We Will NOT Do

| Anti-Pattern | Why We Avoid It |
|--------------|-----------------|
| Pay-to-win mechanics | Destroys competitive integrity |
| Energy/lives system | Breaks real-time round flow |
| Loot boxes / gacha | Predatory; doesn't fit game style |
| Aggressive ad popups | Ruins user experience |
| Paywalled difficulty levels | Feels unfair to free players |
| Consumable currency (gold purchase) | Would feel like cheating |

### Implementation Priority

1. **Phase 1 (MVP):** Video ads between rounds (AdMob)
2. **Phase 2:** Ad-Free IAP ($2.99)
3. **Phase 3:** Premium/Enhanced IAP ($4.99)
4. **Phase 4:** Tip Jar in Settings

### Technical Requirements

- **Ad SDK:** Google AdMob (react-native-google-mobile-ads)
- **IAP SDK:** react-native-iap (handles both App Store and Google Play)
- **Receipt validation:** Server-side validation recommended for Premium unlock
- **Restore purchases:** Required button in Settings for IAP recovery

### Infrastructure Configuration (Confirmed)

#### Tartan Studios Brand Integration
| Attribute | Value |
|-----------|-------|
| Parent Brand | Tartan Studios |
| Division | Entertainment |
| Brand Position | Direct child (no sub-brand) |
| Website | Listed at tartan-studios.com |
| Support Email | `support@tartan-studios.com` |
| Privacy Policy | `https://tartan-studios.com/privacy.html` |
| Terms of Service | `https://tartan-studios.com/terms.html` |

#### Firebase Configuration
| Attribute | Value |
|-----------|-------|
| Project | **Own dedicated Firebase project** |
| Project Name | `eutopia` or `tartan-eutopia` (TBD) |
| Sharing | Not shared with other apps |
| Services | Auth, Analytics, Crashlytics |

#### AdMob Configuration
| Attribute | Value |
|-----------|-------|
| Publisher ID | `pub-7909587764339962` (shared Tartan Studios account) |
| App ID | `ca-app-pub-7909587764339962~6992047932` |
| Ad Unit (Interstitial) | TBD — create in AdMob console |
| Ad Format | Interstitial video (between rounds) |

*Sibling apps in same AdMob account:*
- Inside Joke Battle Arena (`ca-app-pub-...3767973080`)
- Sojourner's Path (`ca-app-pub-...1406802546`)

### Metrics to Track

| Metric | Purpose |
|--------|---------|
| Ad completion rate | Optimize ad placement/frequency |
| Ad-Free conversion rate | Measure ad annoyance threshold |
| Free → Premium conversion | Validate Enhanced Mode value |
| Tip Jar usage | Gauge community support |
| Retention by tier | Ensure ads don't hurt retention |

---

## Island Generator Design

### Fairness Constraints

Both islands should be "strategically equivalent" even if visually different. Metrics to balance:

| Metric | Why It Matters |
|--------|----------------|
| **Compactness ratio** | Compact islands need fewer forts for full coverage |
| **Coastline length** | More coast = more fishing boat launch points but also more pirate exposure |
| **"Fort efficiency"** | How many tiles can one optimally-placed fort protect? |
| **Contiguity** | No disconnected land masses (or equal number if allowed) |
| **Chokepoints** | Narrow connections between regions affect rebel spread |

### Generator Approach (TBD)

Options:
1. **Generate-and-validate:** Create random island, score it, reject if outside tolerance
2. **Constrained generation:** Build islands tile-by-tile with rules that enforce balance
3. **Template + noise:** Start from balanced templates, add random variation within bounds

### Rain Pattern Fairness

Original game had fixed rain patterns favoring certain areas. Options:
- Identical rain seeds for both players
- "Fair" rain that visits each island equally over time
- Random but tracked — UI shows "rain debt" so players know if they're due

---

## Open Questions

### Resolved
- ✅ Island size: 29 tiles, randomly generated each game
- ✅ Sabotage mechanic: Keep, scale with difficulty, expose tuning params
- ✅ Game length: 15-30 rounds, 1-3 min/round (player choice)
- ✅ 2-player mode: 2 devices, networked; own island full-screen + opponent minimap
- ✅ Map symmetry: Asymmetric for variety, with fairness constraints in generator
- ✅ Fog of war: Toggle at game start (Original = full visibility, Enhanced = fog)
- ✅ Between rounds: Manual continue, 20-second auto-ready timeout
- ✅ Save state: Full save for AI games; 3-minute timeout forfeit for PvP disconnect
- ✅ Scouting: PT boat proximity reveals fog; radius sized so full coastal pass reveals 100%
- ✅ Minimap: Tap to expand overlay, read-only
- ✅ **Game name: Eutopia**
- ✅ Visual style: Retro-modern (geometric, clean edges, cohesive palette)
- ✅ Boat controls: Tap-tap (select then destination)
- ✅ Building menu: Contextual popup on tile tap
- ✅ Enhanced mode buildings: Apartment, Dock, Lighthouse, Granary, Marketplace, Watchtower
- ✅ Tutorial: Contextual first-time hints (non-intrusive)

### Still Open

**Technical (to determine during implementation):**
1. Exact PT boat scouting radius (depends on island generation bounds)
2. Enhanced building balance values (playtesting)
3. State sync protocol (delta vs full state)
4. Zustand vs alternative for state management

**Design (to validate with prototypes):**
5. Final visual style approval (need to see mockups)
6. Contextual popup design (radial menu vs list?)
7. Minimap size and position

---

## Reference Materials

### Primary Sources
- **Reverse-engineered code analysis:** https://intellivisionrevolution.wordpress.com/2012/05/06/utopias-secrets-revealed/
- **Detailed strategy analysis:** https://zeitgame.net/archives/5292 (The Wargaming Scribe)
- **Modern web remake (reference):** http://apps.gamejs.org/newutopia/
- **Wikipedia overview:** https://en.wikipedia.org/wiki/Utopia_(1981_video_game)

### Key Insights from Sources
- Original had NO AI opponent — 2-player only (or solo high-score chase)
- Game is frequently cited as "first god game" and "ancestor of RTS"
- Designer: Don Daglow (went on to work on SSI Gold Box games)
- Sold ~250,000 copies on 7 million Intellivision consoles
- The interplay between buildings creates genuine strategic depth
- Placement matters for forts (radius protection) and crops (rain patterns)

---

## Project Setup

**Local Path:** `C:\Dev\Eutopia`
**Repository:** GitHub (to be created)
**IDE:** VS Code + Expo Metro

---

## File Structure

```
C:\Dev\Eutopia\
├── App.tsx                              # Main game component
├── docs/
│   ├── project-tracker.md               # This file — rebuild bible
│   ├── PROJECT_STATUS.md                # Daily driver
│   └── Eutopia_PORTFOLIO_OVERVIEW.md    # Master plan
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── Icons.tsx                        # PNG building/boat icons + ICON_IMAGES
│   │   │   ├── Island.tsx                       # Map renderer, unified tap layer
│   │   │   ├── AnimatedBuilding.tsx             # Idle animations, smoke, fort flag
│   │   │   ├── AnimatedBuildMenu.tsx            # Contextual build menu
│   │   │   ├── AnimatedResourceBar.tsx          # Gold/pop/score with change pulse
│   │   │   ├── RainCloud.tsx / StormCloud.tsx / HurricaneCloud.tsx
│   │   │   ├── FishSchool.tsx / PirateShip.tsx / FreeRoamBoat.tsx
│   │   │   ├── AIIslandMinimap.tsx              # Solo: AI opponent minimap
│   │   │   ├── MultiplayerIslandMinimap.tsx     # MP: human opponent, fog of war
│   │   │   ├── ConnectionBanner.tsx             # 8E disconnect banner
│   │   │   ├── ScoreDisplay.tsx / EndGameSummary.tsx / Toast.tsx
│   │   │   ├── RoundTransition.tsx / RebelIcon.tsx
│   │   │   └── TutorialOverlay.tsx
│   │   ├── title/
│   │   │   └── TitleScreen.tsx                  # Animated launch screen
│   │   ├── common/
│   │   │   └── WhatsNewPanel.tsx                # Release notes after an update
│   │   ├── multiplayer/
│   │   │   ├── MultiplayerLobby.tsx             # Host/join/waiting room
│   │   │   └── NamePromptModal.tsx              # First-run player name
│   │   ├── setup/SetupScreen.tsx            # Mode/rounds/difficulty + MP entry
│   │   └── settings/SettingsScreen.tsx
│   ├── config/
│   │   └── firebaseConfig.ts                # eutopia-2f19f Realtime DB
│   ├── constants/
│   │   ├── game.ts                          # Balance values, building costs
│   │   └── whatsNew.ts                      # Release notes (id NOT the app version)
│   ├── hooks/
│   │   ├── useAIOpponent.ts                 # Disabled when isMultiplayer
│   │   ├── useAudioSettings.ts / useTutorial.ts / useAds.ts
│   ├── services/
│   │   ├── islandGenerator.ts / coastlineDetection.ts / boatMovement.ts
│   │   ├── soundManager.ts                  # expo-audio
│   │   ├── adService.ts                     # ADS_ENABLED master switch
│   │   ├── playerService.ts                 # Player id + name + active MP session
│   │   ├── multiplayerService.ts            # Rooms, islands, state, round, events
│   │   ├── nameFilter.ts                    # Display name validation (UGC)
│   │   ├── tutorialTargets.ts               # Measured spotlight rects
│   │   ├── whatsNewService.ts               # Which release notes are unseen
│   │   └── updateInfo.ts                    # Running OTA identity
│   └── types/index.ts                       # TypeScript definitions
└── assets/
    ├── images/*.png                         # 14 building/boat icons
    └── audio/*.mp3                          # SFX + music tracks
```

**Legacy / safe to delete:** `src/components/game/BuildMenu_DELETE.tsx`

## Critical Implementation Rules

### Pass config plugin options explicitly — defaults can get you rejected
`expo-audio` defaults `enableBackgroundPlayback: true`, which injects `'audio'` into
`UIBackgroundModes` and caused a **Guideline 2.5.4 App Store rejection** (build 5).
It also re-adds `RECORD_AUDIO` and foreground-service permissions on Android after
they are manually removed from app.json. Always specify:
```json
["expo-audio", { "enableBackgroundPlayback": false, "enableBackgroundRecording": false, "recordAudioAndroid": false }]
```
Audit the GENERATED Info.plist and AndroidManifest, not just app.json.

### Never use React Native `<Modal>`
The app is locked to landscape with `requireFullScreen: true`. `<Modal>` presents a
separate UIViewController, UIKit finds no valid orientation for it, and the process
aborts. This crashed TestFlight build 2 on launch. Use absolutely-positioned Views
with a high `zIndex` instead. iOS-only — invisible on Android and web.

### Boats are built on water, buildings on land
Tapping a land tile opens the buildings menu; tapping open water opens the boats
menu and spawns the boat where tapped. This is not cosmetic — boats used to be built
from free coastal LAND tiles, so a player who developed their whole island could
never build another boat, permanently losing fishing income and pirate defence.

Water tap rules, in order:
- A selected boat ALWAYS treats a water tap as its destination
- Deselect by tapping the boat itself, never by tapping water or land
- With nothing selected, a water tap opens the boat build menu

### Never hardcode UI coordinates for the tutorial
Spotlight positions are measured at runtime via `measureInWindow` and registered in
`src/services/tutorialTargets.ts`. Island shapes change every game, the build menu
is a wrapped flex grid, and phone/tablet dimensions differ — predicted coordinates
will always drift. Components report where they actually are.

### Release notes have their own id, not the app version
`runtimeVersion` uses the `appVersion` policy, so OTA updates keep `1.0.0`. Keying
the What's New panel off the app version would mean it never fires for OTA releases.
Bump `RELEASE_NOTES[0].id` in `src/constants/whatsNew.ts` per release.

### When a What's New entry is required
Add one whenever a change alters **what a player experiences**:
- New mechanics or features (sabotage, boat building moving to water)
- Balance changes they will feel (boat costs, storm damage, PT boats now losing 30%
  of fights with pirates)
- UI they interact with (round summary panel, changing their name in Settings)
- Bug fixes they would have noticed (tutorial highlights landing in the wrong place)

Skip it for work a player cannot see:
- SDK migrations, dependency changes, build configuration
- Ad integration repairs, analytics, service plumbing
- Refactors, internal architecture, documentation

**The test:** would someone who only plays the game notice or care? If the honest
answer is no, leave it out — a changelog full of invisible entries trains players to
dismiss the panel without reading it.

Write entries in player language. "Boats sheltering near a fort are completely safe
from weather and pirates", not "fort protection refactored to 100% boat immunity".

### OTA updates apply on the next launch
Quit and reopen twice after `eas update`. The Settings build footer shows the running
update id — check it before assuming a change is broken.

---

## Session Log

### Session 1 (Jan 12, 2026)
**Completed:**
- Full game design document based on original Utopia research
- Reverse-engineered mechanics from Joe Zbiciak's code analysis
- Defined Original vs Enhanced mode features
- Designed 6 new Enhanced mode buildings
- Created visual prototype (3 iterations)
- Approved visual style: modern, detailed, animated
- Documented animation specs for all buildings

### Session 2 (Jan 13, 2026)
**Completed:**
- ✅ Initialized Expo project with TypeScript
- ✅ Set up project structure (types, constants, state, services, components)
- ✅ Core TypeScript interfaces for all game entities
- ✅ Game constants and building configurations
- ✅ Zustand store skeleton with game actions
- ✅ Island generator with organic shapes (peninsulas, irregular coastlines)
- ✅ Island fairness metrics (compactness, coastline, fort efficiency, max inland depth)
- ✅ Island component with SVG rendering
- ✅ Building icons (all 12 buildings with detailed SVGs)
- ✅ Build menu popup with building/boat selection
- ✅ Building placement on tiles with gold cost
- ✅ Original/Enhanced mode toggle
- ✅ Boat icons (fishing boat & PT boat SVGs)
- ✅ Boat spawning from coastal tiles
- ✅ Boat selection and tap-to-move controls
- ✅ Status bar with gold and boat count

**GitHub Commits:**
- Initial commit: design docs and visual prototype
- Initialize Expo project with TypeScript
- Add organic island generator with depth metrics
- Add building icons and placement system
- Add boat spawning and movement

### Session 3 (Jan 14, 2026)
**Completed:**
- ✅ Custom SVG icons replacing all emojis (House, Farm, Factory, Hospital, School, Fort)
- ✅ Custom SVG icons for enhanced buildings (Apartment, Dock, Lighthouse, Granary, Marketplace, Watchtower)
- ✅ Custom SVG icons for boats (Fishing Boat, PT Boat)
- ✅ Construction fallback icon
- ✅ Animated water tiles with wave motion effects
- ✅ Land tiles with grass texture
- ✅ Coastal beach edges (sand gradients)
- ✅ Water gradients (shallow coastal vs deep ocean)
- ✅ Selected tile/boat glow effects with shadows
- ✅ Wide horizontal build menu layout (fits all 12 buildings)
- ✅ Round timer and countdown display
- ✅ Start/Next round button functionality
- ✅ Income calculation per round end
- ✅ Population growth/decline calculation
- ✅ Rain cloud animation (drifts across map)
- ✅ Rain bonus gold for farms
- ✅ Rebel spawning on low score (<30)
- ✅ Rebel icon with pulsing animation
- ✅ Fort protection radius preventing rebels
- ✅ Stability clearing rebels on high score (≥70)
- ✅ Score breakdown calculation (Housing, Food, Welfare, GDP)
- ✅ Score display panel with category bars
- ✅ End game summary screen with ranks
- ✅ Play Again functionality
- ✅ Project tracker merge and Sound & Audio system planning

**Files Added/Modified:**
- `src/components/game/Icons.tsx` — 14 custom SVG icons
- `src/components/game/Island.tsx` — Animated water/land tiles
- `src/components/game/RainCloud.tsx` — Weather animation
- `src/components/game/RebelIcon.tsx` — Rebel warning indicator
- `src/components/game/ScoreDisplay.tsx` — Score breakdown UI
- `src/components/game/EndGameSummary.tsx` — Game over screen
- `App.tsx` — Full gameplay loop integration

### Session 4 (Feb 12, 2026)
**Completed:**

**Bug Fixes:**
- ✅ Fixed Island component tap handling (unified tap layer architecture)
- ✅ Fixed competing Pressables causing land tile taps to be ignored
- ✅ Fixed responsive layout for Build Menu on iPhone (dynamic item widths)
- ✅ Fixed responsive layout for AI Minimap popup on iPhone (ScrollView + dynamic sizing)
- ✅ Implemented authentic rebel mechanics (rebels destroy buildings, block construction)

**Monetization & Infrastructure:**
- ✅ Created Portfolio Overview document for Tartan Studios master project integration
- ✅ Defined monetization strategy: Freemium with 4 revenue streams
  - Video ads between rounds (free tier)
  - Ad-Free IAP ($2.99)
  - Premium IAP ($4.99) - Enhanced Mode + Ad-Free
  - Tip Jar ($0.99-$9.99) - non-intrusive in Settings
- ✅ Created Firebase project for Eutopia (with Google Analytics)
- ✅ Created Google Analytics account for Tartan Studios
- ✅ Registered iOS app in Firebase (bundle ID: com.tartanstudios.eutopia)
- ✅ Created AdMob app entry (ca-app-pub-7909587764339962~6992047932)
- ✅ Configured EAS Build for development and production
- ✅ Successfully built iOS development client via EAS
- ✅ Created AdService with graceful Expo Go fallback
- ✅ Created useAds hook for easy component integration

**Configuration Files Updated:**
- `app.json` — Added bundle IDs, AdMob config, SKAdNetwork identifiers, EAS config
- `eas.json` — Build profiles for development, development-device, preview, production

**Files Added:**
- `src/services/adService.ts` — Ad service with Expo Go detection, interstitial ad management
- `src/hooks/useAds.ts` — React hook for ad integration in components
- `PORTFOLIO_OVERVIEW.md` — Portfolio document for Tartan Studios integration
- `GoogleService-Info.plist` — Firebase configuration (iOS)

**Infrastructure Decisions Confirmed:**
- Support email: support@tartan-studios.com
- Brand position: Direct child of Tartan Studios (Entertainment division)
- Firebase: Own dedicated project (not shared)
- Privacy/Terms: Use Tartan Studios pages

---

## ⚠️ BEFORE TESTFLIGHT CHECKLIST

**IMPORTANT: Complete these steps before your first TestFlight build!**

### 1. Create AdMob Interstitial Ad Unit
- [ ] Go to [AdMob Console](https://admob.google.com)
- [ ] Select Eutopia app (ca-app-pub-7909587764339962~6992047932)
- [ ] Click **Ad units** → **Add ad unit** → **Interstitial**
- [ ] Name it: "Between Rounds Interstitial"
- [ ] Copy the Ad Unit ID (format: `ca-app-pub-7909587764339962/XXXXXXXXXX`)

### 2. Update adService.ts with Real Ad Unit ID
- [ ] Open `src/services/adService.ts`
- [ ] Find line ~15: `: 'ca-app-pub-7909587764339962/XXXXXXXXXX', // TODO: Replace with real ad unit ID`
- [ ] Replace `XXXXXXXXXX` with your actual Ad Unit ID from step 1
- [ ] Do this for both iOS and Android sections

### 3. Integrate Ads into Game Flow
- [ ] In App.tsx, import: `import { useAds } from './src/hooks/useAds';`
- [ ] Add hook: `const { showAd } = useAds();`
- [ ] Call `await showAd();` at round end, before starting next round

### 4. Test Ad Integration
- [ ] Build for TestFlight: `eas build --profile production --platform ios`
- [ ] Submit to TestFlight: `eas submit --platform ios`
- [ ] Install via TestFlight and verify ads appear between rounds

### 5. App Store Preparation
- [ ] Create app listing in App Store Connect
- [ ] Upload screenshots (iPhone & iPad, landscape)
- [ ] Write app description
- [ ] Set privacy policy URL: https://tartan-studios.com/privacy.html
- [ ] Set support URL: support@tartan-studios.com

---

## Firebase Project (Parked for Future Use)

A Firebase project has been created and configured but is **not currently integrated** into the app due to build compatibility issues with Expo. AdMob alone handles ads + basic analytics for launch.

**Project Details:**
- Firebase Project: `eutopia` (in Firebase Console)
- Google Analytics Account: `Tartan Studios`
- iOS Bundle ID: `com.tartanstudios.eutopia` (registered)
- Config File: `GoogleService-Info.plist` (downloaded, in project root)

**Available When Needed:**
- Firebase Analytics (detailed custom event tracking)
- Crashlytics (crash reporting)
- Remote Config (A/B testing, feature flags)
- Authentication (user accounts for multiplayer)
- Firestore (cloud saves, leaderboards)

**To Activate Later:** Revisit `@react-native-firebase` package integration when Expo compatibility improves or when these features become necessary.

---

### Session 5 (Feb 13, 2026)
**Completed:**

**Build Menu Fix:**
- ✅ Redesigned AnimatedBuildMenu for iPhone landscape
- ✅ Horizontal scrolling single-row layout for screens with height < 450px
- ✅ All buildings + boats in one swipeable strip with divider
- ✅ Compact icons (20px) and tighter padding for landscape
- ✅ Standard layout preserved for iPad/larger screens

**Interactive Tutorial System:**
- ✅ Created `useTutorial` hook with AsyncStorage persistence
- ✅ Tutorial only shows for first-time players
- ✅ "Skip Tutorial" button on every step
- ✅ Created `TutorialOverlay` component with spotlight effect
- ✅ Pulsing highlight border on target elements
- ✅ Position-aware tooltips (above/below/center)
- ✅ Progress dots showing current step
- ✅ 6-step tutorial flow:
  1. Welcome message (auto-advance 2.5s)
  2. "Tap any green land tile to build" (waits for tap, highlights tile)
  3. "Now select Crops from the menu below" (centered, waits for selection)
  4. Gold display explanation (auto-advance 3s)
  5. Timer explanation (auto-advance 3s)
  6. Completion message (auto-advance 2s)
- ✅ Integrated into App.tsx with tutorial action triggers
- ✅ Tutorial allows building before round starts (for learning)
- ✅ Interactive steps use `pointerEvents="box-none"` to allow taps through
- ✅ Added "Replay Tutorial" button to SettingsScreen
- ✅ Replay immediately starts tutorial and closes settings

**Files Added:**
- `src/hooks/useTutorial.ts` — Tutorial state management and persistence
- `src/components/game/TutorialOverlay.tsx` — Spotlight overlay and tooltips

**Files Modified:**
- `src/components/game/AnimatedBuildMenu.tsx` — Landscape-optimized layout
- `src/components/settings/SettingsScreen.tsx` — Added Help section with Replay Tutorial
- `App.tsx` — Tutorial integration, handleReplayTutorial function

**Known Issues / Future Improvements:**
- Tutorial element positions for spotlight are approximate/hardcoded
- Could add more tutorial steps for boats, score display, etc.

---

### Session 6 (Feb 16-17, 2026)
**Focus: Phase 4 Sound, Phase 6 Ocean Events & Weather System, UI Polish**

**Sound & Audio System (Phase 4):**
- ✅ Created `soundManager.ts` with Expo AV integration
- ✅ Created `useAudioSettings.ts` hook with AsyncStorage persistence
- ✅ Separate music/SFX volume controls with global state
- ✅ Master mute toggle (🔊/🔇 button in header)
- ✅ Music system: menu theme + gameplay theme with state-based switching
- ✅ Sound effects: buttonClick, tileClick, buildPlace, buildError, goldReceive, roundStart, roundEnd, rebelAppear, stabilityAchieved, gameOverWin, gameOverLose, boatFishing, boatSelect, boatMove, boatCrash, rainStorm
- ✅ Fixed music mute/unmute bug

**Settings & Help:**
- ✅ Settings modal with landscape-optimized layout
- ✅ How to Play modal with comprehensive game guide
- ✅ Replay Tutorial button in settings
- ✅ Quit game confirmation dialog

**Fish Schools:**
- ✅ Fish school spawning, movement, visualization
- ✅ Fishing boat gold detection (proximity-based)
- ✅ Fish gold toasts

**Pirate Ships:**
- ✅ Pirate spawning with difficulty scaling
- ✅ Pirate AI: targets unguarded fish schools, avoids PT boats
- ✅ Pirate-fishing boat and PT boat-pirate collisions
- ✅ Land bounce detection

**Boat Movement Overhaul:**
- ✅ Direct waypoint navigation (replaced steering arc system)
- ✅ Landlocked boat spawn prevention via BFS water reachability
- ✅ Boat movement guards (before game, between rounds, after game over)

**Weather System:**
- ✅ Rain clouds: 8-directional, edge-to-edge, position-based crop detection
- ✅ Tropical storms: dark clouds, lightning, building/boat destruction, fort protection
- ✅ Hurricanes: rotating spiral, most destructive, can destroy forts
- ✅ Weather hierarchy: Hurricane > Storm > Rain
- ✅ Storm/hurricane balance tuning

**UI Improvements:**
- ✅ Build menu enlarged to 2-column layout
- ✅ Building info toast on tap
- ✅ Victory screen redesign (landscape two-column layout)

**Files Added:**
- `src/services/soundManager.ts`, `src/hooks/useAudioSettings.ts`
- `src/components/game/FishSchool.tsx`, `PirateShip.tsx`, `StormCloud.tsx`, `HurricaneCloud.tsx`
- `src/components/settings/SettingsScreen.tsx`, `HowToPlay.tsx`

---

### Session 7 (Feb 17, 2026)
**Focus: Phase 4 Audio Completion, Hurricane Fixes**

**Audio System Completion:**
- ✅ Fixed boatFishing sound (was called but not defined)
- ✅ Added thunderCrack SFX for storm/hurricane spawns
- ✅ Added tension music variant (gameTension.mp3) for low score/rebels
- ✅ Added victory/defeat music tracks at game end
- ✅ Music crossfading (1.5s smooth transitions between tracks)
- ✅ Background/foreground audio management (AppState listener)
- ✅ Ocean ambient waves loop during gameplay
- ✅ Population boost sound on growth

**Hurricane Fixes:**
- ✅ Hurricane pause/resume between rounds
- ✅ 3-building destruction cap per hurricane
- ✅ Boat icon water background removal
- ✅ Double-click sound fix

**Weather Pause System:**
- ✅ Rain clouds pause/resume between rounds with cascading animations
- ✅ Storm clouds pause/resume between rounds
- ✅ All weather properly pauses during round transitions

---

### Sessions 8-9 (Feb 17, 2026)
**Focus: EndGame Redesign, Dual Toast System, Hurricane Balance**

**EndGameSummary Wide Landscape Layout:**
- ✅ maxWidth: 800, width: 92%, two-column body in landscape
- ✅ Left column: score breakdown with visual bars
- ✅ Right column: nation stats + building/boat inventory grid
- ✅ Winning values highlighted in green

**Dual Independent Toast System:**
- ✅ Gold/rain toasts: small upper-left, 2s duration, 92% opacity
- ✅ Status/build/info toasts: centered 70% bar, 4s duration, 70% opacity
- ✅ Two independent state channels (no interruption between them)

**Hurricane Balance:**
- ✅ All destruction rates reduced by 10%
- ✅ Building cap reduced to 2 per hurricane appearance

---

### Session 10 (Mar 1, 2026)
**Focus: PNG Icon Art Replacement**

**DALL-E Generated Building Art:**
- ✅ Generated 14 custom PNG icons via DALL-E (all buildings + boats)
- ✅ Front-facing straight-on perspective with transparency
- ✅ Rich painted digital art style replacing hand-coded SVGs
- ✅ Icons: House, Farm, Factory, School, Hospital, Fort, Apartment, Dock, Lighthouse, Granary, Marketplace, Watchtower, Fishing Boat, PT Boat

**Icons.tsx Rewrite:**
- ✅ Replaced 915-line SVG component file with PNG-based Image components
- ✅ Same `({ size }) => JSX` interface — zero changes needed in Island.tsx, AnimatedBuildMenu.tsx, App.tsx, FreeRoamBoat.tsx
- ✅ Icon sizing set to 97% of tile size for near-full coverage
- ✅ ConstructionIcon kept as simple SVG placeholder

**Files Modified:**
- `src/components/game/Icons.tsx` — complete rewrite (SVG → PNG)

**Files Added:**
- `assets/images/*.png` — 14 building/boat icon images

---

## Development Task Backlog

### Phase 1: Core Loop ✅ COMPLETE
- [x] Round state management (round number, active/waiting)
- [x] Countdown timer display
- [x] Start/end round transitions
- [x] Basic round scoring calculation
- [x] Per-round income calculation (factories, fishing, productivity)
- [x] Population growth/decline per round

### Phase 2: Gameplay Features ✅ COMPLETE
- [x] Rain cloud visualization and animation
- [x] Rain triggers farm gold bonus
- [x] Rebel spawning conditions (low score)
- [x] Rebel visualization on tiles
- [x] Fort protection radius
- [x] Rebel removal conditions (high score)
- [x] Four subscore calculation (housing, GDP, food, welfare)
- [x] Score display panel
- [x] End-game summary screen

### Phase 3: UI Improvements ✅ COMPLETE
- [x] Better header layout / resource bars
- [x] Round transition effects (animations)
- [x] Toast notifications with icons
- [x] Collapsible score display
- [ ] Tutorial/help overlay (contextual hints) — deferred to Phase 10

### Phase 4: Sound & Audio System ✅ COMPLETE
**Priority: HIGH**

#### 4.1 Audio Architecture
- [x] Create `src/services/soundManager.ts`
- [x] Expo AV integration for sound playback
- [x] Separate volume controls: Music and Effects
- [x] Mute toggles for music and effects independently
- [x] Persist audio settings to AsyncStorage
- [x] Audio context management (pause on background, resume on foreground)

#### 4.2 Sound Effects Library
**UI Sounds:**
- [x] Button tap/click
- [x] Menu open/close (tileClick)
- [x] Building placed
- [x] Building cannot place (error)
- [x] Gold received (coin chime)

**Gameplay Sounds:**
- [x] Round start fanfare
- [x] Round end chime
- [x] Timer warning (tripleBeep)
- [x] Population increase (popBoost)

**Environmental Sounds:**
- [x] Rain/thunder (thunderCrack on storm/hurricane spawn)
- [x] Ocean waves (ambient loop)

**Boat Sounds:**
- [x] Boat launch/move (boatMove)
- [x] Boat selected (boatSelect)
- [x] Fishing success (boatFishing)
- [x] Boat crash/sink (boatCrash)

**Event Sounds:**
- [x] Rebel appears (warning alarm)
- [x] Rebels cleared (stabilityAchieved)
- [x] Game over win (fanfare)
- [x] Game over lose (somber)

#### 4.3 Music/Soundtrack
- [x] Main menu theme
- [x] Gameplay ambient music (loopable)
- [x] Tense/urgent variant (gameTension — low score or rebels)
- [x] Victory theme (end game, good score)
- [x] Defeat theme (end game, poor score)
- [x] Smooth crossfade between music variants (1.5s)

#### 4.4 Settings UI
- [x] Settings button in header (🔊/🔇 toggle)
- [x] Settings modal/screen with landscape layout
- [x] Music and SFX volume controls
- [x] Master mute toggle
- [x] Persist settings via AsyncStorage
- [x] Audio preview when adjusting sliders

#### Audio Settings File Structure (Planned)
```typescript
// src/config/audioSettings.ts
export interface AudioSettings {
  musicVolume: number;      // 0-100
  effectsVolume: number;    // 0-100
  musicMuted: boolean;
  effectsMuted: boolean;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  musicVolume: 70,
  effectsVolume: 80,
  musicMuted: false,
  effectsMuted: false,
};

export const SOUND_KEYS = {
  // UI
  BUTTON_TAP: 'button_tap',
  MENU_OPEN: 'menu_open',
  MENU_CLOSE: 'menu_close',
  BUILD_PLACE: 'build_place',
  BUILD_ERROR: 'build_error',
  GOLD_SPEND: 'gold_spend',
  GOLD_RECEIVE: 'gold_receive',
  
  // Gameplay
  ROUND_START: 'round_start',
  ROUND_END: 'round_end',
  TIMER_WARNING: 'timer_warning',
  
  // Environment
  RAIN: 'rain',
  WAVES: 'waves_ambient',
  
  // Boats
  BOAT_LAUNCH: 'boat_launch',
  BOAT_MOVE: 'boat_move',
  
  // Events
  REBEL_APPEAR: 'rebel_appear',
  REBELS_CLEARED: 'rebels_cleared',
  GAME_OVER_WIN: 'game_over_win',
  GAME_OVER_LOSE: 'game_over_lose',
  
  // Music
  MUSIC_GAMEPLAY: 'music_gameplay',
  MUSIC_TENSE: 'music_tense',
  MUSIC_VICTORY: 'music_victory',
  MUSIC_DEFEAT: 'music_defeat',
} as const;
```

### Phase 5: Setup Screen ✅ COMPLETE
- [x] Game mode selection (Original vs Enhanced)
- [x] Number of rounds selection (5-30)
- [x] Difficulty selection (Easy/Normal/Hard)
- [x] AI opponent integration
- [x] Start game button

### Phase 6: Animations & Polish ✅ COMPLETE

**Art Assets ✅ COMPLETE**
- [x] DALL-E generated PNG icons for all 14 buildings/boats
- [x] Icons.tsx rewritten from SVG to PNG Image components
- [x] Front-facing perspective with transparency
- [x] PNG preloading via expo-asset at app startup (eliminates build menu draw delay)

**Weather Animations ✅ COMPLETE**
- [x] Rain clouds with cascading droplet animations
- [x] Storm clouds with lightning and heavy rain
- [x] Hurricane with rotating spiral and triple lightning
- [x] Weather pause/resume between rounds

**Ocean Events ✅ COMPLETE**
- [x] Fish school swimming animation
- [x] Pirate ship movement and AI

**Boat Movement ✅ COMPLETE**
- [x] Direct waypoint navigation through water
- [x] BFS water reachability for spawn validation

**Building Animations ✅ COMPLETE**
- [x] Building bounce-in on placement (spring physics, friction:5, tension:180)
- [x] Per-type idle animations via AnimatedBuilding.tsx:
  - House: breathing scale | Farm: sway rotation | Factory: vibrate
  - Hospital: pulse + lift | School: bob | Fort/Watchtower: static
  - Apartment: breathe | Dock: sway | Lighthouse: pulse | Granary: breathe | Marketplace: sway
- [x] Random start delays prevent synchronized animation across buildings
- [x] Factory smoke overlay (3 particles rising from chimney, staggered, looping)
- [x] House chimney smoke overlay (2 smaller gentle wisps)
- [x] Fort flag overlay (red flag on pole, sways +/-12deg, random start delay)

**UI Animations ✅ COMPLETE**
- [x] Gold change flash/pulse (AnimatedResourceBar — scale bounce + floating +/- indicator)
- [x] Score change animation (ScoreDisplay — badge pulse to 1.3x + floating +/- indicator)
- [x] Build menu icons enlarged ~30%, name+cost combined into single row

### Phase 7: AI Opponent
- [ ] Utility-based decision architecture
- [ ] Building placement strategy
- [ ] Boat deployment strategy
- [ ] Sabotage decision logic
- [ ] Difficulty tuning parameters
- [ ] Aggression scaling

### Phase 8: Multiplayer ← ✅ COMPLETE (v0.8.0)

**8A: Firebase Project + Data Model — ✅ COMPLETE**
- [x] Dedicated Firebase project for Eutopia (`eutopia-2f19f`)
- [x] Firebase Realtime DB setup and config
- [x] Game room data structure (room state, player states, round sync)
- [x] Firebase config file (`src/config/firebaseConfig.ts`)
- [x] Service layer (`src/services/multiplayerService.ts`): create/join/listen
- [x] Player identity via AsyncStorage random ID (no auth)

**8B: Lobby UI + Room Flow — ✅ COMPLETE**
- [x] Host/join screen with 6-character room codes
- [x] Waiting room with ready-up
- [x] Name prompt modal for first-time players
- [x] Transition from lobby to game start

**8C: Game State Sync — ✅ COMPLETE**
- [x] 8C.1 — Island layout sync
- [x] 8C.2 — Live player state sync (gold, population, score, boats) @ 500ms
- [x] 8C.3 — Host-authoritative round timer
- [x] 8C.4 — Host-broadcast spawn events (rain, storm, hurricane, pirate)

**8D: Opponent Minimap + Visibility — ✅ COMPLETE**
- [x] `MultiplayerIslandMinimap.tsx` — read-only opponent view
- [x] Tap to expand, live updates, opponent name from room record
- [x] Fog of war on building TYPES (generic marker per occupied tile)

**8E: Disconnect Handling + Polish — ✅ COMPLETE**
- [x] Heartbeat via `PlayerState.updatedAt` (no extra Firebase writes)
- [x] Connection-lost banner + minimap dimming (10s threshold)
- [x] Host pauses/resumes the round, preserving remaining time
- [x] 3-minute forfeit timeout → "Victory by Forfeit" summary
- [x] Host migration guarded on `hostId` to prevent dual hosts
- [x] Auto-rejoin via persisted AsyncStorage session (no room code needed)
- [x] Room code surfaced in expanded minimap as manual fallback
- [x] Tagged v0.8.0

**Backend:** Dedicated Firebase Realtime DB project (not shared with IJBA or other apps)
**Cost model:** Firebase usage offset by between-round advertising revenue
**GitHub:** Commit after each sub-phase

### Phase 9: Enhanced Mode + Sabotage — PLANNED

**Enhanced Mode buildings** (defined in constants, effects not implemented):
- [ ] Apartment, Dock, Lighthouse, Granary, Marketplace, Watchtower effects
- [ ] Fog of war on opponent island
- [ ] PT boat scouting radius reveals fog
- [ ] Multiplayer entitlement: **host's Premium covers the room** — if the host owns
      Premium, both players get Enhanced Mode for that match. Requires an entitlement
      flag in the room record. Chosen over prompting the guest mid-lobby, which would
      paywall someone at the moment they just accepted a friend's invitation.

**Sabotage — buy a rebel and inflict it on your opponent** — ✅ COMPLETE (Aug 2026):
- [x] Spend `REBEL_SPAWN_COST` (30 gold) to send rebels to the opponent's island
- [x] Header button, once per round
- [x] Targeted Firebase channel `rooms/{code}/actions/{targetPlayerId}` — the first
      true cross-player action in the game
- [x] Receiving client applies the rebel locally, respecting fort protection
- [x] AI equivalent in solo play, in both directions
- [x] Shared logic in `src/services/rebels.ts`

**Explicitly declined:** PvP boat combat. Would require a shared grid containing both
islands, high-rate boat position sync with interpolation, and host-authoritative
collision adjudication. Not proceeding.

### Phase 10: Final Polish
- [ ] Contextual tutorial hints
- [ ] Haptic feedback (mobile)
- [ ] Performance optimization
- [x] App icon design
- [x] Splash screen
- [ ] App store assets (screenshots — iPhone + iPad landscape)
- [x] Privacy policy + Terms (tartan-studios.com/eutopia/)
- [x] TestFlight beta (live — build 4, internal testers)
- [ ] App Store submission

---

## Game Balance Constants

Located in `src/constants/game.ts`:

```typescript
BALANCE = {
  startingGold: 100,
  startingPopulation: 1000,
  baseRoundIncome: 5,
  factoryIncome: 8,
  fishingBoatIncome: 4,
  defaultRoundDuration: 45,
  fortRadius: 1,
  rebellionLowScore: 30,
  stabilityHighScore: 70,
  maxPopulation: 9999,
  // ... fertility/mortality rates
}
```

---

## Notes

- No emojis anywhere in the app EXCEPT the title menu bar and ScoreDisplay component
- App title is "Eutopia" — no accented i, no variations
- Mode selection (Original vs Enhanced) will move to setup screen
- PT boat combat mechanics TBD
- Enhanced mode building effects TBD (dock bonus, lighthouse radius, etc.)
- Consider haptic feedback for mobile
- Rain could affect specific tiles visually, not just gold bonus

### SDK 55 Migration Notes — COMPLETE (Session 13, Mar 6 2026)
- SDK 55 migration complete; merged to main; tagged v0.7.0
- expo-av removed and replaced with expo-audio@55.0.0
- IMPORTANT: expo-audio must be pinned to 55.0.0 — later patches (e.g. 55.0.8) have a native JSI arity mismatch with Expo Go SDK 55 (AudioPlayer constructor arg count changed)
- soundManager.ts fully rewritten: createAudioPlayer() replaces Audio.Sound.createAsync(); all async audio methods replaced with sync property setters and method calls
- useAudioSettings.ts required no changes (only uses the Sounds facade)
- setAudioModeAsync property names differ from expo-av: use playsInSilentMode / allowsRecording / shouldPlayInBackground (not the iOS/Android suffixed names)
- createAudioPlayer() loads async — call play() via setTimeout(150ms) for music/ambient, not immediately
- Do not use addListener on AudioPlayer in Expo Go — triggers native JSI arity error
- Island.tsx: overflow:hidden on a View parent of Animated.View with useNativeDriver:true causes parent background to vanish on Android — removed from landTile style
- App.tsx: image preload (expo-asset downloadAsync) fails on Android dev builds due to Metro HTTP delivery — wrapped in separate try/catch, non-blocking
- react-native-reanimated v4 now available (New Architecture only) — can upgrade from built-in Animated API in a future session
- EAS Build profiles confirmed in eas.json (development / development-device / preview / production)
- iOS testing via Expo Go paused — resume once all Tartan Studios apps on SDK 55 and Expo Go updated in App Store

---

*Last Updated: August 31, 2026*

---

## Current Status Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Visual Polish (water, textures, gradients) | ✅ Complete |
| 2 | Enhanced Mode Building Icons | ✅ Complete |
| 2.5 | Gameplay (rain, rebels, scoring, end-game) | ✅ Complete |
| 3 | UI Improvements (header, toasts, transitions) | ✅ Complete |
| 4 | Sound & Audio System | ✅ Complete (expo-audio, SDK 55 compatible) |
| 5 | Setup Screen | ✅ Complete |
| 6 | Animations & Polish | ✅ Complete |
| SDK 55 | Migration + expo-audio | ✅ Complete — v0.7.0 tagged |
| 7 | AI Opponent | 🔶 Basic AI functional, enhancements planned |
| 8 | Multiplayer | ✅ Complete — v0.8.0 tagged |
| — | EAS preview build / iOS verification | ✅ Complete — iOS verified, audio stable |
| — | App Store submission | 🔶 Build 5 rejected (2.5.4, fixed); build 6 in review |
| 9 | Enhanced Mode Features | 🔜 Planned |
| 10 | Final Polish | 🔜 Planned |

**SDK 55 Upgrade Status: COMPLETE**
- Merged to main, tagged v0.7.0
- expo-audio@55.0.0 in use (pinned — do not upgrade without testing against Expo Go)
- Full Android emulator test pass completed (audio, visuals, gameplay, tutorial all verified)
- EAS Build profiles confirmed in eas.json
- iOS testing resumes once all other Tartan Studios apps migrate to SDK 55

**Known Issues:**
- Enhanced mode building effects not yet implemented (Dock, Lighthouse, etc.)
- Tutorial spotlight positions are approximate/hardcoded
- Icon first-render delay on Android dev builds (non-issue in production EAS builds)
- Music occasionally silent on cold emulator boot (play() before native load completes)
- PvP boat combat: considered and **explicitly declined** — see Phase 9 notes

**Recent Highlights:**
- Phase 8 complete and tagged v0.8.0 — full multiplayer
- First successful iOS build; running on TestFlight with internal testers
- iOS-only crash found and fixed: React Native `<Modal>` aborts under landscape lock
- Privacy policy and terms published; App Store listing in progress
- Storm damage capped at 1 building, hurricane at 3 — storms were previously uncapped
- Boat costs rebalanced: fishing 28→15, PT 40→25
- Farm idle sway animation removed (crops no longer rock)
