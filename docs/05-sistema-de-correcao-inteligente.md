# 05 — Sistema de Correção Inteligente e Critérios de Aceite

## 1. Objetivo do documento

Este documento define como a plataforma deve avaliar respostas dos alunos, especialmente em questões abertas, onde não é suficiente comparar a resposta do aluno com uma resposta exata.

O objetivo é criar um sistema de correção que seja útil, justo, pedagógico e orientado ao aprendizado.

A correção inteligente deve ajudar o aluno a entender:

* se respondeu corretamente;
* se respondeu parcialmente;
* se deixou algo importante de fora;
* se confundiu conceitos;
* se precisa revisar antes de avançar;
* como melhorar em uma nova tentativa.

---

## 2. Papel da correção inteligente dentro do produto

A correção inteligente é uma das principais diferenças entre a plataforma e um simples quiz. Ela permite que o sistema funcione como um tutor de estudo, não apenas como um corretor binário.

O sistema deve avaliar a resposta do aluno e decidir:

* se a resposta está correta;
* se está parcialmente correta;
* se está incompleta;
* se está incorreta;
* se está fora do tema;
* se o aluno deve tentar novamente;
* se o gabarito deve ser mostrado;
* qual feedback pedagógico deve ser exibido.

**Fluxo conceitual:**

```
Resposta do aluno → Pré-validação → Avaliação → Feedback → Retry ou Gabarito → Registro de progresso
```

---

## 3. Diferença entre correção objetiva e correção inteligente

### 3.1 Correção objetiva

Usada quando existe uma resposta claramente determinada.

Exemplos: múltipla escolha · verdadeiro ou falso · resposta numérica exata · complete a frase com respostas aceitas.

Nesses casos, o sistema compara a resposta do aluno com o gabarito configurado.

### 3.2 Correção inteligente

Usada quando a resposta pode ser escrita de diferentes formas.

Exemplos: questão aberta curta · questão aberta longa · explicação de raciocínio · interpretação de texto · justificativa · produção textual.

Nesses casos, o sistema precisa avaliar significado, completude, conceitos e possíveis equívocos.

---

## 4. Tipos de resposta avaliados

### 4.1 Resposta selecionada
Alternativa A/B/C/D · verdadeiro ou falso · múltiplas opções selecionadas.

### 4.2 Resposta textual curta
```
Adjetivo é uma palavra que mostra uma qualidade de um substantivo.
```

### 4.3 Resposta textual longa
```
A vírgula foi usada para separar uma explicação dentro da frase, ajudando a deixar a leitura mais clara.
```

### 4.4 Resposta numérica
```
42
```

### 4.5 Resposta com unidade
```
15 cm
```

### 4.6 Resposta estruturada
Associação de colunas · ordenação · cálculo com justificativa · resposta com etapas.

---

## 5. Estados possíveis da avaliação

### 5.1 Estados principais

```
not_answered
too_short
incomplete
partially_correct
correct
incorrect
off_topic
needs_review
accepted_with_warning
retry_required
```

### 5.2 Tradução para interface

* Não respondida;
* Muito curta;
* Incompleta;
* Parcialmente correta;
* Correta;
* Incorreta;
* Fora do tema;
* Precisa revisar;
* Aceita com observação;
* Nova tentativa necessária.

### 5.3 Uso dos estados

Esses estados devem controlar:

* mensagem exibida ao aluno;
* botão principal da tela;
* possibilidade de avançar;
* exibição do gabarito;
* necessidade de nova tentativa;
* registro de progresso;
* recomendação de revisão.

---

## 6. Critérios de aceite

Critérios de aceite definem o que torna uma resposta válida ou suficiente. Eles podem variar por tipo de questão, tópico, dificuldade e objetivo pedagógico.

### 6.1 Critérios possíveis

* resposta exata;
* variação aceita;
* valor numérico correto;
* margem de erro;
* presença de conceitos obrigatórios;
* presença de conceitos desejáveis;
* ausência de conceitos incorretos;
* proximidade semântica com resposta ideal;
* completude mínima;
* clareza mínima;
* coerência com o enunciado.

### 6.2 Exemplo de critérios

```json
{
  "minimumScoreToPass": 75,
  "requiredConcepts": [
    "caracteriza um substantivo",
    "indica qualidade ou característica"
  ],
  "desiredConcepts": [
    "pode indicar estado ou aspecto"
  ],
  "forbiddenMisconceptions": [
    "adjetivo é uma ação",
    "adjetivo dá nome às coisas"
  ],
  "allowSimilarAnswers": true
}
```

