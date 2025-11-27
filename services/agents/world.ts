
import { GameState, WorldUpdate } from "../../types";
import { WorldEngineSchema } from "../ai/schemas";
import { WORLD_ENGINE_INSTRUCTION } from "../ai/prompts";
import { generateContentWithRetry, WORLD_MODEL, parseAIResponse } from "../ai/client";

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
  [AÇÃO DO JOGADOR]: "${action}"
  
  [NARRATIVA GERADA (A VERDADE)]: 
  "${narrative}"

  TAREFA:
  Analise a narrativa acima e extraia as atualizações de estado para manter o JSON sincronizado com o texto.
  1. Quanto tempo passou na história?
  2. O jogador mudou de local no texto?
  3. O jogador pegou/usou itens citados no texto?
  4. Qual o estado físico do jogador após essa narrativa?
  
  Retorne apenas o JSON de atualização.
  `;

  const response = await generateContentWithRetry(WORLD_MODEL, {
    contents: context + "\n" + prompt,
    config: {
      systemInstruction: WORLD_ENGINE_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: WorldEngineSchema,
    }
  });

  return parseAIResponse<WorldUpdate>(response.text);
};
