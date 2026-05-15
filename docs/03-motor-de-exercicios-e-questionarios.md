# 03 — Motor de Exercícios e Questionários

## 1. Objetivo do módulo

O Motor de Exercícios e Questionários é o módulo responsável por transformar questões em experiências interativas de prática, correção e revisão para o aluno.

Ele deve permitir que exercícios vindos de PDFs, arquivos padronizados, criação manual ou geração por IA sejam interpretados, organizados e renderizados de acordo com seu tipo.

O objetivo central deste módulo é fazer com que o aluno não apenas veja perguntas e respostas, mas pratique ativamente, receba feedback, tente novamente quando necessário e entenda o motivo de seus erros.

---

## 2. Papel do motor dentro do produto

Este motor é uma das partes centrais da plataforma, pois conecta conteúdo estudado com prática ativa.

Ele deve responder a perguntas como:

* Que tipo de questão é esta?
* Como esta questão deve aparecer para o aluno?
* Como a resposta do aluno deve ser coletada?
* Como validar se a resposta está correta?
* Quando mostrar feedback?
* Quando permitir nova tentativa?
* Quando mostrar o gabarito?
* Como registrar progresso?

**Fluxo conceitual:**

```
Questão estruturada → Renderização interativa → Resposta do aluno → Pré-validação → Correção → Feedback → Nova tentativa ou avanço
```

---

## 3. Relação com o Motor de Leitura de Conteúdo

O Motor de Leitura e Organização de Conteúdo pode detectar exercícios de forma preliminar dentro de um PDF ou material enviado. Porém, a responsabilidade de transformar esses exercícios em atividades interativas pertence ao Motor de Exercícios e Questionários.

**Responsabilidades do Motor de Leitura**

* Detectar possíveis enunciados;
* Identificar alternativas aparentes;
* Reconhecer comandos como "marque", "responda", "complete" ou "calcule";
* Sugerir tipo preliminar de questão;
* Indicar baixa confiança;
* Encaminhar exercícios candidatos para revisão.

**Responsabilidades do Motor de Exercícios**

* Confirmar ou ajustar o tipo da questão;
* Estruturar dados da questão;
* Validar se há gabarito;
* Renderizar o componente correto;
* Controlar resposta, feedback e tentativas;
* Registrar desempenho;
* Preparar a questão para uso pelo aluno.

---

## 4. Relação com o StudyPack Format

O StudyPack Format é o padrão de arquivo que permitirá a criação e importação de exercícios compatíveis com o sistema. O Motor de Exercícios deve ser capaz de interpretar esse padrão.

Este documento descreve o comportamento do motor. O detalhamento completo do formato do arquivo será feito no documento **04 — StudyPack Format: Padrão de Arquivo de Questões**.

```
StudyPack Format  = como a questão é escrita/importada
Motor de Exercícios = como a questão funciona dentro do produto
```

---

## 5. Tipos de questões suportadas

### 5.1 Tipos recomendados para o MVP

1. Múltipla escolha;
2. Verdadeiro ou falso;
3. Complete a frase;
4. Questão aberta curta;
5. Resposta numérica simples.

### 5.2 Tipos planejados para versões futuras

1. Múltipla seleção;
2. Questão aberta longa;
3. Associação de colunas;
4. Ordenação;
5. Interpretação de texto;
6. Questão com explicação obrigatória;
7. Questão baseada em imagem;
8. Questão baseada em tabela;
9. Questão baseada em áudio;
10. Questão de produção textual longa.

---

## 6. Estrutura base de uma questão

Toda questão, independentemente do tipo, deve ter uma estrutura mínima comum.

### 6.1 Campos básicos

* ID único;
* Tipo da questão;
* Título opcional;
* Enunciado;
* Tópico associado;
* Matéria;
* Ano/série;
* Dificuldade;
* Resposta correta ou ideal;
* Explicação;
* Critérios de correção;
* Configuração de tentativas;
* Estado de publicação;
* Origem da questão.

### 6.2 Exemplo conceitual

```json
{
  "id": "q_001",
  "type": "multiple_choice",
  "topicId": "topic_substantivos",
  "difficulty": "easy",
  "prompt": "Qual palavra abaixo é um substantivo?",
  "explanation": "Casa é um substantivo porque dá nome a um objeto ou lugar.",
  "source": "uploaded_pdf",
  "status": "ready"
}
```

