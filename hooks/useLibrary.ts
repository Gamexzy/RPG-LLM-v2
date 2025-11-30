
import { useState, useEffect } from 'react';
import { UniverseTemplate, CharacterTemplate } from '../types';

export const useLibrary = () => {
  const [universes, setUniverses] = useState<UniverseTemplate[]>([]);
  const [characters, setCharacters] = useState<CharacterTemplate[]>([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedUniverses = localStorage.getItem('cronos_universes');
    const savedCharacters = localStorage.getItem('cronos_characters');

    if (savedUniverses) setUniverses(JSON.parse(savedUniverses));
    if (savedCharacters) setCharacters(JSON.parse(savedCharacters));
  }, []);

  // Save Helpers
  const saveUniversesToStorage = (list: UniverseTemplate[]) => {
    localStorage.setItem('cronos_universes', JSON.stringify(list));
    setUniverses(list);
  };

  const saveCharactersToStorage = (list: CharacterTemplate[]) => {
    localStorage.setItem('cronos_characters', JSON.stringify(list));
    setCharacters(list);
  };

  // Actions
  const addUniverse = (template: Omit<UniverseTemplate, 'id' | 'createdAt'>) => {
    const newUni: UniverseTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    saveUniversesToStorage([...universes, newUni]);
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

  return {
    universes,
    characters,
    addUniverse,
    deleteUniverse,
    addCharacter,
    deleteCharacter
  };
};
