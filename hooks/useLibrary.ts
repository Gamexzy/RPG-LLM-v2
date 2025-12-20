
import { useState, useEffect } from 'react';
import { UniverseTemplate, CharacterTemplate, TimelineEvent, AdventureRecord } from '../types';

const DEFAULT_UNIVERSES: UniverseTemplate[] = [
  {
    id: 'uni-veridia',
    name: 'Cosmos de Veridia',
    description: 'Um universo onde a entropia parou. As estrelas não morrem, mas a vida orgânica apodrece rapidamente.',
    genre: 'Cyberpunk Nihilista',
    structure: 'star_cluster', // GALÁXIA
    navigationMethod: 'interstellar_ship', // NAVES
    physics: ['A entropia é estática (nada esfria)', 'A consciência gera um campo elétrico mensurável'],
    magicSystem: 'Tecnologia da Alma: Manipulação de fantasmas através de circuitos.',
    cosmology: 'Um aglomerado denso de sistemas solares artificiais ligados por cabos de dados interestelares.',
    knownTruths: [],
    champions: [],
    worlds: [
        { name: "Neo-Veridia Prime", description: "O planeta capital, coberto por chuva ácida e neon." },
        { name: "Setor 7 (Lixão Orbital)", description: "Uma lua artificial feita de naves descartadas." }
    ],
    chronicles: [
      { year: 'Era Zero', event: 'O Big Bang Congelado.' },
      { year: 'Ciclo 4000', event: 'A Ascensão das Máquinas Espirituais.' }
    ],
    createdAt: 1715420000000
  },
  {
    id: 'uni-eldoria',
    name: 'Planos de Eldoria',
    description: 'Um multiverso de "ilhas" flutuando no Vazio. A realidade é fluida.',
    genre: 'High Fantasy',
    structure: 'singular_world', // MUNDO PLANO/INFINITO
    navigationMethod: 'physical', // FÍSICO/MÁGICO
    physics: ['A gravidade é subjetiva à força de vontade', 'O Vazio consome matéria sem alma'],
    magicSystem: 'Aether Corrompido: Magia vem de rasgar a realidade, o que atrai monstros.',
    cosmology: 'Arquipélago Astral: Ilhas de matéria flutuando num mar infinito de nada.',
    knownTruths: [],
    champions: [
      { characterName: "Arthos, o Primeiro", feat: "Descobriu o fogo mágico", date: "Era Antiga", status: "Myth" }
    ],
    worlds: [
        { name: "Ilha de Ferro", description: "Uma fortaleza humana industrializada." },
        { name: "Floresta dos Sussurros", description: "Um plano onde as árvores falam." }
    ],
    chronicles: [
      { year: 'Era Dourada', event: 'Os Deuses forjaram as Ilhas.' },
      { year: 'A Queda', event: 'Uma ilha maior caiu, criando o Abismo.' }
    ],
    createdAt: 1715420000000
  }
];

const DEFAULT_CHARACTERS: CharacterTemplate[] = [
  {
    id: 'char-kael',
    name: 'Kael',
    description: 'Um ator focado em papéis de sobrevivência e combate. Possui uma natureza estóica e cínica.',
    archetype: 'O Sobrevivente',
    adventuresPlayed: 1,
    createdAt: 1715420000000
  },
  {
    id: 'char-elara',
    name: 'Elara',
    description: 'Uma intelectual obcecada por desvendar segredos. Adapta-se bem a papéis de cientista, maga ou detetive.',
    archetype: 'A Investigadora',
    adventuresPlayed: 0,
    createdAt: 1715420000000
  }
];

