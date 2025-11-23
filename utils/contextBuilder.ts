import { GameState } from "../types";

export const getSimulationHistory = (history: GameState['history']) => {
  return history
    .filter(h => h.type !== 'debug')
    .slice(-5)
    .map(h => {
      if (h.type === 'investigation') return `Pensamento: ${h.text}`;
      return `${h.role === 'user' ? 'Ação' : 'Situação'}: ${h.text}`;
    })
    .join("\n");
};

export const getKnowledgeContext = (kb: GameState['knowledgeBase']) => {
  const activeQuests = kb.quests.filter(q => q.status === 'active').map(q => `- [QUEST] ${q.title}: ${q.description}`).join("\n");
  const nearbyNPCs = kb.characters.slice(-5).map(c => `- [NPC] ${c.id}: ${c.description} (${c.status})`).join("\n");
  return `[QUESTS]:\n${activeQuests}\n[NPCS CONHECIDOS]:\n${nearbyNPCs}`;
};
