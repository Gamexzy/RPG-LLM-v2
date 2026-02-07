
import React from 'react';
import { usePersistence } from '../../hooks/usePersistence';
import { AdventureRecord, CharacterTemplate, UniverseTemplate } from '../../types';

// --- LAYOUT HELPER (Split Screen for Lists) ---
const SplitListLayout: React.FC<{
  title: string;
  subtitle: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, description, action, children }) => {
  return (
    <div className="flex-1 flex flex-col p-6 animate-fade-in overflow-y-auto pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 max-w-6xl w-full mx-auto h-full">
        
        {/* ESQUERDA: Cabeçalho Fixo */}
        <div className="md:w-1/3 flex flex-col md:justify-between md:sticky md:top-0 md:h-[calc(100vh-180px)]">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-200 tracking-tight leading-none">{title}</h2>
            <div className="h-px w-12 bg-amber-900/50 mt-4 mb-2"></div>
            <p className="text-stone-500 text-xs uppercase tracking-widest mb-4">{subtitle}</p>
            {description && (
                <p className="text-stone-600 text-sm leading-relaxed italic hidden md:block">
                    {description}
                </p>
            )}
          </div>
          <div className="mt-8 md:mt-0">
             {action}
          </div>
        </div>

        {/* DIREITA: Lista Scrollável */}
        <div className="md:w-2/3 md:border-l md:border-stone-800 md:pl-12">
           {children}
        </div>

      </div>
    </div>
  );
};


// --- ADVENTURE LIST VIEW ---

interface AdventureListProps {
  adventures: AdventureRecord[]; // [UPDATED] Recebe dados
  onDelete: (id: string) => void; // [UPDATED] Recebe ação
  onLoadGame: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResumeAdventure: (id: string) => void;
}

