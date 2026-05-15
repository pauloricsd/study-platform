# 04 — StudyPack Format: Padrão de Arquivo de Questões

## 1. Objetivo do documento

Este documento define o StudyPack Format, o padrão de arquivo que permitirá criar, importar, validar e renderizar exercícios dentro da plataforma.

O objetivo é estabelecer uma estrutura clara para que pais, responsáveis, professores ou outras inteligências artificiais consigam gerar arquivos compatíveis com o sistema.

Esse formato deve permitir que o produto entenda com precisão:

* quais tópicos existem;
* quais questões pertencem a cada tópico;
* qual é o tipo de cada questão;
* como cada questão deve ser exibida;
* qual é o gabarito;
* quais critérios devem ser usados para correção;
* quais feedbacks devem ser mostrados ao aluno;
* como controlar tentativas e exibição de respostas.

---

## 2. O que é o StudyPack Format

O StudyPack Format é um padrão estruturado para representar pacotes de estudo.

Um pacote de estudo pode conter:

* informações gerais do material;
* matéria;
* ano escolar;
* tópicos;
* seções explicativas;
* exercícios;
* gabaritos;
* critérios de correção;
* configurações de feedback;
* configurações de tentativa;
* metadados pedagógicos.

O StudyPack Format deve funcionar como uma ponte entre conteúdo criado fora da plataforma e a experiência interativa dentro do produto.

---

## 3. Papel do formato dentro do produto

O StudyPack Format deve permitir que o sistema importe exercícios e conteúdos de forma previsível.

Ele deve ser usado por:

* professores que querem montar listas de exercícios compatíveis com a plataforma;
* pais que querem pedir a outra IA para gerar questões em um padrão aceito;
* o próprio sistema, ao transformar PDFs em pacotes estruturados;
* ferramentas futuras de exportação e reuso de materiais;
* fluxos de backup, duplicação ou compartilhamento de estudos.

**Fluxo conceitual:**

```
Arquivo StudyPack → Validação → Importação → Revisão humana → Publicação → Experiência do aluno
```

---

## 4. Quem usa esse formato

### 4.1 Pais e responsáveis
Podem baixar um modelo, preencher ou pedir a uma IA externa que gere um arquivo seguindo esse padrão.

### 4.2 Professores
Podem criar listas de exercícios padronizadas e reutilizáveis.

### 4.3 Outras inteligências artificiais
Podem receber o modelo do formato e gerar questões estruturadas para upload na plataforma.

### 4.4 O próprio sistema
Pode gerar internamente pacotes no mesmo padrão após ler PDFs ou organizar conteúdos.

---

## 5. Princípios do formato

### 5.1 Clareza
O formato deve ser fácil de entender e documentar.

### 5.2 Validação
O sistema deve conseguir validar o arquivo antes de importar.

### 5.3 Flexibilidade
O formato deve suportar diferentes tipos de questões e evoluir com novas versões.

### 5.4 Previsibilidade
Cada tipo de questão deve ter uma estrutura clara, com campos esperados.

### 5.5 Interoperabilidade
O formato deve ser compreensível por humanos, sistemas e outras IAs.

### 5.6 Versionamento
Todo arquivo deve indicar a versão do padrão utilizada.

### 5.7 Revisão humana
Mesmo quando o arquivo for válido, o adulto deve poder revisar antes de publicar.

---

## 6. Formatos suportados

### 6.1 Formato principal recomendado

Para o MVP, o formato principal recomendado é **JSON**.

Motivo:
* fácil de validar;
* compatível com schemas;
* fácil para IA gerar;
* fácil para o sistema importar;
* previsível para diferentes tipos de questão.

Extensão: `.studypack.json`

### 6.2 Formatos futuros possíveis

* YAML;
* Markdown estruturado;
* CSV para questões simples;
* DOCX com template;
* exportação/importação via ZIP.

---

## 7. Estrutura geral do arquivo

```json
{
  "studyPackVersion": "1.0",
  "metadata": {},
  "topics": [],
  "questions": [],
  "settings": {}
}
```

---

## 8. Campos obrigatórios