---

## 7. Fluxo geral de resposta do aluno

### 7.1 Etapas principais

1. O aluno visualiza a questão;
2. O aluno responde;
3. O sistema verifica se há resposta mínima válida;
4. O sistema faz uma pré-validação;
5. O aluno pode receber orientação antes da correção final;
6. O aluno confirma que deseja verificar;
7. O sistema corrige;
8. O sistema mostra feedback;
9. O aluno pode tentar novamente ou avançar;
10. O sistema registra a tentativa e atualiza o progresso.

### 7.2 Princípio importante

O sistema deve evitar revelar imediatamente o gabarito quando a resposta do aluno está incompleta ou quando ainda há oportunidade de aprendizagem ativa.

---

## 8. Pré-validação antes da correção

### 8.1 Objetivo

A pré-validação verifica a qualidade mínima da resposta antes de mostrar a correção final. Ela serve para estimular o aluno a melhorar a resposta antes de ver o gabarito.

### 8.2 Casos detectáveis

* Resposta vazia;
* Resposta muito curta;
* Resposta incompleta;
* Resposta aparentemente fora do tema;
* Resposta com baixa confiança;
* Resposta parcialmente correta;
* Resposta sem unidade, quando unidade for obrigatória;
* Alternativas não selecionadas;
* Múltipla seleção incompleta.

### 8.3 Exemplos de mensagens

```
Você ainda não respondeu esta questão.
```

```
Sua resposta parece muito curta. Tente explicar um pouco mais antes de verificar.
```

```
Sua resposta está no caminho certo, mas parece incompleta. Quer tentar melhorar antes de ver a correção?
```

```
Revise sua resposta. Parece que você respondeu sobre outro assunto.
```

### 8.4 Ações possíveis

Após a pré-validação, o aluno pode:

* Continuar editando;
* Verificar mesmo assim;
* Receber uma dica;
* Pular a questão, se permitido;
* Voltar para revisar o conteúdo relacionado.

---

## 9. Correção por tipo de questão

### 9.1 Múltipla escolha

O aluno escolhe uma alternativa entre várias. A correção é objetiva.

O sistema deve validar:

* se uma alternativa foi selecionada;
* se a alternativa corresponde à correta;
* se deve mostrar explicação das alternativas erradas;
* se há permissão para tentar novamente.

```json
{
  "type": "multiple_choice",
  "correctOptionId": "c"
}
```

### 9.2 Verdadeiro ou falso

O aluno escolhe entre verdadeiro e falso. A correção é objetiva. O sistema deve mostrar uma explicação curta após a resposta.

### 9.3 Complete a frase

O aluno preenche uma lacuna. A correção pode aceitar variações.

O sistema deve considerar:

* resposta exata;
* variações aceitáveis;
* acentos;
* plural/singular quando aplicável;
* pequenas diferenças ortográficas, se permitido.

```json
{
  "acceptedAnswers": ["substantivo", "substantivos"],
  "caseSensitive": false,
  "ignoreAccents": true
}
```

### 9.4 Questão aberta curta

O aluno responde com uma frase ou pequeno parágrafo. A correção deve considerar resposta ideal e critérios de aceite.

O sistema deve avaliar:

* presença de conceitos obrigatórios;
* ausência de conceitos incorretos;
* proximidade semântica com a resposta ideal;
* completude;
* clareza.

```
Pergunta: Explique o que é um adjetivo.
Resposta ideal: Adjetivo é a palavra que caracteriza ou dá qualidade a um substantivo.
```

### 9.5 Resposta numérica simples

O aluno informa um número.

O sistema deve considerar:

* valor exato;
* margem de erro;
* unidade obrigatória, se houver;
* formato decimal;
* equivalência entre vírgula e ponto, quando aplicável.

```json
{
  "correctValue": 42,
  "tolerance": 0,
  "unitRequired": false
}
```

### 9.6 Múltipla seleção _(futuro)_

O aluno pode selecionar mais de uma alternativa.

O sistema deve validar:

* se todas as corretas foram marcadas;
* se nenhuma incorreta foi marcada;
* se há crédito parcial;
* se o aluno deixou alternativas corretas sem marcar.

