
import React from 'react';
import { useLibrary } from '../../hooks/useLibrary';

// --- ADVENTURE LIST VIEW ---

interface AdventureListProps {
  onLoadGame: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AdventureList: React.FC<AdventureListProps> = ({ onLoadGame }) => {
  const { adventures, deleteAdventureRecord } = useLibrary();

  return (
    <div className="flex-1 flex flex-col p-6 animate-fade-in overflow-y-auto pb-24">
      <div className="max-w-3xl w-full mx-auto space-y-8">
        
        {/* Header & Main Action */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-stone-900 pb-4 gap-4">
          <div>
            <h2 className="text-3xl font-serif text-stone-200 tracking-tight">Crônicas</h2>
            <p className="text-stone-600 text-xs uppercase tracking-widest mt-1">Histórico de Jornadas</p>
          </div>
          
          <label className="cursor-pointer px-6 py-3 bg-amber-900/20 hover:bg-amber-900/30 border border-amber-900/50 hover:border-amber-700 text-amber-500 text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Carregar Arquivo de Save
            <input type="file" className="hidden" accept=".json" onChange={onLoadGame} />
          </label>
        </div>

        {adventures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-700 space-y-4 border border-dashed border-stone-900 rounded bg-stone-950/30">
            <p className="text-sm italic">O livro do destino está em branco.</p>
            <p className="text-xs text-stone-600">Inicie uma nova aventura para registrar sua lenda.</p>
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
                         Iniciado em: {new Date(adv.startDate).toLocaleDateString()} às {new Date(adv.startDate).toLocaleTimeString()}
                    </div>
                </div>

                <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-stone-800/50 pt-4 md:pt-0 md:pl-6">
                     <button 
                        className="text-stone-500 hover:text-amber-500 text-xs uppercase tracking-widest flex items-center gap-1 transition-colors"
                        onClick={() => document.getElementById(`load_hidden_${adv.id}`)?.click()}
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        Continuar
                        {/* Hidden input to mimic "Resume" by asking for file. 
                            Ideally, we'd load from DB, but this bridges the UX gap. 
                        */}
                        <input id={`load_hidden_${adv.id}`} type="file" className="hidden" accept=".json" onChange={onLoadGame} />
                     </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); if(confirm('Remover este registro do histórico?')) deleteAdventureRecord(adv.id); }}
                        className="text-stone-700 hover:text-red-900 transition-colors p-2"
                        title="Esquecer Crônica"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- UNIVERSE LIST VIEW ---

interface UniverseListProps {
  onCreate: () => void;
}

export const UniverseList: React.FC<UniverseListProps> = ({ onCreate }) => {
  const { universes, deleteUniverse } = useLibrary();

  return (
    <div className="flex-1 flex flex-col p-6 animate-fade-in overflow-y-auto pb-24">
      <div className="max-w-3xl w-full mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-stone-900 pb-4">
          <div>
            <h2 className="text-3xl font-serif text-stone-200 tracking-tight">Biblioteca de Mundos</h2>
            <p className="text-stone-600 text-xs uppercase tracking-widest mt-1">Realidades Arquivadas</p>
          </div>
          <button 
            onClick={onCreate}
            className="px-4 py-2 bg-stone-900 hover:bg-amber-900/20 border border-stone-800 hover:border-amber-900 text-amber-500 text-xs uppercase tracking-widest transition-colors"
          >
            + Novo Universo
          </button>
        </div>

        {universes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-700 space-y-4 border border-dashed border-stone-900 rounded">
            <p className="text-sm italic">O vazio impera. Nenhuma realidade foi criada ainda.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {universes.map(u => (
              <div key={u.id} className="bg-stone-900/20 border border-stone-800 p-6 rounded-sm hover:border-stone-700 transition-colors group relative">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-serif text-stone-300 group-hover:text-amber-500 transition-colors">{u.name}</h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('Apagar este universo?')) deleteUniverse(u.id); }}
                    className="text-stone-700 hover:text-red-500 transition-colors"
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
                <div className="mt-4 pt-4 border-t border-stone-900/50 flex justify-between items-center">
                    <span className="text-[9px] text-stone-700">ID: {u.id.substring(0,8)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- CHARACTER LIST VIEW ---

interface CharacterListProps {
  onCreate: () => void;
}

export const CharacterList: React.FC<CharacterListProps> = ({ onCreate }) => {
  const { characters, deleteCharacter } = useLibrary();

  return (
    <div className="flex-1 flex flex-col p-6 animate-fade-in overflow-y-auto pb-24">
      <div className="max-w-3xl w-full mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-stone-900 pb-4">
          <div>
            <h2 className="text-3xl font-serif text-stone-200 tracking-tight">Galeria de Almas</h2>
            <p className="text-stone-600 text-xs uppercase tracking-widest mt-1">Receptáculos Prontos</p>
          </div>
          <button 
            onClick={onCreate}
            className="px-4 py-2 bg-stone-900 hover:bg-amber-900/20 border border-stone-800 hover:border-amber-900 text-amber-500 text-xs uppercase tracking-widest transition-colors"
          >
            + Novo Personagem
          </button>
        </div>

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
                    className="text-stone-700 hover:text-red-500 transition-colors"
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
                 <div className="mt-4 pt-4 border-t border-stone-900/50 flex justify-between items-center">
                    <span className="text-[9px] text-stone-700">Criado em: {new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
