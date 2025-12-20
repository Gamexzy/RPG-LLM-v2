
import { useState } from 'react';
import { GameState, ChatEntry, PlayerStats, CharacterTemplate } from '../types';
import { initializeGame, generateStory, synchronizeState, summarizeMemory, investigateScene, debugSimulation } from '../services/geminiService';
import { mergeKnowledge } from '../utils/knowledgeUtils';

const MEMORY_THRESHOLD = 8;

const DEFAULT_STATS: PlayerStats = {
  strength: 10,
  agility: 10,
  intelligence: 10,
  spirit: 10,
  health: 100,
  maxHealth: 100
};

// Update signature to accept the evolver function
export const useGameEngine = (evolveUniverse?: (id: string, updates: any) => void) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncingState, setIsSyncingState] = useState(false);

  const startGame = async (character: CharacterTemplate, setting: string, universeId: string, universeName: string, userId: string) => {
    setIsProcessing(true);
    try {
      const sim = await initializeGame(character, setting, universeId, universeName, userId);
      
      const initialEntry: ChatEntry = {
        role: 'model',
        text: sim.narrative,
        simulationData: sim,
        type: 'action'
      };

      const initialKB = mergeKnowledge({
        characters: [],
        locations: [],
        lore: [],
        quests: []
      }, sim.knowledgeUpdate);

      setGameState({
        userId: userId,
        universeId: universeId,
        player: {
          sourceId: character.id, // THE LINK TO IDENTITY
          name: character.name,
          description: character.description, // Initial state description matches template
          inventory: sim.worldUpdate?.inventoryUpdates?.added || [],
          status: sim.worldUpdate?.playerStatus || "Saudável",
          location: sim.worldUpdate?.newLocation || "Desconhecido",
          stats: { ...DEFAULT_STATS }
        },
        world: {
          time: sim.initialTime || "Início do Ciclo",
          weather: sim.worldUpdate?.currentWeather || "Estável",
          activeEvents: sim.worldUpdate?.worldEvents || [],
          npcs: sim.npcSimulation || []
        },
        knowledgeBase: initialKB,
        summary: "Início da jornada.",
        history: [initialEntry]
      });
    } catch (error) {
      console.error(error);
      alert("Falha na conexão neural.");
    } finally {
      setIsProcessing(false);
    }
  };

  const performAction = async (actionText: string, mode: 'action' | 'investigation' | 'debug') => {
    if (!gameState) return;
    setIsProcessing(true);

    const userEntry: ChatEntry = { role: 'user', text: actionText, type: mode };
    setGameState(prev => prev ? ({ ...prev, history: [...prev.history, userEntry] }) : null);

    try {
      if (mode === 'debug') {
        const result = await debugSimulation(actionText, gameState);
        setGameState(prev => prev ? ({ ...prev, history: [...prev.history, { role: 'system', text: result, type: 'debug' }] }) : null);
        setIsProcessing(false);
      } else if (mode === 'investigation') {
        const result = await investigateScene(actionText, gameState);
        setGameState(prev => prev ? ({ ...prev, history: [...prev.history, { role: 'model', text: result, type: 'investigation' }] }) : null);
        setIsProcessing(false);
      } else {
        const currentState = { ...gameState, history: [...gameState.history, userEntry] };
        
        if (currentState.history.length > MEMORY_THRESHOLD) {
           summarizeMemory(currentState).then(s => setGameState(prev => prev ? ({...prev, summary: s}) : null));
        }

        const narrativeRes = await generateStory(actionText, currentState);
        const modelEntry: ChatEntry = { role: 'model', text: narrativeRes.narrative, type: 'action' };

        // --- UNIVERSE EVOLUTION CHECK ---
        if (evolveUniverse && ((narrativeRes.canonicalEvents && narrativeRes.canonicalEvents.length > 0) || (narrativeRes.discoveredTruths && narrativeRes.discoveredTruths.length > 0))) {
            console.log("Updating Universe Canon...", narrativeRes.canonicalEvents, narrativeRes.discoveredTruths);
            evolveUniverse(currentState.universeId, {
                newEvents: narrativeRes.canonicalEvents,
                newTruths: narrativeRes.discoveredTruths
            });
        }
        // --------------------------------

        setGameState(prev => {
          if (!prev) return null;
          return {
            ...prev,
            knowledgeBase: mergeKnowledge(prev.knowledgeBase, narrativeRes.knowledgeUpdate),
            history: [...prev.history, modelEntry]
          };
        });

        setIsProcessing(false);
        setIsSyncingState(true);

        try {
            const { world, npcs } = await synchronizeState(actionText, narrativeRes.narrative, currentState, narrativeRes);
            
            setGameState(prev => {
                if (!prev) return null;
                
                // Inventory
                let newInv = [...prev.player.inventory];
                if (world.inventoryUpdates?.added) newInv.push(...world.inventoryUpdates.added);
                if (world.inventoryUpdates?.removed) newInv = newInv.filter(i => !world.inventoryUpdates.removed?.includes(i));

                // Stats Update
                const newStats = { ...prev.player.stats };
                if (world.statChanges) {
                  Object.entries(world.statChanges).forEach(([key, val]) => {
                    const k = key as keyof PlayerStats;
                    if (typeof val === 'number') {
                      newStats[k] = Math.max(0, Math.min(newStats[k] + val, k === 'health' ? newStats.maxHealth : 99));
                    }
                  });
                }

                return {
                    ...prev,
                    player: { ...prev.player, status: world.playerStatus, location: world.newLocation, inventory: newInv, stats: newStats },
                    world: { ...prev.world, time: calculateNewTime(prev.world.time, world.timePassed), weather: world.currentWeather, activeEvents: world.worldEvents, npcs: npcs.npcs || prev.world.npcs }
                };
            });
        } finally {
            setIsSyncingState(false);
        }
      }
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  const resetGame = () => { 
    setGameState(null); 
  };
  
  const restoreGame = (s: GameState) => setGameState(s);

  return { gameState, isProcessing, isSyncingState, startGame, performAction, resetGame, restoreGame };
};

function calculateNewTime(currentTime: string, timePassed: string): string {
    if (!currentTime || !timePassed) return currentTime;
    let minutesToAdd = 0;
    const match = timePassed.match(/(\d+)\s*(min|h|d)/i);
    if (match) {
        const val = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        minutesToAdd = unit.startsWith('h') ? val * 60 : unit.startsWith('d') ? val * 1440 : val;
    }
    if (currentTime.includes("Ciclo") || currentTime.includes("Era")) return currentTime; 

    try {
        const [dPart, tPart] = currentTime.split(' ');
        if (!dPart || !tPart) return currentTime;
        const [d, m, y] = dPart.split('/').map(Number);
        const [h, min] = tPart.split(':').map(Number);
        const date = new Date(y, m - 1, d, h, min + minutesToAdd);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch(e) {
        return currentTime;
    }
}
