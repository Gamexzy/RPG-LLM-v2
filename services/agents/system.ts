
import { GameState } from "../../types";
import { INVESTIGATION_INSTRUCTION, DEBUG_INSTRUCTION } from "../ai/prompts";
import { generateContentWithRetry, SYSTEM_MODEL } from "../ai/client";
import { getSimulationHistory } from "../../utils/contextBuilder";
import { retrieveContext, retrieveGraphContext } from "../ragService";

export const investigateScene = async (
  query: string,
  currentState: GameState
): Promise<string> => {
  
  // 1. Identificação do Contexto (Backend First)
  // Tentamos buscar informações REAIS no banco de dados sobre o que o usuário está perguntando.
  const userId = currentState.userId || 'guest';
  
  // Dispara buscas paralelas (Vector + Graph)
  const [vectorMemories, graphRelations] = await Promise.all([
      retrieveContext(query, currentState.universeId, userId),
      retrieveGraphContext(query, currentState.universeId, userId) // Tenta usar a query como nome da entidade
  ]);

  const formattedGraph = graphRelations.length > 0 
      ? `[RELAÇÕES CONHECIDAS (Neo4j)]: ${graphRelations.map(g => `${g.subject} ${g.relation} ${g.object}`).join(", ")}`
      : "";

  const formattedMemories = vectorMemories.length > 0
      ? `[MEMÓRIAS/LORE RELEVANTES (RAG)]: ${vectorMemories.slice(0, 2).join(" | ")}`
      : "";

  const context = `
  [ESTADO ATUAL]:
  Local: ${currentState.player.location}
  Tempo: ${currentState.world.time}
  Status: ${currentState.player.status}
  
  [DADOS DO SISTEMA DE MEMÓRIA]:
  ${formattedGraph}
  ${formattedMemories}

  [HISTÓRICO RECENTE]:
  ${getSimulationHistory(currentState.history)}
  `;

  const prompt = `
  O jogador está INVESTIGANDO algo específico: "${query}"

  Gere um PENSAMENTO RÁPIDO e ANALÍTICO em primeira pessoa.
  
  REGRAS:
  1. Use os [DADOS DO SISTEMA DE MEMÓRIA] como verdade absoluta. Se o grafo diz que X odeia Y, o pensamento deve refletir isso.
  2. Seja CONCISO.
  3. Seja ÚTIL: Diga o que é, se é perigoso, se tem valor.
  4. Use linguagem natural de pensamento ("Parece...", "Sinto...", "Lembro que...").
  `;

  const response = await generateContentWithRetry(SYSTEM_MODEL, {
    contents: context + "\n" + prompt,
    config: {
      systemInstruction: INVESTIGATION_INSTRUCTION,
      responseMimeType: "text/plain",
    }
  });

  return response.text || "...";
};

export const summarizeMemory = async (currentState: GameState): Promise<string> => {
  const response = await generateContentWithRetry(SYSTEM_MODEL, {
    contents: `Resuma eventos recentes (Local, Objetivos, Encontros): ${currentState.history.map(h=>h.text).join("\n")}`,
    config: { responseMimeType: "text/plain" }
  });
  return response.text || currentState.summary;
};

export const debugSimulation = async (
  query: string,
  currentState: GameState
): Promise<string> => {
  
  const context = `
  Player: ${JSON.stringify(currentState.player)}
  NPCs (Psyche Engine): ${JSON.stringify(currentState.world.npcs)}
  Last Events: ${getSimulationHistory(currentState.history)}
  `;

  const prompt = `[DEBUG QUERY]: "${query}"\nExplique a lógica do sistema (Narrador ou NPCs) tecnicamente.`;

  const response = await generateContentWithRetry(SYSTEM_MODEL, {
    contents: context + "\n" + prompt,
    config: {
      systemInstruction: DEBUG_INSTRUCTION,
      responseMimeType: "text/plain",
    }
  });

  return response.text || "Erro no log.";
};
