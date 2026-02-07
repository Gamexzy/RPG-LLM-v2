
import { UniverseTemplate, CharacterTemplate, AdventureRecord, GraphEdge } from "../../types";
import { apiClient } from "./core";

// --- Helpers de Sanitização (DTOs) ---
// Garante que o objeto enviado ao backend tenha TODOS os campos esperados,
// convertendo undefined para defaults seguros ([], "", null) e datas para ISO String.

const sanitizeUniverse = (u: UniverseTemplate) => ({
    id: u.id,
    userId: u.userId,
    name: u.name,
    description: u.description || "",
    genre: u.genre,
    image: u.image || null,
    
    // Arrays: Garante [] ao invés de undefined
    physics: u.physics || [],
    knownTruths: u.knownTruths || [],
    chronicles: u.chronicles || [],
    champions: u.champions || [],
    worlds: u.worlds || [],
    
    // Enums e Strings Opcionais
    structure: u.structure || 'singular_world',
    navigationMethod: u.navigationMethod || 'physical',
    magicSystem: u.magicSystem || "",
    cosmology: u.cosmology || "",
    
    // Data: Garante ISO String (Python prefere ISO a Timestamp numérico)
    createdAt: new Date(u.createdAt || Date.now()).toISOString()
});

const sanitizeCharacter = (c: CharacterTemplate) => ({
    id: c.id,
    userId: c.userId,
    name: c.name,
    description: c.description || "",
    archetype: c.archetype,
    image: c.image || null,
    stats: c.stats || {},
    adventuresPlayed: c.adventuresPlayed || 0,
    createdAt: new Date(c.createdAt || Date.now()).toISOString()
});

const sanitizeAdventure = (a: AdventureRecord) => ({
    id: a.id,
    userId: a.userId,
    universeId: a.universeId,
    characterId: a.characterId,
    name: a.name,
    description: a.description || "",
    currentStep: a.currentStep || "",
    
    // Legacy fields (Garante string vazia se faltar)
    characterName: a.characterName || "",
    universeName: a.universeName || "",
    universeGenre: a.universeGenre || "",
    lastLocation: a.lastLocation || "",
    
    startDate: new Date(a.startDate || Date.now()).toISOString(),
    createdAt: new Date(a.createdAt || Date.now()).toISOString()
});

// --- Endpoints ---

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
    const data = sanitizeUniverse({ ...universe, userId });
    
    // [NOVO] Graph Context: Cria o nó do Universo imediatamente no Neo4j
    const payload = {
        ...data,
        graphContext: [
            { source: universe.name, relation: "HAS_GENRE", target: universe.genre },
            { source: universe.name, relation: "TYPE_OF", target: "Universe" }
        ]
    };
    await apiClient.post('/library/universe', payload);
  } catch (e) { 
    console.warn("Sync Universe failed", e); 
  }
};

export const syncCharacter = async (userId: string, character: CharacterTemplate) => {
  try {
    const data = sanitizeCharacter({ ...character, userId });
    
    // [NOVO] Graph Context: Garante que o nó do Personagem exista antes do jogo começar
    // Isso resolve o problema de "personagem não gerado no servidor de grafos"
    const payload = {
        ...data,
        graphContext: [
            { source: character.name, relation: "IS_A", target: character.archetype },
            { source: character.name, relation: "TYPE_OF", target: "Character" }
            // O Backend deve ligar User -> CREATED -> Character baseado no userId do payload
        ]
    };
    await apiClient.post('/library/character', payload);
  } catch (e) { 
    console.warn("Sync Character failed", e); 
  }
};

export const syncAdventureMetadata = async (userId: string, adventure: AdventureRecord) => {
  try {
    const data = sanitizeAdventure({ ...adventure, userId });

    // [NOVO] Graph Context: Resolve o erro de log "relationship type PLAYS does not exist"
    const payload = {
        ...data,
        graphContext: [
             { source: userId, relation: "PLAYS", target: adventure.id }, // O Backend deve tratar 'userId' como lookup do nó User
             { source: adventure.id, relation: "OCCURS_IN", target: adventure.universeName },
             { source: adventure.id, relation: "STARRING", target: adventure.characterName }
        ]
    };
    await apiClient.post('/library/adventure', payload);
  } catch (e) { 
    console.warn("Sync Adventure failed", e); 
  }
};
