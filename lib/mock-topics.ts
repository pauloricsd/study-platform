export type SectionType =
  | "explanation"
  | "example"
  | "summary"
  | "note"
  | "common_mistake";

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "fill_blank"
  | "open_short"
  | "numeric"
  | "multiple_select"
  | "open_long"
  | "match_columns"
  | "ordering"
  | "text_interpretation"
  | "explain_required"
  | "text_production";

export interface Section {
  id: string;
  type: SectionType;
  title?: string;
  content: string;
}

export interface Choice {
  id: string;
  label: string;
  text: string;
}

export interface Exercise {
  id: string;
  topicId: string;
  type: QuestionType;
  statement: string;
  choices?: Choice[];
  correctAnswer: string;
  explanation: string;
  order: number;
  // text_interpretation: reading passage shown above the question
  passage?: string;
  // match_columns: left-side items to pair with choices (right side)
  // correctAnswer is JSON: {"0":"b","1":"a",...} — leftItems index → choice id
  leftItems?: string[];
  // retry flow: null/undefined = unlimited attempts
  maxAttempts?: number | null;
  // retry flow: hide "Ver gabarito" while attempts remain
  hideCorrectAnswerDuringRetry?: boolean;
  // AI grading: specific criteria for open-ended questions
  acceptanceCriteria?: string | null;
}

export interface Topic {
  id: string;
  packId: string;
  title: string;
  summary: string;
  order: number;
  sections: Section[];
  exerciseIds: string[];
}

