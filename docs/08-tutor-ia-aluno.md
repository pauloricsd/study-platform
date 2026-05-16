# 08 — Tutor IA do Aluno: Dúvidas, Apoio e Segurança Pedagógica

## 1. Objetivo da funcionalidade

O Tutor IA do Aluno é uma funcionalidade conversacional da plataforma que permite que o aluno tire dúvidas, peça explicações, receba apoio durante o estudo e obtenha orientação durante exercícios sem receber respostas prontas indevidamente.

A funcionalidade deve atuar como um tutor pedagógico seguro, confiável e contextual, ajudando o aluno a compreender o conteúdo e desenvolver raciocínio próprio.

O objetivo não é substituir o professor, o responsável ou o estudo ativo, mas oferecer uma camada de apoio inteligente para que o aluno consiga avançar quando tiver dúvidas.

---

## 2. Papel do Tutor IA dentro da plataforma

O Tutor IA deve atuar como um assistente educacional integrado ao pacote de estudo.

Ele deve considerar:

- o conteúdo do StudyPack;
- o tópico que o aluno está estudando;
- o tipo de questão em andamento;
- a resposta atual do aluno;
- tentativas anteriores;
- feedbacks já exibidos;
- idade/série do aluno;
- regras de segurança pedagógica;
- restrições de não entregar resposta direta durante exercícios.

**Fluxo conceitual:**

```
Contexto do aluno → Pergunta do aluno → Verificação de segurança → Resposta orientadora → Apoio ao aprendizado
```

---

## 3. Contextos de uso

O Tutor IA deve atuar em dois contextos principais.

### 3.1 Modo 1 — Durante o estudo do conteúdo

Quando o aluno está lendo uma explicação, resumo, exemplo ou card de estudo, ele pode conversar com a IA para entender melhor o conteúdo.

### 3.2 Modo 2 — Durante exercícios

Quando o aluno está respondendo questões, a IA pode ajudar, mas não pode entregar a resposta direta.

Ela deve orientar o raciocínio, explicar conceitos relacionados, fazer perguntas de apoio e ajudar o aluno a aprender com seus erros.

---

## 4. Modo 1 — Tutor IA durante o estudo do conteúdo

### 4.1 Objetivo

Ajudar o aluno a compreender melhor o conteúdo que está estudando.

### 4.2 A IA pode ajudar com

- explicar com palavras mais simples;
- dar outro exemplo;
- criar uma analogia;
- explicar uma palavra difícil;
- resumir o tópico;
- mostrar passo a passo de um conceito;
- relacionar o conceito com algo do cotidiano;
- sugerir o que revisar antes dos exercícios;
- indicar conteúdo complementar seguro, quando permitido.

### 4.3 Exemplos de perguntas do aluno

```
Não entendi o que é adjetivo.
```

```
Pode explicar de um jeito mais fácil?
```

```
Me dá outro exemplo?
```

```
Qual a diferença entre substantivo e adjetivo?
```

```
Tem algum vídeo ou site confiável para eu estudar mais?
```

### 4.4 Comportamento esperado

A IA deve responder de forma:

- clara;
- curta quando possível;
- adequada à idade/série;
- fiel ao conteúdo do estudo;
- encorajadora;
- sem inventar informações;
- com possibilidade de aprofundar se o aluno pedir.

---

## 5. Modo 2 — Tutor IA durante exercícios

### 5.1 Objetivo

Ajudar o aluno a raciocinar e avançar sem entregar a resposta correta diretamente.

### 5.2 A IA pode ajudar com

- explicar o enunciado;
- lembrar o conceito relacionado;
- dar uma dica;
- fazer uma pergunta orientadora;
- indicar uma etapa de raciocínio;
- apontar onde o aluno pode revisar;
- analisar a tentativa errada do aluno;
- explicar por que uma resposta parece incompleta;
- ajudar o aluno a entender o tipo de resposta esperada.

### 5.3 A IA não pode

- dar a alternativa correta;
- escrever a resposta ideal completa;
- resolver a conta inteira e entregar o resultado final;
- dizer "marque a letra C";
- revelar o gabarito antes da hora;
- confirmar diretamente se uma resposta está correta antes do fluxo de verificação;
- burlar a configuração de tentativa da questão;
- contradizer o feedback oficial do sistema.

