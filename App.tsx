import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  useWindowDimensions,
  Pressable,
  Animated,
  Easing,
  AppState,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Asset } from 'expo-asset';
import { Island } from './src/components/game/Island';
import { 
  HouseIcon, 
  FarmIcon, 
  FactoryIcon, 
  HospitalIcon, 
  SchoolIcon, 
  FortIcon,
  ApartmentIcon,
  DockIcon,
  LighthouseIcon,
  GranaryIcon,
  MarketplaceIcon,
  WatchtowerIcon,
  FishingBoatIcon,
  PTBoatIcon,
  ConstructionIcon,
  ICON_IMAGES,
} from './src/components/game/Icons';
import { RainCloud } from './src/components/game/RainCloud';
import { StormCloud } from './src/components/game/StormCloud';
import { HurricaneCloud } from './src/components/game/HurricaneCloud';
import { ScoreDisplay } from './src/components/game/ScoreDisplay';
import { RebelIcon } from './src/components/game/RebelIcon';
import { EndGameSummary } from './src/components/game/EndGameSummary';
import { Toast } from './src/components/game/Toast';
import { RoundTransition } from './src/components/game/RoundTransition';
import { AnimatedResourceBar } from './src/components/game/AnimatedResourceBar';
import { AnimatedBuildMenu } from './src/components/game/AnimatedBuildMenu';
import { FreeRoamBoat, DestinationMarker } from './src/components/game/FreeRoamBoat';
import { generateIsland } from './src/services/islandGenerator';
import { generateCoastline } from './src/services/coastlineDetection';
import { 
  createFreeRoamBoat, 
  createFreeRoamBoatAt,
  setBoatDestination, 
  updateBoat,
} from './src/services/boatMovement';
import { 
  Island as IslandType, 
  Position, 
  Tile, 
  BuildingType, 
  GameMode,
  BoatType,
  FreeRoamBoat as FreeRoamBoatType,
  FishSchool as FishSchoolType,
  PirateShip as PirateShipType,
  WaterPosition,
  Coastline,
  waterDistance,
} from './src/types';
import { BUILDINGS, BOAT_COSTS, BALANCE, PIRATE_DIFFICULTY, STORM_DIFFICULTY, HURRICANE_DIFFICULTY, GRID_WIDTH, GRID_HEIGHT, REBEL_SPAWN_COST, getAvailableBuildings } from './src/constants/game';
import { inflictRebel } from './src/services/rebels';
import {
  buildingPositions,
  dockMultiplierFor,
  lighthouseSinkMultiplier,
  resolveFoodEconomy,
} from './src/services/enhancedBuildings';
import { computeRevealCount, revealTiles } from './src/services/fogOfWar';
import { isDebugEnabled, subscribeDebug } from './src/services/debugMode';
import {
  getFortPositions,
  isTileFortProtected,
  isBoatFortProtected as isBoatNearFort,
  effectiveBuildingDestroyChance,
  rollBudget,
} from './src/services/fortProtection';
import { SinkingBoat, SinkableType, SINK_ANIMATION_MS } from './src/components/game/SinkingBoat';
import { RoundSummaryPanel, RoundSummaryData } from './src/components/game/RoundSummaryPanel';
import { BattleOverlay, BattlePlan, buildBattlePlan, BATTLE_TOTAL_MS } from './src/components/game/BattleOverlay';

// Audio imports - simple system adapted from IJBA
import { initializeSounds, Sounds } from './src/services/soundManager';
import { loadAudioSettings, useAudioSettings } from './src/hooks/useAudioSettings';
import { SettingsScreen } from './src/components/settings/SettingsScreen';
import { SetupScreen, GameConfig } from './src/components/setup/SetupScreen';
import { TitleScreen } from './src/components/title/TitleScreen';
import { QuickStartPanel } from './src/components/title/QuickStartPanel';
import { WhatsNewPanel } from './src/components/common/WhatsNewPanel';
import { getUnseenReleaseNotes, markReleaseNotesSeen } from './src/services/whatsNewService';
import { ReleaseNote, RELEASE_NOTES } from './src/constants/whatsNew';

// AI Opponent imports
import { useAIOpponent } from './src/hooks/useAIOpponent';
import { useAds } from './src/hooks/useAds';
import { AIIslandMinimap } from './src/components/game/AIIslandMinimap';
import { MultiplayerIslandMinimap } from './src/components/game/MultiplayerIslandMinimap';
import { ConnectionBanner } from './src/components/game/ConnectionBanner';

// Tutorial imports
import { useTutorial } from './src/hooks/useTutorial';
import { TutorialOverlay } from './src/components/game/TutorialOverlay';
import { useTutorialTargets, measureAndRegister } from './src/services/tutorialTargets';

// Multiplayer imports
import { NamePromptModal } from './src/components/multiplayer/NamePromptModal';
import { MultiplayerLobby } from './src/components/multiplayer/MultiplayerLobby';
import { getPlayer } from './src/services/playerService';
import { hasPlayerName, saveActiveSession, getActiveSession, clearActiveSession } from './src/services/playerService';
import { setIsland as fbSetIsland, listenToIsland as fbListenToIsland, setPlayerState as fbSetPlayerState, listenToPlayerState as fbListenToPlayerState, PlayerState as FbPlayerState, setRoundState as fbSetRoundState, listenToRoundState as fbListenToRoundState, RoundState as FbRoundState, pushSpawnEvent as fbPushSpawnEvent, listenToSpawnEvents as fbListenToSpawnEvents, SpawnEvent as FbSpawnEvent, promoteToHost as fbPromoteToHost, rejoinRoom as fbRejoinRoom, pushSabotageAction as fbPushSabotage, listenToSabotageActions as fbListenToSabotage, clearSabotageActions as fbClearSabotage } from './src/services/multiplayerService';

// Fish schools
import { FishSchoolComponent } from './src/components/game/FishSchool';
import { PirateShipComponent } from './src/components/game/PirateShip';
import { isPointInWater } from './src/services/coastlineDetection';

const MENU_ICON_SIZE = 28;

// Phase 8E — connection thresholds (ms)
const MP_STALE_MS = 10000;     // opponent considered disconnected
const MP_FORFEIT_MS = 180000;  // 3 minutes → forfeit

// Interstitial ads: show after every Nth round end. Every round across a 15-round
// game would be punishing; this lands roughly four ads in a full game.
// House rule: ads only at natural pause points, never mid-round.
const AD_ROUND_INTERVAL = 4;

// Multiplayer only: how long the host's NEXT button stays dimmed after a round
// ends, so the opponent gets time to read their round summary.
//
// This is NOT a ready-up handshake — no signal passes between clients. Both end the
// round at the same instant from the same shared endTime, so both summaries appear
// together. Holding the host for the same duration the summary is on screen gives
// the guest that window without anything to negotiate, stall on, or time out.
const MP_NEXT_LOCKOUT_MS = 5000;

const MenuBuildingIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'house': return <HouseIcon size={MENU_ICON_SIZE} />;
    case 'farm': return <FarmIcon size={MENU_ICON_SIZE} />;
    case 'factory': return <FactoryIcon size={MENU_ICON_SIZE} />;
    case 'hospital': return <HospitalIcon size={MENU_ICON_SIZE} />;
    case 'school': return <SchoolIcon size={MENU_ICON_SIZE} />;
    case 'fort': return <FortIcon size={MENU_ICON_SIZE} />;
    case 'apartment': return <ApartmentIcon size={MENU_ICON_SIZE} />;
    case 'dock': return <DockIcon size={MENU_ICON_SIZE} />;
    case 'lighthouse': return <LighthouseIcon size={MENU_ICON_SIZE} />;
    case 'granary': return <GranaryIcon size={MENU_ICON_SIZE} />;
    case 'marketplace': return <MarketplaceIcon size={MENU_ICON_SIZE} />;
    case 'watchtower': return <WatchtowerIcon size={MENU_ICON_SIZE} />;
    default: return <ConstructionIcon size={MENU_ICON_SIZE} />;
  }
};

