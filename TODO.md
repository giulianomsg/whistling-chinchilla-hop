# CapiFit - Project Status & Roadmap

Este arquivo serve como ponto central para acompanhar o progresso do projeto, tarefas concluídas e próximos passos.

## 🟢 Funcionalidades Concluídas (Completed)

### Autenticação & Perfil
- [x] Login e Cadastro (Supabase Auth)
- [x] Proteção de Rotas (AuthContext)
- [x] Perfil de Usuário (Edição de dados pessoais)
- [x] Upload de Foto de Perfil com Crop
- [x] Diferenciação de Roles (Cliente vs Profissional)
- [x] Anamnese Completa (Cliente)
- [x] Configurações Profissionais (Especialidade, Bio, Preço)

### Dashboards
- [x] Dashboard do Cliente (Resumo, Gamificação, Treino Ativo)
- [x] Dashboard do Profissional (Métricas, Alunos Recentes, Ranking)

### Funcionalidades Core
- [x] Biblioteca de Exercícios
- [x] Biblioteca de Alimentos
- [x] Criador de Treinos (WorkoutPlanner)
- [x] Criador de Dietas (MealPlanner)
- [x] Gestão de Alunos (MyClients)
- [x] Visualização de Treino do Cliente (ClientWorkout)
- [x] Visualização de Dieta do Cliente (ClientMealPlan)
- [x] Histórico de Treinos

### Comunicação (Chat)
- [x] Chat em Tempo Real (Supabase Realtime)
- [x] Envio de Imagens e Arquivos (Supabase Storage)
- [x] Chamadas de Vídeo e Voz (Integração Jitsi Meet)
- [x] Contador de Mensagens Não Lidas

### Gamificação
- [x] Sistema de XP e Níveis
- [x] Ranking de Alunos (Dashboard Profissional)
- [x] Conquistas (AchievementsList)

## 🟡 Em Progresso / Próximos Passos (In Progress / Next Steps)

### 1. Monetização & Pagamentos (Prioridade Alta)
- [ ] Integração com Gateway de Pagamento (Stripe/Asaas)
- [ ] Planos de Assinatura para Profissionais
- [ ] Checkout e Gestão de Assinaturas

### 2. Qualidade & Testes
- [ ] Configurar ambiente de testes (Vitest/Jest)
- [ ] Testes Unitários para utilitários (ex: gamification.ts)
- [ ] Testes de Integração para fluxos críticos (Login, Criar Treino)

### 3. Landing Page & Marketing
- [ ] Melhorar Landing Page (Index.tsx) para conversão (SEO, Copywriting)
- [ ] Blog ou Área de Conteúdo Público

## 🔴 Backlog / Futuro

- [ ] App Mobile Nativo (React Native)
- [ ] Integração com Wearables (Apple Health, Google Fit)
- [ ] Agendamento de Consultas Online
- [ ] Videoconferência integrada
- [ ] Relatórios PDF para impressão de treinos/dietas
- [ ] Modo Offline (PWA)

## 🐛 Bugs Conhecidos / Débito Técnico

- [ ] Revisar regras de segurança (RLS) no Supabase
- [ ] Otimizar queries no Dashboard (evitar N+1)
- [ ] Acessibilidade (A11y) em formulários complexos
