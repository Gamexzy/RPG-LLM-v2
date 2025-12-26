
import React from 'react';

type ViewState = 'HUB' | 'UNIVERSE_CREATOR' | 'CHARACTER_CREATOR' | 'ADVENTURE_CREATOR' | 'SETTINGS';

interface HubScreenProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const HubScreen: React.FC<HubScreenProps> = ({ currentView, onChangeView }) => {
  if (currentView !== 'HUB') return null;

  const menuItems = [
    {
      id: 'ADVENTURE_CREATOR',
      label: 'Nova Aventura',
      desc: 'Inicie uma simulação combinando um Universo e um Personagem.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
        </svg>
      ),
      color: 'text-amber-500',
      bg: 'hover:bg-amber-900/10 hover:border-amber-900/50'
    },
    {
      id: 'UNIVERSE_CREATOR',
      label: 'Criar Universo',
      desc: 'Defina as leis, a atmosfera e o cenário de um novo mundo.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S12 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S12 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.546-3.131 1.568-4.357" />
        </svg>
      ),
      color: 'text-stone-400',
      bg: 'hover:bg-stone-900/50 hover:border-stone-700'
    },
    {
      id: 'CHARACTER_CREATOR',
      label: 'Criar Personagem',
      desc: 'Molde a identidade, aparência e história de um protagonista.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
      color: 'text-stone-400',
      bg: 'hover:bg-stone-900/50 hover:border-stone-700'
    },
    {
      id: 'SETTINGS',
      label: 'Configurações',
      desc: 'Gerencie chaves de API e preferências do sistema.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'text-stone-500',
      bg: 'hover:bg-stone-900/50 hover:border-stone-700'
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-stone-950 animate-fade-in overflow-y-auto">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 max-w-6xl w-full">
            
            {/* ESQUERDA: Branding */}
            <div className="flex flex-col justify-center text-center md:text-left md:w-1/3">
                <h2 className="text-5xl md:text-7xl font-serif text-stone-200 tracking-widest uppercase leading-none">Nexus</h2>
                <div className="h-px w-24 bg-amber-900/50 mx-auto md:mx-0 mt-4 mb-2"></div>
                <p className="text-stone-600 text-xs uppercase tracking-[0.3em]">
                    Central de Criação
                </p>
                <p className="hidden md:block text-stone-700 text-sm mt-6 leading-relaxed italic">
                    "Aqui convergem todas as linhas do tempo. Construa universos, forje heróis e inicie jornadas."
                </p>
            </div>

            {/* DIREITA: Navegação */}
            <div className="md:w-2/3 md:border-l md:border-stone-800 md:pl-12 flex flex-col justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onChangeView(item.id as ViewState)}
                        className={`group flex items-start gap-4 p-6 border border-stone-800 rounded-sm transition-all duration-300 text-left ${item.bg}`}
                    >
                        <div className={`mt-1 transition-colors ${item.color} group-hover:text-amber-500`}>
                        {item.icon}
                        </div>
                        <div>
                        <h3 className="text-lg font-serif text-stone-300 group-hover:text-amber-100 transition-colors mb-1">
                            {item.label}
                        </h3>
                        <p className="text-xs text-stone-600 group-hover:text-stone-400 font-light leading-relaxed">
                            {item.desc}
                        </p>
                        </div>
                    </button>
                    ))}
                </div>
            </div>

        </div>
    </div>
  );
};

export default HubScreen;
