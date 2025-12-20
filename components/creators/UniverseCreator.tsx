
import React, { useState } from 'react';
import { UniverseTemplate, UniverseStructure, NavigationMethod } from '../../types';

interface UniverseCreatorProps {
  onSave: (template: Omit<UniverseTemplate, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const UniverseCreator: React.FC<UniverseCreatorProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<UniverseTemplate>>({
    name: '',
    description: '',
    genre: '',
    physics: [],
    magicSystem: '',
    cosmology: '',
    structure: 'singular_world',
    navigationMethod: 'physical',
    chronicles: [],
    worlds: []
  });
  
  const [newLaw, setNewLaw] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  const addLaw = () => {
    if (newLaw.trim()) {
      setFormData(prev => ({ ...prev, physics: [...(prev.physics || []), newLaw.trim()] }));
      setNewLaw('');
    }
  };

  const removeLaw = (index: number) => {
    setFormData(prev => ({ ...prev, physics: prev.physics?.filter((_, i) => i !== index) }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.genre) return;
    onSave(formData as Omit<UniverseTemplate, 'id' | 'createdAt'>);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-stone-950 animate-fade-in pb-24 overflow-y-auto">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-stone-200 tracking-tight">Arquitetura de Mundo</h2>
          <p className="text-stone-600 text-xs uppercase tracking-widest mt-2">
            {step === 1 ? 'Fundação & Atmosfera' : 'Topologia & Leis'}
          </p>
        </div>

        <div className="bg-stone-900/20 p-8 border border-stone-800 rounded-sm space-y-6">
          
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Nome do Universo *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent border-b border-stone-800 py-2 text-lg text-stone-300 focus:border-amber-700 focus:outline-none transition-colors font-serif"
                    placeholder="Ex: Neo-Veridia"
                  />
                </div>
                <div className="group">
                  <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Gênero *</label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={e => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full bg-transparent border-b border-stone-800 py-2 text-lg text-stone-300 focus:border-amber-700 focus:outline-none transition-colors font-serif"
                    placeholder="Ex: Dark Fantasy"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Descrição Atmosférica</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-stone-950/50 border border-stone-800 p-4 text-stone-300 focus:border-amber-700 focus:outline-none rounded-sm h-32 resize-none text-sm leading-relaxed"
                  placeholder="Descreva o cheiro, a luz e a sensação deste mundo..."
                />
              </div>

               {/* NOVOS CONTROLES DE ESTRUTURA */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-950/30 p-4 border border-stone-800/50 rounded-sm">
                  <div className="group">
                    <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Estrutura Física (Escala)</label>
                    <select
                      value={formData.structure}
                      onChange={e => setFormData({ ...formData, structure: e.target.value as UniverseStructure })}
                      className="w-full bg-stone-900 border border-stone-700 py-2 px-3 text-sm text-stone-300 focus:border-amber-700 focus:outline-none"
                    >
                      <option value="singular_world">Mundo Único / Plano Infinito (Fantasia)</option>
                      <option value="star_cluster">Aglomerado Estelar / Galáxia (Sci-Fi)</option>
                      <option value="multiverse_hub">Nexus Multiversal (Abstrato)</option>
                    </select>
                    <p className="text-[9px] text-stone-600 mt-1">
                      {formData.structure === 'singular_world' ? 'Um único mapa contínuo. As viagens são terrestres.' : 'Múltiplos planetas separados pelo vácuo.'}
                    </p>
                  </div>
                  <div className="group">
                    <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Logística de Viagem</label>
                    <select
                      value={formData.navigationMethod}
                      onChange={e => setFormData({ ...formData, navigationMethod: e.target.value as NavigationMethod })}
                      className="w-full bg-stone-900 border border-stone-700 py-2 px-3 text-sm text-stone-300 focus:border-amber-700 focus:outline-none"
                    >
                      <option value="physical">Física (Caminhada / Montaria / Veículos)</option>
                      <option value="interstellar_ship">Naves Interestelares</option>
                      <option value="magical_gate">Portais / Teletransporte</option>
                      <option value="dream_walking">Caminhar nos Sonhos</option>
                    </select>
                  </div>
              </div>

            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="group">
                 <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Sistema de Magia / Tecnologia</label>
                 <textarea
                  value={formData.magicSystem}
                  onChange={e => setFormData({ ...formData, magicSystem: e.target.value })}
                  className="w-full bg-stone-950/50 border border-stone-800 p-4 text-cyan-200/80 focus:border-cyan-900 focus:outline-none rounded-sm h-24 resize-none text-sm leading-relaxed"
                  placeholder="Como o impossível acontece aqui? Ex: Nanomáquinas no sangue, pactos demoníacos..."
                />
              </div>
              
              <div className="group">
                <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Cosmologia / Estrutura Detalhada</label>
                <input
                  type="text"
                  value={formData.cosmology}
                  onChange={e => setFormData({ ...formData, cosmology: e.target.value })}
                  className="w-full bg-transparent border-b border-stone-800 py-2 text-sm text-stone-400 focus:border-amber-900 focus:outline-none transition-colors placeholder-stone-800"
                  placeholder="Ex: Sistema Solar Binário, 9 Reinos, Terra Plana Infinita..."
                />
              </div>

              <div className="group">
                <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Leis da Realidade (Física & Regras)</label>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newLaw}
                    onChange={e => setNewLaw(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addLaw()}
                    className="flex-1 bg-stone-950/50 border border-stone-800 p-2 text-sm text-stone-300 focus:border-amber-700 focus:outline-none"
                    placeholder="Ex: A gravidade é metade da Terra..."
                  />
                  <button onClick={addLaw} className="px-4 bg-stone-800 text-stone-400 hover:text-amber-500 border border-stone-700">+</button>
                </div>
                <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {formData.physics?.map((law, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-stone-900/40 p-2 border-l-2 border-amber-900/50 text-xs text-stone-400">
                      <span>{law}</span>
                      <button onClick={() => removeLaw(idx)} className="text-stone-600 hover:text-red-500 px-2">×</button>
                    </li>
                  ))}
                  {(!formData.physics || formData.physics.length === 0) && (
                    <li className="text-stone-700 italic text-xs">Nenhuma lei especial definida.</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4 border-t border-stone-800/50">
            {step === 2 ? (
               <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-stone-800 text-stone-500 hover:text-stone-300 hover:bg-stone-900 transition-colors text-xs uppercase tracking-widest"
              >
                Voltar
              </button>
            ) : (
              <button
                onClick={onCancel}
                className="flex-1 py-3 border border-stone-800 text-stone-500 hover:text-stone-300 hover:bg-stone-900 transition-colors text-xs uppercase tracking-widest"
              >
                Cancelar
              </button>
            )}

            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.genre}
                className="flex-1 py-3 bg-stone-900 border border-stone-800 text-amber-500 hover:bg-amber-900/10 hover:border-amber-900 transition-colors text-xs uppercase tracking-widest disabled:opacity-30"
              >
                Próximo: Leis
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-amber-900/20 border border-amber-900/30 text-amber-500 hover:bg-amber-900/40 hover:border-amber-700 transition-colors text-xs uppercase tracking-widest"
              >
                Materializar Universo
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default UniverseCreator;
