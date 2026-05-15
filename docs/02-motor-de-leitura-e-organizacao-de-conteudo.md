# 02 — Motor de Leitura e Organização de Conteúdo

## 1. Objetivo do módulo

O Motor de Leitura e Organização de Conteúdo é o módulo responsável por transformar materiais escolares brutos em uma estrutura de estudo clara, organizada e revisável.

Seu objetivo é permitir que pais, responsáveis ou professores enviem um material, como um PDF de revisão, apostila, lista de conteúdos ou resumo, e o sistema consiga interpretar esse conteúdo para gerar uma experiência de estudo visual e didática para o aluno.

Este módulo não deve apenas extrair texto. Ele precisa compreender minimamente a estrutura do material, identificar tópicos, separar explicações, exemplos e possíveis exercícios, e apresentar tudo de forma organizada para revisão humana antes da publicação.

---

## 2. Papel do motor dentro do produto

Dentro da plataforma, este motor atua como a primeira camada de inteligência após o upload de conteúdo. Ele conecta a entrada bruta enviada pelo adulto à experiência final de estudo do aluno.

**Fluxo conceitual:**

```
Material enviado → Extração → Organização → Revisão humana → Publicação para o aluno
```

O motor deve alimentar outros módulos do produto, especialmente:

* Experiência dos pais e professores;
* Experiência do aluno;
* Motor de Exercícios e Questionários;
* StudyPack Format;
* Sistema de Correção Inteligente;
* Relatórios e acompanhamento.

---

## 3. Tipos de entrada suportados

### 3.1 Entrada principal no MVP

No MVP, a entrada principal deve ser:

* **PDF textual.**

Esse PDF pode conter:

* conteúdo teórico;
* resumos;
* tópicos de prova;
* listas de exercícios;
* páginas de apostila;
* orientações enviadas pela escola;
* material compilado pelos pais ou professores.

### 3.2 Entradas recomendadas para fases futuras

* Texto colado manualmente;
* Imagens de páginas;
* PDFs escaneados;
* Arquivos Markdown;
* Arquivos DOCX;
* Arquivos StudyPack;
* Slides;
* Planilhas simples de questões;
* Áudios transcritos;
* Links para conteúdos autorizados.

### 3.3 Restrições iniciais recomendadas

Para reduzir complexidade no MVP, recomenda-se limitar:

* tamanho máximo do PDF;
* quantidade máxima de páginas;
* formatos aceitos;
* quantidade de arquivos por pacote de estudo;
* PDFs escaneados sem texto selecionável.

PDFs escaneados devem ser tratados inicialmente como uma limitação conhecida ou enviados para uma fila futura de OCR.

---

## 4. Fluxo geral de processamento

1. Upload do material;
2. Validação do arquivo;
3. Extração de conteúdo;
4. Limpeza e normalização do texto;
5. Segmentação em blocos;
6. Identificação de tópicos;
7. Organização em seções de estudo;
8. Geração de explicações didáticas;
9. Identificação de exemplos, regras e pontos importantes;
10. Detecção preliminar de exercícios;
11. Geração de prévia para revisão;
12. Revisão manual pelo adulto;
13. Publicação do estudo.

O processamento deve sempre gerar uma versão revisável, evitando publicar automaticamente conteúdo sensível ou potencialmente incorreto sem validação humana.

---

## 5. Etapa 1 — Upload do material

### 5.1 Objetivo

Permitir que o adulto envie um material de estudo para ser processado.

### 5.2 Comportamento esperado

A interface deve permitir:

* selecionar ou arrastar um arquivo;
* visualizar nome, tamanho e tipo do arquivo;
* confirmar envio;
* ver progresso de upload;
* receber feedback em caso de erro.

### 5.3 Validações iniciais

O sistema deve validar:

* formato do arquivo;
* tamanho máximo;
* se o arquivo está vazio;
* se o PDF possui texto extraível;
* se o arquivo parece corrompido;
* se o usuário tem permissão para criar o estudo.