### 8.1 No nível do pacote
* `studyPackVersion`
* `metadata.title`
* `metadata.subject`
* `metadata.schoolLevel`
* `topics`
* `questions`

### 8.2 Em cada tópico
* `id`
* `title`
* `summary`

### 8.3 Em cada questão
* `id`
* `type`
* `topicId`
* `prompt`
* `answerKey`
* `explanation`

### 8.4 Por que esses campos são obrigatórios

Esses campos garantem que o sistema consiga identificar a versão do arquivo, organizar o pacote, associar questões aos tópicos, renderizar corretamente cada exercício, corrigir a resposta e explicar o gabarito ao aluno.

---

## 9. Campos opcionais

**No pacote:**
`metadata.description` · `metadata.examDate` · `metadata.createdBy` · `metadata.language` · `metadata.studentAge` · `metadata.tags` · `metadata.source` · `settings.defaultRetryConfig` · `settings.answerRevealMode` · `settings.feedbackTone`

**Em tópicos:**
`order` · `sourcePages` · `difficulty` · `estimatedStudyTime` · `keyConcepts` · `commonMistakes` · `examples`

**Em questões:**
`title` · `difficulty` · `points` · `estimatedTime` · `tags` · `source` · `hint` · `feedback` · `retryConfig` · `acceptanceCriteria` · `pedagogicalGoal` · `requiredSkills`

---

## 10. Estrutura de tópicos

```json
{
  "id": "topic_adjetivos",
  "title": "Adjetivos",
  "summary": "Palavras que caracterizam ou dão qualidade aos substantivos.",
  "order": 2,
  "keyConcepts": [
    "característica",
    "qualidade",
    "substantivo"
  ],
  "commonMistakes": [
    "confundir adjetivo com substantivo",
    "confundir adjetivo com verbo"
  ]
}
```

**Regras:**
* O ID do tópico deve ser único.
* Toda questão deve apontar para um `topicId` válido.
* A ordem dos tópicos deve poder ser definida manualmente.
* O resumo deve ser curto e claro.

---

## 11. Estrutura base de uma questão

```json
{
  "id": "q_001",
  "type": "multiple_choice",
  "topicId": "topic_substantivos",
  "difficulty": "easy",
  "prompt": "Qual palavra abaixo é um substantivo?",
  "answerKey": {},
  "explanation": "Casa é um substantivo porque dá nome a um objeto ou lugar."
}
```

**Tipos de dificuldade:** `easy` · `medium` · `hard`

**Regras para IDs:** únicos dentro do arquivo, letras minúsculas, números e underscores, sem espaços ou caracteres especiais.

---

## 12. Tipos de questões no formato

### 12.1 Múltipla escolha

```json
{
  "id": "q_001",
  "type": "multiple_choice",
  "topicId": "topic_substantivos",
  "difficulty": "easy",
  "prompt": "Qual palavra abaixo é um substantivo?",
  "options": [
    { "id": "a", "text": "Bonito" },
    { "id": "b", "text": "Correr" },
    { "id": "c", "text": "Casa" },
    { "id": "d", "text": "Rapidamente" }
  ],
  "answerKey": {
    "correctOptionId": "c"
  },
  "explanation": "Casa é um substantivo porque dá nome a um objeto ou lugar."
}
```

Campos obrigatórios específicos: `options` · `answerKey.correctOptionId`

### 12.2 Verdadeiro ou falso

```json
{
  "id": "q_002",
  "type": "true_false",
  "topicId": "topic_substantivos",
  "difficulty": "easy",
  "prompt": "A palavra 'Brasil' é um substantivo próprio.",
  "answerKey": {
    "correctValue": true
  },
  "explanation": "Brasil é um substantivo próprio porque nomeia um lugar específico."
}
```

Campos obrigatórios específicos: `answerKey.correctValue`

### 12.3 Complete a frase

```json
{
  "id": "q_003",
  "type": "fill_blank",
  "topicId": "topic_substantivos",
  "difficulty": "easy",
  "prompt": "O ________ é a palavra que dá nome aos seres, objetos, lugares e sentimentos.",
  "answerKey": {
    "acceptedAnswers": ["substantivo", "substantivos"],
    "caseSensitive": false,
    "ignoreAccents": true
  },
  "explanation": "Substantivo é a classe de palavras que dá nome aos seres, objetos, lugares, sentimentos e ideias."
}
```

