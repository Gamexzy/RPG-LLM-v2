
import { GoogleGenAI, GenerateContentResponse, Schema } from "@google/genai";
import { AI_MODELS, DEFAULT_CONFIG, LOGIC_CONFIG } from "./config";

// Inicialização do cliente conforme diretrizes estritas
const getAiClient = () => {
  // Assume que process.env.API_KEY está injetado pelo ambiente/modal
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found in process.env");
  return new GoogleGenAI({ apiKey });
};

/**
 * Parser seguro de JSON que lida com blocos de código Markdown
 */
const cleanAndParseJSON = <T>(text: string | undefined): T => {
  if (!text) throw new Error("Resposta vazia da IA.");
  
  let cleanText = text.trim();
  // Remove formatação Markdown ```json ... ```
  cleanText = cleanText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  
  try {
    return JSON.parse(cleanText) as T;
  } catch (e) {
    console.error("Falha ao parsear JSON bruto:", text);
    throw new Error("Erro de formato na resposta neural (JSON inválido).");
  }
};

/**
 * Executa uma chamada ao Gemini com retentativas automáticas (Exponential Backoff)
 */
async function executeWithRetry(
  operation: () => Promise<GenerateContentResponse>,
  retries = 3,
  baseDelay = 1000
): Promise<GenerateContentResponse> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      // Detecta sobrecarga (503) ou Too Many Requests (429)
      const isOverloaded = error.status === 503 || error.status === 429 || error.message?.includes('Overloaded');
      
      if (isOverloaded && i < retries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.warn(`Gemini sobrecarregado. Tentativa ${i + 2}/${retries} em ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

/**
 * Interface Modular para Geração de Texto
 */
export const GeminiClient = {
  /**
   * Gera texto livre (Narrativas, Diálogos, Logs)
   */
  generateText: async (
    modelId: string,
    prompt: string,
    systemInstruction?: string
  ): Promise<string> => {
    const ai = getAiClient();
    
    const response = await executeWithRetry(() => 
      ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          ...DEFAULT_CONFIG,
          systemInstruction,
          responseMimeType: "text/plain",
        }
      })
    );

    return response.text || "";
  },

  /**
   * Gera dados estruturados (JSON) garantidos por Schema
   */
  generateStructured: async <T>(
    modelId: string,
    prompt: string,
    schema: Schema,
    systemInstruction?: string
  ): Promise<T> => {
    const ai = getAiClient();

    const response = await executeWithRetry(() => 
      ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          ...LOGIC_CONFIG, // Usa config mais determinística
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema,
        }
      })
    );

    return cleanAndParseJSON<T>(response.text);
  }
};
