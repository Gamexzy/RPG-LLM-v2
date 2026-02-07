
// [2025-08-02] Tipos atualizados para refletir a separação entre Template e Instância

// --- Core Entities (Library) ---

export interface UniverseTemplate {
  id: string;
  userId: string;
  name: string;
  description: string;
  genre: string;
  image?: string;
  createdAt?: string | number;

  // Extended properties for GenAI Engine & Game Logic
  structure?: UniverseStructure;
  navigationMethod?: NavigationMethod;
  physics?: string[];
  magicSystem?: string;
  cosmology?: string;
  knownTruths?: string[];
  chronicles?: TimelineEvent[];
  champions?: ChampionRecord[];
  worlds?: WorldEntry[];
}

export interface CharacterTemplate {
  id: string;
  userId: string;
  name: string;
  description: string;
  archetype: string;
  image?: string;
  stats?: Record<string, any>; // Flexible stats object
  createdAt?: string | number;
  
  // Extended
  adventuresPlayed?: number;
}

export interface AdventureRecord {
  id: string;
  userId: string;
  universeId: string; // O Palco
  characterId: string; // O Ator
  name: string; // Display Name for the Save
  description?: string;
  currentStep?: string;
  createdAt?: string | number;

  // Legacy/Computed fields for UI display without joining
  characterName?: string;
  universeName?: string;
  universeGenre?: string;
  startDate?: number;
  lastLocation?: string;
}

export interface UserLibrary {
  universes: UniverseTemplate[];
  characters: CharacterTemplate[];
  adventures: AdventureRecord[];
}

export interface GraphEdge {
  source: string;   // Renamed from 'subject'
  target: string;   // Renamed from 'object'
  relation: string;
  properties?: Record<string, any>;
}

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'model'; 
  content?: string; // Standard content field
  text: string;     // Compatibility alias (Primary used in UI currently)
  timestamp?: string;
  type?: 'text' | 'action' | 'thought' | 'narration' | 'investigation' | 'debug';
  
  // Game specific data
  simulationData?: SimulationResponse; 
}

// Alias for backwards compatibility
export type ChatEntry = Message;

// --- Game State Types (The "Adventure State" - Volatile) ---

export interface KnowledgeEntry {
  id: string;
  type: 'character' | 'location' | 'lore';
  description: string;
  status?: string;
}

export interface QuestEntry {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
}

export type NPCCondition = 'NORMAL' | 'INCAPACITATED' | 'DEAD';

export interface NPCEntity {
  id: string; 
  name: string; 
  descriptor: string; 
  isNameKnown: boolean; 
  location: string;
  action: string; 
  lastThought: string; 
  status: string; // Descritivo (Flavor) ex: "Sangrando"
  condition: NPCCondition; // Lógico (Engine) ex: "NORMAL"
}

export interface PlayerStats {
  strength: number;
  agility: number;
  intelligence: number;
  spirit: number;
  health: number;
  maxHealth: number;
}

export interface GameState {
  adventureId?: string; // [NOVO] Link para o registro da biblioteca
  universeId: string;
  userId?: string;

  player: {
    sourceId: string;
    name: string;
    description: string;
    inventory: string[];
    status: string;
    location: string;
    stats: PlayerStats; 
  };
  world: {
    time: string;
    weather: string;
    activeEvents: string[];
    npcs: NPCEntity[];
  };
  knowledgeBase: {
    characters: KnowledgeEntry[];
    locations: KnowledgeEntry[];
    lore: KnowledgeEntry[];
    quests: QuestEntry[];
  };
  summary: string; 
  history: Message[];
}

// --- Library Components ---

export interface TimelineEvent {
  year: string;
  event: string;
  era?: string;
}

export interface ChampionRecord {
  characterName: string;
  feat: string;
  date: string;
  status: 'Legend' | 'Myth' | 'Forgotten';
}

export interface WorldEntry {
    name: string;
    description: string;
}

export type UniverseStructure = 'singular_world' | 'star_cluster' | 'multiverse_hub';
export type NavigationMethod = 'physical' | 'interstellar_ship' | 'magical_gate' | 'dream_walking';

// --- AI Response Types ---

export interface WorldUpdate {
  actionResult: string;
  playerStatus: string;
  newLocation: string;
  timePassed: string;
  currentWeather: string;
  worldEvents: string[];
  inventoryUpdates: {
    added?: string[];
    removed?: string[];
  };
  statChanges?: Partial<PlayerStats>;
}

export interface NPCBehaviorResponse {
  npcs: NPCEntity[];
}

export interface NarrativeResponse {
  narrative: string;
  canonicalEvents?: string[]; 
  discoveredTruths?: string[]; 
  graphUpdates?: GraphEdge[];
  knowledgeUpdate?: {
    characters?: KnowledgeEntry[];
    locations?: KnowledgeEntry[];
    lore?: KnowledgeEntry[];
    quests?: QuestEntry[];
  };
}

export interface SimulationResponse extends NarrativeResponse {
  worldUpdate: WorldUpdate;
  npcSimulation: NPCEntity[];
  initialTime?: string;
}

// [NEW] Unified Analyst Response
export interface AnalystResponse {
    worldUpdate: WorldUpdate;   // SQLite
    graphEdges: GraphEdge[];    // Neo4j
    memoryMetadata: {           // ChromaDB (Optimization)
        keywords: string[];
        summary: string;
        importance: 'low' | 'medium' | 'high' | 'critical';
    };
}
