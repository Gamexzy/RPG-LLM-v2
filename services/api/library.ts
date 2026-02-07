
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
    
    // [FIX] Graph Context: Usa 'source' e 'target' pois o backend helper (process_graph_context)
    // faz o mapeamento interno de source->subject e target->object.
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
    
    // [FIX] Graph Context: Usa 'source' e 'target' compatível com library.py
    const payload = {
        ...data,
        graphContext: [
            { source: character.name, relation: "IS_A", target: character.archetype },
            { source: character.name, relation: "TYPE_OF", target: "Character" }
        ]
    };
    await apiClient.post('/library/character', payload);
  } catch (e: any) { 
    console.error(`Sync Character failed [${character.name}]:`, e.message || e); 
  }
};

export const syncAdventureMetadata = async (userId: string, adventure: AdventureRecord) => {
  try {
    const data = sanitizeAdventure({ ...adventure, userId });

    // [FIX] Limpeza de Arestas:
    // Não enviamos mais graphContext aqui. O Backend (library.py/save_adventure) já cria
    // as arestas estruturais (PLAYS, HAPPENS_IN, USES_TEMPLATE) usando IDs reais via Cypher.
    // Enviar 'graphContext' com nomes (strings) criava nós duplicados e poluição visual no grafo.
    const payload = {
        ...data,
        graphContext: [] 
    };
    await apiClient.post('/library/adventure', payload);
  } catch (e) { 
    console.warn("Sync Adventure failed", e); 
  }
};
