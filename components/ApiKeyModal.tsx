import React, { useEffect, useState } from 'react';

// We remove the global declaration to rely on the environment's provided types
// or simply use 'any' casting for window if strictly necessary, but standard valid checks are safer.

interface ApiKeyModalProps {
  onKeySelected: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onKeySelected }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkKey = async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (hasKey) {
        setIsVisible(false);
        onKeySelected();
      }
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (!window.aistudio) {
        setError("O sistema de seleção de chave não foi detectado.");
        return;
    }

    try {
      await window.aistudio.openSelectKey();
      await checkKey();
    } catch (err) {
      console.error(err);
      setError("Falha ao selecionar a chave API. Tente novamente.");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-sm p-8 max-w-md w-full shadow-2xl text-center">
        <h2 className="text-3xl font-serif text-stone-200 mb-2 tracking-wide">CRONOS</h2>
        <div className="h-px w-16 bg-amber-900 mx-auto mb-6"></div>
        
        <p className="text-stone-500 mb-8 text-sm leading-relaxed">
          Para iniciar a simulação neural, é necessário autenticar o acesso ao núcleo de processamento (Gemini API).
        </p>
        
        {error && <p className="text-red-900/80 bg-red-900/10 p-2 mb-4 text-xs border border-red-900/20">{error}</p>}

        <button
          onClick={handleSelectKey}
          className="w-full py-3 px-6 bg-stone-800 hover:bg-amber-900/30 border border-stone-700 hover:border-amber-800 text-stone-300 hover:text-amber-500 font-serif tracking-widest uppercase text-xs transition-all duration-300 mb-6"
        >
          Autenticar Chave
        </button>

        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] text-stone-700 hover:text-stone-500 uppercase tracking-wider"
        >
          Protocolos de Faturamento
        </a>
      </div>
    </div>
  );
};

export default ApiKeyModal;