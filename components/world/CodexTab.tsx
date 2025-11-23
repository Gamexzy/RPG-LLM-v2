import React from 'react';
import { GameState } from '../../types';

interface CodexTabProps {
  gameState: GameState;
}

const CodexTab: React.FC<CodexTabProps> = ({ gameState }) => {
  return (
    <>
      {/* Quests */}
      <div className="space-y-3">
        <h3 className="text-stone-600 font-bold uppercase tracking-widest text-[10px]">Objetivos</h3>
        {gameState.knowledgeBase.quests.length === 0 ? (
          <p className="text-stone-700 text-xs italic">Sem objetivos claros.</p>
        ) : (
          <div className="space-y-3">
            {gameState.knowledgeBase.quests.map((q, i) => (
              <div key={i} className={`p-3 rounded border ${q.status === 'completed' ? 'border-green-900/30 bg-green-900/5' : q.status === 'failed' ? 'border-red-900/30 bg-red-900/5' : 'border-amber-900/30 bg-amber-900/5'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-bold ${q.status === 'active' ? 'text-amber-600' : 'text-stone-500'}`}>{q.title}</span>
                  <span className="text-[8px] uppercase tracking-wider text-stone-600 border border-stone-800 px-1 rounded">{q.status}</span>
                </div>
                <p className="text-stone-400 text-xs leading-snug">{q.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Characters */}
      <div className="space-y-3">
        <h3 className="text-stone-600 font-bold uppercase tracking-widest text-[10px]">Pessoas</h3>
        {gameState.knowledgeBase.characters.length === 0 ? (
          <p className="text-stone-700 text-xs italic">Ninguém conhecido.</p>
        ) : (
          <ul className="space-y-2">
            {gameState.knowledgeBase.characters.map((c, i) => (
              <li key={i} className="text-xs border-b border-stone-900 pb-2 last:border-0">
                <div className="flex justify-between mb-1">
                  <span className="text-stone-300 font-medium">{c.id}</span>
                  <span className="text-stone-600 text-[9px] uppercase">{c.status}</span>
                </div>
                <p className="text-stone-500">{c.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Locations */}
      <div className="space-y-3">
        <h3 className="text-stone-600 font-bold uppercase tracking-widest text-[10px]">Lugares</h3>
        {gameState.knowledgeBase.locations.length === 0 ? (
          <p className="text-stone-700 text-xs italic">Mundo inexplorado.</p>
        ) : (
          <ul className="space-y-2">
            {gameState.knowledgeBase.locations.map((l, i) => (
              <li key={i} className="text-xs border-b border-stone-900 pb-2 last:border-0">
                <span className="text-stone-400 font-medium block mb-0.5">{l.id}</span>
                <p className="text-stone-600 italic">{l.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default CodexTab;