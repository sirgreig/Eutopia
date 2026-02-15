// src/components/settings/SettingsScreen.tsx
// Settings overlay with music and SFX volume controls
// Uses View instead of Modal to avoid crash issues
// Responsive layout for landscape mode

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    ScrollView,
    useWindowDimensions,
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
    compact?: boolean;
}

const SimpleSlider: React.FC<SimpleSliderProps> = ({
    value,
    onValueChange,
    minimumValue = 0,
    maximumValue = 1,
    trackColor = '#4A90D9',
    disabled = false,
    compact = false,
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
                style={[
                    styles.sliderButton, 
                    compact && styles.sliderButtonCompact,
                    disabled && styles.sliderButtonDisabled,
                ]} 
                onPress={() => adjustValue(-0.1)}
                disabled={disabled}
            >
                <Text style={[styles.sliderButtonText, compact && styles.sliderButtonTextCompact]}>−</Text>
            </TouchableOpacity>
            
            <View style={[
                styles.sliderTrack, 
                compact && styles.sliderTrackCompact,
                disabled && styles.sliderTrackDisabled,
            ]}>
                <View 
                    style={[
                        styles.sliderFill, 
                        { width: `${percentage}%`, backgroundColor: disabled ? '#666' : trackColor }
                    ]} 
                />
            </View>
            
            <TouchableOpacity 
                style={[
                    styles.sliderButton, 
                    compact && styles.sliderButtonCompact,
                    disabled && styles.sliderButtonDisabled,
                ]} 
                onPress={() => adjustValue(0.1)}
                disabled={disabled}
            >
                <Text style={[styles.sliderButtonText, compact && styles.sliderButtonTextCompact]}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

interface SettingsScreenProps {
    visible: boolean;
    onClose: () => void;
    onResetTutorial?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
    visible,
    onClose,
    onResetTutorial,
}) => {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const isLandscape = screenWidth > screenHeight;
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

    const handleResetTutorial = () => {
        Sounds.buttonClick();
        if (onResetTutorial) {
            onResetTutorial();
            onClose();
        }
    };

    const handleClose = () => {
        Sounds.buttonClick();
        onClose();
    };

    return (
        <View style={styles.overlay}>
            <Pressable style={styles.backdrop} onPress={handleClose} />
            <View style={[
                styles.container,
                isLandscape && styles.containerLandscape,
                { maxHeight: screenHeight * (isLandscape ? 0.92 : 0.85) },
            ]}>
                {/* Header with title and close */}
                <View style={[styles.header, isLandscape && styles.headerLandscape]}>
                    <Text style={[styles.title, isLandscape && styles.titleLandscape]}>⚙️ Settings</Text>
                    <TouchableOpacity style={styles.headerCloseBtn} onPress={handleClose}>
                        <Text style={styles.headerCloseBtnText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={isLandscape ? styles.scrollContentLandscape : undefined}
                >
                    {isLandscape ? (
                        /* Landscape: two-column layout for audio sections */
                        <>
                            <View style={styles.columnsRow}>
                                {/* Music Section */}
                                <View style={[styles.section, styles.columnSection]}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={[styles.sectionTitle, styles.sectionTitleCompact]}>🎵 Music</Text>
                                        <TouchableOpacity
                                            style={[styles.toggleButton, styles.toggleButtonCompact, !settings.musicEnabled && styles.toggleButtonOff]}
                                            onPress={handleMusicToggle}
                                        >
                                            <Text style={[styles.toggleButtonText, styles.toggleButtonTextCompact]}>
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
                                        compact
                                    />
                                </View>

                                {/* SFX Section */}
                                <View style={[styles.section, styles.columnSection]}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={[styles.sectionTitle, styles.sectionTitleCompact]}>🔊 Effects</Text>
                                        <TouchableOpacity
                                            style={[styles.toggleButton, styles.toggleButtonCompact, !settings.sfxEnabled && styles.toggleButtonOff]}
                                            onPress={handleSfxToggle}
                                        >
                                            <Text style={[styles.toggleButtonText, styles.toggleButtonTextCompact]}>
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
                                        compact
                                    />
                                </View>
                            </View>

                            {/* Help Section - full width below columns */}
                            {onResetTutorial && (
                                <View style={[styles.section, styles.sectionCompact]}>
                                    <View style={styles.helpRow}>
                                        <Text style={[styles.sectionTitle, styles.sectionTitleCompact]}>❓ Help</Text>
                                        <TouchableOpacity 
                                            style={styles.resetTutorialButtonInline} 
                                            onPress={handleResetTutorial}
                                        >
                                            <Text style={styles.resetTutorialTextCompact}>🎓 Replay Tutorial</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </>
                    ) : (
                        /* Portrait: original single-column layout */
                        <>
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

                            {/* Help Section */}
                            {onResetTutorial && (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionTitle}>❓ Help</Text>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.resetTutorialButton} 
                                        onPress={handleResetTutorial}
                                    >
                                        <Text style={styles.resetTutorialText}>🎓 Replay Tutorial</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.helpHint}>
                                        Tutorial will show on your next game
                                    </Text>
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>

                {/* Done Button */}
                <TouchableOpacity 
                    style={[styles.closeButton, isLandscape && styles.closeButtonLandscape]} 
                    onPress={handleClose}
                >
                    <Text style={[styles.closeButtonText, isLandscape && styles.closeButtonTextLandscape]}>Done</Text>
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
    containerLandscape: {
        padding: 14,
        paddingBottom: 10,
        maxWidth: 520,
        width: '70%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        position: 'relative',
    },
    headerLandscape: {
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    titleLandscape: {
        fontSize: 18,
    },
    headerCloseBtn: {
        position: 'absolute',
        right: 0,
        top: -2,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCloseBtnText: {
        color: '#6a8a9a',
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContentLandscape: {
        paddingBottom: 4,
    },
    columnsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    columnSection: {
        flex: 1,
        marginBottom: 0,
    },
    section: {
        marginBottom: 16,
        backgroundColor: '#0a1a2a',
        borderRadius: 12,
        padding: 16,
    },
    sectionCompact: {
        marginBottom: 8,
        padding: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    sectionTitleCompact: {
        fontSize: 15,
    },
    toggleButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    toggleButtonCompact: {
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    toggleButtonOff: {
        backgroundColor: '#666',
    },
    toggleButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    toggleButtonTextCompact: {
        fontSize: 12,
    },
    volumeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    volumeLabel: {
        fontSize: 13,
        color: '#aaa',
    },
    volumeValue: {
        fontSize: 13,
        color: '#fff',
        fontWeight: '600',
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    sliderButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2a4a5a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sliderButtonCompact: {
        width: 28,
        height: 28,
        borderRadius: 14,
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
    sliderButtonTextCompact: {
        fontSize: 16,
    },
    sliderTrack: {
        flex: 1,
        height: 8,
        backgroundColor: '#2a3a4a',
        borderRadius: 4,
        overflow: 'hidden',
    },
    sliderTrackCompact: {
        height: 6,
    },
    sliderTrackDisabled: {
        backgroundColor: '#1a2a3a',
    },
    sliderFill: {
        height: '100%',
        borderRadius: 4,
    },
    helpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resetTutorialButton: {
        backgroundColor: '#2a4a5a',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    resetTutorialButtonInline: {
        backgroundColor: '#2a4a5a',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    resetTutorialText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resetTutorialTextCompact: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    helpHint: {
        fontSize: 12,
        color: '#6a8a9a',
        textAlign: 'center',
        marginTop: 8,
    },
    closeButton: {
        backgroundColor: '#4A90D9',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 4,
    },
    closeButtonLandscape: {
        paddingVertical: 10,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButtonTextLandscape: {
        fontSize: 15,
    },
});

export default SettingsScreen;
