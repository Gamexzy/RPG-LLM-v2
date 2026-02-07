
import { GameState, GraphEdge } from "../../types";
import { GraphSchema } from "../ai/schemas";
import { GRAPH_AGENT_INSTRUCTION } from "../ai/prompts";
import { GeminiClient } from "../ai/client";
import { AI_MODELS } from "../ai/config";

interface GraphResponse {
    edges: GraphEdge[];
}

export const runGraphExtraction = async (
  action: string,
  narrative: string,
  currentState: GameState
): Promise<GraphEdge[]> => {
  
  const context = `
  [JOGADOR]: ${currentState.player.name}
  [LOCAL ATUAL]: ${currentState.player.location}
  [AÇÃO DO JOGADOR]: "${action}"
  [NARRATIVA GERADA]: "${narrative}"
  `;

  const prompt = `
  Analise a narrativa acima.
  Quais novas relações, localizações ou conexões foram formadas?
  Extraia as arestas para o grafo Neo4j.
  `;

  try {
      const response = await GeminiClient.generateStructured<GraphResponse>(
        AI_MODELS.FAST, // Modelo rápido é suficiente para lógica de extração
        context + "\n" + prompt,
        GraphSchema,
        GRAPH_AGENT_INSTRUCTION
      );
      return response.edges || [];
  } catch (error) {
      console.warn("Graph extraction skipped/failed:", error);
      return [];
  }
};
