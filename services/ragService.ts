
// --- RAG CLIENT SERVICE ---
// Este serviço conecta o frontend React ao seu servidor Python RAG.
// Padrão esperado: FastAPI ou Flask rodando em localhost:8000.

const RAG_SERVER_URL = "http://localhost:8000";

export interface RagDocument {
  page_content: string;
  metadata: any;
}

/**
 * Envia a narrativa recente para ser indexada no servidor Python.
 * Deve ser chamado em background após cada turno.
 */
export const ingestMemory = async (text: string, metadata: { turn: number; location: string; type: string }) => {
  try {
    // Fail-safe: Se não houver servidor, apenas ignora silenciosamente ou loga aviso leve.
    const response = await fetch(`${RAG_SERVER_URL}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        metadata: metadata
      })
    });
    
    if (!response.ok) {
        console.warn("RAG Server Ingest Error:", response.statusText);
    }
  } catch (error) {
    // Servidor provavelmente offline, ignoramos para não travar o jogo.
    console.debug("RAG Server offline (Ingest skipped).");
  }
};

/**
 * Busca memórias relevantes baseadas na ação atual do jogador.
 * Deve ser chamado ANTES do Narrador gerar a história.
 */
export const retrieveContext = async (query: string): Promise<string[]> => {
  try {
    const response = await fetch(`${RAG_SERVER_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query })
    });

    if (!response.ok) return [];

    const data = await response.json();
    // Esperamos que o python retorne: { documents: ["texto 1", "texto 2"] }
    return data.documents || [];
  } catch (error) {
    console.debug("RAG Server offline (Retrieval skipped).");
    return [];
  }
};
