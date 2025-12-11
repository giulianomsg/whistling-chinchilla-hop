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
- [x] Galeria de Progresso (Upload de Fotos)

### Comunicação (Chat)
- [x] Chat em Tempo Real (Supabase Realtime)
- [x] Envio de Imagens e Arquivos (Supabase Storage)
- [x] Chamadas de Vídeo e Voz (Integração Jitsi Meet)
- [x] Contador de Mensagens Não Lidas
    - [x] Atualização em tempo real na lista de contatos
    - [x] Atualização do contador global no menu
    - [x] Limpar badges ao focar no input de mensagem

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

- [ ] Revisar regras de segurança (RLS) no Supabase.
- [ ] Otimizar queries no Dashboard (evitar N+1).
- [ ] Acessibilidade (A11y) em formulários complexos.

## 📝 Novas implementações

- [ ] Criar uma agenda para que o cliente possa agendar e consultar os treinos com o seu profissional, acessar os treinos executados para ver o histórico de treinos e detalhes, receber avisos de pedidos de feedbacks e avaliações, como medições e pesagens.
- [ ] Crie perfil de Nível de Força (como do site strengthlevel.pt) com calculadora de força, padrões de força e progressão de força para homens e mulheres.
- [ ] Acompanhamento de progresso de metas com gráficos.
- [ ] Registro de Metas de peso, medidas e objetivos.
- [ ] Integração com redes sociais como (Postagem de conclusão de treinos, indicação do app e etc...).

## Correções
- [x] Gifs de animação para os treinos não estão mostrados no treino do cliente.
- [x] Previsualização de vídeos de treinos, gifs, instruções e dicas no card do cadastro do exercício, não funciona click no icone nada acontece.
- [x] Inserir no perfil de cliente e na visualização do cliente pelo profissional o campo de WhatsApp e Telegram.
- [x] Mostrar no perfil do cliente as possibilidade de inserir, editar e excluir fotos em uma aba "Fotos" e as avaliações em uma aba "Avaliações", e também o Histórico de treinos em uma aba "Histórico", como já foi implementado para o profissionais.
- [ ] Avisar cancelamentos de agendamentos pelo chat do profissional quando o cliente cancelar e vice versa.
- [ ] Crie também o recurso de notificações no canto superior direito do app para que o cliente e o profissional possa receber notificações de agendamentos, cancelamentos e etc...
- [ ] No perfil profissional mostrar o mesmo layout da "Agenda Global" para a página de detalhes do cliente na aba "Agenda", onde ao clicar no badge de cancelamentos ele abre a página de detalhes do agendamento, com o motivo do cancelamento, faça isso para o cliente também.
- [ ] Corrigir duplicidade do item "Biblioteca de Exercícios" no menu lateral do profissional.
- [ ] Corrigir erro ao atribuir quando o agendamento e feito pelo profissional, segue abaixo o erro: 

"vendor-CzePanbK.js:468  POST https://mhjvgxukttoalvwntmyp.supabase.co/rest/v1/scheduled_workouts 403 (Forbidden)
(anonymous) @ vendor-CzePanbK.js:468
(anonymous) @ vendor-CzePanbK.js:468
await in (anonymous)
then @ vendor-CzePanbK.js:443
vendor-CzePanbK.js:468  POST https://mhjvgxukttoalvwntmyp.supabase.co/rest/v1/scheduled_workouts 403 (Forbidden)
(anonymous) @ vendor-CzePanbK.js:468
(anonymous) @ vendor-CzePanbK.js:468
await in (anonymous)
then @ vendor-CzePanbK.js:443
"
- [ ] Corrigir dados de WhatsApp e Telegram do perfil do profissional, eles não estão sendo salvos e nem carregados (já inseri os campos no banco de dados manualmente).