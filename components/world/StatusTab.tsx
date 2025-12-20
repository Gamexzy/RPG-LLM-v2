
import React from 'react';
import { GameState, PlayerStats } from '../../types';

interface StatusTabProps {
  gameState: GameState;
}

const StatBar = ({ label, value, max, color }: { label: string, value: number, max: number, color: string }) => {
  const percentage = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[9px] uppercase tracking-tighter text-stone-500">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden border border-stone-800">
        <div 
          className={`h-full transition-all duration-1000 ${color}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const StatusTab: React.FC<StatusTabProps> = ({ gameState }) => {
  const visibleNPCs = gameState.world.npcs.filter(npc => npc.location === gameState.player.location);
  const { stats } = gameState.player;

  return (
    <>
      {/* Vital Stats */}
      <div className="space-y-4">
        <h3 className="text-stone-600 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
          <span className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]"></span>
          Sinais Vitais
        </h3>
        <div className="bg-stone-900/40 p-3 rounded border border-stone-800/50 space-y-4">
          <StatBar label="Vitalidade" value={stats.health} max={stats.maxHealth} color="bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.3)]" />
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
             <StatBar label="Força" value={stats.strength} max={20} color="bg-amber-700" />
             <StatBar label="Agilidade" value={stats.agility} max={20} color="bg-emerald-700" />
             <StatBar label="Mente" value={stats.intelligence} max={20} color="bg-cyan-700" />
             <StatBar label="Espírito" value={stats.spirit} max={20} color="bg-purple-700" />
          </div>
        </div>
      </div>

      {/* Proprioception (Status Text) */}
      <div className="space-y-2">
        <h3 className="text-stone-600 font-bold uppercase tracking-widest text-[10px]">Propriocepção</h3>
        <div className="bg-stone-900/30 border-l-2 border-amber-900/50 pl-3 py-1">
          <p className="text-stone-300 text-sm font-serif italic leading-relaxed">
            "{gameState.player.status}"
          </p>
        </div>
      </div>

      {/* Senses (Environment) */}
      <div className="space-y-3">
        <h3 className="text-stone-600 font-bold uppercase tracking-widest text-[10px]">Percepção Local</h3>
        <div className="grid gap-3 bg-stone-900/30 p-3 rounded border border-stone-800/30">
          <div>
            <span className="block text-stone-600 text-[10px] uppercase">Coordenadas</span>
            <span className="text-stone-200 text-sm font-serif">{gameState.player.location}</span>
          </div>
          <div className="flex justify-between">
            <div>
              <span className="block text-stone-600 text-[10px] uppercase">Cronômetro</span>
              <span className="text-amber-700/80 font-mono text-xs">{gameState.world.time}</span>
            </div>
            <div className="text-right">
              <span className="block text-stone-600 text-[10px] uppercase">Clima</span>
              <span className="text-stone-400 text-xs">{gameState.world.weather}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="space-y-3">
        <h3 className="text-stone-600 font-bold uppercase tracking-widest text-[10px]">Poses</h3>
        <div className="flex flex-wrap gap-2">
          {gameState.player.inventory.length > 0 ? (
            gameState.player.inventory.map((item, i) => (
              <span key={i} className="px-2 py-1 bg-stone-900 border border-stone-800 text-stone-400 text-[10px] rounded-sm hover:border-amber-900/50 hover:text-stone-200 transition-colors cursor-default">
                {item}
              </span>
            ))
          ) : (
            <span className="text-stone-700 italic text-[10px]">Vazio.</span>
          )}
        </div>
      </div>

      {/* NPCs */}
      <div className="space-y-3 pt-4 border-t border-stone-900">
        <h3 className="text-stone-600 font-bold uppercase tracking-widest text-[10px]">Entidades Detectadas</h3>
        {visibleNPCs.length > 0 ? (
          <ul className="space-y-3">
            {visibleNPCs.map((npc, i) => (
              <li key={i} className="text-xs bg-stone-900/30 p-2 rounded border border-stone-800/50">
                <div className="flex justify-between mb-1">
                  <span className={`font-serif ${npc.isNameKnown ? 'text-amber-500' : 'text-stone-500'}`}>
                    {npc.isNameKnown ? npc.name : npc.descriptor}
                  </span>
                  <span className="text-[9px] text-stone-700">{npc.status}</span>
                </div>
                <p className="text-stone-400 leading-tight">➜ {npc.action}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-700 italic text-[10px]">Nenhum rastro biológico.</p>
        )}
      </div>
    </>
  );
};

export default StatusTab;
