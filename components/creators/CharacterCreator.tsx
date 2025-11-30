import React, { useState } from 'react';
import { CharacterTemplate } from '../../types';

interface CharacterCreatorProps {
  onSave: (template: Omit<CharacterTemplate, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({ name: '', description: '', archetype: '' });

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-stone-950 animate-fade-in pb-24 overflow-y-auto">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-stone-200 tracking-tight">Gênese de Alma</h2>
          <p className="text-stone-600 text-xs uppercase tracking-widest mt-2">Modele o protagonista da história</p>
        </div>

        <div className="space-y-6 bg-stone-900/20 p-8 border border-stone-800 rounded-sm">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Kael"
                className="w-full bg-transparent border-b border-stone-800 py-2 text-lg text-stone-300 focus:border-amber-700 focus:outline-none transition-colors font-serif"
              />
            </div>
            <div className="group">
              <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Arquétipo / Profissão</label>
              <input
                type="text"
                value={formData.archetype}
                onChange={e => setFormData({ ...formData, archetype: e.target.value })}
                placeholder="Ex: Mercenário, Hacker, Mago..."
                className="w-full bg-transparent border-b border-stone-800 py-2 text-lg text-stone-300 focus:border-amber-700 focus:outline-none transition-colors font-serif"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">História e Aparência</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva a aparência física, cicatrizes, motivações e o que ele carrega..."
              className="w-full bg-stone-950/50 border border-stone-800 p-4 text-stone-300 focus:border-amber-700 focus:outline-none rounded-sm h-40 resize-none text-sm leading-relaxed"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onCancel}
              className="flex-1 py-3 border border-stone-800 text-stone-500 hover:text-stone-300 hover:bg-stone-900 transition-colors text-xs uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(formData)}
              disabled={!formData.name || !formData.description}
              className="flex-1 py-3 bg-amber-900/20 border border-amber-900/30 text-amber-500 hover:bg-amber-900/40 hover:border-amber-700 transition-colors text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Criar Personagem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreator;