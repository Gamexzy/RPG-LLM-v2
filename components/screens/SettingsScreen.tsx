
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
    <div className="flex-1 flex flex-col p-6 animate-fade-in pb-24 overflow-y-auto">
       <div className="flex flex-col md:flex-row gap-8 md:gap-16 max-w-6xl w-full mx-auto h-full">
        
         {/* ESQUERDA: Branding */}
         {/* FIX: Mudado de 'sticky top-0' para 'md:sticky md:top-0' para evitar sobreposição no mobile */}
         <div className="md:w-1/3 flex flex-col md:justify-between md:sticky md:top-0 md:h-[calc(100vh-180px)]">
             <div>
                <h2 className="text-4xl md:text-5xl font-serif text-stone-200 tracking-tight leading-none">Sistema</h2>
                <div className="h-px w-12 bg-amber-900/50 mt-4 mb-2"></div>
                <p className="text-stone-500 text-xs uppercase tracking-widest mb-6">Diagnósticos & Configuração</p>
                <div className="text-xs font-mono text-stone-600">
                    <p>Build: v2.1.0</p>
                    <p>Core: Gemini 2.5 Flash</p>
                </div>
             </div>

             <div className="mt-8 md:mt-0">
                <button 
                    type="button" 
                    onClick={onLogout} 
                    className="text-stone-400 hover:text-white hover:bg-red-900/20 hover:border-red-900/50 border border-stone-800 text-xs text-center p-4 w-full transition-all duration-200 uppercase tracking-widest"
                >
                    Encerrar Sessão Neural
                </button>
             </div>
         </div>

         {/* DIREITA: Status e Ações */}
         <div className="md:w-2/3 md:border-l md:border-stone-800 md:pl-12">
            <div className="space-y-6">
                
                {/* IDENTIDADE */}
                <div className="bg-stone-900/20 p-6 border border-stone-800 rounded-sm">
                    <h3 className="text-stone-500 text-[10px] uppercase tracking-widest border-b border-stone-800 pb-2 mb-4">Credenciais</h3>
                    <div className="flex justify-between items-center">
                        <span className="text-stone-400 font-serif">ID do Operador</span>
                        <span className="text-xs font-mono text-amber-500 bg-stone-950 px-3 py-1 rounded border border-stone-900">
                            {userId || 'ANONYMOUS_GHOST'}
                        </span>
                    </div>
                </div>

                {/* REDE */}
                <div className="bg-stone-900/20 p-6 border border-stone-800 rounded-sm space-y-4">
                    <h3 className="text-stone-500 text-[10px] uppercase tracking-widest border-b border-stone-800 pb-2 mb-4">Topologia de Rede</h3>
                    
                    {/* Google API */}
                    <div className="flex items-center justify-between">
                         <span className="text-stone-400 text-sm">Núcleo Neural (LLM)</span>
                         <div className="flex items-center gap-2 text-[10px] text-green-500 font-mono bg-stone-950/50 px-2 py-1 rounded border border-stone-900">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            ONLINE
                        </div>
                    </div>

                    {/* Backend RAG */}
                    <div className="flex items-center justify-between">
                         <span className="text-stone-400 text-sm">Memória Externa (RAG)</span>
                         <div className={`flex items-center gap-2 text-[10px] font-mono bg-stone-950/50 px-2 py-1 rounded border border-stone-900 ${
                            backendStatus === 'online' ? 'text-green-500' : backendStatus === 'checking' ? 'text-amber-500' : 'text-red-500'
                         }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                backendStatus === 'online' ? 'bg-green-500 animate-pulse' : backendStatus === 'checking' ? 'bg-amber-500 animate-bounce' : 'bg-red-500'
                            }`}></span>
                            {backendStatus === 'online' ? 'CONECTADO' : backendStatus === 'checking' ? 'NEGOCIANDO...' : 'OFFLINE'}
                        </div>
                    </div>

                    {backendStatus === 'online' && (
                        <div className="mt-2 pl-2 border-l border-stone-800 space-y-1">
                             <div className="flex justify-between text-[10px] text-stone-600">
                                <span>Neo4j Graph</span>
                                <span>Active</span>
                             </div>
                             <div className="flex justify-between text-[10px] text-stone-600">
                                <span>ChromaDB Vector</span>
                                <span>Active</span>
                             </div>
                        </div>
                    )}
                </div>

                {/* MANUTENÇÃO */}
                <div className="bg-stone-900/20 p-6 border border-stone-800 rounded-sm">
                    <h3 className="text-stone-500 text-[10px] uppercase tracking-widest border-b border-stone-800 pb-2 mb-4">Protocolos de Manutenção</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={onRestoreDefaults} className="text-stone-400 hover:text-amber-500 text-xs border border-stone-800 hover:border-amber-900 p-3 transition-colors text-left">
                            Restaurar Templates
                        </button>
                        <button onClick={onFactoryReset} className="text-stone-400 hover:text-red-500 text-xs border border-stone-800 hover:border-red-900 p-3 transition-colors text-left">
                            Factory Reset (Limpar Cache)
                        </button>
                    </div>
                </div>

            </div>
         </div>
       </div>
    </div>
  );
};

export default SettingsScreen;
