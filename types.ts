// --- Game State Types ---

export interface KnowledgeEntry {
  id: string; // Name or unique identifier
  type: 'character' | 'location' | 'lore';
  description: string;
  status?: string; // e.g., "Ally", "Enemy", "Visited", "Unknown"
}

export interface QuestEntry {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
}

export interface NPCEntity {
  id: string; // Unique ID (Internal)
  name: string; // Real Name (e.g. "Tanaka")
  descriptor: string; // Visual description (e.g. "Guarda Corpulento")
  isNameKnown: boolean; // Has the player learned the name?
  location: string;
  action: string; // Visible action
  lastThought: string; // Internal monologue
  status: string; // Physical status
}

export interface GameState {
  player: {
    name: string;
    description: string;
    inventory: string[];
    status: string; // e.g., "Hungry", "Injured", "Healthy"
    location: string;
  };
  world: {
    time: string; // e.g., "24/10/2123 14:30"
    weather: string;
    activeEvents: string[]; // Global events happening
    npcs: NPCEntity[];
  };
  // Structured Database of the world
  knowledgeBase: {
    characters: KnowledgeEntry[];
    locations: KnowledgeEntry[];
    lore: KnowledgeEntry[];
    quests: QuestEntry[];
  };
  // The persistent memory of the game, compressed by AI
  summary: string; 
  // The raw chat history for the immediate context
  history: ChatEntry[];
}

export interface ChatEntry {
  role: 'user' | 'model' | 'system';
  text: string;
  // Optional: metadata about what the simulation did this turn
  simulationData?: SimulationResponse; 
  // Distinguish between standard actions, observation queries and debug
  type?: 'action' | 'investigation' | 'debug';
}

// --- AI Response Types ---

// Response from the Narrator Agent
export interface NarrativeResponse {
  narrative: string;
  playerStatusUpdate: string;
  playerLocation: string;
  timeUpdate: {
    newTime: string;
  };
  worldEvents: string[];
  knowledgeUpdate?: {
    characters?: KnowledgeEntry[];
    locations?: KnowledgeEntry[];
    lore?: KnowledgeEntry[];
    quests?: QuestEntry[];
  };
}

// Response from the NPC Psyche Agent
export interface NPCBehaviorResponse {
  npcs: NPCEntity[];
}

// Unified response for the frontend
export interface SimulationResponse extends NarrativeResponse {
  npcSimulation: NPCEntity[];
}