### 5.4 Estados possíveis

* Aguardando arquivo;
* Upload em andamento;
* Upload concluído;
* Arquivo inválido;
* Erro no upload;
* Pronto para processamento.

---

## 6. Etapa 2 — Extração de conteúdo

### 6.1 Objetivo

Extrair o conteúdo textual do material enviado.

### 6.2 MVP

No MVP, o sistema deve priorizar PDFs textuais. A extração deve capturar:

* texto principal;
* títulos aparentes;
* listas;
* quebras de página;
* possíveis numerações;
* trechos que pareçam enunciados;
* trechos que pareçam exemplos.

### 6.3 Futuro

* OCR para PDFs escaneados;
* análise de imagens;
* identificação de tabelas;
* leitura de gráficos;
* preservação de layout;
* identificação de colunas;
* detecção de cabeçalhos e rodapés.

### 6.4 Saída esperada

```json
{
  "fileId": "file_001",
  "pages": [
    {
      "pageNumber": 1,
      "rawText": "Conteúdo extraído da página..."
    }
  ]
}
```

---

## 7. Etapa 3 — Limpeza e normalização do texto

### 7.1 Objetivo

Melhorar a qualidade do texto extraído antes de enviá-lo para a IA ou organizá-lo em tópicos.

### 7.2 Ações esperadas

* remover cabeçalhos repetidos;
* remover rodapés repetidos;
* corrigir quebras excessivas de linha;
* juntar frases quebradas indevidamente;
* preservar listas importantes;
* preservar numeração de exercícios;
* remover ruído visual;
* identificar páginas com baixa qualidade textual.

### 7.3 Cuidados importantes

A limpeza não deve apagar informações relevantes. Em caso de dúvida, o sistema deve preservar o texto e sinalizar baixa confiança.

### 7.4 Saída esperada

```json
{
  "blocks": [
    {
      "id": "block_001",
      "pageStart": 1,
      "pageEnd": 1,
      "text": "Substantivos são palavras que dão nome...",
      "quality": "high"
    }
  ]
}
```

---

## 8. Etapa 4 — Identificação de tópicos

### 8.1 Objetivo

Detectar os principais assuntos presentes no material.

### 8.2 Exemplos de tópicos

Em um material de português: Substantivos, Adjetivos, Pontuação, Pronomes indefinidos, Sinônimos, Interpretação de texto.

Em um material de matemática: Números inteiros, Números racionais, Adição e subtração, Divisão, Potenciação, Radiciação, Problemas contextualizados.

### 8.3 Estratégias de identificação

* títulos explícitos;
* frequência de termos;
* estrutura do documento;
* páginas indicadas;
* listas de conteúdos;
* enunciados de exercícios;
* classificação semântica por IA.

### 8.4 Cada tópico deve conter

* ID único;
* Título;
* Resumo curto;
* Matéria relacionada;
* Páginas de origem;
* Blocos de conteúdo relacionados;
* Confiança da detecção;
* Ordem sugerida;
* Indicação se precisa de revisão humana.

### 8.5 Exemplo conceitual

```json
{
  "topicId": "substantivos",
  "title": "Substantivos",
  "summary": "Palavras que dão nome a seres, objetos, lugares, sentimentos e ideias.",
  "sourcePages": [3, 4, 5],
  "confidence": 0.91,
  "needsReview": false
}
```

---

## 9. Etapa 5 — Organização em seções de estudo

### 9.1 Objetivo

Transformar os tópicos detectados em uma estrutura navegável e compreensível para o aluno.

### 9.2 Estrutura recomendada de uma seção

* Título do tópico;
* Explicação principal;
* Exemplos;
* Regras importantes;
* Erros comuns;
* Mini resumo;
* Exercícios relacionados;
* Checklist de revisão.

### 9.3 Exemplo de estrutura visual

```
Tópico: Adjetivos

1. O que é?
2. Exemplos
3. Como identificar
4. Erros comuns
5. Resumo rápido
6. Exercícios
```

