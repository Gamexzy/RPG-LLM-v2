
import { GameState } from "../../types";
import { DIALOGUE_AGENT_INSTRUCTION } from "../ai/prompts";
import { GeminiClient } from "../ai/client";
import { AI_MODELS } from "../ai/config";

const generateDialogueLine = async (
  npcName: string,
  instruction: string,
  gameState: GameState
): Promise<string> => {
  const activeNPC = gameState.world.npcs.find(n => n.name.toLowerCase().includes(npcName.toLowerCase()) || n.descriptor.toLowerCase().includes(npcName.toLowerCase()));
  const knownNPC = gameState.knowledgeBase.characters.find(c => c.id.toLowerCase().includes(npcName.toLowerCase()));

  const persona = activeNPC 
    ? `Nome: ${activeNPC.name}. Desc: ${activeNPC.descriptor}. Humor: ${activeNPC.status}.`
    : knownNPC 
      ? `Nome: ${knownNPC.id}. Desc: ${knownNPC.description}.`
      : `Nome: ${npcName}.`;

  const context = `
  [LOCAL]: ${gameState.player.location}
  [JOGADOR]: ${gameState.player.name}
  [INSTRUÇÃO]: "${instruction}"
  `;

  try {
    let speech = await GeminiClient.generateText(
      AI_MODELS.FAST,
      `PERSONA:\n${persona}\n${context}\nGere APENAS a fala.`,
      DIALOGUE_AGENT_INSTRUCTION
    );
    
    speech = speech.trim();
    if (!speech.startsWith('"') && !speech.startsWith('—')) {
        speech = `"${speech}"`;
    }
    return speech;

  } catch (e) {
    console.error(`Erro diálogo ${npcName}`, e);
    return `"${instruction}"`;
  }
};

export const resolveDialogueTags = async (
  narrativeText: string,
  gameState: GameState
): Promise<string> => {
  const tagRegex = /\[\[DIALOGUE:\s*(.+?)\s*\|\s*(.+?)\]\]/g;
  let match;
  const replacements: { start: number; end: number; promise: Promise<string> }[] = [];

  while ((match = tagRegex.exec(narrativeText)) !== null) {
    const [fullTag, npcName, instruction] = match;
    replacements.push({
      start: match.index,
      end: match.index + fullTag.length,
      promise: generateDialogueLine(npcName, instruction, gameState)
    });
  }

  if (replacements.length === 0) return narrativeText;

  const results = await Promise.all(replacements.map(r => r.promise));

  let finalNarrative = narrativeText;
  for (let i = replacements.length - 1; i >= 0; i--) {
    const { start, end } = replacements[i];
    finalNarrative = finalNarrative.substring(0, start) + results[i] + finalNarrative.substring(end);
  }

  return finalNarrative;
};