### 5.4 Exemplo de resposta permitida

Aluno pergunta:

```
Qual é a resposta?
```

Resposta esperada da IA:

```
Não posso te dar a resposta direta, mas posso te ajudar a pensar. A pergunta está pedindo para identificar uma palavra que dá nome a uma coisa, pessoa, lugar ou sentimento. Olhe as alternativas e tente encontrar qual delas tem essa função.
```

### 5.5 Exemplo de resposta proibida

```
A resposta é C, casa.
```

---

## 6. Diferença entre ajudar e entregar resposta

### 6.1 Ajudar é permitido

Ajudar significa orientar o aluno para que ele consiga pensar por conta própria.

Exemplos:

- explicar o conceito necessário;
- reformular o enunciado;
- dar uma pista;
- fazer uma pergunta;
- lembrar uma regra;
- sugerir revisar um card específico.

### 6.2 Entregar resposta é proibido durante exercícios

Entregar resposta significa fornecer diretamente o resultado que o aluno deveria produzir.

Exemplos proibidos:

- indicar alternativa correta;
- escrever a resposta final;
- resolver todo o cálculo;
- completar a lacuna;
- montar a associação correta;
- ordenar todos os itens corretamente.

### 6.3 Regra principal

> Durante exercícios, a IA deve responder como um tutor, não como um resolvedor de tarefas.

---

## 7. Regras de segurança e confiabilidade

### 7.1 Requisito máximo

O requisito máximo desta funcionalidade é **segurança e confiabilidade da informação**.

A IA não deve alucinar, inventar fatos, criar conceitos inexistentes, indicar fontes falsas ou ensinar conteúdo incorreto.

### 7.2 Prioridade das fontes

A IA deve usar fontes em ordem de prioridade:

1. Conteúdo do StudyPack aprovado pelo adulto/professor;
2. Explicações, gabaritos e critérios já existentes no pacote;
3. Histórico da questão e tentativas do aluno;
4. Fontes externas confiáveis, apenas quando necessário e permitido;
5. Conhecimento geral do modelo somente quando for seguro e não contradisser o material.

### 7.3 Quando houver conflito

Se houver conflito entre uma fonte externa e o material do estudo, a IA deve:

- não contradizer diretamente o material sem sinalizar;
- dizer que encontrou uma diferença;
- sugerir que o aluno confirme com o professor/responsável;
- evitar apresentar uma resposta incerta como verdade.

---

## 8. Uso de fontes externas e conteúdos da web

### 8.1 Objetivo

Permitir que a IA sugira conteúdos complementares seguros quando o aluno quiser aprofundar.

### 8.2 Fontes preferenciais

Quando o sistema permitir busca ou sugestão externa, priorizar:

- sites educacionais reconhecidos;
- instituições públicas de educação;
- universidades;
- museus e instituições científicas;
- órgãos oficiais;
- materiais didáticos de fontes confiáveis;
- canais educacionais validados previamente pela plataforma.

### 8.3 Fontes a evitar

Evitar:

- fóruns sem curadoria;
- respostas anônimas;
- sites com baixa credibilidade;
- conteúdos sensacionalistas;
- vídeos sem autoria clara;
- páginas com muitos anúncios enganosos;
- conteúdos que não indiquem fonte ou autor.

### 8.4 Regra de sugestão

A IA não deve inventar links ou afirmar que uma fonte existe se não tiver verificação.

Se não houver ferramenta de busca ativa, a IA deve dizer:

```
Posso sugerir o tipo de fonte que você deve procurar, mas não consigo garantir um link específico agora.
```

### 8.5 Recomendações para MVP

No MVP, recomenda-se limitar a sugestão de web a uma biblioteca de fontes previamente aprovadas ou desativar links externos até que exista validação suficiente.

---

## 9. Regras anti-alucinação

### 9.1 A IA deve

- responder com base no conteúdo disponível;
- admitir quando não souber;
- pedir para consultar o professor/responsável quando houver dúvida;
- evitar criar informações novas sem base;
- separar explicação confirmada de sugestão complementar;
- usar linguagem de incerteza quando necessário;
- não inventar fontes;
- não inventar páginas do PDF;
- não inventar gabaritos;
- não inventar regras gramaticais, fórmulas ou datas.