### 9.4 Regras de organização

* evitar seções longas demais;
* dividir tópicos complexos em partes menores;
* manter linguagem compatível com idade/série;
* priorizar clareza;
* preservar relação com o material original;
* permitir edição manual pelo adulto.

---

## 10. Etapa 6 — Geração de explicações didáticas

### 10.1 Objetivo

Transformar o conteúdo original em explicações mais claras e adequadas para estudo.

### 10.2 Tipos de explicação

* explicação simples;
* explicação detalhada;
* exemplo prático;
* analogia;
* resumo curto;
* lista de pontos importantes;
* alerta de erro comum.

### 10.3 Regras de qualidade

* usar linguagem clara;
* evitar excesso de formalidade;
* não inventar conteúdo não suportado pelo material;
* indicar baixa confiança quando o material estiver ambíguo;
* manter relação com o conteúdo enviado;
* ser revisáveis pelo adulto.

### 10.4 Exemplo

**Entrada original:**
```
Adjetivo é toda palavra que caracteriza o substantivo, indicando-lhe qualidade, estado, modo de ser ou aspecto.
```

**Saída didática:**
```
Adjetivo é a palavra que mostra uma característica de um substantivo. Ele ajuda a explicar como uma pessoa, objeto, lugar ou sentimento é.

Exemplo: em "casa bonita", a palavra "bonita" é um adjetivo, porque mostra uma característica da casa.
```

---

## 11. Etapa 7 — Identificação de exemplos, regras e pontos importantes

### 11.1 Objetivo

Separar partes do conteúdo que podem ser transformadas em componentes visuais específicos.

### 11.2 Elementos que o sistema deve tentar identificar

* Definições;
* Regras;
* Fórmulas;
* Exemplos;
* Exceções;
* Erros comuns;
* Dicas;
* Tabelas simples;
* Listas importantes;
* Vocabulário;
* Termos-chave.

### 11.3 Mapeamento para componentes

```
Definição      → ConceptExplanation
Exemplo        → ExampleBlock
Regra          → ImportantNote
Erro comum     → CommonMistake
Resumo         → SummaryCard
Lista revisão  → RevisionChecklist
```

---

## 12. Etapa 8 — Detecção preliminar de exercícios no material

### 12.1 Objetivo

Identificar se o PDF contém exercícios que podem ser transformados em questões interativas.

### 12.2 Importante

A detecção de exercícios neste módulo deve ser **preliminar**. O detalhamento dos tipos de questão, renderização, gabarito e correção pertence ao documento **03 — Motor de Exercícios e Questionários**.

### 12.3 O que este módulo pode detectar

* Enunciados numerados;
* Alternativas A/B/C/D;
* Comandos como "marque", "complete", "responda", "calcule", "associe";
* Lacunas;
* Questões abertas;
* Questões de verdadeiro ou falso;
* Problemas matemáticos;
* Possíveis gabaritos.

### 12.4 Saída esperada

```json
{
  "candidateQuestions": [
    {
      "sourceBlockId": "block_014",
      "detectedType": "multiple_choice",
      "confidence": 0.82,
      "needsReview": true
    }
  ]
}
```

---

## 13. Etapa 9 — Revisão manual pelo adulto

### 13.1 Objetivo

Permitir que pais, responsáveis ou professores revisem tudo antes de publicar para o aluno.

### 13.2 O adulto deve poder revisar

* Tópicos detectados;
* Ordem dos tópicos;
* Títulos;
* Explicações;
* Exemplos;
* Resumos;
* Exercícios detectados;
* Gabaritos;
* Nível de dificuldade;
* Linguagem utilizada;
* Conteúdos com baixa confiança.

### 13.3 Ações disponíveis

* editar texto;
* excluir seção;
* dividir tópico;
* unir tópicos;
* reorganizar ordem;
* adicionar novo tópico;
* aprovar tópico;
* marcar como "precisa revisar depois";
* publicar.

