import { useState } from 'react';
import { GameState, ChatEntry } from '../types';
import { initializeGame, processTurn, summarizeMemory, investigateScene, debugSimulation } from '../services/geminiService';
import { mergeKnowledge } from '../utils/knowledgeUtils';

const MEMORY_THRESHOLD = 8;

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

      setGameState({
        player: {
          name: name,
          description: "Sobrevivente",
          inventory: ["Roupas do corpo"],
          status: sim.playerStatusUpdate,
          location: sim.playerLocation || "Desconhecido"
        },
        world: {
          time: sim.timeUpdate.newTime,
          weather: sim.worldEvents[0] || "Normal",
          activeEvents: sim.worldEvents,
          npcs: sim.npcSimulation || []
        },
        knowledgeBase: initialKB,
        summary: "Início da jornada.",
        history: [initialEntry]
      });
      setSetupMode(false);
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

    const userEntry: ChatEntry = { role: 'user', text: actionText, type: mode };
    setGameState(prev => prev ? ({ ...prev, history: [...prev.history, userEntry] }) : null);

    try {
      if (mode === 'debug') {
        const result = await debugSimulation(actionText, gameState);
        const modelEntry: ChatEntry = { role: 'system', text: result, type: 'debug' };
        setGameState(prev => prev ? ({ ...prev, history: [...prev.history, modelEntry] }) : null);
      } else if (mode === 'investigation') {
        const result = await investigateScene(actionText, gameState);
        const modelEntry: ChatEntry = { role: 'model', text: result, type: 'investigation' };
        setGameState(prev => prev ? ({ ...prev, history: [...prev.history, modelEntry] }) : null);
      } else {
        // Action Mode
        let currentState = { ...gameState, history: [...gameState.history, userEntry] };

        // PARALLEL TASK: Check if we need to summarize memory, but run it ALONGSIDE processTurn
        let summaryPromise = Promise.resolve(currentState.summary);
        
        if (currentState.history.filter(h => h.type !== 'debug').length > MEMORY_THRESHOLD) {
          // We trigger summarization based on current state, to be ready for the NEXT turn
          summaryPromise = summarizeMemory(currentState);
        }

        // Run Main Simulation and Summary update in parallel
        const [sim, newSummary] = await Promise.all([
          processTurn(actionText, currentState),
          summaryPromise
        ]);
        
        const modelEntry: ChatEntry = {
          role: 'model',
          text: sim.narrative,
          simulationData: sim,
          type: 'action'
        };

        setGameState(prev => {
          if (!prev) return null;
          
          const updatedKB = mergeKnowledge(prev.knowledgeBase, sim.knowledgeUpdate);

          return {
            ...prev,
            player: {
              ...prev.player,
              status: sim.playerStatusUpdate,
              location: sim.playerLocation || prev.player.location
            },
            world: {
              ...prev.world,
              time: sim.timeUpdate.newTime,
              activeEvents: sim.worldEvents,
              npcs: sim.npcSimulation || []
            },
            knowledgeBase: updatedKB,
            summary: newSummary, // Update with the newly generated summary (or keep old if no update)
            history: [...prev.history, modelEntry] 
          };
        });
      }
    } catch (error) {
      console.error("Turn processing failed:", error);
      const errorEntry: ChatEntry = { role: 'system', text: "Erro: Falha na sincronização dos agentes.", type: 'debug' };
      setGameState(prev => prev ? ({ ...prev, history: [...prev.history, errorEntry] }) : null);
    } finally {
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
    setupMode,
    startGame,
    performAction,
    resetGame,
    restoreGame
  };
};