Campos obrigatórios específicos: `answerKey.acceptedAnswers`

### 12.4 Questão aberta curta

```json
{
  "id": "q_004",
  "type": "open_short",
  "topicId": "topic_adjetivos",
  "difficulty": "medium",
  "prompt": "Explique com suas palavras o que é um adjetivo.",
  "answerKey": {
    "idealAnswer": "Adjetivo é a palavra que caracteriza ou dá qualidade a um substantivo."
  },
  "acceptanceCriteria": {
    "minimumScoreToPass": 75,
    "requiredConcepts": [
      "caracteriza um substantivo",
      "indica qualidade ou característica"
    ],
    "forbiddenMisconceptions": [
      "adjetivo é uma ação",
      "adjetivo dá nome às coisas"
    ],
    "allowSimilarAnswers": true
  },
  "explanation": "O adjetivo acompanha o substantivo para indicar uma característica, qualidade, estado ou aspecto."
}
```

Campos obrigatórios específicos: `answerKey.idealAnswer`
Campos recomendados: `acceptanceCriteria.minimumScoreToPass` · `acceptanceCriteria.requiredConcepts`

### 12.5 Resposta numérica simples

```json
{
  "id": "q_005",
  "type": "numeric",
  "topicId": "topic_adicao",
  "difficulty": "easy",
  "prompt": "Quanto é 25 + 17?",
  "answerKey": {
    "correctValue": 42,
    "tolerance": 0,
    "unitRequired": false
  },
  "explanation": "25 + 17 = 42."
}
```

Campos obrigatórios específicos: `answerKey.correctValue`
Campos opcionais úteis: `answerKey.tolerance` · `answerKey.unit` · `answerKey.unitRequired`

### 12.6 Múltipla seleção _(futuro)_

```json
{
  "id": "q_006",
  "type": "multi_select",
  "topicId": "topic_substantivos",
  "difficulty": "medium",
  "prompt": "Marque todas as palavras que são substantivos.",
  "options": [
    { "id": "a", "text": "Mesa" },
    { "id": "b", "text": "Feliz" },
    { "id": "c", "text": "Escola" },
    { "id": "d", "text": "Correr" }
  ],
  "answerKey": {
    "correctOptionIds": ["a", "c"],
    "allowPartialCredit": true
  },
  "explanation": "Mesa e escola são substantivos porque dão nome a coisas/lugares."
}
```

### 12.7 Associação de colunas _(futuro)_

```json
{
  "id": "q_007",
  "type": "matching",
  "topicId": "topic_classes_gramaticais",
  "difficulty": "medium",
  "prompt": "Associe cada palavra à sua classe gramatical.",
  "leftItems": [
    { "id": "l1", "text": "Casa" },
    { "id": "l2", "text": "Bonito" }
  ],
  "rightItems": [
    { "id": "r1", "text": "Substantivo" },
    { "id": "r2", "text": "Adjetivo" }
  ],
  "answerKey": {
    "pairs": [
      { "leftId": "l1", "rightId": "r1" },
      { "leftId": "l2", "rightId": "r2" }
    ]
  },
  "explanation": "Casa é substantivo. Bonito é adjetivo."
}
```

### 12.8 Ordenação _(futuro)_

```json
{
  "id": "q_008",
  "type": "ordering",
  "topicId": "topic_frases",
  "difficulty": "medium",
  "prompt": "Organize as palavras para formar uma frase correta.",
  "items": [
    { "id": "i1", "text": "gosta" },
    { "id": "i2", "text": "Sofia" },
    { "id": "i3", "text": "estudar" },
    { "id": "i4", "text": "de" }
  ],
  "answerKey": {
    "correctOrder": ["i2", "i1", "i4", "i3"]
  },
  "explanation": "A frase correta é: Sofia gosta de estudar."
}
```

---

## 13. Estrutura de gabarito

### 13.1 Gabarito objetivo

