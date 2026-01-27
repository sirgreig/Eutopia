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

---

## Development Phases

### Phase 1: Visual Polish ✅ COMPLETE
- [x] Animated water tiles with wave effect
- [x] Gradient-based terrain (sand beach around coastline)
- [x] Improved island edges and tile rendering
- [x] Rain cloud with CSS-style animation
- [x] Score display component

### Phase 2: Enhanced Building Icons ✅ COMPLETE
- [x] Custom SVG icons for all original buildings
- [x] Enhanced mode building icons (Apartment, Dock, Lighthouse, etc.)
- [x] Fishing boat and PT boat icons
- [x] Construction placeholder icon
- [x] Proper sizing and color schemes

### Phase 2.5: Gameplay Features ✅ COMPLETE
- [x] Rain cloud animation and farm gold bonus
- [x] Rebel spawning based on low score
- [x] Rebel clearing based on high score
- [x] End-game summary screen with stats
- [x] Score breakdown calculation

### Phase 3: UI Improvements ✅ COMPLETE
- [x] Header with timer, gold, population, score
- [x] Toast notification system
- [x] Round transition animations
- [x] Resource bar component
- [x] Build menu popup

### Phase 4: Sound & Audio System ✅ COMPLETE

#### 4.1 Audio Architecture ✅
- [x] Sound manager service (soundManager.ts)
- [x] Audio settings hook (useAudioSettings.ts)
- [x] Separate music and SFX volume controls
- [x] Mute toggles for music and effects independently
- [x] Persist audio settings to AsyncStorage
- [x] Quick mute button in header (🔊/🔇)

#### 4.2 Sound Effects ✅
**UI Sounds:**
- [x] Button tap/click (button_click.mp3)
- [x] Tile tap (tile_click.mp3)
- [x] Building placed (buildPlace.mp3)
- [x] Building error (buildError.mp3)
- [x] Gold received (goldReceive.mp3)

**Gameplay Sounds:**
- [x] Round start (roundStart.mp3)
- [x] Round end (roundEnd.mp3)
- [x] Rebel appears (rebelAppear.mp3)
- [x] Stability achieved (stabilityAchieved.mp3)
- [x] Game over win (gameOverWin.mp3)
- [x] Game over lose (gameOverLose.mp3)

**Boat Sounds:**
- [x] Boat selected (boat_select.mp3)
- [x] Boat moved (boat_move.mp3)

**Environmental:**
- [x] Rain storm (_rainStorm.mp3)

#### 4.3 Music System ✅
- [x] Menu/intermission music (game_score1.mp3) - plays before start, between rounds
- [x] Gameplay music (gamePlay1.mp3) - plays during active rounds
- [x] Automatic track switching based on game state
- [x] Separate music volume control

#### 4.4 Settings UI ✅
- [x] Settings button (⚙️) in header
- [x] Settings overlay (non-modal, avoids crash issues)
- [x] Music ON/OFF toggle + volume control
- [x] Sound Effects ON/OFF toggle + volume control
- [x] Custom +/- slider buttons (avoid native slider crash)
- [x] Settings persist across sessions

**Audio Files in assets/audio/:**
```
button_click.mp3, tile_click.mp3, boat_select.mp3, boat_move.mp3,
buildPlace.mp3, buildError.mp3, roundStart.mp3, roundEnd.mp3,
goldReceive.mp3, rebelAppear.mp3, stabilityAchieved.mp3,
gameOverWin.mp3, gameOverLose.mp3, _rainStorm.mp3, tripleBeep.mp3,
game_score1.mp3, gamePlay1.mp3
```

**Technical Notes:**
- Uses expo-av (deprecated in SDK 54, but functional)
- Avoided @react-native-community/slider (caused crashes)
- Avoided Modal component (caused crashes)
- Settings screen uses absolute positioned View overlay

