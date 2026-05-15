# 07 — Experiência dos Pais e Professores

## 1. Objetivo do documento

Este documento define a experiência dos pais, responsáveis e professores dentro da plataforma.

O objetivo é orientar como adultos criam pacotes de estudo, fazem upload de conteúdos, revisam tópicos, organizam exercícios, publicam módulos para alunos, acompanham progresso e organizam alunos em grupos, turmas ou categorias.

A experiência adulta deve equilibrar simplicidade, controle e flexibilidade. O adulto precisa conseguir transformar materiais brutos em estudos utilizáveis sem depender de conhecimento técnico, mas também deve ter controle suficiente para revisar, corrigir e organizar o conteúdo antes de disponibilizar ao aluno.

---

## 2. Papel da experiência dos pais e professores

Pais, responsáveis e professores são os principais criadores e curadores de conteúdo da plataforma.

Eles podem:

* criar estudos;
* enviar PDFs;
* revisar conteúdo organizado pela IA;
* criar ou importar exercícios;
* validar gabaritos;
* publicar módulos para alunos;
* organizar alunos em grupos;
* convidar alunos por e-mail ou link;
* acompanhar progresso;
* identificar dificuldades.

A experiência desses usuários precisa garantir confiança no conteúdo gerado e facilitar a publicação de materiais de estudo para crianças e adolescentes.

---

## 3. Perfis de usuário adulto

### 3.1 Pai, mãe ou responsável

Usuário adulto que cria materiais para um ou mais filhos/dependentes.

Exemplos de uso:

* revisar para prova de português;
* criar exercícios de matemática;
* organizar material enviado pela escola;
* acompanhar dificuldades do filho.

### 3.2 Professor

Usuário adulto que cria materiais para alunos, grupos, turmas ou escolas.

Exemplos de uso:

* criar revisão para uma turma;
* importar lista de exercícios;
* acompanhar desempenho dos alunos;
* organizar conteúdos por matéria ou prova.

### 3.3 Tutor/reforço escolar

Usuário adulto que trabalha com pequenos grupos ou alunos individuais.

Exemplos de uso:

* criar módulos por dificuldade;
* acompanhar evolução do aluno;
* publicar tarefas semanais;
* separar conteúdos por matéria.

---

## 4. Princípios da experiência adulta

### 4.1 Controle antes da publicação
O adulto deve poder revisar tudo antes de disponibilizar para o aluno.

### 4.2 Simplicidade operacional
Criar um estudo deve exigir poucos passos essenciais.

### 4.3 Organização flexível
A plataforma deve permitir organizar alunos e estudos por família, escola, turma, grupo, matéria ou categoria personalizada.

### 4.4 Transparência da IA
Conteúdos gerados ou modificados por IA devem ser claramente revisáveis.

### 4.5 Reutilização
O adulto deve conseguir reutilizar conteúdos, duplicar estudos e reaproveitar questões.

### 4.6 Segurança e privacidade
Dados de alunos, materiais e respostas devem ser protegidos por permissões claras.

---

## 5. Jornada geral do adulto

A jornada principal do adulto deve seguir este fluxo:

1. Criar ou selecionar um grupo/aluno;
2. Criar um novo pacote de estudo;
3. Informar matéria, série, tema ou prova;
4. Fazer upload de PDF ou importar StudyPack;
5. Aguardar processamento;
6. Revisar tópicos detectados;
7. Revisar explicações e exemplos;
8. Revisar ou criar exercícios;
9. Validar gabaritos e critérios de correção;
10. Definir alunos ou grupos que receberão o módulo;
11. Publicar como estudo/tarefa;
12. Acompanhar progresso e dificuldades.

**Fluxo conceitual:**

```
Organizar alunos → Criar estudo → Enviar conteúdo → Revisar → Publicar → Acompanhar
```

---

## 6. Criação de pacote de estudo

### 6.1 Objetivo
Permitir que o adulto crie um novo pacote de estudo ou módulo/tarefa para alunos.

### 6.2 Informações básicas

Um pacote pode conter:

* título;
* matéria;
* ano/série;
* descrição;
* data da prova, se houver;
* prazo de conclusão, se houver;
* grupo ou aluno associado;
* tags;
* visibilidade;
* status.

### 6.3 Exemplo

```
Título: Revisão de Português — Prova de sexta-feira
Matéria: Português
Ano: 6º ano
Grupo: Família — Sofia
Prazo: Quinta-feira, 20h
```

### 6.4 Estados do pacote

```
draft
processing
ready_for_review
ready_to_publish
published
archived
```

