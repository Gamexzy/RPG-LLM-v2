
import React from 'react';
import { useLibrary } from '../../hooks/useLibrary';

// --- LAYOUT HELPER (Split Screen for Lists) ---
const SplitListLayout: React.FC<{
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, action, children }) => {
  return (
    <div className="flex-1 flex flex-col p-6 animate-fade-in overflow-y-auto">
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 max-w-6xl w-full mx-auto h-full">
        
        {/* ESQUERDA */}
        {/* FIX: Mudado para md:sticky para evitar sobreposição mobile */}
        <div className="md:w-1/3 flex flex-col md:justify-between md:sticky md:top-0 md:h-[calc(100vh-180px)]">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-200 tracking-tight leading-none">{title}</h2>
            <div className="h-px w-12 bg-amber-900/50 mt-4 mb-2"></div>
            <p className="text-stone-500 text-xs uppercase tracking-widest mb-6">{subtitle}</p>
          </div>
          <div className="mt-4">
             {action}
          </div>
        </div>

        {/* DIREITA */}
        <div className="md:w-2/3 md:border-l md:border-stone-800 md:pl-12">
           {children}
        </div>

      </div>
    </div>
  );
};


// --- ADVENTURE LIST VIEW ---

interface AdventureListProps {
  onLoadGame: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AdventureList: React.FC<AdventureListProps> = ({ onLoadGame }) => {
  const { adventures, deleteAdventureRecord } = useLibrary();

  return (
    <SplitListLayout
        title="Crônicas"
        subtitle="Histórico de Jornadas"
        action={
            <label className="cursor-pointer w-full block text-center px-6 py-4 bg-amber-900/20 hover:bg-amber-900/30 border border-amber-900/50 hover:border-amber-700 text-amber-500 text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                Carregar Arquivo .JSON
                <input type="file" className="hidden" accept=".json" onChange={onLoadGame} />
            </label>
        }
    >
        {adventures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-700 space-y-4 border border-dashed border-stone-900 rounded bg-stone-950/30">
            <p className="text-sm italic">O livro do destino está em branco.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {adventures.map(adv => (
              <div key={adv.id} className="bg-stone-900/20 border border-stone-800 p-6 rounded-sm hover:border-stone-700 transition-colors group relative flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-serif text-stone-300 group-hover:text-amber-500 transition-colors">
                            {adv.characterName}
                        </h3>
                        <span className="text-[9px] uppercase tracking-wider text-stone-500 border border-stone-800 px-2 py-0.5 rounded-full">
                            {adv.universeGenre}
                        </span>
                    </div>
                    
                    <div className="text-sm text-stone-500 mb-1">
                        Viajando em <span className="text-stone-400 font-serif">{adv.universeName}</span>
                    </div>
                    <div className="text-xs text-stone-600 italic">
                         {new Date(adv.startDate).toLocaleDateString()}
                    </div>
                </div>

                <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-stone-800/50 pt-4 md:pt-0 md:pl-6">
                     <button 
                        className="text-stone-500 hover:text-amber-500 text-xs uppercase tracking-widest flex items-center gap-1 transition-colors"
                        onClick={() => document.getElementById(`load_hidden_${adv.id}`)?.click()}
                     >
                        Continuar
                        <input id={`load_hidden_${adv.id}`} type="file" className="hidden" accept=".json" onChange={onLoadGame} />
                     </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); if(confirm('Remover este registro do histórico?')) deleteAdventureRecord(adv.id); }}
                        className="text-stone-700 hover:text-red-900 transition-colors p-2"
                        title="Esquecer Crônica"
                    >
                        ✕
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </SplitListLayout>
  );
};

// --- UNIVERSE LIST VIEW ---

interface UniverseListProps {
  onCreate: () => void;
}

export const UniverseList: React.FC<UniverseListProps> = ({ onCreate }) => {
  const { universes, deleteUniverse } = useLibrary();

  return (
    <SplitListLayout
        title="Mundos"
        subtitle="Biblioteca de Realidades"
        action={
            <button 
                onClick={onCreate}
                className="w-full px-6 py-4 bg-stone-900 hover:bg-amber-900/20 border border-stone-800 hover:border-amber-900 text-amber-500 text-xs uppercase tracking-widest transition-colors"
            >
                + Novo Universo
            </button>
        }
    >
        {universes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-700 space-y-4 border border-dashed border-stone-900 rounded">
            <p className="text-sm italic">O vazio impera.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {universes.map(u => (
              <div key={u.id} className="bg-stone-900/20 border border-stone-800 p-6 rounded-sm hover:border-stone-700 transition-colors group relative">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-serif text-stone-300 group-hover:text-amber-500 transition-colors">{u.name}</h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('Apagar este universo?')) deleteUniverse(u.id); }}
                    className="text-stone-700 hover:text-red-500 transition-colors px-2"
                    title="Apagar"
                  >
                    ×
                  </button>
                </div>
                <div className="mb-4">
                   <span className="text-[9px] uppercase tracking-wider text-stone-500 border border-stone-800 px-2 py-0.5 rounded-full">
                      {u.genre}
                   </span>
                </div>
                <p className="text-stone-500 text-sm line-clamp-2">{u.description}</p>
              </div>
            ))}
          </div>
        )}
    </SplitListLayout>
  );
};

// --- CHARACTER LIST VIEW ---

interface CharacterListProps {
  onCreate: () => void;
}

export const CharacterList: React.FC<CharacterListProps> = ({ onCreate }) => {
  const { characters, deleteCharacter } = useLibrary();

  return (
    <SplitListLayout
        title="Almas"
        subtitle="Galeria de Atores"
        action={
            <button 
                onClick={onCreate}
                className="w-full px-6 py-4 bg-stone-900 hover:bg-amber-900/20 border border-stone-800 hover:border-amber-900 text-amber-500 text-xs uppercase tracking-widest transition-colors"
            >
                + Novo Ator
            </button>
        }
    >
        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-700 space-y-4 border border-dashed border-stone-900 rounded">
            <p className="text-sm italic">Ninguém habita este plano ainda.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {characters.map(c => (
              <div key={c.id} className="bg-stone-900/20 border border-stone-800 p-6 rounded-sm hover:border-stone-700 transition-colors group relative">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-serif text-stone-300 group-hover:text-amber-500 transition-colors">{c.name}</h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('Apagar este personagem?')) deleteCharacter(c.id); }}
                    className="text-stone-700 hover:text-red-500 transition-colors px-2"
                    title="Apagar"
                  >
                    ×
                  </button>
                </div>
                <div className="mb-4">
                   <span className="text-[9px] uppercase tracking-wider text-stone-500 border border-stone-800 px-2 py-0.5 rounded-full">
                      {c.archetype}
                   </span>
                </div>
                <p className="text-stone-500 text-sm line-clamp-2">{c.description}</p>
              </div>
            ))}
          </div>
        )}
    </SplitListLayout>
  );
};
