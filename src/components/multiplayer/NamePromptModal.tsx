// src/components/multiplayer/NamePromptModal.tsx
// First-launch modal that asks the player to set a display name.
// Shown once, persisted via playerService. Never shown again unless cleared.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { setPlayerName } from '../../services/playerService';
import { Sounds } from '../../services/soundManager';

interface NamePromptModalProps {
  visible: boolean;
  onComplete: (name: string) => void;
}

export const NamePromptModal: React.FC<NamePromptModalProps> = ({ visible, onComplete }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (trimmed.length > 16) {
      setError('Name must be 16 characters or fewer.');
      return;
    }
    Sounds.buttonClick();
    await setPlayerName(trimmed);
    onComplete(trimmed);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to Eutopia</Text>
          <Text style={styles.subtitle}>
            Choose a name your opponent will see during multiplayer games.
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
    </Modal>
  );
};

const styles = StyleSheet.create({
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