Tradução para interface:

* Rascunho;
* Processando;
* Pronto para revisar;
* Pronto para publicar;
* Publicado;
* Arquivado.

---

## 7. Upload e organização de conteúdo

### 7.1 Objetivo
Permitir que o adulto envie materiais para o sistema organizar.

### 7.2 Entradas possíveis

**No MVP:**

* PDF textual;
* arquivo StudyPack JSON.

**Futuro:**

* texto colado;
* imagens;
* PDFs escaneados;
* DOCX;
* Markdown;
* slides;
* múltiplos arquivos.

### 7.3 Comportamento esperado

O adulto deve conseguir:

* fazer upload;
* acompanhar processamento;
* ver erros de leitura;
* revisar tópicos sugeridos;
* editar conteúdo;
* aprovar ou rejeitar sugestões da IA.

---

## 8. Revisão de tópicos e explicações

### 8.1 Objetivo
Garantir que o conteúdo organizado esteja correto antes de ser publicado.

### 8.2 O adulto deve poder revisar

* tópicos detectados;
* ordem dos tópicos;
* resumos;
* explicações;
* exemplos;
* erros comuns;
* exercícios detectados;
* baixa confiança da IA.

### 8.3 Ações disponíveis

* editar;
* excluir;
* dividir tópico;
* unir tópicos;
* reorganizar;
* adicionar novo tópico;
* marcar como revisado;
* solicitar nova geração;
* publicar.

---

## 9. Criação e revisão de exercícios

### 9.1 Objetivo
Permitir que o adulto crie, importe, revise e organize exercícios.

### 9.2 Fontes dos exercícios

* exercícios detectados em PDF;
* exercícios importados via StudyPack;
* exercícios criados manualmente;
* exercícios gerados por IA;
* exercícios duplicados de outro pacote.

### 9.3 O adulto deve poder editar

* enunciado;
* tipo da questão;
* alternativas;
* resposta correta;
* resposta ideal;
* explicação;
* dica;
* dificuldade;
* tópico associado;
* tentativas;
* feedbacks;
* critérios de aceite.

### 9.4 Status da questão

```
draft
needs_answer_key
needs_review
ready
published
```

Tradução para interface:

* Rascunho;
* Precisa de gabarito;
* Precisa revisar;
* Pronta;
* Publicada.

---

## 10. Publicação de módulos/tarefas

### 10.1 Objetivo
Permitir que o adulto disponibilize um pacote de estudo para um ou mais alunos.

### 10.2 Publicação pode ser feita para

* aluno individual;
* grupo familiar;
* turma;
* escola;
* grupo de reforço;
* categoria personalizada.

### 10.3 Configurações de publicação

Um módulo/tarefa pode ter:

* alunos atribuídos;
* grupo associado;
* prazo opcional;
* obrigatoriedade;
* ordem recomendada;
* visibilidade do gabarito;
* número de tentativas;
* modo estudo ou modo tarefa;
* notificações futuras.

### 10.4 Estados da tarefa

```
assigned
in_progress
completed
overdue
needs_review
```

Tradução para interface:

* Atribuída;
* Em andamento;
* Concluída;
* Atrasada;
* Precisa revisar.

---

## 11. Grupos, turmas e organização de alunos

### 11.1 Objetivo
Permitir que pais e professores organizem alunos em estruturas flexíveis.

Essas estruturas podem representar famílias, turmas, escolas, matérias, grupos de reforço ou qualquer organização criada pelo adulto.

### 11.2 Tipos de grupo

Tipos sugeridos:

```
family
school
classroom
tutoring_group
subject_group
custom
```

Tradução para interface:

* Família;
* Escola;
* Turma;
* Grupo de reforço;
* Grupo por matéria;
* Personalizado.

### 11.3 Exemplos de grupos

```
Família — Sofia
Escola Anchieta — 6º ano B
Reforço de Português — Maio
Turma de Matemática — 7º ano
Português — Prova mensal
```

### 11.4 Metadados de grupo

Um grupo pode conter:

* nome;
* descrição;
* tipo;
* escola vinculada;
* turma;
* matéria principal;
* ano/série;
* tags;
* adultos administradores;
* alunos vinculados;
* módulos publicados;
* status ativo/inativo.

### 11.5 Tags de organização

Tags podem ajudar a organizar grupos e conteúdos.

Exemplos:

```
Escola
Família
Português
6º ano
Prova bimestral
Reforço
Particular
```

### 11.6 Relação grupo → aluno → módulo

