
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.API_KEY),
        'process.env.HF_TOKEN': JSON.stringify(env.HF_TOKEN),
        'process.env.GROQ_API_KEY': JSON.stringify(env.GROQ_API_KEY),
        'process.env.LM_STUDIO_URL': JSON.stringify(env.LM_STUDIO_URL),
        'process.env.LM_STUDIO_MODEL': JSON.stringify(env.LM_STUDIO_MODEL),
      },
      resolve: {
        alias: {
          '@': path.resolve('.'),
        }
      }
    };
});