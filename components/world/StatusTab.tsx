
import React from 'react';
import { GameState } from '../../types';

interface StatusTabProps {
  gameState: GameState;
}

const StatusTab: React.FC<StatusTabProps> = ({ gameState }) => {
  // Filter NPCs to show only those in the same location as the player
  // This simulates the character's perception. Off-screen NPCs are simulated but not shown here.
  const visibleNPCs = gameState.world.npcs.filter(
    npc => npc.location === gameState.player.location
  );

  return (
    <>
      {/* Proprioception (Health) */}
      <div className="space-y-2">
        <h3 className="text-stone-600 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
          <span className="w-2 h-2 bg-red-900 rounded-full animate-pulse"></span>
          Propriocepção
        </h3>
        <div className="bg-stone-900/30 border-l-2 border-stone-800 pl-3 py-1">
          <p className="text-stone-300 text-sm font-serif italic leading-relaxed">
            "{gameState.player.status}"
          </p>
        </div>
      </div>

      {/* Senses (Environment) */}
      <div className="space-y-3">
        <h3 className="text-stone-600 font-bold uppercase tracking-widest text-[10px]">Sentidos</h3>
        <div className="grid gap-4 bg-stone-900/30 p-3 rounded border border-stone-900/50">
          <div>
            <span className="block text-stone-600 text-[10px] mb-0.5">Arredores</span>
            <span className="text-stone-300 text-sm font-medium">{gameState.player.location}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-stone-600 text-[10px] mb-0.5">Ciclo</span>
              <span className="text-amber-700/80 font-mono text-xs">{gameState.world.time}</span>
            </div>
            <div>
              <span className="block text-stone-600 text-[10px] mb-0.5">Atmosfera</span>
              <span className="text-stone-400 text-xs">{gameState.world.weather}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory (Possessions) */}
      <div className="space-y-3">
        <h3 className="text-stone-600 font-bold uppercase tracking-widest text-[10px]">Poses</h3>
        <ul className="space-y-2">
          {gameState.player.inventory.length > 0 ? (
            gameState.player.inventory.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-stone-400 text-sm group">
                <span className="w-1 h-1 rounded-full bg-stone-800 group-hover:bg-amber-700 transition-colors"></span>
                <span className="group-hover:text-stone-200 transition-colors">{item}</span>
              </li>
            ))
          ) : (
            <li className="text-stone-700 italic text-xs">Apenas o peso da própria alma.</li>
          )}
        </ul>
      </div>

      {/* NPC WorldSim Output */}
      {visibleNPCs.length > 0 ? (
        <div className="space-y-3 pt-4 border-t border-stone-900">
          <h3 className="text-stone-600 font-bold uppercase tracking-widest text-[10px]">Presenças (Visíveis)</h3>
          <ul className="space-y-4">
            {visibleNPCs.map((npc, i) => (
              <li key={i} className="text-xs bg-stone-900/20 p-2 rounded border border-stone-900/50">
                <div className="flex justify-between text-stone-400 mb-1">
                  {/* Identity Obfuscation Logic */}
                  {npc.isNameKnown ? (
                    <span className="font-bold text-amber-600/90">{npc.name}</span>
                  ) : (
                    <span className="font-bold text-stone-500 italic">{npc.descriptor}</span>
                  )}

                  <span className="text-[9px] text-stone-600 uppercase ml-2 text-right">{npc.location}</span>
                </div>
                <div className="space-y-1">
                  {npc.lastThought && (
                    <p className="text-cyan-800/80 italic text-[10px] font-serif border-l-2 border-cyan-900/30 pl-1 mb-1">
                      "{npc.lastThought}"
                    </p>
                  )}
                  <p className="text-stone-500">
                    ➜ {npc.action}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
         <div className="space-y-3 pt-4 border-t border-stone-900">
             <h3 className="text-stone-600 font-bold uppercase tracking-widest text-[10px]">Presenças</h3>
             <p className="text-stone-700 italic text-xs">Você está sozinho aqui.</p>
         </div>
      )}
    </>
  );
};

export default StatusTab;
