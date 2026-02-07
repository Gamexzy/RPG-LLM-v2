
import { GameState, SimulationResponse, NarrativeResponse, WorldUpdate, NPCBehaviorResponse, CharacterTemplate, GraphEdge } from "../types";
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
  if (narrativeResponse && currentState.userId) {
      
      // Calculate snapshot of inventory for logs
      let currentInventory = [...currentState.player.inventory];
      if (worldRes.inventoryUpdates?.added) {
        currentInventory.push(...worldRes.inventoryUpdates.added);
      }
      if (worldRes.inventoryUpdates?.removed) {
        currentInventory = currentInventory.filter(item => !worldRes.inventoryUpdates?.removed?.includes(item));
      }

      const payload: UnifiedIngestPayload = {
          userId: currentState.userId,
          universeId: currentState.universeId,
          turnId: currentState.history.length + 1,
          timestamp: currentState.world.time, 
          
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
             const lorePayload: UnifiedIngestPayload = {
                 ...payload,
                 vectorData: { ...payload.vectorData, text: event, type: 'lore' },
                 graphData: [] 
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

export const initializeGame = async (character: CharacterTemplate, setting: string, universeId: string, universeName: string, userId: string): Promise<SimulationResponse> => {
  // 1. Narrator creates initial state, pulling RAG context from the Universe ID
  const rawResponse = await initializeGameSession(character, setting, universeId, universeName, userId);

  // 2. Resolve any initial dialogues (though less likely in intro, it supports it)
  const mockState: GameState = {
    userId: userId,
    universeId: universeId,
    player: { 
        sourceId: character.id,
        name: character.name, 
        description: character.description, 
        inventory: [], 
        status: "", 
        location: "",
        stats: {
            strength: 10,
            agility: 10,
            intelligence: 10,
            spirit: 10,
            health: 100,
            maxHealth: 100
        }
    },
    world: { time: "", weather: "", activeEvents: [], npcs: rawResponse.npcSimulation || [] },
    knowledgeBase: { characters: [], locations: [], lore: [], quests: [] },
    summary: "",
    history: []
  };

  const finalNarrativeText = await resolveDialogueTags(rawResponse.narrative, mockState);

  // --- CRITICAL: FORCE INITIAL GRAPH POPULATION ---
  // A IA pode esquecer de gerar arestas para o próprio jogador na intro.
  // Injetamos manualmente para garantir que o nó do Player seja criado no Neo4j.
  const forcedGraphUpdates: GraphEdge[] = [
    {
        source: character.name,
        relation: "IS_A",
        target: character.archetype
    },
    {
        source: character.name,
        relation: "LOCATED_AT",
        target: rawResponse.worldUpdate.newLocation || "Start"
    },
    {
        source: character.name,
        relation: "EXISTS_IN",
        target: universeName
    }
  ];

  // Merge with AI generated updates
  const initialGraphData = [...forcedGraphUpdates, ...(rawResponse.graphUpdates || [])];

  // Ingest initial LORE if generated
  const payload: UnifiedIngestPayload = {
      userId: userId,
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
      graphData: initialGraphData
  };
  ingestUnifiedMemory(payload);

  return {
    ...rawResponse,
    narrative: finalNarrativeText
  };
};
