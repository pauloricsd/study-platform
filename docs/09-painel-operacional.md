# 09 — Painel Operacional Interno e Visualização do Sistema

## 1. Objetivo do documento

Este documento define uma funcionalidade interna da plataforma: um Painel Operacional para usuários autorizados acompanharem dados do sistema, métricas de uso, status de usuários, informações técnicas, Design System e saúde geral do produto.

Esse painel não é destinado a alunos, pais ou professores em uso comum. Ele é uma área operacional, administrativa e analítica, disponível apenas para usuários específicos configurados diretamente no banco de dados com permissão especial.

O objetivo é permitir que operadores, administradores, designers, desenvolvedores ou responsáveis pelo produto consigam observar o comportamento da plataforma, validar a interface, acompanhar adoção, monitorar qualidade e identificar problemas operacionais.

---

## 2. Papel do Painel Operacional dentro do produto

O Painel Operacional funciona como uma camada interna de observabilidade do produto.

Ele deve ajudar a responder perguntas como:

- Quantos usuários existem na plataforma?
- Quantos alunos estão ativos?
- Quantos pais/professores estão usando o produto?
- Quantos estudos foram criados?
- Quantos PDFs foram enviados?
- Quantos exercícios foram respondidos?
- Quais usuários estão ativos, inativos ou com convite pendente?
- Qual foi o último acesso de cada usuário?
- Como está o uso de armazenamento e processamento?
- Quais componentes do Design System estão sendo usados?
- Quais tokens visuais estão definidos?
- Existem erros ou falhas recorrentes no sistema?
- Quais fluxos têm maior uso ou abandono?

---

## 3. Acesso ao Painel Operacional

### 3.1 Usuário com permissão especial

O acesso ao Painel Operacional deve ser liberado apenas para usuários configurados diretamente no banco de dados com permissão `operational`.

### 3.2 Login normal

O usuário autorizado deve fazer login pelo fluxo normal da plataforma. Após autenticação, o sistema verifica se aquele usuário possui permissão operacional. Se possuir, a plataforma exibe um widget flutuante de acesso operacional.

### 3.3 Widget flutuante

O widget flutuante deve aparecer apenas para usuários autorizados. Ele pode ficar em uma posição discreta da interface. A função principal do widget é permitir acesso rápido ao Painel Operacional.

### 3.4 Abertura em nova aba

Ao clicar no widget, o Painel Operacional deve abrir em uma nova aba.

Motivos:
- separar a experiência operacional da experiência comum da plataforma;
- permitir que o operador continue visualizando o produto original;
- facilitar comparação entre interface real e painel interno;
- evitar confusão com a experiência de aluno/pai/professor.

---

## 4. Comportamento do widget flutuante

### 4.1 Visibilidade

O widget deve aparecer apenas quando:
- o usuário está autenticado;
- o usuário possui permissão `operational`;
- a sessão é válida.

### 4.2 O widget não deve aparecer para

- alunos comuns;
- pais/responsáveis comuns;
- professores sem permissão operacional;
- usuários convidados;
- usuários deslogados;
- usuários suspensos.

### 4.3 Ações do widget

- abrir Painel Operacional (nova aba);
- copiar ID do usuário atual;
- visualizar ambiente atual (production/development);
- indicar status do sistema.

### 4.4 Exemplo de UI

```
[⚙ Operações]

Abrir painel operacional
Ver sessão atual
Copiar user ID
```

---

## 5. Estrutura geral do Painel Operacional

Navegação principal:

```
1. Overview
2. Usuários
3. Alunos
4. Grupos e turmas
5. Estudos e módulos
6. Exercícios e respostas
7. Tutor IA
8. Uploads e processamento
9. Sistema e infraestrutura
10. Design System
11. Logs e eventos
12. Configurações operacionais
```

---

## 6. Overview operacional

### 6.1 Objetivo

Dar uma visão rápida da saúde e uso geral da plataforma.

### 6.2 Cards sugeridos

- Usuários totais
- Alunos ativos
- Estudos publicados
- Exercícios respondidos
- Uploads processados
- Tutor IA usado
- Erros nas últimas 24h
- Uso de storage

---

## 7. Usuários

### 7.1 Dados exibidos

- nome, e-mail, tipo de usuário, status, data de criação, último acesso, grupos associados, permissões especiais, origem do cadastro.

### 7.2 Filtros e busca

