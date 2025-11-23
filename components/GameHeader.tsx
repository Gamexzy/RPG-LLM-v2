import React from 'react';
import { GameState } from '../types';

interface GameHeaderProps {
  gameState: GameState | null;
  setupMode: boolean;
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
  return (
    <header className="h-14 border-b border-stone-900 flex items-center justify-between px-6 bg-stone-950 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-serif tracking-[0.2em] text-stone-400">CRONOS</h1>
        {!setupMode && (
          <div className="hidden md:flex items-center gap-3 text-[10px] text-stone-600 uppercase tracking-wider">
            <span>{gameState?.world.time}</span>
            <span className="text-stone-800">|</span>
            <span>{gameState?.player.location}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {!setupMode && (
          <>
            <button onClick={onReset} className="text-xs text-stone-600 hover:text-red-500 transition-colors mr-2" title="Reiniciar Simulação">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>

            <label className="cursor-pointer text-xs text-stone-600 hover:text-amber-500 transition-colors" title="Carregar">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <input type="file" className="hidden" accept=".json" onChange={onLoad} />
            </label>
            <button onClick={onSave} className="text-xs text-stone-600 hover:text-amber-500 transition-colors" title="Salvar">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </button>
          </>
        )}
        <button
          className={`text-stone-400 hover:text-amber-500 transition-colors ${setupMode ? 'hidden' : ''}`}
          onClick={onToggleSidebar}
          title="Status & Inventário"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default GameHeader;