---

## 7. Correção de questões abertas curtas

### 7.1 O sistema deve avaliar

* se a resposta responde ao enunciado;
* se contém os conceitos obrigatórios;
* se não contém erro conceitual grave;
* se está suficientemente completa;
* se é semanticamente próxima da resposta ideal;
* se a linguagem está compreensível.

### 7.2 Exemplo

**Pergunta:** Explique com suas palavras o que é um adjetivo.

**Resposta ideal:** Adjetivo é a palavra que caracteriza ou dá qualidade a um substantivo.

**Resposta do aluno:** É uma palavra que fala como uma coisa é.

**Avaliação:**
```json
{
  "status": "partially_correct",
  "score": 72,
  "feedback": "Sua resposta está no caminho certo. Você explicou que o adjetivo mostra como algo é, mas faltou mencionar que ele caracteriza um substantivo."
}
```

---

## 8. Correção de questões abertas longas

Fora do MVP inicial. Questões abertas longas exigem rubricas mais robustas e apresentam maior risco de erro na correção.

**Critérios possíveis no futuro:** aderência ao tema · estrutura da resposta · argumentação · evidências · clareza · completude · conceitos corretos · exemplos · conclusão.

---

## 9. Correção de respostas numéricas

### 9.1 Critérios

* valor correto;
* tolerância;
* arredondamento;
* uso de vírgula ou ponto;
* unidade obrigatória;
* equivalência de unidade, se suportado.

### 9.2 Exemplo

```json
{
  "correctValue": 3.14,
  "tolerance": 0.01,
  "unit": "cm",
  "unitRequired": true
}
```

### 9.3 Estados possíveis

Correta · Incorreta · Correta sem unidade · Dentro da margem · Fora da margem · Formato inválido.

---

## 10. Correção de complete a frase

### 10.1 Critérios

```json
{
  "acceptedAnswers": ["substantivo", "substantivos"],
  "caseSensitive": false,
  "ignoreAccents": true,
  "trimWhitespace": true
}
```

O sistema deve considerar: respostas aceitas · variações de singular/plural · maiúsculas e minúsculas · acentos · espaços extras · pequenas variações ortográficas, se permitido.

---

## 11. Correção parcial

### 11.1 Quando usar

A correção parcial deve ser usada quando:

* o aluno acertou parte do conceito;
* faltou um conceito obrigatório;
* a resposta está genérica demais;
* há um pequeno erro, mas a ideia central está correta;
* o aluno respondeu corretamente, mas de forma incompleta.

### 11.2 Exemplo

**Resposta do aluno:** Adjetivo é uma palavra que dá qualidade.

**Avaliação:** Parcialmente correta. Você mencionou qualidade, mas faltou explicar que o adjetivo caracteriza um substantivo.

---

## 12. Resposta incompleta

### 12.1 Exemplos

```
É uma palavra.
É quando fala algo.
Porque sim.
```

### 12.2 Comportamento recomendado

Antes de mostrar o gabarito, o sistema deve incentivar o aluno a melhorar:

```
Sua resposta parece incompleta. Tente explicar um pouco mais antes de verificar.
```

Botões:
```
[Melhorar resposta]   [Ver correção mesmo assim]
```

---

## 13. Resposta fora do tema

### 13.1 Exemplo

**Pergunta:** Explique o que é um adjetivo.

**Resposta:** Substantivo é o nome das coisas.

### 13.2 Comportamento recomendado

```
Parece que sua resposta fala sobre outro conceito. Leia o enunciado novamente e tente responder sobre adjetivos.
```

---

## 14. Conceitos obrigatórios

São ideias essenciais que precisam aparecer na resposta para que ela seja considerada correta.

**Exemplo** — Para "O que é um adjetivo?":
* caracteriza um substantivo;
* indica qualidade, estado ou característica.

Se um conceito obrigatório estiver ausente, a resposta pode ser considerada incompleta, parcialmente correta ou incorreta, dependendo da gravidade.

---

## 15. Conceitos desejáveis

Enriquecem a resposta, mas não são obrigatórios. Sua ausência não deve impedir a aprovação. Podem aumentar o score.

**Exemplo** — Para adjetivo: pode indicar estado · pode indicar aspecto · acompanha o substantivo.

---

## 16. Conceitos incorretos/proibidos

Indicam erro conceitual.

**Exemplo** — Para adjetivo: adjetivo é uma ação · adjetivo dá nome às coisas · adjetivo é sempre um verbo.

