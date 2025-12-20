
import React from 'react';
import { GameState } from '../types';

interface GameHeaderProps {
  gameState: GameState | null;
  setupMode: boolean; // TRUE if in Hub/Creators, FALSE if in active Game
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onReset: () => void;
  onSave: () => void;
  onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ 
  gameState, 
  setupMode, 
  isSidebarOpen, 
  onToggleSidebar, 
  onReset, 
  onSave, 
  onLoad 
}) => {
  // Aumentado z-index para z-40 para garantir que fique acima de outros elementos
  return (
    <header className="h-14 border-b border-stone-900 flex items-center justify-between px-6 bg-stone-950 z-40 shrink-0 relative">
      <div className="flex items-center gap-4">
        {/* If in game, show exit button (reset). If in Hub, just show Logo */}
        {!setupMode ? (
             <button 
                onClick={onReset} 
                className="text-stone-500 hover:text-red-500 transition-colors flex items-center gap-2 p-2 -ml-2 rounded hover:bg-stone-900" 
                title="Sair para o Hub"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span className="hidden md:inline text-[10px] uppercase tracking-widest font-bold">Sair</span>
            </button>
        ) : (
            <h1 className="text-lg font-serif tracking-[0.2em] text-stone-400">CRONOS</h1>
        )}

        {!setupMode && (
          <div className="hidden md:flex items-center gap-3 text-[10px] text-stone-600 uppercase tracking-wider pl-4 border-l border-stone-900">
            <span>{gameState?.world.time}</span>
            <span className="text-stone-800">|</span>
            <span>{gameState?.player.location}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Load is available in Hub too? Maybe better to keep it everywhere for quick load */}
        <label className="cursor-pointer text-xs text-stone-600 hover:text-amber-500 transition-colors flex items-center gap-2" title="Carregar Save">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <input type="file" className="hidden" accept=".json" onChange={onLoad} />
        </label>

        {!setupMode && (
          <>
            <button onClick={onSave} className="text-xs text-stone-600 hover:text-amber-500 transition-colors" title="Salvar">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </button>
            
            <button
            className="text-stone-400 hover:text-amber-500 transition-colors ml-2"
            onClick={onToggleSidebar}
            title="Status & Inventário"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default GameHeader;
