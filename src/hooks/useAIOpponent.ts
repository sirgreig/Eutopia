// src/hooks/useAIOpponent.ts
// Hook to manage AI opponent state and decisions during gameplay

import { useState, useCallback, useRef, useEffect } from 'react';
import { Island, Position, BuildingType, BoatType, GameMode } from '../types';
import { BUILDINGS, BOAT_COSTS, BALANCE, REBEL_SPAWN_COST } from '../constants/game';
import { generateIsland } from '../services/islandGenerator';
import { inflictRebel } from '../services/rebels';
import {
  AIState,
  AIDifficulty,
  AI_DIFFICULTIES,
  makeAIDecision,
  calculateAIRoundEnd,
  initializeAIState,
  findAdjacentWater,
} from '../services/aiOpponent';

interface UseAIOpponentProps {
  difficulty: 'easy' | 'normal' | 'hard';
  mode: GameMode;
  isRoundActive: boolean;
  round: number;
  maxRounds: number;
  playerIsland: Island | null;
  enabled: boolean;
  /**
   * Called when the AI decides to sabotage the player. App applies the rebel to
   * the player's island — the hook has no business mutating it directly.
   */
  onAISabotage?: () => void;
}

interface UseAIOpponentReturn {
  aiState: AIState | null;
  aiIsland: Island | null;
  aiGold: number;
  aiPopulation: number;
  aiScore: number;
  aiScoreBreakdown: { housing: number; food: number; welfare: number; gdp: number };
  initializeAI: () => void;
  processAIRoundEnd: () => void;
  lastAIAction: string | null;
  /**
   * Inflict a rebel on the AI's island (the player sabotaging the AI).
   * Returns false when the AI has no unprotected tile — caller should refund.
   */
  sabotageAI: () => boolean;
}