```json
"answerKey": { "correctOptionId": "c" }
"answerKey": { "correctValue": true }
"answerKey": { "correctValue": 42, "tolerance": 0 }
```

### 13.2 Gabarito textual

```json
"answerKey": {
  "idealAnswer": "Adjetivo é a palavra que caracteriza ou dá qualidade a um substantivo."
}
```

### 13.3 Explicação obrigatória

Toda questão deve ter uma explicação. Ela é usada para ajudar o aluno a entender a resposta, especialmente após erro ou tentativa incompleta.

---

## 14. Critérios de correção

### 14.1 Critérios simples
Usados em questões objetivas: alternativa correta, valor verdadeiro/falso, resposta exata, valor numérico com tolerância.

### 14.2 Critérios textuais

```json
"acceptanceCriteria": {
  "minimumScoreToPass": 75,
  "requiredConcepts": [
    "caracteriza um substantivo",
    "indica qualidade ou característica"
  ],
  "forbiddenMisconceptions": [
    "adjetivo é uma ação"
  ],
  "allowSimilarAnswers": true
}
```

### 14.3 Critérios recomendados para questões abertas

* pontuação mínima para aprovação;
* conceitos obrigatórios;
* conceitos desejáveis;
* conceitos incorretos proibidos;
* exemplos de respostas aceitáveis, parcialmente corretas e incorretas.

O detalhamento da lógica de correção está em **[05 — Sistema de Correção Inteligente](./05-sistema-de-correcao-inteligente.md)** _(previsto)_.

---

## 15. Feedbacks configuráveis

```json
"feedback": {
  "correct": "Muito bem! Você entendeu o conceito.",
  "incorrect": "Ainda não. Revise o conceito e tente novamente.",
  "incomplete": "Sua resposta está no caminho certo, mas falta explicar um ponto importante.",
  "partiallyCorrect": "Você acertou parte da ideia, mas ainda precisa completar a explicação.",
  "offTopic": "Sua resposta parece falar de outro assunto. Leia o enunciado novamente."
}
```

Se a questão não tiver feedback configurado, o sistema usa mensagens padrão do produto.

---

## 16. Configuração de tentativas

```json
"retryConfig": {
  "maxAttempts": 3,
  "allowRetryBeforeReveal": true,
  "hideCorrectAnswerDuringRetry": true,
  "showHintAfterIncorrect": true
}
```

**Configurações possíveis:** `maxAttempts` · `allowRetryBeforeReveal` · `hideCorrectAnswerDuringRetry` · `showHintAfterIncorrect` · `requireRetryAfterIncorrect` · `reduceScoreAfterRetry`

**Padrão recomendado para o MVP:**

```json
{
  "maxAttempts": 2,
  "allowRetryBeforeReveal": true,
  "hideCorrectAnswerDuringRetry": true,
  "showHintAfterIncorrect": true
}
```

---

## 17. Metadados pedagógicos

```json
"pedagogy": {
  "skill": "Identificar adjetivos em frases simples",
  "learningObjective": "Compreender que adjetivos caracterizam substantivos",
  "bloomLevel": "understand",
  "estimatedTimeSeconds": 60
}
```

**Níveis cognitivos sugeridos:** `remember` · `understand` · `apply` · `analyze` · `evaluate` · `create`

---

## 18. Validação do arquivo

### 18.1 Validações obrigatórias

* JSON é válido;
* existe `studyPackVersion`;
* `metadata` possui campos mínimos;
* há pelo menos um tópico e uma questão;
* cada questão possui `id`, `type`, `topicId`, `prompt`, `answerKey` e `explanation`;
* todos os `topicId` usados em questões existem na lista de tópicos;
* IDs são únicos;
* tipo da questão é suportado;
* gabarito é compatível com o tipo da questão;
* campos obrigatórios por tipo estão presentes.

### 18.2 Níveis de validação

| Nível | Efeito | Exemplo |
|-------|--------|---------|
| `error` | Impede importação | `topicId` inexistente |
| `warning` | Permite importação, exige revisão | Questão aberta sem critérios de aceite |
| `suggestion` | Apenas sugere melhoria | Questão sem dica configurada |

