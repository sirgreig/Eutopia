# Project Tracker: Eutopía

## Project Overview

A mobile game inspired by the 1981 Intellivision classic "Utopia" — widely considered the first god game/city builder. This project aims to honor the original while making it accessible to modern players.

**Title:** Eutopía *(Greek: εὐτοπία, "good place" — the etymological root of "Utopia")*

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
| Crops/Farm | 3 | Food source; generates 1 gold/second ONLY when rained upon |
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

**Animations (implemented via react-native-reanimated in production):**
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

### Tutorial System (Implemented)

**Approach: Interactive 6-Step Guided Tutorial**
- Shows automatically for first-time players (AsyncStorage persistence)
- 6-step flow with spotlight highlights and positioned tooltips:
  1. Welcome message (auto-advance 2.5s)
  2. "Tap any green land tile" — spotlight on center tile, waits for tap
  3. "Select Crops" — spotlight on Crops button, waits for selection
  4. Gold display explanation (auto-advance 3s)
  5. Timer explanation (auto-advance 3s)
  6. Completion message (auto-advance 2s)
- Interactive steps allow taps through overlay (pointerEvents="box-none")
- Tutorial allows building before round starts (special case for learning)
- "Skip Tutorial" button available on every step
- "Replay Tutorial" available in Settings → Help section
- Progress dots show current step position

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

Eutopía uses a **freemium model** with four non-intrusive revenue streams designed to respect the player experience while supporting development.

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
- Non-intrusive prompt: "Enjoying Eutopía? Remove ads for $2.99"

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
- **Message:** "Eutopía is a passion project. Tips help keep it updated!"
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
- ✅ **Game name: Eutopía**
- ✅ Visual style: Retro-modern (geometric, clean edges, cohesive palette)
- ✅ Boat controls: Tap-tap (select then destination)
- ✅ Building menu: Contextual popup on tile tap
- ✅ Enhanced mode buildings: Apartment, Dock, Lighthouse, Granary, Marketplace, Watchtower
- ✅ Tutorial: Contextual first-time hints (non-intrusive)

### Still Open

**Technical (to determine during implementation):**
1. Exact PT boat scouting radius (depends on island generation bounds)
2. Enhanced building balance values (playtesting)
3. State sync protocol for multiplayer (delta vs full state)

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

### NPM Dependencies (Required)
```
expo
expo-av                              # Audio playback (music + SFX)
expo-status-bar
react-native
react-native-svg                     # SVG icons for buildings/boats
@react-native-async-storage/async-storage  # Settings + tutorial persistence
react-native-google-mobile-ads       # AdMob (configured, not yet active)
```

### EAS Build Configuration
- Development profile: Internal distribution, development client
- Production profile: App Store submission
- Bundle ID (iOS): `com.tartanstudios.eutopia`

---

## File Structure

