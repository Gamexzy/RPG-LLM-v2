import { GoogleGenAI } from "@google/genai";

// --- Model Configuration ---

// Narrator: Requires high creativity, complex reasoning, and long context coherence.
export const NARRATOR_MODEL = "gemini-2.5-pro";

// NPCs: Requires speed (low latency) for parallel execution, but decent roleplay ability.
export const NPC_MODEL = "gemini-2.5-flash";

// System: Requires high speed and strict instruction following for utility tasks.
export const SYSTEM_MODEL = "gemini-2.5-flash";

export const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};