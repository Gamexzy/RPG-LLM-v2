
import React, { useState } from 'react';
import { CharacterTemplate } from '../../types';

interface CharacterCreatorProps {
  onSave: (template: Omit<CharacterTemplate, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<CharacterTemplate>>({ name: '', description: '', archetype: '' });

  const handleSave = () => {
      if (!formData.name || !formData.archetype) return;
      onSave(formData as Omit<CharacterTemplate, 'id' | 'createdAt'>);
  };

  return (
    <div className="flex-1 flex flex-col p-6 animate-fade-in overflow-y-auto">
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 max-w-6xl w-full mx-auto">
        
         {/* ESQUERDA: Cabeçalho e Ações */}
         {/* FIX: Mudado para md:sticky para evitar sobreposição mobile */}
         <div className="md:w-1/3 flex flex-col md:justify-between md:sticky md:top-0 md:h-[calc(100vh-180px)]">
             <div>
                <h2 className="text-3xl md:text-5xl font-serif text-stone-200 tracking-tight leading-none">Almas</h2>
                <div className="h-px w-16 bg-amber-900/50 mt-4 mb-2"></div>
                <p className="text-stone-500 text-xs uppercase tracking-widest mb-6">
                    Módulo de Encarnação
                </p>
                <div className="hidden md:block space-y-4 text-stone-600 text-sm leading-relaxed">
                    <p>O "Ator" é a consciência que viaja entre mundos. Sua memória persiste, mas sua forma física se adapta a cada nova realidade.</p>
                </div>
             </div>

             <div className="mt-8 md:mt-0 flex flex-col gap-3">
                 <button
                    onClick={onCancel}
                    className="px-6 py-4 border border-stone-800 text-stone-500 hover:text-stone-300 hover:bg-stone-900 transition-colors text-xs uppercase tracking-widest w-full text-center"
                 >
                    Cancelar
                 </button>
                 <button
                    onClick={handleSave}
                    disabled={!formData.name || !formData.archetype}
                    className="px-6 py-4 bg-amber-900/20 border border-amber-900/30 text-amber-500 hover:bg-amber-900/40 hover:border-amber-700 transition-colors text-xs uppercase tracking-widest w-full text-center disabled:opacity-30 disabled:cursor-not-allowed"
                 >
                    Criar Ator
                 </button>
             </div>
         </div>

         {/* DIREITA: Inputs */}
         <div className="md:w-2/3 md:border-l md:border-stone-800 md:pl-12">
             <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                        <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Nome do Ator *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Kael"
                            className="w-full bg-stone-950 border-b border-stone-800 py-2 text-xl text-stone-300 focus:border-amber-700 focus:outline-none transition-colors font-serif placeholder-stone-800"
                            autoFocus
                        />
                    </div>
                    <div className="group">
                        <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Arquétipo / Papel *</label>
                        <input
                            type="text"
                            value={formData.archetype}
                            onChange={e => setFormData({ ...formData, archetype: e.target.value })}
                            placeholder="Ex: Mercenário, Mago..."
                            className="w-full bg-stone-950 border-b border-stone-800 py-2 text-xl text-stone-300 focus:border-amber-700 focus:outline-none transition-colors font-serif placeholder-stone-800"
                        />
                    </div>
                </div>

                <div className="group">
                     <label className="block text-amber-900 text-[10px] uppercase tracking-widest mb-2">Essência (Personalidade Imutável)</label>
                     <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descreva quem ele É, não o que ele veste. Ex: 'Um covarde charmoso que busca redenção'..."
                        className="w-full bg-stone-900/30 border border-stone-800 p-6 text-stone-300 focus:border-amber-700 focus:outline-none rounded-sm h-64 resize-none text-sm leading-relaxed"
                      />
                </div>
             </div>
         </div>

      </div>
    </div>
  );
};

export default CharacterCreator;