```
C:\Dev\Eutopia\
├── App.tsx                          # Main game component
├── docs/
│   └── project-tracker.md           # This file
├── assets/
│   └── audio/
│       ├── button_click.mp3
│       ├── tile_click.mp3
│       ├── boat_select.mp3
│       ├── boat_move.mp3
│       ├── buildPlace.mp3
│       ├── buildError.mp3
│       ├── roundStart.mp3
│       ├── roundEnd.mp3
│       ├── goldReceive.mp3
│       ├── rebelAppear.mp3
│       ├── stabilityAchieved.mp3
│       ├── gameOverWin.mp3
│       ├── gameOverLose.mp3
│       ├── _rainStorm.mp3
│       └── tripleBeep.mp3
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── AIIslandMinimap.tsx  # AI opponent minimap with popup detail
│   │   │   ├── AnimatedBuildMenu.tsx # Build menu (landscape-responsive)
│   │   │   ├── AnimatedResourceBar.tsx # Animated resource display
│   │   │   ├── EndGameSummary.tsx   # Game over screen with AI comparison
│   │   │   ├── FreeRoamBoat.tsx     # Boat rendering + destination marker
│   │   │   ├── Icons.tsx            # All SVG building/boat icons (14 icons)
│   │   │   ├── Island.tsx           # Map renderer with animated tiles
│   │   │   ├── RainCloud.tsx        # Animated rain cloud (8-directional)
│   │   │   ├── RebelIcon.tsx        # Rebel warning icon (pulsing)
│   │   │   ├── RoundTransition.tsx  # Round start/end transition animation
│   │   │   ├── ScoreDisplay.tsx     # Collapsible score breakdown panel
│   │   │   ├── Toast.tsx            # Toast notifications with icons
│   │   │   └── TutorialOverlay.tsx  # Tutorial spotlight overlay and tooltips
│   │   ├── settings/
│   │   │   └── SettingsScreen.tsx   # Settings modal (landscape-responsive)
│   │   └── setup/
│   │       └── SetupScreen.tsx      # Pre-game setup (mode, rounds, difficulty)
│   ├── constants/
│   │   └── game.ts                  # Balance values, building costs
│   ├── hooks/
│   │   ├── useAds.ts               # Ad integration hook
│   │   ├── useAIOpponent.ts        # AI opponent logic hook
│   │   ├── useAudioSettings.ts     # Audio settings persistence hook
│   │   └── useTutorial.ts          # Tutorial state management hook
│   ├── services/
│   │   ├── adService.ts            # AdMob service with Expo Go fallback
│   │   ├── boatMovement.ts         # Boat pathfinding and movement
│   │   ├── coastlineDetection.ts   # Coastline generation for boats
│   │   ├── islandGenerator.ts      # Island shape generation
│   │   └── soundManager.ts         # Sound playback service (15 effects + music)
│   └── types/
│       └── index.ts                 # TypeScript definitions
├── app.json                         # Expo config with AdMob, bundle IDs
├── eas.json                         # EAS Build profiles
├── GoogleService-Info.plist         # Firebase config (iOS) - parked
└── PORTFOLIO_OVERVIEW.md            # Tartan Studios portfolio document
```

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

### Session 6 (Feb 16, 2026)
**Completed:**

**Bug Fixes & Gameplay Polish:**
- ✅ Fixed tutorial "Select Crops" step — tooltip no longer covers the Crops button
  - Changed step target from `'none'` (center) to `'building_crops'` (positioned above)
  - Updated tooltip top-position offset for proper clearance (~170px)
- ✅ Fixed "can build before game starts" — confirmed resolved (guard at round === 0)

**Rain Cloud System Overhaul:**
- ✅ 8-directional cloud movement (L→R, R→L, T→B, B→T, + 4 diagonals)
- ✅ Slight angle variation on paths so clouds don't travel perfectly straight
- ✅ Full edge-to-edge traversal — clouds enter and exit off-screen (no mid-screen vanish)
- ✅ Speed tuned to 25px/s with 10s–60s duration range
- ✅ Position-based crop watering — gold only awarded when cloud bounding box overlaps crop tiles
- ✅ Rain sound moved from cloud spawn to gold earning (plays only when watering crops)
- ✅ RainCloud component rewritten with dual-axis animation (`startX/Y` → `endX/Y`)

**Settings Screen Landscape Layout:**
- ✅ Two-column layout for Music/Sound Effects in landscape
- ✅ Compact sizing — smaller padding, fonts, sliders, toggles
- ✅ Help section inline (label + button on one row)
- ✅ ScrollView for overflow safety
- ✅ Dynamic maxHeight constrained to screen height
- ✅ Header close button (✕) added

**Files Modified:**
- `App.tsx` — Rain system rewrite (state, spawning, gold detection)
- `src/components/game/RainCloud.tsx` — Bidirectional movement props
- `src/components/game/TutorialOverlay.tsx` — Tooltip positioning fix
- `src/hooks/useTutorial.ts` — Step targeting fix
- `src/components/settings/SettingsScreen.tsx` — Landscape layout

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
- [x] Tutorial/help overlay (contextual hints) — implemented Session 5

### Phase 4: Sound & Audio System ✅ COMPLETE (MVP)
**Priority: HIGH**

