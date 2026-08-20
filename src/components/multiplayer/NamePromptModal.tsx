// src/components/multiplayer/NamePromptModal.tsx
// First-launch modal that asks the player to set a display name.
// Shown once, persisted via playerService. Never shown again unless cleared.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { setPlayerName } from '../../services/playerService';
import { validateDisplayName } from '../../services/nameFilter';
import { Sounds } from '../../services/soundManager';

interface NamePromptModalProps {
  visible: boolean;
  onComplete: (name: string) => void;
}

export const NamePromptModal: React.FC<NamePromptModalProps> = ({ visible, onComplete }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const handleConfirm = async () => {
    const result = validateDisplayName(name);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    Sounds.buttonClick();
    await setPlayerName(result.name);
    onComplete(result.name);
  };

  // IMPORTANT: Do NOT use React Native's <Modal> here.
  //
  // Modal presents a separate UIViewController on iOS. With the app locked to
  // landscape (`orientation: "landscape"` + `requireFullScreen: true` in app.json),
  // UIKit finds no valid orientation for the presented controller and throws from
  // __supportedInterfaceOrientations, aborting the process. Harmless on Android and
  // web, fatal on iOS. Use an absolutely-positioned overlay instead, matching
  // AIIslandMinimap / MultiplayerIslandMinimap.
  if (!visible) return null;

  return (
    <View style={[styles.fullScreenOverlay, { width: screenWidth, height: screenHeight }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to Eutopia</Text>
          <Text style={styles.subtitle}>
            Choose a name your opponent will see during multiplayer games.
            Please don't use your real name.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#445566"
            value={name}
            onChangeText={(t) => { setName(t); setError(''); }}
            maxLength={16}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleConfirm}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, name.trim().length < 2 && styles.buttonDisabled]}
            onPress={handleConfirm}
            disabled={name.trim().length < 2}
          >
            <Text style={styles.buttonText}>Let's Play</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>You can change this later in Settings.</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10000,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#0a1a2a',
    borderRadius: 16,
    padding: 28,
    width: '85%',
    maxWidth: 380,
    borderWidth: 2,
    borderColor: '#2a4a5a',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#88a4b8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#1a2a3a',
    borderWidth: 2,
    borderColor: '#2a4a5a',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  error: {
    fontSize: 13,
    color: '#e53935',
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4ade80',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#2a4a3a',
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a1a0a',
  },
  hint: {
    fontSize: 12,
    color: '#445566',
    marginTop: 14,
    textAlign: 'center',
  },
});

export default NamePromptModal;
