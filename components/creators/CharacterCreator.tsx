
import React, { useState } from 'react';
import { CharacterTemplate } from '../../types';

interface CharacterCreatorProps {
  onSave: (template: Omit<CharacterTemplate, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  // universes prop removed as characters are now universal actors
}

const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<CharacterTemplate>>({ name: '', description: '', archetype: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSave = () => {
      if (!formData.name || !formData.archetype) return;
      onSave(formData as Omit<CharacterTemplate, 'id' | 'createdAt'>);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-stone-950 animate-fade-in pb-24 overflow-y-auto">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-stone-200 tracking-tight">Novo Ator</h2>
          <p className="text-stone-600 text-xs uppercase tracking-widest mt-2">Defina uma alma para atuar em qualquer palco</p>
        </div>

        <div className="space-y-6 bg-stone-900/20 p-8 border border-stone-800 rounded-sm">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2 flex justify-between">
                Nome do Ator/Personagem <span className="text-stone-600 text-[9px]">*Obrigatório</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Kael"
                className="w-full bg-transparent border-b border-stone-800 py-2 text-lg text-stone-300 focus:border-amber-700 focus:outline-none transition-colors font-serif placeholder-stone-800"
              />
            </div>
            <div className="group">
              <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2 flex justify-between">
                Papel Preferido / Arquétipo <span className="text-stone-600 text-[9px]">*Obrigatório</span>
              </label>
              <input
                type="text"
                value={formData.archetype}
                onChange={e => setFormData({ ...formData, archetype: e.target.value })}
                placeholder="Ex: Mercenário, Hacker, Mago..."
                className="w-full bg-transparent border-b border-stone-800 py-2 text-lg text-stone-300 focus:border-amber-700 focus:outline-none transition-colors font-serif placeholder-stone-800"
              />
            </div>
          </div>

          {/* Toggle Avançado */}
          <div className="pt-2">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-500 hover:text-amber-600 transition-colors w-full border-t border-stone-800/50 pt-4"
            >
              <span>{showAdvanced ? '[-]' : '[+]'}</span>
              Configurações Avançadas (Essência & Personalidade)
            </button>
            
            {showAdvanced && (
              <div className="mt-4 animate-fade-in space-y-2">
                <label className="block text-stone-600 text-[10px] uppercase tracking-widest">
                  Essência do Ator (Imutável)
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva a personalidade base que persistirá através dos universos. Ex: 'Um covarde charmoso', 'Um guerreiro que odeia violência'..."
                  className="w-full bg-stone-950/50 border border-stone-800 p-4 text-stone-300 focus:border-amber-700 focus:outline-none rounded-sm h-40 resize-none text-sm leading-relaxed"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onCancel}
              className="flex-1 py-3 border border-stone-800 text-stone-500 hover:text-stone-300 hover:bg-stone-900 transition-colors text-xs uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name || !formData.archetype}
              className="flex-1 py-3 bg-amber-900/20 border border-amber-900/30 text-amber-500 hover:bg-amber-900/40 hover:border-amber-700 transition-colors text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Criar Ator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreator;
