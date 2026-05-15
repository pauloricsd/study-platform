import OpenAI from "openai";

export interface GeneratedSection {
  type: "explanation" | "example" | "note" | "common_mistake" | "summary";
  title?: string;
  content: string;
}

export interface GeneratedExercise {
  type: "multiple_choice" | "true_false" | "fill_blank" | "open_short";
  statement: string;
  choices?: { id: string; label: string; text: string }[];
  correctAnswer: string;
  explanation: string;
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
                title: { type: "string" },
                content: { type: "string" },
              },
              required: ["type", "content"],
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
                  enum: ["multiple_choice", "true_false", "fill_blank", "open_short"],
                },
                statement: { type: "string" },
                choices: {
                  type: "array",
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
              },
              required: ["type", "statement", "correctAnswer", "explanation"],
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
- Crie pelo menos 2 exercícios por tópico com tipos variados
- Para múltipla escolha: inclua 4 alternativas (A, B, C, D) e coloque a letra correta em correctAnswer
- Para true_false: coloque "true" ou "false" em correctAnswer
- Para fill_blank: coloque a resposta esperada em correctAnswer
- Escreva tudo em português brasileiro, linguagem clara e adequada para a idade

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
