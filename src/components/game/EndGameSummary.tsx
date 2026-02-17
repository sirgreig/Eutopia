// src/components/game/EndGameSummary.tsx
// Victory/defeat screen with score comparison

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import { Sounds } from '../../services/soundManager';

interface EndGameSummaryProps {
    score: number;
    scoreBreakdown: {
        housing: number;
        food: number;
        welfare: number;
        gdp: number;
    };
    population: number;
    gold: number;
    buildings: {
        houses: number;
        farms: number;
        factories: number;
        schools: number;
        hospitals: number;
        forts: number;
    };
    boats: {
        fishing: number;
        pt: number;
    };
    aiScore?: number;
    aiScoreBreakdown?: {
        housing: number;
        food: number;
        welfare: number;
        gdp: number;
    };
    difficulty?: 'easy' | 'normal' | 'hard';
    onPlayAgain: () => void;
    onMainMenu?: () => void;
}

const ScoreBar = ({ value, max, color, width }: { value: number; max: number; color: string; width: number }) => (
    <View style={[barStyles.track, { width }]}>
        <View style={[barStyles.fill, { width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }]} />
    </View>
);

const barStyles = StyleSheet.create({
    track: { height: 6, backgroundColor: '#1a2530', borderRadius: 3, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 3 },
});

