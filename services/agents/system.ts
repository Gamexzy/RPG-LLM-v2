
import { GameState } from "../../types";
import { INVESTIGATION_INSTRUCTION, DEBUG_INSTRUCTION } from "../ai/prompts";
import { generateContentWithRetry, SYSTEM_MODEL } from "../ai/client";
import { getSimulationHistory } from "../../utils/contextBuilder";

export const investigateScene = async (
  query: string,
  currentState: GameState
): Promise<string> => {
  
  const context = `
  Local: ${currentState.player.location}
  Tempo: ${currentState.world.time}
  Status: ${currentState.player.status}
  Histórico: ${getSimulationHistory(currentState.history)}
  `;

  const prompt = `
  O jogador está INVESTIGANDO algo específico: "${query}"

  Gere um PENSAMENTO RÁPIDO e ANALÍTICO em primeira pessoa.
  
  REGRAS:
  1. Seja CONCISO.
  2. Seja ÚTIL: Diga o que é, se é perigoso, se tem valor ou se está trancado.
  3. Evite poesia ou drama excessivo. Fale como alguém que avalia a situação.
  4. Use linguagem natural de pensamento ("Parece...", "Sinto...", "Isso deve ser...").
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
