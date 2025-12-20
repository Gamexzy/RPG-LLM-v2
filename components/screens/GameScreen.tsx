
import React from 'react';
import GameLog from '../GameLog';
import InputArea from '../InputArea';
import { GameState } from '../../types';

interface GameScreenProps {
  gameState: GameState | null;
  isProcessing: boolean;
  isInvestigationMode: boolean;
  onPerformAction: (text: string, mode: 'action' | 'investigation' | 'debug') => void;
  onToggleMode: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ 
  gameState, 
  isProcessing, 
  isInvestigationMode, 
  onPerformAction, 
  onToggleMode 
}) => {
  return (
    <>
      <GameLog 
        history={gameState?.history || []} 
        isProcessing={isProcessing} 
        isInvestigationMode={isInvestigationMode}
      />
      <InputArea 
        onSend={onPerformAction}
        isProcessing={isProcessing}
        isInvestigationMode={isInvestigationMode}
        onToggleMode={onToggleMode}
      />
    </>
  );
};

export default GameScreen;
