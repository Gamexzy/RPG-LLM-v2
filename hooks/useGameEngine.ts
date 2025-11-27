
import { useState } from 'react';
import { GameState, ChatEntry, NPCEntity } from '../types';
import { initializeGame, generateStory, synchronizeState, summarizeMemory, investigateScene, debugSimulation } from '../services/geminiService';
import { mergeKnowledge } from '../utils/knowledgeUtils';
import { ingestMemory } from '../services/ragService';

const MEMORY_THRESHOLD = 8;

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncingState, setIsSyncingState] = useState(false); // New state for background work
  const [setupMode, setSetupMode] = useState(true);

  const startGame = async (name: string, setting: string) => {
    setIsProcessing(true);
    try {
      const sim = await initializeGame(name, setting);
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

      const startClock = sim.initialTime || "01/01/2042 08:00";

      setGameState({
        player: {
          name: name,
          description: "Sobrevivente",
          inventory: sim.worldUpdate?.inventoryUpdates?.added || ["Roupas do corpo"],
          status: sim.worldUpdate?.playerStatus || "Saudável",
          location: sim.worldUpdate?.newLocation || "Desconhecido"
        },
        world: {
          time: startClock,
          weather: sim.worldUpdate?.currentWeather || "Normal",
          activeEvents: sim.worldUpdate?.worldEvents || [],
          npcs: sim.npcSimulation || []
        },
        knowledgeBase: initialKB,
        summary: "Início da jornada.",
        history: [initialEntry]
      });
      setSetupMode(false);
      
      // Index initial story to RAG
      ingestMemory(sim.narrative, { turn: 0, location: "START", type: "intro" });

    } catch (error) {
      console.error("Failed to start game:", error);
      alert("Erro ao iniciar a simulação. Verifique sua conexão.");
    } finally {
      setIsProcessing(false);
    }
  };

  const performAction = async (actionText: string, mode: 'action' | 'investigation' | 'debug') => {
    if (!gameState) return;
    setIsProcessing(true);

    // 1. Add User Entry immediately
    const userEntry: ChatEntry = { role: 'user', text: actionText, type: mode };
    setGameState(prev => prev ? ({ ...prev, history: [...prev.history, userEntry] }) : null);

    try {
      if (mode === 'debug') {
        const result = await debugSimulation(actionText, gameState);
        const modelEntry: ChatEntry = { role: 'system', text: result, type: 'debug' };
        setGameState(prev => prev ? ({ ...prev, history: [...prev.history, modelEntry] }) : null);
        setIsProcessing(false);
      } else if (mode === 'investigation') {
        const result = await investigateScene(actionText, gameState);
        const modelEntry: ChatEntry = { role: 'model', text: result, type: 'investigation' };
        setGameState(prev => prev ? ({ ...prev, history: [...prev.history, modelEntry] }) : null);
        setIsProcessing(false);
      } else {
        // --- PHASE 1: GENERATE NARRATIVE (PRIORITY) ---
        // Generates the story first so the user is not waiting for physics calculations.
        
        // Prepare context
        let currentState = { ...gameState, history: [...gameState.history, userEntry] };
        
        // Check for summarization in background? 
        // We'll do it as part of the flow to keep context small, but narrative comes first.
        if (currentState.history.filter(h => h.type !== 'debug').length > MEMORY_THRESHOLD) {
           summarizeMemory(currentState).then(s => {
               setGameState(prev => prev ? ({...prev, summary: s}) : null);
           });
        }

        const narrativeRes = await generateStory(actionText, currentState);
        
        const modelEntry: ChatEntry = {
          role: 'model',
          text: narrativeRes.narrative,
          type: 'action'
        };

        // Update UI with text IMMEDIATELY
        setGameState(prev => {
          if (!prev) return null;
          const updatedKB = mergeKnowledge(prev.knowledgeBase, narrativeRes.knowledgeUpdate);
          return {
            ...prev,
            knowledgeBase: updatedKB,
            history: [...prev.history, modelEntry]
          };
        });

        // Unlock UI for reading, start background sync
        setIsProcessing(false);
        setIsSyncingState(true);

        // --- PHASE 2: SYNCHRONIZE STATE & RAG (BACKGROUND) ---
        
        // A. Send to Python RAG Server (Fire and Forget)
        ingestMemory(`[Action]: ${actionText}\n[Result]: ${narrativeRes.narrative}`, { 
            turn: currentState.history.length, 
            location: currentState.player.location,
            type: "turn"
        });

        // B. Updates Inventory, Time, NPCs based on the story just generated.
        try {
            const { world, npcs } = await synchronizeState(actionText, narrativeRes.narrative, currentState);
            
            setGameState(prev => {
                if (!prev) return null;

                // Handle Inventory Updates
                let newInventory = [...prev.player.inventory];
                if (world.inventoryUpdates?.added) {
                  newInventory.push(...world.inventoryUpdates.added);
                }
                if (world.inventoryUpdates?.removed) {
                  newInventory = newInventory.filter(item => !world.inventoryUpdates?.removed?.includes(item));
                }

                // Handle Time Calculation
                const newTimeStr = calculateNewTime(prev.world.time, world.timePassed);

                // Handle NPCs Merge
                const updatedNPCs = npcs.npcs || prev.world.npcs;

                return {
                    ...prev,
                    player: {
                        ...prev.player,
                        status: world.playerStatus,
                        location: world.newLocation,
                        inventory: newInventory
                    },
                    world: {
                        ...prev.world,
                        time: newTimeStr,
                        weather: world.currentWeather,
                        activeEvents: world.worldEvents,
                        npcs: updatedNPCs
                    }
                };
            });
        } catch (bgError) {
            console.error("Background State Sync Failed", bgError);
        } finally {
            setIsSyncingState(false);
        }
      }
    } catch (error) {
      console.error("Main Turn processing failed:", error);
      const errorEntry: ChatEntry = { role: 'system', text: "Erro: Falha no núcleo narrativo.", type: 'debug' };
      setGameState(prev => prev ? ({ ...prev, history: [...prev.history, errorEntry] }) : null);
      setIsProcessing(false);
    }
  };

  const resetGame = () => {
    if (window.confirm("Deseja reiniciar a simulação?")) {
      setGameState(null);
      setSetupMode(true);
    }
  };

  const restoreGame = (savedState: GameState) => {
    setGameState(savedState);
    setSetupMode(false);
  };

  return {
    gameState,
    isProcessing,
    isSyncingState,
    setupMode,
    startGame,
    performAction,
    resetGame,
    restoreGame
  };
};