export const mockTopics: Topic[] = [
  {
    id: "t1",
    packId: "p1",
    title: "Substantivos",
    summary: "Palavras que nomeiam seres, objetos, lugares, sentimentos e ideias.",
    order: 1,
    exerciseIds: ["e1", "e2", "e3"],
    sections: [
      {
        id: "s1-1",
        type: "explanation",
        content:
          "O substantivo é a classe de palavras que serve para nomear seres, objetos, lugares, sentimentos, ações e ideias. Em uma frase, o substantivo geralmente funciona como sujeito ou objeto.\n\nOs substantivos podem ser classificados de diversas formas: próprios ou comuns, simples ou compostos, primitivos ou derivados, concretos ou abstratos, coletivos.",
      },
      {
        id: "s1-2",
        type: "example",
        title: "Exemplos práticos",
        content:
          "• **Substantivos comuns:** cachorro, cidade, livro, felicidade\n• **Substantivos próprios:** Brasil, João, São Paulo, Amazônia\n• **Substantivos concretos:** mesa, árvore, sol, pessoa\n• **Substantivos abstratos:** amor, liberdade, coragem, tristeza\n• **Substantivos coletivos:** alcateia (lobos), cardume (peixes), colmeia (abelhas)",
      },
      {
        id: "s1-3",
        type: "note",
        title: "Atenção",
        content:
          "Substantivos próprios são sempre escritos com letra maiúscula. Isso inclui nomes de pessoas, cidades, países, rios, montanhas e datas comemorativas.",
      },
      {
        id: "s1-4",
        type: "common_mistake",
        title: "Erro comum",
        content:
          "Cuidado para não confundir substantivos abstratos com adjetivos. A palavra 'beleza' é um substantivo (nomeia uma qualidade), enquanto 'belo' é um adjetivo (descreve um ser).",
      },
      {
        id: "s1-5",
        type: "summary",
        title: "Resumo",
        content:
          "Substantivo = palavra que **nomeia**. Pode ser próprio ou comum, concreto ou abstrato, simples ou composto, primitivo ou derivado, coletivo. Próprios sempre com letra maiúscula.",
      },
    ],
  },
  {
    id: "t2",
    packId: "p1",
    title: "Adjetivos",
    summary: "Palavras que caracterizam ou qualificam os substantivos.",
    order: 2,
    exerciseIds: ["e4", "e5"],
    sections: [
      {
        id: "s2-1",
        type: "explanation",
        content:
          "O adjetivo é a classe de palavras que caracteriza, qualifica ou determina os substantivos, concordando com eles em gênero e número. O adjetivo pode indicar estado, qualidade, origem, aspecto ou aparência do ser.\n\nOs adjetivos flexionam em gênero (masculino/feminino) e número (singular/plural), sempre concordando com o substantivo a que se referem.",
      },
      {
        id: "s2-2",
        type: "example",
        title: "Exemplos",
        content:
          "• O menino **alto** jogou bem. (qualidade)\n• A menina **brasileira** ganhou a medalha. (origem)\n• O dia estava **nublado**. (estado)\n• Ela tem olhos **verdes**. (aparência)\n\nPerceba que 'alto' se refere a 'menino' (masculino singular), enquanto 'brasileira' concorda com 'menina' (feminino singular).",
      },
      {
        id: "s2-3",
        type: "note",
        title: "Locução adjetiva",
        content:
          "Quando dois ou mais vocábulos equivalem a um adjetivo, temos uma locução adjetiva. Exemplo: 'de ouro' equivale a 'dourado'; 'de pedra' equivale a 'pétreo'.",
      },
      {
        id: "s2-4",
        type: "summary",
        title: "Resumo",
        content:
          "Adjetivo = palavra que **qualifica ou caracteriza** o substantivo. Concorda em gênero e número. Pode ser simples, composto, primitivo ou derivado.",
      },
    ],
  },
  {
    id: "t3",
    packId: "p1",
    title: "Verbos",
    summary: "Palavras que expressam ação, estado ou fenômeno da natureza.",
    order: 3,
    exerciseIds: ["e6", "e7", "e8"],
    sections: [
      {
        id: "s3-1",
        type: "explanation",
        content:
          "O verbo é a classe de palavras que indica ação, estado, mudança de estado ou fenômeno da natureza. Os verbos se flexionam em pessoa, número, tempo, modo e voz.\n\n**Tipos de verbos:**\n- **Transitivos diretos:** exigem complemento sem preposição (Eu comprei **um livro**.)\n- **Transitivos indiretos:** exigem complemento com preposição (Eu gosto **de música**.)\n- **Intransitivos:** não exigem complemento (O pássaro voou.)\n- **De ligação:** ligam sujeito a predicativo (Ela **está** cansada.)",
      },
      {
        id: "s3-2",
        type: "example",
        title: "Conjugação no presente",
        content:
          "Verbo **FALAR** no presente do indicativo:\n• Eu falo\n• Tu falas\n• Ele/ela fala\n• Nós falamos\n• Vós falais\n• Eles/elas falam\n\nLembre-se: a desinência (terminação) varia de acordo com a pessoa e o número.",
      },
      {
        id: "s3-3",
        type: "common_mistake",
        title: "Erro comum",
        content:
          "Não confunda o verbo 'ter' com o verbo 'haver' em contextos de existência. O correto é 'Havia muitas pessoas' e não 'Tinham muitas pessoas', pois 'haver' no sentido de existir é impessoal e não tem plural.",
      },
      {
        id: "s3-4",
        type: "summary",
        title: "Resumo",
        content:
          "Verbo = palavra que indica **ação, estado ou fenômeno**. Flexiona em pessoa, número, tempo e modo. Pode ser transitivo (direto/indireto), intransitivo ou de ligação.",
      },
    ],
  },
  {
    id: "t4",
    packId: "p1",
    title: "Pronomes",
    summary: "Palavras que substituem ou acompanham os substantivos.",
    order: 4,
    exerciseIds: ["e9", "e10"],
    sections: [
      {
        id: "s4-1",
        type: "explanation",
        content:
          "O pronome é a palavra que substitui ou acompanha o substantivo, referindo-se às pessoas do discurso ou a elementos já mencionados no texto.\n\n**Classificação dos pronomes:**\n- **Pessoais:** eu, tu, ele, nós, vós, eles\n- **Possessivos:** meu, teu, seu, nosso, vosso\n- **Demonstrativos:** este, esse, aquele, isto, isso, aquilo\n- **Relativos:** que, o qual, cujo, onde\n- **Indefinidos:** alguém, ninguém, tudo, nada, cada\n- **Interrogativos:** quem, que, qual, quanto",
      },
      {
        id: "s4-2",
        type: "example",
        title: "Exemplos",
        content:
          "• **Pessoal:** **Eu** estudei muito.\n• **Possessivo:** O **meu** caderno está na mesa.\n• **Demonstrativo:** **Esse** livro é interessante.\n• **Relativo:** O aluno **que** estudou passou.\n• **Indefinido:** **Ninguém** sabia a resposta.",
      },
      {
        id: "s4-3",
        type: "note",
        title: "Este x Esse x Aquele",
        content:
          "**Este** refere-se a algo próximo de quem fala. **Esse** refere-se a algo próximo de quem ouve. **Aquele** refere-se a algo distante de ambos.\n\nNo texto escrito: **este** = mencionado agora ou adiante; **esse** = mencionado antes.",
      },
    ],
  },
  {
    id: "t5",
    packId: "p1",
    title: "Advérbios",
    summary: "Palavras que modificam verbos, adjetivos ou outros advérbios.",
    order: 5,
    exerciseIds: ["e11", "e12"],
    sections: [
      {
        id: "s5-1",
        type: "explanation",
        content:
          "O advérbio é a palavra invariável que modifica um verbo, um adjetivo ou outro advérbio, indicando circunstâncias como tempo, lugar, modo, intensidade, negação, dúvida, entre outros.\n\nAl contrário dos adjetivos, os advérbios não concordam com o substantivo — eles são **invariáveis**.",
      },
      {
        id: "s5-2",
        type: "example",
        title: "Tipos de advérbio",
        content:
          "• **Modo:** bem, mal, rapidamente, devagar\n• **Tempo:** hoje, ontem, sempre, nunca, já\n• **Lugar:** aqui, lá, perto, longe, dentro\n• **Intensidade:** muito, pouco, bastante, demais\n• **Negação:** não, nunca, jamais\n• **Dúvida:** talvez, provavelmente, quiçá",
      },
      {
        id: "s5-3",
        type: "summary",
        title: "Resumo",
        content:
          "Advérbio = palavra **invariável** que modifica verbo, adjetivo ou outro advérbio. Indica circunstâncias (tempo, lugar, modo, intensidade, etc.). Não concorda com nada.",
      },
    ],
  },
];

