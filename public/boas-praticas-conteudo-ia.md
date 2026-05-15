# Guia de Boas Práticas para Criação de Conteúdo com IA

**Para uso interno — orientações para construir documentos que gerem pacotes de estudo otimizados na plataforma Sia**

---

## O que este guia faz

A plataforma Sia processa um PDF fornecido pelo professor e usa IA (GPT-4o) para transformá-lo automaticamente em:

- **Tópicos de estudo** com seções de conteúdo estruturadas
- **Exercícios** com gabarito e explicação

A qualidade do material gerado depende diretamente da qualidade do documento enviado. Este guia descreve como estruturar o PDF para que a IA produza o melhor resultado possível.

---

## Tipos de Seção de Conteúdo

Cada tópico gerado pode conter seções de 5 tipos diferentes. Ao criar o documento, inclua elementos que correspondam a cada um deles:

### 1. `explanation` — Explicação teórica
Conteúdo principal do tópico: definições, conceitos, regras, teorias.

**O que incluir no documento:**
- Definições claras e diretas
- Regras gramaticais, matemáticas ou científicas
- Conceitos explicados com linguagem adequada à série
- Subtítulos que identifiquem cada conceito distinto

**Exemplo no documento:**
```
Substantivo é a palavra que nomeia seres, objetos, lugares, sentimentos
e ideias. Ex.: "casa", "alegria", "Brasil".
```

---

### 2. `example` — Exemplo prático
Aplicação do conceito em situações reais ou exercícios resolvidos.

**O que incluir no documento:**
- Exemplos resolvidos passo a passo
- Frases ou situações que ilustrem a regra
- Casos variados (simples → complexo)
- Cálculos desenvolvidos com cada etapa explicada

**Exemplo no documento:**
```
Exemplo: "O cachorro late." — "cachorro" é substantivo comum concreto.
Exemplo resolvido: 2x + 4 = 10 → 2x = 6 → x = 3
```

---

### 3. `note` — Dica / informação complementar
Informações adicionais, exceções, macetes ou curiosidades relevantes.

**O que incluir no documento:**
- Exceções às regras
- Macetes para memorização
- Observações importantes que completam a teoria
- Informações de contexto histórico ou científico

**Exemplo no documento:**
```
Atenção: palavras terminadas em -ção são sempre substantivos femininos.
Dica: para lembrar os planetas, use a frase mnemônica...
```

---

### 4. `common_mistake` — Erro comum
Equívocos frequentes que estudantes cometem sobre o tema.

**O que incluir no documento:**
- Confusões típicas ("sempre vs. às vezes")
- Exemplos de respostas erradas e por que estão erradas
- Comparações entre conceitos parecidos mas diferentes

**Exemplo no documento:**
```
Erro frequente: confundir "há" (verbo haver) com "a" (preposição).
"Faz dois anos" ≠ "Há dois anos" — o uso correto depende do contexto.
```

---

### 5. `summary` — Resumo
Síntese do que foi aprendido no tópico.

**O que incluir no documento:**
- Lista dos pontos principais
- Tabelas comparativas
- Mapa mental ou esquema textual
- "Lembre-se de..." com os conceitos-chave

**Exemplo no documento:**
```
Resumo:
- Substantivos nomeiam seres e objetos
- Podem ser: próprios/comuns, concretos/abstratos, simples/compostos
- Sempre têm gênero (masculino/feminino) e número (singular/plural)
```

---

## Tipos de Exercício

A IA gera exercícios de 5 tipos. Para cada tipo, o documento deve oferecer material suficiente para que a IA construa questões relevantes:

### 1. `multiple_choice` — Múltipla escolha
4 alternativas (A, B, C, D), apenas uma correta.

**Gabarito:** letra da alternativa correta (ex.: `"B"`)

**Para gerar boas questões, o documento deve ter:**
- Conceitos com distinções claras entre certo e errado
- Situações com variações que possam ser usadas como distratores
- Aplicações práticas do conteúdo

**Exemplo de questão gerada:**
```
Qual das alternativas é um substantivo abstrato?
A) Mesa  B) Alegria  C) Rio  D) Cachorro
Gabarito: B
```

---

### 2. `true_false` — Verdadeiro ou falso
Afirmação para julgar como verdadeira ou falsa.

**Gabarito:** `"true"` ou `"false"`

**Para gerar boas questões:**
- Inclua regras com exceções (geram afirmações falsas interessantes)
- Apresente variações sutis do mesmo conceito
- Evite afirmações óbvias demais

**Exemplo de questão gerada:**
```
"Todo substantivo próprio deve ser escrito com letra maiúscula."
Gabarito: true
```

---