export default function App() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  const availableHeight = screenHeight - 60;
  const availableWidth = screenWidth - 20;
  const tileSize = Math.min(
    Math.floor(availableWidth / GRID_WIDTH),
    Math.floor(availableHeight / GRID_HEIGHT)
  );
  
  const [island, setIsland] = useState<IslandType | null>(null);
  const [gold, setGold] = useState(BALANCE.startingGold);
  const [population, setPopulation] = useState(BALANCE.startingPopulation);
  const [score, setScore] = useState(50);
  const [scoreBreakdown, setScoreBreakdown] = useState({ housing: 0, food: 0, welfare: 0, gdp: 0 });
  const [mode, setMode] = useState<GameMode>('original');
  const [round, setRound] = useState(0);
  const [maxRounds, setMaxRounds] = useState(15);
  const [roundDuration, setRoundDuration] = useState(BALANCE.defaultRoundDuration);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [timeRemaining, setTimeRemaining] = useState(BALANCE.defaultRoundDuration);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [selectedTile, setSelectedTile] = useState<Position | null>(null);
  const [selectedBoat, setSelectedBoat] = useState<string | null>(null);
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  // Which menu the build sheet shows: buildings (land tap) or boats (water tap)
  const [buildMenuContext, setBuildMenuContext] = useState<'land' | 'water'>('land');
  // Water position tapped when opening the boat menu
  const [selectedWater, setSelectedWater] = useState<WaterPosition | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'gold' | 'population' | 'rebel' | 'rain' | 'round' | 'build' | 'error' | 'stability' } | null>(null);
  const [rainCloud, setRainCloud] = useState<{
    startX: number; startY: number;
    endX: number; endY: number;
    duration: number;
  } | null>(null);
  const [stormCloud, setStormCloud] = useState<{
    startX: number; startY: number;
    endX: number; endY: number;
    duration: number;
  } | null>(null);
  const [hurricaneCloud, setHurricaneCloud] = useState<{
    startX: number; startY: number;
    endX: number; endY: number;
    duration: number;
  } | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showRoundTransition, setShowRoundTransition] = useState<'start' | 'end' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  // What's New — release notes the player hasn't seen yet
  const [whatsNewNotes, setWhatsNewNotes] = useState<ReleaseNote[]>([]);
  // True when the player opened release notes deliberately from Settings
  const [browsingReleaseNotes, setBrowsingReleaseNotes] = useState(false);
  // Quick "How to Play" overview, opened from the title screen
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Multiplayer / player identity state
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const [playerId, setPlayerId] = useState('');
  const [playerName, setPlayerName] = useState('');

  // Multiplayer game state — set when starting from lobby, null in solo
  const [mpRoomCode, setMpRoomCode] = useState<string | null>(null);
  const [mpOpponentId, setMpOpponentId] = useState<string | null>(null);
  const [mpOpponentName, setMpOpponentName] = useState<string>('Opponent');
  const [mpIsHost, setMpIsHost] = useState(false);
  const [opponentIsland, setOpponentIsland] = useState<IslandType | null>(null);
  const [opponentState, setOpponentState] = useState<FbPlayerState | null>(null);
  const [mpRoundState, setMpRoundState] = useState<FbRoundState | null>(null);
  // Phase 8E — connection monitoring
  const [mpNowTick, setMpNowTick] = useState<number>(Date.now());
  const [mpWonByForfeit, setMpWonByForfeit] = useState(false);
  // True between a successful rejoin and the island being restored from Firebase
  const [isRejoining, setIsRejoining] = useState(false);
  const isMultiplayer = mpRoomCode !== null && mpOpponentId !== null;
  
  // Free-roam boat system state
  const [freeRoamBoats, setFreeRoamBoats] = useState<FreeRoamBoatType[]>([]);
  const [coastline, setCoastline] = useState<Coastline | null>(null);
  const [destinationMarker, setDestinationMarker] = useState<WaterPosition | null>(null);
  const boatUpdateRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  
  // Fish school state
  const [fishSchools, setFishSchools] = useState<FishSchoolType[]>([]);
  const fishSchoolsRef = useRef<FishSchoolType[]>([]);
  const freeRoamBoatsRef = useRef<FreeRoamBoatType[]>([]);
  const fishGoldIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fishMoveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fishRenderSyncRef = useRef<number>(0);
  
  // Pirate ship state
  const [pirates, setPirates] = useState<PirateShipType[]>([]);
  const piratesRef = useRef<PirateShipType[]>([]);
  const pirateSpawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pirateUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pirateRenderSyncRef = useRef<number>(0);
  
  // Audio settings hook
  const { isAudioEnabled, toggleAllAudio } = useAudioSettings();

  // Ads — no-ops entirely while ADS_ENABLED is false in adService.ts
  const { showAd } = useAds();
  
  // Vessels currently playing their sinking animation (visual only — already
  // removed from play, so they no longer fish, move, hunt or count for scoring).
  // Covers player boats AND pirate ships sunk by PT boats.
  const [sinkingBoats, setSinkingBoats] = useState<
    { id: string; type: SinkableType; position: WaterPosition }[]
  >([]);

  /** Queue a vessel's sinking animation. */
  const addSinking = useCallback(
    (entities: { id: string; type: SinkableType; position: WaterPosition }[]) => {
      if (entities.length === 0) return;
      setSinkingBoats((prev) => [...prev, ...entities]);
    },
    []
  );

  /**
   * Remove player boats from play and start their sinking animation.
   * Every sink path (storm, hurricane, pirate) goes through here so the animation
   * can't be forgotten in one of them.
   */
  const sinkBoats = useCallback((boatIds: string[]) => {
    if (boatIds.length === 0) return;
    const doomed = freeRoamBoatsRef.current.filter((b) => boatIds.includes(b.id));
    if (doomed.length === 0) return;

    addSinking(doomed.map((b) => ({ id: b.id, type: b.type as SinkableType, position: b.position })));

    freeRoamBoatsRef.current = freeRoamBoatsRef.current.filter(
      (b) => !boatIds.includes(b.id)
    );
    setFreeRoamBoats((prev) => prev.filter((b) => !boatIds.includes(b.id)));
  }, [addSinking]);

  const removeSunkBoat = useCallback((id: string) => {
    setSinkingBoats((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // PT boat vs pirate battle. Both combatants are pulled OUT of play for the
  // duration so they cannot move or collide again; the winner is returned when it
  // resolves. Only one battle runs at a time — a second collision during a battle
  // is ignored rather than queued.
  const [battlePlan, setBattlePlan] = useState<BattlePlan | null>(null);
  const battleRef = useRef<{
    ptBoat: FreeRoamBoatType;
    pirate: PirateShipType;
    ptWins: boolean;
  } | null>(null);

  const resolveBattle = useCallback(() => {
    const battle = battleRef.current;
    battleRef.current = null;
    setBattlePlan(null);
    if (!battle) return;

    if (battle.ptWins) {
      // Pirate goes down; PT boat returns to play where it was
      addSinking([
        { id: battle.pirate.id, type: 'pirate' as SinkableType, position: battle.pirate.position },
      ]);
      freeRoamBoatsRef.current = [...freeRoamBoatsRef.current, battle.ptBoat];
      setFreeRoamBoats([...freeRoamBoatsRef.current]);
      showToast('PT boat sank the pirates!', 'stability');
    } else {
      // PT boat goes down; pirate sails on
      addSinking([
        { id: battle.ptBoat.id, type: battle.ptBoat.type as SinkableType, position: battle.ptBoat.position },
      ]);
      piratesRef.current = [...piratesRef.current, battle.pirate];
      setPirates([...piratesRef.current]);
      showToast('Pirates sank your PT boat!', 'rebel');
    }
    Sounds.boatCrash();
  }, [addSinking]);

  // Sabotage — one per round per player
  const [sabotageUsedRound, setSabotageUsedRound] = useState<number>(-1);

  // Round summary — gold earned DURING the round is added to the total as it
  // happens, so it has to be accumulated separately to be reportable.
  const roundFishingGoldRef = useRef(0);
  const roundRainGoldRef = useRef(0);
  // Enhanced Mode: food score banked by granaries, carried between rounds
  const granaryBankRef = useRef(0);
  // Enhanced Mode: which opponent tiles this player has scouted. Local only —
  // knowledge of their island is never synced.
  const [revealedTiles, setRevealedTiles] = useState<Set<string>>(new Set());
  const fogEnabled = mode === 'enhanced';

  // Hidden debug aid — unlocked by tapping the Settings build footer five times.
  // Not persisted; resets every launch. See src/services/debugMode.ts.
  const [debugOn, setDebugOn] = useState(isDebugEnabled());
  useEffect(() => subscribeDebug(() => setDebugOn(isDebugEnabled())), []);
  const [roundSummary, setRoundSummary] = useState<RoundSummaryData | null>(null);
  // Whether an interstitial is owed once the summary is dismissed
  const pendingAdRef = useRef(false);

  // Reset the per-round accumulators whenever a round begins.
  // Also clears any lingering summary — in multiplayer the host can press NEXT
  // before the guest's summary has auto-dismissed, and it must not sit over a
  // round that has already started.
  useEffect(() => {
    if (isRoundActive) {
      roundFishingGoldRef.current = 0;
      roundRainGoldRef.current = 0;
      setRoundSummary(null);
    }
  }, [isRoundActive]);

  const dismissRoundSummary = useCallback(() => {
    setRoundSummary(null);
    // Ad runs AFTER the summary, never over it
    if (pendingAdRef.current) {
      pendingAdRef.current = false;
      showAd().catch(() => { /* never block round flow on an ad */ });
    }
  }, [showAd]);

  /**
   * Solo only: the summary carries the Next Round button, so the player reads their
   * result and continues in one place instead of dismissing and then hunting for
   * NEXT in the header.
   *
   * Order matters: dismiss, then run any owed ad to completion, THEN start the
   * round — otherwise the ad would appear over a round that is already running.
   */
  const advanceFromSummary = useCallback(async () => {
    setRoundSummary(null);
    if (pendingAdRef.current) {
      pendingAdRef.current = false;
      try {
        await showAd();
      } catch {
        // Never block the round on an ad
      }
    }
    startRoundRef.current?.();
  }, [showAd]);

  // startRound is defined further down; hold it in a ref so the callback above can
  // reach it without reordering the component.
  const startRoundRef = useRef<(() => void) | null>(null);

  // Multiplayer: hold the host's NEXT button briefly after a round ends.
  // Timestamp of when NEXT becomes available again; 0 means unrestricted.
  const [mpNextUnlockAt, setMpNextUnlockAt] = useState(0);
  const isNextLocked = isMultiplayer && mpNextUnlockAt > 0 && mpNowTick < mpNextUnlockAt;


  /** Apply an incoming rebel to the player's own island. */
  const receiveSabotage = useCallback((attackerName?: string) => {
    setIsland((prev) => {
      if (!prev) return prev;
      const result = inflictRebel(prev);
      if (!result) return prev;
      const what = result.destroyedBuilding
        ? BUILDINGS.find((b) => b.type === result.destroyedBuilding)?.name || result.destroyedBuilding
        : null;
      const who = attackerName || 'Your opponent';
      showToast(
        what ? `${who} sent rebels — ${what} destroyed!` : `${who} sent rebels!`,
        'rebel'
      );
      Sounds.rebelAppear();
      return result.island;
    });
  }, []);

  // AI Opponent hook
  const {
    aiIsland,
    aiGold,
    aiPopulation,
    aiScore,
    aiScoreBreakdown,
    initializeAI,
    processAIRoundEnd,
    lastAIAction,
    sabotageAI,
  } = useAIOpponent({
    difficulty,
    mode,
    isRoundActive,
    round,
    maxRounds,
    playerIsland: island,
    enabled: !isMultiplayer, // AI disabled in multiplayer (real opponent)
    onAISabotage: () => receiveSabotage('The AI'),
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isRoundActiveRef = useRef(false);
  const rainTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rainStartTimeRef = useRef<number>(0);
  const rainGoldIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rainGoldAccumRef = useRef(0);
  const rainTotalPausedRef = useRef<number>(0);
  const rainPauseStartRef = useRef<number>(0);
  
  // Tropical storm refs
  const stormTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stormStartTimeRef = useRef<number>(0);
  const stormDamageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stormDamagedTilesRef = useRef<Set<string>>(new Set());
  const stormTotalPausedRef = useRef<number>(0);
  const stormPauseStartRef = useRef<number>(0);
  const stormBuildingsDestroyedRef = useRef<number>(0);
  const stormBoatsSunkRef = useRef<number>(0);
  
  // Hurricane refs
  const hurricaneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hurricaneStartTimeRef = useRef<number>(0);
  const hurricaneDamageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hurricaneDamagedTilesRef = useRef<Set<string>>(new Set());
  const hurricaneTotalPausedRef = useRef<number>(0);
  const hurricanePauseStartRef = useRef<number>(0);
  const hurricaneBuildingsDestroyedRef = useRef<number>(0);
  const hurricaneBoatsSunkRef = useRef<number>(0);
  // Budgets rolled per hurricane at spawn so severity varies between them
  const hurricaneBuildingBudgetRef = useRef<number>(0);
  const hurricaneBoatBudgetRef = useRef<number>(0);

  // Tutorial hook
  const {
    isActive: isTutorialActive,
    currentStep: tutorialStep,
    stepIndex: tutorialStepIndex,
    totalSteps: tutorialTotalSteps,
    nextStep: tutorialNextStep,
    skipTutorial,
    resetTutorial,
    startTutorial,
    onTutorialAction,
  } = useTutorial();

  // Combined function to reset and immediately start tutorial
  const handleReplayTutorial = useCallback(async () => {
    await resetTutorial();
    startTutorial();
  }, [resetTutorial, startTutorial]);

  const showToast = (message: string, type: 'gold' | 'population' | 'rebel' | 'rain' | 'round' | 'build' | 'error' | 'stability' = 'round') => {
    setToast({ message, type });
  };

  const initGame = useCallback(() => {
    const newIsland = generateIsland();
    setIsland(newIsland);
    setCoastline(generateCoastline(newIsland));
    setFreeRoamBoats([]);
    setFishSchools([]);
    fishSchoolsRef.current = [];
    setPirates([]);
    piratesRef.current = [];
    setGold(BALANCE.startingGold);
    setPopulation(BALANCE.startingPopulation);
    setScore(50);
    setScoreBreakdown({ housing: 0, food: 0, welfare: 0, gdp: 0 });
    setRound(0);
    setTimeRemaining(roundDuration);
    setIsRoundActive(false);
    setSelectedTile(null);
    setSelectedBoat(null);
    setDestinationMarker(null);
    setShowBuildMenu(false);
    setRainCloud(null);
    setStormCloud(null);
    setHurricaneCloud(null);
    setShowGameOver(false);
    setShowRoundTransition(null);
    setToast(null);
    setSabotageUsedRound(-1);
    setRoundSummary(null);
    pendingAdRef.current = false;
    battleRef.current = null;
    setBattlePlan(null);
    granaryBankRef.current = 0;
    setRevealedTiles(new Set());
  }, [roundDuration]);

  // Start game with config from setup screen
  const startGameWithConfig = useCallback((config: GameConfig) => {
    setMode(config.mode);
    setMaxRounds(config.rounds);
    setRoundDuration(config.roundDuration);
    setDifficulty(config.difficulty);
    setShowSetup(false);
    
    // Initialize game with new config
    const newIsland = generateIsland();
    setIsland(newIsland);
    setCoastline(generateCoastline(newIsland));
    setFreeRoamBoats([]);
    setFishSchools([]);
    fishSchoolsRef.current = [];
    setPirates([]);
    piratesRef.current = [];
    setGold(BALANCE.startingGold);
    setPopulation(BALANCE.startingPopulation);
    setScore(50);
    setScoreBreakdown({ housing: 0, food: 0, welfare: 0, gdp: 0 });
    setRound(0);
    setTimeRemaining(config.roundDuration);
    setIsRoundActive(false);
    setSelectedTile(null);
    setSelectedBoat(null);
    setDestinationMarker(null);
    setShowBuildMenu(false);
    setRainCloud(null);
    setStormCloud(null);
    setHurricaneCloud(null);
    setShowGameOver(false);
    setShowRoundTransition(null);
    setToast(null);
    setSabotageUsedRound(-1);
    setRoundSummary(null);
    pendingAdRef.current = false;
    battleRef.current = null;
    setBattlePlan(null);
    granaryBankRef.current = 0;
    setRevealedTiles(new Set());
    
    // Initialize AI opponent
    setTimeout(() => initializeAI(), 100);
  }, [initializeAI]);

  // Return to setup screen
  const returnToSetup = useCallback(() => {
    setShowSetup(true);
    setShowGameOver(false);
    // Title screen is launch-only — quitting a game returns to setup, not the title
    // Deliberately leaving a game — drop the rejoin record
    clearActiveSession();
    // Clear multiplayer state on exit to setup
    setMpRoomCode(null);
    setMpOpponentId(null);
    setMpOpponentName('Opponent');
    setMpIsHost(false);
    setOpponentIsland(null);
    setOpponentState(null);
    setMpRoundState(null);
    setMpWonByForfeit(false);
    Sounds.playMusic('menu');
  }, []);

  // Initialize audio, player identity, and preload images on mount
  useEffect(() => { 
    const init = async () => {
      // Audio init runs unconditionally — image preload failure must not block it
      await Promise.all([
        initializeSounds(),
        loadAudioSettings(),
      ]);
      // Start menu music (setup screen)
      Sounds.playMusic('menu');

      // What's New — MUST run before getPlayer(), which creates a player id if
      // none exists. That id is how we tell a genuine first install apart from a
      // returning player, so checking afterwards would make every device look new.
      const unseen = await getUnseenReleaseNotes();
      if (unseen.length > 0) setWhatsNewNotes(unseen);

      // Load or create player identity
      const player = await getPlayer();
      setPlayerId(player.id);
      if (player.name) {
        setPlayerName(player.name);
      } else {
        setShowNamePrompt(true);
      }

      // Phase 8E — attempt to rejoin an in-progress multiplayer game.
      // Only fires if a session was saved and the room is still 'playing'.
      const session = await getActiveSession();
      if (session && player.name) {
        const result = await fbRejoinRoom(session.roomCode, player.id);
        if (result.success) {
          setMpRoomCode(session.roomCode);
          setMpOpponentId(result.opponentId);
          setMpOpponentName(result.opponentName);
          setMpIsHost(result.isHost);
          setMode('original');
          setMaxRounds(result.room.settings.maxRounds);
          setRoundDuration(result.room.settings.roundDuration);
          setDifficulty(result.room.settings.difficulty);
          setIsRejoining(true);
          setShowSetup(false);
          setShowTitle(false); // Skip the title screen when resuming a live game
          // Island is restored from Firebase by the rejoin effect below
        } else {
          await clearActiveSession();
        }
      }

      // Preload PNG icons — best-effort only (fails silently on Android dev builds
      // where Metro serves assets via HTTP and downloadAsync is rejected)
      try {
        await Promise.all([
          ...Object.values(ICON_IMAGES).map(
            (source) => Asset.fromModule(source as number).downloadAsync()
          ),
          // Title screen artwork — avoids a visible pop on first launch
          Asset.fromModule(require('./assets/images/title-bg.jpg')).downloadAsync(),
          Asset.fromModule(require('./assets/images/title-clouds.png')).downloadAsync(),
        ]);
      } catch {
        // Non-fatal: icons will load on first render instead
      }
    };
    init(); 
  }, []);

  // Phase 8E — restore this player's own island from Firebase after a rejoin.
  // Runs once; the normal island-write effect is inert while `island` is null,
  // so there's no risk of clobbering the stored copy before it loads.
  useEffect(() => {
    if (!isRejoining || !mpRoomCode || !playerId) return;

    const unsubscribe = fbListenToIsland(mpRoomCode, playerId, (ownIsland) => {
      if (ownIsland) {
        setIsland(ownIsland);
        setCoastline(generateCoastline(ownIsland));
        setIsRejoining(false);
        showToast('Rejoined game in progress', 'stability');
      }
    });
    return unsubscribe;
  }, [isRejoining, mpRoomCode, playerId]);

  // ============================================
  // MULTIPLAYER ISLAND SYNC (Phase 8C.1)
  // ============================================

  // Write own island to Firebase whenever it changes (multiplayer only)
  useEffect(() => {
    if (!isMultiplayer || !island || !mpRoomCode) return;
    fbSetIsland(mpRoomCode, playerId, island).catch(() => {
      // Non-fatal — 8C.2 will add proper retry/throttle logic
    });
  }, [island, isMultiplayer, mpRoomCode, playerId]);

  // Subscribe to opponent's island (multiplayer only)
  useEffect(() => {
    if (!isMultiplayer || !mpRoomCode || !mpOpponentId) {
      setOpponentIsland(null);
      return;
    }
    const unsubscribe = fbListenToIsland(mpRoomCode, mpOpponentId, (oppIsland) => {
      setOpponentIsland(oppIsland);
    });
    return unsubscribe;
  }, [isMultiplayer, mpRoomCode, mpOpponentId]);

  // ============================================
  // MULTIPLAYER PLAYER STATE SYNC (Phase 8C.2)
  // ============================================

  // Refs to current state values — keeps the write interval simple and stable
  const mpStateRef = useRef({
    gold,
    population,
    score,
    scoreBreakdown,
    boats: freeRoamBoats,
  });
  useEffect(() => {
    mpStateRef.current = { gold, population, score, scoreBreakdown, boats: freeRoamBoats };
  }, [gold, population, score, scoreBreakdown, freeRoamBoats]);

  // Write own state to Firebase every 500ms while in multiplayer
  useEffect(() => {
    if (!isMultiplayer || !mpRoomCode || !playerId) return;

    const writeState = () => {
      const s = mpStateRef.current;
      const payload: FbPlayerState = {
        gold: s.gold,
        population: s.population,
        score: s.score,
        scoreBreakdown: s.scoreBreakdown,
        boats: s.boats.map((b) => ({
          id: b.id,
          type: b.type,
          x: b.position.x,
          y: b.position.y,
        })),
        updatedAt: Date.now(),
      };
      fbSetPlayerState(mpRoomCode, playerId, payload).catch(() => {
        // Non-fatal
      });
    };

    writeState(); // Write immediately on entering multiplayer
    const interval = setInterval(writeState, 500);

    return () => clearInterval(interval);
  }, [isMultiplayer, mpRoomCode, playerId]);

  // Subscribe to opponent's state
  useEffect(() => {
    if (!isMultiplayer || !mpRoomCode || !mpOpponentId) {
      setOpponentState(null);
      return;
    }
    const unsubscribe = fbListenToPlayerState(mpRoomCode, mpOpponentId, (state) => {
      setOpponentState(state);
    });
    return unsubscribe;
  }, [isMultiplayer, mpRoomCode, mpOpponentId]);

  // Auto-skip tutorial in multiplayer — timed competitive play, no time for guidance
  useEffect(() => {
    if (isMultiplayer && isTutorialActive) {
      skipTutorial();
    }
  }, [isMultiplayer, isTutorialActive, skipTutorial]);

  // ============================================
  // MULTIPLAYER ROUND SYNC (Phase 8C.3)
  // ============================================

  // Subscribe to round state — drives local round number and isRoundActive in MP
  useEffect(() => {
    if (!isMultiplayer || !mpRoomCode) {
      setMpRoundState(null);
      return;
    }
    const unsubscribe = fbListenToRoundState(mpRoomCode, (rs) => {
      setMpRoundState(rs);
    });
    return unsubscribe;
  }, [isMultiplayer, mpRoomCode]);

  // Reflect Firebase round state into local state
  useEffect(() => {
    if (!isMultiplayer || !mpRoundState) return;

    setRound(mpRoundState.number);
    setIsRoundActive(mpRoundState.isActive);

    if (mpRoundState.isActive) {
      const remaining = Math.max(0, Math.ceil((mpRoundState.endTime - Date.now()) / 1000));
      setTimeRemaining(remaining);
    }
  }, [isMultiplayer, mpRoundState?.number, mpRoundState?.isActive, mpRoundState?.endTime]);

  // ============================================
  // MULTIPLAYER CONNECTION MONITORING (Phase 8E)
  // ============================================
  //
  // The opponent's PlayerState.updatedAt doubles as a heartbeat — it is rewritten
  // every 500ms by the existing state interval, so no extra Firebase traffic is
  // needed. We tick a local clock once a second and measure staleness against it
  // (rather than against snapshot arrivals, which stop entirely on disconnect).

  useEffect(() => {
    if (!isMultiplayer) return;
    const interval = setInterval(() => setMpNowTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isMultiplayer]);

  const mpMsSinceOpponentSeen =
    isMultiplayer && opponentState ? Math.max(0, mpNowTick - opponentState.updatedAt) : null;

  const isOpponentStale =
    mpMsSinceOpponentSeen !== null && mpMsSinceOpponentSeen > MP_STALE_MS;

  const mpMsUntilForfeit =
    mpMsSinceOpponentSeen !== null ? Math.max(0, MP_FORFEIT_MS - mpMsSinceOpponentSeen) : 0;

  // Remaining seconds stashed when a round is paused for a disconnect
  const mpPausedRemainingRef = useRef<number | null>(null);

  // Host pauses the active round while the opponent is missing, and resumes it
  // with the same remaining time once they return. Guests never write round state.
  useEffect(() => {
    if (!isMultiplayer || !mpIsHost || !mpRoomCode || !mpRoundState) return;

    if (isOpponentStale && mpRoundState.isActive) {
      const remaining = Math.max(1, Math.ceil((mpRoundState.endTime - Date.now()) / 1000));
      mpPausedRemainingRef.current = remaining;
      fbSetRoundState(mpRoomCode, { ...mpRoundState, isActive: false }).catch(() => {});
      showToast('Round paused — opponent disconnected', 'rebel');
    } else if (!isOpponentStale && !mpRoundState.isActive && mpPausedRemainingRef.current !== null) {
      const remaining = mpPausedRemainingRef.current;
      mpPausedRemainingRef.current = null;
      fbSetRoundState(mpRoomCode, {
        ...mpRoundState,
        isActive: true,
        endTime: Date.now() + remaining * 1000,
      }).catch(() => {});
      showToast('Opponent reconnected — round resumed', 'stability');
    }
  }, [isMultiplayer, mpIsHost, mpRoomCode, isOpponentStale, mpRoundState]);

  // Forfeit: opponent gone past the threshold — award the win
  useEffect(() => {
    if (!isMultiplayer || showGameOver || round === 0) return;
    if (mpMsSinceOpponentSeen !== null && mpMsSinceOpponentSeen >= MP_FORFEIT_MS) {
      mpPausedRemainingRef.current = null;
      setMpWonByForfeit(true);
      setIsRoundActive(false);
      setShowGameOver(true);
    }
  }, [isMultiplayer, mpMsSinceOpponentSeen, showGameOver, round]);

  // Host migration — if the HOST is the one who vanished, the surviving guest
  // promotes itself so round advancement isn't dead in the water. All round state
  // already lives in Firebase, so promotion costs nothing but the flag.
  const mpPromotionAttemptedRef = useRef(false);
  useEffect(() => {
    if (!isMultiplayer || mpIsHost || !mpRoomCode || !mpOpponentId) return;
    if (!isOpponentStale || showGameOver) return;
    if (mpPromotionAttemptedRef.current) return;

    mpPromotionAttemptedRef.current = true;
    fbPromoteToHost(mpRoomCode, playerId, mpOpponentId)
      .then((promoted) => {
        if (promoted) {
          setMpIsHost(true);
          showToast('You are now the host', 'stability');
          saveActiveSession({
            roomCode: mpRoomCode,
            opponentId: mpOpponentId,
            opponentName: mpOpponentName,
            isHost: true,
            startedAt: Date.now(),
          });
        }
      })
      .catch(() => { /* non-fatal — forfeit timer still runs */ });
  }, [isMultiplayer, mpIsHost, mpRoomCode, mpOpponentId, isOpponentStale, showGameOver, playerId, mpOpponentName]);

  // Reset promotion guard when the opponent returns
  useEffect(() => {
    if (!isOpponentStale) mpPromotionAttemptedRef.current = false;
  }, [isOpponentStale]);

  // Clear the saved session once the game is over — nothing left to rejoin
  useEffect(() => {
    if (showGameOver) clearActiveSession();
  }, [showGameOver]);

  // Listen for sabotages aimed at this player (multiplayer only)
  useEffect(() => {
    if (!isMultiplayer || !mpRoomCode || !playerId) return;
    const unsubscribe = fbListenToSabotage(mpRoomCode, playerId, (action) => {
      receiveSabotage(action.fromName);
    });
    return unsubscribe;
  }, [isMultiplayer, mpRoomCode, playerId, receiveSabotage]);

  /** Send a sabotage at the opponent. Costs gold, once per round. */
  const handleSabotage = useCallback(() => {
    if (!isRoundActive) {
      Sounds.buildError();
      showToast('Only during a round', 'error');
      return;
    }
    if (sabotageUsedRound === round) {
      Sounds.buildError();
      showToast('Already sent rebels this round', 'error');
      return;
    }
    if (gold < REBEL_SPAWN_COST) {
      Sounds.buildError();
      showToast(`Need ${REBEL_SPAWN_COST} gold`, 'error');
      return;
    }

    if (isMultiplayer) {
      if (!mpRoomCode || !mpOpponentId) return;
      setGold((g) => g - REBEL_SPAWN_COST);
      setSabotageUsedRound(round);
      fbPushSabotage(mpRoomCode, mpOpponentId, {
        fromPlayerId: playerId,
        fromName: playerName || 'Opponent',
        sentAt: Date.now(),
      }).catch(() => { /* non-fatal — gold already spent, same as any lost action */ });
      Sounds.rebelAppear();
      showToast(`Rebels sent to ${mpOpponentName}!`, 'rebel');
      return;
    }

    // Solo — apply directly to the AI island
    const ok = sabotageAI();
    if (!ok) {
      Sounds.buildError();
      showToast('No unprotected tiles — gold refunded', 'error');
      return;
    }
    setGold((g) => g - REBEL_SPAWN_COST);
    setSabotageUsedRound(round);
    Sounds.rebelAppear();
    showToast('Rebels sent to the AI!', 'rebel');
  }, [isRoundActive, sabotageUsedRound, round, gold, isMultiplayer, mpRoomCode, mpOpponentId, playerId, playerName, mpOpponentName, sabotageAI]);

  // ============================================
  // SPAWN-LOCALLY FUNCTIONS (Phase 8C.4)
  // ============================================
  // Used by both the local dice-roll path (solo / MP host) and the
  // event listener (MP guest, and MP host receiving its own broadcast).

  const computeCloudPath = useCallback((cloudWidth: number, cloudHeight: number) => {
    const margin = 20;
    const gridW = GRID_WIDTH * tileSize;
    const gridH = GRID_HEIGHT * tileSize;
    const gridX = (screenWidth - gridW) / 2;
    const gridY = 56 + ((screenHeight - 56) - gridH) / 2;
    const randIslandY = gridY + Math.random() * gridH - cloudHeight / 2;
    const randIslandX = gridX + Math.random() * gridW - cloudWidth / 2;
    const angleVariation = (Math.random() - 0.5) * screenHeight * 0.15;
    const dir = Math.floor(Math.random() * 8);
    let sX: number, sY: number, eX: number, eY: number;
    switch (dir) {
      case 0: sX = -margin; sY = randIslandY; eX = screenWidth + margin; eY = randIslandY + angleVariation; break;
      case 1: sX = screenWidth + margin; sY = randIslandY; eX = -margin; eY = randIslandY + angleVariation; break;
      case 2: sX = randIslandX; sY = -margin; eX = randIslandX + angleVariation; eY = screenHeight + margin; break;
      case 3: sX = randIslandX; sY = screenHeight + margin; eX = randIslandX + angleVariation; eY = -margin; break;
      case 4: sX = -margin; sY = -margin; eX = screenWidth + margin; eY = screenHeight + margin; break;
      case 5: sX = screenWidth + margin; sY = -margin; eX = -margin; eY = screenHeight + margin; break;
      case 6: sX = -margin; sY = screenHeight + margin; eX = screenWidth + margin; eY = -margin; break;
      case 7: default: sX = screenWidth + margin; sY = screenHeight + margin; eX = -margin; eY = -margin; break;
    }
    return { sX, sY, eX, eY };
  }, [tileSize, screenWidth, screenHeight]);

  const spawnRainCloudLocally = useCallback(() => {
    if (rainCloud || stormCloud || hurricaneCloud) return;
    const cloudWidth = tileSize * 2;
    const cloudHeight = tileSize * 1.5;
    const { sX, sY, eX, eY } = computeCloudPath(cloudWidth, cloudHeight);
    const pathLength = Math.sqrt(Math.pow(eX - sX, 2) + Math.pow(eY - sY, 2));
    const speed = 25;
    const dur = Math.max(10000, Math.min(60000, (pathLength / speed) * 1000));
    rainStartTimeRef.current = Date.now();
    rainGoldAccumRef.current = 0;
    rainTotalPausedRef.current = 0;
    rainPauseStartRef.current = 0;
    setRainCloud({ startX: sX, startY: sY, endX: eX, endY: eY, duration: dur });
    Sounds.thunderCrack();
  }, [rainCloud, stormCloud, hurricaneCloud, tileSize, computeCloudPath]);

  const spawnStormCloudLocally = useCallback(() => {
    if (stormCloud || hurricaneCloud) return;
    setRainCloud(null); // Storm overrides rain
    const stormDiff = STORM_DIFFICULTY[difficulty] || STORM_DIFFICULTY.normal;
    const cloudWidth = tileSize * 2.4;
    const cloudHeight = tileSize * 2;
    const { sX, sY, eX, eY } = computeCloudPath(cloudWidth, cloudHeight);
    const pathLength = Math.sqrt(Math.pow(eX - sX, 2) + Math.pow(eY - sY, 2));
    const dur = Math.max(10000, Math.min(60000, (pathLength / stormDiff.speed) * 1000));
    stormStartTimeRef.current = Date.now();
    stormDamagedTilesRef.current = new Set();
    stormTotalPausedRef.current = 0;
    stormPauseStartRef.current = 0;
    stormBuildingsDestroyedRef.current = 0;
    stormBoatsSunkRef.current = 0;
    setStormCloud({ startX: sX, startY: sY, endX: eX, endY: eY, duration: dur });
    showToast('⛈️ Tropical storm approaching!', 'rebel');
    Sounds.rebelAppear();
    Sounds.thunderCrack();
  }, [stormCloud, hurricaneCloud, tileSize, difficulty, computeCloudPath]);

  const spawnHurricaneCloudLocally = useCallback(() => {
    if (hurricaneCloud) return;
    setRainCloud(null);
    setStormCloud(null);
    const hurDiff = HURRICANE_DIFFICULTY[difficulty] || HURRICANE_DIFFICULTY.normal;
    const cloudSize = tileSize * 3;
    const { sX, sY, eX, eY } = computeCloudPath(cloudSize, cloudSize);
    const pathLength = Math.sqrt(Math.pow(eX - sX, 2) + Math.pow(eY - sY, 2));
    const dur = Math.max(12000, Math.min(70000, (pathLength / hurDiff.speed) * 1000));
    hurricaneStartTimeRef.current = Date.now();
    hurricaneDamagedTilesRef.current = new Set();
    hurricaneTotalPausedRef.current = 0;
    hurricanePauseStartRef.current = 0;
    hurricaneBuildingsDestroyedRef.current = 0;
    hurricaneBoatsSunkRef.current = 0;
    // Roll this hurricane's severity now, so some are far worse than others
    hurricaneBuildingBudgetRef.current = rollBudget(
      BALANCE.hurricaneMinBuildingsDestroyed,
      BALANCE.hurricaneMaxBuildingsDestroyed
    );
    hurricaneBoatBudgetRef.current = rollBudget(
      BALANCE.hurricaneMinBoatsSunk,
      BALANCE.hurricaneMaxBoatsSunk
    );
    setHurricaneCloud({ startX: sX, startY: sY, endX: eX, endY: eY, duration: dur });
    showToast('🌀 HURRICANE approaching!', 'rebel');
    Sounds.rebelAppear();
    Sounds.thunderCrack();
  }, [hurricaneCloud, tileSize, difficulty, computeCloudPath]);

  const spawnPirateLocally = useCallback(() => {
    if (!island) return;
    const diffSettings = PIRATE_DIFFICULTY[difficulty] || PIRATE_DIFFICULTY.normal;
    if (piratesRef.current.length >= diffSettings.maxActive) return;
    const edge = Math.floor(Math.random() * 4);
    let spawnPos: WaterPosition;
    switch (edge) {
      case 0: spawnPos = { x: Math.random() * GRID_WIDTH, y: 0.1 }; break;
      case 1: spawnPos = { x: Math.random() * GRID_WIDTH, y: GRID_HEIGHT - 0.1 }; break;
      case 2: spawnPos = { x: 0.1, y: Math.random() * GRID_HEIGHT }; break;
      case 3: default: spawnPos = { x: GRID_WIDTH - 0.1, y: Math.random() * GRID_HEIGHT }; break;
    }
    if (!isPointInWater(spawnPos, island)) return;
    const newPirate: PirateShipType = {
      id: `pirate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      position: spawnPos,
      velocity: { vx: 0, vy: 0 },
      speed: diffSettings.speed,
      targetFishId: null,
    };
    piratesRef.current = [...piratesRef.current, newPirate];
    setPirates([...piratesRef.current]);
    showToast('Pirates spotted!', 'rebel');
  }, [island, difficulty]);

  // Subscribe to spawn events from the host (multiplayer only)
  useEffect(() => {
    if (!isMultiplayer || !mpRoomCode) return;
    const unsubscribe = fbListenToSpawnEvents(mpRoomCode, (event) => {
      switch (event.type) {
        case 'rain': spawnRainCloudLocally(); break;
        case 'storm': spawnStormCloudLocally(); break;
        case 'hurricane': spawnHurricaneCloudLocally(); break;
        case 'pirate': spawnPirateLocally(); break;
      }
    });
    return unsubscribe;
  }, [isMultiplayer, mpRoomCode, spawnRainCloudLocally, spawnStormCloudLocally, spawnHurricaneCloudLocally, spawnPirateLocally]);

  // Pause/resume music when app goes to background/foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        Sounds.pauseMusic();
        Sounds.pauseOceanWaves();
      } else if (nextAppState === 'active') {
        Sounds.resumeMusic();
        Sounds.resumeOceanWaves();
      }
    });
    return () => subscription.remove();
  }, []);

  // Toggle music based on game state
  // Menu music: setup screen, before game starts, between rounds
  // Gameplay/tension music: during active rounds (score/rebel-dependent)
  // Victory/defeat music: game over
  const hasRebels = island?.tiles.some(t => t.hasRebel) ?? false;
  useEffect(() => {
    if (!isAudioEnabled) {
      Sounds.stopOceanWaves();
      return;
    }
    if (showSetup) {
      Sounds.playMusic('menu');
      Sounds.stopOceanWaves();
    } else if (showGameOver) {
      const hasAI = aiScore !== undefined;
      const playerWins = hasAI ? score > aiScore : score >= 70;
      Sounds.playMusic(playerWins ? 'victory' : 'defeat');
      Sounds.stopOceanWaves();
    } else if (isRoundActive) {
      Sounds.playMusic((hasRebels || score < 30) ? 'tension' : 'gameplay');
      Sounds.startOceanWaves();
    } else if (round < maxRounds) {
      Sounds.playMusic('menu');
      Sounds.startOceanWaves(); // Keep waves during between-round pause
    } else {
      Sounds.stopMusic();
      Sounds.stopOceanWaves();
    }
  }, [showSetup, isRoundActive, round, maxRounds, isAudioEnabled, showGameOver, score, hasRebels]);

  // Timer effect — solo uses local 1s tick; multiplayer derives from Firebase endTime
  useEffect(() => {
    if (isMultiplayer) {
      if (!isRoundActive || !mpRoundState) return;
      const tick = () => {
        const remaining = Math.max(0, Math.ceil((mpRoundState.endTime - Date.now()) / 1000));
        setTimeRemaining(remaining);
        if (remaining === 0 && isRoundActiveRef.current) {
          // Run scoring locally and broadcast round-end to Firebase (idempotent)
          endRound();
          if (mpRoomCode) {
            fbSetRoundState(mpRoomCode, {
              ...mpRoundState,
              isActive: false,
            }).catch(() => { /* non-fatal */ });
          }
        }
      };
      tick();
      const interval = setInterval(tick, 250);
      return () => clearInterval(interval);
    }

    // Solo timer
    if (isRoundActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => setTimeRemaining(t => t - 1), 1000);
    } else if (isRoundActive && timeRemaining === 0) {
      endRound();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isRoundActive, timeRemaining, isMultiplayer, mpRoundState, mpRoomCode]);

  // Rain cloud spawning during rounds
  useEffect(() => {
    if (isRoundActive) {
      // In MP, only host rolls dice; events are broadcast to both clients
      if (isMultiplayer && !mpIsHost) return;

      const tryRollRainSpawn = () => {
        if (rainCloud) return; // Only one cloud at a time
        if (stormCloud) return;
        if (hurricaneCloud) return;
        if (Math.random() < 0.3) {
          if (isMultiplayer && mpRoomCode) {
            fbPushSpawnEvent(mpRoomCode, { type: 'rain', spawnedAt: Date.now() }).catch(() => {});
            // Host also spawns locally for zero perceived latency; the event listener
            // de-duplicates via the rainCloud guard.
          }
          spawnRainCloudLocally();
        }
      };

      rainTimerRef.current = setInterval(tryRollRainSpawn, 5000);
      return () => { if (rainTimerRef.current) clearInterval(rainTimerRef.current); };
    }
  }, [isRoundActive, rainCloud, stormCloud, hurricaneCloud, isMultiplayer, mpIsHost, mpRoomCode, spawnRainCloudLocally]);

  // Rain pause tracking — freeze elapsed time between rounds
  useEffect(() => {
    if (!rainCloud) return;
    if (!isRoundActive) {
      rainPauseStartRef.current = Date.now();
    } else if (rainPauseStartRef.current > 0) {
      rainTotalPausedRef.current += Date.now() - rainPauseStartRef.current;
      rainPauseStartRef.current = 0;
    }
  }, [isRoundActive, rainCloud]);

  // Rain gold detection — check crop overlap every second while cloud is active
  useEffect(() => {
    if (!rainCloud || !island) {
      if (rainGoldIntervalRef.current) {
        clearInterval(rainGoldIntervalRef.current);
        rainGoldIntervalRef.current = null;
      }
      return;
    }
    
    const cloudWidth = tileSize * 2;
    const cloudHeight = tileSize * 1.5;
    const gridW = GRID_WIDTH * tileSize;
    const gridH = GRID_HEIGHT * tileSize;
    const gridOriginX = (screenWidth - gridW) / 2;
    const gridOriginY = 56 + ((screenHeight - 56) - gridH) / 2;
    
    rainGoldIntervalRef.current = setInterval(() => {
      if (!isRoundActiveRef.current) return; // No gold between rounds
      const elapsed = Date.now() - rainStartTimeRef.current - rainTotalPausedRef.current;
      const progress = Math.min(1, elapsed / rainCloud.duration);
      
      // Calculate current cloud position
      const cloudX = rainCloud.startX + (rainCloud.endX - rainCloud.startX) * progress;
      const cloudY = rainCloud.startY + (rainCloud.endY - rainCloud.startY) * progress;
      
      // Check which crop tiles the cloud overlaps
      const cropTiles = island.tiles.filter(t => t.building === 'farm');
      let wateredCrops = 0;
      
      for (const crop of cropTiles) {
        const tileScreenX = gridOriginX + crop.position.x * tileSize;
        const tileScreenY = gridOriginY + crop.position.y * tileSize;
        
        // Bounding box overlap check
        if (
          cloudX < tileScreenX + tileSize &&
          cloudX + cloudWidth > tileScreenX &&
          cloudY < tileScreenY + tileSize &&
          cloudY + cloudHeight > tileScreenY
        ) {
          wateredCrops++;
        }
      }
      
      if (wateredCrops > 0) {
        Sounds.rainStorm();
        setGold(g => g + wateredCrops);
        rainGoldAccumRef.current += wateredCrops;
        roundRainGoldRef.current += wateredCrops;
        showToast(`+${wateredCrops}g from rain!`, 'rain');
      }
    }, 1000);
    
    return () => {
      if (rainGoldIntervalRef.current) {
        clearInterval(rainGoldIntervalRef.current);
        rainGoldIntervalRef.current = null;
      }
    };
  }, [rainCloud, island, tileSize, screenWidth, screenHeight]);

  // Tropical storm spawning during rounds (rarer than rain)
  useEffect(() => {
    if (isRoundActive && round > 1) { // No storms in round 1
      // In MP, only host rolls dice; events are broadcast to both clients
      if (isMultiplayer && !mpIsHost) return;

      const stormDiff = STORM_DIFFICULTY[difficulty] || STORM_DIFFICULTY.normal;
      const tryRollStormSpawn = () => {
        if (stormCloud) return; // Only one storm at a time
        if (hurricaneCloud) return; // Don't spawn storm during hurricane
        if (Math.random() >= stormDiff.spawnChance) return;
        if (isMultiplayer && mpRoomCode) {
          fbPushSpawnEvent(mpRoomCode, { type: 'storm', spawnedAt: Date.now() }).catch(() => {});
        }
        spawnStormCloudLocally();
      };

      stormTimerRef.current = setInterval(tryRollStormSpawn, BALANCE.stormSpawnInterval);
      return () => { if (stormTimerRef.current) clearInterval(stormTimerRef.current); };
    }
  }, [isRoundActive, round, stormCloud, hurricaneCloud, difficulty, isMultiplayer, mpIsHost, mpRoomCode, spawnStormCloudLocally]);

  // Storm pause tracking — freeze elapsed time between rounds
  useEffect(() => {
    if (!stormCloud) return;
    if (!isRoundActive) {
      stormPauseStartRef.current = Date.now();
    } else if (stormPauseStartRef.current > 0) {
      stormTotalPausedRef.current += Date.now() - stormPauseStartRef.current;
      stormPauseStartRef.current = 0;
    }
  }, [isRoundActive, stormCloud]);

  // Tropical storm damage detection
  useEffect(() => {
    if (!stormCloud || !island) {
      if (stormDamageIntervalRef.current) {
        clearInterval(stormDamageIntervalRef.current);
        stormDamageIntervalRef.current = null;
      }
      return;
    }
    
    const stormDiff = STORM_DIFFICULTY[difficulty] || STORM_DIFFICULTY.normal;
    const cloudWidth = tileSize * 2.4;
    const cloudHeight = tileSize * 2;
    const gridW = GRID_WIDTH * tileSize;
    const gridH = GRID_HEIGHT * tileSize;
    const gridOriginX = (screenWidth - gridW) / 2;
    const gridOriginY = 56 + ((screenHeight - 56) - gridH) / 2;
    
    const fortPositions = getFortPositions(island);
    
    stormDamageIntervalRef.current = setInterval(() => {
      if (!isRoundActiveRef.current) return; // No damage between rounds
      const elapsed = Date.now() - stormStartTimeRef.current - stormTotalPausedRef.current;
      const progress = Math.min(1, elapsed / stormCloud.duration);
      
      const cloudX = stormCloud.startX + (stormCloud.endX - stormCloud.startX) * progress;
      const cloudY = stormCloud.startY + (stormCloud.endY - stormCloud.startY) * progress;
      
      // Also water crops like rain does
      const cropTiles = island.tiles.filter(t => t.building === 'farm');
      let wateredCrops = 0;
      for (const crop of cropTiles) {
        const tileScreenX = gridOriginX + crop.position.x * tileSize;
        const tileScreenY = gridOriginY + crop.position.y * tileSize;
        if (cloudX < tileScreenX + tileSize && cloudX + cloudWidth > tileScreenX &&
            cloudY < tileScreenY + tileSize && cloudY + cloudHeight > tileScreenY) {
          wateredCrops++;
        }
      }
      if (wateredCrops > 0) {
        setGold(g => g + wateredCrops);
        roundRainGoldRef.current += wateredCrops;
        showToast(`+${wateredCrops}g from storm rain!`, 'rain');
      }
      
      // Check building damage — only roll once per tile per storm, and never
      // destroy more than BALANCE.stormMaxBuildingsDestroyed in a single storm.
      // Storms are meant to sting; hurricanes are the ones that ruin a round.
      const buildingTiles = island.tiles.filter(t => t.building && t.building !== 'fort');
      
      for (const tile of buildingTiles) {
        if (stormBuildingsDestroyedRef.current >= BALANCE.stormMaxBuildingsDestroyed) break;
        const tileKey = `${tile.position.x},${tile.position.y}`;
        if (stormDamagedTilesRef.current.has(tileKey)) continue; // Already rolled
        
        const tileScreenX = gridOriginX + tile.position.x * tileSize;
        const tileScreenY = gridOriginY + tile.position.y * tileSize;
        
        // Check if storm overlaps this tile
        if (cloudX < tileScreenX + tileSize && cloudX + cloudWidth > tileScreenX &&
            cloudY < tileScreenY + tileSize && cloudY + cloudHeight > tileScreenY) {
          stormDamagedTilesRef.current.add(tileKey); // Mark as rolled
          
          // Forts give 50% protection, not immunity
          const chance = effectiveBuildingDestroyChance(
            stormDiff.buildingDestroy,
            isTileFortProtected(tile.position, fortPositions)
          );
          
          if (Math.random() < chance) {
            stormBuildingsDestroyedRef.current++;
            const buildingName = BUILDINGS.find(b => b.type === tile.building)?.name || tile.building;
            setIsland(prev => ({
              ...prev,
              tiles: prev.tiles.map(t =>
                t.id === tile.id ? { ...t, building: undefined } : t
              ),
            }));
            showToast(`⛈️ Storm destroyed ${buildingName}!`, 'rebel');
            Sounds.boatCrash();
          }
        }
      }
      
      // Check boat damage — boats within a fort's radius are fully immune, and
      // lighthouses halve the odds for boats sheltering near them
      const currentBoats = freeRoamBoatsRef.current;
      const boatsToSink: string[] = [];
      const lighthousePositions = buildingPositions(island, 'lighthouse');
      
      for (const boat of currentBoats) {
        if (stormBoatsSunkRef.current + boatsToSink.length >= BALANCE.stormMaxBoatsSunk) break;
        const boatScreenX = gridOriginX + boat.position.x * tileSize;
        const boatScreenY = gridOriginY + boat.position.y * tileSize;
        
        if (cloudX < boatScreenX + tileSize && cloudX + cloudWidth > boatScreenX &&
            cloudY < boatScreenY + tileSize && cloudY + cloudHeight > boatScreenY) {
          
          // 100% fort protection for boats
          if (isBoatNearFort(boat.position, fortPositions)) continue;
          
          const sinkChance = stormDiff.boatSink * lighthouseSinkMultiplier(boat.position, lighthousePositions);
          if (Math.random() < sinkChance) {
            boatsToSink.push(boat.id);
          }
        }
      }
      
      if (boatsToSink.length > 0) {
        stormBoatsSunkRef.current += boatsToSink.length;
        sinkBoats(boatsToSink);
        
        for (const boatId of boatsToSink) {
          const sunkBoat = currentBoats.find(b => b.id === boatId);
          const casualties = Math.floor(Math.random() * (BALANCE.stormCasualtiesMax - BALANCE.stormCasualtiesMin + 1)) + BALANCE.stormCasualtiesMin;
          if (casualties > 0) {
            setPopulation(p => Math.max(0, p - casualties));
          }
          const boatLabel = sunkBoat?.type === 'fishing' ? 'fishing boat' : 'PT boat';
          showToast(`⛈️ Storm sank your ${boatLabel}!${casualties > 0 ? ` -${casualties} people` : ''}`, 'rebel');
          Sounds.boatCrash();
        }
      }
    }, BALANCE.stormDamageInterval);
    
    return () => {
      if (stormDamageIntervalRef.current) {
        clearInterval(stormDamageIntervalRef.current);
        stormDamageIntervalRef.current = null;
      }
    };
  }, [stormCloud, island, tileSize, screenWidth, screenHeight, difficulty]);

  // Hurricane spawning during rounds (rare, late-game)
  useEffect(() => {
    if (isRoundActive && round >= BALANCE.hurricaneMinRound) {
      // In MP, only host rolls dice; events are broadcast to both clients
      if (isMultiplayer && !mpIsHost) return;

      const hurDiff = HURRICANE_DIFFICULTY[difficulty] || HURRICANE_DIFFICULTY.normal;
      const tryRollHurricaneSpawn = () => {
        if (hurricaneCloud) return; // Only one hurricane at a time
        if (Math.random() >= hurDiff.spawnChance) return;
        if (isMultiplayer && mpRoomCode) {
          fbPushSpawnEvent(mpRoomCode, { type: 'hurricane', spawnedAt: Date.now() }).catch(() => {});
        }
        spawnHurricaneCloudLocally();
      };

      hurricaneTimerRef.current = setInterval(tryRollHurricaneSpawn, BALANCE.hurricaneSpawnInterval);
      return () => { if (hurricaneTimerRef.current) clearInterval(hurricaneTimerRef.current); };
    }
  }, [isRoundActive, round, hurricaneCloud, difficulty, isMultiplayer, mpIsHost, mpRoomCode, spawnHurricaneCloudLocally]);

  // Hurricane pause tracking — freeze elapsed time between rounds
  useEffect(() => {
    if (!hurricaneCloud) return;
    if (!isRoundActive) {
      // Round ended while hurricane active — start tracking pause
      hurricanePauseStartRef.current = Date.now();
    } else if (hurricanePauseStartRef.current > 0) {
      // Round resumed — accumulate paused time
      hurricaneTotalPausedRef.current += Date.now() - hurricanePauseStartRef.current;
      hurricanePauseStartRef.current = 0;
    }
  }, [isRoundActive, hurricaneCloud]);

  // Hurricane damage detection — much more destructive than storm
  useEffect(() => {
    if (!hurricaneCloud || !island) {
      if (hurricaneDamageIntervalRef.current) {
        clearInterval(hurricaneDamageIntervalRef.current);
        hurricaneDamageIntervalRef.current = null;
      }
      return;
    }
    
    const hurDiff = HURRICANE_DIFFICULTY[difficulty] || HURRICANE_DIFFICULTY.normal;
    const cloudSize = tileSize * 3;
    const gridW = GRID_WIDTH * tileSize;
    const gridH = GRID_HEIGHT * tileSize;
    const gridOriginX = (screenWidth - gridW) / 2;
    const gridOriginY = 56 + ((screenHeight - 56) - gridH) / 2;
    
    hurricaneDamageIntervalRef.current = setInterval(() => {
      if (!isRoundActiveRef.current) return; // No damage between rounds
      const elapsed = Date.now() - hurricaneStartTimeRef.current - hurricaneTotalPausedRef.current;
      const progress = Math.min(1, elapsed / hurricaneCloud.duration);
      
      const cloudX = hurricaneCloud.startX + (hurricaneCloud.endX - hurricaneCloud.startX) * progress;
      const cloudY = hurricaneCloud.startY + (hurricaneCloud.endY - hurricaneCloud.startY) * progress;
      
      // Water crops for gold (hurricane rain still benefits surviving farms)
      const cropTiles = island.tiles.filter(t => t.building === 'farm');
      let wateredCrops = 0;
      for (const crop of cropTiles) {
        const tileScreenX = gridOriginX + crop.position.x * tileSize;
        const tileScreenY = gridOriginY + crop.position.y * tileSize;
        if (cloudX < tileScreenX + tileSize && cloudX + cloudSize > tileScreenX &&
            cloudY < tileScreenY + tileSize && cloudY + cloudSize > tileScreenY) {
          wateredCrops++;
        }
      }
      if (wateredCrops > 0) {
        setGold(g => g + wateredCrops);
        roundRainGoldRef.current += wateredCrops;
        showToast(`+${wateredCrops}g from hurricane rain!`, 'rain');
      }
      
      // Check building damage — hurricanes can destroy forts too, but respect this
      // hurricane's rolled budget rather than a fixed cap
      if (hurricaneBuildingsDestroyedRef.current < hurricaneBuildingBudgetRef.current) {
        const buildingTiles = island.tiles.filter(t => t.building);
        const fortPositions = getFortPositions(island);
        
        for (const tile of buildingTiles) {
          if (hurricaneBuildingsDestroyedRef.current >= hurricaneBuildingBudgetRef.current) break;
          const tileKey = `${tile.position.x},${tile.position.y}`;
          if (hurricaneDamagedTilesRef.current.has(tileKey)) continue;
          
          const tileScreenX = gridOriginX + tile.position.x * tileSize;
          const tileScreenY = gridOriginY + tile.position.y * tileSize;
          
          if (cloudX < tileScreenX + tileSize && cloudX + cloudSize > tileScreenX &&
              cloudY < tileScreenY + tileSize && cloudY + cloudSize > tileScreenY) {
            hurricaneDamagedTilesRef.current.add(tileKey);
            
            // Forts have a lower destroy chance; other buildings use the standard
            // rate, halved when they sit inside a fort's radius
            const baseChance = tile.building === 'fort'
              ? hurDiff.fortDestroy
              : effectiveBuildingDestroyChance(
                  hurDiff.buildingDestroy,
                  isTileFortProtected(tile.position, fortPositions)
                );
            
            if (Math.random() < baseChance) {
              hurricaneBuildingsDestroyedRef.current++;
              const buildingName = BUILDINGS.find(b => b.type === tile.building)?.name || tile.building;
              setIsland(prev => ({
                ...prev,
                tiles: prev.tiles.map(t =>
                  t.id === tile.id ? { ...t, building: undefined } : t
                ),
              }));
              showToast(`🌀 Hurricane destroyed ${buildingName}!`, 'rebel');
              Sounds.boatCrash();
            }
          }
        }
      }
      
      // Check boat damage — capped by this hurricane's rolled boat budget, and
      // boats inside a fort's radius are fully immune (changed Aug 2026: hurricanes
      // used to ignore forts entirely)
      const currentBoats = freeRoamBoatsRef.current;
      const boatsToSink: string[] = [];
      const boatFortPositions = getFortPositions(island);
      const hurLighthousePositions = buildingPositions(island, 'lighthouse');
      
      for (const boat of currentBoats) {
        if (hurricaneBoatsSunkRef.current + boatsToSink.length >= hurricaneBoatBudgetRef.current) break;
        const boatScreenX = gridOriginX + boat.position.x * tileSize;
        const boatScreenY = gridOriginY + boat.position.y * tileSize;
        
        if (cloudX < boatScreenX + tileSize && cloudX + cloudSize > boatScreenX &&
            cloudY < boatScreenY + tileSize && cloudY + cloudSize > boatScreenY) {
          if (isBoatNearFort(boat.position, boatFortPositions)) continue;
          const sinkChance = hurDiff.boatSink * lighthouseSinkMultiplier(boat.position, hurLighthousePositions);
          if (Math.random() < sinkChance) {
            boatsToSink.push(boat.id);
          }
        }
      }
      
      if (boatsToSink.length > 0) {
        hurricaneBoatsSunkRef.current += boatsToSink.length;
        sinkBoats(boatsToSink);
        
        for (const boatId of boatsToSink) {
          const sunkBoat = currentBoats.find(b => b.id === boatId);
          const casualties = Math.floor(Math.random() * (BALANCE.hurricaneCasualtiesMax - BALANCE.hurricaneCasualtiesMin + 1)) + BALANCE.hurricaneCasualtiesMin;
          if (casualties > 0) {
            setPopulation(p => Math.max(0, p - casualties));
          }
          const boatLabel = sunkBoat?.type === 'fishing' ? 'fishing boat' : 'PT boat';
          showToast(`🌀 Hurricane sank your ${boatLabel}!${casualties > 0 ? ` -${casualties} people` : ''}`, 'rebel');
          Sounds.boatCrash();
        }
      }
    }, BALANCE.hurricaneDamageInterval);
    
    return () => {
      if (hurricaneDamageIntervalRef.current) {
        clearInterval(hurricaneDamageIntervalRef.current);
        hurricaneDamageIntervalRef.current = null;
      }
    };
  }, [hurricaneCloud, island, tileSize, screenWidth, screenHeight, difficulty]);

  // Free-roam boat physics game loop
  const selectedBoatRef = useRef<string | null>(null);
  const destinationMarkerRef = useRef<WaterPosition | null>(null);
  
  // Keep refs in sync
  useEffect(() => { selectedBoatRef.current = selectedBoat; }, [selectedBoat]);
  useEffect(() => { destinationMarkerRef.current = destinationMarker; }, [destinationMarker]);
  useEffect(() => { isRoundActiveRef.current = isRoundActive; }, [isRoundActive]);

  // Clear the selection if the selected boat no longer exists.
  //
  // Without this the player is soft-locked: tapping land is blocked because a boat
  // is "selected", tapping water does nothing because the boat can't be found, and
  // the boat itself is gone so it can't be tapped to deselect. Happens whenever a
  // selected boat is sunk by pirates, a storm, a hurricane, or loses a battle.
  useEffect(() => {
    if (!selectedBoat) return;
    if (!freeRoamBoats.some(b => b.id === selectedBoat)) {
      setSelectedBoat(null);
      setDestinationMarker(null);
    }
  }, [freeRoamBoats, selectedBoat]);
  
  useEffect(() => {
    if (!coastline || !island || freeRoamBoats.length === 0) {
      return;
    }
    
    const updateBoats = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTimeRef.current) / 1000;
      lastUpdateTimeRef.current = now;
      
      // Cap deltaTime to prevent huge jumps
      const dt = Math.min(deltaTime, 0.05);
      
      setFreeRoamBoats(prevBoats => {
        const updated = prevBoats.map(boat => 
          updateBoat(boat, dt, coastline, island, prevBoats)
        );
        
        // Clear destination marker when selected boat arrives (using refs for current values)
        const selId = selectedBoatRef.current;
        if (selId && destinationMarkerRef.current) {
          const selBoat = updated.find(b => b.id === selId);
          if (selBoat && !selBoat.isMoving) {
            setDestinationMarker(null);
          }
        }
        
        // Keep boats ref in sync for fish gold detection
        freeRoamBoatsRef.current = updated;
        
        return updated;
      });
      
      boatUpdateRef.current = requestAnimationFrame(updateBoats);
    };
    
    lastUpdateTimeRef.current = Date.now();
    boatUpdateRef.current = requestAnimationFrame(updateBoats);
    
    return () => {
      if (boatUpdateRef.current) {
        cancelAnimationFrame(boatUpdateRef.current);
      }
    };
  }, [coastline, island, freeRoamBoats.length > 0]);

  // ============================================
  // FISH SCHOOL SYSTEM
  // ============================================
  
  /**
   * Spawn fish schools at random valid water positions
   */
  const spawnFishSchools = useCallback(() => {
    if (!island) return;
    
    const schools: FishSchoolType[] = [];
    const gridW = GRID_WIDTH;
    const gridH = GRID_HEIGHT;
    
    for (let i = 0; i < BALANCE.fishSchoolCount; i++) {
      let attempts = 0;
      let pos: WaterPosition | null = null;
      
      // Try random positions until we find valid water
      while (attempts < 50) {
        const candidate: WaterPosition = {
          x: Math.random() * gridW,
          y: Math.random() * gridH,
        };
        if (isPointInWater(candidate, island)) {
          pos = candidate;
          break;
        }
        attempts++;
      }
      
      if (!pos) continue;
      
      // Random drift direction
      const angle = Math.random() * Math.PI * 2;
      const speed = BALANCE.fishSchoolSpeed;
      
      schools.push({
        id: `fish-${Date.now()}-${i}`,
        position: pos,
        velocity: {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        },
        size: BALANCE.fishSchoolSize,
      });
    }
    
    setFishSchools(schools);
    fishSchoolsRef.current = schools;
  }, [island]);
  
  // Spawn fish when round becomes active
  useEffect(() => {
    if (isRoundActive && island) {
      spawnFishSchools();
    }
  }, [isRoundActive, island]);
  
  // Fish movement — update ref every 100ms, sync to state every 500ms for rendering
  useEffect(() => {
    if (!isRoundActive || fishSchoolsRef.current.length === 0 || !island) return;
    
    fishRenderSyncRef.current = 0;
    
    fishMoveIntervalRef.current = setInterval(() => {
      fishSchoolsRef.current = fishSchoolsRef.current.map(school => {
        const dt = 0.1; // 100ms
        let newX = school.position.x + school.velocity.vx * dt;
        let newY = school.position.y + school.velocity.vy * dt;
        let newVx = school.velocity.vx;
        let newVy = school.velocity.vy;
        
        // Bounce off grid boundaries with padding
        const pad = 0.5;
        if (newX < pad || newX > GRID_WIDTH - pad) {
          newVx = -newVx;
          newX = Math.max(pad, Math.min(GRID_WIDTH - pad, newX));
        }
        if (newY < pad || newY > GRID_HEIGHT - pad) {
          newVy = -newVy;
          newY = Math.max(pad, Math.min(GRID_HEIGHT - pad, newY));
        }
        
        const newPos: WaterPosition = { x: newX, y: newY };
        
        // If new position is on land, reverse direction and stay put
        if (!isPointInWater(newPos, island)) {
          const angle = Math.atan2(-newVy, -newVx) + (Math.random() - 0.5) * Math.PI * 0.5;
          const speed = BALANCE.fishSchoolSpeed;
          return {
            ...school,
            velocity: {
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
            },
          };
        }
        
        return {
          ...school,
          position: newPos,
          velocity: { vx: newVx, vy: newVy },
        };
      });
      
      // Sync to React state every ~500ms (every 5th tick) for rendering
      fishRenderSyncRef.current++;
      if (fishRenderSyncRef.current >= 5) {
        fishRenderSyncRef.current = 0;
        setFishSchools([...fishSchoolsRef.current]);
      }
    }, 100);
    
    return () => {
      if (fishMoveIntervalRef.current) {
        clearInterval(fishMoveIntervalRef.current);
        fishMoveIntervalRef.current = null;
      }
    };
  }, [isRoundActive, fishSchools.length > 0, island]);
  
  // Fish gold detection — reads current positions from refs
  useEffect(() => {
    if (!isRoundActive || fishSchoolsRef.current.length === 0 || freeRoamBoats.length === 0) {
      if (fishGoldIntervalRef.current) {
        clearInterval(fishGoldIntervalRef.current);
        fishGoldIntervalRef.current = null;
      }
      return;
    }
    
    fishGoldIntervalRef.current = setInterval(() => {
      const currentBoats = freeRoamBoatsRef.current;
      const currentFish = fishSchoolsRef.current;
      
      const fishingBoats = currentBoats.filter(b => b.type === 'fishing');
      if (fishingBoats.length === 0 || currentFish.length === 0) return;
      
      // Enhanced Mode: docks boost boats fishing nearby
      const dockPositions = island ? buildingPositions(island, 'dock') : [];
      let totalGold = 0;
      
      for (const boat of fishingBoats) {
        for (const school of currentFish) {
          const dist = waterDistance(boat.position, school.position);
          // Boat must be directly over the fish school to earn gold
          if (dist < school.size) {
            totalGold += BALANCE.fishingGoldPerTick * dockMultiplierFor(boat.position, dockPositions);
            break; // One boat can only fish from one school per tick
          }
        }
      }
      
      totalGold = Math.round(totalGold);
      
      if (totalGold > 0) {
        setGold(g => g + totalGold);
        roundFishingGoldRef.current += totalGold;
        showToast(`+${totalGold}g fishing!`, 'gold');
        Sounds.boatFishing();
      }
    }, BALANCE.fishGoldCheckInterval);
    
    return () => {
      if (fishGoldIntervalRef.current) {
        clearInterval(fishGoldIntervalRef.current);
        fishGoldIntervalRef.current = null;
      }
    };
  }, [isRoundActive, fishSchools.length > 0, freeRoamBoats.length > 0]);

  // ============================================
  // PIRATE SHIP SYSTEM
  // ============================================
  
  // Pirate spawning — host rolls dice; events broadcast to both clients
  useEffect(() => {
    if (!isRoundActive || !island) {
      if (pirateSpawnIntervalRef.current) {
        clearInterval(pirateSpawnIntervalRef.current);
        pirateSpawnIntervalRef.current = null;
      }
      return;
    }

    // In MP, only host rolls dice; events are broadcast to both clients
    if (isMultiplayer && !mpIsHost) return;

    const diffSettings = PIRATE_DIFFICULTY[difficulty] || PIRATE_DIFFICULTY.normal;

    pirateSpawnIntervalRef.current = setInterval(() => {
      // Check max active (host's local count is the source of truth for the dice roll)
      if (piratesRef.current.length >= diffSettings.maxActive) return;
      // Random spawn chance
      if (Math.random() > diffSettings.spawnChance) return;

      if (isMultiplayer && mpRoomCode) {
        // Pirates have no singleton guard (several can be active at once), so unlike
        // the weather types the host must NOT also spawn locally — it would receive
        // its own broadcast and end up with two pirates from one dice roll.
        fbPushSpawnEvent(mpRoomCode, { type: 'pirate', spawnedAt: Date.now() }).catch(() => {});
        return;
      }
      spawnPirateLocally();
    }, BALANCE.pirateSpawnInterval);

    return () => {
      if (pirateSpawnIntervalRef.current) {
        clearInterval(pirateSpawnIntervalRef.current);
        pirateSpawnIntervalRef.current = null;
      }
    };
  }, [isRoundActive, island, difficulty, isMultiplayer, mpIsHost, mpRoomCode, spawnPirateLocally]);
  
  // Pirate movement + collision — update every 100ms
  useEffect(() => {
    if (!isRoundActive || !island) {
      if (pirateUpdateIntervalRef.current) {
        clearInterval(pirateUpdateIntervalRef.current);
        pirateUpdateIntervalRef.current = null;
      }
      return;
    }
    
    pirateRenderSyncRef.current = 0;
    
    pirateUpdateIntervalRef.current = setInterval(() => {
      if (piratesRef.current.length === 0) return;
      
      const dt = 0.1;
      const currentFish = fishSchoolsRef.current;
      const currentBoats = freeRoamBoatsRef.current;
      const sinkRadius = BALANCE.pirateSinkRadius;
      
      let piratesSunk: string[] = [];
      let boatsSunk: string[] = [];
      let casualties = 0;
      let battleStarted = false;
      
      // Update each pirate
      piratesRef.current = piratesRef.current.map(pirate => {
        // Contact with a PT boat — start a battle. The outcome is rolled HERE, before
        // any animation, so the odds are unaffected by the presentation. Both ships
        // are removed from play for the duration and the winner is restored when the
        // overlay finishes (see resolveBattle).
        if (!battleRef.current && !battleStarted) {
          for (const boat of currentBoats) {
            if (boat.type !== 'pt') continue;
            const dist = waterDistance(pirate.position, boat.position);
            if (dist < sinkRadius) {
              const ptWins = Math.random() >= BALANCE.ptBoatLossChance;
              battleRef.current = { ptBoat: boat, pirate, ptWins };
              battleStarted = true;
              // Pull the PT boat out of play for the fight
              freeRoamBoatsRef.current = freeRoamBoatsRef.current.filter(b => b.id !== boat.id);
              setFreeRoamBoats([...freeRoamBoatsRef.current]);
              setBattlePlan(buildBattlePlan(ptWins));
              return null as any; // Pirate removed from play too; filtered below
            }
          }
        }
        
        // Check collision with fishing boats — fishing boat gets sunk
        for (const boat of currentBoats) {
          if (boat.type !== 'fishing') continue;
          // Don't target boats near forts
          if (isBoatFortProtected(boat, island)) continue;
          const dist = waterDistance(pirate.position, boat.position);
          if (dist < sinkRadius) {
            boatsSunk.push(boat.id);
            casualties += BALANCE.pirateCasualtiesMin + 
              Math.floor(Math.random() * (BALANCE.pirateCasualtiesMax - BALANCE.pirateCasualtiesMin));
          }
        }
        
        // Navigate toward nearest fish school (where fishing boats likely are)
        let targetPos: WaterPosition | null = null;
        
        if (currentFish.length > 0) {
          // Find closest fish school, but avoid PT boats
          let bestDist = Infinity;
          for (const fish of currentFish) {
            // Check if a PT boat is near this fish school
            const ptNearby = currentBoats.some(b => 
              b.type === 'pt' && waterDistance(b.position, fish.position) < 2.0
            );
            if (ptNearby) continue; // Pirates avoid PT boats (original behavior)
            
            const d = waterDistance(pirate.position, fish.position);
            if (d < bestDist) {
              bestDist = d;
              targetPos = fish.position;
            }
          }
        }
        
        // No safe fish target — wander. The target PERSISTS until reached, otherwise
        // a fresh random point every 100ms makes the pirate jitter on the spot and
        // grind itself into the coastline.
        let wanderTarget = pirate.wanderTarget ?? null;
        if (!targetPos) {
          if (!wanderTarget || waterDistance(pirate.position, wanderTarget) < 0.6) {
            wanderTarget = pickWanderTarget(island);
          }
          targetPos = wanderTarget;
        } else {
          wanderTarget = null; // Chasing fish again — drop the wander target
        }
        
        // Move toward target
        const dx = targetPos.x - pirate.position.x;
        const dy = targetPos.y - pirate.position.y;
        const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
        const dirX = dx / dist;
        const dirY = dy / dist;
        
        const moveDistance = pirate.speed * dt;
        const desiredX = pirate.position.x + dirX * moveDistance;
        const desiredY = pirate.position.y + dirY * moveDistance;
        
        const clamp = (v: number, max: number) => Math.max(0.1, Math.min(max - 0.1, v));
        
        // Try the full move, then slide along each axis independently. Sliding is
        // what lets a pirate follow a coastline instead of pressing into it — the
        // previous code only reversed `velocity`, which this loop never reads, so a
        // blocked pirate recomputed the same blocked move forever and never escaped.
        const candidates: WaterPosition[] = [
          { x: clamp(desiredX, GRID_WIDTH), y: clamp(desiredY, GRID_HEIGHT) },
          { x: clamp(desiredX, GRID_WIDTH), y: pirate.position.y },
          { x: pirate.position.x, y: clamp(desiredY, GRID_HEIGHT) },
        ];
        
        let moved: WaterPosition | null = null;
        for (const candidate of candidates) {
          if (isPointInWater(candidate, island)) {
            moved = candidate;
            break;
          }
        }
        
        if (moved) {
          const actuallyMoved = waterDistance(pirate.position, moved) > 0.01;
          return {
            ...pirate,
            position: moved,
            velocity: { vx: dirX * pirate.speed, vy: dirY * pirate.speed },
            wanderTarget,
            stuckTicks: actuallyMoved ? 0 : (pirate.stuckTicks ?? 0) + 1,
          };
        }
        
        // Fully boxed in. Count it, and after a short grace period pick a brand new
        // wander target somewhere else entirely so the pirate commits to a different
        // direction rather than retrying the same blocked path.
        const stuck = (pirate.stuckTicks ?? 0) + 1;
        return {
          ...pirate,
          stuckTicks: stuck,
          wanderTarget: stuck > 8 ? pickWanderTarget(island) : wanderTarget,
        };
      }).filter(Boolean) as PirateShipType[];
      
      // Remove sunk pirates — capture their positions first so the animation can
      // play where they actually went down
      if (piratesSunk.length > 0) {
        addSinking(
          piratesRef.current
            .filter(p => piratesSunk.includes(p.id))
            .map(p => ({ id: p.id, type: 'pirate' as SinkableType, position: p.position }))
        );
        piratesRef.current = piratesRef.current.filter(p => !piratesSunk.includes(p.id));
        Sounds.boatCrash();
        showToast('PT boat sank the pirates!', 'stability');
      }
      
      // Remove sunk fishing boats
      if (boatsSunk.length > 0) {
        sinkBoats(boatsSunk);
        Sounds.boatCrash();
        if (casualties > 0) {
          setPopulation(p => Math.max(1, p - casualties));
        }
        showToast(`Pirates sank your fishing boat!${casualties > 0 ? ` -${casualties} people` : ''}`, 'rebel');
      }
      
      // Sync to React state periodically
      pirateRenderSyncRef.current++;
      if (pirateRenderSyncRef.current >= 5 || piratesSunk.length > 0 || boatsSunk.length > 0 || battleStarted) {
        pirateRenderSyncRef.current = 0;
        setPirates([...piratesRef.current]);
      }
    }, 100);
    
    return () => {
      if (pirateUpdateIntervalRef.current) {
        clearInterval(pirateUpdateIntervalRef.current);
        pirateUpdateIntervalRef.current = null;
      }
    };
  }, [isRoundActive, island, difficulty]);
  
  /**
   * Pick a random open-water point for a pirate to head toward.
   * Falls back to the map centre if no water is found in a reasonable number of
   * attempts (shouldn't happen, but the loop must always terminate).
   */
  const pickWanderTarget = useCallback((isl: IslandType): WaterPosition => {
    for (let i = 0; i < 20; i++) {
      const candidate: WaterPosition = {
        x: 0.5 + Math.random() * (GRID_WIDTH - 1),
        y: 0.5 + Math.random() * (GRID_HEIGHT - 1),
      };
      if (isPointInWater(candidate, isl)) return candidate;
    }
    return { x: GRID_WIDTH / 2, y: GRID_HEIGHT / 2 };
  }, []);

  // Helper: check if a boat is near a fort (protected from pirates)
  const isBoatFortProtected = useCallback((boat: FreeRoamBoatType, island: IslandType) => {
    const fortTiles = island.tiles.filter(t => t.building === 'fort');
    for (const fort of fortTiles) {
      // Fort protects within ~1.5 tile radius in water units
      const fortCenter: WaterPosition = { x: fort.position.x + 0.5, y: fort.position.y + 0.5 };
      if (waterDistance(boat.position, fortCenter) <= BALANCE.fortRadius + 0.5) {
        return true;
      }
    }
    return false;
  }, []);
  
  // Cleanup pirate intervals on round end
  useEffect(() => {
    if (!isRoundActive) {
      if (pirateSpawnIntervalRef.current) {
        clearInterval(pirateSpawnIntervalRef.current);
        pirateSpawnIntervalRef.current = null;
      }
      if (pirateUpdateIntervalRef.current) {
        clearInterval(pirateUpdateIntervalRef.current);
        pirateUpdateIntervalRef.current = null;
      }
    }
  }, [isRoundActive]);

  const startRound = () => {
    Sounds.buttonClick();
    if (round >= maxRounds) {
      setShowGameOver(true);
      return;
    }

    // Multiplayer: only host writes; both clients react via the round listener
    if (isMultiplayer) {
      if (!mpIsHost || !mpRoomCode) return;
      if (isNextLocked) return; // Opponent is still reading their round summary
      const newRound = round + 1;
      fbSetRoundState(mpRoomCode, {
        number: newRound,
        isActive: true,
        endTime: Date.now() + roundDuration * 1000,
        duration: roundDuration,
        maxRounds,
      }).catch(() => { /* non-fatal */ });
      Sounds.roundStart();
      return;
    }

    // Solo: existing flow with transition animation
    const newRound = round + 1;
    setRound(newRound);
    setShowRoundTransition('start');
  };

  // Expose startRound to advanceFromSummary, which is declared earlier
  startRoundRef.current = startRound;

  const onRoundTransitionComplete = () => {
    if (showRoundTransition === 'start') {
      setShowRoundTransition(null);
      setTimeRemaining(roundDuration);
      setIsRoundActive(true);
      Sounds.roundStart();
    } else if (showRoundTransition === 'end') {
      setShowRoundTransition(null);
    }
  };

  const endRound = () => {
    setIsRoundActive(false);
    Sounds.roundEnd();
    if (!island) return;
    
    const tiles = island.tiles;
    const factories = tiles.filter(t => t.building === 'factory').length;
    const schools = tiles.filter(t => t.building === 'school').length;
    const hospitals = tiles.filter(t => t.building === 'hospital').length;
    const fishingBoats = freeRoamBoats.filter(b => b.type === 'fishing').length;
    const crops = tiles.filter(t => t.building === 'farm').length;
    const houses = tiles.filter(t => t.building === 'house').length;
    const forts = tiles.filter(t => t.building === 'fort').length;
    // Enhanced Mode buildings
    const apartments = tiles.filter(t => t.building === 'apartment').length;
    const granaries = tiles.filter(t => t.building === 'granary').length;
    const marketplaces = tiles.filter(t => t.building === 'marketplace').length;
    
    // Income calculation
    const productivity = Math.min(BALANCE.maxProductivityBonus, (schools + hospitals) * factories + hospitals);
    const factoryIncome = factories * BALANCE.factoryIncome;
    const income = BALANCE.baseRoundIncome + factoryIncome + productivity;
    setGold(g => g + income);
    Sounds.goldReceive();
    
    // Population calculation
    const fertility = Math.max(BALANCE.minFertility, BALANCE.baseFertility + crops * BALANCE.fertilityPerCrop + hospitals * BALANCE.fertilityPerHospital + houses * BALANCE.fertilityPerHouse + schools * BALANCE.fertilityPerSchool) / 100;
    const mortality = Math.min(BALANCE.maxMortality, Math.max(BALANCE.minMortality, BALANCE.baseMortality + hospitals * BALANCE.mortalityPerHospital + factories * BALANCE.mortalityPerFactory)) / 100;
    const newPopulation = Math.min(BALANCE.maxPopulation, Math.max(1, Math.floor(population + population * fertility - population * mortality)));
    if (newPopulation > population) {
      Sounds.populationBoost();
    }
    setPopulation(newPopulation);
    
    // Score breakdown calculation
    //
    // Apartments count as several houses for housing but cost welfare — density
    // without quality of life.
    const housingUnits = houses + apartments * BALANCE.apartmentHousingUnits;
    const housingScore = Math.min(30, Math.floor((housingUnits * 500) / Math.max(1, newPopulation / 100) / 3));

    // Food is computed UNCAPPED first so granaries and marketplaces have a surplus
    // to work with. resolveFoodEconomy applies the cap.
    const rawFoodScore = Math.floor(((fishingBoats + crops) * 500) / Math.max(1, newPopulation / 100) / 3);
    const foodEconomy = resolveFoodEconomy(
      rawFoodScore,
      granaries,
      marketplaces,
      granaryBankRef.current
    );
    const foodScore = foodEconomy.foodScore;
    granaryBankRef.current = foodEconomy.granaryBank;

    if (foodEconomy.marketplaceGold > 0) {
      setGold(g => g + foodEconomy.marketplaceGold);
      showToast(`+${foodEconomy.marketplaceGold}g from marketplace`, 'gold');
    }
    if (foodEconomy.granaryUsed > 0) {
      showToast(`Granary covered ${foodEconomy.granaryUsed} food`, 'stability');
    }

    const welfareScore = Math.max(
      0,
      Math.min(30, (schools + hospitals) * 5 - apartments * BALANCE.apartmentWelfarePenalty)
    );
    const gdpScore = Math.min(30, Math.floor(income / 4));
    const totalScore = Math.min(100, housingScore + foodScore + welfareScore + gdpScore);
    
    setScoreBreakdown({ housing: housingScore, food: foodScore, welfare: welfareScore, gdp: gdpScore });
    setScore(totalScore);
    
    // Rebel spawning (low score = more rebels)
    // Authentic Utopia behavior: rebels destroy buildings on the tile
    let updatedTiles = [...tiles];
    if (totalScore < BALANCE.rebellionLowScore && Math.random() < 0.4) {
      // Spawn rebel on random non-fort-protected tile
      const fortPositions = tiles.filter(t => t.building === 'fort').map(t => t.position);
      const unprotectedTiles = tiles.filter(t => {
        if (t.hasRebel) return false;
        if (t.building === 'fort') return false; // Forts can't be rebelled
        // Check if within fort radius
        for (const fort of fortPositions) {
          if (Math.abs(t.position.x - fort.x) <= BALANCE.fortRadius && 
              Math.abs(t.position.y - fort.y) <= BALANCE.fortRadius) {
            return false;
          }
        }
        return true;
      });
      
      if (unprotectedTiles.length > 0) {
        const rebelTile = unprotectedTiles[Math.floor(Math.random() * unprotectedTiles.length)];
        const destroyedBuilding = rebelTile.building;
        updatedTiles = updatedTiles.map(t => 
          t.id === rebelTile.id ? { ...t, hasRebel: true, building: undefined } : t
        );
        Sounds.rebelAppear();
        if (destroyedBuilding) {
          const buildingName = BUILDINGS.find(b => b.type === destroyedBuilding)?.name || destroyedBuilding;
          showToast(`Rebels destroyed ${buildingName}!`, 'rebel');
        } else {
          showToast('Rebel appeared!', 'rebel');
        }
      }
    }
    
    // Clear rebels if score is high (stability)
    if (totalScore >= BALANCE.stabilityHighScore) {
      const rebelsCleared = updatedTiles.filter(t => t.hasRebel).length;
      if (rebelsCleared > 0) {
        updatedTiles = updatedTiles.map(t => ({ ...t, hasRebel: false }));
        Sounds.stabilityAchieved();
        showToast('Stability restored!', 'stability');
      }
    }
    
    setIsland({ ...island, tiles: updatedTiles });
    
    // Enhanced Mode: PT boats scout the opponent's island between rounds.
    // Lighthouses extend their reach; watchtowers report a fixed area.
    if (fogEnabled) {
      const ptBoats = freeRoamBoats.filter(b => b.type === 'pt').length;
      const lighthouses = tiles.filter(t => t.building === 'lighthouse').length;
      const watchtowers = tiles.filter(t => t.building === 'watchtower').length;
      const count = computeRevealCount(ptBoats, lighthouses, watchtowers);
      if (count > 0) {
        const target = isMultiplayer ? opponentIsland : aiIsland;
        setRevealedTiles(prev => {
          const next = revealTiles(target, prev, count);
          if (next.size > prev.size) {
            showToast(`Scouts revealed ${next.size - prev.size} tiles`, 'stability');
          }
          return next;
        });
      }
    }

    // Process AI round end
    processAIRoundEnd();
    
    // Check for game over
    if (round >= maxRounds) {
      setTimeout(() => setShowGameOver(true), 1500);
    } else {
      // Round summary replaces the old "+Ng income" toast, which nobody noticed.
      // Suppressed on the final round — the end game screen covers it.
      //
      // If this is an ad round, the ad is deferred until the summary is dismissed
      // so the player always sees their result before an ad takes the screen.
      pendingAdRef.current =
        !isMultiplayer && round > 0 && round % AD_ROUND_INTERVAL === 0;

      // Hold the host's NEXT button so the opponent can read their own summary
      if (isMultiplayer) {
        setMpNextUnlockAt(Date.now() + MP_NEXT_LOCKOUT_MS);
      }

      setRoundSummary({
        round,
        baseIncome: BALANCE.baseRoundIncome,
        factoryIncome,
        productivityBonus: productivity,
        fishingGold: roundFishingGoldRef.current,
        rainGold: roundRainGoldRef.current,
        populationBefore: population,
        populationAfter: newPopulation,
        scoreBefore: score,
        scoreAfter: totalScore,
      });
    }
  };

  const isCoastalTile = (position: Position): boolean => {
    if (!island) return false;
    const tileSet = new Set(island.tiles.map(t => `${t.position.x},${t.position.y}`));
    for (const dir of [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]) {
      if (!tileSet.has(`${position.x + dir.x},${position.y + dir.y}`)) return true;
    }
    return false;
  };

  const findAdjacentWater = (position: Position): Position | null => {
    if (!island) return null;
    const tileSet = new Set(island.tiles.map(t => `${t.position.x},${t.position.y}`));
    for (const dir of [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]) {
      const newX = position.x + dir.x, newY = position.y + dir.y;
      if (newX >= 0 && newX < GRID_WIDTH && newY >= 0 && newY < GRID_HEIGHT && !tileSet.has(`${newX},${newY}`)) {
        if (!island.boats.find(b => b.position.x === newX && b.position.y === newY)) {
          return { x: newX, y: newY };
        }
      }
    }
    return null;
  };

  const handleTilePress = (position: Position, tile: Tile) => {
    // Only block if the selected boat actually still exists — a stale id must never
    // lock the player out of building
    if (selectedBoat && freeRoamBoats.some(b => b.id === selectedBoat)) { 
      Sounds.tileClick();
      showToast('Tap water to move, or tap the boat to deselect', 'error');
      return; 
    }
    if (tile.building) { 
      Sounds.tileClick();
      const b = BUILDINGS.find(b => b.type === tile.building);
      const icon = tile.building === 'farm' ? '🌾' : tile.building === 'house' ? '🏠' : tile.building === 'school' ? '🏫' : tile.building === 'factory' ? '🏭' : tile.building === 'fort' ? '🏰' : tile.building === 'hospital' ? '🏥' : '🏗️';
      showToast(`${icon} ${b?.name || ''}: ${b?.description || ''}`, 'build');
      return; 
    }
    if (tile.hasRebel) {
      Sounds.tileClick();
      showToast('Rebels occupy this tile!', 'rebel');
      return;
    }
    
    // During tutorial "tap_tile" step, allow building even before round starts
    if (isTutorialActive && tutorialStep?.id === 'tap_tile') {
      setSelectedTile(position);
      setBuildMenuContext('land');
      setShowBuildMenu(true);
      Sounds.menuOpen();
      // Advance tutorial AFTER opening build menu
      onTutorialAction('tile_tapped');
      return;
    }
    
    if (round === 0) {
      Sounds.tileClick();
      showToast('Press START to begin', 'round');
      return;
    }
    if (!isRoundActive && round > 0 && round < maxRounds) { 
      Sounds.tileClick();
      showToast('Start next round', 'round'); 
      return; 
    }
    if (round >= maxRounds && !isRoundActive) {
      Sounds.tileClick();
      showToast('Game Over', 'round');
      return;
    }
    setSelectedTile(position);
    setBuildMenuContext('land');
    setShowBuildMenu(true);
    Sounds.menuOpen();
  };

  // Handle tap on water.
  //
  // Rules (deliberate, see How to Play):
  //   boat selected  → ALWAYS sets that boat's destination
  //   nothing selected → opens the boat build menu at that spot
  //
  // Deselecting is done by tapping the boat itself, never by tapping water.
  const handleWaterTap = (waterPosition: WaterPosition, screenX: number, screenY: number) => {
    if (!island || !coastline) return;
    
    // Block interaction when round is not active
    if (round === 0) { showToast('Press START to begin', 'round'); return; }
    if (!isRoundActive && round > 0 && round < maxRounds) { showToast('Start next round', 'round'); return; }
    if (round >= maxRounds && !isRoundActive) { showToast('Game Over', 'round'); return; }
    
    // If a boat is selected, set its destination
    if (selectedBoat) {
      const boat = freeRoamBoats.find(b => b.id === selectedBoat);
      if (!boat) {
        // Selected boat is gone (sunk). Drop the stale selection and treat this tap
        // as a normal water tap rather than silently doing nothing.
        setSelectedBoat(null);
        setDestinationMarker(null);
      } else {
      // Try to set the destination (will use pathfinding)
      const updatedBoat = setBoatDestination(boat, waterPosition, island);
      
      // Check if path was found (waypoints would be set)
      if (updatedBoat.waypoints.length === 0) {
        Sounds.buildError();
        showToast('No path', 'error');
        return;
      }
      
      Sounds.boatMove();
      setFreeRoamBoats(prev => prev.map(b => 
        b.id === selectedBoat ? updatedBoat : b
      ));
      setDestinationMarker(waterPosition);
      setSelectedBoat(null);
      return;
      }
    }

    // No boat selected — offer to build one here
    if (!isPointInWater(waterPosition, island)) {
      return; // Tapped outside the playable water area
    }

    setSelectedWater(waterPosition);
    setSelectedTile(null);
    setBuildMenuContext('water');
    setShowBuildMenu(true);
    Sounds.menuOpen();
  };

  // Handle tapping on a free-roam boat
  const handleBoatPress = (boat: FreeRoamBoatType) => {
    // Block interaction when round is not active
    if (round === 0) { showToast('Press START to begin', 'round'); return; }
    if (!isRoundActive && round > 0 && round < maxRounds) { showToast('Start next round', 'round'); return; }
    if (round >= maxRounds && !isRoundActive) { showToast('Game Over', 'round'); return; }
    
    Sounds.boatSelect();
    if (selectedBoat === boat.id) {
      setSelectedBoat(null);
      setDestinationMarker(null);
    } else {
      setSelectedBoat(boat.id);
      setDestinationMarker(boat.destination);
    }
    setSelectedTile(null);
  };

  const handleSelectBuilding = (type: BuildingType) => {
    if (!island || !selectedTile) return;
    const building = BUILDINGS.find(b => b.type === type);
    if (!building || gold < building.cost) return;
    
    // Check if tile has rebel - can't build until rebel is cleared
    const tile = island.tiles.find(t => 
      t.position.x === selectedTile.x && t.position.y === selectedTile.y
    );
    if (tile?.hasRebel) {
      Sounds.buildError();
      showToast('Clear rebels first!', 'error');
      closeBuildMenu();
      return;
    }
    
    // Tutorial: notify that a building was selected
    if (isTutorialActive) {
      onTutorialAction('building_selected');
    }
    
    Sounds.buildPlace();
    setIsland({ ...island, tiles: island.tiles.map(tile => 
      tile.position.x === selectedTile.x && tile.position.y === selectedTile.y 
        ? { ...tile, building: type } 
        : tile
    )});
    setGold(gold - building.cost);
    setShowBuildMenu(false);
    setSelectedTile(null);
    showToast(`Built ${building.name}`, 'build');
  };

  const handleSelectBoat = (type: BoatType) => {
    if (!island || !selectedWater) return;
    const cost = BOAT_COSTS[type];
    if (gold < cost) { Sounds.buildError(); showToast('Need more gold', 'error'); closeBuildMenu(); return; }
    
    // Spawn the boat exactly where the player tapped
    const newBoat = createFreeRoamBoatAt(
      `boat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      selectedWater,
      island
    );
    
    if (!newBoat) { 
      Sounds.buildError(); 
      showToast('Cannot launch here', 'error'); 
      closeBuildMenu(); 
      return; 
    }
    
    Sounds.boatLaunch();
    setFreeRoamBoats(prev => [...prev, newBoat]);
    setGold(gold - cost);
    closeBuildMenu();
    showToast(`${type === 'fishing' ? 'Fishing boat' : 'PT boat'} launched`, 'build');
  };

  const closeBuildMenu = () => {
    Sounds.buttonClick();
    setShowBuildMenu(false);
    setSelectedTile(null);
    setSelectedWater(null);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const timerColor = !isRoundActive ? '#888' : timeRemaining <= 10 ? '#e53935' : timeRemaining <= 30 ? '#ffc107' : '#4ade80';

  const buildings = getAvailableBuildings(mode);

  // Tutorial spotlight targets — measured at runtime rather than calculated.
  // See src/services/tutorialTargets.ts for why.
  const measuredTargets = useTutorialTargets();
  const mapContainerRef = useRef<View | null>(null);
  const goldDisplayRef = useRef<View | null>(null);
  const timerRef2 = useRef<View | null>(null);

  // Pick the tile to highlight: an empty, rebel-free tile nearest the island's
  // centre. Island shapes are irregular, so the middle of the tiles array is not
  // necessarily anywhere near the visual centre.
  const tutorialTile = React.useMemo(() => {
    if (!island || island.tiles.length === 0) return null;
    const candidates = island.tiles.filter(t => !t.building && !t.hasRebel);
    const pool = candidates.length > 0 ? candidates : island.tiles;
    const cx = pool.reduce((s, t) => s + t.position.x, 0) / pool.length;
    const cy = pool.reduce((s, t) => s + t.position.y, 0) / pool.length;
    let best = pool[0];
    let bestDist = Infinity;
    for (const t of pool) {
      const d = Math.hypot(t.position.x - cx, t.position.y - cy);
      if (d < bestDist) { bestDist = d; best = t; }
    }
    return best;
  }, [island]);

  // Compose the rects the overlay needs. The island grid rect comes from a real
  // measurement of the map container, so the tile offset is exact on any device.
  const tutorialElementPositions = React.useMemo(() => {
    const positions: Record<string, { x: number; y: number; width: number; height: number }> = {};

    const grid = measuredTargets.island_container;
    if (grid && tutorialTile) {
      positions.land_tile = {
        x: grid.x + tutorialTile.position.x * tileSize,
        y: grid.y + tutorialTile.position.y * tileSize,
        width: tileSize,
        height: tileSize,
      };
    }
    if (measuredTargets.gold_display) positions.gold_display = measuredTargets.gold_display;
    if (measuredTargets.timer) positions.timer = measuredTargets.timer;
    if (measuredTargets.building_crops) positions.building_crops = measuredTargets.building_crops;

    return positions;
  }, [measuredTargets, tutorialTile, tileSize]);

  // What's New panel — shown automatically after an update, or on demand from
  // Settings. Rendered on every screen that can open Settings.
  const releaseNotesPanel = (
    <WhatsNewPanel
      visible={(browsingReleaseNotes || whatsNewNotes.length > 0) && !showNamePrompt && !showSettings}
      notes={browsingReleaseNotes ? RELEASE_NOTES : whatsNewNotes}
      reduceMotion={!animationsEnabled}
      onDismiss={() => {
        if (browsingReleaseNotes) {
          setBrowsingReleaseNotes(false);
        } else {
          markReleaseNotesSeen();
          setWhatsNewNotes([]);
        }
      }}
    />
  );

  const openReleaseNotes = () => {
    setShowSettings(false);
    setBrowsingReleaseNotes(true);
  };

  // Show multiplayer lobby
  if (showMultiplayer) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" hidden />
        <MultiplayerLobby
          playerId={playerId}
          playerName={playerName}
          onBack={() => setShowMultiplayer(false)}
          onStartGame={(config, roomCode, isHost, opponentId, opponentName) => {
            // Capture multiplayer context before starting the game
            setMpRoomCode(roomCode);
            setMpOpponentId(opponentId);
            setMpOpponentName(opponentName);
            setMpIsHost(isHost);
            setShowMultiplayer(false);
            // Persist so a disconnect can be recovered without the room code
            saveActiveSession({ roomCode, opponentId, opponentName, isHost, startedAt: Date.now() });
            startGameWithConfig(config);
          }}
        />
        <NamePromptModal
          visible={showNamePrompt}
          onComplete={(name) => { setPlayerName(name); setShowNamePrompt(false); }}
        />
      </View>
    );
  }

  // Title screen on launch, ahead of setup
  if (showTitle && showSetup) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" hidden />
        <TitleScreen
          onPlay={() => setShowTitle(false)}
          onSettings={() => setShowSettings(true)}
          onHowToPlay={() => setShowQuickStart(true)}
          reduceMotion={!animationsEnabled}
          versionLabel="v1.0.0"
          backgroundSource={require('./assets/images/title-bg.jpg')}
          cloudSource={require('./assets/images/title-clouds.png')}
        />
        <SettingsScreen
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          playerName={playerName || undefined}
          onPlayerNameChange={setPlayerName}
          onShowReleaseNotes={openReleaseNotes}
        />
        <NamePromptModal
          visible={showNamePrompt}
          onComplete={(name) => { setPlayerName(name); setShowNamePrompt(false); }}
        />
        {/* What's New — shown over the title screen, but never on top of the
            name prompt, which a first-time player must answer first. */}
        {releaseNotesPanel}
        <QuickStartPanel
          visible={showQuickStart}
          onClose={() => setShowQuickStart(false)}
          reduceMotion={!animationsEnabled}
        />
      </View>
    );
  }

  // Show setup screen before game starts
  if (showSetup) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" hidden />
        <SetupScreen 
          onStartGame={startGameWithConfig}
          onOpenSettings={() => setShowSettings(true)}
          onMultiplayer={() => setShowMultiplayer(true)}
        />
        <SettingsScreen 
          visible={showSettings} 
          onClose={() => setShowSettings(false)} 
          playerName={playerName || undefined}
          onPlayerNameChange={setPlayerName}
          onShowReleaseNotes={openReleaseNotes}
        />
        <NamePromptModal
          visible={showNamePrompt}
          onComplete={(name) => { setPlayerName(name); setShowNamePrompt(false); }}
        />
        {releaseNotesPanel}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.resourcesRow}>
          <View
            ref={goldDisplayRef}
            onLayout={() => measureAndRegister(goldDisplayRef.current as any, 'gold_display')}
          >
            <AnimatedResourceBar icon="💰" value={gold} color="#ffc107" />
          </View>
          <AnimatedResourceBar icon="👥" value={population} color="#64b5f6" />
          <AnimatedResourceBar icon="⭐" value={score} maxValue={100} color="#4caf50" showBar />
        </View>
        
        <View
          style={styles.headerCenter}
          ref={timerRef2}
          onLayout={() => measureAndRegister(timerRef2.current as any, 'timer')}
        >
          {isRoundActive ? (
            <View style={styles.timerContainer}>
              <Text style={[styles.timer, { color: timerColor }]}>{formatTime(timeRemaining)}</Text>
              <View style={styles.timerBar}>
                <View style={[styles.timerFill, { 
                  width: `${(timeRemaining / roundDuration) * 100}%`,
                  backgroundColor: timerColor 
                }]} />
              </View>
            </View>
          ) : (
            isMultiplayer && !mpIsHost ? (
              <View style={styles.waitingForHost}>
                <Text style={styles.waitingForHostText}>
                  {round === 0 ? 'Waiting for host to start...' : round >= maxRounds ? 'Game Over' : 'Waiting for host...'}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.startBtn, isNextLocked && styles.startBtnLocked]}
                onPress={startRound}
                disabled={isNextLocked}
              >
                <Text style={styles.startBtnText}>
                  {round === 0 ? '▶ START' : round >= maxRounds ? 'DONE' : '▶ NEXT'}
                </Text>
              </TouchableOpacity>
            )
          )}
          <Text style={styles.roundText}>Round {round}/{maxRounds}</Text>
        </View>
        
        <View style={styles.headerRight}>
          {debugOn && (
            <TouchableOpacity
              onPress={() => { setGold(g => g + 500); showToast('+500g (debug)', 'gold'); }}
              style={styles.debugButton}
            >
              <Text style={styles.debugButtonText}>+500g</Text>
            </TouchableOpacity>
          )}
          {round > 0 && !showGameOver && (
            <TouchableOpacity
              onPress={handleSabotage}
              style={[
                styles.sabotageButton,
                (!isRoundActive || sabotageUsedRound === round || gold < REBEL_SPAWN_COST) &&
                  styles.sabotageButtonDisabled,
              ]}
            >
              <RebelIcon size={16} />
              <Text style={styles.sabotageCost}>{REBEL_SPAWN_COST}g</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={toggleAllAudio} 
            style={styles.resetButton}
          >
            <Text style={styles.newBtn}>{isAudioEnabled ? '🔊' : '🔇'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { Sounds.buttonClick(); setShowSettings(true); }} 
            style={styles.resetButton}
          >
            <Text style={styles.newBtn}>⚙️</Text>
          </TouchableOpacity>
          {round === 0 && (
            <TouchableOpacity 
              onPress={() => { Sounds.buttonClick(); initGame(); }} 
              style={styles.resetButton}
            >
              <Text style={styles.newBtn}>↻</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => { Sounds.buttonClick(); setShowQuitConfirm(true); }} 
            style={styles.resetButton}
          >
            <Text style={styles.newBtn}>🏠</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Toast Notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onHide={() => setToast(null)} 
        />
      )}
      
      {/* Map */}
      <View style={styles.mapArea}>
        {island && (
          <View
            style={styles.mapContainer}
            ref={mapContainerRef}
            onLayout={() => measureAndRegister(mapContainerRef.current as any, 'island_container')}
          >
            <Island
              island={island}
              tileSize={tileSize}
              selectedTile={selectedTile}
              selectedBoatId={selectedBoat}
              onTilePress={handleTilePress}
              onWaterTap={handleWaterTap}
            >
              {/* Fish schools rendered on water */}
              {fishSchools.map(school => (
                <FishSchoolComponent
                  key={school.id}
                  school={school}
                  tileSize={tileSize}
                />
              ))}
              
              {/* Pirate ships */}
              {pirates.map(pirate => (
                <PirateShipComponent
                  key={pirate.id}
                  pirate={pirate}
                  tileSize={tileSize}
                />
              ))}
              
              {/* Free-roam boats rendered as children */}
              {freeRoamBoats.map(boat => (
                <FreeRoamBoat
                  key={boat.id}
                  boat={boat}
                  tileSize={tileSize}
                  selected={selectedBoat === boat.id}
                  onPress={() => handleBoatPress(boat)}
                />
              ))}
              
              {/* Destination marker for selected boat */}
              {destinationMarker && selectedBoat && (
                <DestinationMarker
                  destination={destinationMarker}
                  tileSize={tileSize}
                />
              )}

              {/* Boats going down — purely visual, already out of play */}
              {sinkingBoats.map(boat => (
                <SinkingBoat
                  key={boat.id}
                  id={boat.id}
                  type={boat.type}
                  position={boat.position}
                  tileSize={tileSize}
                  onComplete={removeSunkBoat}
                />
              ))}
            </Island>
          </View>
        )}
      </View>
      
      {/* Animated Build Menu */}
      <AnimatedBuildMenu
        visible={showBuildMenu}
        gold={gold}
        mode={mode}
        context={buildMenuContext}
        onSelectBuilding={handleSelectBuilding}
        onSelectBoat={handleSelectBoat}
        onClose={closeBuildMenu}
      />
      
      {/* Rain Cloud */}
      {rainCloud && (
        <RainCloud 
          size={tileSize}
          startX={rainCloud.startX}
          startY={rainCloud.startY}
          endX={rainCloud.endX}
          endY={rainCloud.endY}
          duration={rainCloud.duration}
          paused={!isRoundActive}
          onComplete={() => setRainCloud(null)}
        />
      )}
      
      {/* Tropical Storm Cloud */}
      {stormCloud && (
        <StormCloud 
          size={tileSize}
          startX={stormCloud.startX}
          startY={stormCloud.startY}
          endX={stormCloud.endX}
          endY={stormCloud.endY}
          duration={stormCloud.duration}
          paused={!isRoundActive}
          onComplete={() => setStormCloud(null)}
        />
      )}
      
      {/* Hurricane Cloud */}
      {hurricaneCloud && (
        <HurricaneCloud 
          size={tileSize}
          startX={hurricaneCloud.startX}
          startY={hurricaneCloud.startY}
          endX={hurricaneCloud.endX}
          endY={hurricaneCloud.endY}
          duration={hurricaneCloud.duration}
          paused={!isRoundActive}
          onComplete={() => setHurricaneCloud(null)}
        />
      )}
      
      {/* Score Display - shown during gameplay */}
      {round > 0 && !showBuildMenu && !showGameOver && (
        <View style={styles.scoreDisplayContainer}>
          <ScoreDisplay 
            housing={scoreBreakdown.housing}
            food={scoreBreakdown.food}
            welfare={scoreBreakdown.welfare}
            gdp={scoreBreakdown.gdp}
            total={score}
          />
        </View>
      )}
      
      {/* Opponent connection banner (Phase 8E) */}
      <ConnectionBanner
        opponentName={mpOpponentName}
        msSinceSeen={mpMsSinceOpponentSeen ?? 0}
        msUntilForfeit={mpMsUntilForfeit}
        visible={isMultiplayer && isOpponentStale && !showGameOver && round > 0}
      />

      {/* Opponent minimap — AI in solo, human opponent in multiplayer */}
      {isMultiplayer ? (
        <MultiplayerIslandMinimap
          island={opponentIsland}
          score={opponentState?.score ?? 0}
          gold={opponentState?.gold ?? 0}
          population={opponentState?.population ?? 0}
          boats={opponentState?.boats ?? []}
          opponentName={mpOpponentName}
          roomCode={mpRoomCode ?? undefined}
          fogEnabled={fogEnabled}
          revealedTiles={revealedTiles}
          isStale={isOpponentStale}
          msSinceSeen={mpMsSinceOpponentSeen ?? 0}
          visible={round > 0 && !showBuildMenu && !showGameOver}
        />
      ) : (
        <AIIslandMinimap
          island={aiIsland}
          score={aiScore}
          gold={aiGold}
          population={aiPopulation}
          difficulty={difficulty}
          visible={round > 0 && !showBuildMenu && !showGameOver}
          lastAction={lastAIAction}
          fogEnabled={fogEnabled}
          revealedTiles={revealedTiles}
        />
      )}
      
      {/* End Game Summary */}
      {showGameOver && island && (
        <EndGameSummary
          score={score}
          scoreBreakdown={scoreBreakdown}
          population={population}
          gold={gold}
          buildings={{
            houses: island.tiles.filter(t => t.building === 'house').length,
            farms: island.tiles.filter(t => t.building === 'farm').length,
            factories: island.tiles.filter(t => t.building === 'factory').length,
            schools: island.tiles.filter(t => t.building === 'school').length,
            hospitals: island.tiles.filter(t => t.building === 'hospital').length,
            forts: island.tiles.filter(t => t.building === 'fort').length,
          }}
          boats={{
            fishing: freeRoamBoats.filter(b => b.type === 'fishing').length,
            pt: freeRoamBoats.filter(b => b.type === 'pt').length,
          }}
          aiScore={isMultiplayer ? (opponentState?.score ?? 0) : aiScore}
          aiScoreBreakdown={isMultiplayer ? opponentState?.scoreBreakdown : aiScoreBreakdown}
          difficulty={isMultiplayer ? undefined : difficulty}
          opponentName={isMultiplayer ? mpOpponentName : undefined}
          wonByForfeit={mpWonByForfeit}
          onPlayAgain={() => { initGame(); initializeAI(); }}
          onMainMenu={returnToSetup}
        />
      )}
      
      {/* Round summary.
          Never auto-dismisses. In solo it carries the Next Round button; in
          multiplayer it persists until tapped, and clears on its own when a new
          round starts. It blocks nothing — the host can still reach NEXT above it,
          and the NEXT lockout guarantees the opponent a few seconds regardless. */}
      <RoundSummaryPanel
        summary={roundSummary}
        onDismiss={dismissRoundSummary}
        reduceMotion={!animationsEnabled}
        autoDismissMs={null}
        primaryLabel={!isMultiplayer && round < maxRounds ? '▶ NEXT ROUND' : undefined}
        onPrimaryAction={!isMultiplayer && round < maxRounds ? advanceFromSummary : undefined}
      />

      {/* PT boat vs pirate battle. Outcome was decided before this rendered — the
          overlay only presents it. Non-blocking: the round timer runs underneath. */}
      <BattleOverlay plan={battlePlan} onComplete={resolveBattle} />

      {/* Round Transition Animation */}
      {showRoundTransition && (
        <RoundTransition
          round={round}
          maxRounds={maxRounds}
          type={showRoundTransition}
          onComplete={onRoundTransitionComplete}
        />
      )}
      
      {/* Settings Screen */}
      <SettingsScreen 
        visible={showSettings} 
        onClose={() => setShowSettings(false)}
        onResetTutorial={handleReplayTutorial}
        maxRounds={maxRounds}
        playerName={playerName || undefined}
        onPlayerNameChange={setPlayerName}
        onShowReleaseNotes={openReleaseNotes}
      />

      {releaseNotesPanel}
      
      {/* Tutorial Overlay */}
      {isTutorialActive && tutorialStep && (
        <TutorialOverlay
          step={tutorialStep}
          stepIndex={tutorialStepIndex}
          totalSteps={tutorialTotalSteps}
          onNext={tutorialNextStep}
          onSkip={skipTutorial}
          elementPositions={tutorialElementPositions}
        />
      )}
      
      {/* Quit Confirmation Dialog */}
      {showQuitConfirm && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBackdrop} />
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>Quit Game?</Text>
            <Text style={styles.confirmMessage}>
              Your current game progress will be lost.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={styles.confirmCancelBtn}
                onPress={() => { Sounds.buttonClick(); setShowQuitConfirm(false); }}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmQuitBtn}
                onPress={() => { Sounds.buttonClick(); setShowQuitConfirm(false); returnToSetup(); }}
              >
                <Text style={styles.confirmQuitText}>Quit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a4c',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  resourcesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timer: {
    fontSize: 22,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  timerBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 2,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 2,
  },
  roundText: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  startBtn: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startBtnLocked: {
    opacity: 0.35,
  },
  startBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  waitingForHost: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(74, 144, 217, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A90D9',
  },
  waitingForHostText: {
    color: '#88ccee',
    fontSize: 12,
    fontWeight: '600',
  },
  modeButton: {
    backgroundColor: 'rgba(255,193,7,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modeBtn: {
    color: '#ffc107',
    fontSize: 11,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sabotageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(229, 57, 53, 0.22)',
    borderWidth: 1,
    borderColor: '#e53935',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sabotageButtonDisabled: {
    opacity: 0.35,
  },
  debugButton: {
    backgroundColor: 'rgba(140, 90, 200, 0.25)',
    borderWidth: 1,
    borderColor: '#8c5ac8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  debugButtonText: {
    color: '#c9a6f0',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sabotageCost: {
    color: '#ff8a80',
    fontSize: 11,
    fontWeight: 'bold',
  },
  newBtn: {
    color: '#aaa',
    fontSize: 18,
  },
  mapArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    position: 'relative',
  },
  boatsLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scoreDisplayContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    zIndex: 100,
  },
  // Multiplayer opponent debug readout (8C.2 — removed in 8D, styles retired)
  // Menu styles - NO MODAL
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  menu: {
    backgroundColor: '#1a2530',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#2a3a4a',
    width: '95%',
    maxWidth: 700,
    maxHeight: '85%',
    zIndex: 1001,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3a4a',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  menuGold: {
    fontSize: 16,
    color: '#ffc107',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  menuContent: {
    flexDirection: 'row',
  },
  buildingsSection: {
    flex: 1,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#2a3a4a',
  },
  boatsSection: {
    width: 100,
    paddingLeft: 10,
  },
  sectionTitle: {
    fontSize: 10,
    color: '#888',
    marginBottom: 6,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '16%',
    backgroundColor: '#2a3a4a',
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
    marginRight: '0.5%',
    marginBottom: 6,
  },
  gridItemDisabled: {
    opacity: 0.4,
  },
  gridIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridName: {
    fontSize: 8,
    color: '#e0e0e0',
    marginTop: 2,
    textAlign: 'center',
  },
  gridCost: {
    fontSize: 10,
    color: '#ffc107',
    fontWeight: 'bold',
    marginTop: 1,
  },
  gridCostDisabled: {
    color: '#666',
  },
  boatRow: {
    flexDirection: 'column',
  },
  boatItem: {
    backgroundColor: '#2a3a4a',
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
    marginBottom: 6,
  },
  cancelBtn: {
    backgroundColor: '#3a4a5a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelText: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  confirmBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  confirmDialog: {
    backgroundColor: '#1a2a3a',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
    borderWidth: 2,
    borderColor: '#2a4a5a',
    alignItems: 'center',
    zIndex: 2001,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 15,
    color: '#88a4b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmCancelBtn: {
    flex: 1,
    backgroundColor: '#2a4a5a',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#88a4b8',
  },
  confirmQuitBtn: {
    flex: 1,
    backgroundColor: '#e53935',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmQuitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
