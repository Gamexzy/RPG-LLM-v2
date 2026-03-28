import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.LM_STUDIO_BASE_URL': JSON.stringify(env.LM_STUDIO_BASE_URL),
        'process.env.BACKEND_URL': JSON.stringify(env.BACKEND_URL),
        'process.env.BACKEND_PORT': JSON.stringify(env['BACKEND-PORT']),
        'process.env.LMSTUDIO_PORT': JSON.stringify(env['LMSTUDIO-PORT']),
        'process.env.IPV6': JSON.stringify(env.IPV6),
        'process.env.BACKEND_PROTOCOL': JSON.stringify(env.BACKEND_PROTOCOL || 'http'),
        'process.env.LMSTUDIO_PROTOCOL': JSON.stringify(env.LMSTUDIO_PROTOCOL || 'http')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
