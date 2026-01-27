// src/hooks/useAIOpponent.ts
// Hook to manage AI opponent state and decisions during gameplay

import { useState, useCallback, useRef, useEffect } from 'react';
import { Island, Position, BuildingType, BoatType, GameMode } from '../types';
import { BUILDINGS, BOAT_COSTS, BALANCE } from '../constants/game';
import { generateIsland } from '../services/islandGenerator';
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
}

export function useAIOpponent({
  difficulty,
  mode,
  isRoundActive,
  round,
  maxRounds,
  playerIsland,
  enabled,
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
  };
}

export default useAIOpponent;
