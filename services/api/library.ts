
import { UniverseTemplate, CharacterTemplate, AdventureRecord } from "../../types";
import { apiClient } from "./core";

export const fetchUserLibrary = async (userId: string) => {
  try {
    return await apiClient.get<any>(`/library/${userId}`);
  } catch (error) {
    console.warn("Offline: Não foi possível baixar a biblioteca do servidor.");
    return null;
  }
};

export const syncUniverse = async (userId: string, universe: UniverseTemplate) => {
  try {
    await apiClient.post('/library/universe', { userId, ...universe });
  } catch (e) { 
    console.warn("Sync Universe failed (Modo Offline)"); 
  }
};

export const syncCharacter = async (userId: string, character: CharacterTemplate) => {
  try {
    await apiClient.post('/library/character', { userId, ...character });
  } catch (e) { 
    console.warn("Sync Character failed (Modo Offline)"); 
  }
};

export const syncAdventureMetadata = async (userId: string, adventure: AdventureRecord) => {
  try {
    await apiClient.post('/library/adventure', { userId, ...adventure });
  } catch (e) { 
    console.warn("Sync Adventure failed (Modo Offline)"); 
  }
};
