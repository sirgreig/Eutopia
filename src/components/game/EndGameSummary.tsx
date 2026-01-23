// src/components/game/EndGameSummary.tsx
// End game summary screen with Play Again and Main Menu options

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
    onPlayAgain,
    onMainMenu,
}) => {
    const getScoreRating = () => {
        if (score >= 90) return { text: 'Utopia Achieved! 🏆', color: '#ffd700' };
        if (score >= 70) return { text: 'Prosperous Nation! 🌟', color: '#4ade80' };
        if (score >= 50) return { text: 'Stable Government', color: '#64b5f6' };
        if (score >= 30) return { text: 'Struggling Economy', color: '#ffc107' };
        return { text: 'Failed State 💀', color: '#e53935' };
    };

    const rating = getScoreRating();

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
                    
                    {/* Final Score */}
                    <View style={styles.scoreContainer}>
                        <Text style={[styles.scoreValue, { color: rating.color }]}>{score}</Text>
                        <Text style={styles.scoreLabel}>Final Score</Text>
                        <Text style={[styles.rating, { color: rating.color }]}>{rating.text}</Text>
                    </View>

                    {/* Score Breakdown */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Score Breakdown</Text>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>🏠 Housing</Text>
                            <Text style={styles.breakdownValue}>{scoreBreakdown.housing}/30</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>🍞 Food Supply</Text>
                            <Text style={styles.breakdownValue}>{scoreBreakdown.food}/30</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>❤️ Welfare</Text>
                            <Text style={styles.breakdownValue}>{scoreBreakdown.welfare}/30</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>💰 GDP</Text>
                            <Text style={styles.breakdownValue}>{scoreBreakdown.gdp}/30</Text>
                        </View>
                    </View>

                    {/* Final Stats */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Final Stats</Text>
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
        maxHeight: '85%',
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 16,
    },
    scoreContainer: {
        alignItems: 'center',
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#0a1a2a',
        borderRadius: 12,
    },
    scoreValue: {
        fontSize: 64,
        fontWeight: 'bold',
    },
    scoreLabel: {
        fontSize: 14,
        color: '#88a4b8',
        marginTop: 4,
    },
    rating: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 8,
    },
    section: {
        marginBottom: 16,
        backgroundColor: '#0a1a2a',
        borderRadius: 10,
        padding: 14,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#88a4b8',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#1a2a3a',
    },
    breakdownLabel: {
        fontSize: 15,
        color: '#ccc',
    },
    breakdownValue: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 12,
        color: '#88a4b8',
        marginTop: 4,
    },
    buildingsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    buildingItem: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 10,
    },
    buildingValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    buildingLabel: {
        fontSize: 18,
        marginTop: 2,
    },
    boatsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    boatItem: {
        alignItems: 'center',
    },
    boatValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    boatLabel: {
        fontSize: 13,
        color: '#88a4b8',
        marginTop: 4,
    },
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