Se a resposta contiver um erro conceitual grave, o sistema deve reduzir o score ou classificar como incorreta, mesmo que parte da resposta pareça correta.

---

## 17. Score de aderência

### 17.1 Escala recomendada

```
0 a 100
```

### 17.2 Interpretação sugerida

| Faixa | Status |
|-------|--------|
| 0–39 | Incorreta |
| 40–59 | Incompleta ou parcialmente correta fraca |
| 60–74 | Parcialmente correta |
| 75–89 | Correta com observação |
| 90–100 | Correta |

### 17.3 Importante

O score não deve ser mostrado obrigatoriamente ao aluno no MVP. Ele pode ser usado internamente para decidir feedback e progresso.

Para o aluno, linguagem mais simples: **Correta** · **Quase lá** · **Precisa completar** · **Revise e tente novamente**.

---

## 18. Thresholds de aprovação

Threshold é a pontuação mínima necessária para considerar uma resposta aceitável.

**Recomendação inicial para questões abertas curtas:** `minimumScoreToPass = 75`

Cada questão pode ter seu próprio threshold:

```json
{ "minimumScoreToPass": 80 }
```

---

## 19. Feedback antes de revelar o gabarito

### 19.1 Quando usar

O sistema deve mostrar feedback antes do gabarito quando:

* a resposta estiver vazia;
* a resposta estiver muito curta;
* a resposta estiver incompleta;
* a resposta estiver parcialmente correta;
* a resposta estiver fora do tema;
* o aluno ainda puder melhorar sem ver a resposta.

### 19.2 Exemplos

```
Sua resposta está no caminho certo, mas ainda falta uma parte importante.
Quer tentar melhorar antes de ver a correção?
```

```
Você respondeu pouco. Tente explicar com mais detalhes antes de verificar.
```

```
Parece que você confundiu o conceito. Leia a pergunta novamente e tente mais uma vez.
```

---

## 20. Retry flow após erro ou resposta parcial

### 20.1 Fluxo recomendado

1. Aluno responde;
2. Sistema avalia;
3. Sistema mostra feedback;
4. Sistema oferece nova tentativa;
5. Durante a nova tentativa, o sistema esconde a resposta correta;
6. Sistema pode mostrar uma dica;
7. Aluno responde novamente;
8. Sistema compara evolução;
9. Sistema registra tentativa.

### 20.2 Configurações

```json
{
  "maxAttempts": 2,
  "allowRetryBeforeReveal": true,
  "hideCorrectAnswerDuringRetry": true,
  "showHintAfterIncorrect": true
}
```

---

## 21. Como esconder a resposta correta durante nova tentativa

### 21.1 O que pode continuar visível

* Enunciado;
* Resposta anterior do aluno, se útil;
* Feedback resumido;
* Dica;
* Tópico relacionado;
* Botão para revisar conteúdo.

### 21.2 O que deve ser escondido

* resposta ideal;
* gabarito completo;
* explicação muito direta que entregue a resposta;
* alternativa correta destacada, se houver retry objetivo.

---

## 22. Como mostrar explicação depois da correção

### 22.1 Estrutura recomendada

Após a correção final, a explicação deve conter:

* resultado;
* resposta correta ou ideal;
* explicação;
* onde o aluno acertou;
* onde errou ou deixou incompleto;
* dica de revisão;
* link para o tópico relacionado.

### 22.2 Exemplo

```
Resultado: parcialmente correta

Você acertou que o adjetivo mostra uma característica.
Faltou mencionar que ele caracteriza um substantivo.

Resposta ideal: Adjetivo é a palavra que caracteriza ou dá qualidade a um substantivo.

Revise o tópico: Adjetivos.
```

---

## 23. Riscos da correção por IA

### 23.1 Riscos principais

* aceitar resposta errada como correta;
* rejeitar resposta correta escrita de forma diferente;
* ser rigorosa ou permissiva demais;
* inventar justificativas;
* ignorar o nível escolar;
* não perceber ambiguidade;
* dar feedback confuso;
* revelar a resposta cedo demais;
* corrigir com base em conhecimento externo não presente no material.

### 23.2 Impacto

Esses erros podem prejudicar a confiança de pais, professores e alunos. Por isso, o sistema deve priorizar transparência, revisão humana e critérios explícitos.

---

## 24. Estratégias para reduzir erro de avaliação

### 24.1 Usar critérios explícitos

A IA deve receber: resposta ideal · conceitos obrigatórios · conceitos desejáveis · conceitos incorretos · nível escolar · tópico relacionado · explicação esperada.

### 24.2 Evitar correção sem gabarito

