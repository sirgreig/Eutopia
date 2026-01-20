// src/components/settings/SettingsScreen.tsx
// Settings overlay with music and SFX volume controls
// Uses View instead of Modal to avoid crash issues

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import { useAudioSettings } from '../../hooks/useAudioSettings';
import { Sounds } from '../../services/soundManager';

// Custom slider component (avoiding @react-native-community/slider crash)
interface SimpleSliderProps {
    value: number;
    onValueChange: (value: number) => void;
    minimumValue?: number;
    maximumValue?: number;
    trackColor?: string;
    disabled?: boolean;
}

const SimpleSlider: React.FC<SimpleSliderProps> = ({
    value,
    onValueChange,
    minimumValue = 0,
    maximumValue = 1,
    trackColor = '#4A90D9',
    disabled = false,
}) => {
    const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;
    
    const adjustValue = (delta: number) => {
        if (disabled) return;
        const newValue = value + delta;
        onValueChange(Math.max(minimumValue, Math.min(maximumValue, newValue)));
    };

    return (
        <View style={styles.sliderContainer}>
            <TouchableOpacity 
                style={[styles.sliderButton, disabled && styles.sliderButtonDisabled]} 
                onPress={() => adjustValue(-0.1)}
                disabled={disabled}
            >
                <Text style={styles.sliderButtonText}>−</Text>
            </TouchableOpacity>
            
            <View style={[styles.sliderTrack, disabled && styles.sliderTrackDisabled]}>
                <View 
                    style={[
                        styles.sliderFill, 
                        { width: `${percentage}%`, backgroundColor: disabled ? '#666' : trackColor }
                    ]} 
                />
            </View>
            
            <TouchableOpacity 
                style={[styles.sliderButton, disabled && styles.sliderButtonDisabled]} 
                onPress={() => adjustValue(0.1)}
                disabled={disabled}
            >
                <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

interface SettingsScreenProps {
    visible: boolean;
    onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
    visible,
    onClose,
}) => {
    const {
        settings,
        toggleMusic,
        toggleSfx,
        setMusicVolume,
        setSfxVolume,
    } = useAudioSettings();

    if (!visible) return null;

    const handleMusicToggle = async () => {
        Sounds.buttonClick();
        await toggleMusic();
    };

    const handleSfxToggle = async () => {
        Sounds.buttonClick();
        await toggleSfx();
    };

    const handleMusicVolumeChange = async (volume: number) => {
        await setMusicVolume(volume);
    };

    const handleSfxVolumeChange = async (volume: number) => {
        await setSfxVolume(volume);
    };

    const handleClose = () => {
        Sounds.buttonClick();
        onClose();
    };

    return (
        <View style={styles.overlay}>
            <Pressable style={styles.backdrop} onPress={handleClose} />
            <View style={styles.container}>
                <Text style={styles.title}>⚙️ Settings</Text>

                {/* Music Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🎵 Music</Text>
                        <TouchableOpacity
                            style={[styles.toggleButton, !settings.musicEnabled && styles.toggleButtonOff]}
                            onPress={handleMusicToggle}
                        >
                            <Text style={styles.toggleButtonText}>
                                {settings.musicEnabled ? 'ON' : 'OFF'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.volumeRow}>
                        <Text style={styles.volumeLabel}>Volume</Text>
                        <Text style={styles.volumeValue}>{Math.round(settings.musicVolume * 100)}%</Text>
                    </View>
                    <SimpleSlider
                        value={settings.musicVolume}
                        onValueChange={handleMusicVolumeChange}
                        trackColor="#4A90D9"
                        disabled={!settings.musicEnabled}
                    />
                </View>

                {/* SFX Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🔊 Sound Effects</Text>
                        <TouchableOpacity
                            style={[styles.toggleButton, !settings.sfxEnabled && styles.toggleButtonOff]}
                            onPress={handleSfxToggle}
                        >
                            <Text style={styles.toggleButtonText}>
                                {settings.sfxEnabled ? 'ON' : 'OFF'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.volumeRow}>
                        <Text style={styles.volumeLabel}>Volume</Text>
                        <Text style={styles.volumeValue}>{Math.round(settings.sfxVolume * 100)}%</Text>
                    </View>
                    <SimpleSlider
                        value={settings.sfxVolume}
                        onValueChange={handleSfxVolumeChange}
                        trackColor="#5AAF6A"
                        disabled={!settings.sfxEnabled}
                    />
                </View>

                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Text style={styles.closeButtonText}>Done</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    container: {
        backgroundColor: '#1a2a3a',
        borderRadius: 16,
        padding: 24,
        width: '90%',
        maxWidth: 360,
        borderWidth: 2,
        borderColor: '#2a4a5a',
        zIndex: 1001,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#0a1a2a',
        borderRadius: 12,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    toggleButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    toggleButtonOff: {
        backgroundColor: '#666',
    },
    toggleButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    volumeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    volumeLabel: {
        fontSize: 14,
        color: '#aaa',
    },
    volumeValue: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sliderButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2a4a5a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sliderButtonDisabled: {
        backgroundColor: '#1a2a3a',
        opacity: 0.5,
    },
    sliderButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    sliderTrack: {
        flex: 1,
        height: 8,
        backgroundColor: '#2a3a4a',
        borderRadius: 4,
        overflow: 'hidden',
    },
    sliderTrackDisabled: {
        backgroundColor: '#1a2a3a',
    },
    sliderFill: {
        height: '100%',
        borderRadius: 4,
    },
    closeButton: {
        backgroundColor: '#4A90D9',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default SettingsScreen;
