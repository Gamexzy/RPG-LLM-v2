import React, { useState, useEffect } from 'react';
import ApiKeyModal from './components/ApiKeyModal';
import WorldStatePanel from './components/WorldStatePanel';
import GameHeader from './components/GameHeader';
import SetupScreen from './components/SetupScreen';
import GameLog from './components/GameLog';
import InputArea from './components/InputArea';
import { useGameEngine } from './hooks/useGameEngine';
import { usePersistence } from './hooks/usePersistence';

function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInvestigationMode, setIsInvestigationMode] = useState(false);

  const {
    gameState,
    isProcessing,
    setupMode,
    startGame,
    performAction,
    resetGame,
    restoreGame
  } = useGameEngine();

  const { saveGame, parseSaveFile } = usePersistence();

  // Open sidebar automatically when game starts
  useEffect(() => {
    if (!setupMode && gameState) {
      setIsSidebarOpen(true);
    } else if (setupMode) {
      setIsSidebarOpen(false);
      setIsInvestigationMode(false);
    }
  }, [setupMode]);

  const handleLoadGame = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const loadedState = await parseSaveFile(file);
      restoreGame(loadedState);
    } catch (err) {
      console.error(err);
      alert("Arquivo de save inválido ou corrompido.");
    }
  };

  if (!hasApiKey) {
    return <ApiKeyModal onKeySelected={() => setHasApiKey(true)} />;
  }

  return (
    <div className="flex h-screen bg-stone-950 text-stone-200 overflow-hidden relative">
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 relative transition-all duration-300 ${isSidebarOpen ? 'mr-0 md:mr-80' : 'mr-0'}`}>
        
        <GameHeader 
          gameState={gameState}
          setupMode={setupMode}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onReset={resetGame}
          onSave={() => saveGame(gameState)}
          onLoad={handleLoadGame}
        />

        {setupMode ? (
           <SetupScreen onStart={startGame} isProcessing={isProcessing} />
        ) : (
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

      {/* Retractable Sidebar */}
      <WorldStatePanel 
        gameState={gameState} 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

    </div>
  );
}

export default App;