### Phase 5: Setup Screen ✅ COMPLETE
- [x] Game mode selection (Original vs Enhanced)
- [x] Number of rounds selection (5-30)
- [x] Round duration selection (30-120 seconds)
- [x] Difficulty selection (affects AI)
- [x] Sound settings access
- [x] Start game button
- [x] Return to setup from game (with confirmation)
- [x] Estimated game time display

### Phase 6: Animations & Polish ✅ COMPLETE

**Boat Animations**
- [x] Pathfinding through water tiles (BFS algorithm)
- [x] Tile-by-tile animated movement (React Native Animated API)
- [x] Movement speed (400ms per tile)
- [x] Gentle bobbing animation while idle
- [x] Path completion callbacks
- [x] "No path" error when destination unreachable

**Building Icons (Static SVG)**
- [x] Detailed SVG icons with smoke, flags, etc.
- [x] House with chimney smoke wisps
- [x] Factory with smoke stacks and gear
- [x] Farm with crop rows and grain heads
- [x] School with bell tower and clock
- [x] Fort with waving flag and portcullis
- [x] Hospital with red cross
- Note: SMIL animations (`<animate>`, `<animateTransform>`) not supported in react-native-svg

**UI Animations**
- [x] Build menu slide in/out (React Native Animated API)
- [x] Build menu backdrop fade
- [x] Gold/Population/Score flash effect on change
- [x] Resource value change indicators (+/- floating up)
- [x] Fixed build menu layout for wide screens (fixed 70px item width)

**Header UX**
- [x] Reset map button (↻) only visible before game starts (round === 0)

**New Files:**
- `src/services/boatPathfinding.ts` - BFS pathfinding
- `src/components/game/AnimatedIcons.tsx` - Detailed static building SVGs
- `src/components/game/AnimatedBoat.tsx` - Boat with path animation
- `src/components/game/AnimatedBuildMenu.tsx` - Sliding build menu
- `src/components/game/AnimatedResourceBar.tsx` - Flash effects
- `src/components/game/Island.tsx` - Updated with building icons

**Technical Notes:**
- SVG SMIL animations don't work in React Native SVG (web-only feature)
- For future animated buildings, would need react-native-reanimated with SVG transforms
- Build menu uses fixed pixel widths to prevent oversizing on wide screens

### Phase 7: AI Opponent ✅ COMPLETE

**AI Decision Architecture**
- [x] Utility-based decision system (evaluates score for each action)
- [x] Game phase awareness (early/mid/late game priorities)
- [x] Score breakdown analysis (housing, food, welfare, GDP deficiencies)
- [x] Building synergy detection (factory + school/hospital combos)

**Building Placement Strategy**
- [x] Priority scoring based on current needs
- [x] Farm/House priority early game for food and housing scores
- [x] Factory priority mid-game when income needed
- [x] Hospital/School for welfare score
- [x] Fort placement near rebels or preventatively

**Boat Deployment Strategy**
- [x] Fishing boat deployment for food and income
- [x] PT boat deployment based on aggression level
- [x] Coastal tile detection for boat spawning

**Difficulty Settings**
- [x] Easy: 3s decisions, 60% build chance, 50% optimal choice, 80% income
- [x] Normal: 2s decisions, 75% build chance, 75% optimal choice, 100% income
- [x] Hard: 1.5s decisions, 90% build chance, 95% optimal choice, 120% income

**Aggression System**
- [x] Base PT aggression per difficulty
- [x] Aggression scaling per round (+2-5% per round)
- [x] PT boat targeting player fishing boats
- [x] Patrol near player island waters

**AI State Management**
- [x] Separate island generation for AI
- [x] Independent gold, population, score tracking
- [x] Round-end income/population/score calculation
- [x] Same formulas as player for fairness

**UI Components**
- [x] AI Island Minimap (tap to expand)
- [x] Real-time AI stats display (score, gold, population)
- [x] Difficulty badge indicator
- [x] Last action display
- [x] Expanded view with legend

