import { GameState, SimulationResponse } from "../types";

export const mergeKnowledge = (
  current: GameState['knowledgeBase'], 
  updates: SimulationResponse['knowledgeUpdate']
): GameState['knowledgeBase'] => {
  if (!updates) return current;

  const newKB = { ...current };

  // Helper generic upsert
  const upsert = <T extends { id: string }>(list: T[], newItems?: T[]) => {
    if (!newItems) return list;
    const map = new Map(list.map(item => [item.id, item]));
    newItems.forEach(item => map.set(item.id, item));
    return Array.from(map.values());
  };

  newKB.characters = upsert(newKB.characters, updates.characters);
  newKB.locations = upsert(newKB.locations, updates.locations);
  newKB.lore = upsert(newKB.lore, updates.lore);
  newKB.quests = upsert(newKB.quests, updates.quests);

  return newKB;
};
