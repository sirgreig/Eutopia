// src/components/settings/SettingsScreen.tsx
// Settings overlay with music and SFX volume controls
// Uses View instead of Modal to avoid crash issues
// Responsive layout for landscape mode

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import { useAudioSettings } from '../../hooks/useAudioSettings';
import { setPlayerName as persistPlayerName } from '../../services/playerService';
import { validateDisplayName } from '../../services/nameFilter';
import { getUpdateInfo, updateLine } from '../../services/updateInfo';
import { AdService } from '../../services/adService';
import { LATEST_RELEASE_ID } from '../../constants/whatsNew';
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
    maxRounds?: number;
    /** Current display name. When provided, the Player Name section is shown. */
    playerName?: string;
    /** Called with the new name after it has been validated and persisted. */
    onPlayerNameChange?: (name: string) => void;
    /** Opens the What's New panel with the full release history. */
    onShowReleaseNotes?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
    visible,
    onClose,
    onResetTutorial,
    maxRounds = 15,
    playerName,
    onPlayerNameChange,
    onShowReleaseNotes,
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
    
    const [showHowToPlay, setShowHowToPlay] = useState(false);

    // Player name editing
    const [editingName, setEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState('');
    const [nameError, setNameError] = useState('');

    if (!visible) return null;

    const beginEditName = () => {
        Sounds.buttonClick();
        setNameDraft(playerName ?? '');
        setNameError('');
        setEditingName(true);
    };

    const cancelEditName = () => {
        Sounds.buttonClick();
        setEditingName(false);
        setNameError('');
    };

    const saveName = async () => {
        const result = validateDisplayName(nameDraft);
        if (!result.ok) {
            setNameError(result.reason);
            return;
        }
        Sounds.buttonClick();
        await persistPlayerName(result.name);
        onPlayerNameChange?.(result.name);
        setEditingName(false);
        setNameError('');
    };

    const renderBuildFooter = () => {
        const info = getUpdateInfo();
        return (
            <>
                {onShowReleaseNotes && (
                    <TouchableOpacity
                        style={styles.releaseNotesButton}
                        onPress={() => { Sounds.buttonClick(); onShowReleaseNotes(); }}
                    >
                        <Text style={styles.releaseNotesText}>What's New</Text>
                    </TouchableOpacity>
                )}
                <Text style={styles.buildFooter}>
                    Eutopia 1.0.0  ·  {updateLine(info)}  ·  notes {LATEST_RELEASE_ID}
                    {'\n'}ads: {AdService.getAdStatus()}
                </Text>
            </>
        );
    };

    const renderPlayerNameSection = (compact: boolean) => {
        if (!playerName || !onPlayerNameChange) return null;

        return (
            <View style={[styles.section, compact && styles.sectionCompact]}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}>
                        👤 Player Name
                    </Text>
                    {!editingName && (
                        <TouchableOpacity style={styles.resetTutorialButtonInline} onPress={beginEditName}>
                            <Text style={styles.resetTutorialTextCompact}>Change</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {editingName ? (
                    <>
                        <TextInput
                            style={styles.nameInput}
                            value={nameDraft}
                            onChangeText={(t) => { setNameDraft(t); setNameError(''); }}
                            maxLength={16}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={saveName}
                            placeholder="Your name"
                            placeholderTextColor="#445566"
                        />
                        {nameError ? <Text style={styles.nameError}>{nameError}</Text> : null}
                        <View style={styles.nameButtonRow}>
                            <TouchableOpacity style={styles.nameCancelBtn} onPress={cancelEditName}>
                                <Text style={styles.nameCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.nameSaveBtn} onPress={saveName}>
                                <Text style={styles.nameSaveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={styles.currentName}>{playerName}</Text>
                        <Text style={styles.helpHint}>Your opponent sees this in multiplayer games.</Text>
                    </>
                )}
            </View>
        );
    };

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

                            {/* Player Name - full width below columns */}
                            {renderPlayerNameSection(true)}
                            {renderBuildFooter()}

                            {/* Help Section - full width below columns */}
                            {onResetTutorial && (
                                <View style={[styles.section, styles.sectionCompact]}>
                                    <View style={styles.helpRow}>
                                        <Text style={[styles.sectionTitle, styles.sectionTitleCompact]}>❓ Help</Text>
                                        <View style={styles.helpButtonsRow}>
                                            <TouchableOpacity 
                                                style={styles.resetTutorialButtonInline} 
                                                onPress={() => { Sounds.buttonClick(); setShowHowToPlay(true); }}
                                            >
                                                <Text style={styles.resetTutorialTextCompact}>📖 How to Play</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={styles.resetTutorialButtonInline} 
                                                onPress={handleResetTutorial}
                                            >
                                                <Text style={styles.resetTutorialTextCompact}>🎓 Replay Tutorial</Text>
                                            </TouchableOpacity>
                                        </View>
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

                            {/* Player Name Section */}
                            {renderPlayerNameSection(false)}
                            {renderBuildFooter()}

                            {/* Help Section */}
                            {onResetTutorial && (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionTitle}>❓ Help</Text>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.resetTutorialButton} 
                                        onPress={() => { Sounds.buttonClick(); setShowHowToPlay(true); }}
                                    >
                                        <Text style={styles.resetTutorialText}>📖 How to Play</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.resetTutorialButton, { marginTop: 8 }]} 
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
            
            {/* How to Play Modal */}
            {showHowToPlay && (
                <View style={styles.howToPlayOverlay}>
                    <Pressable style={styles.backdrop} onPress={() => setShowHowToPlay(false)} />
                    <View style={[
                        styles.howToPlayContainer,
                        isLandscape && { maxHeight: screenHeight * 0.92, maxWidth: 520 },
                    ]}>
                        <View style={styles.howToPlayHeader}>
                            <Text style={styles.howToPlayTitle}>📖 How to Play</Text>
                            <TouchableOpacity onPress={() => setShowHowToPlay(false)}>
                                <Text style={styles.howToPlayClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView 
                            style={styles.howToPlayScroll}
                            showsVerticalScrollIndicator={true}
                        >
                            <Text style={styles.htpHeading}>🎯 Objective</Text>
                            <Text style={styles.htpBody}>
                                Build a thriving island nation across {maxRounds} rounds. Earn the highest score by growing your population, producing food, building infrastructure, and managing your economy. Play solo against an AI opponent, or head-to-head against a friend — highest score at the end wins.
                            </Text>
                            
                            <Text style={styles.htpHeading}>💰 Gold & Income</Text>
                            <Text style={styles.htpBody}>
                                Gold is your currency for everything. You earn gold each round from factories and productivity bonuses. Fishing boats earn gold in real-time when parked over fish schools. Rain clouds water your crops for bonus gold as they pass over farmland.
                            </Text>
                            
                            <Text style={styles.htpHeading}>🏗️ Buildings</Text>
                            <Text style={styles.htpBody}>
                                Tap any empty land tile to open the build menu. Housing increases population. Farms grow food (needs rain to earn gold). Factories generate income each round. Hospitals improve welfare. Schools boost productivity.
                            </Text>
                            
                            <Text style={styles.htpHeading}>🏰 Forts</Text>
                            <Text style={styles.htpBody}>
                                A fort shields the eight tiles immediately around it. Buildings in that ring are half as likely to be destroyed by storms, hurricanes or rebels — protection, not immunity.{'\n\n'}Boats are different: any boat sitting inside a fort's radius is completely safe from storms, hurricanes and pirates. Sheltering your fleet under a fort when bad weather rolls in is one of the strongest plays in the game.{'\n\n'}Forts themselves can still be destroyed by a hurricane.
                            </Text>
                            
                            <Text style={styles.htpHeading}>⛵ Boats</Text>
                            <Text style={styles.htpBody}>
                                Tap open water to build a boat there. Land is for buildings, water is for boats — so you can always add to your fleet, even once every land tile is developed.{'\n\n'}To move a boat, tap it to select it, then tap anywhere on the water to send it there. Tapping the boat a second time deselects it.{'\n\n'}Fishing boats earn gold whenever they are sitting over a fish school. PT boats are military vessels that sink pirate ships on contact.
                            </Text>
                            
                            <Text style={styles.htpHeading}>🐟 Fish & Pirates</Text>
                            <Text style={styles.htpBody}>
                                Fish schools drift around the ocean. Move fishing boats to them for income. Pirates spawn at the map edges and hunt your fishing boats — deploy PT boats nearby to protect your fleet, or keep your boats within a fort's radius where pirates cannot reach them.
                            </Text>
                            
                            <Text style={styles.htpHeading}>🌧️ Weather</Text>
                            <Text style={styles.htpBody}>
                                <Text style={styles.htpEmphasis}>Rain</Text> drifts across the map and waters any crops it passes over, earning you bonus gold. Plan your farm placement to catch it.{'\n\n'}<Text style={styles.htpEmphasis}>Tropical storms</Text> arrive from round 2. A storm will destroy at most one building and sink at most one boat, so it stings without ruining a round.{'\n\n'}<Text style={styles.htpEmphasis}>Hurricanes</Text> appear in the later rounds and are far more dangerous. Each one can take up to three buildings and two boats, and unlike storms it can destroy a fort. Some hurricanes are worse than others — you never know which kind you are getting until it passes.
                            </Text>
                            
                            <Text style={styles.htpHeading}>⚠️ Rebels</Text>
                            <Text style={styles.htpBody}>
                                If your population is unhappy — short of food, welfare or housing — rebels appear and destroy whatever was built on that tile. Keep your people fed and housed to maintain stability. Tiles near a fort are half as likely to be targeted.
                            </Text>
                            
                            <Text style={styles.htpHeading}>💥 Sabotage</Text>
                            <Text style={styles.htpBody}>
                                Use the rebel button in the top bar to send rebels to your opponent's island. It costs 30 gold and you can do it once per round.{'\n\n'}Your opponent can do the same to you — and so can the AI. The rebels will strike a developed tile if they can find one, though forts halve the odds of any tile in their ring being hit.
                            </Text>
                            
                            <Text style={styles.htpHeading}>👥 Multiplayer</Text>
                            <Text style={styles.htpBody}>
                                Choose Multiplayer from the main menu to host a game or join one. The host shares a six-character room code; there is no public matchmaking, so you only play with people you invite.{'\n\n'}The host controls when each round starts. Both islands run on the same clock, and weather strikes both players at the same time — though it takes a different path across each island.{'\n\n'}The panel on the right shows your opponent's island as it fills up, along with their score, gold, population and boats. You can see <Text style={styles.htpEmphasis}>where</Text> they are building, but not <Text style={styles.htpEmphasis}>what</Text> they are building.{'\n\n'}If a player disconnects, the round pauses and they have three minutes to return before forfeiting.
                            </Text>
                            
                            <Text style={styles.htpHeading}>⭐ Scoring</Text>
                            <Text style={styles.htpBody}>
                                Your score is calculated from four categories: housing capacity, food production, welfare services, and GDP (gold and factories). Balance all four for the best score. The game ends after the final round — highest score wins!
                            </Text>
                            
                            <View style={{ height: 16 }} />
                        </ScrollView>
                        <TouchableOpacity 
                            style={styles.howToPlayDone} 
                            onPress={() => setShowHowToPlay(false)}
                        >
                            <Text style={styles.closeButtonText}>Got It!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
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
    helpButtonsRow: {
        flexDirection: 'row',
        gap: 8,
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
    buildFooter: {
        fontSize: 10,
        color: '#4a5f6d',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 4,
    },
    releaseNotesButton: {
        alignSelf: 'center',
        paddingVertical: 6,
        paddingHorizontal: 16,
        marginTop: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#2a4a5a',
    },
    releaseNotesText: {
        fontSize: 12,
        color: '#88a4b8',
        fontWeight: '600',
    },
    currentName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4ade80',
        textAlign: 'center',
        marginTop: 2,
    },
    nameInput: {
        backgroundColor: '#1a2a3a',
        borderWidth: 2,
        borderColor: '#2a4a5a',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
    },
    nameError: {
        fontSize: 12,
        color: '#e53935',
        textAlign: 'center',
        marginTop: 6,
    },
    nameButtonRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    nameCancelBtn: {
        flex: 1,
        backgroundColor: '#2a4a5a',
        paddingVertical: 9,
        borderRadius: 8,
        alignItems: 'center',
    },
    nameCancelText: {
        color: '#88a4b8',
        fontSize: 14,
        fontWeight: '600',
    },
    nameSaveBtn: {
        flex: 1,
        backgroundColor: '#4ade80',
        paddingVertical: 9,
        borderRadius: 8,
        alignItems: 'center',
    },
    nameSaveText: {
        color: '#0a1a0a',
        fontSize: 14,
        fontWeight: 'bold',
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
    // How to Play modal
    howToPlayOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1100,
    },
    howToPlayContainer: {
        backgroundColor: '#1a2a3a',
        borderRadius: 16,
        width: '92%',
        maxWidth: 420,
        maxHeight: '88%',
        borderWidth: 2,
        borderColor: '#2a4a5a',
        zIndex: 1101,
        overflow: 'hidden',
    },
    howToPlayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    howToPlayTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    howToPlayClose: {
        fontSize: 22,
        color: '#6a8a9a',
        paddingHorizontal: 8,
    },
    howToPlayScroll: {
        paddingHorizontal: 20,
    },
    htpHeading: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffc107',
        marginTop: 14,
        marginBottom: 4,
    },
    htpBody: {
        fontSize: 14,
        lineHeight: 20,
        color: '#c0d0e0',
    },
    htpEmphasis: {
        color: '#ffffff',
        fontWeight: '700',
    },
    howToPlayDone: {
        backgroundColor: '#4A90D9',
        paddingVertical: 12,
        margin: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
});

export default SettingsScreen;
