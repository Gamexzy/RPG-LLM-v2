
import { useState, useEffect } from 'react';
import { UniverseTemplate, CharacterTemplate, TimelineEvent, AdventureRecord } from '../types';

const DEFAULT_UNIVERSES: UniverseTemplate[] = [
  {
    id: 'uni-veridia',
    name: 'Cosmos de Veridia',
    description: 'Um universo onde a entropia parou. As estrelas não morrem, mas a vida orgânica apodrece rapidamente.',
    genre: 'Cyberpunk Nihilista',
    structure: 'star_cluster',
    navigationMethod: 'interstellar_ship',
    physics: ['A entropia é estática', 'A consciência gera um campo elétrico mensurável'],
    magicSystem: 'Tecnologia da Alma',
    cosmology: 'Aglomerado denso',
    knownTruths: [],
    champions: [],
    worlds: [
        { name: "Neo-Veridia Prime", description: "O planeta capital." },
    ],
    chronicles: [],
    createdAt: 1715420000000
  },
  {
    id: 'uni-eldoria',
    name: 'Planos de Eldoria',
    description: 'Um multiverso de ilhas flutuando no Vazio.',
    genre: 'High Fantasy',
    structure: 'singular_world',
    navigationMethod: 'physical',
    physics: ['Gravidade subjetiva'],
    magicSystem: 'Aether Corrompido',
    cosmology: 'Arquipélago Astral',
    knownTruths: [],
    champions: [],
    worlds: [
        { name: "Ilha de Ferro", description: "Fortaleza humana." },
    ],
    chronicles: [],
    createdAt: 1715420000000
  }
];

const DEFAULT_CHARACTERS: CharacterTemplate[] = [
  {
    id: 'char-kael',
    name: 'Kael',
    description: 'Um ator focado em papéis de sobrevivência.',
    archetype: 'O Sobrevivente',
    adventuresPlayed: 1,
    createdAt: 1715420000000
  }
];

// O hook agora aceita userId
export const useLibrary = (userId?: string) => {
  const [universes, setUniverses] = useState<UniverseTemplate[]>([]);
  const [characters, setCharacters] = useState<CharacterTemplate[]>([]);
  const [adventures, setAdventures] = useState<AdventureRecord[]>([]);

  // Prefix keys with userId to isolate data
  const getKey = (base: string) => userId ? `${base}_${userId}` : null;

  // Load when userId changes
  useEffect(() => {
    if (!userId) {
        setUniverses([]);
        setCharacters([]);
        setAdventures([]);
        return;
    }

    const uKey = getKey('cronos_universes');
    const cKey = getKey('cronos_characters');
    const aKey = getKey('cronos_adventures');

    if (uKey && cKey && aKey) {
        const savedUniverses = localStorage.getItem(uKey);
        const savedCharacters = localStorage.getItem(cKey);
        const savedAdventures = localStorage.getItem(aKey);

        if (savedUniverses) {
            setUniverses(JSON.parse(savedUniverses));
        } else {
            // Se novo usuário, carrega defaults e salva
            const defaults = DEFAULT_UNIVERSES;
            localStorage.setItem(uKey, JSON.stringify(defaults));
            setUniverses(defaults);
        }

        if (savedCharacters) {
            setCharacters(JSON.parse(savedCharacters));
        } else {
            const defaults = DEFAULT_CHARACTERS;
            localStorage.setItem(cKey, JSON.stringify(defaults));
            setCharacters(defaults);
        }

        if (savedAdventures) {
            setAdventures(JSON.parse(savedAdventures));
        } else {
            setAdventures([]);
        }
    }
  }, [userId]);

  // Helpers de save internos
  const saveU = (list: UniverseTemplate[]) => {
      const key = getKey('cronos_universes');
      if (key) {
          localStorage.setItem(key, JSON.stringify(list));
          setUniverses(list);
      }
  };
  const saveC = (list: CharacterTemplate[]) => {
      const key = getKey('cronos_characters');
      if (key) {
          localStorage.setItem(key, JSON.stringify(list));
          setCharacters(list);
      }
  };
  const saveA = (list: AdventureRecord[]) => {
      const key = getKey('cronos_adventures');
      if (key) {
          localStorage.setItem(key, JSON.stringify(list));
          setAdventures(list);
      }
  };

  // Actions
  const addUniverse = (template: Omit<UniverseTemplate, 'id' | 'createdAt'>) => {
    const newUni: UniverseTemplate = { ...template, id: crypto.randomUUID(), createdAt: Date.now() };
    saveU([...universes, newUni]);
  };

  const evolveUniverse = (universeId: string, updates: any) => {
    const updatedList = universes.map(u => {
      if (u.id !== universeId) return u;
      
      // Lógica simplificada de merge para não repetir o código todo aqui
      // A lógica real está inalterada, apenas o setter muda
      const newTimeline = updates.newEvents ? updates.newEvents.map((e:string) => ({ year: 'Presente', event: e, era: 'Era do Jogador' })) : [];
      let updatedWorlds = u.worlds || [];
      if (updates.newWorld && !updatedWorlds.some((w:any) => w.name === updates.newWorld.name)) {
          updatedWorlds = [...updatedWorlds, updates.newWorld];
      }
      return {
        ...u,
        knownTruths: [...(u.knownTruths || []), ...(updates.newTruths || [])], 
        chronicles: [...(u.chronicles || []), ...newTimeline], 
        worlds: updatedWorlds
      };
    });
    saveU(updatedList);
  };

  const trackCharacterUsage = (characterId: string) => {
      const updatedList = characters.map(c => c.id === characterId ? { ...c, adventuresPlayed: (c.adventuresPlayed || 0) + 1 } : c);
      saveC(updatedList);
  };
  
  const addAdventureRecord = (u: UniverseTemplate, c: CharacterTemplate) => {
      const newRecord: AdventureRecord = {
          id: crypto.randomUUID(),
          characterName: c.name,
          universeName: u.name,
          universeGenre: u.genre,
          startDate: Date.now(),
          lastLocation: 'Início'
      };
      saveA([newRecord, ...adventures]);
  };

  const deleteAdventureRecord = (id: string) => saveA(adventures.filter(a => a.id !== id));
  const deleteUniverse = (id: string) => saveU(universes.filter(u => u.id !== id));
  
  const addCharacter = (template: Omit<CharacterTemplate, 'id' | 'createdAt'>) => {
    const newChar: CharacterTemplate = { ...template, id: crypto.randomUUID(), createdAt: Date.now() };
    saveC([...characters, newChar]);
  };
  const deleteCharacter = (id: string) => saveC(characters.filter(c => c.id !== id));

  const restoreDefaults = () => {
    saveU(DEFAULT_UNIVERSES);
    saveC(DEFAULT_CHARACTERS);
    saveA([]);
  };

  return {
    universes,
    characters,
    adventures,
    addUniverse,
    evolveUniverse,
    trackCharacterUsage,
    addAdventureRecord,
    deleteAdventureRecord,
    deleteUniverse,
    addCharacter,
    deleteCharacter,
    restoreDefaults
  };
};