- busca por nome ou e-mail;
- filtro por tipo, status, último acesso, grupo, permissão operacional;
- ordenação por data de criação ou último acesso.

### 7.3 Status de usuário

| Código | Interface |
|---|---|
| `active` | Ativo |
| `inactive` | Inativo |
| `invited` | Convidado |
| `pre_registered` | Pré-cadastrado |
| `suspended` | Suspenso |
| `deleted` | Excluído |

---

## 8. Alunos

### 8.1 Dados possíveis

- nome, e-mail (se houver), série, grupos vinculados, estudos atribuídos, progresso médio, última atividade, exercícios respondidos, tópicos com dificuldade, status de convite.

### 8.2 Métricas úteis

- alunos ativos / pré-cadastrados / convidados pendentes / sem atividade;
- alunos com maior uso do Tutor IA;
- alunos com mais tentativas em exercícios.

---

## 9. Grupos e turmas

### 9.1 Dados exibidos

- nome, tipo, escola, turma/série, tags, quantidade de alunos, estudos atribuídos, progresso médio, data de criação, status.

### 9.2 Filtros

- tipo, escola, turma, status, grupos sem alunos, grupos com convites pendentes.

---

## 10. Estudos e módulos

### 10.1 Dados possíveis

- título, matéria, série, criador, status, origem, datas, tópicos, exercícios, alunos/grupos atribuídos, taxa de conclusão, erros.

### 10.2 Status de estudo

```
draft → processing → ready_for_review → ready_to_publish → published → archived
                                                                      → failed
```

### 10.3 Métricas úteis

- estudos por período, publicados, em rascunho, com erro;
- tempo médio upload → publicação;
- matérias mais comuns;
- estudos mais acessados.

---

## 11. Exercícios e respostas

### 11.1 Métricas possíveis

- total de questões criadas por tipo;
- exercícios respondidos, taxa de acerto geral e por tipo;
- respostas parciais, retries;
- questões mais erradas;
- tópicos com maior dificuldade;
- tempo médio por questão.

### 11.2 Valor operacional

Identifica tipos de questões com mais erro, questões mal formuladas, tópicos difíceis e oportunidades de melhoria no Tutor IA.

---

## 12. Tutor IA

### 12.1 Métricas possíveis

- total de conversas e mensagens;
- uso por modo (estudo / exercício);
- pedidos de resposta direta bloqueados;
- respostas com baixa confiança;
- eventos de segurança;
- tópicos e questões com mais dúvidas.

### 12.2 Eventos monitorados

```
direct_answer_requested
direct_answer_blocked
low_confidence_response
insufficient_information
safety_redirect
off_topic_request
```

---

## 13. Uploads e processamento

### 13.1 Dados possíveis

- arquivos enviados (tipo, tamanho, páginas), status e tempo de processamento, erros, taxa de sucesso, estudos gerados.

### 13.2 Pipeline de status

```
uploaded → extracting_text → cleaning_content → identifying_topics
→ generating_sections → detecting_exercises → ready_for_review / failed
```

### 13.3 Métricas úteis

- uploads por dia, taxa de sucesso, tempo médio, falhas por tipo, uso de storage por usuário.

---

## 14. Sistema e infraestrutura

### 14.1 Métricas sugeridas

- ambiente atual, versão do app, status do banco, uso de storage, taxa de erro;
- chamadas de IA, tokens consumidos, **custo estimado** (incluído no MVP);
- custo por funcionalidade: leitura de PDF, geração de tópicos, correção, Tutor IA.

### 14.2 Métricas de banco/storage

- registros principais, tamanho do banco e storage, arquivos ativos/órfãos, crescimento semanal/mensal.

---

## 15. Design System

### 15.1 Objetivo

Visualizar tokens e componentes visuais usados na interface — alimentado pelos tokens reais do código.

### 15.2 Conteúdos

- **Tokens de cor**: primary, secondary, background, foreground, success, warning, error, muted, border, card;
- **Tipografia**, **espaçamentos**, **radius**, **sombras**, **ícones**;
- **Componentes**: Button, Card, Input, Badge, Alert, Dialog, Tabs, Progress, TutorChat, OperationalWidget, etc.;
- **Estados**: default, hover, active, focus, disabled, loading, error, success, empty, skeleton.

### 15.3 Valor operacional

- validar consistência visual;
- documentar o Design System;
- apoiar QA visual e desenvolvimento.

---

## 16. Logs e eventos

### 16.1 Eventos úteis

