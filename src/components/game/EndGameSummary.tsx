// src/components/game/EndGameSummary.tsx
// End game summary screen with AI comparison

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
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
    const hasAI = aiScore !== undefined;
    const playerWins = hasAI ? score > aiScore : score >= 70;
    const isTie = hasAI && score === aiScore;
    
    const getResultText = () => {
        if (isTie) return { text: "It's a Tie! 🤝", color: '#ffc107' };
        if (playerWins) return { text: 'Victory! 🏆', color: '#4ade80' };
        return { text: 'Defeat 💀', color: '#e53935' };
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
    
    const difficultyColors = {
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

    return (
        <View style={styles.overlay}>
            <View style={styles.container}>
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>Game Over</Text>
                    
                    {/* Result Banner */}
                    <View style={[styles.resultBanner, { borderColor: result.color }]}>
                        <Text style={[styles.resultText, { color: result.color }]}>
                            {result.text}
                        </Text>
                    </View>
                    
                    {/* Score Comparison */}
                    {hasAI ? (
                        <View style={styles.comparisonContainer}>
                            <View style={styles.scoreColumn}>
                                <Text style={styles.columnHeader}>👤 You</Text>
                                <Text style={[styles.scoreValue, { color: playerRating.color }]}>
                                    {score}
                                </Text>
                                <Text style={[styles.ratingText, { color: playerRating.color }]}>
                                    {playerRating.text}
                                </Text>
                            </View>
                            
                            <View style={styles.vsContainer}>
                                <Text style={styles.vsText}>VS</Text>
                            </View>
                            
                            <View style={styles.scoreColumn}>
                                <View style={styles.aiHeader}>
                                    <Text style={styles.columnHeader}>🤖 AI</Text>
                                    {difficulty && (
                                        <View style={[styles.diffBadge, { backgroundColor: difficultyColors[difficulty] }]}>
                                            <Text style={styles.diffText}>{difficulty}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.scoreValue, { color: aiRating?.color || '#fff' }]}>
                                    {aiScore}
                                </Text>
                                <Text style={[styles.ratingText, { color: aiRating?.color || '#888' }]}>
                                    {aiRating?.text || ''}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.singleScoreContainer}>
                            <Text style={[styles.scoreSingle, { color: playerRating.color }]}>{score}</Text>
                            <Text style={styles.scoreLabel}>Final Score</Text>
                            <Text style={[styles.ratingSingle, { color: playerRating.color }]}>{playerRating.text}</Text>
                        </View>
                    )}

                    {/* Score Breakdown Comparison */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Score Breakdown</Text>
                        
                        <View style={styles.breakdownHeader}>
                            <Text style={styles.breakdownLabel}></Text>
                            <Text style={styles.breakdownColHeader}>You</Text>
                            {hasAI && <Text style={styles.breakdownColHeader}>AI</Text>}
                        </View>
                        
                        {[
                            { icon: '🏠', label: 'Housing', player: scoreBreakdown.housing, ai: aiScoreBreakdown?.housing },
                            { icon: '🍞', label: 'Food', player: scoreBreakdown.food, ai: aiScoreBreakdown?.food },
                            { icon: '❤️', label: 'Welfare', player: scoreBreakdown.welfare, ai: aiScoreBreakdown?.welfare },
                            { icon: '💰', label: 'GDP', player: scoreBreakdown.gdp, ai: aiScoreBreakdown?.gdp },
                        ].map(({ icon, label, player, ai }) => (
                            <View key={label} style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>{icon} {label}</Text>
                                <Text style={[
                                    styles.breakdownValue,
                                    hasAI && ai !== undefined && player > ai && styles.winningValue
                                ]}>
                                    {player}/30
                                </Text>
                                {hasAI && ai !== undefined && (
                                    <Text style={[
                                        styles.breakdownValue,
                                        ai > player && styles.winningValue
                                    ]}>
                                        {ai}/30
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Final Stats */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Your Stats</Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{population.toLocaleString()}</Text>
                                <Text style={styles.statLabel}>Population</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{gold}</Text>
                                <Text style={styles.statLabel}>Gold</Text>
                            </View>
                        </View>
                    </View>

                    {/* Buildings */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Buildings</Text>
                        <View style={styles.buildingsGrid}>
                            <View style={styles.buildingItem}>
                                <Text style={styles.buildingValue}>{buildings.houses}</Text>
                                <Text style={styles.buildingLabel}>🏠</Text>
                            </View>
                            <View style={styles.buildingItem}>
                                <Text style={styles.buildingValue}>{buildings.farms}</Text>
                                <Text style={styles.buildingLabel}>🌾</Text>
                            </View>
                            <View style={styles.buildingItem}>
                                <Text style={styles.buildingValue}>{buildings.factories}</Text>
                                <Text style={styles.buildingLabel}>🏭</Text>
                            </View>
                            <View style={styles.buildingItem}>
                                <Text style={styles.buildingValue}>{buildings.schools}</Text>
                                <Text style={styles.buildingLabel}>🏫</Text>
                            </View>
                            <View style={styles.buildingItem}>
                                <Text style={styles.buildingValue}>{buildings.hospitals}</Text>
                                <Text style={styles.buildingLabel}>🏥</Text>
                            </View>
                            <View style={styles.buildingItem}>
                                <Text style={styles.buildingValue}>{buildings.forts}</Text>
                                <Text style={styles.buildingLabel}>🏰</Text>
                            </View>
                        </View>
                    </View>

                    {/* Boats */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Fleet</Text>
                        <View style={styles.boatsGrid}>
                            <View style={styles.boatItem}>
                                <Text style={styles.boatValue}>{boats.fishing}</Text>
                                <Text style={styles.boatLabel}>🎣 Fishing</Text>
                            </View>
                            <View style={styles.boatItem}>
                                <Text style={styles.boatValue}>{boats.pt}</Text>
                                <Text style={styles.boatLabel}>⚓ PT Boats</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.playAgainButton} onPress={handlePlayAgain}>
                        <Text style={styles.playAgainText}>↻ Play Again</Text>
                    </TouchableOpacity>
                    {onMainMenu && (
                        <TouchableOpacity style={styles.mainMenuButton} onPress={handleMainMenu}>
                            <Text style={styles.mainMenuText}>🏠 Main Menu</Text>
                        </TouchableOpacity>
                    )}
                </View>
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        backgroundColor: '#1a2a3a',
        borderRadius: 16,
        width: '92%',
        maxWidth: 400,
        maxHeight: '88%',
        borderWidth: 2,
        borderColor: '#2a4a5a',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
    },
    resultBanner: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    resultText: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    
    // Score comparison styles
    comparisonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#0a1a2a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    scoreColumn: {
        alignItems: 'center',
        flex: 1,
    },
    columnHeader: {
        fontSize: 14,
        color: '#88a4b8',
        marginBottom: 4,
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    diffBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    diffText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#000',
        textTransform: 'capitalize',
    },
    scoreValue: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    vsContainer: {
        paddingHorizontal: 12,
    },
    vsText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#556677',
    },
    
    // Single score (no AI)
    singleScoreContainer: {
        alignItems: 'center',
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#0a1a2a',
        borderRadius: 12,
    },
    scoreSingle: {
        fontSize: 64,
        fontWeight: 'bold',
    },
    scoreLabel: {
        fontSize: 14,
        color: '#88a4b8',
        marginTop: 4,
    },
    ratingSingle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 8,
    },
    
    // Breakdown styles
    section: {
        marginBottom: 14,
        backgroundColor: '#0a1a2a',
        borderRadius: 10,
        padding: 12,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#88a4b8',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    breakdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#2a4a5a',
        marginBottom: 4,
    },
    breakdownColHeader: {
        fontSize: 12,
        fontWeight: '600',
        color: '#667788',
        width: 50,
        textAlign: 'center',
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#1a2a3a',
    },
    breakdownLabel: {
        fontSize: 14,
        color: '#ccc',
        flex: 1,
    },
    breakdownValue: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
        width: 50,
        textAlign: 'center',
    },
    winningValue: {
        color: '#4ade80',
        fontWeight: '700',
    },
    
    // Stats styles
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 11,
        color: '#88a4b8',
        marginTop: 2,
    },
    
    // Buildings styles
    buildingsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    buildingItem: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 8,
    },
    buildingValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    buildingLabel: {
        fontSize: 16,
        marginTop: 2,
    },
    
    // Boats styles
    boatsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    boatItem: {
        alignItems: 'center',
    },
    boatValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    boatLabel: {
        fontSize: 12,
        color: '#88a4b8',
        marginTop: 2,
    },
    
    // Button styles
    buttonContainer: {
        padding: 16,
        paddingTop: 8,
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: '#2a4a5a',
    },
    playAgainButton: {
        backgroundColor: '#4ade80',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    playAgainText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0a1a0a',
    },
    mainMenuButton: {
        backgroundColor: '#2a4a5a',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    mainMenuText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#88a4b8',
    },
});

export default EndGameSummary;
