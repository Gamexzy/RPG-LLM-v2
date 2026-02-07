
import React, { useState, useEffect } from 'react';
import { useGameEngine } from './useGameEngine';
import { usePersistence } from './usePersistence';
import { useLibrary } from './useLibrary';
import { checkBackendHealth } from '../services/ragService';
import { NavTab } from '../components/BottomNav';
import { UniverseTemplate, CharacterTemplate } from '../types';

export type ViewState = 'ADVENTURE_LAUNCHER' | 'ADVENTURE_LIST' | 'UNIVERSE_LIST' | 'UNIVERSE_CREATOR' | 'CHARACTER_LIST' | 'CHARACTER_CREATOR' | 'SETTINGS' | 'GAME';

export const useAppController = () => {
  // Auth State
  const [userId, setUserId] = useState<string | null>(null);

  const [hasApiKey, setHasApiKey] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInvestigationMode, setIsInvestigationMode] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('ADVENTURE_LAUNCHER');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('cronos_session_user');
    if (storedUser) setUserId(storedUser);
  }, []);

  // Library & Persistence (Depende do userId)
  const { universes, characters, addUniverse, addCharacter, restoreDefaults, evolveUniverse, trackCharacterUsage, addAdventureRecord } = useLibrary(userId || undefined);
  const { saveGame, parseSaveFile } = usePersistence();

  // Game Engine
  const { gameState, isProcessing, startGame, performAction, resetGame, restoreGame } = useGameEngine(evolveUniverse);

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
      // Removemos o window.confirm daqui para tratar na UI (UX melhor)
      localStorage.removeItem('cronos_session_user');
      
      // Reset total do estado do jogo
      resetGame();
      setIsSidebarOpen(false);
      
      // Mudança de view e usuário
      setCurrentView('ADVENTURE_LAUNCHER');
      setUserId(null);
  };

  // --- Handlers ---

  const handleStartAdventure = (u: UniverseTemplate, c: CharacterTemplate) => {
    if (!userId) return;

    trackCharacterUsage(c.id);
    addAdventureRecord(u, c);

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
    
    // Pass userId to startGame
    startGame(c, fullSettingContext, u.id, u.name, userId);
    setCurrentView('GAME');
  };

  const handleLoadGame = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const loadedState = await parseSaveFile(file);
      restoreGame(loadedState);
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
      universes,
      characters
    },
    actions: {
      setHasApiKey,
      setIsSidebarOpen,
      setIsInvestigationMode,
      setCurrentView,
      addUniverse,
      addCharacter,
      restoreDefaults,
      performAction,
      saveGame,
      handleStartAdventure,
      handleLoadGame,
      handleExitToHub,
      handleTabChange,
      handleLogin,
      handleLogout
    },
    computed: {
      activeTab: getActiveTab()
    }
  };
};