/**
 * Calculates new time by adding duration to current time.
 * Handles format: "DD/MM/YYYY HH:mm".
 */
function calculateNewTime(currentTime: string, timePassed: string): string {
    if (!timePassed || timePassed === "0 min" || timePassed === "0") return currentTime;

    // 1. Parse Duration (Logic adapted to handle various AI outputs)
    let minutesToAdd = 0;
    const durationRegex = /(\d+)\s*(min|m|h|hora|hour|seg|s|dias|day)/i;
    const match = timePassed.match(durationRegex);
    
    if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        if (unit.startsWith('h')) {
            minutesToAdd = value * 60;
        } else if (unit.startsWith('d')) {
            minutesToAdd = value * 24 * 60;
        } else {
            minutesToAdd = value; // Default to minutes
        }
    } else {
        // Fallback for simple integers (assume minutes)
        const parsedInt = parseInt(timePassed);
        if (!isNaN(parsedInt)) minutesToAdd = parsedInt;
    }

    // 2. Parse Current Date
    const [datePart, timePart] = currentTime.split(' ');
    let dateObj: Date;

    if (datePart && timePart) {
        const [d, m, y] = datePart.split('/').map(Number);
        const [h, min] = timePart.split(':').map(Number);
        
        if (!isNaN(d) && !isNaN(m) && !isNaN(y) && !isNaN(h) && !isNaN(min)) {
             dateObj = new Date(y, m - 1, d, h, min);
        } else {
             dateObj = new Date(); 
        }
    } else {
         dateObj = new Date();
    }

    // 3. Add Time
    dateObj.setMinutes(dateObj.getMinutes() + minutesToAdd);

    // 4. Format Output (Strict DD/MM/YYYY HH:mm)
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dd = pad(dateObj.getDate());
    const mo = pad(dateObj.getMonth() + 1);
    const yyyy = dateObj.getFullYear();
    const hh = pad(dateObj.getHours());
    const mm = pad(dateObj.getMinutes());

    return `${dd}/${mo}/${yyyy} ${hh}:${mm}`;
}