### 13.4 Regra importante

A plataforma deve evitar que conteúdo gerado automaticamente seja publicado sem que o adulto tenha pelo menos a oportunidade clara de revisar.

---

## 14. Estados do processamento

```
idle
uploading
uploaded
extracting_text
cleaning_content
identifying_topics
generating_study_sections
detecting_exercises
ready_for_review
approved
published
failed
```

### 14.1 Estados visíveis para o adulto

* Aguardando arquivo;
* Enviando material;
* Lendo conteúdo;
* Organizando tópicos;
* Criando seções de estudo;
* Procurando exercícios;
* Pronto para revisar;
* Publicado;
* Algo deu errado.

### 14.2 Feedback visual

* progresso geral;
* etapa atual;
* mensagens claras;
* aviso em caso de demora;
* erro recuperável quando possível;
* opção de tentar novamente.

---

## 15. Casos de erro e limitações

### 15.1 Possíveis erros

* Arquivo inválido;
* Arquivo muito grande;
* PDF protegido;
* PDF corrompido;
* PDF escaneado sem texto;
* Texto extraído com baixa qualidade;
* Conteúdo insuficiente;
* Falha na IA;
* Tópicos ambíguos;
* Exercícios sem gabarito;
* Tempo de processamento excedido.

### 15.2 Comportamento recomendado

O sistema deve explicar o problema em linguagem simples e oferecer próximo passo.

```
Não conseguimos ler o texto deste PDF. Ele pode estar escaneado como imagem.
Tente enviar outro arquivo ou copiar o texto manualmente.
```

```
Encontramos o conteúdo, mas alguns tópicos parecem ambíguos. Revise antes de publicar para o aluno.
```

```
Identificamos exercícios, mas não encontramos o gabarito. Você pode adicionar as respostas manualmente.
```

---

## 16. Regras de qualidade do conteúdo gerado

### 16.1 Clareza
O aluno deve conseguir entender o conteúdo sem depender do PDF original o tempo todo.

### 16.2 Fidelidade ao material
O sistema não deve inventar conceitos ou adicionar explicações que não estejam apoiadas no material, exceto quando isso for claramente marcado como sugestão complementar.

### 16.3 Adequação à idade
A linguagem deve ser ajustada ao nível escolar informado.

### 16.4 Revisabilidade
Tudo que for gerado deve poder ser editado pelo adulto.

### 16.5 Rastreabilidade
Sempre que possível, o sistema deve manter referência ao trecho ou página de origem.

### 16.6 Baixa confiança
Quando o sistema não tiver certeza, deve indicar isso claramente.

---

## 17. Estrutura de dados sugerida

### 17.1 StudyContent

```json
{
  "id": "content_001",
  "studyPackId": "study_001",
  "sourceFileId": "file_001",
  "status": "ready_for_review",
  "createdAt": "2026-05-13T10:00:00Z"
}
```

### 17.2 SourceFile

```json
{
  "id": "file_001",
  "fileName": "prova-portugues.pdf",
  "fileType": "application/pdf",
  "fileSize": 1024000,
  "pageCount": 12,
  "extractionStatus": "completed"
}
```

### 17.3 ContentBlock

```json
{
  "id": "block_001",
  "sourceFileId": "file_001",
  "pageStart": 1,
  "pageEnd": 2,
  "text": "Substantivos são palavras que dão nome...",
  "blockType": "definition",
  "quality": "high"
}
```

### 17.4 Topic

```json
{
  "id": "topic_001",
  "title": "Substantivos",
  "summary": "Palavras que dão nome a seres, objetos, lugares, sentimentos e ideias.",
  "sourcePages": [1, 2],
  "confidence": 0.91,
  "order": 1,
  "needsReview": false
}
```

### 17.5 StudySection

```json
{
  "id": "section_001",
  "topicId": "topic_001",
  "title": "O que são substantivos?",
  "contentType": "concept_explanation",
  "body": "Substantivos são palavras que dão nome...",
  "sourceBlockIds": ["block_001"],
  "order": 1
}
```

