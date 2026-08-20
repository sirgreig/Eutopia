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
import { BUILDINGS, BOAT_COSTS, BALANCE, PIRATE_DIFFICULTY, STORM_DIFFICULTY, HURRICANE_DIFFICULTY, GRID_WIDTH, GRID_HEIGHT, getAvailableBuildings } from './src/constants/game';

// Audio imports - simple system adapted from IJBA
import { initializeSounds, Sounds } from './src/services/soundManager';
import { loadAudioSettings, useAudioSettings } from './src/hooks/useAudioSettings';
import { SettingsScreen } from './src/components/settings/SettingsScreen';
import { SetupScreen, GameConfig } from './src/components/setup/SetupScreen';

// AI Opponent imports
import { useAIOpponent } from './src/hooks/useAIOpponent';
import { AIIslandMinimap } from './src/components/game/AIIslandMinimap';
import { MultiplayerIslandMinimap } from './src/components/game/MultiplayerIslandMinimap';
import { ConnectionBanner } from './src/components/game/ConnectionBanner';

// Tutorial imports
import { useTutorial } from './src/hooks/useTutorial';
import { TutorialOverlay } from './src/components/game/TutorialOverlay';

// Multiplayer imports
import { NamePromptModal } from './src/components/multiplayer/NamePromptModal';
import { MultiplayerLobby } from './src/components/multiplayer/MultiplayerLobby';
import { getPlayer } from './src/services/playerService';
import { hasPlayerName, saveActiveSession, getActiveSession, clearActiveSession } from './src/services/playerService';
import { setIsland as fbSetIsland, listenToIsland as fbListenToIsland, setPlayerState as fbSetPlayerState, listenToPlayerState as fbListenToPlayerState, PlayerState as FbPlayerState, setRoundState as fbSetRoundState, listenToRoundState as fbListenToRoundState, RoundState as FbRoundState, pushSpawnEvent as fbPushSpawnEvent, listenToSpawnEvents as fbListenToSpawnEvents, SpawnEvent as FbSpawnEvent, promoteToHost as fbPromoteToHost, rejoinRoom as fbRejoinRoom } from './src/services/multiplayerService';

// Fish schools
import { FishSchoolComponent } from './src/components/game/FishSchool';
import { PirateShipComponent } from './src/components/game/PirateShip';
import { isPointInWater } from './src/services/coastlineDetection';

const MENU_ICON_SIZE = 28;

