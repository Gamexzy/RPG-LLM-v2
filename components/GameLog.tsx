import React, { useEffect, useRef } from 'react';
import { ChatEntry } from '../types';

interface GameLogProps {
  history: ChatEntry[];
  isProcessing: boolean;
  isInvestigationMode: boolean; // Used for the processing indicator color
}

const GameLog: React.FC<GameLogProps> = ({ history, isProcessing, isInvestigationMode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isProcessing]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-8 scroll-smooth" ref={scrollRef}>
      {history.map((entry, index) => (
        <div
          key={index}
          className={`max-w-3xl mx-auto animate-fade-in ${entry.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
        >
          <div className={`max-w-[90%] ${
            entry.role === 'user'
              ? `text-right font-mono text-sm mt-4 mb-2 border-r-2 pr-4 ${
                  entry.type === 'investigation'
                    ? 'text-cyan-400 border-cyan-800'
                    : entry.type === 'debug' 
                        ? 'text-green-400 border-green-800' 
                        : 'text-stone-400 border-stone-800'
                }`
              : `text-lg md:text-xl font-serif leading-relaxed text-justify ${
                  entry.type === 'investigation'
                    ? 'text-cyan-100 border-l-4 border-cyan-900/50 pl-4 italic bg-cyan-950/10 py-2'
                    : entry.type === 'debug'
                        ? 'text-green-500 font-mono text-sm border border-green-900/30 bg-green-950/20 p-4 rounded'
                        : 'text-stone-300'
                }`
          }`}>
            {entry.role === 'system' && entry.type !== 'debug' ? (
              <span className="text-red-900/80 block border border-red-900/30 p-2 text-xs font-sans uppercase tracking-widest">{entry.text}</span>
            ) : (
              entry.text.split('\n').map((line, i) => <p key={i} className="mb-4 last:mb-0">{line}</p>)
            )}

            {/* Visual Indicator for Investigation/Debug Results */}
            {entry.role === 'model' && entry.type === 'investigation' && (
              <div className="mt-2 text-[10px] uppercase tracking-widest text-cyan-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Pensamento
              </div>
            )}
             {entry.type === 'debug' && entry.role !== 'user' && (
              <div className="mt-2 text-[10px] uppercase tracking-widest text-green-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
                System Log
              </div>
            )}
          </div>
        </div>
      ))}

      {isProcessing && (
        <div className="max-w-3xl mx-auto py-4">
          <div className="flex items-center gap-3 opacity-30">
            <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isInvestigationMode ? 'bg-cyan-400' : 'bg-stone-400'}`}></div>
            <div className={`w-1.5 h-1.5 rounded-full animate-bounce delay-100 ${isInvestigationMode ? 'bg-cyan-400' : 'bg-stone-400'}`}></div>
            <div className={`w-1.5 h-1.5 rounded-full animate-bounce delay-200 ${isInvestigationMode ? 'bg-cyan-400' : 'bg-stone-400'}`}></div>
          </div>
        </div>
      )}

      <div className="h-32"></div> {/* Bottom spacer */}
    </div>
  );
};

export default GameLog;