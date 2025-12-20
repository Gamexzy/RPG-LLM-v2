
import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from "@google/genai";

// --- Model Configuration ---
export const WORLD_MODEL = "gemini-2.5-flash";
export const NPC_MODEL = "gemini-2.5-flash";
export const DIALOGUE_MODEL = "gemini-2.5-flash";
export const NARRATOR_MODEL = "gemini-2.5-flash";
export const SYSTEM_MODEL = "gemini-2.5-flash";
// IMAGE_MODEL removed

export const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const parseAIResponse = <T>(text: string | undefined): T => {
  if (!text) throw new Error("Resposta vazia da IA.");
  let cleanText = text.trim();
  if (cleanText.includes("```")) {
    cleanText = cleanText.replace(/```json/g, "").replace(/```/g, "");
  }
  const firstBrace = cleanText.indexOf('{');
  const lastBrace = cleanText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(cleanText) as T;
  } catch (e) {
    console.error("Falha ao parsear JSON da IA:", cleanText);
    throw new Error("Erro de formato na resposta neural.");
  }
};

export const generateContentWithRetry = async (
  model: string,
  params: Omit<GenerateContentParameters, 'model'>,
  retries = 5,
  baseDelay = 2000
): Promise<GenerateContentResponse> => {
  const ai = getAiClient();
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent({ model, ...params });
      return response;
    } catch (error: any) {
      lastError = error;
      const isOverloaded = error.status === 503 || error.code === 503 || error.message?.toLowerCase().includes('overloaded');
      if (isOverloaded && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};
