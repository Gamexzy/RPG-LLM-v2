import React from 'react';
import { useLibrary } from '../../hooks/useLibrary';

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