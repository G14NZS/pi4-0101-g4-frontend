import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // O Backend 1 só libera CORS para http://localhost:5175 (CORS_ORIGENS).
  // Com strictPort, se a porta estiver ocupada o Vite falha em vez de subir em outra.
  server: {
    port: 5175,
    strictPort: true,
  },
})
