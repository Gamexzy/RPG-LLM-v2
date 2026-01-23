
import { GraphEdge } from "../../types";
import { apiClient } from "./core";

// Payload unificado para envio aos 3 bancos de dados
export interface UnifiedIngestPayload {
  userId: string;
  universeId: string;
  turnId: number;
  timestamp: string; 
  
  // Chroma DB
  vectorData: {
    text: string;
    type: 'turn' | 'lore' | 'intro';
    location: string;
  };

  // SQLite Logs
  sqlData: {
    playerStatus: any;
    inventory: string[];
    worldState: any;
  };

  // Neo4j Graph
  graphData: GraphEdge[];
}

/**
 * Envia o "Snapshot" do turno. Fire-and-forget.
 */
export const ingestUnifiedMemory = async (payload: UnifiedIngestPayload) => {
  try {
    await apiClient.post('/ingest/unified', payload);
  } catch (error) {
    console.debug("Backend offline (Ingestão pulada).");
  }
};

/**
 * Busca memórias semânticas (ChromaDB).
 */
export const retrieveContext = async (query: string, universeId: string, userId: string): Promise<string[]> => {
  try {
    const data = await apiClient.post<{ documents: string[] }>('/query/vector', { 
        query, 
        universeId, 
        userId 
    });
    return data.documents || [];
  } catch (error) {
    return []; 
  }
};

/**
 * Busca relacionamentos no Grafo (Neo4j).
 */
export const retrieveGraphContext = async (entityName: string, universeId: string, userId: string): Promise<GraphEdge[]> => {
  try {
    const data = await apiClient.post<{ edges: GraphEdge[] }>('/query/graph', { 
        entity: entityName, 
        universeId, 
        userId, 
        depth: 1 
    });
    return data.edges || [];
  } catch (error) {
    return [];
  }
};
