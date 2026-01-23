// src/components/setup/SetupScreen.tsx
// Pre-game configuration screen

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Sounds } from '../../services/soundManager';
import { GameMode } from '../../types';

// Simple selector component
interface SelectorProps<T> {
    label: string;
    value: T;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
}

function Selector<T extends string | number>({ label, value, options, onChange }: SelectorProps<T>) {
    return (
        <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>{label}</Text>
            <View style={styles.selectorOptions}>
                {options.map((option) => (
                    <TouchableOpacity
                        key={String(option.value)}
                        style={[
                            styles.selectorOption,
                            value === option.value && styles.selectorOptionActive,
                        ]}
                        onPress={() => {
                            Sounds.buttonClick();
                            onChange(option.value);
                        }}
                    >
                        <Text
                            style={[
                                styles.selectorOptionText,
                                value === option.value && styles.selectorOptionTextActive,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

// Number stepper component
interface StepperProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit?: string;
    onChange: (value: number) => void;
}

function Stepper({ label, value, min, max, step, unit = '', onChange }: StepperProps) {
    const decrease = () => {
        if (value > min) {
            Sounds.buttonClick();
            onChange(value - step);
        }
    };

    const increase = () => {
        if (value < max) {
            Sounds.buttonClick();
            onChange(value + step);
        }
    };

    return (
        <View style={styles.stepperContainer}>
            <Text style={styles.stepperLabel}>{label}</Text>
            <View style={styles.stepperControls}>
                <TouchableOpacity
                    style={[styles.stepperButton, value <= min && styles.stepperButtonDisabled]}
                    onPress={decrease}
                    disabled={value <= min}
                >
                    <Text style={styles.stepperButtonText}>−</Text>
                </TouchableOpacity>
                <View style={styles.stepperValue}>
                    <Text style={styles.stepperValueText}>
                        {value}{unit}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.stepperButton, value >= max && styles.stepperButtonDisabled]}
                    onPress={increase}
                    disabled={value >= max}
                >
                    <Text style={styles.stepperButtonText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export interface GameConfig {
    mode: GameMode;
    rounds: number;
    roundDuration: number;
    difficulty: 'easy' | 'normal' | 'hard';
}

interface SetupScreenProps {
    onStartGame: (config: GameConfig) => void;
    onOpenSettings: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
    onStartGame,
    onOpenSettings,
}) => {
    const [mode, setMode] = useState<GameMode>('original');
    const [rounds, setRounds] = useState(15);
    const [roundDuration, setRoundDuration] = useState(45);
    const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');

    const handleStartGame = () => {
        Sounds.buttonClick();
        onStartGame({
            mode,
            rounds,
            roundDuration,
            difficulty,
        });
    };

    const handleOpenSettings = () => {
        Sounds.buttonClick();
        onOpenSettings();
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <Text style={styles.title}>Eutopía</Text>
                <Text style={styles.subtitle}>Build Your Island Paradise</Text>

                {/* Game Mode */}
                <View style={styles.section}>
                    <Selector
                        label="Game Mode"
                        value={mode}
                        options={[
                            { value: 'original', label: '🏛️ Original' },
                            { value: 'enhanced', label: '✨ Enhanced' },
                        ]}
                        onChange={setMode}
                    />
                    <Text style={styles.modeDescription}>
                        {mode === 'original' 
                            ? 'Classic gameplay with original buildings'
                            : 'Expanded buildings and features'}
                    </Text>
                </View>

                {/* Number of Rounds */}
                <View style={styles.section}>
                    <Stepper
                        label="Rounds"
                        value={rounds}
                        min={5}
                        max={30}
                        step={5}
                        onChange={setRounds}
                    />
                    <Text style={styles.hint}>
                        Game length: ~{Math.round(rounds * roundDuration / 60)} minutes
                    </Text>
                </View>

                {/* Round Duration */}
                <View style={styles.section}>
                    <Stepper
                        label="Round Duration"
                        value={roundDuration}
                        min={30}
                        max={120}
                        step={15}
                        unit="s"
                        onChange={setRoundDuration}
                    />
                </View>

                {/* Difficulty (for future AI) */}
                <View style={styles.section}>
                    <Selector
                        label="Difficulty"
                        value={difficulty}
                        options={[
                            { value: 'easy', label: '😊 Easy' },
                            { value: 'normal', label: '😐 Normal' },
                            { value: 'hard', label: '😈 Hard' },
                        ]}
                        onChange={setDifficulty}
                    />
                    <Text style={styles.hint}>
                        (Affects AI opponent in future update)
                    </Text>
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
                        <Text style={styles.startButtonText}>▶ Start Game</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingsButton} onPress={handleOpenSettings}>
                        <Text style={styles.settingsButtonText}>⚙️ Audio Settings</Text>
                    </TouchableOpacity>
                </View>

                {/* Credits */}
                <Text style={styles.credits}>
                    Inspired by Utopia (1981) for Intellivision
                </Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e3a4c',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#4ade80',
        textAlign: 'center',
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#88a4b8',
        textAlign: 'center',
        marginBottom: 32,
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#0a1a2a',
        borderRadius: 12,
        padding: 16,
    },
    selectorContainer: {
        marginBottom: 8,
    },
    selectorLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#88a4b8',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    selectorOptions: {
        flexDirection: 'row',
        gap: 10,
    },
    selectorOption: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#1a2a3a',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#2a4a5a',
        alignItems: 'center',
    },
    selectorOptionActive: {
        backgroundColor: '#2a4a6a',
        borderColor: '#4A90D9',
    },
    selectorOptionText: {
        fontSize: 16,
        color: '#88a4b8',
        fontWeight: '500',
    },
    selectorOptionTextActive: {
        color: '#fff',
        fontWeight: '700',
    },
    modeDescription: {
        fontSize: 13,
        color: '#667788',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    stepperContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stepperLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#88a4b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    stepperControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stepperButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#2a4a5a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepperButtonDisabled: {
        backgroundColor: '#1a2a3a',
        opacity: 0.5,
    },
    stepperButtonText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    stepperValue: {
        minWidth: 70,
        alignItems: 'center',
    },
    stepperValueText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    hint: {
        fontSize: 12,
        color: '#556677',
        textAlign: 'center',
        marginTop: 8,
    },
    buttonContainer: {
        marginTop: 16,
        gap: 12,
    },
    startButton: {
        backgroundColor: '#4ade80',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#4ade80',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    startButtonText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0a1a0a',
    },
    settingsButton: {
        backgroundColor: '#2a4a5a',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    settingsButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#88a4b8',
    },
    credits: {
        fontSize: 12,
        color: '#445566',
        textAlign: 'center',
        marginTop: 32,
    },
});

export default SetupScreen;
