
import React, { useEffect, useRef } from 'react';
import { ChatEntry } from '../types';

interface GameLogProps {
  history: ChatEntry[];
  isProcessing: boolean;
  isInvestigationMode: boolean;
}

// --- RICH TEXT PARSER ---
// Transforma tags [[TYPE: Value]] em componentes React estilizados
const RichTextRenderer: React.FC<{ text: string }> = ({ text }) => {
    // Regex para capturar tags: [[TYPE: Content]]
    // Grupos: 1=TYPE, 2=Content
    const parts = text.split(/\[\[(LOC|ITEM|NPC|LORE):(.+?)\]\]/g);

    if (parts.length === 1) return <span>{text}</span>;

    const elements: React.ReactNode[] = [];
    
    // O split com regex e grupos de captura funciona assim:
    // [texto_antes, TIPO_TAG, CONTEUDO_TAG, texto_depois, TIPO_TAG_2, CONTEUDO_TAG_2...]
    for (let i = 0; i < parts.length; i += 3) {
        // Texto normal antes da tag
        elements.push(<span key={`txt-${i}`}>{parts[i]}</span>);

        // Se houver tag capturada
        if (i + 2 < parts.length) {
            const type = parts[i + 1];
            const content = parts[i + 2].trim();
            
            let className = "";
            let icon = "";

            switch (type) {
                case 'LOC':
                    className = "text-emerald-400 font-bold hover:underline cursor-help decoration-emerald-800 underline-offset-4";
                    icon = "📍 ";
                    break;
                case 'ITEM':
                    className = "text-amber-400 font-bold hover:underline cursor-help decoration-amber-800 underline-offset-4";
                    icon = "📦 ";
                    break;
                case 'NPC':
                    className = "text-purple-400 font-bold hover:underline cursor-help decoration-purple-800 underline-offset-4";
                    icon = "👤 ";
                    break;
                case 'LORE':
                    className = "text-blue-400 font-bold hover:underline cursor-help decoration-blue-800 underline-offset-4";
                    icon = "📜 ";
                    break;
                default:
                    className = "text-stone-300 font-bold";
            }

            elements.push(
                <span key={`tag-${i}`} className={className} title={type}>
                   {/* Opcional: Remover ícone se preferir só texto colorido */}
                   {content}
                </span>
            );
        }
    }

    return <>{elements}</>;
};


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
          <div className={`w-full ${
            entry.role === 'user'
              ? `max-w-[70%] text-right font-mono text-sm mt-4 mb-2 border-r-2 pr-4 ${
                  entry.type === 'investigation' ? 'text-cyan-400 border-cyan-800' : 
                  entry.type === 'debug' ? 'text-green-400 border-green-800' : 'text-stone-400 border-stone-800'
                }`
              : `max-w-full text-lg md:text-xl font-serif leading-relaxed text-justify ${
                  entry.type === 'investigation' ? 'text-cyan-100 border-l-4 border-cyan-900/50 pl-4 italic bg-cyan-950/10 py-2' :
                  entry.type === 'debug' ? 'text-green-500 font-mono text-sm border border-green-900/30 bg-green-950/20 p-4 rounded' :
                  'text-stone-300'
                }`
          }`}>
            
            {/* Text Rendering */}
            {entry.role === 'system' && entry.type !== 'debug' ? (
              <span className="text-red-900/80 block border border-red-900/30 p-2 text-xs font-sans uppercase tracking-widest">{entry.text}</span>
            ) : (
              entry.text.split('\n').map((line, i) => (
                 <p key={i} className="mb-4 last:mb-0">
                    <RichTextRenderer text={line} />
                 </p>
              ))
            )}

            {/* Labels */}
            {entry.role === 'model' && entry.type === 'investigation' && (
              <div className="mt-2 text-[10px] uppercase tracking-widest text-cyan-700">Pensamento</div>
            )}
             {entry.type === 'debug' && entry.role !== 'user' && (
              <div className="mt-2 text-[10px] uppercase tracking-widest text-green-800">System Log</div>
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

      <div className="h-32"></div>
    </div>
  );
};

export default GameLog;