### 9.7 Questão aberta longa _(futuro)_

Usada para respostas mais elaboradas. O sistema deve avaliar aderência ao tema, argumentos principais, estrutura, conceitos obrigatórios, exemplos, clareza e completude. Fica fora do MVP por exigir critérios de correção mais complexos.

### 9.8 Associação de colunas _(futuro)_

O aluno associa itens entre duas listas. O sistema pode renderizar como dropdowns, arrastar e soltar, seleção de pares ou linhas conectando elementos.

### 9.9 Ordenação _(futuro)_

O aluno organiza itens em uma sequência correta: palavras para formar frase, etapas de processo, números, acontecimentos.

### 9.10 Interpretação de texto _(futuro)_

O aluno lê um texto-base e responde uma ou mais questões. Deve conter texto-base, perguntas relacionadas, respostas esperadas, critérios de aceite e explicações.

### 9.11 Questão com explicação obrigatória _(futuro)_

O aluno precisa responder e explicar o raciocínio. Especialmente útil para matemática e ciências. O sistema avalia resultado final, processo, justificativa e coerência entre cálculo e explicação.

---

## 10. Estados da resposta

### 10.1 Estados principais

```
not_answered
answered
too_short
incomplete
partially_correct
correct
incorrect
off_topic
needs_review
skipped
revealed_answer
retry_required
```

### 10.2 Tradução para interface

* Não respondida;
* Respondida;
* Muito curta;
* Incompleta;
* Parcialmente correta;
* Correta;
* Incorreta;
* Fora do tema;
* Precisa revisar;
* Pulada;
* Gabarito revelado;
* Nova tentativa necessária.

### 10.3 Uso dos estados

Esses estados devem controlar:

* feedback visual;
* liberação do botão de avançar;
* exibição do gabarito;
* necessidade de nova tentativa;
* atualização do progresso;
* recomendações de revisão.

---

## 11. Tentativas e retry flow

### 11.1 Objetivo

Permitir que o aluno aprenda com o erro e tente novamente.

### 11.2 Configurações possíveis

Cada questão pode definir:

* número máximo de tentativas;
* se deve permitir retry antes de mostrar gabarito;
* se deve exigir nova tentativa após erro;
* se deve esconder a resposta correta durante o retry;
* se deve mostrar apenas uma dica;
* se a pontuação muda após múltiplas tentativas.

### 11.3 Fluxo recomendado

1. Aluno responde;
2. Sistema avalia;
3. Se estiver incompleta, sugere melhorar;
4. Se estiver errada, mostra feedback;
5. Dependendo da configuração, mostra ou esconde resposta ideal;
6. Aluno tenta novamente;
7. Sistema registra nova tentativa;
8. Progresso considera evolução.

### 11.4 Regra pedagógica importante

Quando o aluno precisar responder novamente, o sistema deve evitar deixar a resposta correta visível durante a nova tentativa. Em vez disso, pode mostrar uma dica.

```
Dica: lembre-se de explicar o que o adjetivo faz em relação ao substantivo.
```

---

## 12. Gabarito e explicação

### 12.1 Objetivo

O gabarito não deve ser apenas a resposta correta. Ele deve ajudar o aluno a entender.

### 12.2 Estrutura ideal do gabarito

* resposta correta ou ideal;
* explicação curta;
* explicação detalhada opcional;
* motivo do erro comum;
* referência ao tópico relacionado;
* dica de revisão.

### 12.3 Modos de exibição

O gabarito pode ser exibido:

* após uma tentativa;
* após número máximo de tentativas;
* somente ao final do questionário;
* imediatamente após responder;
* apenas para pais/professores;
* de forma parcial, como dica.

### 12.4 Regra recomendada para o MVP

No MVP, o sistema pode mostrar o gabarito após a primeira tentativa, mas deve tentar orientar o aluno antes quando a resposta estiver vazia, muito curta ou incompleta.

---

## 13. Feedback pedagógico

### 13.1 Objetivo

O feedback deve ser claro, útil e motivador. Ele não deve apenas dizer "errado" — deve indicar o que o aluno pode fazer para melhorar.

### 13.2 Tipos de feedback

* Feedback de resposta correta;
* Feedback de resposta incorreta;
* Feedback de resposta incompleta;
* Feedback de resposta parcialmente correta;
* Feedback de resposta fora do tema;
* Feedback de nova tentativa;
* Feedback de revisão recomendada.