### 9.2 A IA não deve

- fingir certeza;
- responder além do material quando o tema exigir precisão;
- criar citações falsas;
- criar links falsos;
- dizer que viu algo no PDF sem referência;
- contradizer o gabarito aprovado sem sinalizar;
- corrigir o professor sem evidência.

### 9.3 Resposta segura quando não houver certeza

```
Não tenho informação suficiente no material para responder com segurança. O melhor é confirmar com seu professor ou responsável. Posso te ajudar a revisar o que aparece no conteúdo enviado.
```

---

## 10. Comportamento quando a IA não tiver certeza

### 10.1 Estados de confiança

A IA deve operar com níveis internos de confiança:

```
high_confidence
medium_confidence
low_confidence
insufficient_information
```

### 10.2 Quando a confiança for baixa

A IA deve:

- evitar resposta definitiva;
- explicar a limitação;
- sugerir revisar o material;
- pedir mais contexto;
- sugerir confirmar com adulto/professor.

### 10.3 Exemplo

```
Eu não encontrei essa informação no conteúdo deste estudo. Posso explicar o conceito de forma geral, mas talvez seja melhor confirmar com seu professor se isso vai cair na prova.
```

---

## 11. Como a IA deve usar o conteúdo do StudyPack

### 11.1 Contexto disponível

Ao responder, a IA deve receber ou recuperar:

- título do estudo;
- matéria;
- ano/série;
- tópico atual;
- explicação do tópico;
- exemplos;
- erros comuns;
- resumo;
- questão atual, se houver;
- gabarito, quando permitido internamente;
- critérios de correção;
- tentativas do aluno.

### 11.2 Regra de base

A resposta deve ser ancorada no StudyPack sempre que possível.

### 11.3 Exemplo

Se o aluno perguntar sobre adjetivos enquanto está no tópico "Adjetivos", a IA deve responder usando a explicação e exemplos daquele tópico antes de recorrer a conhecimento externo.

---

## 12. Como a IA deve usar o histórico da questão e das tentativas

### 12.1 Durante exercícios

A IA pode usar:

- enunciado da questão;
- tópico relacionado;
- tipo da questão;
- resposta atual do aluno;
- tentativas anteriores;
- feedback anterior;
- critérios de correção;
- status da tentativa.

### 12.2 Para que usar

Esse histórico deve servir para:

- apontar onde o aluno está errando;
- dar uma dica mais precisa;
- evitar repetir feedback genérico;
- orientar nova tentativa;
- sugerir revisão do tópico.

### 12.3 Limite

Mesmo tendo acesso ao gabarito internamente, a IA não deve revelá-lo durante exercícios se a configuração da questão não permitir.

---

## 13. Feedback baseado no erro do aluno

### 13.1 Objetivo

Quando o aluno já tentou responder e errou, a IA pode ajudar a entender o erro.

### 13.2 A IA pode dizer

- qual conceito parece ter sido confundido;
- qual parte da resposta ficou incompleta;
- que tipo de informação faltou;
- qual card revisar;
- qual pergunta o aluno deve se fazer antes de tentar novamente.

### 13.3 A IA não deve dizer

- a resposta correta completa;
- a alternativa correta;
- a frase final que o aluno deve copiar;
- o resultado final do cálculo;
- o gabarito oficial, se ainda não foi liberado.

### 13.4 Exemplo

Aluno respondeu:

```
Adjetivo é o nome das coisas.
```

IA pode responder:

```
Parece que você misturou adjetivo com substantivo. Substantivo dá nome às coisas. Adjetivo tem outra função: ele mostra uma característica de algo. Tente responder novamente pensando nisso.
```

---

## 14. Tipos de respostas permitidas durante exercícios

### 14.1 Explicação do conceito

```
Para resolver, lembre que substantivos dão nome a coisas, pessoas, lugares, sentimentos ou ideias.
```

### 14.2 Reformulação do enunciado

```
A questão quer saber qual palavra funciona como nome de algo.
```

### 14.3 Pergunta orientadora

```
Qual das opções parece nomear uma coisa, em vez de indicar ação ou característica?
```

### 14.4 Dica gradual

```
Elimine primeiro as palavras que indicam ação ou modo.
```

### 14.5 Feedback sobre erro

