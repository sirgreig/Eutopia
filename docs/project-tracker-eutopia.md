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

## AI Opponent Design

### Requirements
- Competent enough to be fun, not frustrating
- Multiple difficulty levels
- Behavior should feel plausible, not omniscient

### Approach
*[TO BE DESIGNED]*

- Decision-making priorities
- Timing of actions
- Boat management strategy
- Response to player actions

---

## Technical Stack & Development Resources

### Framework & Platform
| Component | Choice | Notes |
|-----------|--------|-------|
| **Framework** | React Native | Aligns with existing IJBA project infrastructure |
| **Build System** | Expo | Cross-platform deployment (iOS + Android) |
| **Language** | TypeScript | Type safety for complex game state |

### State Management
| Component | Choice | Notes |
|-----------|--------|-------|
| **Local State** | TBD (Zustand recommended) | Lightweight, good for game state |
| **Multiplayer Sync** | WebSocket | Real-time state sync between devices |
| **Persistence** | AsyncStorage + Server | Save games, player profiles |

### Graphics & Rendering
| Component | Choice | Notes |
|-----------|--------|-------|
| **Island/Buildings** | SVG components (react-native-svg) | Scalable, matches retro-modern style |
| **Animations** | React Native Reanimated | Smooth boat movement, weather effects |
| **Alternative** | Canvas (react-native-skia) | If SVG performance insufficient |

### Multiplayer Infrastructure
| Component | Choice | Notes |
|-----------|--------|-------|
| **Room System** | Existing trivia game infrastructure | Room-based lobbies, matchmaking |
| **Real-time Sync** | WebSocket server | Game state broadcast |
| **Protocol** | TBD | State delta vs full state sync |

### AI Opponent
| Component | Choice | Notes |
|-----------|--------|-------|
| **Execution** | Local (on-device) | No server needed for AI games |
| **Architecture** | Utility-based AI | Score potential actions, pick best |
| **Tuning** | Exposed parameters | Difficulty adjustment, playtesting |

### Development Tools
| Tool | Purpose | Status |
|------|---------|--------|
| **Visual Studio Code** | Primary IDE | ✅ Confirmed |
| **GitHub** | Version control | ✅ Confirmed |
| **Expo Metro** | Development server & hot reload | ✅ Confirmed |
| **Expo Go** | Development testing on device | Planned |
| **EAS Build** | Production builds | Planned |
| **Claude** | Design, code generation, debugging | ✅ Active |

### Testing
| Type | Tool |
|------|------|
| **Unit Tests** | Jest |
| **Component Tests** | React Native Testing Library |
| **E2E Tests** | Detox (if needed) |
| **Playtesting** | Manual; tuning parameters exposed |

### Key Dependencies (Planned)
```
react-native
expo
react-native-svg
react-native-reanimated
zustand (or similar)
socket.io-client (or ws)
@react-native-async-storage/async-storage
```

### Project Structure (Proposed)
```
src/
├── app/                    # Expo Router screens
│   ├── index.tsx           # Home/menu
│   ├── game/
│   │   ├── [gameId].tsx    # Active game screen
│   │   └── setup.tsx       # Game configuration
│   ├── lobby/
│   │   └── [roomId].tsx    # Multiplayer lobby
│   └── dev/                # Dev tools (existing pattern)
├── components/
│   ├── game/
│   │   ├── Island.tsx      # Island grid renderer
│   │   ├── Tile.tsx        # Individual tile
│   │   ├── Building.tsx    # Building components
│   │   ├── Boat.tsx        # Boat sprites
│   │   ├── Minimap.tsx     # Opponent view
│   │   └── BuildMenu.tsx   # Contextual popup
│   └── ui/                 # Shared UI components
├── services/
│   ├── gameEngine.ts       # Core game logic
│   ├── islandGenerator.ts  # Map generation
│   ├── aiOpponent.ts       # AI decision making
│   ├── multiplayer.ts      # WebSocket handling
│   └── scoring.ts          # Score calculations
├── state/
│   └── gameStore.ts        # Zustand store
├── types/
│   └── game.ts             # TypeScript interfaces
└── constants/
    ├── buildings.ts        # Building definitions
    ├── balance.ts          # Tuning parameters
    └── theme.ts            # Visual constants
```

---

## Development Phases

### Phase 0: Foundation
- [ ] Set up project structure (Expo + TypeScript)
- [ ] Create visual mockups for style validation
- [ ] Define TypeScript interfaces for game state
- [ ] Set up Zustand store skeleton

### Phase 1: Core Loop Prototype
- [ ] Island generator with fairness constraints
- [ ] Single island grid rendering (SVG tiles)
- [ ] Building placement with contextual popup
- [ ] Basic resource tick (gold, population)
- [ ] Round timer

### Phase 2: Full Single-Player Mechanics
- [ ] Both islands rendered (player + AI placeholder)
- [ ] All original buildings functional
- [ ] Boat spawning and tap-tap movement
- [ ] Fishing mechanics (boats + fish schools)
- [ ] Weather system (rain, storms, hurricanes)
- [ ] Rebel spawning and fort protection
- [ ] Full scoring implementation
- [ ] Round flow with manual continue

### Phase 3: AI Opponent
- [ ] Utility-based AI architecture
- [ ] AI building decisions
- [ ] AI boat management
- [ ] AI sabotage behavior
- [ ] Difficulty tuning parameters exposed
- [ ] Save/resume for AI games

### Phase 4: Multiplayer
- [ ] Room-based lobby (leverage existing infrastructure)
- [ ] WebSocket game state sync
- [ ] Minimap of opponent's island
- [ ] Ready-up flow between rounds
- [ ] Disconnect handling (3-min forfeit)

### Phase 5: Enhanced Mode
- [ ] Fog of war system
- [ ] PT boat scouting reveal
- [ ] Watchtower reveal
- [ ] Enhanced buildings (Apartment, Dock, Lighthouse, Granary, Marketplace)
- [ ] Mode toggle at game setup

### Phase 6: Polish
- [ ] Contextual tutorial hints
- [ ] Sound effects
- [ ] Animations and juice
- [ ] Settings and preferences
- [ ] Performance optimization
- [ ] App store preparation

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

**Next Session:**
- Initialize Expo project in C:\Dev\Eutopia
- Set up React Native + TypeScript
- Create initial component scaffolding
- Begin island generator implementation

**Next Steps:**
1. Review visual prototype, iterate on style if needed
2. Set up project structure in codebase
3. Implement island generator with fairness constraints
4. Build core game state management
5. Create basic tile/building rendering

---

*Last Updated: Session 1*
