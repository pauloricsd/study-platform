import OpenAI from "openai";

export interface GeneratedSection {
  type: "explanation" | "example" | "note" | "common_mistake" | "summary";
  title?: string;
  content: string;
}

export interface GeneratedExercise {
  type:
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
  statement: string;
  choices?: { id: string; label: string; text: string }[] | null;
  correctAnswer: string;
  explanation: string;
  passage?: string | null;
  leftItems?: string[] | null;
}

export interface GeneratedTopic {
  title: string;
  summary: string;
  sections: GeneratedSection[];
  exercises: GeneratedExercise[];
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    topics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["explanation", "example", "note", "common_mistake", "summary"],
                },
                title: { type: ["string", "null"] },
                content: { type: "string" },
              },
              required: ["type", "title", "content"],
              additionalProperties: false,
            },
          },
          exercises: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: [
                    "multiple_choice", "true_false", "fill_blank", "open_short", "numeric",
                    "multiple_select", "open_long", "match_columns", "ordering",
                    "text_interpretation", "explain_required", "text_production",
                  ],
                },
                statement: { type: "string" },
                choices: {
                  type: ["array", "null"],
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      label: { type: "string" },
                      text: { type: "string" },
                    },
                    required: ["id", "label", "text"],
                    additionalProperties: false,
                  },
                },
                correctAnswer: { type: "string" },
                explanation: { type: "string" },
                passage: { type: ["string", "null"] },
                leftItems: { type: ["array", "null"], items: { type: "string" } },
              },
              required: ["type", "statement", "choices", "correctAnswer", "explanation", "passage", "leftItems"],
              additionalProperties: false,
            },
          },
        },
        required: ["title", "summary", "sections", "exercises"],
        additionalProperties: false,
      },
    },
  },
  required: ["topics"],
  additionalProperties: false,
} as const;

const MAX_TEXT_CHARS = 40_000;

export async function processPdfText(
  extractedText: string,
  packInfo: { subject: string; grade: string; examName: string }
): Promise<GeneratedTopic[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY não configurada.");

  const client = new OpenAI({ apiKey });

  const truncated = extractedText.slice(0, MAX_TEXT_CHARS);

  const systemPrompt = `Você é um educador especialista. Dado o conteúdo de estudo abaixo, organize-o em tópicos de estudo claros e didáticos para um aluno do ${packInfo.grade} que está se preparando para a prova "${packInfo.examName}" de ${packInfo.subject}.

Para cada tópico:
- Crie seções de conteúdo variadas (explanation para teoria, example para exemplos práticos, note para dicas importantes, common_mistake para erros comuns, summary para resumo final)
- Crie pelo menos 3 exercícios por tópico com tipos variados

Regras por tipo de exercício:
- multiple_choice: 4 alternativas (A, B, C, D); correctAnswer = id da opção correta (ex: "b")
- true_false: correctAnswer = "true" ou "false"; choices = null
- fill_blank: correctAnswer = palavra ou expressão esperada; choices = null
- open_short: correctAnswer = resposta ideal resumida; choices = null
- numeric: correctAnswer = valor numérico como string (ex: "42"); use para cálculos e medidas exatas; choices = null
- multiple_select: 4–5 alternativas; correctAnswer = ids corretos separados por vírgula (ex: "a,c"); marque 2 ou mais opções corretas
- open_long: correctAnswer = gabarito resumido/critérios; choices = null; para questões dissertativas
- match_columns: leftItems = lista de itens da esquerda; choices = itens da direita (id, label, text); correctAnswer = JSON {"0":"b","1":"a",...} mapeando índice de leftItems → id do choice
- ordering: choices = itens a ordenar (em ordem embaralhada); correctAnswer = ids na ordem correta separados por vírgula (ex: "c,a,d,b")
- text_interpretation: passage = texto de leitura; statement = pergunta sobre o texto; correctAnswer = resposta ideal; choices = null
- explain_required: como open_short mas o aluno também deve justificar; correctAnswer = "resposta|||raciocínio esperado"; choices = null
- text_production: correctAnswer = critérios/rubrica de avaliação; choices = null; para redações e produções longas

Para campos que não se aplicam ao tipo: use null (choices = null, passage = null, leftItems = null).
Escreva tudo em português brasileiro, linguagem clara e adequada para a idade.

Gere entre 3 e 6 tópicos com base no conteúdo disponível.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: truncated },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "study_pack",
        strict: true,
        schema: RESPONSE_SCHEMA,
      },
    },
    temperature: 0.4,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("OpenAI não retornou conteúdo.");

  const parsed = JSON.parse(raw) as { topics: GeneratedTopic[] };
  return parsed.topics;
}
