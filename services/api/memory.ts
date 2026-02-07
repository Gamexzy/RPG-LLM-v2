
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
    // [NEW] Metadata otimizado vindo do Analyst Agent
    keywords?: string[];
    summary?: string;
    importance?: string;
  };

  // SQLite Logs
  sqlData: {
    playerStatus: any;
    inventory: string[];
    worldState: any;
  };

  // Neo4j Graph (Frontend usa source/target, Backend espera subject/object)
  graphData: GraphEdge[];
}

/**
 * Envia o "Snapshot" do turno. Fire-and-forget.
 */
export const ingestUnifiedMemory = async (payload: UnifiedIngestPayload) => {
  try {
    // Adapter: Converte o formato do Frontend (GraphEdge: source/target) 
    // para o formato da API (subject/object)
    const apiGraphData = payload.graphData.map(edge => ({
      subject: edge.source,
      relation: edge.relation,
      object: edge.target,
      properties: edge.properties
    }));

    const apiPayload = {
      ...payload,
      graphData: apiGraphData
    };

    await apiClient.post('/ingest/unified', apiPayload);
  } catch (error: any) {
    // Diferencia erro de conexão (Offline) de erro de aplicação (Bug/400/500)
    const isNetworkError = error.message && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('Falha na conexão')
    );

    if (isNetworkError) {
        console.debug("Backend offline ou inacessível. Ingestão de memória ignorada.");
    } else {
        // Se não for erro de rede, é um erro que o backend retornou (ex: 422, 500)
        console.warn("[Memory Ingest] Falha na API:", error.message || error);
    }
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
 * O Backend retorna { subject, relation, object }, precisamos mapear para { source, target } se necessário,
 * ou o tipo GraphEdge já deve ser compatível.
 */
export const retrieveGraphContext = async (entityName: string, universeId: string, userId: string): Promise<GraphEdge[]> => {
  try {
    // O endpoint retorna arestas. Assumindo que o backend retorna { subject, relation, object }.
    // Precisamos adaptar a resposta para GraphEdge (source, relation, target).
    const data = await apiClient.post<{ edges: any[] }>('/query/graph', { 
        entity: entityName, 
        universeId, 
        userId, 
        depth: 1 
    });
    
    if (!data.edges) return [];

    return data.edges.map((e: any) => ({
      source: e.subject || e.source,
      target: e.object || e.target,
      relation: e.relation,
      properties: e.properties
    }));
  } catch (error) {
    return [];
  }
};
