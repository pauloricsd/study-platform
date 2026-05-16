"use server";

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface GradeResult {
  verdict: "correct" | "partial" | "incorrect";
  feedback: string;
}

export async function gradeOpenAnswer({
  question,
  correctAnswer,
  userAnswer,
  exerciseType,
  passage,
  acceptanceCriteria,
}: {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  exerciseType: string;
  passage?: string;
  acceptanceCriteria?: string | null;
}): Promise<GradeResult> {
  if (!process.env.OPENAI_API_KEY) {
    return { verdict: userAnswer.trim().length > 30 ? "partial" : "incorrect", feedback: "" };
  }

  const system = `Você é um corretor pedagógico para alunos do ensino fundamental e médio.
Avalie a resposta do aluno de forma breve e construtiva.
Responda SOMENTE com JSON válido: {"verdict":"correct"|"partial"|"incorrect","feedback":"1-2 frases em português"}
- "correct": resposta demonstra compreensão adequada do conceito esperado
- "partial": está no caminho certo mas falta completude, precisão ou detalhe importante
- "incorrect": resposta errada, fora do tema ou incompreensível`;

  const user = [
    `Tipo: ${exerciseType}`,
    passage ? `Texto de referência: "${passage}"` : null,
    `Enunciado: ${question}`,
    `Gabarito esperado: ${correctAnswer}`,
    acceptanceCriteria ? `Critérios de aceite: ${acceptanceCriteria}` : null,
    `Resposta do aluno: ${userAnswer}`,
  ].filter(Boolean).join("\n");

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      max_tokens: 150,
      temperature: 0.2,
    });

    const raw = JSON.parse(res.choices[0]?.message?.content ?? "{}") as {
      verdict?: string;
      feedback?: string;
    };

    const verdict = (["correct", "partial", "incorrect"] as const).includes(raw.verdict as never)
      ? (raw.verdict as GradeResult["verdict"])
      : "partial";

    return { verdict, feedback: raw.feedback ?? "" };
  } catch {
    return { verdict: "partial", feedback: "" };
  }
}
