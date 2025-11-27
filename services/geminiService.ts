
import { GameState, SimulationResponse, NarrativeResponse, WorldUpdate, NPCBehaviorResponse } from "../types";
import { synthesizeNarrative, initializeGameSession } from "./agents/narrator";
import { runNPCBehaviorEngine } from "./agents/npc";
import { runWorldSimulation } from "./agents/world";
import { investigateScene, summarizeMemory, debugSimulation } from "./agents/system";

// Re-export specific agent functions
export { investigateScene, summarizeMemory, debugSimulation };

// --- PHASE 1: NARRATIVE (Fast, User Facing) ---
export const generateStory = async (
  action: string, 
  currentState: GameState
): Promise<NarrativeResponse> => {
  return await synthesizeNarrative(action, currentState);
};

// --- PHASE 2: STATE SYNCHRONIZATION (Background) ---
export const synchronizeState = async (
  action: string,
  narrative: string,
  currentState: GameState
): Promise<{ world: WorldUpdate, npcs: NPCBehaviorResponse }> => {
  
  // Parallel execution of state updaters
  const [worldRes, npcRes] = await Promise.all([
    runWorldSimulation(action, narrative, currentState),
    runNPCBehaviorEngine(currentState, action, narrative)
  ]);

  return {
    world: worldRes,
    npcs: npcRes
  };
};

export const initializeGame = async (characterName: string, setting: string): Promise<SimulationResponse> => {
  return await initializeGameSession(characterName, setting);
};
