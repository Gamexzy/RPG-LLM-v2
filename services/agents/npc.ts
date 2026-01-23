
import { GameState, NPCBehaviorResponse } from "../../types";
import { NPCBehaviorSchema } from "../ai/schemas";
import { NPC_ENGINE_INSTRUCTION } from "../ai/prompts";
import { GeminiClient } from "../ai/client";
import { AI_MODELS } from "../ai/config";

export const runNPCBehaviorEngine = async (
  currentState: GameState,
  playerAction: string,
  narrative: string
): Promise<NPCBehaviorResponse> => {
  
  const existingNPCs = currentState.world.npcs || [];
  if (existingNPCs.length === 0) return { npcs: [] };

  const context = `
  [HORA]: ${currentState.world.time}
  [LOCAL PLAYER]: ${currentState.player.location}
  [NPCS]: ${JSON.stringify(existingNPCs)}
  `;

  const prompt = `
  [AÇÃO]: "${playerAction}"
  [NARRATIVA]: "${narrative}"

  TAREFA:
  1. NPCs locais: Reagem à narrativa.
  2. NPCs distantes: Seguem rotina baseada no horário.
  Retorne a lista atualizada.
  `;

  // Modelo FAST para simulação rápida de múltiplos agentes
  const response = await GeminiClient.generateStructured<NPCBehaviorResponse>(
    AI_MODELS.FAST,
    context + "\n" + prompt,
    NPCBehaviorSchema,
    NPC_ENGINE_INSTRUCTION
  );

  // Merge de segurança (Client-side logic)
  const mergedNPCs = existingNPCs.map(oldNPC => {
    const updatedNPC = response.npcs.find(n => n.id === oldNPC.id);
    return updatedNPC || oldNPC;
  });
  const newNPCs = response.npcs.filter(n => !existingNPCs.find(e => e.id === n.id));

  return { npcs: [...mergedNPCs, ...newNPCs] };
};
