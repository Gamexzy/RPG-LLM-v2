
import React, { useState } from 'react';

interface InputAreaProps {
  onSend: (text: string, mode: 'action' | 'investigation' | 'debug') => void;
  isProcessing: boolean;
  isSyncingState: boolean; // [NEW] Indicates Analyst is running
  isInvestigationMode: boolean;
  onToggleMode: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isProcessing, isSyncingState, isInvestigationMode, onToggleMode }) => {
  const [input, setInput] = useState('');
  const [isDebugMode, setIsDebugMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Block interaction during critical phases
    if (!input.trim() || isProcessing || isSyncingState) return;
    
    let mode: 'action' | 'investigation' | 'debug' = 'action';
    if (isDebugMode) mode = 'debug';
    else if (isInvestigationMode) mode = 'investigation';

    onSend(input, mode);
    setInput('');
  };

  // Determine placeholder and status text
  let placeholderText = "Sua vontade...";
  if (isProcessing) placeholderText = "Narrando...";
  else if (isSyncingState) placeholderText = "O Escriba está registrando...";
  else if (isDebugMode) placeholderText = "LOGS >>";
  else if (isInvestigationMode) placeholderText = "O que você percebe?";

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-950 via-stone-950 to-transparent pb-8 pt-20 px-4 md:px-0 z-10 pointer-events-none">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        
        <form onSubmit={handleSubmit} className="relative pointer-events-auto group flex items-center gap-2">
          
          {/* Action Toggle */}
          {!isDebugMode && (
              <button
                type="button"
                onClick={onToggleMode}
                disabled={isProcessing || isSyncingState}
                className={`p-4 rounded-full transition-all duration-300 border ${
                    isInvestigationMode
                    ? 'bg-cyan-950/30 text-cyan-400 border-cyan-800 hover:bg-cyan-900/50'
                    : 'bg-stone-900/30 text-stone-600 border-stone-800 hover:text-amber-500 hover:border-amber-800'
                } ${isSyncingState ? 'opacity-50 cursor-wait' : ''}`}
              >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
              </svg>
              </button>
          )}

          {/* Debug Console */}
          <button
            type="button"
            onClick={() => setIsDebugMode(!isDebugMode)}
            className={`p-4 rounded-full transition-all duration-300 border ${isDebugMode ? 'bg-green-950/30 text-green-400 border-green-800' : 'bg-stone-900/30 text-stone-700 border-stone-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholderText}
              disabled={isProcessing || isSyncingState}
              autoFocus
              className={`w-full bg-stone-950/80 backdrop-blur-md border-b p-4 pl-2 focus:outline-none transition-all font-serif text-lg 
                ${isDebugMode ? 'border-green-900 text-green-400' 
                : isInvestigationMode ? 'border-cyan-900 text-cyan-100' 
                : isSyncingState ? 'border-amber-900/30 text-stone-500 cursor-wait'
                : 'border-stone-800 text-stone-200 focus:border-amber-800'}`}
            />
            
            {/* Status Indicator Icon */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                {isProcessing ? (
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                ) : isSyncingState ? (
                    <div className="animate-spin text-amber-700" title="Sincronizando estado...">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </div>
                ) : (
                    <button type="submit" className="text-stone-600 hover:text-amber-600 transition-colors">➔</button>
                )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputArea;
