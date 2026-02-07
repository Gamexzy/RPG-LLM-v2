
import { Schema, Type } from "@google/genai";

// Serão utilizados especificamente esses modelos, nenhum outro será utilizado.
export const AI_MODELS = {
  // Criatividade e coerência complexa (Narrador)
  CREATIVE: 'gemini-3-flash-preview',
  
  // Velocidade e lógica rápida (World Engine, NPCs, Dialogues, System)
  FAST: 'gemini-3-flash-preview',
};

// Configurações padrão de geração
export const DEFAULT_CONFIG = {
  temperature: 1,
  topK: 40,
  topP: 0.95,
};

// Configurações específicas para tarefas determinísticas (JSON)
export const LOGIC_CONFIG = {
  temperature: 0.4, // Menor criatividade, maior precisão
  topK: 20,
  topP: 0.90,
};
