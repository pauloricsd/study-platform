# Progresso do Projeto — Sia

Registro contínuo de etapas concluídas e pendentes. Atualizado a cada sessão de trabalho.

---

## Fase 0 — Protótipo navegável com dados mockados

Objetivo: validar fluxos, componentes e experiência sem backend real.

### Infraestrutura e configuração

- [x] Scaffold manual do projeto Next.js 15 + TypeScript + Tailwind CSS
- [x] Configuração do `tailwind.config.ts` com sistema de cores via CSS variables
- [x] Design system base: `Button`, `Card`, `Badge`, `Avatar`, `Progress`, `Separator`, `Tooltip`
- [x] Utilitário `cn()` (`lib/utils.ts`)
- [x] Script de dev para Windows (`start-dev.cmd`) com PATH correto para Node.js
- [x] `.claude/launch.json` para preview integrado

### Mock data

- [x] `lib/mock-data.ts` — tipos `StudyPack`, `Student`, `StudyPackProgress`; 5 pacotes, 3 alunos; helpers de progresso
- [x] `lib/mock-topics.ts` — tipos `Topic`, `Section`, `Exercise`; 5 tópicos de Gramática; 12 exercícios (múltipla escolha, V/F, complete, aberta)

### Layout e navegação

- [x] `SidebarContext` — estado de colapso e menu mobile compartilhado via React Context
- [x] `AppSidebar` — sidebar unificada com variante `admin` e `student`; colapso (64px/240px), mobile drawer, tooltips
- [x] `AppShell` — wrapper client com `localStorage` por variante, provider de contexto
- [x] `Topbar` — barra superior com título, ação, notificação, avatar e hamburguer mobile
- [x] Route group `(admin)` — layout com `AppShell variant="admin"`
- [x] Route group `estudar/(browsing)` — layout com `AppShell variant="student"`
- [x] Rota `/estudar/[packId]/topico/[topicId]` sem sidebar (modo foco de estudo)

### Telas — Admin (professor/pai)

- [x] **Dashboard home** (`/`) — estatísticas, pacotes recentes, provas urgentes, lista de alunos, pendentes de publicação, próximas provas
- [x] **Detalhe do pacote** (`/pacotes/[id]`) — header com metadados e ações, tabs Conteúdo / Exercícios / Progresso, navegação por tópico
- [x] **Lista de pacotes** (`/pacotes`) — filtros, busca, cards de pacote, status
- [x] **Criar pacote** (`/pacotes/novo`) — wizard 5 etapas: informações, upload PDF, simulação de processamento IA, revisão de tópicos, publicação
- [x] **Lista de alunos** (`/alunos`) — visão geral com stats por aluno (progresso médio, acerto, último acesso)
- [x] **Detalhe do aluno** (`/alunos/[id]`) — header com stats consolidados, pacotes com progress bar e acerto por questão

### Telas — Aluno

- [x] **Home do aluno** (`/estudar`) — saudação, banner de próxima prova, CTA continuar, estatísticas, lista de pacotes
- [x] **Visão geral do pacote** (`/estudar/[packId]`) — anel de progresso, contagem regressiva, lista de tópicos com status
- [x] **Fluxo de estudo** (`/estudar/[packId]/topico/[topicId]`) — leitura de seções, exercícios interativos (múltipla escolha, V/F, complete, aberta), feedback por estado, nova tentativa, tela de resultados
- [x] **Tela de resultados detalhada** — revisão questão a questão com resposta do aluno, gabarito e explicação (expandível por questão)
- [x] **Histórico/revisão** (`/estudar/historico`) — tópicos ordenados por prioridade (para revisar → concluído → não iniciado), progresso e acerto por tópico

### Componentes de conteúdo

- [x] `SectionCard` — cards por tipo (explicação, exemplo, atenção, erro comum, resumo)
- [x] `ExerciseItem` — exercício com gabarito e explicação (visão admin)
- [x] `PackHeader` — cabeçalho do pacote com breadcrumb, metadados e ações
- [x] `StudyPackCard` — card de pacote para listas (dashboard admin)
- [x] `StatCard` — card de estatística para dashboard

---

## Fase 1 — MVP funcional com integrações reais