```
Você escolheu uma palavra que indica ação. Tente procurar uma palavra que dê nome a algo.
```

### 14.6 Indicação de revisão

```
Volte ao exemplo do tópico "Substantivos" e observe como a palavra nomeia algo.
```

---

## 15. Tipos de respostas proibidas durante exercícios

### 15.1 Resposta direta

```
A resposta é C.
```

### 15.2 Gabarito completo

```
A resposta correta é "Casa", porque é um substantivo.
```

### 15.3 Resolução completa de cálculo

```
25 + 17 = 42, então responda 42.
```

### 15.4 Frase pronta para copiar

```
Escreva: "Adjetivo é a palavra que caracteriza um substantivo."
```

### 15.5 Confirmação indevida

```
Sim, sua resposta está certa.
```

> Antes do fluxo oficial de verificação, a IA deve evitar confirmar diretamente se a resposta está correta.

---

## 16. Exemplos de conversa

### 16.1 Durante estudo

**Aluno:**
```
Não entendi o que é substantivo.
```

**Tutor IA:**
```
Substantivo é a palavra que dá nome às coisas. Pode ser nome de pessoa, lugar, objeto, sentimento ou ideia.

Exemplos: Sofia, escola, mesa, alegria e coragem.

Uma dica: quando a palavra responde "o que é isso?" ou "quem é?", muitas vezes ela é um substantivo.
```

### 16.2 Durante exercício — pedido de resposta direta

**Aluno:**
```
Qual alternativa eu marco?
```

**Tutor IA:**
```
Não posso marcar por você, mas posso te ajudar a pensar. Procure a alternativa que dá nome a alguma coisa. Elimine as palavras que indicam ação, característica ou modo.
```

### 16.3 Durante exercício — resposta errada anterior

**Aluno:**
```
Eu marquei "correr" e errei. Por quê?
```

**Tutor IA:**
```
"Correr" indica uma ação, por isso é verbo. A questão queria uma palavra que desse nome a algo. Tente procurar uma palavra que seja nome de objeto, lugar, pessoa, sentimento ou ideia.
```

### 16.4 Quando não houver informação suficiente

**Aluno:**
```
Isso também cai na prova?
```

**Tutor IA:**
```
Não tenho como confirmar isso com segurança apenas pelo material disponível. Posso te mostrar o que aparece neste estudo, mas vale confirmar com seu professor ou responsável.
```

---

## 17. Estados da funcionalidade

### 17.1 Estados principais

```
available
loading
answering
blocked_direct_answer
low_confidence
needs_more_context
web_suggestion_available
web_suggestion_disabled
error
```

### 17.2 Tradução para interface

- Disponível
- Carregando
- Respondendo
- Resposta direta bloqueada
- Baixa confiança
- Precisa de mais contexto
- Sugestão externa disponível
- Sugestão externa desativada
- Erro

---

## 18. Interface esperada

### 18.1 Durante estudo

O Tutor IA pode aparecer como:

- botão "Tirar dúvida";
- drawer lateral;
- chat contextual;
- botão fixo discreto;
- prompt sugerido no final de uma explicação.

**Sugestões de entrada:**

```
Explique de outro jeito
Me dê outro exemplo
O que significa essa palavra?
Como eu sei identificar isso?
```

### 18.2 Durante exercícios

O Tutor IA deve aparecer com restrições visíveis.

**Exemplo de aviso:**

```
Posso te ajudar a pensar, mas não vou te dar a resposta direta.
```

**Sugestões de entrada:**

```
Me dê uma dica
Explique o enunciado
Qual conceito eu preciso lembrar?
Onde minha resposta está incompleta?
```

### 18.3 Após erro

A interface pode sugerir:

```
Quer pedir uma dica sobre o que você errou?
```

Ou:

```
Peça ajuda para entender este erro antes de tentar novamente.
```

---

## 19. Regras de moderação e proteção infantil

### 19.1 Objetivo

Como a funcionalidade será usada por crianças e adolescentes, ela deve seguir regras rígidas de proteção.

### 19.2 A IA deve evitar

- conversas não relacionadas ao estudo;
- pedidos de dados pessoais;
- coleta de informações sensíveis;
- exposição de conteúdo inadequado;
- links inseguros;
- linguagem ofensiva;
- temas adultos;
- aconselhamento médico, legal ou psicológico como autoridade;
- incentivo a trapaça;
- respostas que substituam o adulto em situações sensíveis.