Um grupo pode ter vários alunos.
Um aluno pode estar em vários grupos.
Um módulo pode ser publicado para:

* um aluno específico;
* vários alunos;
* um grupo inteiro;
* múltiplos grupos.

---

## 12. Pré-cadastro de alunos

### 12.1 Objetivo
Permitir que pais e professores cadastrem alunos antes de eles acessarem a plataforma.

### 12.2 Informações mínimas

Para pré-cadastrar um aluno, o adulto pode informar:

* nome;
* sobrenome opcional;
* e-mail opcional;
* ano/série opcional;
* grupo associado;
* tags;
* observações internas.

### 12.3 Aluno sem conta ativa

O sistema deve permitir que exista um aluno pré-cadastrado sem conta ativa.

Isso permite que o adulto:

* organize estudos antes do aluno entrar;
* atribua módulos previamente;
* envie convite depois;
* acompanhe status de convite.

### 12.4 Status do aluno

```
pre_registered
invited
active
inactive
removed
```

Tradução para interface:

* Pré-cadastrado;
* Convidado;
* Ativo;
* Inativo;
* Removido.

---

## 13. Convites por e-mail e link

### 13.1 Objetivo
Permitir que alunos acessem a plataforma por convite.

### 13.2 Formas de convite

O adulto pode:

* enviar convite por e-mail;
* gerar link de convite;
* copiar link para WhatsApp ou outro canal;
* reenviar convite;
* revogar convite.

### 13.3 Convite por e-mail

Fluxo:

1. Adulto informa e-mail do aluno;
2. Sistema envia convite;
3. Aluno acessa link;
4. Aluno cria conta ou entra;
5. Sistema associa o aluno ao grupo correto.

### 13.4 Convite por link

Fluxo:

1. Adulto gera link;
2. Adulto compartilha com o aluno;
3. Aluno acessa link;
4. Sistema solicita identificação/login;
5. Sistema associa aluno ao grupo ou tarefa.

### 13.5 Estados do convite

```
pending
accepted
expired
revoked
```

Tradução para interface:

* Pendente;
* Aceito;
* Expirado;
* Revogado.

### 13.6 Cuidados

Links de convite devem ter:

* expiração;
* escopo claro;
* possibilidade de revogação;
* proteção contra acesso indevido;
* associação correta ao grupo ou módulo.

---

## 14. Organização visível para o aluno

### 14.1 Objetivo
Garantir que o aluno entenda de onde vem cada estudo ou tarefa.

A interface do aluno deve diferenciar conteúdos criados por ele mesmo e conteúdos atribuídos por adultos/professores.

### 14.2 Divisões possíveis na área do aluno

```
Meus estudos
Família
Escola Anchieta — 6º ano B
Reforço de Português
Tarefas da professora Ana
```

### 14.3 Conteúdos pessoais do aluno

São estudos criados pelo próprio aluno.

Exemplos:

* Minha revisão de matemática;
* Assuntos que eu errei;
* Prova de português;
* Minhas dúvidas.

### 14.4 Conteúdos atribuídos

São estudos publicados por adultos, professores ou grupos.

Exemplos:

* Revisão enviada pelo pai;
* Tarefa da professora Ana;
* Escola Anchieta — Português — 6º B;
* Reforço de matemática.

### 14.5 Regra de clareza

O aluno deve conseguir identificar:

* quem enviou o estudo;
* para qual grupo/turma ele pertence;
* se é obrigatório ou opcional;
* se tem prazo;
* se está concluído ou pendente.

---

## 15. Permissões entre adultos e alunos

### 15.1 Objetivo
Definir diferenças entre conteúdos criados pelo adulto e conteúdos criados pelo aluno.

### 15.2 Conteúdo criado pelo adulto/professor

O adulto pode:

* criar;
* editar antes da publicação;
* publicar;
* arquivar;
* atribuir a alunos/grupos;
* acompanhar progresso;
* revisar desempenho.

O aluno pode:

* acessar;
* estudar;
* responder;
* revisar feedback;
* concluir;
* refazer quando permitido.

### 15.3 Conteúdo criado pelo aluno

O aluno pode:

* criar módulos próprios;
* fazer upload de materiais próprios;
* organizar categorias pessoais;
* responder exercícios próprios;
* acompanhar progresso pessoal.

O adulto pode ou não visualizar conteúdos pessoais do aluno, dependendo das permissões futuras do produto.

### 15.4 Decisão para MVP

No MVP, recomenda-se simplificar permissões:

