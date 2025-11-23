import { GameState, SimulationResponse } from "../types";
import { resolveNarrative, initializeGameSession } from "./agents/narrator";
import { runNPCBehaviorEngine } from "./agents/npc";
import { investigateScene, summarizeMemory, debugSimulation } from "./agents/system";

// Re-export specific agent functions for the Orchestrator to use or direct consumption
export { investigateScene, summarizeMemory, debugSimulation };

// --- Main Orchestrator ---
export const processTurn = async (
  action: string, 
  currentState: GameState
): Promise<SimulationResponse> => {
  
  // PARALLEL EXECUTION:
  // We fire both the Narrator (World/Physics) and the NPC Engine (Behavior) at the same time.
  // This significantly reduces latency.
  const [narrativeRes, npcRes] = await Promise.all([
    resolveNarrative(action, currentState),
    runNPCBehaviorEngine(currentState, action)
  ]);

  // Merge Results
  // Note: NPC Engine runs on 'previous' state + action, so it might slightly lag on 
  // location changes (e.g. if player leaves room, NPC might still think they are there for 1 turn).
  // This is acceptable for the performance gain and often simulates "reaction time".
  return {
    ...narrativeRes,
    npcSimulation: npcRes.npcs
  };
};

export const initializeGame = async (characterName: string, setting: string): Promise<SimulationResponse> => {
  return await initializeGameSession(characterName, setting);
};