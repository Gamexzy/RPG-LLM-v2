
import { apiClient } from "./core";

export const registerUser = async (userData: any) => {
  // apiClient.post agora lida automaticamente com 'Failed to fetch'
  return await apiClient.post<any>('/auth/register', userData);
};

export const loginUser = async (credentials: any) => {
  return await apiClient.post<any>('/auth/login', credentials);
};