* adulto vê conteúdos que criou e atribuiu;
* aluno vê conteúdos atribuídos e seus próprios conteúdos;
* conteúdos pessoais do aluno ficam separados de conteúdos atribuídos;
* compartilhamento avançado fica para fases futuras.

---

## 16. Autonomia do aluno para criar conteúdos próprios

### 16.1 Objetivo
Permitir que o aluno também use a plataforma para criar seus próprios estudos, não apenas consumir tarefas enviadas por adultos.

### 16.2 O aluno pode criar

* pacotes de estudo próprios;
* categorias pessoais;
* revisões para prova;
* exercícios a partir de um material;
* módulos de prática;
* listas de tópicos que deseja revisar.

### 16.3 Diferença entre criação do aluno e do adulto

A interface deve separar claramente:

```
Criado por mim
Enviado para mim
```

Ou:

```
Meus estudos
Tarefas atribuídas
```

### 16.4 Categorias pessoais

O aluno pode criar categorias como:

```
Minhas revisões
Prova de Português
Matemática difícil
Assuntos que errei
Quero revisar depois
```

### 16.5 Categorias atribuídas

Categorias atribuídas são criadas por adultos ou grupos.

Exemplos:

```
Família — Sofia
Escola Anchieta — 6º ano B
Tarefas da professora Ana
Reforço de Português
```

### 16.6 Cuidados

Como envolve crianças e adolescentes, a autonomia do aluno deve respeitar regras de segurança e privacidade.

Em versões futuras, pode haver configurações para responsáveis definirem se o aluno pode:

* fazer upload de arquivos;
* usar IA para gerar questões;
* compartilhar estudos;
* convidar outros alunos;
* tornar conteúdo visível para adultos.

---

## 17. Acompanhamento de progresso

### 17.1 Objetivo
Permitir que pais e professores vejam como os alunos estão evoluindo.

### 17.2 Informações úteis

O adulto pode visualizar:

* estudos atribuídos;
* status por aluno;
* tópicos concluídos;
* questões respondidas;
* acertos;
* erros;
* respostas parcialmente corretas;
* tópicos que precisam revisar;
* tentativas;
* última atividade.

### 17.3 Visão por aluno

Exemplo:

```
Sofia
Revisão de Português
Progresso: 75%
Tópicos concluídos: 3 de 4
Precisa revisar: Adjetivos
```

### 17.4 Visão por grupo/turma

Exemplo:

```
Escola Anchieta — 6º ano B
24 alunos
18 começaram
12 concluíram
Tópico com maior dificuldade: Pontuação
```

### 17.5 MVP

No MVP, o acompanhamento pode ser simples:

* status do estudo;
* progresso por aluno;
* acertos/erros;
* tópicos que precisam revisar.

Relatórios avançados ficam para documento próprio.

---

## 18. Estados da interface

### 18.1 Estados de pacote

* Rascunho;
* Processando;
* Pronto para revisar;
* Pronto para publicar;
* Publicado;
* Arquivado;
* Com erro.

### 18.2 Estados de grupo

* Ativo;
* Inativo;
* Sem alunos;
* Com convites pendentes;
* Com tarefas ativas.

### 18.3 Estados de aluno

* Pré-cadastrado;
* Convidado;
* Ativo;
* Inativo;
* Removido.

### 18.4 Estados de convite

* Pendente;
* Aceito;
* Expirado;
* Revogado.

### 18.5 Estados de tarefa

* Atribuída;
* Em andamento;
* Concluída;
* Atrasada;
* Precisa revisar.

---

## 19. MVP vs versões futuras

### 19.1 MVP

O MVP da experiência adulta deve incluir:

* criação de pacote de estudo;
* upload de PDF textual;
* importação de StudyPack JSON;
* revisão de tópicos;
* revisão de exercícios;
* publicação para aluno individual ou grupo simples;
* criação de grupos;
* pré-cadastro simples de alunos;
* convite por link ou e-mail;
* separação entre conteúdos atribuídos e conteúdos pessoais do aluno;
* acompanhamento básico de progresso.

### 19.2 Fora do MVP

Devem ficar fora do MVP inicial:

* gestão escolar completa;
* múltiplos papéis administrativos complexos;
* relatórios avançados por turma;
* integração com sistemas escolares;
* permissões detalhadas por escola;
* marketplace de materiais;
* biblioteca pública;
* colaboração entre professores;
* comentários em tempo real.

### 19.3 Futuro

Futuras versões podem incluir:

* escolas como organizações;
* múltiplas turmas por professor;
* permissões por coordenação;
* relatórios avançados;
* banco reutilizável de questões;
* tarefas recorrentes;
* calendário escolar;
* notificações;
* integração com Google Classroom ou similares;
* compartilhamento entre professores;
* aprovação de conteúdo por coordenação.

