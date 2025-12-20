
import React from 'react';
import ApiKeyModal from './components/ApiKeyModal';
import LoginScreen from './components/auth/LoginScreen';

// Architecture
import { useAppController } from './hooks/useAppController';
import GameLayout from './components/layouts/GameLayout';

// Screens
import GameScreen from './components/screens/GameScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import AdventureLauncher from './components/creators/AdventureLauncher';
import { UniverseList, CharacterList, AdventureList } from './components/library/LibraryViews';
import UniverseCreator from './components/creators/UniverseCreator';
import CharacterCreator from './components/creators/CharacterCreator';

function App() {
  const { state, actions, computed } = useAppController();

  if (!state.hasApiKey) {
    return <ApiKeyModal onKeySelected={() => actions.setHasApiKey(true)} />;
  }

  // Se não estiver logado, mostra tela de login
  if (!state.userId) {
      return <LoginScreen onLogin={actions.handleLogin} />;
  }

  return (
    <GameLayout
      gameState={state.gameState}
      currentView={state.currentView}
      isSidebarOpen={state.isSidebarOpen}
      activeTab={computed.activeTab}
      onToggleSidebar={() => actions.setIsSidebarOpen(!state.isSidebarOpen)}
      onReset={actions.handleExitToHub}
      onSave={() => actions.saveGame(state.gameState)}
      onLoad={actions.handleLoadGame}
      onTabChange={actions.handleTabChange}
    >
      
      {/* --- ROUTING --- */}
      
      {state.currentView === 'ADVENTURE_LAUNCHER' && (
        <AdventureLauncher 
          universes={state.universes}
          characters={state.characters}
          onStartAdventure={actions.handleStartAdventure}
          onCancel={() => {}} 
        />
      )}

      {state.currentView === 'ADVENTURE_LIST' && (
        <AdventureList onLoadGame={actions.handleLoadGame} />
      )}

      {state.currentView === 'UNIVERSE_LIST' && (
        <UniverseList onCreate={() => actions.setCurrentView('UNIVERSE_CREATOR')} />
      )}
      {state.currentView === 'UNIVERSE_CREATOR' && (
        <UniverseCreator 
          onSave={(t) => { actions.addUniverse(t); actions.setCurrentView('UNIVERSE_LIST'); }} 
          onCancel={() => actions.setCurrentView('UNIVERSE_LIST')} 
        />
      )}

      {state.currentView === 'CHARACTER_LIST' && (
        <CharacterList onCreate={() => actions.setCurrentView('CHARACTER_CREATOR')} />
      )}
      {state.currentView === 'CHARACTER_CREATOR' && (
        <CharacterCreator 
          onSave={(t) => { actions.addCharacter(t); actions.setCurrentView('CHARACTER_LIST'); }} 
          onCancel={() => actions.setCurrentView('CHARACTER_LIST')}
        />
      )}

      {state.currentView === 'SETTINGS' && (
         <SettingsScreen 
            userId={state.userId}
            backendStatus={state.backendStatus}
            onRestoreDefaults={() => { if(confirm('Restaurar templates?')) { actions.restoreDefaults(); alert('Restaurado!'); window.location.reload(); } }}
            onFactoryReset={() => { if(confirm('Limpar TUDO?')) { localStorage.clear(); window.location.reload(); } }}
            onLogout={actions.handleLogout}
         />
      )}

      {state.currentView === 'GAME' && (
        <GameScreen 
          gameState={state.gameState}
          isProcessing={state.isProcessing}
          isInvestigationMode={state.isInvestigationMode}
          onPerformAction={actions.performAction}
          onToggleMode={() => actions.setIsInvestigationMode(!state.isInvestigationMode)}
        />
      )}

    </GameLayout>
  );
}

export default App;
