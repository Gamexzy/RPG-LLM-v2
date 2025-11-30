
import React, { useState, useEffect } from 'react';
import ApiKeyModal from './components/ApiKeyModal';
import WorldStatePanel from './components/WorldStatePanel';
import GameHeader from './components/GameHeader';
import GameLog from './components/GameLog';
import InputArea from './components/InputArea';
import EntryScreen from './components/EntryScreen';

// Navigation & Creators
import BottomNav, { NavTab } from './components/BottomNav';
import { UniverseList, CharacterList } from './components/library/LibraryViews';
import UniverseCreator from './components/creators/UniverseCreator';
import CharacterCreator from './components/creators/CharacterCreator';
import AdventureLauncher from './components/creators/AdventureLauncher';

import { useGameEngine } from './hooks/useGameEngine';
import { usePersistence } from './hooks/usePersistence';
import { useLibrary } from './hooks/useLibrary';
import { UniverseTemplate, CharacterTemplate } from './types';
import { checkBackendHealth } from './services/ragService';

// Types for Navigation
type ViewState = 'ADVENTURE_LAUNCHER' | 'UNIVERSE_LIST' | 'UNIVERSE_CREATOR' | 'CHARACTER_LIST' | 'CHARACTER_CREATOR' | 'SETTINGS' | 'GAME';

