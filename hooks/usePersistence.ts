import { GameState } from '../types';

export const usePersistence = () => {
  const saveGame = (gameState: GameState | null) => {
    if (!gameState) return;
    try {
      const blob = new Blob([JSON.stringify(gameState)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cronos_save_${new Date().getTime()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to save game:", error);
      alert("Erro ao salvar o jogo.");
    }
  };

  const parseSaveFile = (file: File): Promise<GameState> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const loadedState = JSON.parse(ev.target?.result as string);
          // Basic validation could go here
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

  return {
    saveGame,
    parseSaveFile
  };
};