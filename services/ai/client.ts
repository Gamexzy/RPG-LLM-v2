
import { GoogleGenAI, GenerateContentResponse, Schema } from "@google/genai";
import { AI_MODELS, DEFAULT_CONFIG, LOGIC_CONFIG } from "./config";
import { AISettings } from "../../types";

// Helper to get settings from localStorage
const getAISettings = (): AISettings => {
  const stored = localStorage.getItem('cronos_ai_settings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing AI settings", e);
    }
  }
  const getLmStudioUrl = () => {
    if (process.env.LM_STUDIO_BASE_URL) return process.env.LM_STUDIO_BASE_URL;
    const protocol = process.env.LMSTUDIO_PROTOCOL || 'http';
    const ipv6 = process.env.IPV6 || '::1';
    const port = process.env.LMSTUDIO_PORT || '1234';
    const host = ipv6.includes(':') && !ipv6.includes('[') ? `[${ipv6}]` : ipv6;
    return `${protocol}://${host}:${port}/v1`;
  };

  return {
    provider: 'gemini',
    baseUrl: getLmStudioUrl(),
    modelId: AI_MODELS.CREATIVE,
    apiKey: process.env.API_KEY || ''
  };
};

// Inicialização do cliente conforme diretrizes estritas
const getAiClient = () => {
  const settings = getAISettings();
  const apiKey = settings.apiKey || process.env.API_KEY;
  if (!apiKey && settings.provider === 'gemini') throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
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
 * Chamada para API compatível com OpenAI (LM Studio)
 */
async function callOpenAICompatible(
  prompt: string,
  systemInstruction?: string,
  isJson = false,
  schema?: Schema
): Promise<string> {
  const settings = getAISettings();
  const url = `${settings.baseUrl}/chat/completions`;
  
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey || 'not-needed'}`
    },
    body: JSON.stringify({
      model: settings.modelId,
      messages,
      temperature: isJson ? LOGIC_CONFIG.temperature : DEFAULT_CONFIG.temperature,
      response_format: isJson ? { type: "json_object" } : undefined
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LM Studio Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

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
    const settings = getAISettings();
    
    if (settings.provider === 'lmstudio') {
      return await callOpenAICompatible(prompt, systemInstruction);
    }

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
    const settings = getAISettings();

    if (settings.provider === 'lmstudio') {
      const text = await callOpenAICompatible(prompt, systemInstruction, true, schema);
      return cleanAndParseJSON<T>(text);
    }

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
