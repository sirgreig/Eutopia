# Portfolio Overview: Eutopía

*Document Purpose: Single source of truth for portfolio unification decisions*
*Last Updated: February 2026*

---

## 1. Application Identity

| Attribute | Value |
|-----------|-------|
| **App Name** | Eutopía |
| **Tagline** | A modern tribute to the first god game |
| **Core Purpose** | Mobile remake of the 1981 Intellivision classic "Utopia" — the first city-builder/god game |
| **Target User** | Retro gaming enthusiasts, casual strategy gamers, fans of city-builder genre |
| **Genre** | Real-time strategy / City builder / God game |

---

## 2. Development Status

| Attribute | Value |
|-----------|-------|
| **Current Stage** | **Development (Alpha)** — Core single-player gameplay complete, polish and multiplayer remaining |
| **Platform** | iOS (iPhone/iPad), Android |
| **Tech Stack** | React Native, TypeScript, Expo |
| **Repository** | Local development |

### Completion Status
- ✅ Core gameplay loop (rounds, timer, scoring, population dynamics)
- ✅ Building system (12 building types with placement, costs, info toasts)
- ✅ AI opponent with difficulty levels (easy/normal/hard)
- ✅ Weather system (rain clouds, tropical storms, hurricanes with damage/hierarchy)
- ✅ Rebel mechanics (authentic Utopia behavior, fort protection)
- ✅ Boat navigation (waypoint movement, landlocked prevention via BFS)
- ✅ Fish schools (spawning, movement, fishing boat gold detection)
- ✅ Pirate ships (AI targeting, combat collisions, difficulty scaling)
- ✅ Sound effects and music (menu/gameplay themes, 12+ SFX, mute/volume controls)
- ✅ Setup screen (mode, rounds, difficulty selection)
- ✅ Settings screen (audio, help, quit, replay tutorial)
- ✅ Interactive tutorial system (6-step, spotlight overlay, first-time only)
- ✅ Victory/defeat screen (score comparison, breakdown, ratings)
- ✅ Responsive design (iPhone landscape optimized)
- ✅ Round transitions (animations, object persistence between rounds)
- 🔲 Building animations (smoke, flags, swaying crops)
- 🔲 Multiplayer networking
- 🔲 Enhanced mode building mechanics (fog of war, dock/lighthouse/etc. effects)
- 🔲 App Store deployment

---

## 3. Data Entities

### Core Entities

| Entity | Description | Key Fields |
|--------|-------------|------------|
| **Island** | Player's landmass | `id`, `tiles[]`, `boats[]` |
| **Tile** | Single buildable land cell | `id`, `position{x,y}`, `building?`, `hasRebel?` |
| **Building** | Structure on a tile | `type`, `cost`, `name`, `description`, `enhanced` |
| **Boat** | Naval vessel | `id`, `type`, `position`, `velocity`, `destination` |
| **FishSchool** | Mobile fishing target | `id`, `x`, `y`, `dx`, `dy` |
| **PirateShip** | Enemy vessel with AI | `id`, `x`, `y`, `dx`, `dy`, `target` |
| **Player** | Game participant | `gold`, `population`, `score`, `scoreBreakdown` |
| **Round** | Timed game segment | `number`, `duration`, `maxRounds`, `isActive` |
| **WeatherEvent** | Rain/storm/hurricane | `startX/Y`, `endX/Y`, `duration`, type-specific damage |

### Building Types
- House, Farm, Factory, Hospital, School, Fort
- Apartment, Dock, Lighthouse, Granary, Marketplace, Watchtower

### Boat Types
- Fishing Boat (income generation)
- PT Boat (military/defense)

---

## 4. Identifiers & Naming

### ID Patterns

| Entity | ID Format | Example |
|--------|-----------|---------|
| Tile | `tile-{x}-{y}` | `tile-5-3` |
| Boat | `boat-{timestamp}` | `boat-1706547892345` |
| Island | `island-{uuid}` | `island-abc123` |

