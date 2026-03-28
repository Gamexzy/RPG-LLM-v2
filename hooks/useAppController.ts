
import React, { useState, useEffect } from 'react';
import { useGameEngine } from './useGameEngine';
import { usePersistence } from './usePersistence';
import { useLibrary } from './useLibrary';
import { checkBackendHealth } from '../services/ragService';
import { NavTab } from '../components/BottomNav';
import { UniverseTemplate, CharacterTemplate, AISettings } from '../types';
import { AI_MODELS } from '../services/ai/config';

export type ViewState = 'ADVENTURE_LAUNCHER' | 'ADVENTURE_LIST' | 'UNIVERSE_LIST' | 'UNIVERSE_CREATOR' | 'CHARACTER_LIST' | 'CHARACTER_CREATOR' | 'SETTINGS' | 'GAME';

export const useAppController = () => {
  // Auth State
  const [userId, setUserId] = useState<string | null>(null);

  const [hasApiKey, setHasApiKey] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInvestigationMode, setIsInvestigationMode] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('ADVENTURE_LAUNCHER');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // AI Settings State
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    const stored = localStorage.getItem('cronos_ai_settings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing AI settings", e);
      }
    }
    const getLmStudioUrl = () => {
      if (process.env.LM_STUDIO_BASE_URL) return process.env.LM_STUDIO_BASE_URL;
      const protocol = process.env.LMSTUDIO_PROTOCOL || 'http';
      const ipv6 = process.env.IPV6 || '::1';
      const port = process.env.LMSTUDIO_PORT || '1234';
      const host = ipv6.includes(':') && !ipv6.includes('[') ? `[${ipv6}]` : ipv6;
      return `${protocol}://${host}:${port}/v1`;
    };

    return {
      provider: 'gemini',
      baseUrl: getLmStudioUrl(),
      modelId: AI_MODELS.CREATIVE,
      apiKey: ''
    };
  });

  // Persist AI Settings
  useEffect(() => {
    localStorage.setItem('cronos_ai_settings', JSON.stringify(aiSettings));
  }, [aiSettings]);

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('cronos_session_user');
    if (storedUser) setUserId(storedUser);
    
    // Check if we have an API key (either in env or in settings)
    if (process.env.API_KEY || aiSettings.apiKey || aiSettings.provider === 'lmstudio') {
      setHasApiKey(true);
    }
  }, [aiSettings.apiKey, aiSettings.provider]);

  // Library & Persistence (Depende do userId)
  const { 
      universes, 
      characters, 
      adventures,
      addUniverse, 
      addCharacter, 
      restoreDefaults, 
      evolveUniverse, 
      trackCharacterUsage, 
      addAdventureRecord,
      deleteAdventureRecord,
      deleteUniverse,
      deleteCharacter
  } = useLibrary(userId || undefined);
  
  const { saveGameToFile, saveToSlot, loadFromSlot, hasSlot, parseSaveFile } = usePersistence();

  // Game Engine
  const { gameState, isProcessing, isSyncingState, startGame, performAction, resetGame, restoreGame } = useGameEngine(evolveUniverse);

  // --- Effects ---

  // Auto-open sidebar on game start
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

  // --- Auth Handlers ---
  const handleLogin = (id: string) => {
      localStorage.setItem('cronos_session_user', id);
      setUserId(id);
      setCurrentView('ADVENTURE_LAUNCHER');
  };

  const handleLogout = () => {
      localStorage.removeItem('cronos_session_user');
      resetGame();
      setIsSidebarOpen(false);
      setCurrentView('ADVENTURE_LAUNCHER');
      setUserId(null);
  };

  // --- Handlers ---

  const handleFactoryReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleStartAdventure = (u: UniverseTemplate, c: CharacterTemplate) => {
    if (!userId) return;

    trackCharacterUsage(c.id);
    const adventureId = addAdventureRecord(u, c); // Get the ID

    const physicsBlock = u.physics && u.physics.length > 0 ? `LEIS DA REALIDADE (Imutáveis):\n${u.physics.map(p=>`- ${p}`).join('\n')}` : '';
    const truthsBlock = u.knownTruths && u.knownTruths.length > 0 ? `VERDADES DESCOBERTAS (Conhecimento Acumulado):\n${u.knownTruths.map(t=>`- ${t}`).join('\n')}` : '';
    const timelineBlock = u.chronicles && u.chronicles.length > 0 ? `CRONOLOGIA CANÔNICA DO UNIVERSO (HISTÓRICO COMPARTILHADO):\n${u.chronicles.map(t=>`[${t.year}] ${t.event}`).join('\n')}` : '';
    const legendsBlock = u.champions && u.champions.length > 0 ? `LENDAS E HERÓIS PASSADOS:\n${u.champions.map(ch => `- ${ch.characterName}: ${ch.feat} (${ch.status})`).join('\n')}` : '';
    const magicBlock = u.magicSystem ? `SISTEMA DE MAGIA/TECNOLOGIA: ${u.magicSystem}` : '';

    const structureLabel = u.structure === 'star_cluster' ? "AGLOMERADO ESTELAR (Viagem entre Planetas)" : u.structure === 'singular_world' ? "PLANETA ÚNICO/INFINITO (Viagem Regional)" : "NEXUS MULTIVERSAL";
    const navLabel = u.navigationMethod === 'interstellar_ship' ? "NAVES ESPACIAIS" : u.navigationMethod === 'magical_gate' ? "PORTAIS MÁGICOS" : "FÍSICA (Caminhada/Veículos)";

    const settingInstruction = `
    DECISÃO DO MESTRE DE JOGO NECESSÁRIA:
    O jogador não especificou um local de início.
    Com base no Arquétipo do personagem (${c.archetype}) e no Gênero do Universo (${u.genre}), escolha um local inicial dramático e apropriado.
    `;

    const fullSettingContext = `
      UNIVERSE CONTAINER: ${u.name} (${u.genre})
      ESTRUTURA FÍSICA: ${structureLabel}
      MÉTODO DE VIAGEM PREDOMINANTE: ${navLabel}
      DESCRIÇÃO DO UNIVERSO: ${u.description}
      COSMOLOGIA: ${u.cosmology || 'Desconhecida'}
      ${physicsBlock}
      ${magicBlock}
      ${truthsBlock}
      ${timelineBlock}
      ${legendsBlock}
      ---
      STARTING INSTRUCTION: ${settingInstruction}
      ---
    `;
    
    startGame(c, fullSettingContext, u.id, u.name, userId, adventureId);
    setCurrentView('GAME');
  };

  const handleResumeAdventure = (adventureId: string) => {
    if (hasSlot(adventureId)) {
        const savedState = loadFromSlot(adventureId);
        if (savedState) {
            restoreGame(savedState);
            setCurrentView('GAME');
        } else {
            alert("Erro ao ler dados do slot local. Tente carregar o arquivo JSON.");
        }
    } else {
        alert("Nenhum save local encontrado para esta aventura. Por favor, carregue o arquivo .JSON.");
    }
  };

  const handleLoadGame = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const loadedState = await parseSaveFile(file);
      restoreGame(loadedState);
      if(loadedState.adventureId) saveToSlot(loadedState.adventureId, loadedState);
      setCurrentView('GAME');
    } catch (err) {
      console.error(err);
      alert("Arquivo de save inválido ou corrompido.");
    }
  };

  const handleExitToHub = () => {
    resetGame();
    setCurrentView('ADVENTURE_LAUNCHER');
  };

  const handleManualSave = () => {
      saveGameToFile(gameState);
      if (gameState && gameState.adventureId) {
          saveToSlot(gameState.adventureId, gameState);
      }
  };

  const getActiveTab = (): NavTab => {
    if (currentView === 'ADVENTURE_LIST') return 'ADVENTURES';
    if (currentView === 'UNIVERSE_LIST' || currentView === 'UNIVERSE_CREATOR') return 'UNIVERSES';
    if (currentView === 'CHARACTER_LIST' || currentView === 'CHARACTER_CREATOR') return 'CHARACTERS';
    if (currentView === 'SETTINGS') return 'SETTINGS';
    return 'PLAY';
  };

  const handleTabChange = (tab: NavTab) => {
    switch (tab) {
      case 'PLAY': setCurrentView('ADVENTURE_LAUNCHER'); break;
      case 'ADVENTURES': setCurrentView('ADVENTURE_LIST'); break;
      case 'UNIVERSES': setCurrentView('UNIVERSE_LIST'); break;
      case 'CHARACTERS': setCurrentView('CHARACTER_LIST'); break;
      case 'SETTINGS': setCurrentView('SETTINGS'); break;
    }
  };

  return {
    state: {
      userId,
      hasApiKey,
      isSidebarOpen,
      isInvestigationMode,
      currentView,
      backendStatus,
      gameState,
      isProcessing,
      isSyncingState, // [NEW] Exposed for UI feedback
      universes,
      characters,
      adventures,
      aiSettings
    },
    actions: {
      setHasApiKey,
      setAiSettings,
      setIsSidebarOpen,
      setIsInvestigationMode,
      setCurrentView,
      addUniverse,
      addCharacter,
      restoreDefaults,
      performAction,
      saveGame: handleManualSave,
      handleStartAdventure,
      handleResumeAdventure,
      handleLoadGame,
      handleExitToHub,
      handleTabChange,
      handleLogin,
      handleLogout,
      handleFactoryReset,
      deleteAdventureRecord,
      deleteUniverse,
      deleteCharacter
    },
    computed: {
      activeTab: getActiveTab()
    }
  };
};
