
import React, { useState } from 'react';

interface EntryScreenProps {
  onEnter: () => void;
}

const EntryScreen: React.FC<EntryScreenProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(onEnter, 800); // Wait for animation
  };

  return (
    <div className={`fixed inset-0 z-40 bg-stone-950 flex flex-col items-center justify-center transition-opacity duration-1000 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-900/40 via-stone-950 to-stone-950 pointer-events-none"></div>

      <div className="relative z-10 text-center space-y-12 p-8 max-w-4xl w-full">
        
        {/* Title Group */}
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-4 text-stone-600 mb-6">
             <div className="h-px w-12 bg-stone-800"></div>
             <span className="text-[10px] uppercase tracking-[0.3em]">Neural Simulation Engine</span>
             <div className="h-px w-12 bg-stone-800"></div>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-serif text-stone-200 tracking-[0.15em] uppercase drop-shadow-2xl">
            Cronos
          </h1>
          
          <p className="text-stone-500 text-sm md:text-base font-light tracking-widest mt-4">
            O MUNDO VIVO . MEMÓRIA ETERNA . AGENTES AUTÔNOMOS
          </p>
        </div>

        {/* Action Area */}
        <div className="pt-12 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          <button 
            onClick={handleEnter}
            className="group relative px-12 py-4 bg-transparent overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full border border-stone-800 transition-all duration-300 group-hover:border-amber-900/50 group-hover:bg-stone-900/30"></div>
            <div className="absolute inset-0 w-0 h-full bg-amber-900/10 transition-all duration-700 ease-out group-hover:w-full"></div>
            
            <span className="relative text-stone-400 font-serif tracking-[0.2em] text-xs uppercase group-hover:text-amber-500 transition-colors">
              Iniciar Conexão
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center opacity-30 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'both' }}>
          <p className="text-[9px] text-stone-600 uppercase tracking-wider">
            Powered by Google Gemini 2.5 Pro & Flash
          </p>
        </div>

      </div>
    </div>
  );
};

export default EntryScreen;