### 13.3 Exemplos

```
Muito bem! Você identificou corretamente o conceito principal.
```

```
Sua resposta está parcialmente correta. Você explicou a ideia geral, mas faltou mencionar que o adjetivo caracteriza um substantivo.
```

```
Ainda não. Revise o tópico sobre substantivos e tente novamente.
```

```
Você parece ter confundido substantivo com verbo. Volte ao exemplo anterior e tente de novo.
```

### 13.4 Tom de voz

O feedback deve ser:

* respeitoso;
* encorajador;
* direto;
* adequado à idade;
* sem humilhar;
* sem parecer robótico;
* focado em aprendizado.

---

## 14. Pontuação e progresso

### 14.1 Dados que podem ser registrados

* Questões respondidas;
* Acertos;
* Erros;
* Respostas parcialmente corretas;
* Questões puladas;
* Número de tentativas;
* Tempo por questão;
* Tópicos com mais dificuldade;
* Evolução entre tentativas.

### 14.2 Métricas úteis

* Taxa de acerto geral;
* Taxa de acerto por tópico;
* Questões que exigiram retry;
* Questões acertadas na segunda tentativa;
* Tópicos que precisam revisar;
* Tempo médio por questão.

### 14.3 Pontuação no MVP

No MVP, a pontuação deve ser simples: Correta / Parcialmente correta / Incorreta / Não respondida. A evolução detalhada fica para fases futuras.

---

## 15. Regras de renderização por tipo de questão

### 15.1 Múltipla escolha
Card com enunciado · lista de alternativas · seleção única · botão "Verificar resposta" · feedback após envio.

### 15.2 Verdadeiro ou falso
Card com afirmação · dois botões ou radio buttons · feedback curto · explicação.

### 15.3 Complete a frase
Texto com lacuna · campo de resposta · validação de resposta vazia · correção com variações aceitas.

### 15.4 Questão aberta curta
Enunciado · campo de texto · contador opcional de caracteres · dica opcional · pré-validação · feedback semântico.

### 15.5 Resposta numérica
Enunciado · campo numérico · campo de unidade se aplicável · validação de formato · feedback objetivo.

### 15.6 Associação _(futuro)_
Itens em pares · dropdown ou drag-and-drop · feedback por par correto/incorreto.

### 15.7 Ordenação _(futuro)_
Lista arrastável · botão verificar · feedback sobre posição correta/incorreta.

---

## 16. Interface esperada para o aluno

### 16.1 Elementos principais

* Número da questão;
* Tópico relacionado;
* Nível de dificuldade;
* Enunciado;
* Área de resposta;
* Botão de verificar;
* Feedback;
* Dica;
* Ação de tentar novamente;
* Ação de avançar;
* Indicador de progresso.

### 16.2 Exemplo conceitual

```
Questão 4 de 12
Tema: Adjetivos  |  Dificuldade: Fácil

Explique com suas palavras o que é um adjetivo.

[Campo de resposta]

[Verificar resposta]
```

### 16.3 Estados visuais necessários

* Estado inicial;
* Respondendo;
* Resposta vazia;
* Resposta incompleta;
* Correta;
* Parcialmente correta;
* Incorreta;
* Nova tentativa;
* Gabarito revelado;
* Questão concluída.

---

## 17. Interface esperada para pais/professores

### 17.1 Funcionalidades esperadas

O adulto deve poder:

* visualizar lista de exercícios;
* filtrar por tópico e por tipo;
* editar enunciado;
* alterar tipo da questão;
* adicionar alternativas;
* definir resposta correta;
* criar explicação;
* configurar tentativas;
* definir se o gabarito aparece imediatamente;
* marcar questão como obrigatória ou opcional;
* remover questão;
* reorganizar ordem;
* validar se está pronta para publicação.

### 17.2 Estados de revisão por questão

```
draft          → Rascunho
needs_answer_key → Precisa de gabarito
needs_review   → Precisa revisar
ready          → Pronta
published      → Publicada
```

---

## 18. MVP vs versões futuras

### 18.1 MVP

