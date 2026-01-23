
import { apiClient } from "./core";

export const registerUser = async (userData: any) => {
  try {
    return await apiClient.post<any>('/auth/register', userData);
  } catch (error: any) {
    if (error.message && error.message.includes('Failed to fetch')) {
        throw new Error("Falha na conexão. O servidor está offline ou a URL está incorreta.");
    }
    throw error;
  }
};

export const loginUser = async (credentials: any) => {
  try {
    return await apiClient.post<any>('/auth/login', credentials);
  } catch (error: any) {
    if (error.message && error.message.includes('Failed to fetch')) {
        throw new Error("Falha na conexão. O servidor está offline ou a URL está incorreta.");
    }
    throw error;
  }
};