export const AdventureList: React.FC<AdventureListProps> = ({ adventures, onDelete, onLoadGame, onResumeAdventure }) => {
  const { hasSlot } = usePersistence();

  return (
    <SplitListLayout
        title="Crônicas"
        subtitle="Jornadas em Andamento"
        description="Aqui residem os ecos das suas escolhas. Continue de onde parou ou importe memórias antigas."
        action={
            <label className="cursor-pointer w-full block text-center px-6 py-4 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-600 text-stone-400 hover:text-stone-200 text-xs uppercase tracking-widest transition-all">
                Importar Arquivo .JSON
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
            {adventures.map(adv => {
              const hasLocalSave = hasSlot(adv.id);
              const dateStr = new Date(adv.startDate || Date.now()).toLocaleDateString('pt-BR');
              
              return (
                <div key={adv.id} className="bg-stone-900/20 border border-stone-800 p-6 rounded-sm hover:border-amber-900/30 transition-all group relative flex flex-col gap-4">
                  
                  {/* Header: Quem e Onde */}
                  <div className="flex justify-between items-start">
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-serif text-amber-500">
                                {adv.characterName}
                            </h3>
                            <span className="text-stone-600 text-xs">em</span>
                            <h3 className="text-lg font-serif text-stone-300">
                                {adv.universeName}
                            </h3>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-stone-500 bg-stone-950 px-2 py-0.5 rounded border border-stone-900">
                              {adv.universeGenre}
                          </span>
                      </div>
                      
                      <button 
                          onClick={(e) => { e.stopPropagation(); if(confirm('Apagar permanentemente este registro?')) onDelete(adv.id); }}
                          className="text-stone-800 hover:text-red-900 transition-colors p-1"
                          title="Apagar Registro"
                      >
                          ✕
                      </button>
                  </div>

                  {/* Body: Status do Save */}
                  <div className="flex items-center gap-4 text-xs text-stone-500 bg-stone-950/30 p-3 rounded border border-stone-900/50">
                      <div className="flex-1">
                          <span className="block text-[9px] uppercase text-stone-600 mb-0.5">Última Localização</span>
                          <span className="text-stone-400 font-serif italic">{adv.lastLocation || "Desconhecido"}</span>
                      </div>
                      <div className="text-right">
                          <span className="block text-[9px] uppercase text-stone-600 mb-0.5">Data de Início</span>
                          <span>{dateStr}</span>
                      </div>
                  </div>

                  {/* Footer: Ações */}
                  <div className="flex items-center gap-3 pt-2">
                      {hasLocalSave ? (
                         <button 
                            className="flex-1 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-900/50 text-amber-500 px-4 py-3 text-xs uppercase tracking-widest transition-colors font-bold shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                            onClick={() => onResumeAdventure(adv.id)}
                         >
                            Continuar Jornada
                         </button>
                      ) : (
                        <div className="flex-1 flex gap-2">
                            <span className="flex-1 flex items-center justify-center text-stone-600 text-xs italic bg-stone-950/50 border border-stone-900">
                                Save local expirado
                            </span>
                            <button 
                                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs uppercase tracking-widest border border-stone-700"
                                onClick={() => document.getElementById(`load_hidden_${adv.id}`)?.click()}
                            >
                                Re-Importar
                                <input id={`load_hidden_${adv.id}`} type="file" className="hidden" accept=".json" onChange={onLoadGame} />
                            </button>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </SplitListLayout>
  );
};

// --- CHARACTER LIST VIEW ---

interface CharacterListProps {
  characters: CharacterTemplate[]; // [UPDATED] Recebe dados
  onDelete: (id: string) => void; // [UPDATED] Recebe ação
  onCreate: () => void;
}

export const CharacterList: React.FC<CharacterListProps> = ({ characters, onDelete, onCreate }) => {
  return (
    <SplitListLayout
        title="Almas"
        subtitle="Galeria de Atores"
        description="Gerencie os protagonistas disponíveis para encarnação. Cada ator mantém sua essência através dos mundos."
        action={
            <button 
                onClick={onCreate}
                className="w-full px-6 py-4 bg-amber-900/20 hover:bg-amber-900/30 border border-amber-900/50 hover:border-amber-700 text-amber-500 text-xs uppercase tracking-widest transition-colors"
            >
                + Criar Novo Ator
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
              <div key={c.id} className="bg-stone-900/20 border border-stone-800 p-6 rounded-sm hover:border-stone-600 transition-colors group relative">
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                      <h3 className="text-2xl font-serif text-stone-200 group-hover:text-white transition-colors">
                        {c.name}
                      </h3>
                      <span className="text-amber-600 text-xs uppercase tracking-widest font-bold">
                        {c.archetype}
                      </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('Deletar este personagem?')) onDelete(c.id); }}
                    className="text-stone-700 hover:text-red-500 transition-colors p-2"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-stone-500 text-sm leading-relaxed italic mb-4 border-l-2 border-stone-800 pl-3">
                    "{c.description}"
                </div>

                <div className="flex items-center gap-4 border-t border-stone-800 pt-4 mt-auto">
                    <div className="text-center">
                        <span className="block text-lg font-serif text-stone-300">{c.adventuresPlayed || 0}</span>
                        <span className="text-[9px] uppercase text-stone-600">Jornadas</span>
                    </div>
                    <div className="flex-1 text-right text-[10px] text-stone-600 uppercase">
                        ID: {c.id.split('-')[1]}...
                    </div>
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
  universes: UniverseTemplate[]; // [UPDATED] Recebe dados
  onDelete: (id: string) => void; // [UPDATED] Recebe ação
  onCreate: () => void;
}

export const UniverseList: React.FC<UniverseListProps> = ({ universes, onDelete, onCreate }) => {
  return (
    <SplitListLayout
        title="Mundos"
        subtitle="Realidades Alternativas"
        description="O palco onde as histórias acontecem. Cada universo possui suas próprias leis da física, magia e cronologia."
        action={
            <button 
                onClick={onCreate}
                className="w-full px-6 py-4 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-900/50 text-stone-300 hover:text-amber-500 text-xs uppercase tracking-widest transition-colors"
            >
                + Forjar Novo Mundo
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
              <div key={u.id} className="bg-stone-900/20 border border-stone-800 p-6 rounded-sm hover:border-amber-900/30 transition-colors group relative">
                
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-serif text-stone-200 group-hover:text-amber-100 transition-colors">{u.name}</h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('Implodir este universo?')) onDelete(u.id); }}
                    className="text-stone-700 hover:text-red-500 transition-colors p-1"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                   <span className="text-[9px] uppercase tracking-wider text-amber-500 bg-amber-900/10 border border-amber-900/20 px-2 py-0.5 rounded">
                      {u.genre}
                   </span>
                   {u.structure && (
                       <span className="text-[9px] uppercase tracking-wider text-stone-500 bg-stone-950 px-2 py-0.5 rounded border border-stone-900">
                          {u.structure.replace('_', ' ')}
                       </span>
                   )}
                </div>

                <p className="text-stone-500 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {u.description}
                </p>

                <div className="grid grid-cols-2 gap-4 border-t border-stone-800 pt-3">
                    <div>
                        <span className="block text-[9px] uppercase text-stone-600">Magia / Tech</span>
                        <span className="text-xs text-stone-400 truncate block" title={u.magicSystem}>{u.magicSystem || "N/A"}</span>
                    </div>
                    <div>
                        <span className="block text-[9px] uppercase text-stone-600">Cosmologia</span>
                        <span className="text-xs text-stone-400 truncate block" title={u.cosmology}>{u.cosmology || "Padrão"}</span>
                    </div>
                </div>

              </div>
            ))}
          </div>
        )}
    </SplitListLayout>
  );
};