* Múltipla escolha;
* Verdadeiro ou falso;
* Complete a frase;
* Questão aberta curta;
* Resposta numérica simples;
* Gabarito comentado;
* Pré-validação básica;
* Feedback simples;
* Nova tentativa;
* Registro de progresso básico.

### 18.2 Fases futuras

* Múltipla seleção;
* Questão aberta longa;
* Associação e ordenação;
* Interpretação de texto avançada;
* Questões com imagens, tabelas e áudio;
* Correção avançada por rubrica;
* Simulados completos;
* Banco de questões reutilizável;
* Recomendações automáticas;
* Geração de novas questões com base em erros do aluno.

---

## 19. Estrutura de dados sugerida

### 19.1 Question

```json
{
  "id": "q_001",
  "studyPackId": "study_001",
  "topicId": "topic_001",
  "type": "multiple_choice",
  "prompt": "Qual palavra abaixo é um substantivo?",
  "difficulty": "easy",
  "order": 1,
  "status": "ready"
}
```

### 19.2 QuestionOption

```json
{
  "id": "option_c",
  "questionId": "q_001",
  "text": "Casa",
  "isCorrect": true,
  "explanation": "Casa é um substantivo porque dá nome a um objeto ou lugar."
}
```

### 19.3 AnswerKey

```json
{
  "questionId": "q_001",
  "correctAnswer": "option_c",
  "idealAnswer": null,
  "explanation": "Casa é um substantivo porque dá nome a um objeto ou lugar."
}
```

### 19.4 Attempt

```json
{
  "id": "attempt_001",
  "questionId": "q_001",
  "studentId": "student_001",
  "answer": "option_c",
  "status": "correct",
  "score": 100,
  "attemptNumber": 1,
  "createdAt": "2026-05-13T10:00:00Z"
}
```

### 19.5 Feedback

```json
{
  "attemptId": "attempt_001",
  "type": "correct",
  "message": "Muito bem! Você identificou corretamente o substantivo.",
  "recommendation": null
}
```

### 19.6 RetryConfig

```json
{
  "questionId": "q_001",
  "maxAttempts": 3,
  "allowRetryBeforeReveal": true,
  "hideCorrectAnswerDuringRetry": true,
  "showHintAfterIncorrect": true
}
```

---

## 20. Critérios de aceite

### 20.1 Renderização
* O sistema renderiza cada questão usando o componente correto.
* O aluno consegue responder a questão.
* O sistema impede envio de resposta vazia quando necessário.

### 20.2 Correção objetiva
* Múltipla escolha é corrigida corretamente.
* Verdadeiro ou falso é corrigido corretamente.
* Resposta numérica simples considera valor correto e margem, quando configurada.

### 20.3 Correção textual básica
* Complete a frase aceita respostas válidas configuradas.
* Questão aberta curta compara resposta com critérios mínimos.
* O sistema identifica respostas muito curtas ou incompletas.

### 20.4 Feedback
* O aluno recebe feedback após responder.
* Feedback incorreto não deve ser ofensivo ou desmotivador.
* O sistema diferencia correta, incorreta e parcialmente correta.

### 20.5 Tentativas
* O sistema registra cada tentativa.
* O aluno consegue tentar novamente quando permitido.
* O sistema consegue esconder a resposta correta durante o retry, quando configurado.

### 20.6 Gabarito
* O sistema mostra gabarito conforme configuração da questão.
* O gabarito inclui explicação.
* O aluno consegue entender por que errou.

### 20.7 Progresso
* O sistema atualiza progresso após cada resposta.
* O sistema registra acertos, erros e respostas parcialmente corretas.
* O adulto consegue ver um resumo básico do desempenho.

---

## 21. Questões em aberto

1. O aluno poderá pular questões no MVP?
2. Quantas tentativas serão permitidas por padrão?
3. A pontuação deve diminuir após múltiplas tentativas?
4. O gabarito deve aparecer imediatamente ou apenas ao final?
5. Questões abertas curtas devem ser corrigidas sempre por IA ou podem começar com critérios simples?
6. O adulto poderá definir manualmente mensagens de feedback por questão?
7. O aluno poderá pedir dica antes de responder?
8. O sistema deve bloquear avanço quando a resposta estiver incompleta?
9. Como diferenciar visualmente parcialmente correta de incorreta?
10. O produto deve ter modo simulado, sem feedback imediato, já no MVP?