### 3. `fill_blank` — Complete a lacuna
Frase com uma palavra ou expressão para ser preenchida.

**Gabarito:** palavra ou expressão esperada

**Para gerar boas questões:**
- Inclua frases-modelo com termos técnicos centrais
- Apresente definições com o conceito-chave que pode ser removido
- Equações ou fórmulas com variáveis isoláveis

**Exemplo de questão gerada:**
```
"A palavra que nomeia um ser ou objeto é chamada de ________."
Gabarito: substantivo
```

---

### 4. `open_short` — Resposta curta aberta
Pergunta que exige uma resposta dissertativa breve (1–3 frases).

**Gabarito:** resposta esperada descrita de forma objetiva

**Para gerar boas questões:**
- Inclua questões "por que" e "como" no documento
- Apresente situações-problema que exijam interpretação
- Traga conexões entre conceitos que exijam síntese

**Exemplo de questão gerada:**
```
"Por que usamos letra maiúscula nos substantivos próprios?"
Gabarito: Para distingui-los dos substantivos comuns e indicar que se
referem a seres ou lugares específicos e únicos.
```

---

### 5. `numeric` — Resposta numérica
Pergunta com resposta que é um número exato (resultado de cálculo, medida, quantidade).

**Gabarito:** valor numérico como string — ex: `"42"`, `"3.14"`, `"150"`

**Para gerar boas questões:**
- Inclua operações matemáticas com resultado único e determinado
- Apresente problemas contextualizados com dados numéricos claros
- Inclua fórmulas e suas aplicações
- Traga conversões de unidades com passo a passo

**Adequado para:** Matemática, Ciências, Física, Química, Geografia (dados numéricos)

**Não adequado para:** questões com resposta aproximada, questões com múltiplas soluções ou respostas textuais

**Exemplo de questão gerada:**
```
"Quanto é 25 + 17?"
Gabarito: 42

"Uma sala tem 8 metros de comprimento e 5 metros de largura.
Qual é a sua área em m²?"
Gabarito: 40
```

---

### 6. `multiple_select` — Múltipla seleção

O aluno deve marcar **todas** as alternativas corretas (pode ser mais de uma).

**Gabarito:** ids corretos separados por vírgula — ex: `"a,c"`

**Para gerar boas questões:**
- Inclua listas de características onde mais de uma é verdadeira
- Apresente conjuntos de exemplos onde vários pertencem à mesma categoria
- Evite casos onde apenas uma opção é correta (use `multiple_choice` nesses casos)

**Exemplo de questão gerada:**
```
Quais das palavras abaixo são substantivos?
A) Casa  B) Correr  C) Alegria  D) Bonito
Gabarito: a,c
```

---

### 7. `open_long` — Dissertativa

Questão que exige uma resposta mais elaborada, com argumentação ou desenvolvimento.

**Gabarito:** gabarito resumido ou critérios de avaliação

**Para gerar boas questões:**
- Inclua questões "explique", "desenvolva", "argumente"
- Apresente situações que exigem análise ou síntese
- Traga conexões entre múltiplos conceitos

**Exemplo de questão gerada:**
```
Explique a diferença entre substantivo concreto e abstrato, dando exemplos de cada um.
Gabarito: Substantivos concretos nomeiam seres com existência real e perceptível...
```

---

### 8. `match_columns` — Associação de colunas

O aluno associa cada item da coluna esquerda com o correspondente da coluna direita.

**Gabarito:** JSON mapeando índice da coluna esquerda → id da opção direita  
Ex: `{"0":"b","1":"a","2":"c"}`

**Para gerar boas questões:**
- Inclua tabelas de classificação (tipo de palavra → exemplo)
- Apresente pares conceito/definição
- Use listas de causa/efeito ou processo/resultado

**Exemplo de questão gerada:**
```
Coluna A: 1. Substantivo  2. Adjetivo  3. Verbo
Coluna B: a) Correr  b) Bonito  c) Casa
Gabarito: {"0":"c","1":"b","2":"a"}
```

---

### 9. `ordering` — Ordenação

O aluno reorganiza os itens em uma sequência correta.

**Gabarito:** ids dos itens na ordem correta separados por vírgula — ex: `"c,a,d,b"`

**Para gerar boas questões:**
- Inclua sequências de etapas (processo, linha do tempo, passos de cálculo)
- Apresente textos desmontados para recompor
- Traga ordem crescente/decrescente de valores ou datas

**Exemplo de questão gerada:**
```
Coloque os planetas em ordem de distância do Sol:
a) Marte  b) Vênus  c) Mercúrio  d) Terra
Gabarito: c,b,d,a
```

---

### 10. `text_interpretation` — Interpretação de texto

