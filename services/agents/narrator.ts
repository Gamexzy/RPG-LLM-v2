import { GameState, NarrativeResponse, SimulationResponse } from "../../types";
import { NarrativeSchema, InitSchema } from "../ai/schemas";
import { NARRATOR_INSTRUCTION } from "../ai/prompts";
import { getAiClient, NARRATOR_MODEL } from "../ai/client";
import { getSimulationHistory, getKnowledgeContext } from "../../utils/contextBuilder";

export const resolveNarrative = async (action: string, currentState: GameState): Promise<NarrativeResponse> => {
  const ai = getAiClient();
  
  const context = `
  [CONTEXTO DO JOGO]:
  Tempo: ${currentState.world.time}
  Local: ${currentState.player.location}
  Status Jogador: ${currentState.player.status}
  Inventário: ${currentState.player.inventory.join(", ")}
  NPCs Presentes (Estado Anterior): ${currentState.world.npcs.map(n => `${n.isNameKnown ? n.name : n.descriptor} (${n.location})`).join(", ")}
  
  [HISTÓRICO RECENTE]:
  ${getSimulationHistory(currentState.history)}

  ${getKnowledgeContext(currentState.knowledgeBase)}
  `;

  const prompt = `
  AÇÃO DO JOGADOR: "${action}"
  
  Tarefa:
  1. Resolva a ação física.
  2. Atualize o tempo e clima.
  3. Descreva a nova cena.
  `;

  const response = await ai.models.generateContent({
    model: NARRATOR_MODEL,
    contents: context + "\n" + prompt,
    config: {
      systemInstruction: NARRATOR_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: NarrativeSchema,
    }
  });

  if (!response.text) throw new Error("Narrator agent failed.");
  return JSON.parse(response.text) as NarrativeResponse;
};

export const initializeGameSession = async (characterName: string, setting: string): Promise<SimulationResponse> => {
  const ai = getAiClient();
  
  const prompt = `
  INICIAR SIMULAÇÃO.
  Sujeito: ${characterName}
  Contexto: ${setting}
  
  Gere a cena inicial e popule o mundo com NPCs iniciais se apropriado.
  Para os NPCs, crie nomes (name), mas também descrições visuais (descriptor). Defina isNameKnown como FALSE a menos que o sujeito já os conheça na backstory.
  `;

  const response = await ai.models.generateContent({
    model: NARRATOR_MODEL,
    contents: prompt,
    config: {
      systemInstruction: NARRATOR_INSTRUCTION + "\nTambém gere os NPCs iniciais e seus estados seguindo a regra de anonimato.",
      responseMimeType: "application/json",
      responseSchema: InitSchema,
    }
  });

  if (!response.text) throw new Error("Init failed");
  return JSON.parse(response.text) as SimulationResponse;
};