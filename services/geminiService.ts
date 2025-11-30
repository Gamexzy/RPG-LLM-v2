
import { GameState, SimulationResponse, NarrativeResponse, WorldUpdate, NPCBehaviorResponse } from "../types";
import { synthesizeNarrative, initializeGameSession } from "./agents/narrator";
import { runNPCBehaviorEngine } from "./agents/npc";
import { runWorldSimulation } from "./agents/world";
import { investigateScene, summarizeMemory, debugSimulation } from "./agents/system";
import { resolveDialogueTags } from "./agents/dialogue";
import { ingestUnifiedMemory, UnifiedIngestPayload } from "./ragService";

// Re-export specific agent functions
export { investigateScene, summarizeMemory, debugSimulation };

// --- PHASE 1: NARRATIVE (Fast, User Facing) ---
export const generateStory = async (
  action: string, 
  currentState: GameState
): Promise<NarrativeResponse> => {
  // 1. Narrator generates story with placeholders [[DIALOGUE:...]]
  // Pass the Universe ID for RAG Context Retrieval
  const rawResponse = await synthesizeNarrative(action, currentState);

  // 2. Dialogue Agent resolves placeholders in parallel
  const finalNarrativeText = await resolveDialogueTags(rawResponse.narrative, currentState);

  // 3. RETURN immediately for UI rendering.
  // We process memory ingestion (Triple Store) AFTER this function returns 
  // (usually in the hook or explicitly called below if we want to block, 
  // but let's stick to the separation of concerns in the hook, OR utilize the data here).
  // Actually, for consistency, let's attach the raw graph data to the return 
  // so the main engine hook can send the unified payload once it has the WORLD update too.

  return {
    ...rawResponse,
    narrative: finalNarrativeText
  };
};

// --- PHASE 2: STATE SYNCHRONIZATION (Background) ---
export const synchronizeState = async (
  action: string,
  narrative: string,
  currentState: GameState,
  narrativeResponse?: NarrativeResponse // Passed to get graph data
): Promise<{ world: WorldUpdate, npcs: NPCBehaviorResponse }> => {
  
  // Parallel execution of state updaters
  const [worldRes, npcRes] = await Promise.all([
    runWorldSimulation(action, narrative, currentState),
    runNPCBehaviorEngine(currentState, action, narrative)
  ]);

  // --- TRIPLE STORE INGESTION ---
  // Now that we have the narrative AND the new physical state, we send the Unified Payload.
  if (narrativeResponse) {
      
      // Calculate snapshot of inventory for logs (to match UnifiedIngestPayload.sqlData.inventory type string[])
      let currentInventory = [...currentState.player.inventory];
      if (worldRes.inventoryUpdates?.added) {
        currentInventory.push(...worldRes.inventoryUpdates.added);
      }
      if (worldRes.inventoryUpdates?.removed) {
        currentInventory = currentInventory.filter(item => !worldRes.inventoryUpdates?.removed?.includes(item));
      }

      const payload: UnifiedIngestPayload = {
          universeId: currentState.universeId,
          turnId: currentState.history.length + 1,
          timestamp: currentState.world.time, // Uses old time, could use new time
          
          // 1. Vector (Chroma)
          vectorData: {
              text: `[ACTION]: ${action}\n[RESULT]: ${narrative}`,
              type: 'turn',
              location: worldRes.newLocation
          },
          
          // 2. SQL (Logs)
          sqlData: {
              playerStatus: worldRes.playerStatus,
              inventory: currentInventory,
              worldState: {
                  location: worldRes.newLocation,
                  time: worldRes.timePassed,
                  weather: worldRes.currentWeather
              }
          },

          // 3. Graph (Neo4j)
          graphData: narrativeResponse.graphUpdates || []
      };

      // Fire and forget
      ingestUnifiedMemory(payload);

      // Handle specific Lore Canonical Events
      if (narrativeResponse.canonicalEvents && narrativeResponse.canonicalEvents.length > 0) {
          narrativeResponse.canonicalEvents.forEach(event => {
             // We reuse the unified ingest or a specific one? 
             // Ideally the backend handles 'type: lore' inside the unified payload, 
             // but let's send a specific lore packet for safety or append to vectorData logic.
             // For now, let's rely on the user adding logic on backend or sending a second packet.
             const lorePayload: UnifiedIngestPayload = {
                 ...payload,
                 vectorData: { ...payload.vectorData, text: event, type: 'lore' },
                 graphData: [] // Don't duplicate graph edges
             };
             ingestUnifiedMemory(lorePayload);
          });
      }
  }

  return {
    world: worldRes,
    npcs: npcRes
  };
};

export const initializeGame = async (characterName: string, setting: string, universeId: string, universeName: string): Promise<SimulationResponse> => {
  // 1. Narrator creates initial state, pulling RAG context from the Universe ID
  const rawResponse = await initializeGameSession(characterName, setting, universeId, universeName);

  // 2. Resolve any initial dialogues (though less likely in intro, it supports it)
  const mockState: GameState = {
    universeId: universeId,
    player: { name: characterName, description: "", inventory: [], status: "", location: "" },
    world: { time: "", weather: "", activeEvents: [], npcs: rawResponse.npcSimulation || [] },
    knowledgeBase: { characters: [], locations: [], lore: [], quests: [] },
    summary: "",
    history: []
  };

  const finalNarrativeText = await resolveDialogueTags(rawResponse.narrative, mockState);

  // Ingest initial LORE if generated
  const payload: UnifiedIngestPayload = {
      universeId: universeId,
      turnId: 0,
      timestamp: rawResponse.initialTime || "Start",
      vectorData: {
          text: finalNarrativeText,
          type: 'intro',
          location: "Start"
      },
      sqlData: {
          playerStatus: "Healthy",
          inventory: [],
          worldState: {}
      },
      graphData: rawResponse.graphUpdates || []
  };
  ingestUnifiedMemory(payload);

  return {
    ...rawResponse,
    narrative: finalNarrativeText
  };
};
