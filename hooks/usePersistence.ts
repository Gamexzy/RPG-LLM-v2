
import { GameState } from '../types';

export const usePersistence = () => {
  // --- FILE SYSTEM (MANUAL EXPORT) ---
  const saveGameToFile = (gameState: GameState | null) => {
    if (!gameState) return;
    try {
      const blob = new Blob([JSON.stringify(gameState)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cronos_save_${gameState.player.name.replace(/\s/g, '_')}_${new Date().getTime()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to save game to file:", error);
      alert("Erro ao gerar arquivo de save.");
    }
  };

  const parseSaveFile = (file: File): Promise<GameState> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const loadedState = JSON.parse(ev.target?.result as string);
          if (!loadedState.player || !loadedState.world) {
             throw new Error("Invalid save file structure");
          }
          resolve(loadedState);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  // --- LOCAL STORAGE SLOTS (AUTO SAVE) ---
  
  const getSlotKey = (adventureId: string) => `cronos_slot_${adventureId}`;

  const saveToSlot = (adventureId: string, gameState: GameState) => {
      try {
          localStorage.setItem(getSlotKey(adventureId), JSON.stringify(gameState));
          console.debug(`[Persistence] Game saved to slot: ${adventureId}`);
      } catch (e) {
          console.warn("[Persistence] Failed to auto-save to LocalStorage (Quota exceeded?)", e);
      }
  };

  const loadFromSlot = (adventureId: string): GameState | null => {
      try {
          const data = localStorage.getItem(getSlotKey(adventureId));
          if (!data) return null;
          return JSON.parse(data) as GameState;
      } catch (e) {
          console.error("[Persistence] Corrupted save slot", e);
          return null;
      }
  };

  const hasSlot = (adventureId: string): boolean => {
      return !!localStorage.getItem(getSlotKey(adventureId));
  };

  return {
    saveGameToFile,
    parseSaveFile,
    saveToSlot,
    loadFromSlot,
    hasSlot
  };
};
