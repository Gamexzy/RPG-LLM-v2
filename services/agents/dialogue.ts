
import { GameState } from "../../types";
import { DIALOGUE_AGENT_INSTRUCTION } from "../ai/prompts";
import { generateContentWithRetry, DIALOGUE_MODEL } from "../ai/client";

/**
 * Agente Especialista: Gera uma única fala para um NPC.
 */
const generateDialogueLine = async (
  npcName: string,
  instruction: string,
  gameState: GameState
): Promise<string> => {
  // 1. Tenta encontrar dados do NPC na memória do jogo
  // Procura em NPCs ativos (World) ou na Base de Conhecimento (Codex)
  const activeNPC = gameState.world.npcs.find(n => n.name.toLowerCase().includes(npcName.toLowerCase()) || n.descriptor.toLowerCase().includes(npcName.toLowerCase()));
  const knownNPC = gameState.knowledgeBase.characters.find(c => c.id.toLowerCase().includes(npcName.toLowerCase()));

  const persona = activeNPC 
    ? `Nome: ${activeNPC.name}. Descrição: ${activeNPC.descriptor}. Humor/Status Atual: ${activeNPC.status}. Último Pensamento: "${activeNPC.lastThought}"`
    : knownNPC 
      ? `Nome: ${knownNPC.id}. Descrição: ${knownNPC.description}. Status: ${knownNPC.status}.`
      : `Nome: ${npcName}. Descrição: Um habitante deste mundo.`;

  const context = `
  [CENÁRIO]:
  Local: ${gameState.player.location}
  Tempo: ${gameState.world.time}
  Jogador: ${gameState.player.name} (${gameState.player.description})
  
  [INSTRUÇÃO DO NARRADOR]:
  "${instruction}"
  `;

  const prompt = `Gere a fala deste personagem com base na instrução.`;

  try {
    const response = await generateContentWithRetry(DIALOGUE_MODEL, {
      contents: `PERSONA:\n${persona}\n${context}\n${prompt}`,
      config: {
        systemInstruction: DIALOGUE_AGENT_INSTRUCTION,
        responseMimeType: "text/plain",
      }
    });
    
    // Limpa aspas extras se o modelo adicionar, pois vamos formatar na narrativa
    let speech = response.text?.trim() || "...";
    // Opcional: Adicionar aspas se não tiver
    if (!speech.startsWith('"') && !speech.startsWith('—') && !speech.startsWith('-')) {
        speech = `"${speech}"`;
    }
    return speech;

  } catch (e) {
    console.error(`Falha ao gerar diálogo para ${npcName}`, e);
    return `"${instruction}"`; // Fallback: O NPC diz a instrução literalmente se a IA falhar
  }
};

/**
 * Middleware: Processa a narrativa bruta, detecta tags [[DIALOGUE]] e as substitui.
 * Executa todas as chamadas de diálogo em paralelo para performance.
 */
export const resolveDialogueTags = async (
  narrativeText: string,
  gameState: GameState
): Promise<string> => {
  // Regex para encontrar [[DIALOGUE: Nome | Instrução]]
  const tagRegex = /\[\[DIALOGUE:\s*(.+?)\s*\|\s*(.+?)\]\]/g;
  
  let match;
  const replacements: { start: number; end: number; promise: Promise<string> }[] = [];

  // 1. Coleta todas as tags e inicia as Promises de geração
  while ((match = tagRegex.exec(narrativeText)) !== null) {
    const [fullTag, npcName, instruction] = match;
    const index = match.index;
    
    replacements.push({
      start: index,
      end: index + fullTag.length,
      promise: generateDialogueLine(npcName, instruction, gameState)
    });
  }

  if (replacements.length === 0) return narrativeText;

  // 2. Aguarda todas as gerações
  const results = await Promise.all(replacements.map(r => r.promise));

  // 3. Reconstrói a string (de trás para frente para não bagunçar índices)
  let finalNarrative = narrativeText;
  for (let i = replacements.length - 1; i >= 0; i--) {
    const { start, end } = replacements[i];
    const speech = results[i];
    finalNarrative = finalNarrative.substring(0, start) + speech + finalNarrative.substring(end);
  }

  return finalNarrative;
};