---

## 18. Interface esperada para pais/professores

### 18.1 Tela de upload
Deve permitir que o adulto envie o material e entenda quais formatos são aceitos.

### 18.2 Tela de processamento
Deve mostrar o andamento do processamento em linguagem simples.

```
Estamos lendo o material...
Agora estamos organizando os tópicos...
Encontramos 5 assuntos principais para revisar.
```

### 18.3 Tela de revisão de tópicos
Elementos possíveis:

* Lista de tópicos;
* Cards por tópico;
* Indicador de confiança;
* Referência de páginas;
* Botões para editar, dividir, unir ou excluir.

### 18.4 Tela de revisão de conteúdo
Deve permitir editar explicações, exemplos e resumos.

### 18.5 Tela de exercícios detectados
Deve mostrar exercícios encontrados no material e indicar se precisam de revisão.

### 18.6 Tela de publicação
Deve mostrar um resumo do pacote antes de publicar:

* quantidade de tópicos;
* quantidade de exercícios;
* tópicos com baixa confiança;
* exercícios sem gabarito;
* status geral de revisão.

---

## 19. MVP vs versões futuras

### 19.1 MVP

* Upload de um PDF textual;
* Extração básica de texto;
* Limpeza simples;
* Identificação de tópicos principais;
* Organização em seções de estudo;
* Geração de explicações simples;
* Detecção preliminar de exercícios;
* Revisão manual pelo adulto;
* Publicação do estudo.

### 19.2 Futuro

* OCR;
* múltiplos arquivos por estudo;
* comparação entre diferentes materiais;
* identificação de imagens e gráficos;
* suporte a DOCX;
* suporte a slides;
* geração automática de mapas mentais;
* extração de fórmulas;
* identificação de habilidades pedagógicas;
* integração com currículos escolares;
* recomendação automática de exercícios adicionais.

---

## 20. Critérios de aceite

### 20.1 Upload
* O usuário consegue enviar um PDF válido.
* O sistema rejeita arquivos inválidos com mensagem clara.
* O sistema mostra progresso ou estado de processamento.

### 20.2 Extração
* O sistema extrai texto de PDFs textuais.
* O sistema identifica quando o PDF não possui texto extraível.
* O sistema informa quando a qualidade da extração é baixa.

### 20.3 Organização
* O sistema sugere tópicos principais a partir do conteúdo.
* Cada tópico possui título e resumo.
* O adulto consegue editar, excluir e reorganizar tópicos.

### 20.4 Geração de conteúdo
* O sistema gera explicações didáticas por tópico.
* O conteúdo gerado é editável.
* O sistema mantém referência ao material original quando possível.

### 20.5 Revisão humana
* O adulto consegue revisar o material antes de publicar.
* O sistema sinaliza tópicos ou conteúdos com baixa confiança.
* O sistema não força publicação automática sem revisão.

### 20.6 Publicação
* O estudo só pode ser publicado quando houver uma estrutura mínima válida.
* O adulto vê um resumo antes de publicar.
* O aluno acessa apenas a versão publicada.

---

## 21. Questões em aberto

1. Qual será o limite máximo de páginas por PDF no MVP?
2. O produto deve aceitar mais de um PDF por pacote de estudo já no MVP?
3. PDFs escaneados devem ser bloqueados no início ou processados com OCR básico?
4. O adulto poderá colar texto manualmente se o PDF falhar?
5. O sistema deve gerar explicações automaticamente ou apenas organizar o conteúdo original?
6. O adulto precisa aprovar cada tópico individualmente ou apenas o pacote inteiro?
7. A IA poderá sugerir tópicos complementares não presentes no material?
8. O aluno terá acesso ao PDF original ou apenas ao conteúdo organizado?
9. O sistema deve mostrar a página de origem de cada explicação?
10. Como indicar visualmente baixa confiança sem assustar o usuário adulto?
