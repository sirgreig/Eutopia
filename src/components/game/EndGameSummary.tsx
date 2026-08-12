// src/components/game/EndGameSummary.tsx
// End game summary screen — wide landscape layout

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
    /** Phase 8E — when set, the faceoff shows this human opponent instead of the AI */
    opponentName?: string;
    /** Phase 8E — win awarded because the opponent disconnected */
    wonByForfeit?: boolean;
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
    opponentName,
    wonByForfeit = false,
    onPlayAgain,
    onMainMenu,
}) => {
    const { width: screenW, height: screenH } = useWindowDimensions();
    const isLandscape = screenW > screenH;
    
    const hasAI = aiScore !== undefined;
    const playerWins = hasAI ? score > aiScore : score >= 70;
    const isTie = hasAI && score === aiScore;
    
    const getResultText = () => {
        if (wonByForfeit) return { text: 'Victory by Forfeit 🏆', color: '#4ade80', emoji: '🏆' };
        if (isTie) return { text: "It's a Tie! 🤝", color: '#ffc107', emoji: '🤝' };
        if (playerWins) return { text: 'Victory! 🏆', color: '#4ade80', emoji: '🏆' };
        return { text: 'Defeat 💀', color: '#e53935', emoji: '💀' };
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

    const handlePlayAgain = () => { Sounds.buttonClick(); onPlayAgain(); };
    const handleMainMenu = () => { Sounds.buttonClick(); onMainMenu?.(); };

    // Score bar component
    const ScoreBar = ({ value, max = 30, winning = false }: { value: number; max?: number; winning?: boolean }) => (
        <View style={s.barBg}>
            <View style={[s.barFill, { width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: winning ? '#4ade80' : '#556677' }]} />
        </View>
    );

    // Breakdown row
    const BreakdownRow = ({ icon, label, player, ai }: { icon: string; label: string; player: number; ai?: number }) => {
        const playerWins = ai !== undefined && player > ai;
        const aiWins = ai !== undefined && ai > player;
        return (
            <View style={s.breakdownRow}>
                <Text style={s.breakdownLabel}>{icon} {label}</Text>
                <Text style={[s.breakdownVal, playerWins && s.winVal]}>{player}</Text>
                <ScoreBar value={player} winning={playerWins} />
                {hasAI && ai !== undefined && (
                    <>
                        <ScoreBar value={ai} winning={aiWins} />
                        <Text style={[s.breakdownVal, aiWins && s.winVal]}>{ai}</Text>
                    </>
                )}
            </View>
        );
    };

    return (
        <View style={s.overlay}>
            <View style={[s.container, { 
                width: isLandscape ? '92%' : '92%', 
                maxWidth: isLandscape ? 800 : 420,
                height: isLandscape ? '90%' : '85%',
                maxHeight: isLandscape ? 420 : 600,
            }]}>
                <ScrollView 
                    style={s.scrollView}
                    contentContainerStyle={s.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Result Header — always full width */}
                    <View style={s.header}>
                        <Text style={[s.resultText, { color: result.color }]}>{result.text}</Text>

                        {wonByForfeit && (
                            <View style={s.forfeitNotice}>
                                <Text style={s.forfeitText}>
                                    {opponentName || 'Your opponent'} disconnected and did not return.
                                </Text>
                            </View>
                        )}
                        
                        {/* Score face-off */}
                        {hasAI ? (
                            <View style={s.scoreFaceoff}>
                                <View style={s.scoreBlock}>
                                    <Text style={s.scoreOwner}>👤 You</Text>
                                    <Text style={[s.scoreNum, { color: playerRating.color }]}>{score}</Text>
                                    <Text style={[s.scoreRating, { color: playerRating.color }]}>{playerRating.text}</Text>
                                </View>
                                <Text style={s.vs}>VS</Text>
                                <View style={s.scoreBlock}>
                                    <View style={s.aiLabel}>
                                        <Text style={s.scoreOwner}>{opponentName ? `👤 ${opponentName}` : '🤖 AI'}</Text>
                                        {difficulty && !opponentName && (
                                            <View style={[s.diffBadge, { backgroundColor: difficultyColors[difficulty] || '#888' }]}>
                                                <Text style={s.diffText}>{difficulty}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[s.scoreNum, { color: aiRating?.color || '#fff' }]}>{aiScore}</Text>
                                    <Text style={[s.scoreRating, { color: aiRating?.color || '#888' }]}>{aiRating?.text}</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={s.scoreSingle}>
                                <Text style={[s.scoreNum, { color: playerRating.color, fontSize: 52 }]}>{score}</Text>
                                <Text style={[s.scoreRating, { color: playerRating.color }]}>{playerRating.text}</Text>
                            </View>
                        )}
                    </View>

                    {/* Two-column body in landscape */}
                    <View style={[s.body, isLandscape && s.bodyLandscape]}>
                        {/* Left column: Score Breakdown */}
                        <View style={[s.section, isLandscape && s.sectionHalf]}>
                            <Text style={s.sectionTitle}>SCORE BREAKDOWN</Text>
                            
                            {/* Column headers */}
                            <View style={s.breakdownHeader}>
                                <Text style={[s.breakdownLabel, { color: '#556677' }]}></Text>
                                <Text style={s.colHeader}>You</Text>
                                <View style={s.barBg} />
                                {hasAI && (
                                    <>
                                        <View style={s.barBg} />
                                <Text style={s.colHeader}>{opponentName ? 'Opp' : 'AI'}</Text>
                                    </>
                                )}
                            </View>
                            
                            <BreakdownRow icon="🏠" label="Housing" player={scoreBreakdown.housing} ai={aiScoreBreakdown?.housing} />
                            <BreakdownRow icon="🍞" label="Food" player={scoreBreakdown.food} ai={aiScoreBreakdown?.food} />
                            <BreakdownRow icon="❤️" label="Welfare" player={scoreBreakdown.welfare} ai={aiScoreBreakdown?.welfare} />
                            <BreakdownRow icon="💰" label="GDP" player={scoreBreakdown.gdp} ai={aiScoreBreakdown?.gdp} />
                        </View>

                        {/* Right column: Stats + Inventory */}
                        <View style={[s.section, isLandscape && s.sectionHalf]}>
                            <Text style={s.sectionTitle}>YOUR NATION</Text>
                            
                            {/* Population & Gold */}
                            <View style={s.statsRow}>
                                <View style={s.statItem}>
                                    <Text style={s.statVal}>👥 {population.toLocaleString()}</Text>
                                    <Text style={s.statLabel}>Population</Text>
                                </View>
                                <View style={s.statItem}>
                                    <Text style={s.statVal}>💰 {gold}</Text>
                                    <Text style={s.statLabel}>Gold</Text>
                                </View>
                            </View>
                            
                            {/* Buildings + Boats compact grid */}
                            <View style={s.inventoryGrid}>
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
                                    <View key={i} style={s.inventoryItem}>
                                        <Text style={s.inventoryIcon}>{icon}</Text>
                                        <Text style={s.inventoryCount}>{count}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Buttons — always at bottom */}
                <View style={[s.buttons, isLandscape && s.buttonsLandscape]}>
                    <TouchableOpacity style={[s.btnPlay, isLandscape && s.btnLandscape]} onPress={handlePlayAgain}>
                        <Text style={s.btnPlayText}>↻ Play Again</Text>
                    </TouchableOpacity>
                    {onMainMenu && (
                        <TouchableOpacity style={[s.btnMenu, isLandscape && s.btnLandscape]} onPress={handleMainMenu}>
                            <Text style={s.btnMenuText}>🏠 Main Menu</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const s = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        backgroundColor: '#1a2a3a',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#2a4a5a',
        overflow: 'hidden',
    },
    scrollView: { flex: 1 },
    scrollContent: { padding: 14 },

    // Header
    header: {
        alignItems: 'center',
        marginBottom: 10,
    },
    resultText: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    forfeitNotice: {
        backgroundColor: 'rgba(74, 222, 128, 0.12)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4ade80',
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 8,
    },
    forfeitText: {
        fontSize: 12,
        color: '#a8e6c0',
        textAlign: 'center',
    },
    scoreFaceoff: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a1a2a',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
        gap: 16,
        width: '100%',
    },
    scoreBlock: { alignItems: 'center', flex: 1 },
    scoreOwner: { fontSize: 12, color: '#88a4b8' },
    aiLabel: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    diffBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
    diffText: { fontSize: 8, fontWeight: 'bold', color: '#000', textTransform: 'capitalize' },
    scoreNum: { fontSize: 36, fontWeight: 'bold' },
    scoreRating: { fontSize: 11, fontWeight: '600', marginTop: 1 },
    vs: { fontSize: 14, fontWeight: 'bold', color: '#556677' },
    scoreSingle: { alignItems: 'center', backgroundColor: '#0a1a2a', borderRadius: 10, padding: 10, width: '100%' },

    // Body
    body: {},
    bodyLandscape: { flexDirection: 'row', gap: 10 },

    // Sections
    section: {
        backgroundColor: '#0a1a2a',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
    },
    sectionHalf: { flex: 1, marginBottom: 0 },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '700',
        color: '#556677',
        letterSpacing: 1.2,
        marginBottom: 6,
    },

    // Breakdown
    breakdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
        gap: 4,
    },
    colHeader: { fontSize: 9, fontWeight: '600', color: '#556677', width: 22, textAlign: 'center' },
    breakdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 3,
        gap: 4,
    },
    breakdownLabel: { fontSize: 12, color: '#aab8c8', width: 72 },
    breakdownVal: { fontSize: 12, fontWeight: '600', color: '#ccc', width: 22, textAlign: 'center' },
    winVal: { color: '#4ade80', fontWeight: '700' },
    barBg: {
        flex: 1,
        height: 6,
        backgroundColor: '#1a2a3a',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: { height: '100%', borderRadius: 3 },

    // Stats
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    statItem: { alignItems: 'center' },
    statVal: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    statLabel: { fontSize: 9, color: '#667788', marginTop: 1 },

    // Inventory grid
    inventoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 6,
    },
    inventoryItem: {
        alignItems: 'center',
        backgroundColor: '#1a2a3a',
        borderRadius: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
        minWidth: 44,
    },
    inventoryIcon: { fontSize: 16 },
    inventoryCount: { fontSize: 12, fontWeight: 'bold', color: '#fff', marginTop: 1 },

    // Buttons
    buttons: {
        padding: 10,
        paddingTop: 6,
        gap: 6,
        borderTopWidth: 1,
        borderTopColor: '#2a4a5a',
    },
    buttonsLandscape: { flexDirection: 'row', gap: 10 },
    btnPlay: {
        backgroundColor: '#4ade80',
        paddingVertical: 11,
        borderRadius: 8,
        alignItems: 'center',
    },
    btnMenu: {
        backgroundColor: '#2a4a5a',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    btnLandscape: { flex: 1 },
    btnPlayText: { fontSize: 16, fontWeight: 'bold', color: '#0a1a0a' },
    btnMenuText: { fontSize: 14, fontWeight: '600', color: '#88a4b8' },
});

export default EndGameSummary;