export const mockExercises: Exercise[] = [
  {
    id: "e1",
    topicId: "t1",
    type: "multiple_choice",
    order: 1,
    statement: "Qual das alternativas abaixo contém apenas substantivos abstratos?",
    choices: [
      { id: "a", label: "A", text: "Mesa, cadeira, janela" },
      { id: "b", label: "B", text: "Amor, liberdade, coragem" },
      { id: "c", label: "C", text: "Brasil, Rio de Janeiro, Amazônia" },
      { id: "d", label: "D", text: "Cachorro, gato, pássaro" },
    ],
    correctAnswer: "b",
    explanation:
      "Substantivos abstratos nomeiam sentimentos, ações, qualidades ou estados que não têm existência própria sem um ser. Amor, liberdade e coragem são qualidades/sentimentos, portanto abstratos.",
  },
  {
    id: "e2",
    topicId: "t1",
    type: "true_false",
    order: 2,
    statement: "Os substantivos próprios devem sempre ser escritos com letra minúscula.",
    correctAnswer: "false",
    explanation:
      "Falso. Substantivos próprios — nomes de pessoas, cidades, países, rios — são sempre escritos com letra maiúscula. Exemplos: Brasil, Maria, Amazonas.",
  },
  {
    id: "e3",
    topicId: "t1",
    type: "fill_blank",
    order: 3,
    statement: "A palavra que nomeia um conjunto de peixes é chamada de substantivo _______ . O exemplo correto para esse grupo é a palavra 'cardume'.",
    correctAnswer: "coletivo",
    explanation:
      "Substantivo coletivo é aquele que, no singular, denomina um conjunto de seres da mesma espécie. 'Cardume' é o coletivo de peixes.",
  },
  {
    id: "e4",
    topicId: "t2",
    type: "multiple_choice",
    order: 1,
    statement: "Identifique o adjetivo na frase: 'A professora inteligente resolveu o problema difícil.'",
    choices: [
      { id: "a", label: "A", text: "professora" },
      { id: "b", label: "B", text: "resolveu" },
      { id: "c", label: "C", text: "inteligente e difícil" },
      { id: "d", label: "D", text: "problema" },
    ],
    correctAnswer: "c",
    explanation:
      "'Inteligente' qualifica 'professora' e 'difícil' qualifica 'problema'. Ambas são adjetivos pois caracterizam substantivos.",
  },
  {
    id: "e5",
    topicId: "t2",
    type: "true_false",
    order: 2,
    statement: "Os adjetivos concordam em gênero e número com o substantivo que qualificam.",
    correctAnswer: "true",
    explanation:
      "Verdadeiro. O adjetivo sempre concorda com o substantivo. Ex.: 'aluno inteligente' → 'aluna inteligente'; 'alunos inteligentes'.",
  },
  {
    id: "e6",
    topicId: "t3",
    type: "multiple_choice",
    order: 1,
    statement: "Na frase 'Ela comprou um livro', o verbo 'comprou' é classificado como:",
    choices: [
      { id: "a", label: "A", text: "Intransitivo" },
      { id: "b", label: "B", text: "Transitivo direto" },
      { id: "c", label: "C", text: "Transitivo indireto" },
      { id: "d", label: "D", text: "De ligação" },
    ],
    correctAnswer: "b",
    explanation:
      "'Comprou' é transitivo direto pois exige um complemento sem preposição: 'comprou **um livro**'. O objeto direto 'um livro' responde à pergunta 'comprou o quê?'.",
  },
  {
    id: "e7",
    topicId: "t3",
    type: "true_false",
    order: 2,
    statement: "O verbo 'haver', no sentido de existir, deve ser conjugado no plural quando o sujeito for plural.",
    correctAnswer: "false",
    explanation:
      "Falso. O verbo 'haver' no sentido de existir é impessoal — não tem sujeito e fica sempre no singular. Correto: 'Havia muitas pessoas', não 'haviam'.",
  },
  {
    id: "e8",
    topicId: "t3",
    type: "open_short",
    order: 3,
    statement: "Explique com suas palavras a diferença entre verbos transitivos e intransitivos.",
    correctAnswer: "Verbos transitivos precisam de complemento para completar seu sentido (objeto direto ou indireto), enquanto verbos intransitivos têm sentido completo por si mesmos, sem precisar de complemento.",
    explanation:
      "Ex. transitivo: 'Eu vi **o filme**' — sem 'o filme', a frase fica incompleta. Ex. intransitivo: 'O pássaro voou' — sentido completo sem complemento.",
  },
  {
    id: "e9",
    topicId: "t4",
    type: "multiple_choice",
    order: 1,
    statement: "Em 'Este caderno é meu', os pronomes em destaque são, respectivamente:",
    choices: [
      { id: "a", label: "A", text: "Demonstrativo e indefinido" },
      { id: "b", label: "B", text: "Demonstrativo e possessivo" },
      { id: "c", label: "C", text: "Pessoal e possessivo" },
      { id: "d", label: "D", text: "Relativo e demonstrativo" },
    ],
    correctAnswer: "b",
    explanation:
      "'Este' é pronome demonstrativo (indica algo próximo de quem fala) e 'meu' é pronome possessivo (indica posse da primeira pessoa do singular).",
  },
  {
    id: "e10",
    topicId: "t4",
    type: "fill_blank",
    order: 2,
    statement: "Complete: '_______ aluno que estudou passou na prova.' Use o pronome relativo correto.",
    correctAnswer: "O",
    explanation:
      "O pronome relativo 'que' retoma o antecedente 'aluno', mas antes dele precisamos do artigo 'O' para completar a frase: 'O aluno que estudou passou'.",
  },
  {
    id: "e11",
    topicId: "t5",
    type: "multiple_choice",
    order: 1,
    statement: "Qual é a função do advérbio 'rapidamente' na frase 'Ele correu rapidamente'?",
    choices: [
      { id: "a", label: "A", text: "Qualifica o sujeito 'ele'" },
      { id: "b", label: "B", text: "Modifica o verbo 'correu', indicando modo" },
      { id: "c", label: "C", text: "Substitui o substantivo" },
      { id: "d", label: "D", text: "Indica o tempo da ação" },
    ],
    correctAnswer: "b",
    explanation:
      "'Rapidamente' é um advérbio de modo que modifica o verbo 'correu', indicando como a ação foi realizada.",
  },
  {
    id: "e12",
    topicId: "t5",
    type: "true_false",
    order: 2,
    statement: "Os advérbios concordam em gênero e número com o substantivo mais próximo.",
    correctAnswer: "false",
    explanation:
      "Falso. Os advérbios são palavras invariáveis — não se flexionam em gênero nem em número. Diferente dos adjetivos, que concordam com o substantivo.",
  },
];