export function useAIOpponent({
  difficulty,
  mode,
  isRoundActive,
  round,
  maxRounds,
  playerIsland,
  enabled,
  onAISabotage,
}: UseAIOpponentProps): UseAIOpponentReturn {
  const [aiState, setAIState] = useState<AIState | null>(null);
  const [lastAIAction, setLastAIAction] = useState<string | null>(null);
  
  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);
  const difficultySettings = AI_DIFFICULTIES[difficulty];
  
  // Initialize AI with a new island
  const initializeAI = useCallback(() => {
    if (!enabled) return;
    
    const aiIsland = generateIsland();
    const initialState = initializeAIState(aiIsland);
    setAIState(initialState);
    setLastAIAction(null);
  }, [enabled]);
  
  // Process AI decision
  const processAIDecision = useCallback(() => {
    if (!aiState || !playerIsland || !enabled) return;
    
    const decision = makeAIDecision(
      aiState,
      playerIsland,
      mode,
      round,
      maxRounds,
      difficultySettings
    );
    
    if (decision.action === 'none') {
      return;
    }
    
    let newState = { ...aiState };
    let actionDescription = '';
    
    if (decision.action === 'build' && decision.buildingType && decision.position) {
      const building = BUILDINGS.find(b => b.type === decision.buildingType);
      if (building && newState.gold >= building.cost) {
        // Place building
        const updatedTiles = newState.island.tiles.map(tile => {
          if (tile.position.x === decision.position!.x && 
              tile.position.y === decision.position!.y) {
            return { ...tile, building: decision.buildingType };
          }
          return tile;
        });
        
        newState = {
          ...newState,
          island: { ...newState.island, tiles: updatedTiles },
          gold: newState.gold - building.cost,
        };
        
        actionDescription = `Built ${building.name}`;
      }
    } else if (decision.action === 'boat' && decision.boatType && decision.position) {
      const cost = BOAT_COSTS[decision.boatType];
      if (newState.gold >= cost) {
        // Spawn boat
        const newBoat = {
          id: `ai-boat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: decision.boatType,
          position: decision.position,
          owner: 'ai' as const,
          isMoving: false,
          destination: null,
        };
        
        newState = {
          ...newState,
          island: { 
            ...newState.island, 
            boats: [...newState.island.boats, newBoat] 
          },
          gold: newState.gold - cost,
        };
        
        actionDescription = `Launched ${decision.boatType === 'fishing' ? 'fishing boat' : 'PT boat'}`;
      }
    } else if (decision.action === 'move_pt' && decision.boatId && decision.destination) {
      // Move PT boat (simplified - just update position instantly for now)
      const updatedBoats = newState.island.boats.map(boat => {
        if (boat.id === decision.boatId) {
          return { ...boat, position: decision.destination!, isMoving: false };
        }
        return boat;
      });
      
      newState = {
        ...newState,
        island: { ...newState.island, boats: updatedBoats },
      };
      
      actionDescription = 'PT boat moving';
    }
    
    if (actionDescription) {
      setLastAIAction(actionDescription);
      setAIState(newState);
    }
  }, [aiState, playerIsland, mode, round, maxRounds, difficultySettings, enabled]);
  
  // Process AI round end (calculate income, population, score)
  const processAIRoundEnd = useCallback(() => {
    if (!aiState || !enabled) return;
    
    const newState = calculateAIRoundEnd(aiState, difficultySettings);
    setAIState(newState);
  }, [aiState, difficultySettings, enabled]);

  // ============================================
  // SABOTAGE (Phase 9)
  // ============================================

  /** Player sabotages the AI. Returns false when the AI has no valid target. */
  const sabotageAI = useCallback((): boolean => {
    if (!aiState || !enabled) return false;
    const result = inflictRebel(aiState.island);
    if (!result) return false;
    setAIState((prev) => (prev ? { ...prev, island: result.island } : prev));
    setLastAIAction('Rebels uprising!');
    return true;
  }, [aiState, enabled]);

  // AI decides whether to sabotage the player. Deliberately handled here rather
  // than in makeAIDecision(): sabotage is a cross-player action, and the decision
  // service only reasons about the AI's own board.
  //
  // Once per round at most, gated on difficulty and on the AI actually being able
  // to afford it. Harder AI sabotages more readily and starts earlier.
  const aiSabotageRoundRef = useRef<number>(-1);
  useEffect(() => {
    if (!enabled || !isRoundActive || !aiState || !onAISabotage) return;
    if (aiSabotageRoundRef.current === round) return; // already tried this round

    const minRound = difficulty === 'hard' ? 2 : difficulty === 'normal' ? 4 : 6;
    if (round < minRound) return;

    const chance = difficulty === 'hard' ? 0.5 : difficulty === 'normal' ? 0.3 : 0.12;

    // Decide part-way through the round so it doesn't always land at the same moment
    const delay = 4000 + Math.random() * 8000;
    const timer = setTimeout(() => {
      aiSabotageRoundRef.current = round;
      if (Math.random() > chance) return;
      if ((aiState.gold ?? 0) < REBEL_SPAWN_COST) return;

      setAIState((prev) =>
        prev ? { ...prev, gold: prev.gold - REBEL_SPAWN_COST } : prev
      );
      setLastAIAction('Sent rebels!');
      onAISabotage();
    }, delay);

    return () => clearTimeout(timer);
  }, [enabled, isRoundActive, round, difficulty, aiState, onAISabotage]);
  
  // Run AI decision loop during active rounds
  useEffect(() => {
    if (!isRoundActive || !enabled || !aiState) {
      if (aiTimerRef.current) {
        clearInterval(aiTimerRef.current);
        aiTimerRef.current = null;
      }
      return;
    }
    
    // Start AI decision loop
    aiTimerRef.current = setInterval(() => {
      processAIDecision();
    }, difficultySettings.decisionDelay);
    
    return () => {
      if (aiTimerRef.current) {
        clearInterval(aiTimerRef.current);
        aiTimerRef.current = null;
      }
    };
  }, [isRoundActive, enabled, aiState, processAIDecision, difficultySettings.decisionDelay]);
  
  return {
    aiState,
    aiIsland: aiState?.island || null,
    aiGold: aiState?.gold || 0,
    aiPopulation: aiState?.population || 0,
    aiScore: aiState?.score || 50,
    aiScoreBreakdown: aiState?.scoreBreakdown || { housing: 0, food: 0, welfare: 0, gdp: 0 },
    initializeAI,
    processAIRoundEnd,
    lastAIAction,
    sabotageAI,
  };
}

export default useAIOpponent;