### Shared Identifiers
- **User ID**: Not yet implemented (future multiplayer)
- **Room/Session ID**: Not yet implemented (future multiplayer)
- **Potential shared with**: Other multiplayer games in portfolio

---

## 5. Branding Elements

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Primary Blue (Water)** | `#1e6091` / `#155a8a` / `#0d4a6f` | Ocean, UI backgrounds |
| **Land Green** | `#6b8e4e` / `#4a7c3b` | Island tiles |
| **Sand/Beach** | `#d4b896` | Coastline edges |
| **Gold Accent** | `#ffc107` | Currency, highlights |
| **Success Green** | `#4ade80` | Positive actions, fishing boats |
| **Danger Red** | `#e53935` | Rebels, warnings, PT boats |
| **UI Dark** | `#1a2a3a` / `#0a1a2a` | Panels, menus |

### Typography
- System fonts (React Native defaults)
- Bold weights for headers and values
- No custom font families currently

### Iconography Style
- **Custom SVG icons** for all buildings and boats
- Colorful, stylized, modern interpretation of retro aesthetic
- Consistent size scaling based on tile dimensions
- Drop shadows for depth

### Visual Style
- Clean, modern UI with dark theme
- Rounded corners (8-16px radius)
- Subtle gradients on tiles and water
- Animated water waves and sparkles
- Gentle bobbing animation on boats

---

## 6. Monetization Strategy

### Revenue Model: Freemium with 4 Streams

| Stream | Price | Description |
|--------|-------|-------------|
| **Video Ads** | Free | Interstitial ads between rounds (starts after round 3) |
| **Ad-Free IAP** | $2.99 | One-time purchase to remove all ads |
| **Premium IAP** | $4.99 | Enhanced Mode + Ad-Free (fog of war, 6 extra buildings) |
| **Tip Jar IAP** | $0.99-9.99 | Optional support in Settings menu, no gameplay benefit |

### Pricing Tiers

| Tier | Access | Ads |
|------|--------|-----|
| **Free** | Original Mode | Yes (after round 3) |
| **Ad-Free** | Original Mode | No |
| **Premium** | Original + Enhanced Mode | No |

### Anti-Patterns (What We Avoid)
- ❌ Pay-to-win mechanics
- ❌ Energy/lives systems
- ❌ Loot boxes
- ❌ Purchasable in-game currency
- ❌ Aggressive ad popups

### Technical Dependencies
- Google AdMob (react-native-google-mobile-ads) — configured, ad unit TBD
- react-native-iap (App Store + Google Play) — not yet integrated
- **AdMob App ID:** `ca-app-pub-7909587764339962~6992047932` (confirmed)

---

## 7. Infrastructure & Brand Integration

### Tartan Studios Brand Hierarchy
- **Parent Brand:** Tartan Studios (tartan-studios.com)
- **Division:** Entertainment
- **App Position:** Direct child of Tartan Studios (no sub-brand)
- **Website Listing:** ✅ Already listed at tartan-studios.com as "In Development"

### Firebase Configuration
| Attribute | Decision |
|-----------|----------|
| Firebase Project | **Own dedicated project** (created, parked for future use) |
| Project Name | `eutopia` |
| Auth | To be implemented (multiplayer) |
| Analytics | Configured but not integrated into app |
| Crashlytics | Configured but not integrated into app |

### AdMob Configuration
| Attribute | Value |
|-----------|-------|
| Publisher ID | `pub-7909587764339962` (shared Tartan Studios account) |
| App ID | `ca-app-pub-7909587764339962~6992047932` |
| Ad Unit (Interstitial) | TBD — create in AdMob console |

*Note: Existing apps in AdMob account:*
- *Inside Joke Battle Arena (ca-app-pub...3767973080) — Ready*
- *Sojourner's Path (ca-app-pub...1406802546) — Requires review*

### Support
| Attribute | Value |
|-----------|-------|
| Support Email | `support@tartan-studios.com` |
| Privacy Policy | `https://tartan-studios.com/privacy.html` |
| Terms of Service | `https://tartan-studios.com/terms.html` |