---

## 19. Exemplo completo em JSON

```json
{
  "studyPackVersion": "1.0",
  "metadata": {
    "title": "Revisão de Português - 6º ano",
    "subject": "Português",
    "schoolLevel": "6º ano",
    "description": "Revisão sobre substantivos e adjetivos para prova.",
    "language": "pt-BR",
    "studentAge": 12
  },
  "topics": [
    {
      "id": "topic_substantivos",
      "title": "Substantivos",
      "summary": "Palavras que dão nome a seres, objetos, lugares, sentimentos e ideias.",
      "order": 1
    },
    {
      "id": "topic_adjetivos",
      "title": "Adjetivos",
      "summary": "Palavras que caracterizam ou dão qualidade aos substantivos.",
      "order": 2
    }
  ],
  "questions": [
    {
      "id": "q_001",
      "type": "multiple_choice",
      "topicId": "topic_substantivos",
      "difficulty": "easy",
      "prompt": "Qual palavra abaixo é um substantivo?",
      "options": [
        { "id": "a", "text": "Bonito" },
        { "id": "b", "text": "Correr" },
        { "id": "c", "text": "Casa" },
        { "id": "d", "text": "Rapidamente" }
      ],
      "answerKey": {
        "correctOptionId": "c"
      },
      "explanation": "Casa é um substantivo porque dá nome a um objeto ou lugar.",
      "feedback": {
        "correct": "Muito bem! Você identificou corretamente o substantivo.",
        "incorrect": "Revise o conceito de substantivo e tente novamente."
      }
    },
    {
      "id": "q_002",
      "type": "open_short",
      "topicId": "topic_adjetivos",
      "difficulty": "medium",
      "prompt": "Explique com suas palavras o que é um adjetivo.",
      "answerKey": {
        "idealAnswer": "Adjetivo é a palavra que caracteriza ou dá qualidade a um substantivo."
      },
      "acceptanceCriteria": {
        "minimumScoreToPass": 75,
        "requiredConcepts": [
          "caracteriza um substantivo",
          "indica qualidade ou característica"
        ],
        "forbiddenMisconceptions": [
          "adjetivo é uma ação",
          "adjetivo dá nome às coisas"
        ],
        "allowSimilarAnswers": true
      },
      "explanation": "O adjetivo acompanha o substantivo para indicar uma característica, qualidade, estado ou aspecto.",
      "retryConfig": {
        "maxAttempts": 2,
        "allowRetryBeforeReveal": true,
        "hideCorrectAnswerDuringRetry": true,
        "showHintAfterIncorrect": true
      }
    }
  ],
  "settings": {
    "answerRevealMode": "after_attempt",
    "feedbackTone": "encouraging",
    "defaultRetryConfig": {
      "maxAttempts": 2,
      "allowRetryBeforeReveal": true,
      "hideCorrectAnswerDuringRetry": true,
      "showHintAfterIncorrect": true
    }
  }
}
```

---

## 20. Exemplo simplificado em Markdown

O Markdown pode ser usado como modelo humano ou instrução para outra IA, mesmo que a importação inicial priorize JSON.

```markdown
# Revisão de Português - 6º ano

Matéria: Português
Ano: 6º ano

## Tópicos

### topic_substantivos — Substantivos
Palavras que dão nome a seres, objetos, lugares, sentimentos e ideias.

### topic_adjetivos — Adjetivos
Palavras que caracterizam ou dão qualidade aos substantivos.

## Questões

### q_001
Tipo: multiple_choice
Tópico: topic_substantivos
Dificuldade: easy

Pergunta: Qual palavra abaixo é um substantivo?

A) Bonito
B) Correr
C) Casa
D) Rapidamente

Resposta correta: C
Explicação: Casa é um substantivo porque dá nome a um objeto ou lugar.

### q_002
Tipo: open_short
Tópico: topic_adjetivos
Dificuldade: medium

Pergunta: Explique com suas palavras o que é um adjetivo.

Resposta ideal: Adjetivo é a palavra que caracteriza ou dá qualidade a um substantivo.

Critérios:
- Deve mencionar que caracteriza um substantivo.
- Pode dizer que indica qualidade ou característica.
- Não deve dizer que adjetivo é uma ação.

Explicação: O adjetivo acompanha o substantivo para indicar uma característica, qualidade, estado ou aspecto.
```