O aluno lê um trecho e responde uma pergunta sobre ele.

**Campo `passage`:** texto de leitura (parágrafo ou trecho curto)  
**Gabarito:** resposta ideal descrita de forma objetiva

**Para gerar boas questões:**
- Inclua trechos de texto com conceitos importantes
- Apresente exemplos de interpretação com perguntas sobre o sentido
- Traga parágrafos que permitam inferência ou análise

**Exemplo de questão gerada:**
```
Texto: "O substantivo é a classe gramatical que dá nome aos seres..."
Pergunta: Qual é a função do substantivo segundo o texto?
Gabarito: Dar nome aos seres.
```

---

### 11. `explain_required` — Com explicação obrigatória

O aluno fornece uma resposta **e** obrigatoriamente justifica seu raciocínio.

**Gabarito:** `"resposta|||raciocínio esperado"` (separado por `|||`)

**Para gerar boas questões:**
- Inclua questões de matemática onde o processo importa tanto quanto o resultado
- Apresente perguntas de ciências onde a justificativa revela compreensão
- Use questões de gramática onde o aluno deve explicar a regra aplicada

**Exemplo de questão gerada:**
```
Qual é o valor de x em: 2x + 4 = 10? Explique como chegou à resposta.
Gabarito: 3|||Isolei o x subtraindo 4 dos dois lados e depois dividindo por 2
```

---

### 12. `text_production` — Produção textual

O aluno produz um texto mais longo (redação, parágrafo, descrição).

**Gabarito:** rubrica ou critérios de avaliação

**Para gerar boas questões:**
- Inclua propostas de redação com tema, gênero e condições de produção claras
- Apresente situações comunicativas reais (carta, e-mail, notícia)
- Traga critérios explícitos que o texto deve atender

**Adequado para:** Língua Portuguesa, Redação, Inglês, Ciências (relatórios)

**Exemplo de questão gerada:**
```
Escreva um parágrafo explicando o que é fotossíntese para um colega que faltou à aula.
Gabarito: O texto deve mencionar: luz solar, CO₂, água, clorofila e produção de glicose.
```

---

## Estrutura Recomendada do Documento PDF

Para que a IA identifique tópicos e seções automaticamente, organize o PDF assim:

```
[TÍTULO DO TÓPICO 1]

Definição / conceito principal...

Exemplos:
- Exemplo 1...
- Exemplo 2...

Atenção / Dica:
Observação importante...

Erro comum:
Descrição do equívoco frequente...

Resumo:
- Ponto 1
- Ponto 2

Exercícios sugeridos:
1. [questão de múltipla escolha]
2. [questão verdadeiro/falso]
...

---

[TÍTULO DO TÓPICO 2]
...
```

---

## Checklist de Qualidade

Antes de fazer o upload, verifique:

- [ ] O documento é um PDF textual (não escaneado/imagem)
- [ ] Cada tópico tem pelo menos uma definição clara
- [ ] Há exemplos práticos para os conceitos principais
- [ ] Existem pelo menos 2–3 conceitos distintos por tópico
- [ ] O texto está em português correto e adequado à série alvo
- [ ] Não há imagens essenciais ao entendimento (a IA processa apenas texto)
- [ ] O arquivo tem no máximo 20 MB
- [ ] O conteúdo não excede 40.000 caracteres (limite de processamento)

---

## Parâmetros do Sistema

| Configuração | Valor |
|---|---|
| Modelo de IA | GPT-4o |
| Tópicos gerados | 3 a 6 por upload |
| Limite de texto processado | ~40.000 caracteres |
| Temperatura (criatividade) | 0.4 (respostas consistentes) |
| Formato de saída | JSON estruturado (Structured Outputs) |

---

## Dicas Avançadas para Melhor Resultado

1. **Separe bem os tópicos** — Use títulos em destaque entre cada tema. A IA usa esses marcadores para segmentar o conteúdo.

2. **Inclua exercícios no próprio documento** — Mesmo que a IA crie novos, ter questões no material ajuda o modelo a calibrar o nível de dificuldade correto.

3. **Use linguagem direta** — Frases longas e complexas reduzem a qualidade das seções geradas. Prefira parágrafos curtos.

4. **Evite tabelas e gráficos** — A extração de texto de PDFs não captura formatação visual. Represente tabelas em formato textual quando possível.

5. **Quantidade ideal** — Documentos entre 5 e 25 páginas geram entre 3 e 6 tópicos bem definidos. Documentos muito curtos geram poucos tópicos; muito longos são truncados.

6. **Um assunto por upload** — Prefira um PDF por matéria/bimestre em vez de misturar assuntos não relacionados no mesmo documento.