export const EndGameSummary: React.FC<EndGameSummaryProps> = ({
    score,
    scoreBreakdown,
    population,
    gold,
    buildings,
    boats,
    aiScore,
    aiScoreBreakdown,
    difficulty,
    onPlayAgain,
    onMainMenu,
}) => {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const isLandscape = screenWidth > screenHeight;
    const hasAI = aiScore !== undefined;
    const playerWins = hasAI ? score > aiScore : score >= 70;
    const isTie = hasAI && score === aiScore;
    
    const getResultText = () => {
        if (isTie) return { text: "It's a Tie!", emoji: '🤝', color: '#ffc107' };
        if (playerWins) return { text: 'Victory!', emoji: '🏆', color: '#4ade80' };
        return { text: 'Defeat', emoji: '💀', color: '#e53935' };
    };
    
    const getScoreRating = (s: number) => {
        if (s >= 90) return { text: 'Utopia!', color: '#ffd700' };
        if (s >= 70) return { text: 'Prosperous', color: '#4ade80' };
        if (s >= 50) return { text: 'Stable', color: '#64b5f6' };
        if (s >= 30) return { text: 'Struggling', color: '#ffc107' };
        return { text: 'Failed', color: '#e53935' };
    };

    const result = getResultText();
    const playerRating = getScoreRating(score);
    const aiRating = hasAI ? getScoreRating(aiScore) : null;
    
    const difficultyColors: Record<string, string> = {
        easy: '#4ade80',
        normal: '#ffc107',
        hard: '#e53935',
    };

    const handlePlayAgain = () => {
        Sounds.buttonClick();
        onPlayAgain();
    };

    const handleMainMenu = () => {
        Sounds.buttonClick();
        onMainMenu?.();
    };

    const breakdownRows = [
        { icon: '🏠', label: 'Housing', player: scoreBreakdown.housing, ai: aiScoreBreakdown?.housing },
        { icon: '🍞', label: 'Food', player: scoreBreakdown.food, ai: aiScoreBreakdown?.food },
        { icon: '❤️', label: 'Welfare', player: scoreBreakdown.welfare, ai: aiScoreBreakdown?.welfare },
        { icon: '💰', label: 'GDP', player: scoreBreakdown.gdp, ai: aiScoreBreakdown?.gdp },
    ];

    // Score comparison panel (used in both layouts)
    const ScorePanel = () => (
        <View style={styles.scorePanel}>
            {/* Result banner */}
            <Text style={[styles.resultEmoji, { fontSize: isLandscape ? 36 : 48 }]}>{result.emoji}</Text>
            <Text style={[styles.resultText, { color: result.color, fontSize: isLandscape ? 22 : 28 }]}>
                {result.text}
            </Text>
            
            {/* Score face-off */}
            {hasAI ? (
                <View style={styles.faceOff}>
                    <View style={styles.faceOffSide}>
                        <Text style={styles.faceOffLabel}>👤 You</Text>
                        <Text style={[styles.faceOffScore, { color: playerRating.color, fontSize: isLandscape ? 40 : 52 }]}>
                            {score}
                        </Text>
                        <Text style={[styles.faceOffRating, { color: playerRating.color }]}>
                            {playerRating.text}
                        </Text>
                    </View>
                    
                    <View style={styles.faceOffVs}>
                        <Text style={styles.vsText}>VS</Text>
                    </View>
                    
                    <View style={styles.faceOffSide}>
                        <View style={styles.aiLabelRow}>
                            <Text style={styles.faceOffLabel}>🤖 AI</Text>
                            {difficulty && (
                                <View style={[styles.diffBadge, { backgroundColor: difficultyColors[difficulty] || '#888' }]}>
                                    <Text style={styles.diffText}>{difficulty}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.faceOffScore, { color: aiRating?.color || '#fff', fontSize: isLandscape ? 40 : 52 }]}>
                            {aiScore}
                        </Text>
                        <Text style={[styles.faceOffRating, { color: aiRating?.color || '#888' }]}>
                            {aiRating?.text || ''}
                        </Text>
                    </View>
                </View>
            ) : (
                <View style={styles.singleScore}>
                    <Text style={[styles.faceOffScore, { color: playerRating.color, fontSize: isLandscape ? 48 : 64 }]}>
                        {score}
                    </Text>
                    <Text style={[styles.faceOffRating, { color: playerRating.color, fontSize: 16 }]}>
                        {playerRating.text}
                    </Text>
                </View>
            )}
        </View>
    );

    // Breakdown panel
    const BreakdownPanel = () => (
        <View style={styles.breakdownPanel}>
            <Text style={styles.sectionTitle}>Score Breakdown</Text>
            
            {/* Header */}
            <View style={styles.bkHeader}>
                <Text style={[styles.bkLabel, { flex: 1 }]}></Text>
                <Text style={styles.bkColHead}>You</Text>
                {hasAI && <Text style={styles.bkColHead}>AI</Text>}
            </View>
            
            {breakdownRows.map(({ icon, label, player, ai }) => (
                <View key={label} style={styles.bkRow}>
                    <Text style={styles.bkLabel}>{icon} {label}</Text>
                    <View style={styles.bkValueCol}>
                        <Text style={[
                            styles.bkValue,
                            hasAI && ai !== undefined && player > ai && styles.bkWin,
                        ]}>
                            {player}/30
                        </Text>
                        <ScoreBar value={player} max={30} color={player >= 20 ? '#4ade80' : player >= 10 ? '#ffc107' : '#e53935'} width={50} />
                    </View>
                    {hasAI && ai !== undefined && (
                        <View style={styles.bkValueCol}>
                            <Text style={[
                                styles.bkValue,
                                ai > player && styles.bkWin,
                            ]}>
                                {ai}/30
                            </Text>
                            <ScoreBar value={ai} max={30} color={ai >= 20 ? '#4ade80' : ai >= 10 ? '#ffc107' : '#e53935'} width={50} />
                        </View>
                    )}
                </View>
            ))}
        </View>
    );

    // Stats panel
    const StatsPanel = () => (
        <View style={styles.statsPanel}>
            <Text style={styles.sectionTitle}>Your Nation</Text>
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statVal}>{population.toLocaleString()}</Text>
                    <Text style={styles.statLbl}>👥 Pop</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statVal}>{gold}</Text>
                    <Text style={styles.statLbl}>💰 Gold</Text>
                </View>
            </View>
            <View style={styles.buildRow}>
                {[
                    { icon: '🏠', count: buildings.houses },
                    { icon: '🌾', count: buildings.farms },
                    { icon: '🏭', count: buildings.factories },
                    { icon: '🏫', count: buildings.schools },
                    { icon: '🏥', count: buildings.hospitals },
                    { icon: '🏰', count: buildings.forts },
                    { icon: '🎣', count: boats.fishing },
                    { icon: '⚓', count: boats.pt },
                ].map(({ icon, count }, i) => (
                    <View key={i} style={styles.buildItem}>
                        <Text style={styles.buildIcon}>{icon}</Text>
                        <Text style={styles.buildCount}>{count}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    // Buttons
    const ActionButtons = () => (
        <View style={[styles.btnRow, isLandscape && styles.btnRowLandscape]}>
            <TouchableOpacity style={[styles.playBtn, isLandscape && { flex: 1 }]} onPress={handlePlayAgain}>
                <Text style={styles.playBtnText}>↻ Play Again</Text>
            </TouchableOpacity>
            {onMainMenu && (
                <TouchableOpacity style={[styles.menuBtn, isLandscape && { flex: 1 }]} onPress={handleMainMenu}>
                    <Text style={styles.menuBtnText}>🏠 Main Menu</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={styles.overlay}>
            <View style={[
                styles.container,
                isLandscape && styles.containerLandscape,
            ]}>
                {isLandscape ? (
                    // LANDSCAPE: Two-column layout
                    <>
                        <View style={styles.landscapeBody}>
                            {/* Left column: Score + Buttons */}
                            <View style={styles.leftCol}>
                                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                                    <ScorePanel />
                                    <BreakdownPanel />
                                </ScrollView>
                                <ActionButtons />
                            </View>
                            
                            {/* Right column: Stats */}
                            <View style={styles.rightCol}>
                                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                                    <StatsPanel />
                                </ScrollView>
                            </View>
                        </View>
                    </>
                ) : (
                    // PORTRAIT: Single-column scrollable
                    <>
                        <ScrollView 
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={true}
                            bounces={false}
                        >
                            <ScorePanel />
                            <BreakdownPanel />
                            <StatsPanel />
                        </ScrollView>
                        <ActionButtons />
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        backgroundColor: '#1a2a3a',
        borderRadius: 16,
        width: '92%',
        maxWidth: 420,
        maxHeight: '90%',
        borderWidth: 2,
        borderColor: '#2a4a5a',
        overflow: 'hidden',
    },
    containerLandscape: {
        maxWidth: 700,
        width: '88%',
        maxHeight: '94%',
    },
    
    // Landscape layout
    landscapeBody: {
        flexDirection: 'row',
        flex: 1,
    },
    leftCol: {
        flex: 3,
        borderRightWidth: 1,
        borderRightColor: '#2a4a5a',
    },
    rightCol: {
        flex: 2,
    },
    
    // Portrait scroll
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    
    // Score Panel
    scorePanel: {
        alignItems: 'center',
        padding: 16,
        paddingBottom: 12,
    },
    resultEmoji: {
        marginBottom: 4,
    },
    resultText: {
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    faceOff: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        backgroundColor: '#0a1a2a',
        borderRadius: 12,
        padding: 14,
    },
    faceOffSide: {
        alignItems: 'center',
        flex: 1,
    },
    faceOffLabel: {
        fontSize: 13,
        color: '#88a4b8',
        marginBottom: 2,
    },
    aiLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 2,
    },
    diffBadge: {
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 4,
    },
    diffText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#000',
        textTransform: 'capitalize',
    },
    faceOffScore: {
        fontWeight: 'bold',
    },
    faceOffRating: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 2,
    },
    faceOffVs: {
        paddingHorizontal: 10,
    },
    vsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#556677',
    },
    singleScore: {
        alignItems: 'center',
        backgroundColor: '#0a1a2a',
        borderRadius: 12,
        padding: 14,
        width: '100%',
    },
    
    // Breakdown Panel
    breakdownPanel: {
        backgroundColor: '#0a1a2a',
        borderRadius: 10,
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#88a4b8',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    bkHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#2a4a5a',
        marginBottom: 4,
    },
    bkColHead: {
        fontSize: 11,
        fontWeight: '600',
        color: '#667788',
        width: 60,
        textAlign: 'center',
    },
    bkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#152535',
    },
    bkLabel: {
        fontSize: 13,
        color: '#ccc',
        flex: 1,
    },
    bkValueCol: {
        width: 60,
        alignItems: 'center',
        gap: 2,
    },
    bkValue: {
        fontSize: 13,
        color: '#fff',
        fontWeight: '500',
    },
    bkWin: {
        color: '#4ade80',
        fontWeight: '700',
    },
    
    // Stats Panel
    statsPanel: {
        padding: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 14,
    },
    statBox: {
        alignItems: 'center',
        backgroundColor: '#0a1a2a',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 18,
    },
    statVal: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLbl: {
        fontSize: 11,
        color: '#88a4b8',
        marginTop: 2,
    },
    buildRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    buildItem: {
        alignItems: 'center',
        backgroundColor: '#0a1a2a',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        minWidth: 48,
    },
    buildIcon: {
        fontSize: 18,
    },
    buildCount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 2,
    },
    
    // Buttons
    btnRow: {
        padding: 14,
        paddingTop: 8,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#2a4a5a',
    },
    btnRowLandscape: {
        flexDirection: 'row',
    },
    playBtn: {
        backgroundColor: '#4ade80',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    playBtnText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#0a1a0a',
    },
    menuBtn: {
        backgroundColor: '#2a4a5a',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    menuBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#88a4b8',
    },
});

export default EndGameSummary;
