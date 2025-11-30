import React, { useState } from 'react';
import { UniverseTemplate, CharacterTemplate } from '../../types';

interface AdventureLauncherProps {
  universes: UniverseTemplate[];
  characters: CharacterTemplate[];
  onStartAdventure: (universe: UniverseTemplate, character: CharacterTemplate) => void;
  onCancel: () => void;
}

const AdventureLauncher: React.FC<AdventureLauncherProps> = ({ universes, characters, onStartAdventure, onCancel }) => {
  const [selectedUniverse, setSelectedUniverse] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  const getUniverse = (id: string) => universes.find(u => u.id === id);
  const getCharacter = (id: string) => characters.find(c => c.id === id);

  const handleStart = () => {
    if (selectedUniverse && selectedCharacter) {
      const u = getUniverse(selectedUniverse);
      const c = getCharacter(selectedCharacter);
      if (u && c) onStartAdventure(u, c);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-stone-950 animate-fade-in overflow-y-auto pb-24">
      <div className="max-w-5xl w-full mx-auto space-y-8">
        
        <header className="flex items-center justify-between border-b border-stone-900 pb-4">
            <div>
                <h2 className="text-3xl font-serif text-stone-200 tracking-tight">Nova Aventura</h2>
                <p className="text-stone-600 text-xs uppercase tracking-widest mt-2">Sintonizando realidade...</p>
            </div>
            {/* Back button removed as navigation is handled by bottom bar */}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* COLUMN 1: UNIVERSE SELECTION */}
            <div className="space-y-4">
                <h3 className="text-amber-900 text-[10px] uppercase tracking-widest border-b border-stone-900 pb-2">Selecione a Realidade</h3>
                <div className="space-y-3">
                    {universes.length === 0 && (
                        <div className="p-8 border border-dashed border-stone-800 text-center text-stone-600 text-xs italic">
                            Nenhum universo encontrado na biblioteca. <br/>
                            Crie um na aba 'Universos'.
                        </div>
                    )}
                    {universes.map(u => (
                        <button
                            key={u.id}
                            onClick={() => setSelectedUniverse(u.id)}
                            className={`w-full text-left p-4 rounded-sm border transition-all ${
                                selectedUniverse === u.id 
                                ? 'bg-amber-900/20 border-amber-700' 
                                : 'bg-stone-900/30 border-stone-800 hover:bg-stone-900'
                            }`}
                        >
                            <div className="flex justify-between mb-1">
                                <span className={`font-serif text-lg ${selectedUniverse === u.id ? 'text-amber-500' : 'text-stone-300'}`}>
                                    {u.name}
                                </span>
                                <span className="text-[9px] uppercase tracking-wider text-stone-600 border border-stone-800 px-1 rounded h-fit self-center">
                                    {u.genre}
                                </span>
                            </div>
                            <p className="text-stone-500 text-xs line-clamp-2">{u.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* COLUMN 2: CHARACTER SELECTION */}
            <div className="space-y-4">
                <h3 className="text-amber-900 text-[10px] uppercase tracking-widest border-b border-stone-900 pb-2">Selecione o Receptáculo</h3>
                <div className="space-y-3">
                    {characters.length === 0 && (
                        <div className="p-8 border border-dashed border-stone-800 text-center text-stone-600 text-xs italic">
                            Nenhum personagem encontrado na biblioteca. <br/>
                            Crie um na aba 'Personagens'.
                        </div>
                    )}
                    {characters.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedCharacter(c.id)}
                            className={`w-full text-left p-4 rounded-sm border transition-all ${
                                selectedCharacter === c.id 
                                ? 'bg-amber-900/20 border-amber-700' 
                                : 'bg-stone-900/30 border-stone-800 hover:bg-stone-900'
                            }`}
                        >
                            <div className="flex justify-between mb-1">
                                <span className={`font-serif text-lg ${selectedCharacter === c.id ? 'text-amber-500' : 'text-stone-300'}`}>
                                    {c.name}
                                </span>
                                <span className="text-[9px] uppercase tracking-wider text-stone-600 border border-stone-800 px-1 rounded h-fit self-center">
                                    {c.archetype}
                                </span>
                            </div>
                            <p className="text-stone-500 text-xs line-clamp-2">{c.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* START BUTTON */}
        <div className="pt-8 border-t border-stone-900 text-center">
            <button
                onClick={handleStart}
                disabled={!selectedUniverse || !selectedCharacter}
                className="px-12 py-4 bg-stone-100 text-stone-950 font-serif tracking-widest uppercase hover:bg-amber-500 transition-colors disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
                Iniciar Simulação
            </button>
            
            {(!selectedUniverse || !selectedCharacter) && (
                <p className="text-stone-700 text-[10px] uppercase tracking-wider mt-4 animate-pulse">
                    Aguardando sincronização de parâmetros...
                </p>
            )}
        </div>

      </div>
    </div>
  );
};

export default AdventureLauncher;