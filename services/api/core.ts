
const DEFAULT_URL = "http://localhost:8000";
const STORAGE_KEY = "cronos_api_url";

// --- Gerenciamento de URL ---

export const getServerUrl = (): string => {
  if (typeof localStorage === 'undefined') return DEFAULT_URL;
  let url = localStorage.getItem(STORAGE_KEY) || DEFAULT_URL;
  return url.replace(/\/$/, "");
};

export const setServerUrl = (url: string) => {
  const cleanUrl = url.trim().replace(/\/$/, "");
  localStorage.setItem(STORAGE_KEY, cleanUrl);
};

// --- Cliente HTTP Base ---

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
});

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const handleApiError = async (response: Response) => {
  if (response.status === 503) {
      throw new ApiError("Erro 503: Túnel Ngrok ativo, mas o Backend Python está offline.", 503);
  }
  
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") === -1) {
       throw new ApiError(`Erro de Conexão (${response.status}): Verifique a URL do Ngrok.`, response.status);
  }

  const text = await response.text();
  try {
      const json = JSON.parse(text);
      if (json.detail) {
           // FastAPI Validation Error (Array or String)
           // Extrai detalhes úteis do 422 (ex: qual campo está faltando)
           const msg = Array.isArray(json.detail) 
             ? json.detail.map((e: any) => `${e.loc?.join('.') || 'Campo'}: ${e.msg}`).join('\n')
             : json.detail;
           throw new ApiError(msg, response.status);
      }
  } catch (e) {
      if (e instanceof ApiError) throw e;
      // Falha ao parsear JSON, continua para erro genérico
  }
  throw new ApiError(text || `Erro ${response.status}: ${response.statusText}`, response.status);
};

const handleNetworkError = (error: any, url: string) => {
    if (error.message && error.message.includes('Failed to fetch')) {
        // Enriched error message
        throw new Error(`Falha na conexão com ${url}. O servidor está offline ou a URL está incorreta.`);
    }
    throw error;
};

export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    const url = `${getServerUrl()}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!response.ok) await handleApiError(response);
      return await response.json() as T;
    } catch (error: any) {
      handleNetworkError(error, url);
      throw error; // Fallback
    }
  },

  post: async <T>(endpoint: string, body: any): Promise<T> => {
    const url = `${getServerUrl()}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });
      if (!response.ok) await handleApiError(response);
      // Alguns endpoints podem não retornar corpo (204 No Content)
      if (response.status === 204) return {} as T;
      return await response.json() as T;
    } catch (error: any) {
      handleNetworkError(error, url);
      throw error; // Fallback
    }
  },

  // Health Check rápido com timeout customizado
  checkHealth: async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${getServerUrl()}/health`, {
        method: 'GET',
        headers: getHeaders(),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};