---

## 20. Estrutura de dados sugerida

### 20.1 Group

```json
{
  "id": "group_001",
  "name": "Escola Anchieta — 6º ano B",
  "type": "classroom",
  "schoolName": "Escola Anchieta",
  "grade": "6º ano",
  "tags": ["Português", "2026"],
  "createdBy": "user_teacher_001",
  "status": "active"
}
```

### 20.2 StudentProfile

```json
{
  "id": "student_001",
  "name": "Sofia",
  "email": "sofia@example.com",
  "grade": "6º ano",
  "status": "pre_registered"
}
```

### 20.3 GroupMember

```json
{
  "groupId": "group_001",
  "studentId": "student_001",
  "role": "student",
  "status": "active"
}
```

### 20.4 Invitation

```json
{
  "id": "invite_001",
  "groupId": "group_001",
  "studentId": "student_001",
  "email": "sofia@example.com",
  "status": "pending",
  "expiresAt": "2026-06-01T23:59:59Z"
}
```

### 20.5 Assignment

```json
{
  "id": "assignment_001",
  "studyPackId": "study_001",
  "assignedBy": "user_teacher_001",
  "assignedToType": "group",
  "assignedToId": "group_001",
  "dueDate": "2026-06-10T23:59:59Z",
  "status": "assigned"
}
```

### 20.6 StudentStudySpace

```json
{
  "studentId": "student_001",
  "sections": [
    {
      "type": "personal",
      "title": "Meus estudos"
    },
    {
      "type": "assigned",
      "title": "Escola Anchieta — 6º ano B"
    }
  ]
}
```

---

## 21. Critérios de aceite

### 21.1 Criação de grupo

* O adulto consegue criar um grupo.
* O grupo pode ter nome, tipo e tags.
* O grupo pode representar escola, turma, família, reforço ou categoria personalizada.

### 21.2 Pré-cadastro de aluno

* O adulto consegue pré-cadastrar um aluno.
* O aluno pode existir sem conta ativa.
* O aluno pode ser associado a um grupo.
* O status do aluno é exibido corretamente.

### 21.3 Convite

* O adulto consegue enviar convite por e-mail.
* O adulto consegue gerar link de convite.
* O aluno consegue aceitar convite.
* O sistema associa o aluno ao grupo correto.
* O adulto consegue ver convites pendentes, aceitos, expirados ou revogados.

### 21.4 Publicação de tarefa

* O adulto consegue publicar um estudo para um aluno ou grupo.
* O aluno vê o estudo na área correta.
* O estudo atribuído aparece separado dos estudos pessoais do aluno.
* O adulto consegue acompanhar status da tarefa.

### 21.5 Autonomia do aluno

* O aluno consegue criar conteúdos próprios, se permitido.
* Conteúdos pessoais aparecem separados dos conteúdos atribuídos.
* Categorias criadas pelo aluno não se confundem com grupos/turmas atribuídos por adultos.

### 21.6 Acompanhamento

* O adulto consegue ver progresso básico por aluno.
* O adulto consegue identificar estudos em andamento e concluídos.
* O adulto consegue identificar tópicos que precisam de revisão.

---

## 22. Questões em aberto

| # | Questão | Decisão |
|---|---|---|
| 1 | No MVP, o aluno poderá criar estudos próprios sem aprovação do adulto? | **Sim** |
| 2 | O responsável poderá ver todos os estudos pessoais criados pelo aluno? | **Não** |
| 3 | O professor poderá editar um estudo depois de publicado para uma turma? | **Sim** |
| 4 | O convite por link deve permitir qualquer aluno entrar ou exigir e-mail específico? | **Qualquer um com o link único; depois de usado, é invalidado** |
| 5 | Convites devem expirar em quantos dias? | **5 dias** |
| 6 | Um aluno pode pertencer a múltiplas escolas/turmas? | **Sim** |
| 7 | Um responsável pode estar vinculado ao mesmo aluno que um professor? | **Sim** |
| 8 | Como lidar com alunos menores de idade em termos de consentimento? | **Por enquanto nada; no futuro, pedido de autorização dos pais** |
| 9 | Grupos devem poder ter mais de um adulto administrador no MVP? | **Sim** |
| 10 | O produto deve usar o termo "módulo", "tarefa", "estudo" ou permitir diferentes nomes por contexto? | **Permitir diferentes nomes por contexto; padrão é "módulo"** |