#### 4.1 Audio Architecture
- [x] Create `src/services/soundManager.ts`
- [x] Expo AV integration for sound playback
- [x] Separate volume controls: Music, Effects
- [x] Mute toggles for music and effects independently
- [x] Persist audio settings to AsyncStorage
- [x] Audio context management (pause on background, resume on foreground)

#### 4.2 Sound Effects Library
**UI Sounds:**
- [x] Button tap/click
- [x] Building placed
- [x] Building cannot place (error)
- [x] Gold received (coin chime)

**Gameplay Sounds:**
- [x] Round start fanfare
- [x] Round end chime
- [x] Triple beep (timer warning)

**Environmental Sounds:**
- [x] Rain/thunder (when cloud waters crops)

**Boat Sounds:**
- [x] Boat moving (water swoosh)
- [x] Boat selected
- [x] Tile click

**Event Sounds:**
- [x] Rebel appears (warning alarm)
- [x] Stability achieved (relief chime)
- [x] Game over win (fanfare)
- [x] Game over lose (somber)

**Not yet implemented:**
- [ ] Menu open/close
- [ ] Gold spent (coin sound)
- [ ] Timer tick (last 5 seconds)
- [ ] Population increase/decrease
- [ ] Ocean waves (ambient loop)
- [ ] Seagulls (occasional ambient)
- [ ] Boat launch splash
- [ ] Fishing success (optional)
- [ ] Achievement/milestone (optional)

#### 4.3 Music/Soundtrack
- [x] Menu music loop
- [x] Gameplay music loop
- [x] Music switching based on game state (menu ↔ gameplay)
- [ ] Peaceful/prosperity variant (high score)
- [ ] Tense/urgent variant (low score or rebels)
- [ ] Victory theme (end game, good score)
- [ ] Defeat theme (end game, poor score)
- [ ] Smooth crossfade between music variants

#### 4.4 Settings UI
- [x] Settings button in header
- [x] Settings modal/screen
- [x] Music volume slider (0-100) with +/- buttons
- [x] Effects volume slider (0-100) with +/- buttons
- [x] Music mute toggle
- [x] Effects mute toggle
- [x] Master audio toggle in header (🔊/🔇)
- [x] Landscape-responsive two-column layout
- [x] Save/Apply settings (AsyncStorage persistence)
- [ ] Audio preview when adjusting sliders

#### Audio Settings (Implemented)
```typescript
// src/hooks/useAudioSettings.ts
export interface AudioSettings {
  musicVolume: number;      // 0-1
  sfxVolume: number;        // 0-1
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

// src/services/soundManager.ts
// 15 sound effects loaded via require()
// SoundEffect type: buttonClick, tileClick, boatSelect, boatMove,
//   buildPlace, buildError, roundStart, roundEnd, goldReceive,
//   rebelAppear, stabilityAchieved, gameOverWin, gameOverLose,
//   rainStorm, tripleBeep
// Music tracks: menu, gameplay
```

### Phase 5: Setup Screen ✅ COMPLETE
- [x] Game mode selection (Original vs Enhanced)
- [x] Number of rounds selection (15-30)
- [x] Round duration selection (45-120 seconds)
- [x] Difficulty selection (affects AI)
- [x] Sound settings access (gear icon → Settings modal)
- [ ] Island seed input (optional)
- [x] Start game button

### Phase 6: Ocean Events & Hazards ← NEXT
**Priority: HIGH — Core Utopia mechanics not yet implemented**

These four features complete the original Utopia gameplay loop. They add real-time threats and economic depth that make strategic decisions meaningful (boat placement, fort coverage, PT boat investment).

#### 6.1 Fish Schools
**Purpose:** Give fishing boats their actual gameplay role — real-time positional income.

