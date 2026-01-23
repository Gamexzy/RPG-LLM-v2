
import { GameState, WorldUpdate } from "../../types";
import { WorldEngineSchema } from "../ai/schemas";
import { WORLD_ENGINE_INSTRUCTION } from "../ai/prompts";
import { GeminiClient } from "../ai/client";
import { AI_MODELS } from "../ai/config";

export const runWorldSimulation = async (
  action: string,
  narrative: string,
  currentState: GameState
): Promise<WorldUpdate> => {
  
  const context = `
  [ESTADO ANTERIOR]:
  Tempo: ${currentState.world.time}
  Clima: ${currentState.world.weather}
  Local: ${currentState.player.location}
  Status: ${currentState.player.status}
  Inventário: ${currentState.player.inventory.join(", ")}
  `;

  const prompt = `
  [AÇÃO]: "${action}"
  [NARRATIVA (VERDADE)]: "${narrative}"

  TAREFA: Extraia atualizações de estado (Tempo, Local, Inventário, Status) para sincronizar o JSON com o texto.
  `;

  // Usa modelo FAST (Flash) pois é uma tarefa lógica de extração
  return GeminiClient.generateStructured<WorldUpdate>(
    AI_MODELS.FAST,
    context + "\n" + prompt,
    WorldEngineSchema,
    WORLD_ENGINE_INSTRUCTION
  );
};
