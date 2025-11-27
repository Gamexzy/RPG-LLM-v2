
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
  // Buscamos baseados na ação E na localização atual para contexto
  const ragQuery = `Action: ${action} | Location: ${currentState.player.location}`;
  const longTermMemories = await retrieveContext(ragQuery);
  
  const formattedMemories = longTermMemories.length > 0 
    ? `[MEMÓRIAS DE LONGO PRAZO RECUPERADAS (RAG)]:\n${longTermMemories.map(m => `- ${m}`).join('\n')}`
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
  1. Atue como Mestre de Jogo. Decida o resultado lógico da ação (Sucesso/Falha) baseado no contexto e nas MEMÓRIAS recuperadas.
  2. Interaja com as [PESSOAS PRESENTES] se fizer sentido.
  3. Escreva a resposta narrativa em 2ª pessoa ("Você...").
  4. Seja sensorial e imersivo.
  5. Identifique se houve atualização de conhecimento (novos NPCs, Locais, Quests) no campo knowledgeUpdate.
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

export const initializeGameSession = async (characterName: string, setting: string): Promise<SimulationResponse> => {
  const prompt = `
  INICIAR SIMULAÇÃO.
  Sujeito: ${characterName}
  Contexto: ${setting}
  
  Gere:
  1. Uma DATA e HORA inicial (initialTime) compatível com o cenário (Futuro, Passado, etc) no formato "DD/MM/YYYY HH:MM".
  2. A narrativa inicial (narrative).
  3. O estado inicial do mundo (worldUpdate).
  4. Os NPCs iniciais (npcSimulation) - Crie pelo menos 2 NPCs relevantes para a cena inicial.
  `;

  const response = await generateContentWithRetry(NARRATOR_MODEL, {
    contents: prompt,
    config: {
      systemInstruction: NARRATOR_INSTRUCTION + "\nVocê está criando o ESTADO INICIAL do zero. Defina o cenário e a DATA.",
      responseMimeType: "application/json",
      responseSchema: InitSchema,
    }
  }, 6, 3000);

  return parseAIResponse<SimulationResponse>(response.text);
};