**Behavior:**
- Fish schools are visible clusters that spawn in random water tiles
- 2–4 fish schools active at any time during a round
- Fish schools drift slowly in random directions (similar speed to rain clouds)
- When a school reaches a screen edge, it wraps or respawns at a new random water position
- Fish schools persist across the full round (don't despawn until round ends)
- At round start, new schools spawn at random water positions

**Income mechanic:**
- Fishing boats earn **1 gold per second** while their bounding box overlaps a fish school
- Uses same position-based overlap detection as rain/crop system
- Toast notification on first overlap: "+1g fishing" (then suppress repeats to avoid spam)
- Gold accumulates in real-time (not just at round end)

**Visual:**
- Small animated cluster of 3–4 fish shapes (SVG)
- Gentle swimming/bobbing animation
- Slightly transparent so they don't obscure water tiles
- Size: ~1.5 tiles wide

**Technical approach:**
- New `FishSchool` component (SVG + Animated position)
- Array of fish school state in App.tsx: `{ id, position: WaterPosition, velocity }`
- Position update in existing boat game loop (requestAnimationFrame)
- Overlap detection interval (every 1s, like rain gold)
- New sound effect: `fishingSuccess` (subtle coin/splash)

**Balance constants to add:**
```typescript
fishSchoolCount: 3,          // Active schools per round
fishSchoolSpeed: 8,          // pixels/second drift
fishingGoldPerSecond: 1,     // Gold per boat per overlapping second
fishSchoolSize: 1.5,         // Multiplier of tileSize
```

---

#### 6.2 Pirate Ships
**Purpose:** Threaten fishing boats, give PT boats their defensive role.

**Behavior:**
- Pirates spawn randomly at screen edges during rounds
- Spawn rate: ~15% chance every 8 seconds (scales with difficulty)
- Pirates navigate toward the nearest fish school (where fishing boats likely are)
- Pirates never intentionally sail toward parked PT boats (original behavior)
- Max 2 pirates active at once

**Combat:**
- If a pirate overlaps a fishing boat → fishing boat is destroyed
  - Fishing boat removed from `freeRoamBoats`
  - Toast: "Pirates sank your fishing boat!" + population casualties (0–50 random)
  - Sound effect: `pirateSink`
- If a pirate overlaps a PT boat → pirate is destroyed
  - Toast: "PT boat sank the pirates!"
  - Sound effect: `pirateSink`
- Pirates ignore buildings on land (water-only threat)

**Visual:**
- Dark-hulled boat with skull flag (SVG, distinct from player boats)
- Slightly larger than fishing boats
- Red-tinted or dark color scheme for threat clarity

**Fort protection:**
- Boats parked within fort radius (1 tile from coast) are immune to pirate attack
- Pirates will path around fort-protected zones

**Technical approach:**
- New `PirateShip` component (SVG)
- Pirate state array: `{ id, position: WaterPosition, velocity, targetFishSchool }`
- AI pathfinding: move toward nearest fish school, avoid PT boats
- Collision detection in boat game loop
- Spawn timer effect similar to rain spawn

**Balance constants to add:**
```typescript
pirateSpawnChance: 0.15,     // Per check
pirateSpawnInterval: 8000,   // ms between spawn checks
pirateSpeed: 20,             // pixels/second
pirateMaxActive: 2,
pirateCasualties: { min: 0, max: 50 },
```

**Difficulty scaling:**
| Difficulty | Spawn Chance | Max Active | Speed |
|------------|-------------|------------|-------|
| Easy       | 10%         | 1          | 15 px/s |
| Normal     | 15%         | 2          | 20 px/s |
| Hard       | 25%         | 3          | 25 px/s |

---

#### 6.3 Tropical Storm Clouds
**Purpose:** Dangerous weather that can destroy buildings and boats.

**Behavior:**
- Same 8-directional movement as rain clouds (reuse existing system)
- Darker visual appearance (black/dark gray vs rain cloud gray)
- Spawn rate: ~10% chance every 8 seconds during rounds (less frequent than rain)
- Travels edge-to-edge at same speed as rain clouds
- Can water crops AND destroy things (dual effect, matching original)

**Destruction mechanic:**
- As storm passes over each tile, **15% chance** to destroy the building on that tile
- Check runs every 1 second (same interval as rain gold detection)
- Each building is only checked once per storm pass (track which tiles have been checked)
- Destroyed building is removed, tile becomes empty
- Population casualties: 0–101 random per destroyed building (original spec)
- Moving boats in storm path: **20% chance** to be sunk
- Anchored/parked boats near forts: immune to storm damage

**Fort protection:**
- Buildings within fort radius are immune to storm destruction
- Same radius check as rebel protection

**Visual:**
- Reuse `RainCloud` component with different color props
- Dark cloud body: `#37474f` / `#263238` (vs rain's `#78909c`)
- Lightning flash effect: brief white opacity pulse every 2–3 seconds
- Rain drops tinted slightly darker

**Sound:**
- New sound effect: `stormThunder` (deeper/louder than rain)
- Plays on spawn (threat warning) AND during destruction events

**Technical approach:**
- New `StormCloud` component extending RainCloud with color variant + lightning
- Storm state in App.tsx (similar shape to rainCloud state, with `checkedTiles` Set)
- Storm overlap detection similar to rain, but checks buildings + boats for destruction
- Fort radius protection check (reuse rebel fort logic)

**Balance constants to add:**
```typescript
stormSpawnChance: 0.10,
stormSpawnInterval: 8000,
stormBuildingDestroyChance: 0.15,
stormBoatSinkChance: 0.20,
stormCasualties: { min: 0, max: 101 },
```

---

#### 6.4 Hurricanes
**Purpose:** Rare, high-threat weather event. Most destructive force in the game.

**Behavior:**
- Rare spawn: ~5% chance every 12 seconds
- Max 1 hurricane active at a time
- Slower movement than storms (15 px/s vs 25 px/s for rain/storms)
- Wider damage radius (~3 tiles vs storm's ~1.5 tiles)
- 5× more destructive than tropical storms (original spec)
- Sinks ALL moving boats in path (fishing AND PT boats)
- Anchored boats near forts may survive (50% chance)

**Destruction mechanic:**
- **67% chance** (2/3) to destroy any building in path (original spec)
- **90% chance** to sink moving boats in path
- **50% chance** to sink anchored boats (unless fort-protected → 15%)
- Population casualties: 0–101 per destroyed structure
- Checks every 1 second like storms, wider detection radius

**Visual:**
- Spiraling animation (rotating cloud mass)
- Larger than storm clouds (~3× tile size)
- Very dark center with lighter swirling arms
- Could use `Animated` rotation on the SVG group
- Optional: screen shake or vignette effect during hurricane

**Sound:**
- New sound effect: `hurricaneWind` (sustained howling, louder than storm)
- Plays continuously while hurricane is on screen

**Technical approach:**
- New `Hurricane` component with rotating SVG animation
- Larger bounding box for damage detection
- Same position-tracking system as rain/storm
- Screen-wide visual cue (dark overlay tint) when hurricane is active

**Balance constants to add:**
```typescript
hurricaneSpawnChance: 0.05,
hurricaneSpawnInterval: 12000,
hurricaneBuildingDestroyChance: 0.67,
hurricaneBoatSinkChance: 0.90,
hurricaneAnchoredBoatSinkChance: 0.50,
hurricaneFortProtectedSinkChance: 0.15,
hurricaneSpeed: 15,
hurricaneDamageRadius: 3,    // tile multiplier
hurricaneCasualties: { min: 0, max: 101 },
```

---

#### 6.5 New Sound Effects Needed
| Sound | Used By | Description |
|-------|---------|-------------|
| `fishingSuccess` | Fish schools | Subtle coin/splash when earning |
| `pirateSink` | Pirates | Ship sinking/combat sound |
| `pirateSpawn` | Pirates | Ominous horn or alarm |
| `stormThunder` | Tropical storms | Thunder crack |
| `hurricaneWind` | Hurricanes | Sustained wind howl |
| `buildingDestroyed` | Storms/hurricanes | Crash/crumble |
| `boatSunk` | Storms/hurricanes/pirates | Splash/sinking |

#### 6.6 Implementation Order Within Phase
1. Fish schools (foundation — economic loop)
2. Pirate ships (threat to fish economy — gives PT boats purpose)
3. Tropical storms (weather threat — extends existing rain system)
4. Hurricanes (rare catastrophic event — final layer)

Each sub-phase is independently playable and testable.

### Phase 7: Animations & Polish
**Boat Animations**
- [ ] Pathfinding through water tiles (BFS)
- [ ] Tile-by-tile animated movement (react-native-reanimated)
- [ ] Movement speed (0.5 sec/tile)
- [ ] Interruptible movement

**Building Animations**
- [ ] Factory smoke rising and fading
- [ ] House chimney smoke wisps
- [ ] School bell swinging
- [ ] Fort flag waving
- [ ] Hospital cross pulse
- [ ] Farm crops swaying
- [ ] Fish school swimming

**Weather Animations**
- [ ] Storm clouds moving
- [ ] Lightning flashes
- [ ] Hurricane effects

**UI Animations**
- [ ] Build menu slide in/out
- [ ] Gold change flash
- [ ] Score change animation

### Phase 8: AI Opponent ✅ COMPLETE
- [x] Utility-based decision architecture
- [x] Building placement strategy
- [x] Boat deployment strategy
- [x] Difficulty tuning parameters (easy/normal/hard)
- [x] AI minimap with score, gold, population display
- [x] AI round-end processing
- [x] End-game score comparison (player vs AI)
- [ ] Sabotage decision logic (spawn rebel on player)
- [ ] Aggression scaling

### Phase 9: Multiplayer
- [ ] Room-based lobby (leverage existing IJBA infra)
- [ ] WebSocket state sync
- [ ] Opponent island minimap
- [ ] Ready-up flow between rounds
- [ ] Disconnect handling (3-min forfeit)
- [ ] Reconnection support

### Phase 10: Enhanced Mode Features
- [ ] Fog of war rendering
- [ ] PT boat scouting radius reveal
- [ ] Watchtower reveal mechanics
- [ ] Revealed tiles stay revealed
- [ ] Enhanced building implementations:
  - [ ] Apartment (3× housing, -1 welfare)
  - [ ] Dock (+50% adjacent fishing income)
  - [ ] Lighthouse (PT radius boost, storm resistance)
  - [ ] Granary (food surplus storage)
  - [ ] Marketplace (food→gold conversion)
  - [ ] Watchtower (stationary scouting)

### Phase 11: Final Polish
- [ ] Contextual tutorial hints
- [ ] Haptic feedback (mobile)
- [ ] Performance optimization
- [ ] App icon design
- [ ] Splash screen
- [ ] App store assets
- [ ] Privacy policy
- [ ] TestFlight / Play Store beta

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

- Mode selection (Original vs Enhanced) will move to setup screen
- PT boat combat mechanics TBD
- Enhanced mode building effects TBD (dock bonus, lighthouse radius, etc.)
- Consider haptic feedback for mobile
- Rain could affect specific tiles visually, not just gold bonus

---

*Last Updated: Session 6 (Feb 16, 2026)*

---

## Current Status Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Visual Polish (water, textures, gradients) | ✅ Complete |
| 2 | Enhanced Mode Building Icons | ✅ Complete |
| 2.5 | Gameplay (rain, rebels, scoring, end-game) | ✅ Complete |
| 3 | UI Improvements (header, toasts, transitions, tutorial) | ✅ Complete |
| 4 | Sound & Audio System | ✅ Complete (MVP) |
| 5 | Setup Screen | ✅ Complete |
| **6** | **Ocean Events & Hazards (fish, pirates, storms, hurricanes)** | **⏳ Next** |
| 7 | Animations & Polish | 🔜 Planned |
| 8 | AI Opponent | ✅ Complete (MVP) |
| 9 | Multiplayer | 🔜 Planned |
| 10 | Enhanced Mode Features | 🔜 Planned |
| 11 | Final Polish | 🔜 Planned |

**Known Issues:**
- PT boat combat not yet implemented
- Enhanced mode building effects not yet implemented
- AI sabotage (spawn rebel on player) not yet implemented
- Rain cloud crop detection slightly generous at tile edges (bounding box overlap)
- Tutorial spotlight positions are approximate/hardcoded
- AdMob configured but not yet integrated into gameplay (needs TestFlight testing)
- Firebase project created but parked (not integrated)
