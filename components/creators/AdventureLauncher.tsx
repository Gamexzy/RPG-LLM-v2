
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
  const activeCharacter = selectedCharacter ? getCharacter(selectedCharacter) : null;

  const handleStart = () => {
    if (activeUniverse && activeCharacter) {
      onStartAdventure(activeUniverse, activeCharacter);
    }
  };

  return (
    // FIX: Removido pb-24/pb-6 pois o GameLayout agora usa margin-bottom (mb-16) para proteger a área
    <div className="flex-1 flex flex-col p-6 animate-fade-in overflow-y-auto md:overflow-hidden">
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 max-w-7xl w-full mx-auto h-full">
        
        {/* ESQUERDA: Resumo e Ação */}
        <div className="md:w-1/3 flex flex-col h-full max-h-full">
            
            {/* Área de Conteúdo Scrollável */}
            <div className="flex-1 overflow-y-auto custom-scrollbar md:pr-2 min-h-0">
                <h2 className="text-4xl md:text-6xl font-serif text-stone-200 tracking-tight leading-none">O Nexus</h2>
                <div className="h-px w-16 bg-amber-900/50 mt-4 mb-2"></div>
                <p className="text-stone-500 text-xs uppercase tracking-widest mb-6">
                    Início da Jornada
                </p>
                
                <div className="space-y-6 mt-8 md:mt-12 mb-4">
                     <div className={`p-4 border-l-2 transition-all ${activeUniverse ? 'border-amber-500 bg-stone-900/40' : 'border-stone-800'}`}>
                         <span className="text-[10px] uppercase text-stone-600 block mb-1">Palco</span>
                         <span className={`font-serif text-xl ${activeUniverse ? 'text-stone-200' : 'text-stone-700 italic'}`}>
                             {activeUniverse ? activeUniverse.name : "Selecione um Universo"}
                         </span>
                     </div>
                     <div className={`p-4 border-l-2 transition-all ${activeCharacter ? 'border-amber-500 bg-stone-900/40' : 'border-stone-800'}`}>
                         <span className="text-[10px] uppercase text-stone-600 block mb-1">Ator</span>
                         <span className={`font-serif text-xl ${activeCharacter ? 'text-stone-200' : 'text-stone-700 italic'}`}>
                             {activeCharacter ? activeCharacter.name : "Selecione um Personagem"}
                         </span>
                     </div>
                </div>
            </div>

            {/* Área do Botão Fixa no Rodapé da Coluna */}
            <div className="mt-4 shrink-0 pt-4 border-t border-stone-800/30">
                <button
                    onClick={handleStart}
                    disabled={!selectedUniverse || !selectedCharacter}
                    className="w-full py-6 bg-stone-100 text-stone-950 font-serif tracking-widest uppercase hover:bg-amber-500 transition-colors disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] text-lg"
                >
                    Materializar
                </button>
            </div>
        </div>

        {/* DIREITA: Colunas de Seleção */}
        <div className="md:w-2/3 md:border-l md:border-stone-800 md:pl-12 flex flex-col md:flex-row gap-8 md:h-full md:overflow-hidden">
            
             {/* COLUNA 1: UNIVERSOS */}
             <div className="flex-1 flex flex-col h-[400px] md:h-full">
                <h3 className="text-amber-900 text-[10px] uppercase tracking-widest border-b border-stone-900 pb-2 mb-4 shrink-0">Biblioteca de Mundos</h3>
                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar md:pr-2 min-h-0">
                    {universes.length === 0 && (
                        <div className="p-8 border border-dashed border-stone-800 text-center text-stone-600 text-xs italic">
                            Vazio.
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
                                <span className={`font-serif text-base ${selectedUniverse === u.id ? 'text-stone-200' : 'text-stone-400'}`}>
                                    {u.name}
                                </span>
                            </div>
                            <span className="text-[9px] uppercase border border-stone-800 px-1 rounded text-stone-500">
                                {u.genre}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* COLUNA 2: PERSONAGENS */}
            <div className="flex-1 flex flex-col h-[400px] md:h-full md:border-l md:border-stone-900 md:pl-8">
                <h3 className="text-amber-900 text-[10px] uppercase tracking-widest border-b border-stone-900 pb-2 mb-4 shrink-0">Galeria de Atores</h3>
                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar md:pr-2 min-h-0">
                    {characters.length === 0 && (
                            <div className="p-4 text-stone-700 text-xs italic border border-dashed border-stone-900">
                            Vazio.
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
                                <span className={`font-serif text-base ${selectedCharacter === c.id ? 'text-amber-500' : 'text-stone-300'}`}>
                                    {c.name}
                                </span>
                            </div>
                            <span className="text-[9px] uppercase tracking-wider text-stone-500 border border-stone-800 px-2 rounded-full">
                                {c.archetype}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default AdventureLauncher;