---

## 21. Como outra IA deve gerar esse arquivo

### 21.1 Instrução sugerida

```
Crie um arquivo StudyPack JSON válido para a plataforma de estudos. O arquivo deve seguir
exatamente a estrutura abaixo. Use studyPackVersion 1.0. Crie tópicos e questões com IDs únicos.
Cada questão deve ter type, topicId, prompt, answerKey e explanation. Use apenas os tipos de
questão suportados: multiple_choice, true_false, fill_blank, open_short e numeric. Para questões
abertas, inclua idealAnswer e acceptanceCriteria. Não invente conteúdos fora do material fornecido.
```

### 21.2 Regras para IA externa

* gerar JSON válido;
* não usar comentários dentro do JSON;
* não deixar campos obrigatórios vazios;
* criar IDs únicos;
* associar cada questão a um tópico existente;
* respeitar os tipos suportados;
* incluir gabarito;
* incluir explicação;
* incluir critérios para questões abertas;
* manter fidelidade ao conteúdo fornecido.

---

## 22. Arquivo modelo para download

### 22.1 Modelo JSON
Nome sugerido: `studypack-template.json`

Conteúdo: metadata com placeholders · exemplo de tópico · exemplo de cada tipo de questão do MVP · sem comentários no JSON.

### 22.2 Modelo Markdown explicativo
Nome sugerido: `studypack-guide.md`

Conteúdo: explicação do formato · exemplos por tipo · campos obrigatórios · instrução para usar com outra IA · checklist antes de importar.

---

## 23. MVP vs versões futuras

### 23.1 MVP

JSON · metadata básica · tópicos · múltipla escolha · verdadeiro ou falso · complete a frase · questão aberta curta · resposta numérica simples · gabarito · explicação · feedback simples · retryConfig básico · validação de campos obrigatórios.

### 23.2 Futuro

YAML · Markdown importável · múltipla seleção · associação · ordenação · interpretação de texto · imagens · tabelas · áudio · rubricas avançadas · versionamento de questões · banco reutilizável · importação por ZIP · exportação para outros formatos educacionais.

---

## 24. Critérios de aceite

### 24.1 Validação
* O sistema aceita um JSON StudyPack válido.
* O sistema rejeita JSON inválido com mensagem clara.
* O sistema identifica campos obrigatórios ausentes.
* O sistema identifica `topicId` inexistente.
* O sistema identifica IDs duplicados.
* O sistema identifica tipo de questão não suportado.
* O sistema identifica gabarito incompatível com o tipo de questão.

### 24.2 Importação
* O sistema importa tópicos e questões corretamente.
* O sistema associa questões aos tópicos certos.
* O sistema preserva gabaritos e explicações.
* O sistema marca questões com `warning` para revisão quando necessário.

### 24.3 Renderização
* Questões importadas aparecem no componente correto para cada tipo.

### 24.4 Revisão humana
* O adulto consegue revisar o pacote antes de publicar.
* O adulto consegue corrigir campos inválidos ou incompletos.
* O sistema não publica automaticamente conteúdo importado sem oportunidade de revisão.

---

## 25. Questões em aberto

1. O formato inicial deve aceitar apenas JSON ou também Markdown importável?
2. O arquivo deve permitir seções explicativas além de questões já no MVP?
3. O sistema deve aceitar questões sem tópico e criar um tópico automático?
4. O adulto poderá baixar um arquivo StudyPack gerado pelo próprio sistema?
5. Como versionar arquivos criados em versões antigas do padrão?
6. O sistema deve permitir importar múltiplos StudyPacks em um único estudo?
7. O modelo de arquivo deve ser mais técnico ou mais amigável para professores?
8. A validação deve tentar corrigir erros automaticamente ou apenas apontar problemas?
9. O sistema deve aceitar IDs gerados automaticamente quando eles não forem enviados?
10. Como garantir que IAs externas não gerem gabaritos errados ou inventados?
