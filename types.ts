
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

// NEW: Structure for Neo4j Relationships
export interface GraphEdge {
  subject: string;   // e.g., "Kael"
  relation: string;  // e.g., "MET", "ATTACKED", "IS_INSIDE", "OWNS"
  object: string;    // e.g., "Tavern", "Iron Sword"
  properties?: Record<string, any>; // Optional metadata
}

export interface GameState {
  // META DATA
  universeId: string; // Links this save to a persistent universe database

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

// --- LIBRARY TYPES (HUB) ---

export interface UniverseTemplate {
  id: string;
  name: string;
  description: string;
  genre: string;
  createdAt: number;
}

export interface CharacterTemplate {
  id: string;
  name: string;
  description: string; // Backstory or physical description
  archetype: string;
  createdAt: number;
}

// --- AI Response Types ---

// 1. World Agent Response (Pure Logic)
export interface WorldUpdate {
  actionResult: string; // Logic description: "Player successfully picked lock"
  playerStatus: string; // "Tired but unhurt"
  newLocation: string; // "Kitchen"
  timePassed: string; // "15 minutes"
  currentWeather: string; // "Heavy Rain"
  worldEvents: string[]; // ["Alarm sounding in distance"]
  inventoryUpdates: {
    added?: string[];
    removed?: string[];
  };
}

// 2. NPC Agent Response (Pure Behavior)
export interface NPCBehaviorResponse {
  npcs: NPCEntity[];
}

// 3. Narrator Agent Response (Pure Text & Knowledge)
export interface NarrativeResponse {
  narrative: string; // The final prose
  
  // Persistent Universe Memory (ChromaDB/Lore)
  canonicalEvents?: string[]; 

  // Knowledge Graph Updates (Neo4j)
  graphUpdates?: GraphEdge[];

  knowledgeUpdate?: {
    characters?: KnowledgeEntry[];
    locations?: KnowledgeEntry[];
    lore?: KnowledgeEntry[];
    quests?: QuestEntry[];
  };
}

// Unified response for the frontend
export interface SimulationResponse extends NarrativeResponse {
  // We include the raw data from the World Agent so the UI handles updates
  // while the Narrator handles the text.
  worldUpdate: WorldUpdate;
  npcSimulation: NPCEntity[];
  initialTime?: string; // Date string for initialization (DD/MM/YYYY HH:MM)
}