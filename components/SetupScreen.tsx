import React, { useState } from 'react';

const PRESETS = [
  {
    label: "Cyberpunk: Neon Rain",
    name: "Kael",
    setting: "Neo-Veridia, 2099. Beco atrás do clube 'Synapse'. Ferido, chuva ácida, corporativos da Arasaka te caçando por um chip de dados."
  },
  {
    label: "Medieval: A Masmorra",
    name: "Thoric",
    setting: "Masmorras de Eldoria. Escuridão, umidade, o som de algo grande se arrastando. Você tem apenas um pedaço de osso afiado."
  },
  {
    label: "Apocalipse: O Abrigo",
    name: "Eli",
    setting: "Dia 450 após a Queda. Bunker 42 sem ar. Radiação lá fora. Você precisa sair para encontrar um filtro de ar novo."
  },
  {
    label: "Terror Cósmico: A Estação",
    name: "Dra. Ripley",
    setting: "Estação de Pesquisa Omega-9, órbita de Saturno. A tripulação sumiu. O silêncio é absoluto, exceto por um sussurro nos dutos de ventilação."
  }
];

interface SetupScreenProps {
  onStart: (name: string, setting: string) => void;
  isProcessing: boolean;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, isProcessing }) => {
  const [setupData, setSetupData] = useState({ name: '', setting: '' });

  const handleStart = () => {
    if (!setupData.name.trim() || !setupData.setting.trim()) return;
    onStart(setupData.name, setupData.setting);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-stone-950">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-serif text-stone-200 tracking-tight">Gênese</h2>
          <p className="text-stone-500 text-sm font-light">Onde sua consciência desperta?</p>
        </div>

        <div className="space-y-6">
          <div className="group">
            <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2 group-focus-within:text-amber-600 transition-colors">Identidade</label>
            <input
              type="text"
              value={setupData.name}
              onChange={e => setSetupData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome ou alcunha..."
              className="w-full bg-transparent border-b border-stone-800 py-2 text-xl text-stone-200 placeholder-stone-800 focus:border-amber-700 focus:outline-none transition-colors font-serif"
            />
          </div>
          <div className="group">
            <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2 group-focus-within:text-amber-600 transition-colors">Realidade Inicial</label>
            <textarea
              value={setupData.setting}
              onChange={e => setSetupData(prev => ({ ...prev, setting: e.target.value }))}
              placeholder="Descreva o ambiente, o perigo imediato ou a calmaria antes da tempestade..."
              className="w-full bg-stone-900/30 border border-stone-800 p-4 text-stone-300 focus:border-amber-700 focus:outline-none rounded-sm h-24 resize-none text-sm leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setSetupData({ name: preset.name, setting: preset.setting })}
                className="text-left p-3 border border-stone-800 hover:bg-stone-900 hover:border-amber-900/50 transition-all group rounded-sm"
              >
                <div className="text-[10px] text-amber-900 group-hover:text-amber-600 font-bold tracking-wider uppercase">{preset.label}</div>
                <div className="text-stone-600 group-hover:text-stone-400 text-[10px] truncate">{preset.setting}</div>
              </button>
            ))}
          </div>

          <button
            onClick={handleStart}
            disabled={isProcessing}
            className={`w-full py-4 mt-4 text-center font-serif tracking-widest text-sm uppercase transition-all border border-transparent ${
              isProcessing
                ? 'text-stone-600 cursor-wait'
                : 'bg-amber-900/20 hover:bg-amber-900/40 text-amber-500 border-amber-900/30 hover:border-amber-700'
            }`}
          >
            {isProcessing ? 'Materializando...' : 'Despertar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;