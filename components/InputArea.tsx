import React, { useState } from 'react';

interface InputAreaProps {
  onSend: (text: string, mode: 'action' | 'investigation' | 'debug') => void;
  isProcessing: boolean;
  isInvestigationMode: boolean; // Legacy prop name, we might want to refactor to 'inputMode' later, but kept for compatibility
  onToggleMode: () => void; // Handles switching Action <> Investigation
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isProcessing, isInvestigationMode, onToggleMode }) => {
  const [input, setInput] = useState('');
  const [isDebugMode, setIsDebugMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    let mode: 'action' | 'investigation' | 'debug' = 'action';
    
    if (isDebugMode) {
      mode = 'debug';
    } else if (isInvestigationMode) {
      mode = 'investigation';
    }

    onSend(input, mode);
    setInput('');
  };

  const toggleDebug = () => {
    setIsDebugMode(!isDebugMode);
  };

  // Determine styles based on active mode
  let borderColor = 'border-stone-800';
  let focusColor = 'focus:border-amber-800';
  let textColor = 'text-stone-200';
  let placeholderColor = 'placeholder-stone-700';
  let buttonColor = 'text-stone-600 hover:text-amber-600';
  let placeholderText = isInvestigationMode ? "O que você procura?" : "Sua vontade...";

  if (isDebugMode) {
    borderColor = 'border-green-900';
    focusColor = 'focus:border-green-500';
    textColor = 'text-green-400 font-mono';
    placeholderColor = 'placeholder-green-900';
    buttonColor = 'text-green-700 hover:text-green-400';
    placeholderText = "DEBUG_CONSOLE >> Query simulation logic...";
  } else if (isInvestigationMode) {
    borderColor = 'border-cyan-900';
    focusColor = 'focus:border-cyan-500';
    textColor = 'text-cyan-100';
    placeholderColor = 'placeholder-cyan-900/50';
    buttonColor = 'text-cyan-600 hover:text-cyan-400';
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-950 via-stone-950 to-transparent pb-8 pt-20 px-4 md:px-0 z-10 pointer-events-none">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative pointer-events-auto group flex items-center gap-2">
        
        {/* Mode Toggle Button (Action vs Investigation) */}
        {!isDebugMode && (
            <button
            type="button"
            onClick={onToggleMode}
            className={`p-4 rounded-full transition-all duration-300 border ${
                isInvestigationMode
                ? 'bg-cyan-950/30 text-cyan-400 border-cyan-800 hover:bg-cyan-900/50'
                : 'bg-stone-900/30 text-stone-600 border-stone-800 hover:text-amber-500 hover:border-amber-800'
            }`}
            title={isInvestigationMode ? "Modo Investigação (Ativo)" : "Modo Ação (Ativo)"}
            >
            {isInvestigationMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
            )}
            </button>
        )}

        {/* Debug Toggle Button */}
        <button
          type="button"
          onClick={toggleDebug}
          className={`p-4 rounded-full transition-all duration-300 border ${
            isDebugMode
              ? 'bg-green-950/30 text-green-400 border-green-800 hover:bg-green-900/50'
              : 'bg-stone-900/30 text-stone-700 border-stone-800 hover:text-green-500 hover:border-green-900'
          }`}
          title="Debug Console"
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
            disabled={isProcessing}
            autoFocus
            className={`w-full bg-stone-950/80 backdrop-blur-md border-b p-4 pl-2 focus:outline-none transition-all font-serif text-lg ${borderColor} ${textColor} ${focusColor} ${placeholderColor}`}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className={`absolute right-2 top-1/2 -translate-y-1/2 disabled:opacity-0 transition-all duration-300 ${buttonColor}`}
          >
            ➔
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputArea;