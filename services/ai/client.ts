import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from "@google/genai";

// --- Model Configuration ---

// World Engine: Requires logic and consistency. Speed is important for parallel exec.
export const WORLD_MODEL = "gemini-2.5-flash";

// NPCs: Requires speed (low latency) for parallel execution.
export const NPC_MODEL = "gemini-2.5-flash";

// Narrator: Receives inputs from others. Needs high context window and creativity.
export const NARRATOR_MODEL = "gemini-2.5-pro";

// System: Utility tasks.
export const SYSTEM_MODEL = "gemini-2.5-flash";

export const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

/**
 * Helper para limpar e parsear JSON vindo da IA.
 * Remove blocos de código markdown (```json) que o modelo as vezes insere
 * mesmo quando solicitado JSON puro.
 */
export const parseAIResponse = <T>(text: string | undefined): T => {
  if (!text) throw new Error("Resposta vazia da IA.");
  
  let cleanText = text.trim();
  
  // Remove markdown code blocks se presente
  // Ex: ```json { ... } ``` -> { ... }
  if (cleanText.includes("```")) {
    cleanText = cleanText.replace(/```json/g, "").replace(/```/g, "");
  }

  // Tenta encontrar o início e fim do objeto JSON para ignorar texto extra
  const firstBrace = cleanText.indexOf('{');
  const lastBrace = cleanText.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleanText) as T;
  } catch (e) {
    console.error("Falha ao parsear JSON da IA:", cleanText);
    throw new Error("O oráculo falou em línguas desconhecidas (Erro de formato JSON).");
  }
};

/**
 * Wrapper robusto para chamadas de API com Retry Pattern.
 * Resolve problemas de 503 (Model Overloaded).
 */
export const generateContentWithRetry = async (
  model: string,
  params: Omit<GenerateContentParameters, 'model'>,
  retries = 5, // Aumentado para 5
  baseDelay = 3000 // Aumentado para 3s
): Promise<GenerateContentResponse> => {
  const ai = getAiClient();
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      // Reconstrói os parâmetros completos incluindo o modelo
      const fullParams: GenerateContentParameters = {
        model,
        ...params
      };

      const response = await ai.models.generateContent(fullParams);
      return response;
    } catch (error: any) {
      lastError = error;
      
      // Verifica erros transientes (503 Service Unavailable ou Overloaded)
      const isOverloaded = 
        error.status === 503 || 
        error.code === 503 || 
        (error.message && error.message.toLowerCase().includes('overloaded')) ||
        (error.message && error.message.toLowerCase().includes('too many requests'));

      if (isOverloaded && i < retries - 1) {
        const delay = baseDelay * Math.pow(2, i); // Backoff exponencial: 3s, 6s, 12s...
        console.warn(`[Cronos AI] Modelo ${model} ocupado. Tentativa ${i + 1}/${retries} em ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Se não for um erro de sobrecarga ou acabaram as tentativas, lança o erro.
      throw error;
    }
  }
  throw lastError;
};