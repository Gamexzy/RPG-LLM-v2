
import { GameState, NPCBehaviorResponse, NPCEntity } from "../../types";
import { NPCBehaviorSchema } from "../ai/schemas";
import { NPC_ENGINE_INSTRUCTION } from "../ai/prompts";
import { GeminiClient } from "../ai/client";
import { AI_MODELS } from "../ai/config";

// --- HEURISTIC ENGINE (OFF-SCREEN) ---
// Processamento puramente lógico para NPCs que o jogador não vê.
// Custo: 0 Tokens. Velocidade: Instantânea.

const getTimeOfDay = (timeString: string): 'NIGHT' | 'MORNING' | 'AFTERNOON' | 'EVENING' => {
  // Tenta extrair hora HH:MM
  const match = timeString.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 'AFTERNOON'; // Default

  const hour = parseInt(match[1]);

  if (hour >= 22 || hour < 5) return 'NIGHT';
  if (hour >= 5 && hour < 12) return 'MORNING';
  if (hour >= 12 && hour < 18) return 'AFTERNOON';
  return 'EVENING';
};

const processOffScreenNPC = (npc: NPCEntity, timeString: string): NPCEntity => {
  // 1. CHECAGEM ROBUSTA DE ESTADO (Condition Check)
  // Se estiver MORTO, permanece morto.
  if (npc.condition === 'DEAD') {
    return { ...npc, action: "Morto", status: "Cadáver" };
  }

  // Se estiver INCAPACITADO (preso, desmaiado), não segue rotina de horário,
  // a menos que a "rotina" seja acordar. Por enquanto, mantemos o estado.
  // Exception: Dormindo é um estado de incapacitação natural que muda com o tempo,
  // mas 'Desmaiado' por combate é diferente. 
  // Simplificação: Se action for "Dormindo", pode acordar. Se for "Desmaiado", mantemos.
  if (npc.condition === 'INCAPACITATED' && npc.action !== 'Dormindo') {
    return npc;
  }

  const period = getTimeOfDay(timeString);
  let newAction = npc.action;
  let newStatus = npc.status;
  let newCondition = npc.condition || 'NORMAL';

  // Simulação de Rotina Básica baseada em Arquétipos
  const isGuard = npc.descriptor.toLowerCase().includes('guarda') || npc.name.toLowerCase().includes('guarda');
  const isMerchant = npc.descriptor.toLowerCase().includes('vendedor') || npc.descriptor.toLowerCase().includes('mercador');
  
  switch (period) {
    case 'NIGHT':
      if (isGuard) {
        newAction = "Fazendo ronda noturna";
        newStatus = "Alerta";
        newCondition = "NORMAL";
      } else {
        newAction = "Dormindo";
        newStatus = "Inconsciente";
        newCondition = "INCAPACITATED"; // Dormir é incapacitação natural
      }
      break;
    case 'MORNING':
      newAction = isMerchant ? "Abrindo a loja" : "Começando o dia";
      newStatus = "Ocupado";
      newCondition = "NORMAL";
      break;
    case 'AFTERNOON':
      newAction = "Trabalhando";
      newStatus = "Normal";
      newCondition = "NORMAL";
      break;
    case 'EVENING':
      newAction = "Descansando ou bebendo";
      newStatus = "Relaxado";
      newCondition = "NORMAL";
      break;
  }

  // Pequena chance de mudança aleatória para dar "vida" (RNG) em estados normais
  if (newCondition === 'NORMAL' && Math.random() > 0.8) {
      newAction = "Caminhando distraído";
  }

  return {
    ...npc,
    action: newAction,
    status: newStatus,
    condition: newCondition,
    lastThought: "..." 
  };
};


// --- HYBRID ENGINE RUNNER ---

export const runNPCBehaviorEngine = async (
  currentState: GameState,
  playerAction: string,
  narrative: string
): Promise<NPCBehaviorResponse> => {
  
  const allNPCs = currentState.world.npcs || [];
  if (allNPCs.length === 0) return { npcs: [] };

  const playerLocation = currentState.player.location;

  // 1. SEGMENTAÇÃO
  const localNPCs = allNPCs.filter(n => n.location === playerLocation);
  const distantNPCs = allNPCs.filter(n => n.location !== playerLocation);

  let updatedLocalNPCs: NPCEntity[] = [];

  // 2. PROCESSAMENTO LLM (Apenas para locais)
  if (localNPCs.length > 0) {
      const context = `
      [SITUAÇÃO]:
      O Jogador está em: "${playerLocation}".
      Ação do Jogador: "${playerAction}".
      Resultado Narrativo: "${narrative}".
      
      [NPCS PRESENTES]:
      ${JSON.stringify(localNPCs)}
      `;

      const prompt = `
      Os NPCs listados estão PRESENCIAIS na cena.
      Com base na narrativa, como eles reagem? 
      Atualize status e condition (NORMAL, INCAPACITATED, DEAD).
      `;

      try {
        const response = await GeminiClient.generateStructured<NPCBehaviorResponse>(
            AI_MODELS.FAST,
            context + "\n" + prompt,
            NPCBehaviorSchema,
            NPC_ENGINE_INSTRUCTION
        );
        updatedLocalNPCs = response.npcs;
      } catch (error) {
        console.error("Falha na IA de NPCs locais, mantendo estado anterior.", error);
        updatedLocalNPCs = localNPCs;
      }
  }

  // 3. PROCESSAMENTO ALGORÍTMICO (Apenas para distantes)
  const updatedDistantNPCs = distantNPCs.map(npc => 
    processOffScreenNPC(npc, currentState.world.time)
  );

  // 4. FUSÃO DE ESTADOS
  const finalNPCList = allNPCs.map(original => {
      // Prioridade: Local > Distante > Original
      const localUpdate = updatedLocalNPCs.find(u => u.id === original.id);
      if (localUpdate) return localUpdate;

      const distantUpdate = updatedDistantNPCs.find(u => u.id === original.id);
      if (distantUpdate) return distantUpdate;

      return original;
  });

  return { npcs: finalNPCList };
};
