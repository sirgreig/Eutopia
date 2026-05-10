// src/components/multiplayer/MultiplayerLobby.tsx
// Full multiplayer lobby UI — host/join/waiting room
//
// Internal states:
//   'home'    — choose Host or Join
//   'hosting' — room created, code displayed, awaiting second player
//   'joining' — entering the room code (6 individual boxes)
//   'waiting' — both players in room, ready up before host starts

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  Clipboard,
} from 'react-native';
import {
  createRoom,
  joinRoom,
  listenToRoom,
  setPlayerReady,
  leaveRoom,
  updateRoomStatus,
  setRoundState,
  Room,
  RoomSettings,
} from '../../services/multiplayerService';
import { Sounds } from '../../services/soundManager';
import { GameConfig } from '../setup/SetupScreen';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MultiplayerLobbyProps {
  playerId: string;
  playerName: string;
  onBack: () => void;
  onStartGame: (config: GameConfig, roomCode: string, isHost: boolean, opponentId: string) => void;
}

type LobbyView = 'home' | 'hosting' | 'joining' | 'waiting';

// Safe alphabet (matches multiplayerService.ts — no 0/O/1/I/L)
const CODE_LENGTH = 6;

// ─── Component ───────────────────────────────────────────────────────────────

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  playerId,
  playerName,
  onBack,
  onStartGame,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isLandscape = screenWidth > screenHeight;

  const [view, setView] = useState<LobbyView>('home');
  const [roomCode, setRoomCode] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [joinBoxes, setJoinBoxes] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [joinError, setJoinError] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  // Default host settings — host can adjust these before starting
  const [hostSettings, setHostSettings] = useState<RoomSettings>({
    maxRounds: 15,
    roundDuration: 45,
    difficulty: 'normal',
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>(Array(CODE_LENGTH).fill(null));

  // ── Firebase listener ──────────────────────────────────────────────────────

  const subscribeToRoom = (code: string) => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = listenToRoom(code, (updatedRoom) => {
      setRoom(updatedRoom);
    });
  };

  useEffect(() => {
    return () => {
      unsubscribeRef.current?.();
    };
  }, []);

  // ── Watch room for game start ──────────────────────────────────────────────

  useEffect(() => {
    if (!room || !roomCode) return;

    if (room.status === 'playing') {
      // Host has started — launch game for both players
      const opponentId = Object.keys(room.players).find((id) => id !== playerId);
      if (!opponentId) return; // Shouldn't happen at status 'playing', but guard anyway
      const config: GameConfig = {
        mode: 'original',
        rounds: room.settings.maxRounds,
        roundDuration: room.settings.roundDuration,
        difficulty: room.settings.difficulty,
      };
      onStartGame(config, roomCode, isHost, opponentId);
    }
  }, [room?.status]);

  // ── Host flow ──────────────────────────────────────────────────────────────

  const handleHostGame = async () => {
    setIsBusy(true);
    Sounds.buttonClick();
    try {
      const code = await createRoom(playerId, playerName, hostSettings);
      setRoomCode(code);
      setIsHost(true);
      subscribeToRoom(code);
      setView('hosting');
    } catch {
      // Silently fail — show home
    } finally {
      setIsBusy(false);
    }
  };

  const handleCopyCode = () => {
    Clipboard.setString(roomCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // ── Join flow ──────────────────────────────────────────────────────────────

  const handleJoinBoxChange = (text: string, index: number) => {
    const char = text.toUpperCase().slice(-1);
    const newBoxes = [...joinBoxes];
    newBoxes[index] = char;
    setJoinBoxes(newBoxes);
    setJoinError('');

    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleJoinBoxKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !joinBoxes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleJoinGame = async () => {
    const code = joinBoxes.join('');
    if (code.length < CODE_LENGTH) {
      setJoinError('Please enter the full 6-character code.');
      return;
    }
    setIsBusy(true);
    Sounds.buttonClick();
    const result = await joinRoom(code, playerId, playerName);
    if (!result.success) {
      setJoinError(result.error);
      setIsBusy(false);
      return;
    }
    setRoomCode(code);
    setIsHost(false);
    subscribeToRoom(code);
    setView('waiting');
    setIsBusy(false);
  };

  // ── Waiting room ───────────────────────────────────────────────────────────

  const handleToggleReady = async () => {
    if (!room) return;
    Sounds.buttonClick();
    const myPlayer = room.players[playerId];
    await setPlayerReady(roomCode, playerId, !myPlayer?.isReady);
  };

  const handleStartGame = async () => {
    if (!room) return;
    Sounds.buttonClick();
    // Reset round state for a fresh game — wipes any stale data from previous sessions
    await setRoundState(roomCode, {
      number: 0,
      isActive: false,
      endTime: 0,
      duration: hostSettings.roundDuration,
      maxRounds: hostSettings.maxRounds,
    }).catch(() => { /* non-fatal */ });
    await updateRoomStatus(roomCode, 'playing');
    // The room listener will fire with status 'playing' → triggers onStartGame for both players
  };

  // ── Back / leave ───────────────────────────────────────────────────────────

  const handleBack = async () => {
    Sounds.buttonClick();
    if (roomCode) {
      await leaveRoom(roomCode, playerId, isHost);
    }
    unsubscribeRef.current?.();
    setView('home');
    setRoomCode('');
    setRoom(null);
    setJoinBoxes(Array(CODE_LENGTH).fill(''));
    setJoinError('');
    setIsHost(false);
  };

  const handleLeaveToMenu = async () => {
    await handleBack();
    onBack();
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const players = room ? Object.entries(room.players) : [];
  const myPlayer = room?.players[playerId];
  const allReady = players.length === 2 && players.every(([, p]) => p.isReady);
  const opponentEntry = players.find(([id]) => id !== playerId);
  const opponent = opponentEntry?.[1];

  // ── Renders ────────────────────────────────────────────────────────────────

  const renderHome = () => (
    <View style={styles.centreContent}>
      <Text style={styles.screenTitle}>Multiplayer</Text>
      <Text style={styles.screenSubtitle}>Play against a friend on another device</Text>

      <TouchableOpacity
        style={[styles.primaryButton, isBusy && styles.buttonDisabled]}
        onPress={handleHostGame}
        disabled={isBusy}
      >
        {isBusy ? (
          <ActivityIndicator color="#0a1a0a" />
        ) : (
          <>
            <Text style={styles.primaryButtonText}>Host Game</Text>
            <Text style={styles.primaryButtonSub}>Create a room and share the code</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => { Sounds.buttonClick(); setView('joining'); }}
      >
        <Text style={styles.secondaryButtonText}>Join Game</Text>
        <Text style={styles.secondaryButtonSub}>Enter a room code from your friend</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => { Sounds.buttonClick(); onBack(); }}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHosting = () => (
    <ScrollView contentContainerStyle={styles.centreContent}>
      <Text style={styles.screenTitle}>Game Created</Text>
      <Text style={styles.screenSubtitle}>Share this code with your friend</Text>

      {/* Room code display */}
      <View style={styles.codeDisplay}>
        {roomCode.split('').map((char, i) => (
          <View key={i} style={styles.codeBox}>
            <Text style={styles.codeChar}>{char}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
        <Text style={styles.copyButtonText}>{codeCopied ? 'Copied!' : 'Copy Code'}</Text>
      </TouchableOpacity>

      {/* Waiting card — only shown before opponent joins */}
      {!opponent && (
        <View style={styles.waitingCard}>
          <ActivityIndicator color="#4ade80" style={{ marginBottom: 10 }} />
          <Text style={styles.waitingText}>Waiting for your opponent to join...</Text>
        </View>
      )}

      {/* Once opponent joins, show ready section directly — player list serves as "joined" indicator */}
      {opponent && (
        <View style={styles.readySection}>
          <PlayerReadyRow
            name={playerName}
            isReady={myPlayer?.isReady ?? false}
            isMe
          />
          <PlayerReadyRow
            name={opponent.name}
            isReady={opponent.isReady}
            isMe={false}
          />
          <TouchableOpacity
            style={[styles.readyButton, myPlayer?.isReady && styles.readyButtonActive]}
            onPress={handleToggleReady}
          >
            <Text style={styles.readyButtonText}>
              {myPlayer?.isReady ? 'Not Ready' : 'Ready'}
            </Text>
          </TouchableOpacity>

          {allReady && (
            <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
              <Text style={styles.startButtonText}>Start Game</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderJoining = () => (
    <View style={styles.centreContent}>
      <Text style={styles.screenTitle}>Join Game</Text>
      <Text style={styles.screenSubtitle}>Enter the 6-character code from your friend</Text>

      <View style={styles.codeInputRow}>
        {joinBoxes.map((char, i) => (
          <TextInput
            key={i}
            ref={(r) => { inputRefs.current[i] = r; }}
            style={[styles.codeInputBox, char ? styles.codeInputBoxFilled : null]}
            value={char}
            onChangeText={(t) => handleJoinBoxChange(t, i)}
            onKeyPress={({ nativeEvent }) => handleJoinBoxKeyPress(nativeEvent.key, i)}
            maxLength={1}
            autoCapitalize="characters"
            autoCorrect={false}
            keyboardType="default"
            returnKeyType={i === CODE_LENGTH - 1 ? 'done' : 'next'}
            selectTextOnFocus
          />
        ))}
      </View>

      {joinError ? <Text style={styles.errorText}>{joinError}</Text> : null}

      <TouchableOpacity
        style={[
          styles.primaryButton,
          (joinBoxes.join('').length < CODE_LENGTH || isBusy) && styles.buttonDisabled,
        ]}
        onPress={handleJoinGame}
        disabled={joinBoxes.join('').length < CODE_LENGTH || isBusy}
      >
        {isBusy ? (
          <ActivityIndicator color="#0a1a0a" />
        ) : (
          <Text style={styles.primaryButtonText}>Join</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => { Sounds.buttonClick(); setView('home'); setJoinBoxes(Array(CODE_LENGTH).fill('')); setJoinError(''); }}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderWaiting = () => (
    <View style={styles.centreContent}>
      <Text style={styles.screenTitle}>Waiting Room</Text>
      <Text style={styles.screenSubtitle}>Room code: {roomCode}</Text>

      <View style={styles.waitingCard}>
        {players.length < 2 ? (
          <>
            <ActivityIndicator color="#4ade80" style={{ marginBottom: 10 }} />
            <Text style={styles.waitingText}>Waiting for host...</Text>
          </>
        ) : (
          <>
            {players.map(([id, player]) => (
              <PlayerReadyRow
                key={id}
                name={player.name + (id === playerId ? ' (You)' : '')}
                isReady={player.isReady}
                isMe={id === playerId}
              />
            ))}

            <TouchableOpacity
              style={[styles.readyButton, myPlayer?.isReady && styles.readyButtonActive]}
              onPress={handleToggleReady}
            >
              <Text style={styles.readyButtonText}>
                {myPlayer?.isReady ? 'Not Ready' : 'Ready'}
              </Text>
            </TouchableOpacity>

            {!allReady && (
              <Text style={styles.waitingHint}>
                {isHost
                  ? 'Waiting for both players to ready up...'
                  : 'Waiting for the host to start the game...'}
              </Text>
            )}

            {allReady && isHost && (
              <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
                <Text style={styles.startButtonText}>Start Game</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={handleLeaveToMenu}>
        <Text style={styles.backButtonText}>Leave Room</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Root render ────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {view === 'home' && renderHome()}
      {view === 'hosting' && renderHosting()}
      {view === 'joining' && renderJoining()}
      {view === 'waiting' && renderWaiting()}
    </View>
  );
};

// ─── Sub-component: player ready row ─────────────────────────────────────────

const PlayerReadyRow = ({
  name,
  isReady,
  isMe,
}: {
  name: string;
  isReady: boolean;
  isMe: boolean;
}) => (
  <View style={rowStyles.row}>
    <View style={rowStyles.indicator(isReady)} />
    <Text style={rowStyles.name}>{name}</Text>
    <Text style={rowStyles.status(isReady)}>{isReady ? 'Ready' : 'Not Ready'}</Text>
  </View>
);

const rowStyles = {
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#0a1a2a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    width: '100%',
    gap: 10,
  },
  indicator: (ready: boolean) => ({
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ready ? '#4ade80' : '#445566',
  }),
  name: {
    flex: 1,
    fontSize: 16,
    color: '#e0e0e0',
    fontWeight: '600' as const,
  },
  status: (ready: boolean) => ({
    fontSize: 13,
    color: ready ? '#4ade80' : '#667788',
    fontWeight: '600' as const,
  }),
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a4c',
  },
  centreContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 4,
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#88a4b8',
    marginBottom: 14,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#4ade80',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    marginBottom: 14,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a1a0a',
  },
  primaryButtonSub: {
    fontSize: 13,
    color: '#1a3a1a',
    marginTop: 2,
  },
  secondaryButton: {
    backgroundColor: '#1a3a50',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#2a5a70',
  },
  secondaryButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#88ccee',
  },
  secondaryButtonSub: {
    fontSize: 13,
    color: '#557788',
    marginTop: 2,
  },
  backButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#667788',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // Room code display (hosting)
  codeDisplay: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  codeBox: {
    width: 38,
    height: 46,
    backgroundColor: '#0a1a2a',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4ade80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeChar: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4ade80',
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: '#1a3a50',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2a5a70',
  },
  copyButtonText: {
    fontSize: 14,
    color: '#88ccee',
    fontWeight: '600',
  },
  // Code input (joining)
  codeInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  codeInputBox: {
    width: 44,
    height: 54,
    backgroundColor: '#0a1a2a',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2a4a5a',
    textAlign: 'center',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  codeInputBoxFilled: {
    borderColor: '#4ade80',
  },
  errorText: {
    fontSize: 13,
    color: '#e53935',
    marginBottom: 12,
    textAlign: 'center',
  },
  // Waiting / ready UI
  waitingCard: {
    backgroundColor: '#0a1a2a',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1a3a4a',
  },
  waitingText: {
    fontSize: 16,
    color: '#88a4b8',
    textAlign: 'center',
  },
  waitingHint: {
    fontSize: 13,
    color: '#557788',
    textAlign: 'center',
    marginTop: 10,
  },
  playerJoined: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 6,
    textAlign: 'center',
  },
  readySection: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    marginBottom: 8,
  },
  readyButton: {
    backgroundColor: '#1a3a50',
    borderRadius: 10,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#2a5a70',
  },
  readyButtonActive: {
    backgroundColor: '#1a4a2a',
    borderColor: '#4ade80',
  },
  readyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  startButton: {
    backgroundColor: '#4ade80',
    borderRadius: 10,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a1a0a',
  },
});

export default MultiplayerLobby;