export const useLibrary = () => {
  const [universes, setUniverses] = useState<UniverseTemplate[]>([]);
  const [characters, setCharacters] = useState<CharacterTemplate[]>([]);
  const [adventures, setAdventures] = useState<AdventureRecord[]>([]);

  // Save Helpers
  const saveUniversesToStorage = (list: UniverseTemplate[]) => {
    localStorage.setItem('cronos_universes', JSON.stringify(list));
    setUniverses(list);
  };

  const saveCharactersToStorage = (list: CharacterTemplate[]) => {
    localStorage.setItem('cronos_characters', JSON.stringify(list));
    setCharacters(list);
  };

  const saveAdventuresToStorage = (list: AdventureRecord[]) => {
    localStorage.setItem('cronos_adventures', JSON.stringify(list));
    setAdventures(list);
  };

  // Load from LocalStorage on mount (or seed defaults)
  useEffect(() => {
    const savedUniverses = localStorage.getItem('cronos_universes');
    const savedCharacters = localStorage.getItem('cronos_characters');
    const savedAdventures = localStorage.getItem('cronos_adventures');

    if (savedUniverses) {
      setUniverses(JSON.parse(savedUniverses));
    } else {
      saveUniversesToStorage(DEFAULT_UNIVERSES);
    }

    if (savedCharacters) {
      setCharacters(JSON.parse(savedCharacters));
    } else {
      saveCharactersToStorage(DEFAULT_CHARACTERS);
    }

    if (savedAdventures) {
        setAdventures(JSON.parse(savedAdventures));
    }
  }, []);

  // Actions
  const addUniverse = (template: Omit<UniverseTemplate, 'id' | 'createdAt'>) => {
    const newUni: UniverseTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    saveUniversesToStorage([...universes, newUni]);
  };

  /**
   * EVOLVE UNIVERSE: 
   * Updates the Universe definition with new truths, history, legends AND NEW WORLDS.
   */
  const evolveUniverse = (universeId: string, updates: { 
    newEvents?: string[], 
    newTruths?: string[], 
    champion?: { name: string, feat: string },
    newWorld?: { name: string, description: string }
  }) => {
    const updatedList = universes.map(u => {
      if (u.id !== universeId) return u;

      const newTimeline: TimelineEvent[] = updates.newEvents 
        ? updates.newEvents.map(e => ({ year: 'Presente', event: e, era: 'Era do Jogador' })) 
        : [];
      
      const newChampion = updates.champion 
        ? [{ characterName: updates.champion.name, feat: updates.champion.feat, date: new Date().toISOString(), status: 'Legend' as const }] 
        : [];

      // Add new world if it doesn't exist yet
      let updatedWorlds = u.worlds || [];
      if (updates.newWorld && !updatedWorlds.some(w => w.name.toLowerCase() === updates.newWorld!.name.toLowerCase())) {
          updatedWorlds = [...updatedWorlds, updates.newWorld];
      }

      return {
        ...u,
        knownTruths: [...(u.knownTruths || []), ...(updates.newTruths || [])], 
        chronicles: [...(u.chronicles || []), ...newTimeline], 
        champions: [...(u.champions || []), ...newChampion],
        worlds: updatedWorlds
      };
    });
    
    saveUniversesToStorage(updatedList);
  };

  const trackCharacterUsage = (characterId: string) => {
      const updatedList = characters.map(c => {
          if (c.id === characterId) {
              return { ...c, adventuresPlayed: (c.adventuresPlayed || 0) + 1 };
          }
          return c;
      });
      saveCharactersToStorage(updatedList);
  };

  // --- Adventure History Methods ---
  
  const addAdventureRecord = (u: UniverseTemplate, c: CharacterTemplate) => {
      const newRecord: AdventureRecord = {
          id: crypto.randomUUID(),
          characterName: c.name,
          universeName: u.name,
          universeGenre: u.genre,
          startDate: Date.now(),
          lastLocation: 'Início da Jornada'
      };
      // Prepend to show newest first
      saveAdventuresToStorage([newRecord, ...adventures]);
  };

  const deleteAdventureRecord = (id: string) => {
      saveAdventuresToStorage(adventures.filter(a => a.id !== id));
  };

  const deleteUniverse = (id: string) => {
    saveUniversesToStorage(universes.filter(u => u.id !== id));
  };

  const addCharacter = (template: Omit<CharacterTemplate, 'id' | 'createdAt'>) => {
    const newChar: CharacterTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    saveCharactersToStorage([...characters, newChar]);
  };

  const deleteCharacter = (id: string) => {
    saveCharactersToStorage(characters.filter(c => c.id !== id));
  };

  const restoreDefaults = () => {
    saveUniversesToStorage(DEFAULT_UNIVERSES);
    saveCharactersToStorage(DEFAULT_CHARACTERS);
    saveAdventuresToStorage([]);
  };

  return {
    universes,
    characters,
    adventures, // Exported
    addUniverse,
    evolveUniverse,
    trackCharacterUsage,
    addAdventureRecord, // Exported
    deleteAdventureRecord, // Exported
    deleteUniverse,
    addCharacter,
    deleteCharacter,
    restoreDefaults
  };
};
