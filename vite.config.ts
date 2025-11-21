import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 3000,
  },
  preview: {
    host: "127.0.0.1",
    port: 3000,
    allowedHosts: ['capifit.app.br', 'www.capifit.app.br', 'localhost', '127.0.0.1']
  },
  plugins: [
    react(),
    mode === 'development' && dyadComponentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Aumentar limite de aviso de chunk (KB)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Bibliotecas Core
          vendor: ['react', 'react-dom', 'react-router-dom'],

          // Bibliotecas de UI (shadcn)
          ui: [
            '@/components/ui/button',
            '@/components/ui/card',
            '@/components/ui/input',
            '@/components/ui/label',
            '@/components/ui/avatar',
            '@/components/ui/badge',
            '@/components/ui/dialog',
            '@/components/ui/sheet',
            '@/components/ui/tabs',
            '@/components/ui/select',
            '@/components/ui/scroll-area',
            '@/components/ui/toast',
            '@/components/ui/sonner'
          ],

          // Utilitários e Contextos
          utils: ['@/lib/utils', '@/contexts/AuthContext', '@/contexts/ChatContext']

          // NOTA: Não agrupar 'pages'. Deixar o code-splitting automático.
        },
      },
    },
  },
}));