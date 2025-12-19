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
- [x] Meus Profissionais (ClientProfessionals)
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

- [x] Criar uma agenda para que o cliente possa agendar e consultar os treinos com o seu profissional, acessar os treinos executados para ver o histórico de treinos e detalhes, receber avisos de pedidos de feedbacks e avaliações, como medições e pesagens.

- [ ] Desenvolva um módulo completo de Perfil de Força e Performance Relativa, utilizando padrões matemáticos do Powerlifting para classificar o nível do usuário. O sistema deve operar em três camadas de lógica:

1 - Normalização de Carga (Estimativa de 1RM):

Implemente uma função pura que receba carga e repetições.

Utilize a fórmula de Epley ou Brzycki para converter séries submáximas em uma estimativa de 1RM (Repetição Máxima Teórica).

2 - Cálculo de Coeficiente de Força (A Dica de Ouro):

Não utilize apenas a carga bruta para rankings. Implemente o cálculo do Coeficiente DOTS (ou Wilks) que utiliza o peso corporal do usuário, sexo e carga levantada para gerar uma pontuação de força relativa.

Isso permitirá que o sistema compare de forma justa a performance de um usuário de 60kg com um de 100kg.

3 - Matriz de Classificação por Multiplicador Corporal:

Crie uma estrutura de dados (JSON) que defina os níveis (Iniciante, Novato, Intermediário, Avançado, Elite) baseados em Multiplicadores de Peso Corporal (ex: Supino 1.2x Peso Corporal = Intermediário).

O sistema deve cruzar o 1RM estimado com o peso atual do usuário para determinar em qual faixa ele se encontra para os exercícios base (Squat, Bench Press, Deadlift, Overhead Press).

4 - Visualização de Dados (Radar Chart):

No frontend, utilize um gráfico de radar (Spider Chart) para plotar o equilíbrio do usuário entre os 4 movimentos principais, permitindo identificar visualmente se ele tem, por exemplo, 'Pernas de Elite' mas 'Empurre de Iniciante'.

[ ] Desenvolva a seção de Analytics e Progresso do usuário utilizando uma biblioteca de gráficos (como Recharts ou Chart.js).

1 - Eixo Temporal: Os gráficos devem ter o Eixo X como linha do tempo, permitindo filtros de período (Último mês, 3 meses, 1 ano, Tudo).

2 - Visualização de Volume: Crie um gráfico de linha mostrando a evolução da 'Carga Total Levantada' (Volume Load) por treino ao longo do tempo.

3 - Evolução de Cargas: Crie um gráfico que permita selecionar um exercício específico (ex: Supino) e mostre a progressão do peso máximo utilizado ou do 1RM estimado em cada sessão.

4 - Backend: Crie uma query otimizada que agrupe esses dados históricos para alimentar o frontend sem latência excessiva.

- [ ] Crie o esquema de banco de dados e as interfaces para Biometria e Metas.

1 - Histórico de Medidas: Crie uma tabela body_measurements (peso, % gordura, circunferências: braço, cintura, coxa, peito). A interface deve permitir adicionar novos registros datados e visualizar uma tabela histórica.

2 - Sistema de Metas (Goals): Crie uma tabela user_goals com colunas para: tipo_alvo (ex: peso corporal, carga no agachamento), valor_atual, valor_objetivo e data_limite.

3 - Feedback Visual: Na dashboard, exiba uma barra de progresso percentual para cada meta ativa (ex: 'Você já percorreu 80% do caminho para atingir 80kg').

- [ ] Implemente funcionalidade de Compartilhamento Social (Social Sharing) focada em viralização do app.

1 - Geração de Assets: Utilize uma biblioteca (como html2canvas ou geração de OG Images no servidor) para criar uma imagem estática resumindo o treino finalizado. A imagem deve conter: Logo do App (Branding), Nome do Treino, Duração, Carga Total e uma frase de impacto ou nível atingido.

2 - Web Share API: Utilize a API nativa do navegador (navigator.share) para enviar essa imagem e um texto padrão ('Acabei de treinar com o CapiFit...') diretamente para o Instagram Stories, WhatsApp ou Twitter do usuário.

3 - Link de Indicação: No texto compartilhado, inclua um link parametrizado (ex: capifit.app/ref=USER_ID) para rastrear novos cadastros vindos desse compartilhamento (preparando terreno para um futuro sistema de rewards).

## Correções
- [x] Gifs de animação para os treinos não estão mostrados no treino do cliente.
- [x] Previsualização de vídeos de treinos, gifs, instruções e dicas no card do cadastro do exercício, não funciona click no icone nada acontece.
- [x] Inserir no perfil de cliente e na visualização do cliente pelo profissional o campo de WhatsApp e Telegram.
- [x] Mostrar no perfil do cliente as possibilidade de inserir, editar e excluir fotos em uma aba "Fotos" e as avaliações em uma aba "Avaliações", e também o Histórico de treinos em uma aba "Histórico", como já foi implementado para o profissionais.
- [x] Avisar cancelamentos de agendamentos pelo chat do profissional quando o cliente cancelar e vice versa.
- [x] No perfil profissional mostrar o mesmo layout da "Agenda Global" para a página de detalhes do cliente na aba "Agenda", onde ao clicar no badge de cancelamentos ele abre a página de detalhes do agendamento, com o motivo do cancelamento, faça isso para o cliente também.
- [x] Corrigir duplicidade do item "Biblioteca de Exercícios" no menu lateral do profissional.
- [x] Corrigir erro ao atribuir quando o agendamento e feito pelo profissional, segue abaixo o erro: 
- [x] Corrigir dados de WhatsApp e Telegram do perfil do profissional, eles não estão sendo salvos e nem carregados (já inseri os campos no banco de dados manualmente).
- [x] 1 - Desenvolva a estrutura de dados e a interface para o 'Perfil Público do Profissional'. O perfil deve exibir dados cadastrais, bio, certificações e, principalmente, um Sistema de Reputação Multicritério.
Requisitos do Sistema de Reputação:
1.1 - Avaliação Segmentada: O cliente não deve dar apenas uma nota geral. Ele deve avaliar competências específicas (ex: Pontualidade, Didática, Conhecimento Técnico, Acompanhamento).
1.2 - Cálculo de Expertise: A reputação final deve ser uma média ponderada dessas competências, permitindo filtrar os profissionais melhores ranqueados em áreas específicas (ex: um especialista em Hipertrofia com nota alta nesse quesito).
1.3 - Visualização: Exibir essas métricas de forma gráfica (ex: barras de progresso ou gráfico de radar) no perfil, gerando confiança baseada em dados granulares.
- [x] 2 - Implemente uma funcionalidade de cronometragem ativa para os cards de exercício durante a execução do treino. O sistema deve atender aos seguintes requisitos:
2.1 - Interface (UI): Adicionar um botão de alternância (Play/Stop) em cada card de exercício.
2.2 - Gerenciamento de Estado: O cronômetro deve registrar a duração ativa de cada exercício individualmente.
2.3 - Lógica de Agregação: Calcular o 'Tempo Total do Treino' através da somatória dos tempos individuais de todos os exercícios finalizados.
2.4 - Regra de Negócio/Gamificação: Utilizar o 'Tempo Total do Treino' calculado como variável input para o sistema de gamificação, influenciando diretamente o progresso de metas, ganho de XP e evolução de Níveis do usuário.