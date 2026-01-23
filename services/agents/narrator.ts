
import { GameState, NarrativeResponse, SimulationResponse, CharacterTemplate } from "../../types";
import { NarrativeSchema, InitSchema } from "../ai/schemas";
import { NARRATOR_INSTRUCTION } from "../ai/prompts";
import { GeminiClient } from "../ai/client";
import { AI_MODELS } from "../ai/config";
import { getSimulationHistory, getKnowledgeContext } from "../../utils/contextBuilder";
import { retrieveContext } from "../ragService";

export const synthesizeNarrative = async (
  action: string,
  currentState: GameState
): Promise<NarrativeResponse> => {
  
  // 1. RAG Retrieval
  const userId = currentState.userId || 'guest';
  const ragQuery = `Action: ${action} | Location: ${currentState.player.location}`;
  const longTermMemories = await retrieveContext(ragQuery, currentState.universeId, userId);
  
  const formattedMemories = longTermMemories.length > 0 
    ? `[MEMÓRIAS E LENDAS RECUPERADAS]:\n${longTermMemories.map(m => `- ${m}`).join('\n')}`
    : "";

  const presentNPCs = currentState.world.npcs
    .filter(npc => npc.location === currentState.player.location)
    .map(npc => `- ${npc.isNameKnown ? npc.name : npc.descriptor} (Ação: ${npc.action}, Status: ${npc.status})`)
    .join("\n");

  const context = `
  [HISTÓRICO RECENTE]:
  ${getSimulationHistory(currentState.history)}

  ${formattedMemories}

  [CONTEXTO DE CONHECIMENTO]:
  ${getKnowledgeContext(currentState.knowledgeBase)}
  
  [ESTADO ATUAL]:
  Local: ${currentState.player.location}
  Status: ${currentState.player.status}
  Inventário: ${currentState.player.inventory.join(", ")}
  Tempo: ${currentState.world.time}

  [PESSOAS PRESENTES]:
  ${presentNPCs || "Ninguém visível."}
  `;

  const prompt = `
  AÇÃO DO JOGADOR: "${action}"

  TAREFA:
  1. Atue como Mestre de Jogo. Decida o resultado lógico.
  2. Use memórias recuperadas para consistência.
  3. Narrativa em 2ª pessoa. Use [[DIALOGUE: Nome | Instrução]] para falas.
  4. Registre eventos históricos em 'canonicalEvents'.
  `;

  // Usa o modelo CREATIVE (Pro) para melhor qualidade narrativa
  return GeminiClient.generateStructured<NarrativeResponse>(
    AI_MODELS.CREATIVE,
    context + "\n" + prompt,
    NarrativeSchema,
    NARRATOR_INSTRUCTION
  );
};

export const initializeGameSession = async (character: CharacterTemplate, setting: string, universeId: string, universeName: string, userId: string): Promise<SimulationResponse> => {
  const ragQuery = `Overview history legends of universe ${universeName}`;
  const loreContext = await retrieveContext(ragQuery, universeId, userId);

  const formattedLore = loreContext.length > 0 
    ? `[LENDAS DO UNIVERSO]:\n${loreContext.map(m => `- ${m}`).join('\n')}`
    : "";

  const prompt = `
  INICIAR SIMULAÇÃO.
  Universo: ${universeName} (ID: ${universeId})
  Cenário: ${setting}
  Ator: ${character.name} (${character.archetype}) - ${character.description}
  
  ${formattedLore}

  Gere: Data inicial, Narrativa inicial, Estado do mundo e NPCs iniciais.
  `;

  return GeminiClient.generateStructured<SimulationResponse>(
    AI_MODELS.CREATIVE,
    prompt,
    InitSchema,
    NARRATOR_INSTRUCTION + "\nESTADO INICIAL: Use a Identidade do personagem para moldar a percepção inicial."
  );
};