**New Files:**
- `src/services/aiOpponent.ts` - AI decision engine and utilities
- `src/hooks/useAIOpponent.ts` - React hook for AI state management
- `src/components/game/AIIslandMinimap.tsx` - Minimap with expand modal
- `src/components/game/OpponentStatus.tsx` - Compact status display

**Technical Notes:**
- AI runs on setInterval during active rounds
- Decision delay varies by difficulty (1.5-3 seconds)
- All logic is local - no API calls or costs
- AI uses same scoring/income formulas as player

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

## File Structure (Current)

```
C:\dev\Eutopia\
├── App.tsx                          # Main game component
├── assets/
│   └── audio/                       # All sound files
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
│       ├── tripleBeep.mp3
│       ├── game_score1.mp3          # Menu/intermission music
│       └── gamePlay1.mp3            # Gameplay music
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── Icons.tsx            # All building/boat SVG icons
│   │   │   ├── AnimatedIcons.tsx    # Detailed static building SVGs
│   │   │   ├── AnimatedBoat.tsx     # Boat with path animation
│   │   │   ├── AnimatedBuildMenu.tsx # Sliding build menu
│   │   │   ├── AnimatedResourceBar.tsx # Flash effects on value change
│   │   │   ├── Island.tsx           # Map renderer with tiles
│   │   │   ├── RainCloud.tsx
│   │   │   ├── ScoreDisplay.tsx
│   │   │   ├── EndGameSummary.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── RoundTransition.tsx
│   │   │   └── ResourceBar.tsx
│   │   ├── settings/
│   │   │   └── SettingsScreen.tsx   # Audio settings overlay
│   │   ├── setup/
│   │   │   └── SetupScreen.tsx      # Pre-game configuration
│   │   └── index.ts
│   ├── constants/
│   │   └── game.ts                  # BUILDINGS, BALANCE, etc.
│   ├── hooks/
│   │   ├── useAudioSettings.ts      # Audio settings hook
│   │   └── useAIOpponent.ts         # AI state management hook
│   ├── services/
│   │   ├── islandGenerator.ts
│   │   ├── soundManager.ts          # Sound & music manager
│   │   ├── boatPathfinding.ts       # BFS pathfinding for boats
│   │   └── aiOpponent.ts            # AI decision engine
│   └── types/
│       └── index.ts
└── package.json
```

---

## Notes

- ~~Mode selection (Original vs Enhanced) will move to setup screen~~ ✅ Done
- PT boat combat mechanics TBD
- Enhanced mode building effects TBD (dock bonus, lighthouse radius, etc.)
- Consider haptic feedback for mobile
- Rain could affect specific tiles visually, not just gold bonus
- expo-av is deprecated in SDK 54 - may need migration to expo-audio in future
- SVG SMIL animations not supported in React Native - use Reanimated for future animations

---

*Last Updated: Session 7 (Jan 26, 2026)*

---

## Current Status Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Visual Polish (water, textures, gradients) | ✅ Complete |
| 2 | Enhanced Mode Building Icons | ✅ Complete |
| 2.5 | Gameplay (rain, rebels, scoring, end-game) | ✅ Complete |
| 3 | UI Improvements (header, toasts, transitions) | ✅ Complete |
| 4 | Sound & Audio System | ✅ Complete |
| 5 | Setup Screen | ✅ Complete |
| 6 | Animations & Polish | ✅ Complete |
| 7 | AI Opponent | ✅ Complete |
| 8 | Multiplayer | ⏳ Next |
| 9 | Enhanced Mode Features | 🔜 Planned |
| 10 | Final Polish | 🔜 Planned |

**Known Issues:**
- ~~Can build before game starts~~ ✅ Fixed (now shows "Press START to begin")
- PT boat combat not yet implemented (AI PT boats track but don't destroy)
- Enhanced mode building effects not yet implemented
- Weather animations (storms, lightning, hurricanes) not yet implemented
- AI minimap needs integration into App.tsx (components ready)
