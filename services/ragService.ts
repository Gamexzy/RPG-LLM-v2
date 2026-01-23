
// Este arquivo agora atua como um agregador (Barrel File) para os serviços modulares.
// Isso mantém a compatibilidade com os imports existentes na aplicação.

import { apiClient } from "./api/core";

// Re-exporta tudo dos módulos específicos
export * from "./api/core";
export * from "./api/auth";
export * from "./api/library";
export * from "./api/memory";

// Alias para manter compatibilidade exata com nomes antigos se necessário
export const checkBackendHealth = apiClient.checkHealth;
