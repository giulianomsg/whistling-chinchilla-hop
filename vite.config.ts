import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "127.0.0.1", // Forçar IPv4
    port: 3000,
  },
  preview: {
    host: "127.0.0.1", // Forçar IPv4
    port: 3000,
    allowedHosts: ['capifit.app.br', 'www.capifit.app.br', 'localhost', '127.0.0.1']
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));