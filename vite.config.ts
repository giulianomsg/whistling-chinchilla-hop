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
    // Aumentar limite para evitar warnings, mas deixar o Vite decidir os chunks
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Vamos deixar o Vite decidir a melhor forma de dividir o código
        // Isso corrige o erro de dependência circular/inicialização
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Separar bibliotecas grandes em chunks de vendor
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('@tanstack') || id.includes('date-fns')) {
              return 'vendor-utils';
            }
            // O restante vai para um vendor genérico
            return 'vendor';
          }
        }
      },
    },
  },
}));