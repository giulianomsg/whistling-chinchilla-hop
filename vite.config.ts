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
    chunkSizeWarningLimit: 1600, // Aumentado para acomodar o vendor único sem avisos
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      },
    },
  },
}));