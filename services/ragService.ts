
import { GameState, GraphEdge } from "../types";

// --- RAG & TRIPLE STORE CLIENT SERVICE ---
// Este serviço conecta o frontend React ao servidor Python Backend.
// O Backend agora deve suportar ChromaDB (Vector), SQLite (Logs) e Neo4j (Graph).
const SERVER_URL = "https://6b10889bffdd.ngrok-free.app";

export interface RagDocument {
  page_content: string;
  metadata: any;
}

// Payload unificado para envio aos 3 servidores de uma vez
export interface UnifiedIngestPayload {
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

/**
 * Envia o Snapshot completo do turno para o Backend.
 * O Backend Python deve rotear cada parte para seu DB específico.
 */
export const ingestUnifiedMemory = async (payload: UnifiedIngestPayload) => {
  try {
    const response = await fetch(`${SERVER_URL}/ingest/unified`, {
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

// Legacy support wrapper (para compatibilidade com chamadas antigas, se houver)
export const ingestMemory = async (text: string, metadata: { turn: number; location: string; type: string; universeId?: string }) => {
    // This is a simplified fallback. Ideally, use ingestUnifiedMemory.
    try {
        await fetch(`${SERVER_URL}/ingest`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ text, metadata })
        });
    } catch(e) {}
};

/**
 * Busca memórias relevantes (Vector Search).
 * Pode ser expandido futuramente para buscar também no Graph (Neo4j).
 */
export const retrieveContext = async (query: string): Promise<string[]> => {
  try {
    const response = await fetch(`${SERVER_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query })
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    return [];
  }
};

/**
 * Verifica se o servidor backend está online.
 * Utiliza um timeout curto para não travar a UI.
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    // Tenta pingar a raiz ou endpoint de health
    const response = await fetch(`${SERVER_URL}/`, {
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