---

## 8. Support Touchpoints

| Touchpoint | Status | Details |
|------------|--------|---------|
| In-app Tutorial | ✅ Implemented | 6-step interactive tutorial with spotlight overlay, first-time only |
| How to Play | ✅ Implemented | Comprehensive game guide accessible from settings |
| Settings | ✅ Implemented | Sound/music controls, quit, replay tutorial |
| Building Info | ✅ Implemented | Tap any building to see name and benefit description |
| Feedback | 🔲 Planned | Thumbs up/down on game end |
| External Support | 🔲 Not implemented | support@tartan-studios.com configured but no in-app link |

---

## 9. Dependencies & Integrations

### External Dependencies
- **expo-av**: Audio playback (music tracks, sound effects)
- **react-native-svg**: Vector graphics (building/boat icons, weather effects)
- **@react-native-async-storage/async-storage**: Local settings persistence (audio, tutorial state)
- **react-native-reanimated**: Animations (weather, transitions)

### Potential Shared Infrastructure
- Multiplayer room system (if other apps have similar needs)
- User authentication (future)
- Analytics platform (future)
- Push notifications (future)

### Cross-App Relationships
- **None currently** — standalone application
- **Potential**: Shared user accounts, unified game center

---

## 10. Unique Characteristics

### What Makes This App Different
1. **Tribute to gaming history** — faithful recreation of 1981 classic
2. **Educational value** — teaches the origin of the city-builder genre
3. **Dual mode**: Authentic "Original" mode + modern "Enhanced" mode
4. **AI opponent** — solo play against adaptive difficulty (easy/normal/hard)
5. **Asymmetric island generation** — replayability through procedural maps
6. **Full weather system** — rain, tropical storms, and hurricanes with escalating danger
7. **Living ocean** — fish schools, pirate ships, and naval combat
8. **Interactive tutorial** — approachable for new players without disrupting experienced ones

### Design Pillars
1. **Vintage Fidelity** — Obvious to retro gamers this is a loving remake
2. **Modern Accessibility** — Fun for new players unfamiliar with Intellivision

---

## 11. Future Considerations for Unification

### Brand Alignment Opportunities
- Could fit under a "retro remakes" or "classic gaming" sub-brand
- Historical/educational angle differentiates from pure entertainment apps
- Strategy/builder genre could group with other planning/management apps

### Shared Components to Consider
- User account system
- Achievement/trophy system
- Game statistics tracking
- Social features (leaderboards, challenges)
- Unified notification system

### Questions for Portfolio Integration
1. Does this app share a target audience with others?
2. Should there be cross-promotion between apps?
3. Would a unified "game center" launcher benefit users?
4. Are there visual branding elements to standardize?

---

## 12. Key Files Reference

| Purpose | Path |
|---------|------|
| Main App | `App.tsx` |
| Types/Entities | `src/types/game.ts` |
| Game Constants | `src/constants/game.ts` |
| Sound Manager | `src/services/soundManager.ts` |
| Audio Settings | `src/hooks/useAudioSettings.ts` |
| AI Logic | `src/hooks/useAI.ts` |
| Tutorial System | `src/hooks/useTutorial.ts` |
| Building Icons | `src/components/game/Icons.tsx` |
| Island Renderer | `src/components/game/Island.tsx` |
| Weather (Rain) | `src/components/game/RainCloud.tsx` |
| Weather (Storm) | `src/components/game/StormCloud.tsx` |
| Weather (Hurricane) | `src/components/game/HurricaneCloud.tsx` |
| Victory Screen | `src/components/game/EndGameSummary.tsx` |
| Build Menu | `src/components/ui/BuildMenu.tsx` |
| Settings | `src/components/settings/SettingsScreen.tsx` |
| How to Play | `src/components/settings/HowToPlay.tsx` |
| Project Tracker | `docs/project-tracker.md` |

---

*This document should be updated when major features are added, branding decisions change, or integration points are identified.*