export const sectionTypeConfig: Record<
  SectionType,
  { label: string; color: string; bg: string; border: string }
> = {
  explanation: {
    label: "Explicação",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  example: {
    label: "Exemplo",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  summary: {
    label: "Resumo",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  note: {
    label: "Atenção",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  common_mistake: {
    label: "Erro comum",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

export const questionTypeConfig: Record<QuestionType, { label: string; color: string }> = {
  multiple_choice:    { label: "Múltipla escolha",        color: "text-blue-600" },
  true_false:         { label: "Verdadeiro ou falso",      color: "text-violet-600" },
  fill_blank:         { label: "Complete a frase",         color: "text-emerald-600" },
  open_short:         { label: "Resposta aberta",          color: "text-amber-600" },
  numeric:            { label: "Numérica",                 color: "text-pink-600" },
  multiple_select:    { label: "Múltipla seleção",         color: "text-cyan-600" },
  open_long:          { label: "Dissertativa",             color: "text-orange-600" },
  match_columns:      { label: "Associação de colunas",    color: "text-indigo-600" },
  ordering:           { label: "Ordenação",                color: "text-teal-600" },
  text_interpretation:{ label: "Interpretação de texto",  color: "text-rose-600" },
  explain_required:   { label: "Com explicação",           color: "text-lime-700" },
  text_production:    { label: "Produção textual",         color: "text-fuchsia-600" },
};