### 19.3 Quando redirecionar

Se o aluno perguntar algo fora do contexto escolar ou sensível, a IA deve redirecionar de forma segura.

**Exemplo:**

```
Eu estou aqui para te ajudar com seus estudos. Para esse assunto, é melhor conversar com um adulto de confiança.
```

### 19.4 Dados pessoais

A IA não deve pedir:

- endereço;
- telefone;
- escola completa sem necessidade;
- documentos;
- senhas;
- informações familiares sensíveis;
- fotos pessoais.

---

## 20. Estrutura de dados sugerida

### 20.1 TutorSession

```json
{
  "id": "tutor_session_001",
  "studentId": "student_001",
  "studyPackId": "study_001",
  "topicId": "topic_adjetivos",
  "questionId": null,
  "mode": "study",
  "createdAt": "2026-05-13T10:00:00Z"
}
```

### 20.2 TutorMessage

```json
{
  "id": "msg_001",
  "sessionId": "tutor_session_001",
  "role": "student",
  "content": "Pode explicar adjetivo de outro jeito?",
  "createdAt": "2026-05-13T10:01:00Z"
}
```

### 20.3 TutorResponseMetadata

```json
{
  "messageId": "msg_002",
  "mode": "exercise",
  "confidence": "high_confidence",
  "usedStudyPackContext": true,
  "usedWebSource": false,
  "directAnswerBlocked": true,
  "answerRevealAllowed": false
}
```

### 20.4 TutorSafetyEvent

```json
{
  "id": "safety_001",
  "sessionId": "tutor_session_001",
  "type": "direct_answer_requested",
  "action": "blocked_and_redirected",
  "createdAt": "2026-05-13T10:02:00Z"
}
```

---

## 21. Prompt/spec para pedir a outra IA implementar a funcionalidade

### 21.1 Briefing de implementação

```
Construa uma funcionalidade chamada Tutor IA do Aluno para uma plataforma educacional de estudos assistidos por IA.

A funcionalidade deve permitir que o aluno converse com uma IA em dois contextos:

1. Durante o estudo do conteúdo: a IA pode explicar conceitos, simplificar linguagem, dar exemplos, resumir, tirar dúvidas e sugerir conteúdos complementares seguros quando permitido.

2. Durante exercícios: a IA pode ajudar o aluno a entender o enunciado, lembrar conceitos, dar dicas graduais, fazer perguntas orientadoras e analisar erros anteriores. Porém, nesse modo, a IA nunca pode entregar a resposta direta, indicar alternativa correta, escrever a resposta ideal completa, resolver o cálculo até o resultado final ou burlar o fluxo de verificação da questão.

Requisito máximo: segurança e confiabilidade da informação. A IA deve priorizar o conteúdo do StudyPack aprovado pelo adulto/professor, depois gabaritos e critérios existentes, depois histórico da questão/tentativas, e só usar web/fontes externas se houver fontes confiáveis e verificação. A IA não pode inventar informações, links, fontes, páginas do PDF, gabaritos, regras ou conceitos.

Se a IA não tiver informação suficiente, deve admitir incerteza e orientar o aluno a confirmar com professor/responsável.

Durante exercícios, a IA deve operar em modo tutor, não resolvedor. Deve ajudar a pensar, mas não entregar o resultado.

Implemente estados de segurança como:
- directAnswerBlocked
- lowConfidence
- insufficientInformation
- answerRevealAllowed
- usedStudyPackContext
- usedWebSource

A interface deve ter um chat contextual acessível durante estudo e exercícios. Durante exercícios, mostrar aviso: "Posso te ajudar a pensar, mas não vou te dar a resposta direta."

Também registre sessões, mensagens e eventos de segurança para auditoria e melhoria futura.
```

### 21.2 Requisitos funcionais para implementação

- Abrir chat contextual por tópico;
- Abrir chat contextual por questão;
- Diferenciar modo `study` e modo `exercise`;
- Enviar contexto do StudyPack para a IA;
- Enviar contexto da questão e tentativas quando estiver em exercício;
- Bloquear pedidos de resposta direta;
- Gerar dicas graduais;
- Gerar feedback sobre erro do aluno;
- Retornar estado de confiança;
- Registrar mensagens;
- Registrar eventos de segurança;
- Permitir desativar sugestões externas no MVP.

