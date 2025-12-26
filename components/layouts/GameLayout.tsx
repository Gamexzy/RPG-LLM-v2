
import React from 'react';
import GameHeader from '../GameHeader';
import WorldStatePanel from '../WorldStatePanel';
import BottomNav, { NavTab } from '../BottomNav';
import { GameState } from '../../types';

interface GameLayoutProps {
  children: React.ReactNode;
  gameState: GameState | null;
  currentView: string;
  isSidebarOpen: boolean;
  activeTab: NavTab;
  onToggleSidebar: () => void;
  onReset: () => void;
  onSave: () => void;
  onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTabChange: (tab: NavTab) => void;
}

const GameLayout: React.FC<GameLayoutProps> = ({
  children,
  gameState,
  currentView,
  isSidebarOpen,
  activeTab,
  onToggleSidebar,
  onReset,
  onSave,
  onLoad,
  onTabChange
}) => {
  const isGameActive = currentView === 'GAME';

  return (
    <div className="flex h-screen bg-stone-950 text-stone-200 overflow-hidden relative">
      
      {/* Main Content */}
      {/* FIX: Adicionado 'pb-safe' e margem inferior condicional para reservar espaço para a BottomNav */}
      <div className={`flex-1 flex flex-col min-w-0 relative transition-all duration-300 
        ${isSidebarOpen && isGameActive ? 'mr-0 md:mr-80' : 'mr-0'} 
        ${!isGameActive ? 'mb-16 md:mb-20' : ''}
      `}>
        
        <GameHeader 
          gameState={gameState}
          setupMode={!isGameActive}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={onToggleSidebar}
          onReset={onReset}
          onSave={onSave}
          onLoad={onLoad}
        />

        {children}
      </div>

      {/* Sidebar - Only active in GAME view */}
      {isGameActive && (
        <WorldStatePanel 
          gameState={gameState} 
          isOpen={isSidebarOpen} 
          onToggle={onToggleSidebar} 
        />
      )}

      {/* Bottom Navigation - Only active when NOT in game */}
      {!isGameActive && (
        <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
      )}

    </div>
  );
};

export default GameLayout;
