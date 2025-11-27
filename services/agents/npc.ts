
import { GameState, NPCBehaviorResponse, NPCEntity } from "../../types";
import { NPCBehaviorSchema } from "../ai/schemas";
import { NPC_ENGINE_INSTRUCTION } from "../ai/prompts";
import { generateContentWithRetry, NPC_MODEL, parseAIResponse } from "../ai/client";

export const runNPCBehaviorEngine = async (
  currentState: GameState,
  playerAction: string,
  narrative: string
): Promise<NPCBehaviorResponse> => {
  
  // Se não houver NPCs conhecidos, não gastamos tokens, mas retornamos vazio.
  // Porem, queremos permitir que o Narrador crie NPCs e o World Engine os popule, 
  // mas aqui estamos simulando os JÁ EXISTENTES. Novos NPCs entram via 'knowledgeUpdate' ou 'npcSimulation' inicial.
  const existingNPCs = currentState.world.npcs || [];

  if (existingNPCs.length === 0) {
      return { npcs: [] };
  }

  const context = `
  [HORÁRIO ATUAL]: ${currentState.world.time}
  [LOCALIZAÇÃO DO JOGADOR]: ${currentState.player.location}
  
  [LISTA DE TODOS OS NPCS CONHECIDOS]:
  ${JSON.stringify(existingNPCs)}
  `;

  const prompt = `
  [AÇÃO DO JOGADOR]: "${playerAction}"
  
  [NARRATIVA RECENTE (Eventos Locais)]:
  "${narrative}"

  TAREFA:
  1. Identifique quais NPCs da lista estão no local do jogador (${currentState.player.location}). Para estes, simule a REAÇÃO à narrativa.
  2. Para os NPCs em OUTROS locais, simule a VIDA/ROTINA baseada no horário. Eles podem se mover para outros lugares.
  3. Retorne a lista ATUALIZADA de todos os NPCs.
  `;

  const response = await generateContentWithRetry(NPC_MODEL, {
    contents: context + "\n" + prompt,
    config: {
      systemInstruction: NPC_ENGINE_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: NPCBehaviorSchema,
    }
  });

  if (!response.text) return { npcs: existingNPCs };
  
  const parsed = parseAIResponse<NPCBehaviorResponse>(response.text);

  // Merge de segurança: Se a IA esquecer de devolver algum NPC, mantemos o estado antigo dele.
  // Isso evita que NPCs sumam se a IA alucinar uma lista menor.
  const mergedNPCs = existingNPCs.map(oldNPC => {
    const updatedNPC = parsed.npcs.find(n => n.id === oldNPC.id);
    return updatedNPC || oldNPC;
  });

  // Se a IA criou novos NPCs nesta etapa (raro, mas possível), adicionamos.
  const newNPCs = parsed.npcs.filter(n => !existingNPCs.find(e => e.id === n.id));

  return { npcs: [...mergedNPCs, ...newNPCs] };
};