- [x] **Infraestrutura Supabase** — `@supabase/supabase-js` + `@supabase/ssr` instalados; clientes browser/server criados; middleware de sessão com fallback para mock mode
- [x] **Schema do banco** — `supabase/schema.sql` completo: profiles, study_packs, student_packs, topics, sections, exercises, topic_progress, exercise_responses, source_files; RLS configurado; índices criados
- [x] **TypeScript types** — `lib/database.types.ts` com tipagem completa do schema
- [x] **Autenticação — página de login** — `/login` com Server Action, redirecionamento por role (admin→/ | aluno→/estudar), middleware protege todas as rotas
- [x] **Data layer com fallback** — `lib/data/` (utils, auth, packs, students, topics, progress); mock mode quando Supabase não configurado; queries reais com type-safe row casts
- [x] **Autenticação — criar conta admin** — `/cadastro` com name/email/password; server action cria auth user + profile via DB trigger; `/cadastro/confirmar` para fluxo com email verification
- [x] **Upload de PDF** — Supabase Storage (`source-files` bucket); `processPackAction` recebe o File via FormData, faz upload e cria registro em `source_files`
- [x] **Processamento com IA** — `lib/ai/process-pdf.ts` com OpenAI `gpt-4o` + Structured Outputs; wizard reescrito para usar server actions reais; step 3 com animação cosmética enquanto a chamada à API acontece em paralelo
- [x] **Persistência de progresso** — `saveTopicProgress` + `saveExerciseResponses`; `onComplete` extendido para passar respostas individuais; ambos salvos em paralelo via `Promise.all`
- [x] **Correção objetiva** — avaliação client-side usando `correctAnswer` carregado do banco; respostas individuais salvas em `exercise_responses` com `is_correct` e `was_revealed`
- [x] **Todos os tipos de exercícios** — 12 tipos implementados no motor de estudo e geração IA: `multiple_choice`, `true_false`, `fill_blank`, `open_short`, `numeric`, `multiple_select`, `open_long`, `match_columns`, `ordering`, `text_interpretation`, `explain_required`, `text_production`
- [x] **Grupos e gerenciamento de alunos** — tabelas `groups`, `group_members`, `invitations`, `group_assignments`; UI admin completa (lista, criação, detalhe); convites por link único (5 dias, uso único); atribuição de pacotes a grupos; aceitação de convite pelo aluno em `/convite/[token]`
- [x] **Correção com IA** — `lib/ai/grade-response.ts` com `gpt-4o-mini`; tipos `open_short`, `text_interpretation`, `explain_required` avaliados em tempo real; feedback explicativo na tela de resultados
- [x] **Autenticação completa** — logout, recuperação de senha (`/recuperar-senha` → `/auth/callback` → `/nova-senha`); `UserMenu` com avatar e dropdown no Topbar
- [x] **Configurações de conta** (`/configuracoes`) — atualização de nome, troca de senha com re-autenticação, logout; funciona para admin e aluno
- [x] **Perfil duplo** — coluna `can_switch_role` em `profiles`; `UserMenu` exibe "Alternar perfil" para contas com acesso duplo (admin ↔ aluno)
- [x] **Navegação de retorno** — botão "← Voltar" em todas as telas de detalhe: pacotes, novo pacote, configurações (role-aware), alunos, grupos
- [x] **Layout mobile responsivo** — tópicos e filtros de exercício colapsáveis no mobile; sidebar colapsável no detalhe do pacote
- [x] **Histórico de revisão** (`/estudar/historico`) — tópicos agrupados por prioridade (revisar → concluído → não iniciado); progresso, acerto e data por tópico; botões de estudar/revisar/refazer
- [x] **Context de perfil** — `UserProfileContext` + `UserProfileProvider`; profile fetched em layouts server components, consumido por `UserMenu` sem quebrar boundary client/server
- [ ] **Deploy** — Vercel + Supabase produção

---

## Fase 2 — Exercícios inteligentes

_Planejada. Ver [PRD seção 14](./01-prd-principal.md#14-roadmap)._

- [ ] StudyPack Format (padrão de arquivo de questões)
- [ ] Mais tipos de questões (numérica, associação, ordenação)
- [ ] Critérios de aceite configuráveis por questão
- [ ] Feedback adaptativo
- [ ] Retry flow avançado

---

## Fase 3 — Acompanhamento e revisão

- [ ] Relatórios para pais/professores
- [ ] Recomendações automáticas de revisão
- [ ] Histórico de tentativas
- [ ] Mapa de dificuldades por tópico

---

## Fase 4 — Uso escolar ampliado

- [ ] Turmas e múltiplos alunos
- [ ] Compartilhamento de pacotes entre professores
- [ ] Permissões por perfil
- [ ] Possíveis integrações escolares

---

_Última atualização: 2026-05-15 — Fase 1 completa: auth, grupos, IA, histórico, perfil duplo, mobile. Falta apenas deploy em produção._
