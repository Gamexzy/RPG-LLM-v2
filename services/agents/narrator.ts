
import { GameState, NarrativeResponse, SimulationResponse } from "../../types";
import { NarrativeSchema, InitSchema } from "../ai/schemas";
import { NARRATOR_INSTRUCTION } from "../ai/prompts";
import { generateContentWithRetry, NARRATOR_MODEL, parseAIResponse } from "../ai/client";
import { getSimulationHistory, getKnowledgeContext } from "../../utils/contextBuilder";
import { retrieveContext } from "../ragService";

// The Narrator is now the FIRST step (The Leader).
// It decides the outcome and writes the story immediately.
export const synthesizeNarrative = async (
  action: string,
  currentState: GameState
): Promise<NarrativeResponse> => {
  
  // 1. RAG RETRIEVAL (Tenta buscar memórias no servidor Python)
  // Buscamos baseados na ação, localização E HISTÓRIA DO UNIVERSO
  // A query inclui o UniverseID para que o RAG possa (se configurado) filtrar ou priorizar
  const ragQuery = `Action: ${action} | Location: ${currentState.player.location} | Universe: ${currentState.universeId}`;
  
  const longTermMemories = await retrieveContext(ragQuery);
  
  const formattedMemories = longTermMemories.length > 0 
    ? `[MEMÓRIAS E LENDAS RECUPERADAS (RAG)]:\n${longTermMemories.map(m => `- ${m}`).join('\n')}`
    : "";

  // 2. Filtra NPCs locais
  const presentNPCs = currentState.world.npcs
    .filter(npc => npc.location === currentState.player.location)
    .map(npc => `- ${npc.isNameKnown ? npc.name : npc.descriptor} (Ação: ${npc.action}, Status: ${npc.status})`)
    .join("\n");

  const context = `
  [HISTÓRICO RECENTE]:
  ${getSimulationHistory(currentState.history)}

  ${formattedMemories}

  [CONTEXTO DE CONHECIMENTO (Códex)]:
  ${getKnowledgeContext(currentState.knowledgeBase)}
  
  [ESTADO ATUAL DO JOGADOR]:
  Local: ${currentState.player.location}
  Status: ${currentState.player.status}
  Inventário: ${currentState.player.inventory.join(", ")}
  Tempo: ${currentState.world.time}

  [PESSOAS PRESENTES NESTE LOCAL (${currentState.player.location})]:
  ${presentNPCs || "Ninguém visível."}
  `;

  const prompt = `
  AÇÃO DO JOGADOR: "${action}"

  TAREFA DE ESCRITA:
  1. Atue como Mestre de Jogo. Decida o resultado lógico da ação.
  2. Use as [MEMÓRIAS E LENDAS RECUPERADAS] para manter a consistência histórica do universo. Se o jogador encontrar uma estátua descrita no RAG, descreva-a.
  3. Escreva a resposta narrativa em 2ª pessoa usando as tags [[DIALOGUE:...]] para falas.
  4. Se ocorrer algo EPICO que muda a história do mundo, adicione ao campo 'canonicalEvents'.
  `;

  const response = await generateContentWithRetry(NARRATOR_MODEL, {
    contents: context + "\n" + prompt,
    config: {
      systemInstruction: NARRATOR_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: NarrativeSchema,
    }
  });

  return parseAIResponse<NarrativeResponse>(response.text);
};

export const initializeGameSession = async (characterName: string, setting: string, universeId: string, universeName: string): Promise<SimulationResponse> => {
  
  // No início, buscamos Lendas Gerais do Universo para dar contexto
  const ragQuery = `Overview history legends of universe ${universeName}`;
  const loreContext = await retrieveContext(ragQuery);

  const formattedLore = loreContext.length > 0 
    ? `[LENDAS E HISTÓRIA DO UNIVERSO (CONTEXTO RAG)]:\n${loreContext.map(m => `- ${m}`).join('\n')}`
    : "";

  const prompt = `
  INICIAR SIMULAÇÃO.
  Universo: ${universeName} (ID: ${universeId})
  Sujeito: ${characterName}
  Cenário Inicial: ${setting}
  
  ${formattedLore}

  Gere:
  1. Uma DATA e HORA inicial.
  2. A narrativa inicial. Incorpore elementos das [LENDAS] se apropriado para situar o jogador no mundo.
  3. O estado inicial do mundo.
  4. Os NPCs iniciais.
  `;

  const response = await generateContentWithRetry(NARRATOR_MODEL, {
    contents: prompt,
    config: {
      systemInstruction: NARRATOR_INSTRUCTION + "\nVocê está criando o ESTADO INICIAL. Considere o Lore existente.",
      responseMimeType: "application/json",
      responseSchema: InitSchema,
    }
  }, 6, 3000);

  return parseAIResponse<SimulationResponse>(response.text);
};