
import { GameState, NarrativeResponse, SimulationResponse, CharacterTemplate } from "../../types";
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
  // O UniverseID é passado para isolar a busca no banco de dados correto.
  const ragQuery = `Action: ${action} | Location: ${currentState.player.location}`;
  
  const longTermMemories = await retrieveContext(ragQuery, currentState.universeId);
  
  const formattedMemories = longTermMemories.length > 0 
    ? `[MEMÓRIAS E LENDAS RECUPERADAS DO BANCO DE DADOS DO UNIVERSO]:\n${longTermMemories.map(m => `- ${m}`).join('\n')}`
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
  2. Use as [MEMÓRIAS E LENDAS RECUPERADAS] para manter a consistência histórica do universo. Se o jogador encontrar uma estátua descrita no RAG, descreva-a conforme os dados recuperados.
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

export const initializeGameSession = async (character: CharacterTemplate, setting: string, universeId: string, universeName: string): Promise<SimulationResponse> => {
  
  // No início, buscamos Lendas Gerais do Universo específico para dar contexto
  const ragQuery = `Overview history legends of universe ${universeName}`;
  const loreContext = await retrieveContext(ragQuery, universeId);

  const formattedLore = loreContext.length > 0 
    ? `[LENDAS E HISTÓRIA DO UNIVERSO (CONTEXTO RAG)]:\n${loreContext.map(m => `- ${m}`).join('\n')}`
    : "";

  const prompt = `
  INICIAR SIMULAÇÃO.
  
  [CONTAINER / BANCO DE DADOS]:
  Universo: ${universeName} (ID: ${universeId})
  Cenário Inicial da Aventura: ${setting}

  [ALMA / ATOR]:
  Nome: ${character.name}
  Arquétipo: ${character.archetype}
  Backstory/Essência (Imutável): ${character.description}
  
  ${formattedLore}

  Gere:
  1. Uma DATA e HORA inicial.
  2. A narrativa inicial. Incorpore elementos das [LENDAS] se apropriado, mas foque na materialização do personagem neste cenário.
  3. O estado inicial do mundo.
  4. Os NPCs iniciais.
  `;

  const response = await generateContentWithRetry(NARRATOR_MODEL, {
    contents: prompt,
    config: {
      systemInstruction: NARRATOR_INSTRUCTION + "\nVocê está criando o ESTADO INICIAL de uma nova aventura. Use a Identidade do personagem para moldar como ele percebe o mundo.",
      responseMimeType: "application/json",
      responseSchema: InitSchema,
    }
  }, 6, 3000);

  return parseAIResponse<SimulationResponse>(response.text);
};