### 21.3 Requisitos não funcionais

- Priorizar segurança;
- Evitar alucinação;
- Responder com baixa latência quando possível;
- Manter linguagem adequada à idade;
- Proteger dados de crianças/adolescentes;
- Evitar links externos não verificados;
- Permitir auditoria futura das interações.

---

## 22. MVP vs versões futuras

### 22.1 MVP

No MVP, o Tutor IA deve incluir:

- chat contextual durante estudo;
- chat contextual durante exercício;
- modo `study`;
- modo `exercise`;
- bloqueio de resposta direta durante exercício;
- respostas baseadas no StudyPack;
- dicas simples;
- explicações alternativas;
- feedback baseado em erro do aluno;
- estado de baixa confiança;
- sem links externos livres ou com links externos muito limitados.

### 22.2 Fora do MVP

Devem ficar fora do MVP inicial:

- navegação livre na web;
- recomendações abertas de vídeos;
- chat sem contexto educacional;
- memória ampla entre diferentes estudos;
- personalização profunda por perfil cognitivo;
- voz;
- análise emocional;
- tutoria adaptativa complexa.

### 22.3 Futuro

Futuras versões podem incluir:

- biblioteca curada de fontes externas;
- recomendações de vídeos educativos aprovados;
- leitura em voz alta;
- modo Socrático configurável;
- adaptação por idade;
- adaptação por dificuldade recorrente;
- revisão espaçada sugerida pelo tutor;
- relatórios para pais/professores sobre dúvidas frequentes;
- avaliação da qualidade das respostas do tutor.

---

## 23. Critérios de aceite

### 23.1 Modo estudo

- O aluno consegue abrir o Tutor IA em um tópico de estudo.
- A IA responde com base no conteúdo do StudyPack.
- A IA consegue explicar o conteúdo de forma mais simples.
- A IA consegue dar exemplos adicionais sem contradizer o material.
- A IA indica incerteza quando não houver informação suficiente.

### 23.2 Modo exercício

- O aluno consegue abrir o Tutor IA durante uma questão.
- A IA reconhece que está em modo exercício.
- A IA não entrega a resposta direta.
- A IA bloqueia pedidos como "qual é a resposta?".
- A IA oferece dica ou pergunta orientadora.
- A IA consegue analisar uma tentativa errada sem revelar o gabarito indevidamente.

### 23.3 Segurança e confiabilidade

- A IA não inventa fontes ou links.
- A IA não afirma como certeza o que não está no material ou em fonte confiável.
- A IA sinaliza baixa confiança quando necessário.
- A IA orienta confirmar com professor/responsável quando apropriado.
- A IA não contradiz o gabarito aprovado sem sinalizar incerteza.

### 23.4 Proteção infantil

- A IA evita conversas inadequadas ou fora do contexto escolar.
- A IA não solicita dados pessoais sensíveis.
- A IA redireciona temas sensíveis para adulto de confiança.
- A IA mantém linguagem adequada à idade.

### 23.5 Registro e auditoria

- O sistema registra sessões de tutor.
- O sistema registra mensagens.
- O sistema registra eventos de bloqueio de resposta direta.
- O sistema registra quando a resposta foi dada com baixa confiança.

---

## 24. Questões em aberto

1. O Tutor IA deve estar disponível para todos os alunos ou pode ser desativado por adulto/professor?
2. Pais/professores poderão ver o histórico das conversas do aluno com a IA?
3. O aluno poderá apagar conversas?
4. Sugestões externas da web devem existir no MVP ou apenas em fase futura?
5. Quais fontes externas serão aprovadas inicialmente?
6. A IA deve usar apenas o StudyPack ou também conhecimento geral seguro?
7. Durante exercícios, a IA pode dizer se a resposta do aluno está "no caminho certo" antes da verificação oficial?
8. Como lidar com aluno insistindo para obter resposta direta?
9. O sistema deve limitar quantidade de mensagens por exercício?
10. O Tutor IA deve ter tom mais amigável, neutro ou professoral?

---

_Documento criado em: 2026-05-16_
_Status: Especificação aprovada — aguardando priorização para implementação_
