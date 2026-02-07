
import { GameState } from "../../types";
import { INVESTIGATION_INSTRUCTION, DEBUG_INSTRUCTION } from "../ai/prompts";
import { GeminiClient } from "../ai/client";
import { AI_MODELS } from "../ai/config";
import { getSimulationHistory } from "../../utils/contextBuilder";
import { retrieveContext, retrieveGraphContext } from "../ragService";

export const investigateScene = async (
  query: string,
  currentState: GameState
): Promise<string> => {
  const userId = currentState.userId || 'guest';
  
  const [vectorMemories, graphRelations] = await Promise.all([
      retrieveContext(query, currentState.universeId, userId),
      retrieveGraphContext(query, currentState.universeId, userId)
  ]);

  const formattedGraph = graphRelations.length > 0 
      ? `[GRAFO]: ${graphRelations.map(g => `${g.source} ${g.relation} ${g.target}`).join(", ")}`
      : "";

  const formattedMemories = vectorMemories.length > 0
      ? `[LORE]: ${vectorMemories.slice(0, 2).join(" | ")}`
      : "";

  const context = `
  [ESTADO]: ${currentState.player.location} | ${currentState.world.time}
  [MEMÓRIA]: ${formattedGraph} ${formattedMemories}
  [HISTÓRICO]: ${getSimulationHistory(currentState.history)}
  `;

  const prompt = `INVESTIGAÇÃO: "${query}". Gere um pensamento curto, útil e sensorial em 1ª pessoa.`;

  return GeminiClient.generateText(
    AI_MODELS.FAST,
    context + "\n" + prompt,
    INVESTIGATION_INSTRUCTION
  );
};

export const summarizeMemory = async (currentState: GameState): Promise<string> => {
  return GeminiClient.generateText(
    AI_MODELS.FAST,
    `Resuma eventos recentes: ${currentState.history.map(h=>h.text).join("\n")}`,
    "Resumidor de Logs. Seja conciso."
  );
};

export const debugSimulation = async (
  query: string,
  currentState: GameState
): Promise<string> => {
  const context = `Player: ${JSON.stringify(currentState.player)}\nNPCs: ${JSON.stringify(currentState.world.npcs)}`;
  const prompt = `[DEBUG]: "${query}"\nExplique tecnicamente.`;

  return GeminiClient.generateText(
    AI_MODELS.FAST,
    context + "\n" + prompt,
    DEBUG_INSTRUCTION
  );
};
