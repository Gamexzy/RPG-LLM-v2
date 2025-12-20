
import React from 'react';

interface SettingsScreenProps {
  backendStatus: 'checking' | 'online' | 'offline';
  onRestoreDefaults: () => void;
  onFactoryReset: () => void;
  userId?: string;
  onLogout: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ backendStatus, onRestoreDefaults, onFactoryReset, userId, onLogout }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-stone-500 text-sm p-8 animate-fade-in overflow-y-auto pb-24">
      <div className="text-center space-y-4 max-w-md w-full">
        <h2 className="text-2xl font-serif text-stone-300">Sistema Cronos</h2>
        <p className="text-xs uppercase tracking-widest border-b border-stone-900 pb-4">Diagnósticos & Configuração</p>
        
        <div className="bg-stone-900/30 p-6 rounded border border-stone-800 text-left space-y-6">
          
          <div className="border-b border-stone-800 pb-2 mb-2 flex justify-between items-center">
             <h3 className="text-stone-400 font-serif text-sm uppercase tracking-wider">Identidade</h3>
             <span className="text-[10px] text-amber-500 bg-stone-900 px-2 py-0.5 rounded font-mono">{userId || 'Desconhecido'}</span>
          </div>

          <div className="border-b border-stone-800 pb-2 mb-2 flex justify-between items-center">
             <h3 className="text-stone-400 font-serif text-sm uppercase tracking-wider">Topologia de Rede</h3>
             <span className="text-[9px] text-stone-600 bg-stone-900 px-2 py-0.5 rounded">2 Nós Ativos</span>
          </div>

          {/* Google API Status */}
          <div>
            <label className="block text-[10px] uppercase text-stone-500 mb-1 flex items-center justify-between">
               <span>Núcleo Neural (LLM)</span>
               <span className="text-stone-600">Google Cloud</span>
            </label>
            <div className="flex items-center gap-2 text-green-500 text-xs font-mono bg-stone-950/50 p-2 rounded border border-stone-900">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Gemini 2.5 API (Conectado)
            </div>
          </div>

          {/* Backend/RAG Status */}
          <div>
            <label className="block text-[10px] uppercase text-stone-500 mb-1 flex items-center justify-between">
               <span>Orquestrador de Memória</span>
               <span className="text-stone-600">Servidor RAG (Python)</span>
            </label>
            <div className={`flex items-center gap-2 text-xs font-mono bg-stone-950/50 p-2 rounded border border-stone-900 transition-colors duration-300 ${
              backendStatus === 'online' ? 'text-green-500 border-green-900/30' : backendStatus === 'checking' ? 'text-amber-500' : 'text-red-500 border-red-900/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                backendStatus === 'online' ? 'bg-green-500 animate-pulse' : backendStatus === 'checking' ? 'bg-amber-500 animate-bounce' : 'bg-red-500'
              }`}></span>
              {backendStatus === 'checking' ? 'Negociando handshake...' : backendStatus === 'online' ? 'Link Neural Estável' : 'Sinal Perdido (Offline)'}
            </div>
            
            <div className="mt-2 pl-3 border-l-2 border-stone-800 space-y-1">
               <div className="flex items-center justify-between text-[10px] py-1">
                  <span className="text-stone-400">Vector Store (ChromaDB)</span>
                  <span className={backendStatus === 'online' ? "text-green-600" : "text-stone-700"}>{backendStatus === 'online' ? '●' : '○'}</span>
               </div>
               <div className="flex items-center justify-between text-[10px] py-1">
                  <span className="text-stone-400">Knowledge Graph (Neo4j)</span>
                  <span className={backendStatus === 'online' ? "text-green-600" : "text-stone-700"}>{backendStatus === 'online' ? '●' : '○'}</span>
               </div>
               <div className="flex items-center justify-between text-[10px] py-1">
                  <span className="text-stone-400">Event Logs (SQLite)</span>
                  <span className={backendStatus === 'online' ? "text-green-600" : "text-stone-700"}>{backendStatus === 'online' ? '●' : '○'}</span>
               </div>
            </div>

            {backendStatus === 'offline' && (
              <p className="text-[10px] text-red-900/70 mt-2 italic border-t border-red-900/10 pt-1">
                A persistência de longo prazo está indisponível. A simulação usará apenas a memória de contexto (RAM).
              </p>
            )}
          </div>
          
          <div className="h-px bg-stone-800 w-full my-4"></div>

          <div>
            <label className="block text-[10px] uppercase text-stone-600 mb-1">Versão do Cliente</label>
            <span className="text-stone-400 text-xs font-mono">v2.1.0 (Auth + Multi-Tenant)</span>
          </div>

           <div>
            <label className="block text-[10px] uppercase text-stone-600 mb-1">Manutenção</label>
            <div className="flex flex-col gap-2">
               <button onClick={onRestoreDefaults} className="text-amber-500 hover:text-amber-400 text-xs text-left p-2 hover:bg-stone-950/50 rounded transition-colors">
                 Restaurar Templates de Exemplo
               </button>
               <button onClick={onFactoryReset} className="text-red-500 hover:text-red-400 text-xs text-left p-2 hover:bg-stone-950/50 rounded transition-colors">
                 Limpar Dados Locais (Reset Fábrica)
               </button>
                <div className="h-px bg-stone-800 w-full my-1"></div>
               <button 
                type="button" 
                onClick={onLogout} 
                className="text-stone-400 hover:text-white hover:bg-red-900/20 hover:border-red-900/50 border border-transparent text-xs text-left flex items-center gap-2 p-3 rounded transition-all duration-200 group w-full"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                 </svg>
                 Encerrar Sessão
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