login, logout, criação de estudo, upload, processamento (sucesso/erro), publicação, criação de grupo, convite enviado/aceito, exercício respondido, Tutor IA acionado, resposta bloqueada, erros de IA/servidor.

### 16.2 Filtros

por usuário, data, tipo de evento, severidade, estudo, grupo, funcionalidade.

### 16.3 Severidade

```
info | warning | error | critical
```

---

## 17. Configurações operacionais

No MVP, área apenas leitura. Futuras configurações: feature flags, limites do Tutor IA, tipos de arquivo aceitos, mensagens padrão de feedback.

---

## 18. Segurança e permissões

### 18.1 Controle de acesso

- verificar: autenticado + permissão `operational` + sessão válida;
- segundo fator: não necessário no MVP.

### 18.2 Dados sensíveis

- e-mails não mascarados no MVP;
- apenas leitura no MVP;
- sem ações destrutivas no MVP (excluir usuário, editar progresso, apagar arquivos, modificar gabaritos).

### 18.3 Logging

- acessos ao painel registrados;
- ações operacionais auditadas.

---

## 19. Interface esperada

### 19.1 Layout

- sidebar de navegação + header com ambiente e usuário;
- cards de métricas, tabelas filtráveis, gráficos simples;
- detalhes em drawer, busca global interna, filtros persistentes.

### 19.2 Componentes principais

`MetricCard`, `DataTable`, `StatusBadge`, `FilterBar`, `SearchInput`, `DateRangePicker`, `DetailDrawer`, `LogViewer`, `TokenPreview`, `ComponentPreview`, `SystemHealthIndicator`.

---

## 20. Estrutura de dados sugerida

### UserPermission
```json
{
  "userId": "user_001",
  "permission": "operational",
  "grantedBy": "system",
  "createdAt": "2026-05-16T10:00:00Z"
}
```

### OperationalAccessLog
```json
{
  "id": "op_log_001",
  "userId": "user_001",
  "action": "opened_operational_panel",
  "createdAt": "2026-05-16T10:05:00Z",
  "metadata": { "source": "floating_widget", "environment": "production" }
}
```

### SystemMetricSnapshot
```json
{
  "id": "snapshot_001",
  "usersTotal": 1200,
  "studentsActive30d": 340,
  "studyPacksPublished": 860,
  "uploadsProcessed": 540,
  "storageUsedMb": 12800,
  "aiCallsToday": 2100,
  "createdAt": "2026-05-16T10:10:00Z"
}
```

---

## 21. MVP vs versões futuras

### 21.1 MVP inclui

- acesso restrito por permissão `operational` no banco;
- widget flutuante (aparece em todos os ambientes para usuários autorizados);
- abertura do painel em nova aba;
- overview com métricas principais;
- listagem e busca de usuários;
- visualização de estudos e uploads;
- área básica de Design System (tokens reais do código);
- logs principais;
- custo estimado de IA;
- painel apenas leitura.

### 21.2 Fora do MVP

- edição avançada de usuários, ações destrutivas, feature flags completas;
- relatórios avançados, alertas automáticos, auditoria granular;
- gráficos complexos, monitoramento financeiro detalhado;
- segundo fator de autenticação.

---

## 22. Critérios de aceite

- Usuário comum não vê o widget operacional.
- Usuário com permissão `operational` vê o widget em todos os ambientes.
- O widget abre o painel em nova aba.
- O painel bloqueia acesso sem permissão (inclusive via URL direta).
- O acesso é registrado em log.
- Métricas carregam com estado de loading e tratam erros.
- O operador consegue buscar/filtrar usuários, estudos e uploads.
- O painel exibe tokens de cor e componentes do Design System real.
- O painel é apenas leitura no MVP.
- Dados sensíveis são tratados com cuidado.

---

## 23. Decisões tomadas

| Questão | Decisão |
|---|---|
| Nome da permissão | `operational` |
| Localização do painel | Dentro da mesma aplicação (rota protegida) |
| Ambientes do widget | Todos (produção, desenvolvimento, staging) para usuários autorizados |
| MVP apenas leitura? | Sim |
| Mascarar e-mails? | Não no MVP |
| Design System | Alimentado pelos tokens e componentes reais do código |
| Custo de IA no MVP? | Sim |
| Retenção de logs | Indefinida por enquanto |
| Segundo fator | Não no MVP |

---

_Documento criado em 2026-05-16. Aguardando implementação._
