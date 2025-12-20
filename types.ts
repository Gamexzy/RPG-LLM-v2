
// --- Game State Types (The "Adventure State" - Volatile) ---

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
  id: string; 
  name: string; 
  descriptor: string; 
  isNameKnown: boolean; 
  location: string;
  action: string; 
  lastThought: string; 
  status: string; 
}

export interface GraphEdge {
  subject: string;
  relation: string;
  object: string;
  properties?: Record<string, any>;
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
  universeId: string; // Link to the "Stage"

  player: {
    sourceId: string; // Link to the "Soul/Identity" (CharacterTemplate ID)
    name: string;     // Can change in-game (alias), but defaults to Template name
    description: string; // Current physical state description
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
  history: ChatEntry[];
}

export interface ChatEntry {
  role: 'user' | 'model' | 'system';
  text: string;
  simulationData?: SimulationResponse; 
  type?: 'action' | 'investigation' | 'debug';
}

// --- Library Templates (The "Identity" & "Cosmos" - Permanent) ---

export interface TimelineEvent {
  year: string;
  event: string;
  era?: string;
}

export interface ChampionRecord {
  characterName: string;
  feat: string;
  date: string; // Real world date or Game date
  status: 'Legend' | 'Myth' | 'Forgotten';
}

export interface WorldEntry {
    name: string;
    description: string;
}

export interface AdventureRecord {
  id: string;
  characterName: string;
  universeName: string;
  universeGenre: string;
  startDate: number;
  lastLocation?: string; // Optional metadata
}

export type UniverseStructure = 'singular_world' | 'star_cluster' | 'multiverse_hub';
export type NavigationMethod = 'physical' | 'interstellar_ship' | 'magical_gate' | 'dream_walking';

export interface UniverseTemplate {
  id: string;
  name: string; // Ex: "Dimensão C-137" ou "O Multiverso de Aether"
  description: string; // Descrição geral do "Vibe"
  genre: string;
  createdAt: number;
  
  // V2: Deep Universe Properties
  structure: UniverseStructure; // NOVO: Define se é Planeta Infinito ou Galáxia
  navigationMethod: NavigationMethod; // NOVO: Define como se viaja entre os "Wolds"
  physics: string[]; // Leis fundamentais (Hard Rules)
  magicSystem: string; 
  cosmology: string; // Estrutura do universo (Ex: "9 Reinos", "Galáxia Espiral", "Terra Plana Infinita")
  
  // V3: Living Database
  knownTruths: string[]; 
  chronicles: TimelineEvent[]; // História do Universo (não de um planeta só)
  champions: ChampionRecord[]; 
  worlds: WorldEntry[]; // Lista de Planetas/Reinos descobertos onde as tramas ocorrem
}

export interface CharacterTemplate {
  // Identity (The Actor)
  id: string;
  name: string;
  description: string; // The "essence" or core personality
  archetype: string;   // The preferred "role" they play

  // Meta-Progression
  adventuresPlayed?: number; // Tracks usage across all stages
  createdAt: number;
}

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
