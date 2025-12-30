
import { GameState, GraphEdge, UniverseTemplate, CharacterTemplate, AdventureRecord } from "../types";

// --- RAG & TRIPLE STORE CLIENT SERVICE ---
// Este serviço conecta o frontend React ao servidor Python Backend.

const DEFAULT_URL = "https://6b10889bffdd.ngrok-free.app";
const STORAGE_KEY = "cronos_api_url";

export const getServerUrl = (): string => {
  let url = localStorage.getItem(STORAGE_KEY) || DEFAULT_URL;
  // Remove barra no final se houver para evitar duplicidade (ex: .app//auth)
  return url.replace(/\/$/, "");
};

export const setServerUrl = (url: string) => {
  const cleanUrl = url.trim().replace(/\/$/, "");
  localStorage.setItem(STORAGE_KEY, cleanUrl);
};

export interface RagDocument {
  page_content: string;
  metadata: any;
}

// Payload unificado para envio aos 3 servidores de uma vez
export interface UnifiedIngestPayload {
  userId: string;
  universeId: string;
  turnId: number;
  timestamp: string; // Game Time
  
  // 1. CHROMA DB (Semantic)
  vectorData: {
    text: string;
    type: 'turn' | 'lore' | 'intro';
    location: string;
  };

  // 2. SQLITE (Structured Log)
  sqlData: {
    playerStatus: any;
    inventory: string[];
    worldState: any;
  };

  // 3. NEO4J (Graph Relations)
  graphData: GraphEdge[];
}

// --- AUTHENTICATION ENDPOINTS ---

export const registerUser = async (userData: any) => {
  const response = await fetch(`${getServerUrl()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
};

export const loginUser = async (credentials: any) => {
  const response = await fetch(`${getServerUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
};

// --- LIBRARY SYNCHRONIZATION ---

export const fetchUserLibrary = async (userId: string) => {
  try {
    const response = await fetch(`${getServerUrl()}/library/${userId}`);
    if (!response.ok) return null;
    return await response.json(); // { universes: [], characters: [], adventures: [] }
  } catch (error) {
    console.warn("Offline: Could not fetch library from server.");
    return null;
  }
};

export const syncUniverse = async (userId: string, universe: UniverseTemplate) => {
  try {
    await fetch(`${getServerUrl()}/library/universe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...universe })
    });
  } catch (e) { console.error("Sync failed", e); }
};

export const syncCharacter = async (userId: string, character: CharacterTemplate) => {
  try {
    await fetch(`${getServerUrl()}/library/character`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...character })
    });
  } catch (e) { console.error("Sync failed", e); }
};

export const syncAdventureMetadata = async (userId: string, adventure: AdventureRecord) => {
  try {
    await fetch(`${getServerUrl()}/library/adventure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...adventure })
    });
  } catch (e) { console.error("Sync failed", e); }
};

// --- EXISTING RAG FUNCTIONS ---

/**
 * Envia o Snapshot completo do turno para o Backend.
 */
export const ingestUnifiedMemory = async (payload: UnifiedIngestPayload) => {
  try {
    const response = await fetch(`${getServerUrl()}/ingest/unified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        console.warn("Triple Store Ingest Error:", response.statusText);
    }
  } catch (error) {
    console.debug("Backend offline (Ingest skipped).");
  }
};

/**
 * Busca memórias semânticas (Vector Search) baseadas em similaridade de texto.
 */
export const retrieveContext = async (query: string, universeId: string, userId: string): Promise<string[]> => {
  try {
    const response = await fetch(`${getServerUrl()}/query/vector`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          query: query,
          universeId: universeId,
          userId: userId
      })
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    return [];
  }
};

/**
 * NOVO: Busca relacionamentos diretos no Grafo (Neo4j).
 * Essencial para o modo de Investigação saber "quem conhece quem" ou "o que está neste local".
 */
export const retrieveGraphContext = async (entityName: string, universeId: string, userId: string): Promise<GraphEdge[]> => {
  try {
    const response = await fetch(`${getServerUrl()}/query/graph`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          entity: entityName,
          universeId: universeId,
          userId: userId,
          depth: 1 // Busca apenas conexões diretas para economizar tokens
      })
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.edges || [];
  } catch (error) {
    console.warn("Graph retrieval failed:", error);
    return [];
  }
};

/**
 * Verifica se o servidor backend está online.
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${getServerUrl()}/health`, { // Endpoint padrão de health check
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};