// Phase 8E — connection thresholds (ms)
const MP_STALE_MS = 10000;     // opponent considered disconnected
const MP_FORFEIT_MS = 180000;  // 3 minutes → forfeit

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
  } = useAIOpponent({
    difficulty,
    mode,
    isRoundActive,
    round,
    maxRounds,
    playerIsland: island,
    enabled: !isMultiplayer, // AI disabled in multiplayer (real opponent)
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
  
  // Hurricane refs
  const hurricaneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hurricaneStartTimeRef = useRef<number>(0);
  const hurricaneDamageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hurricaneDamagedTilesRef = useRef<Set<string>>(new Set());
  const hurricaneTotalPausedRef = useRef<number>(0);
  const hurricanePauseStartRef = useRef<number>(0);
  const hurricaneBuildingsDestroyedRef = useRef<number>(0);

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
    
    // Initialize AI opponent
    setTimeout(() => initializeAI(), 100);
  }, [initializeAI]);

  // Return to setup screen
  const returnToSetup = useCallback(() => {
    setShowSetup(true);
    setShowGameOver(false);
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
          // Island is restored from Firebase by the rejoin effect below
        } else {
          await clearActiveSession();
        }
      }

      // Preload PNG icons — best-effort only (fails silently on Android dev builds
      // where Metro serves assets via HTTP and downloadAsync is rejected)
      try {
        await Promise.all(
          Object.values(ICON_IMAGES).map(
            (source) => Asset.fromModule(source as number).downloadAsync()
          )
        );
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
    
    // Get fort positions for protection checks
    const fortPositions = island.tiles
      .filter(t => t.building === 'fort')
      .map(t => t.position);
    
    const isTileProtected = (pos: { x: number; y: number }): boolean => {
      for (const fort of fortPositions) {
        if (Math.abs(pos.x - fort.x) <= BALANCE.fortRadius &&
            Math.abs(pos.y - fort.y) <= BALANCE.fortRadius) {
          return true;
        }
      }
      return false;
    };
    
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
          
          if (isTileProtected(tile.position)) continue; // Fort protected
          
          if (Math.random() < stormDiff.buildingDestroy) {
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
      
      // Check boat damage
      const currentBoats = freeRoamBoatsRef.current;
      const boatsToSink: string[] = [];
      
      for (const boat of currentBoats) {
        const boatScreenX = gridOriginX + boat.position.x * tileSize;
        const boatScreenY = gridOriginY + boat.position.y * tileSize;
        
        if (cloudX < boatScreenX + tileSize && cloudX + cloudWidth > boatScreenX &&
            cloudY < boatScreenY + tileSize && cloudY + cloudHeight > boatScreenY) {
          
          // Check fort protection for boats
          const fortCenter = { x: boat.position.x, y: boat.position.y };
          let boatProtected = false;
          for (const fort of fortPositions) {
            const dx = boat.position.x - (fort.x + 0.5);
            const dy = boat.position.y - (fort.y + 0.5);
            if (Math.sqrt(dx * dx + dy * dy) <= BALANCE.fortRadius + 0.5) {
              boatProtected = true;
              break;
            }
          }
          if (boatProtected) continue;
          
          if (Math.random() < stormDiff.boatSink) {
            boatsToSink.push(boat.id);
          }
        }
      }
      
      if (boatsToSink.length > 0) {
        setFreeRoamBoats(prev => prev.filter(b => !boatsToSink.includes(b.id)));
        freeRoamBoatsRef.current = freeRoamBoatsRef.current.filter(b => !boatsToSink.includes(b.id));
        
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
        showToast(`+${wateredCrops}g from hurricane rain!`, 'rain');
      }
      
      // Check building damage — hurricanes can destroy forts too
      if (hurricaneBuildingsDestroyedRef.current < BALANCE.hurricaneMaxBuildingsDestroyed) {
        const buildingTiles = island.tiles.filter(t => t.building);
        
        for (const tile of buildingTiles) {
          if (hurricaneBuildingsDestroyedRef.current >= BALANCE.hurricaneMaxBuildingsDestroyed) break;
          const tileKey = `${tile.position.x},${tile.position.y}`;
          if (hurricaneDamagedTilesRef.current.has(tileKey)) continue;
          
          const tileScreenX = gridOriginX + tile.position.x * tileSize;
          const tileScreenY = gridOriginY + tile.position.y * tileSize;
          
          if (cloudX < tileScreenX + tileSize && cloudX + cloudSize > tileScreenX &&
              cloudY < tileScreenY + tileSize && cloudY + cloudSize > tileScreenY) {
            hurricaneDamagedTilesRef.current.add(tileKey);
            
            // Forts have lower destroy chance, other buildings use standard rate
            const destroyChance = tile.building === 'fort' ? hurDiff.fortDestroy : hurDiff.buildingDestroy;
            
            if (Math.random() < destroyChance) {
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
      
      // Check boat damage — very high sink rate
      const currentBoats = freeRoamBoatsRef.current;
      const boatsToSink: string[] = [];
      
      for (const boat of currentBoats) {
        const boatScreenX = gridOriginX + boat.position.x * tileSize;
        const boatScreenY = gridOriginY + boat.position.y * tileSize;
        
        if (cloudX < boatScreenX + tileSize && cloudX + cloudSize > boatScreenX &&
            cloudY < boatScreenY + tileSize && cloudY + cloudSize > boatScreenY) {
          // No fort protection from hurricanes
          if (Math.random() < hurDiff.boatSink) {
            boatsToSink.push(boat.id);
          }
        }
      }
      
      if (boatsToSink.length > 0) {
        setFreeRoamBoats(prev => prev.filter(b => !boatsToSink.includes(b.id)));
        freeRoamBoatsRef.current = freeRoamBoatsRef.current.filter(b => !boatsToSink.includes(b.id));
        
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
      
      let totalGold = 0;
      
      for (const boat of fishingBoats) {
        for (const school of currentFish) {
          const dist = waterDistance(boat.position, school.position);
          // Boat must be directly over the fish school to earn gold
          if (dist < school.size) {
            totalGold += BALANCE.fishingGoldPerTick;
            break; // One boat can only fish from one school per tick
          }
        }
      }
      
      if (totalGold > 0) {
        setGold(g => g + totalGold);
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
      
      // Update each pirate
      piratesRef.current = piratesRef.current.map(pirate => {
        // Check collision with PT boats — pirate gets sunk
        for (const boat of currentBoats) {
          if (boat.type !== 'pt') continue;
          const dist = waterDistance(pirate.position, boat.position);
          if (dist < sinkRadius) {
            piratesSunk.push(pirate.id);
            return pirate; // Will be filtered out below
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
        
        // If no safe fish target, wander randomly
        if (!targetPos) {
          targetPos = {
            x: GRID_WIDTH / 2 + (Math.random() - 0.5) * GRID_WIDTH * 0.6,
            y: GRID_HEIGHT / 2 + (Math.random() - 0.5) * GRID_HEIGHT * 0.6,
          };
        }
        
        // Move toward target
        const dx = targetPos.x - pirate.position.x;
        const dy = targetPos.y - pirate.position.y;
        const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
        const dirX = dx / dist;
        const dirY = dy / dist;
        
        const moveDistance = pirate.speed * dt;
        let newX = pirate.position.x + dirX * moveDistance;
        let newY = pirate.position.y + dirY * moveDistance;
        
        // Clamp to grid
        newX = Math.max(0.1, Math.min(GRID_WIDTH - 0.1, newX));
        newY = Math.max(0.1, Math.min(GRID_HEIGHT - 0.1, newY));
        
        const newPos: WaterPosition = { x: newX, y: newY };
        
        // If on land, reverse and randomize
        if (!isPointInWater(newPos, island)) {
          const angle = Math.atan2(-dirY, -dirX) + (Math.random() - 0.5) * Math.PI * 0.5;
          return {
            ...pirate,
            velocity: { vx: Math.cos(angle) * pirate.speed, vy: Math.sin(angle) * pirate.speed },
          };
        }
        
        return {
          ...pirate,
          position: newPos,
          velocity: { vx: dirX * pirate.speed, vy: dirY * pirate.speed },
        };
      });
      
      // Remove sunk pirates
      if (piratesSunk.length > 0) {
        piratesRef.current = piratesRef.current.filter(p => !piratesSunk.includes(p.id));
        Sounds.boatCrash();
        showToast('PT boat sank the pirates!', 'stability');
      }
      
      // Remove sunk fishing boats
      if (boatsSunk.length > 0) {
        setFreeRoamBoats(prev => {
          const updated = prev.filter(b => !boatsSunk.includes(b.id));
          freeRoamBoatsRef.current = updated;
          return updated;
        });
        Sounds.boatCrash();
        if (casualties > 0) {
          setPopulation(p => Math.max(1, p - casualties));
        }
        showToast(`Pirates sank your fishing boat!${casualties > 0 ? ` -${casualties} people` : ''}`, 'rebel');
      }
      
      // Sync to React state periodically
      pirateRenderSyncRef.current++;
      if (pirateRenderSyncRef.current >= 5 || piratesSunk.length > 0 || boatsSunk.length > 0) {
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
    
    // Income calculation
    const productivity = Math.min(BALANCE.maxProductivityBonus, (schools + hospitals) * factories + hospitals);
    const income = BALANCE.baseRoundIncome + factories * BALANCE.factoryIncome + productivity;
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
    const housingScore = Math.min(30, Math.floor((houses * 500) / Math.max(1, newPopulation / 100) / 3));
    const foodScore = Math.min(30, Math.floor(((fishingBoats + crops) * 500) / Math.max(1, newPopulation / 100) / 3));
    const welfareScore = Math.min(30, (schools + hospitals) * 5);
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
    
    // Process AI round end
    processAIRoundEnd();
    
    // Check for game over
    if (round >= maxRounds) {
      setTimeout(() => setShowGameOver(true), 1500);
    } else {
      showToast(`+${income}g income`, 'gold');
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
    if (selectedBoat) { 
      Sounds.tileClick();
      setSelectedBoat(null); 
      showToast('Boats move on water', 'error');
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
    setShowBuildMenu(true);
    Sounds.menuOpen();
  };

  // Handle tap on water for free-roam boat movement
  const handleWaterTap = (waterPosition: WaterPosition, screenX: number, screenY: number) => {
    if (!island || !coastline) return;
    
    // Block interaction when round is not active
    if (round === 0) { showToast('Press START to begin', 'round'); return; }
    if (!isRoundActive && round > 0 && round < maxRounds) { showToast('Start next round', 'round'); return; }
    if (round >= maxRounds && !isRoundActive) { showToast('Game Over', 'round'); return; }
    
    // If a boat is selected, set its destination
    if (selectedBoat) {
      const boat = freeRoamBoats.find(b => b.id === selectedBoat);
      if (!boat) return;
      
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
    }
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
    if (!island || !selectedTile) return;
    const cost = BOAT_COSTS[type];
    if (gold < cost) { Sounds.buildError(); showToast('Need more gold', 'error'); closeBuildMenu(); return; }
    if (!isCoastalTile(selectedTile)) { Sounds.buildError(); showToast('Coast tiles only', 'error'); closeBuildMenu(); return; }
    
    // Create free-roam boat
    const newBoat = createFreeRoamBoat(
      `boat-${Date.now()}`,
      type,
      selectedTile,
      island
    );
    
    if (!newBoat) { 
      Sounds.buildError(); 
      showToast('No water nearby', 'error'); 
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
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const timerColor = !isRoundActive ? '#888' : timeRemaining <= 10 ? '#e53935' : timeRemaining <= 30 ? '#ffc107' : '#4ade80';

  const buildings = getAvailableBuildings(mode);

  // Tutorial element positions for spotlight effect
  const tutorialElementPositions = island ? {
    land_tile: {
      x: (screenWidth - GRID_WIDTH * tileSize) / 2 + island.tiles[Math.floor(island.tiles.length / 2)].position.x * tileSize,
      y: 60 + island.tiles[Math.floor(island.tiles.length / 2)].position.y * tileSize,
      width: tileSize,
      height: tileSize,
    },
    gold_display: {
      x: 10,
      y: 8,
      width: 80,
      height: 40,
    },
    timer: {
      x: screenWidth / 2 - 50,
      y: 8,
      width: 100,
      height: 44,
    },
    building_crops: {
      x: 16,
      y: screenHeight - 68,
      width: 70,
      height: 58,
    },
  } : {};

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
        />
        <NamePromptModal
          visible={showNamePrompt}
          onComplete={(name) => { setPlayerName(name); setShowNamePrompt(false); }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.resourcesRow}>
          <AnimatedResourceBar icon="💰" value={gold} color="#ffc107" />
          <AnimatedResourceBar icon="👥" value={population} color="#64b5f6" />
          <AnimatedResourceBar icon="⭐" value={score} maxValue={100} color="#4caf50" showBar />
        </View>
        
        <View style={styles.headerCenter}>
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
              <TouchableOpacity style={styles.startBtn} onPress={startRound}>
                <Text style={styles.startBtnText}>
                  {round === 0 ? '▶ START' : round >= maxRounds ? 'DONE' : '▶ NEXT'}
                </Text>
              </TouchableOpacity>
            )
          )}
          <Text style={styles.roundText}>Round {round}/{maxRounds}</Text>
        </View>
        
        <View style={styles.headerRight}>
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
          <View style={styles.mapContainer}>
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
            </Island>
          </View>
        )}
      </View>
      
      {/* Animated Build Menu */}
      <AnimatedBuildMenu
        visible={showBuildMenu}
        gold={gold}
        mode={mode}
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
      />
      
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
