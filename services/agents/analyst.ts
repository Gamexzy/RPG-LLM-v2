
import { GameState, AnalystResponse } from "../../types";
import { AnalystSchema } from "../ai/schemas";
import { ANALYST_INSTRUCTION } from "../ai/prompts";
import { GeminiClient } from "../ai/client";
import { AI_MODELS } from "../ai/config";

export const runAnalyst = async (
  action: string,
  narrative: string,
  currentState: GameState
): Promise<AnalystResponse> => {
  
  const context = `
  [ESTADO ANTERIOR]:
  Tempo: ${currentState.world.time}
  Local: ${currentState.player.location}
  Inventário: ${currentState.player.inventory.join(", ")}
  Status Jogador: ${currentState.player.status}
  
  [AÇÃO JOGADOR]: "${action}"
  [NARRATIVA RESULTANTE]: "${narrative}"
  `;

  const prompt = `
  Analise a narrativa acima e extraia as atualizações de estado.
  1. Atualize o mundo (SQLite).
  2. Extraia conexões lógicas (Graph).
  3. Prepare metadados de memória (Chroma).
  `;

  // Modelo FAST é suficiente pois é uma tarefa de extração lógica, não criativa.
  return GeminiClient.generateStructured<AnalystResponse>(
    AI_MODELS.FAST,
    context + "\n" + prompt,
    AnalystSchema,
    ANALYST_INSTRUCTION
  );
};
