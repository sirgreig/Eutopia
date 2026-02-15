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
├── App.tsx                          # Main game component
├── docs/
│   └── project-tracker.md           # This file
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── Icons.tsx            # All SVG building/boat icons (14 icons)
│   │   │   ├── Island.tsx           # Map renderer with animated tiles
│   │   │   ├── RainCloud.tsx        # Animated rain cloud
│   │   │   ├── RebelIcon.tsx        # Rebel warning icon (pulsing)
│   │   │   ├── ScoreDisplay.tsx     # Score breakdown panel
│   │   │   └── EndGameSummary.tsx   # Game over screen
│   │   └── index.ts
│   ├── config/
│   │   └── audioSettings.ts         # [PLANNED] Audio settings layout
│   ├── constants/
│   │   └── game.ts                  # Balance values, building costs
│   ├── services/
│   │   ├── islandGenerator.ts       # Island shape generation
│   │   └── audioManager.ts          # [PLANNED] Sound playback service
│   ├── state/
│   │   └── gameStore.ts             # Game state (Zustand)
│   └── types/
│       └── index.ts                 # TypeScript definitions
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

### Phase 4: Sound & Audio System ← NEXT
**Priority: HIGH**

#### 4.1 Audio Architecture
- [ ] Create `src/services/audioManager.ts`
- [ ] Create `src/config/audioSettings.ts` (settings layout file)
- [ ] Expo AV integration for sound playback
- [ ] Separate volume controls: Music (0-100), Effects (0-100)
- [ ] Mute toggles for music and effects independently
- [ ] Persist audio settings to AsyncStorage
- [ ] Audio context management (pause on background, resume on foreground)

#### 4.2 Sound Effects Library
**UI Sounds:**
- [ ] Button tap/click
- [ ] Menu open/close
- [ ] Building placed
- [ ] Building cannot place (error)
- [ ] Gold spent (coin sound)
- [ ] Gold received (coin chime)

**Gameplay Sounds:**
- [ ] Round start fanfare
- [ ] Round end chime
- [ ] Timer warning (last 10 seconds)
- [ ] Timer tick (optional, last 5 seconds)
- [ ] Population increase
- [ ] Population decrease

**Environmental Sounds:**
- [ ] Rain/thunder (when cloud passes)
- [ ] Ocean waves (ambient loop)
- [ ] Seagulls (occasional ambient)

**Boat Sounds:**
- [ ] Boat launch splash
- [ ] Boat moving (water swoosh)
- [ ] Boat selected
- [ ] Fishing success (optional)

**Event Sounds:**
- [ ] Rebel appears (warning alarm)
- [ ] Rebels cleared (relief chime)
- [ ] Game over (fanfare or somber based on score)
- [ ] Achievement/milestone (optional)

#### 4.3 Music/Soundtrack
- [ ] Main menu theme (if menu screen added)
- [ ] Gameplay ambient music (loopable, 2-3 minutes)
- [ ] Peaceful/prosperity variant (high score)
- [ ] Tense/urgent variant (low score or rebels)
- [ ] Victory theme (end game, good score)
- [ ] Defeat theme (end game, poor score)
- [ ] Smooth crossfade between music variants

#### 4.4 Settings UI
- [ ] Settings button in header or menu
- [ ] Settings modal/screen
- [ ] Music volume slider (0-100)
- [ ] Effects volume slider (0-100)
- [ ] Music mute toggle
- [ ] Effects mute toggle
- [ ] Master mute toggle (optional)
- [ ] Audio preview when adjusting sliders
- [ ] Save/Apply settings

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

### Phase 5: Setup Screen
- [ ] Game mode selection (Original vs Enhanced)
- [ ] Number of rounds selection (15-30)
- [ ] Round duration selection (45-120 seconds)
- [ ] Difficulty selection (affects AI)
- [ ] Sound settings access
- [ ] Island seed input (optional)
- [ ] Start game button

### Phase 6: Animations & Polish
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

### Phase 7: AI Opponent
- [ ] Utility-based decision architecture
- [ ] Building placement strategy
- [ ] Boat deployment strategy
- [ ] Sabotage decision logic
- [ ] Difficulty tuning parameters
- [ ] Aggression scaling

### Phase 8: Multiplayer
- [ ] Room-based lobby (leverage existing IJBA infra)
- [ ] WebSocket state sync
- [ ] Opponent island minimap
- [ ] Ready-up flow between rounds
- [ ] Disconnect handling (3-min forfeit)
- [ ] Reconnection support

### Phase 9: Enhanced Mode Features
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

### Phase 10: Final Polish
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

*Last Updated: Session 4 (Jan 13, 2026)*

---

## Current Status Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Visual Polish (water, textures, gradients) | ✅ Complete |
| 2 | Enhanced Mode Building Icons | ✅ Complete |
| 2.5 | Gameplay (rain, rebels, scoring, end-game) | ✅ Complete |
| 3 | UI Improvements (header, toasts, transitions) | ✅ Complete |
| 4 | Sound & Audio System | ⏳ Next |
| 5 | Setup Screen | 🔜 Planned |
| 6 | Animations & Polish | 🔜 Planned |
| 7 | AI Opponent | 🔜 Planned |
| 8 | Multiplayer | 🔜 Planned |
| 9 | Enhanced Mode Features | 🔜 Planned |
| 10 | Final Polish | 🔜 Planned |

**Known Issues:**
- Can build before game starts (should require round > 0 && isRoundActive)
- PT boat combat not yet implemented
- Enhanced mode building effects not yet implemented
