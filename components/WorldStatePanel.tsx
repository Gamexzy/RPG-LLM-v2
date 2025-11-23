import React, { useState } from 'react';
import { GameState } from '../types';
import StatusTab from './world/StatusTab';
import CodexTab from './world/CodexTab';

interface WorldStatePanelProps {
  gameState: GameState | null;
  isOpen: boolean;
  onToggle: () => void;
}

const WorldStatePanel: React.FC<WorldStatePanelProps> = ({ gameState, isOpen, onToggle }) => {
  const [activeTab, setActiveTab] = useState<'status' | 'codex'>('status');

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onToggle}
      />

      {/* Panel Container */}
      <div className={`
        fixed inset-y-0 right-0 z-30 bg-stone-950 border-l border-stone-800
        transform transition-all duration-300 ease-in-out shadow-2xl flex flex-col
        ${isOpen ? 'translate-x-0 w-80' : 'translate-x-full w-80 md:translate-x-0 md:w-0 md:border-l-0'}
      `}>
        <div className={`h-full flex flex-col overflow-hidden ${!isOpen && 'md:hidden'}`}>
            
            {/* Header with Close Button */}
            <div className="p-4 border-b border-stone-900 flex items-center justify-between shrink-0">
                <h2 className="text-amber-700 font-serif tracking-widest text-sm uppercase">Consciência</h2>
                <button onClick={onToggle} className="text-stone-500 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {!gameState ? (
                <div className="p-6 text-stone-700 italic text-xs text-center mt-10">
                    Sintonizando realidade...
                </div>
            ) : (
                <>
                  {/* Tab Switcher */}
                  <div className="flex border-b border-stone-900 shrink-0">
                    <button 
                      onClick={() => setActiveTab('status')}
                      className={`flex-1 py-3 text-[10px] uppercase tracking-widest transition-colors ${activeTab === 'status' ? 'bg-stone-900 text-amber-600' : 'text-stone-600 hover:bg-stone-900/50'}`}
                    >
                      Estado
                    </button>
                    <button 
                      onClick={() => setActiveTab('codex')}
                      className={`flex-1 py-3 text-[10px] uppercase tracking-widest transition-colors ${activeTab === 'codex' ? 'bg-stone-900 text-amber-600' : 'text-stone-600 hover:bg-stone-900/50'}`}
                    >
                      Códex
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {activeTab === 'status' && <StatusTab gameState={gameState} />}
                    {activeTab === 'codex' && <CodexTab gameState={gameState} />}
                  </div>
                </>
            )}

            <div className="p-4 border-t border-stone-900 text-center shrink-0">
                <span className="text-[9px] text-stone-800 uppercase tracking-[0.2em]">Cronos Engine</span>
            </div>
        </div>
      </div>
    </>
  );
};

export default WorldStatePanel;