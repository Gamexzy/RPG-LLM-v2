
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
    <div className="flex-1 flex flex-col p-6 animate-fade-in overflow-y-auto">
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 max-w-6xl w-full mx-auto">
        
        {/* ESQUERDA: Cabeçalho e Controles */}
        {/* FIX: Mudado para md:sticky para evitar sobreposição mobile */}
        <div className="md:w-1/3 flex flex-col md:justify-between md:sticky md:top-0 md:h-[calc(100vh-180px)]">
            <div>
                <h2 className="text-3xl md:text-5xl font-serif text-stone-200 tracking-tight leading-none">Mundos</h2>
                <div className="h-px w-16 bg-amber-900/50 mt-4 mb-2"></div>
                <p className="text-stone-500 text-xs uppercase tracking-widest mb-6">
                    Módulo de Arquitetura
                </p>

                <div className="hidden md:block space-y-4 text-stone-600 text-sm leading-relaxed">
                    <p>{step === 1 ? 'Defina a base da realidade. Nome, gênero e a sensação física de existir neste lugar.' : 'Detalhe as regras impossíveis. Como a magia funciona? Onde terminam as estrelas?'}</p>
                </div>
            </div>

            <div className="mt-8 md:mt-0 flex flex-col gap-3">
                 {/* Navigation Buttons */}
                {step === 2 ? (
                    <button
                        onClick={() => setStep(1)}
                        className="px-6 py-4 border border-stone-800 text-stone-500 hover:text-stone-300 hover:bg-stone-900 transition-colors text-xs uppercase tracking-widest w-full text-center"
                    >
                        ← Voltar
                    </button>
                ) : (
                    <button
                        onClick={onCancel}
                        className="px-6 py-4 border border-stone-800 text-stone-500 hover:text-stone-300 hover:bg-stone-900 transition-colors text-xs uppercase tracking-widest w-full text-center"
                    >
                        Cancelar
                    </button>
                )}

                {step === 1 ? (
                    <button
                        onClick={() => setStep(2)}
                        disabled={!formData.name || !formData.genre}
                        className="px-6 py-4 bg-stone-900 border border-stone-800 text-amber-500 hover:bg-amber-900/10 hover:border-amber-900 transition-colors text-xs uppercase tracking-widest w-full text-center disabled:opacity-30"
                    >
                        Próximo: Leis Físicas →
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        className="px-6 py-4 bg-amber-900/20 border border-amber-900/30 text-amber-500 hover:bg-amber-900/40 hover:border-amber-700 transition-colors text-xs uppercase tracking-widest w-full text-center"
                    >
                        Materializar Universo
                    </button>
                )}
            </div>
        </div>

        {/* DIREITA: Formulário */}
        <div className="md:w-2/3 md:border-l md:border-stone-800 md:pl-12">
            <div className="space-y-6">
                 {step === 1 && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Nome do Universo *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-stone-950 border-b border-stone-800 py-2 text-xl text-stone-300 focus:border-amber-700 focus:outline-none transition-colors font-serif placeholder-stone-800"
                                    placeholder="Ex: Neo-Veridia"
                                    autoFocus
                                />
                            </div>
                            <div className="group">
                                <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Gênero *</label>
                                <input
                                    type="text"
                                    value={formData.genre}
                                    onChange={e => setFormData({ ...formData, genre: e.target.value })}
                                    className="w-full bg-stone-950 border-b border-stone-800 py-2 text-xl text-stone-300 focus:border-amber-700 focus:outline-none transition-colors font-serif placeholder-stone-800"
                                    placeholder="Ex: Dark Fantasy"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Atmosfera & Sensação</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-stone-900/30 border border-stone-800 p-4 text-stone-300 focus:border-amber-700 focus:outline-none rounded-sm h-32 resize-none text-sm leading-relaxed"
                                placeholder="Descreva o cheiro, a luz e a sensação deste mundo..."
                            />
                        </div>

                        <div className="bg-stone-900/20 p-6 border border-stone-800 rounded-sm space-y-6">
                             <h3 className="text-stone-500 text-[10px] uppercase tracking-widest border-b border-stone-800 pb-2">Topologia</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-stone-400 text-[10px] uppercase tracking-widest mb-2">Estrutura</label>
                                    <select
                                        value={formData.structure}
                                        onChange={e => setFormData({ ...formData, structure: e.target.value as UniverseStructure })}
                                        className="w-full bg-stone-950 border border-stone-800 py-2 px-3 text-sm text-stone-300 focus:border-amber-700 focus:outline-none"
                                    >
                                        <option value="singular_world">Mundo Único / Plano Infinito</option>
                                        <option value="star_cluster">Galáxia / Aglomerado</option>
                                        <option value="multiverse_hub">Nexus Multiversal</option>
                                    </select>
                                </div>
                                <div className="group">
                                    <label className="block text-stone-400 text-[10px] uppercase tracking-widest mb-2">Viagem</label>
                                    <select
                                        value={formData.navigationMethod}
                                        onChange={e => setFormData({ ...formData, navigationMethod: e.target.value as NavigationMethod })}
                                        className="w-full bg-stone-950 border border-stone-800 py-2 px-3 text-sm text-stone-300 focus:border-amber-700 focus:outline-none"
                                    >
                                        <option value="physical">Física (Terrestre)</option>
                                        <option value="interstellar_ship">Naves Espaciais</option>
                                        <option value="magical_gate">Portais / Teleporte</option>
                                        <option value="dream_walking">Sonho / Astral</option>
                                    </select>
                                </div>
                             </div>
                        </div>
                    </div>
                 )}

                 {step === 2 && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="group">
                            <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Sistema de Poder (Magia/Tech)</label>
                            <textarea
                                value={formData.magicSystem}
                                onChange={e => setFormData({ ...formData, magicSystem: e.target.value })}
                                className="w-full bg-stone-900/30 border border-stone-800 p-4 text-cyan-100/80 focus:border-cyan-900 focus:outline-none rounded-sm h-32 resize-none text-sm leading-relaxed"
                                placeholder="Como o impossível acontece aqui? Nanomáquinas? Runas?"
                                autoFocus
                            />
                        </div>
                        
                        <div className="group">
                            <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Cosmologia</label>
                            <input
                                type="text"
                                value={formData.cosmology}
                                onChange={e => setFormData({ ...formData, cosmology: e.target.value })}
                                className="w-full bg-stone-950 border-b border-stone-800 py-2 text-sm text-stone-400 focus:border-amber-900 focus:outline-none transition-colors placeholder-stone-800"
                                placeholder="Ex: Sistema Solar Binário, 9 Reinos, Terra Oca..."
                            />
                        </div>

                        <div className="group">
                            <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Leis Absolutas</label>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newLaw}
                                    onChange={e => setNewLaw(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addLaw()}
                                    className="flex-1 bg-stone-950/50 border border-stone-800 p-2 text-sm text-stone-300 focus:border-amber-700 focus:outline-none"
                                    placeholder="Nova regra (Enter para adicionar)..."
                                />
                                <button onClick={addLaw} className="px-4 bg-stone-800 text-stone-400 hover:text-amber-500 border border-stone-700">+</button>
                            </div>
                            <ul className="space-y-2">
                                {formData.physics?.map((law, idx) => (
                                    <li key={idx} className="flex justify-between items-center bg-stone-900/40 p-3 border-l-2 border-amber-900/50 text-xs text-stone-400">
                                    <span>{law}</span>
                                    <button onClick={() => removeLaw(idx)} className="text-stone-600 hover:text-red-500 px-2">×</button>
                                    </li>
                                ))}
                                {(!formData.physics || formData.physics.length === 0) && (
                                    <li className="text-stone-700 italic text-xs p-2">Nenhuma lei especial definida.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UniverseCreator;
