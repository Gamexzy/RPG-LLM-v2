import { GameState, NPCBehaviorResponse } from "../../types";
import { NPCBehaviorSchema } from "../ai/schemas";
import { NPC_ENGINE_INSTRUCTION } from "../ai/prompts";
import { getAiClient, NPC_MODEL } from "../ai/client";

export const runNPCBehaviorEngine = async (
  currentState: GameState,
  playerAction: string
): Promise<NPCBehaviorResponse> => {
  const ai = getAiClient();

  const context = `
  [ESTADO DO MUNDO]:
  Tempo: ${currentState.world.time}
  Eventos Ativos: ${currentState.world.activeEvents.join(", ")}
  Local do Jogador: ${currentState.player.location}
  
  [AÇÃO IMEDIATA DO JOGADOR]: "${playerAction}"

  [LISTA DE NPCS (ESTADO ANTERIOR)]:
  ${JSON.stringify(currentState.world.npcs)}
  `;

  const prompt = `
  SIMULE A REAÇÃO DOS NPCS EM TEMPO REAL (PARALELO AO NARRADOR).
  
  O Narrador está resolvendo a física da ação do jogador agora.
  Sua tarefa é simular como os NPCs reagem à INTENÇÃO do jogador ou continuam suas vidas.
  
  Diretrizes:
  1. Onde o jogador está? Quem está perto?
  2. NPCs distantes seguem rotinas.
  3. NPCs próximos reagem à ação "${playerAction}".
  4. Mantenha a regra de 'isNameKnown': Se era false, continua false a menos que a ação do jogador seja explicitamente "Perguntar nome".
  
  Retorne a lista atualizada de NPCs.
  `;

  const response = await ai.models.generateContent({
    model: NPC_MODEL,
    contents: context + "\n" + prompt,
    config: {
      systemInstruction: NPC_ENGINE_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: NPCBehaviorSchema,
    }
  });

  if (!response.text) return { npcs: [] };
  return JSON.parse(response.text) as NPCBehaviorResponse;
};