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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar bibliotecas grandes
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // Separar componentes UI
          ui: [
            '@/components/ui/button',
            '@/components/ui/card',
            '@/components/ui/input',
            '@/components/ui/label',
            '@/components/ui/dialog',
            '@/components/ui/tabs',
            '@/components/ui/select',
            '@/components/ui/badge',
            '@/components/ui/alert',
            '@/components/ui/avatar',
            '@/components/ui/separator',
            '@/components/ui/tooltip',
            '@/components/ui/popover',
            '@/components/ui/dropdown-menu',
            '@/components/ui/sheet',
            '@/components/ui/toast',
            '@/components/ui/sonner',
          ],
          
          // Separar páginas principais
          pages: [
            '@/pages/Index',
            '@/pages/Auth',
            '@/pages/Dashboard',
            '@/pages/ClientDashboard',
            '@/pages/ProfessionalDashboard',
            '@/pages/ClientDetails',
          ],
          
          // Separar utilitários
          utils: [
            '@/lib/utils',
            '@/utils/toast',
            '@/contexts/AuthContext',
          ],
        },
      },
      chunkSizeWarningLimit: 300, // Reduzir limite para avisar mais cedo
    },
  },
}));