Questões abertas não devem ser corrigidas inteligentemente sem resposta ideal ou critérios mínimos.

### 24.3 Usar baixa confiança

Quando a IA não tiver certeza, deve retornar estado de baixa confiança ou `needs_review`.

### 24.4 Permitir revisão adulta

Pais e professores devem poder revisar gabaritos e critérios antes da publicação.

### 24.5 Limitar escopo no MVP

No MVP, priorizar questões abertas curtas e conceitos simples. Evitar inicialmente: redações longas · temas subjetivos · questões com múltiplas interpretações · avaliação de estilo textual · notas finais automáticas.

---

## 25. Estrutura de dados sugerida

### 25.1 EvaluationResult

```json
{
  "attemptId": "attempt_001",
  "questionId": "q_001",
  "status": "partially_correct",
  "score": 72,
  "confidence": 0.84,
  "canAdvance": false,
  "retryRecommended": true,
  "answerShouldBeRevealed": false
}
```

### 25.2 ConceptEvaluation

```json
{
  "requiredConceptsMatched": ["indica qualidade ou característica"],
  "requiredConceptsMissing": ["caracteriza um substantivo"],
  "forbiddenMisconceptionsDetected": [],
  "desiredConceptsMatched": []
}
```

### 25.3 FeedbackResult

```json
{
  "message": "Sua resposta está no caminho certo, mas falta mencionar que o adjetivo caracteriza um substantivo.",
  "hint": "Tente explicar a relação entre o adjetivo e o substantivo.",
  "recommendedAction": "retry"
}
```

### 25.4 RetryDecision

```json
{
  "shouldRetry": true,
  "hideCorrectAnswer": true,
  "showHint": true,
  "maxAttemptsReached": false
}
```

---

## 26. MVP vs versões futuras

### 26.1 MVP

* correção objetiva para múltipla escolha, verdadeiro/falso, complete a frase e numérica;
* correção de questão aberta curta com resposta ideal e critérios básicos;
* estados de avaliação;
* feedback antes do gabarito;
* retry simples;
* registro de score interno;
* indicação de parcialmente correta.

### 26.2 Fora do MVP

* correção de redação longa;
* rubricas complexas;
* avaliação de estilo;
* nota final automática para produção textual;
* comparação avançada entre alunos;
* ranking;
* correção de imagem ou áudio.

### 26.3 Futuro

* rubricas configuráveis;
* avaliação por competências;
* justificativa detalhada de score;
* feedback adaptado por idade;
* identificação de padrão de erro;
* recomendação automática de exercícios;
* evolução histórica por habilidade;
* correção assistida para professores.

---

## 27. Critérios de aceite

### 27.1 Correção objetiva
* O sistema corrige múltipla escolha, verdadeiro/falso, resposta numérica e complete a frase corretamente.

### 27.2 Correção aberta curta
* O sistema compara resposta do aluno com resposta ideal.
* O sistema identifica conceitos obrigatórios presentes e ausentes.
* O sistema identifica conceitos incorretos quando configurados.
* O sistema retorna status, score e feedback.
* O sistema diferencia correta, parcialmente correta, incompleta e incorreta.

### 27.3 Feedback
* O sistema não mostra gabarito imediatamente quando a resposta está vazia ou incompleta.
* O sistema orienta o aluno antes de revelar a resposta.
* O feedback é claro, respeitoso e adequado ao estudo.

### 27.4 Retry
* O sistema permite nova tentativa quando configurado.
* O sistema esconde a resposta correta durante retry, quando configurado.
* O sistema registra múltiplas tentativas.
* O sistema atualiza progresso após cada avaliação.

### 27.5 Segurança pedagógica
* Questões abertas sem resposta ideal não devem ser corrigidas automaticamente.
* Avaliações com baixa confiança devem ser sinalizadas.
* O adulto deve poder revisar critérios antes da publicação.

---

## 28. Questões em aberto

1. O score deve ser mostrado ao aluno ou apenas usado internamente?
2. Qual threshold padrão deve ser usado para cada tipo de questão aberta?
3. O aluno pode avançar com resposta parcialmente correta?
4. Quando o sistema deve bloquear avanço?
5. O adulto poderá editar os thresholds por questão?
6. O sistema deve permitir que o aluno peça uma dica antes de responder?
7. Quantas tentativas devem ser permitidas por padrão?
8. A resposta ideal deve aparecer depois da primeira tentativa ou apenas depois da última?
9. Como lidar com respostas criativas, mas corretas?
10. Quando uma resposta deve ser enviada para revisão humana?
