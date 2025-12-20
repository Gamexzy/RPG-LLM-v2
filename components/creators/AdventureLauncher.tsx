
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

  const activeUniverse = selectedUniverse ? getUniverse(selectedUniverse) : null;

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
        
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-stone-900 pb-4 gap-4">
            <div>
                <h2 className="text-4xl font-serif text-stone-200 tracking-tight">O Nexus</h2>
                <p className="text-stone-600 text-xs uppercase tracking-widest mt-2">Escolha o Palco e o Ator. O destino decidirá o cenário inicial.</p>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[500px]">
            
             {/* COLUMN 1: UNIVERSE SELECTION (STAGE) */}
             <div className="space-y-4 flex flex-col h-full border-r border-stone-900 pr-8">
                <h3 className="text-amber-900 text-[10px] uppercase tracking-widest border-b border-stone-900 pb-2">1. Escolha o Palco (Universo)</h3>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-full custom-scrollbar pr-2">
                    {universes.length === 0 && (
                        <div className="p-8 border border-dashed border-stone-800 text-center text-stone-600 text-xs italic">
                            Nenhum palco construído.<br/>Crie um universo na biblioteca.
                        </div>
                    )}
                    {universes.map(u => (
                        <button
                            key={u.id}
                            onClick={() => setSelectedUniverse(u.id)}
                            className={`w-full text-left p-4 rounded-sm border transition-all ${
                                selectedUniverse === u.id 
                                ? 'bg-stone-800 border-stone-600' 
                                : 'bg-stone-900/30 border-stone-800 hover:bg-stone-900'
                            }`}
                        >
                            <div className="flex justify-between mb-1">
                                <span className={`font-serif text-lg ${selectedUniverse === u.id ? 'text-stone-200' : 'text-stone-400'}`}>
                                    {u.name}
                                </span>
                                <span className="text-[9px] uppercase border border-stone-700 px-1 rounded text-stone-500">
                                    {u.structure === 'star_cluster' ? 'Galáxia' : 'Mundo'}
                                </span>
                            </div>
                            <p className="text-stone-500 text-xs line-clamp-2">{u.description}</p>
                            
                            <div className="mt-3 flex gap-2 flex-wrap">
                                {(u.chronicles && u.chronicles.length > 0) && (
                                    <span className="text-[9px] bg-stone-950 text-cyan-600 border border-stone-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        ⏳ {u.chronicles.length} Eventos Históricos
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* COLUMN 2: CHARACTER SELECTION (ACTOR) */}
            <div className="space-y-4 flex flex-col h-full pl-2">
                <h3 className="text-amber-900 text-[10px] uppercase tracking-widest border-b border-stone-900 pb-2">2. Escale o Ator</h3>
                
                <div className="space-y-3 flex-1 overflow-y-auto max-h-full custom-scrollbar">
                    {characters.length === 0 && (
                            <div className="p-4 text-stone-700 text-xs italic border border-dashed border-stone-900">
                            Nenhum ator disponível.<br/>Crie um personagem.
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
                                {(c.adventuresPlayed || 0) > 0 && (
                                    <span className="text-[9px] text-stone-500" title="Aventuras jogadas">
                                    ↺ {c.adventuresPlayed}
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[10px] uppercase tracking-wider text-stone-500 border border-stone-800 px-2 rounded-full">
                                    Papel: {c.archetype}
                                </span>
                            </div>
                             <p className="text-stone-600 text-xs mt-2 line-clamp-2 italic">"{c.description}"</p>
                        </button>
                    ))}
                </div>
            </div>

        </div>

        {/* START BUTTON */}
        <div className="pt-8 border-t border-stone-900 text-center">
            {activeUniverse && selectedCharacter && (
                <div className="mb-4 text-xs text-stone-500 font-mono animate-fade-in">
                    [CONFIGURAÇÃO]: {activeUniverse.name} :: {getCharacter(selectedCharacter)?.name} :: LOCALIZAÇÃO_AUTO
                </div>
            )}
            <button
                onClick={handleStart}
                disabled={!selectedUniverse || !selectedCharacter}
                className="px-16 py-5 bg-stone-100 text-stone-950 font-serif tracking-widest uppercase hover:bg-amber-500 transition-colors disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] text-lg"
            >
                Materializar
            </button>
        </div>

      </div>
    </div>
  );
};

export default AdventureLauncher;