function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [hasEntered, setHasEntered] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInvestigationMode, setIsInvestigationMode] = useState(false);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('ADVENTURE_LAUNCHER');
  
  // Settings State
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Hooks
  const { gameState, isProcessing, startGame, performAction, resetGame, restoreGame } = useGameEngine();
  const { saveGame, parseSaveFile } = usePersistence();
  const { universes, characters, addUniverse, addCharacter } = useLibrary();

  // Auto-open sidebar when game starts
  useEffect(() => {
    if (gameState && currentView === 'GAME') {
      setIsSidebarOpen(true);
    }
  }, [gameState, currentView]);

  // Check Backend Health when entering Settings
  useEffect(() => {
    if (currentView === 'SETTINGS') {
      setBackendStatus('checking');
      checkBackendHealth().then(isOnline => {
        setBackendStatus(isOnline ? 'online' : 'offline');
      });
    }
  }, [currentView]);

  const handleStartAdventure = (u: UniverseTemplate, c: CharacterTemplate) => {
    // Starts the game engine with selected template data
    // We combine the universe description + character description into the prompt context
    const fullSettingContext = `
      UNIVERSE: ${u.name} (${u.genre}). ${u.description}
      CHARACTER: ${c.name} (${c.archetype}). ${c.description}
    `;
    
    // Updated signature: pass universe ID and Name for Persistent Memory
    startGame(c.name, fullSettingContext, u.id, u.name);
    setCurrentView('GAME');
  };

  const handleLoadGame = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const loadedState = await parseSaveFile(file);
      restoreGame(loadedState);
      setHasEntered(true);
      setCurrentView('GAME');
    } catch (err) {
      console.error(err);
      alert("Arquivo de save inválido ou corrompido.");
    }
  };

  const handleExitToHub = () => {
    if (window.confirm("Sair para o Menu Principal? O progresso não salvo será perdido.")) {
      resetGame(); // Clears current session
      setCurrentView('ADVENTURE_LAUNCHER');
    }
  };

  // Determine active tab for BottomNav based on currentView
  const getActiveTab = (): NavTab => {
    if (currentView === 'UNIVERSE_LIST' || currentView === 'UNIVERSE_CREATOR') return 'UNIVERSES';
    if (currentView === 'CHARACTER_LIST' || currentView === 'CHARACTER_CREATOR') return 'CHARACTERS';
    if (currentView === 'SETTINGS') return 'SETTINGS';
    return 'PLAY';
  };

  const handleTabChange = (tab: NavTab) => {
    switch (tab) {
      case 'PLAY': setCurrentView('ADVENTURE_LAUNCHER'); break;
      case 'UNIVERSES': setCurrentView('UNIVERSE_LIST'); break;
      case 'CHARACTERS': setCurrentView('CHARACTER_LIST'); break;
      case 'SETTINGS': setCurrentView('SETTINGS'); break;
    }
  };

  // --- RENDER LOGIC ---

  if (!hasApiKey) return <ApiKeyModal onKeySelected={() => setHasApiKey(true)} />;
  if (!hasEntered) return <EntryScreen onEnter={() => setHasEntered(true)} />;

  return (
    <div className="flex h-screen bg-stone-950 text-stone-200 overflow-hidden relative">
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 relative transition-all duration-300 ${isSidebarOpen && currentView === 'GAME' ? 'mr-0 md:mr-80' : 'mr-0'}`}>
        
        {/* Header is always visible but changes context */}
        <GameHeader 
          gameState={gameState}
          setupMode={currentView !== 'GAME'}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onReset={handleExitToHub} // In Game Mode, this exits to Hub
          onSave={() => saveGame(gameState)}
          onLoad={handleLoadGame}
        />

        {/* View Router */}
        
        {/* TAB: PLAY */}
        {currentView === 'ADVENTURE_LAUNCHER' && (
          <AdventureLauncher 
            universes={universes}
            characters={characters}
            onStartAdventure={handleStartAdventure}
            onCancel={() => {}} // No cancel action needed on root
          />
        )}

        {/* TAB: UNIVERSES */}
        {currentView === 'UNIVERSE_LIST' && (
          <UniverseList onCreate={() => setCurrentView('UNIVERSE_CREATOR')} />
        )}
        {currentView === 'UNIVERSE_CREATOR' && (
          <UniverseCreator 
            onSave={(t) => { addUniverse(t); setCurrentView('UNIVERSE_LIST'); }} 
            onCancel={() => setCurrentView('UNIVERSE_LIST')} 
          />
        )}

        {/* TAB: CHARACTERS */}
        {currentView === 'CHARACTER_LIST' && (
          <CharacterList onCreate={() => setCurrentView('CHARACTER_CREATOR')} />
        )}
        {currentView === 'CHARACTER_CREATOR' && (
          <CharacterCreator 
            onSave={(t) => { addCharacter(t); setCurrentView('CHARACTER_LIST'); }} 
            onCancel={() => setCurrentView('CHARACTER_LIST')} 
          />
        )}

        {/* TAB: SETTINGS */}
        {currentView === 'SETTINGS' && (
           <div className="flex-1 flex flex-col items-center justify-center text-stone-500 text-sm p-8 animate-fade-in overflow-y-auto">
              <div className="text-center space-y-4 max-w-md w-full pb-20">
                 <h2 className="text-2xl font-serif text-stone-300">Sistema Cronos</h2>
                 <p className="text-xs uppercase tracking-widest border-b border-stone-900 pb-4">Diagnósticos & Configuração</p>
                 
                 <div className="bg-stone-900/30 p-6 rounded border border-stone-800 text-left space-y-6">
                   
                   <div className="border-b border-stone-800 pb-2 mb-2 flex justify-between items-center">
                      <h3 className="text-stone-400 font-serif text-sm uppercase tracking-wider">Topologia de Rede</h3>
                      <span className="text-[9px] text-stone-600 bg-stone-900 px-2 py-0.5 rounded">2 Nós Ativos</span>
                   </div>

                   {/* Google API Status */}
                   <div>
                     <label className="block text-[10px] uppercase text-stone-500 mb-1 flex items-center justify-between">
                        <span>Núcleo Neural (LLM)</span>
                        <span className="text-stone-600">Google Cloud</span>
                     </label>
                     <div className="flex items-center gap-2 text-green-500 text-xs font-mono bg-stone-950/50 p-2 rounded border border-stone-900">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                       Gemini 2.5 API (Conectado)
                     </div>
                   </div>

                   {/* Backend/RAG Status */}
                   <div>
                     <label className="block text-[10px] uppercase text-stone-500 mb-1 flex items-center justify-between">
                        <span>Orquestrador de Memória</span>
                        <span className="text-stone-600">Servidor RAG (Python)</span>
                     </label>
                     <div className={`flex items-center gap-2 text-xs font-mono bg-stone-950/50 p-2 rounded border border-stone-900 transition-colors duration-300 ${
                       backendStatus === 'online' ? 'text-green-500 border-green-900/30' : backendStatus === 'checking' ? 'text-amber-500' : 'text-red-500 border-red-900/30'
                     }`}>
                       <span className={`w-2 h-2 rounded-full ${
                         backendStatus === 'online' ? 'bg-green-500 animate-pulse' : backendStatus === 'checking' ? 'bg-amber-500 animate-bounce' : 'bg-red-500'
                       }`}></span>
                       {backendStatus === 'checking' ? 'Negociando handshake...' : backendStatus === 'online' ? 'Link Neural Estável' : 'Sinal Perdido (Offline)'}
                     </div>
                     
                     {/* Sub-systems visualization */}
                     <div className="mt-2 pl-3 border-l-2 border-stone-800 space-y-1">
                        <div className="flex items-center justify-between text-[10px] py-1">
                           <span className="text-stone-400">Vector Store (ChromaDB)</span>
                           <span className={backendStatus === 'online' ? "text-green-600" : "text-stone-700"}>{backendStatus === 'online' ? '●' : '○'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] py-1">
                           <span className="text-stone-400">Knowledge Graph (Neo4j)</span>
                           <span className={backendStatus === 'online' ? "text-green-600" : "text-stone-700"}>{backendStatus === 'online' ? '●' : '○'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] py-1">
                           <span className="text-stone-400">Event Logs (SQLite)</span>
                           <span className={backendStatus === 'online' ? "text-green-600" : "text-stone-700"}>{backendStatus === 'online' ? '●' : '○'}</span>
                        </div>
                     </div>

                     {backendStatus === 'offline' && (
                       <p className="text-[10px] text-red-900/70 mt-2 italic border-t border-red-900/10 pt-1">
                         A persistência de longo prazo está indisponível. A simulação usará apenas a memória de contexto (RAM).
                       </p>
                     )}
                   </div>
                   
                   <div className="h-px bg-stone-800 w-full my-4"></div>

                   <div>
                     <label className="block text-[10px] uppercase text-stone-600 mb-1">Versão do Cliente</label>
                     <span className="text-stone-400 text-xs font-mono">v1.2.2 (Neural Hub)</span>
                   </div>

                    <div>
                     <label className="block text-[10px] uppercase text-stone-600 mb-1">Armazenamento Local</label>
                     <button onClick={() => { if(confirm('Limpar todas as bibliotecas e resetar o app?')) { localStorage.clear(); window.location.reload(); } }} className="text-red-500 hover:text-red-400 text-xs underline">
                       Limpar Dados Locais (Reset Fábrica)
                     </button>
                   </div>
                 </div>
              </div>
           </div>
        )}

        {/* GAME VIEW */}
        {currentView === 'GAME' && (
          <>
            <GameLog 
              history={gameState?.history || []} 
              isProcessing={isProcessing} 
              isInvestigationMode={isInvestigationMode}
            />
            <InputArea 
              onSend={performAction}
              isProcessing={isProcessing}
              isInvestigationMode={isInvestigationMode}
              onToggleMode={() => setIsInvestigationMode(!isInvestigationMode)}
            />
          </>
        )}
      </div>

      {/* Sidebar - Only active in GAME view */}
      {currentView === 'GAME' && (
        <WorldStatePanel 
          gameState={gameState} 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
      )}

      {/* Bottom Navigation - Only active when NOT in game */}
      {currentView !== 'GAME' && (
        <BottomNav activeTab={getActiveTab()} onTabChange={handleTabChange} />
      )}

    </div>
  );
}

export default App;
