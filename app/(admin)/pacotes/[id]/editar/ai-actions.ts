"use server";

import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Topic, Exercise, Section } from "@/lib/mock-topics";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ChangeAction =
  | "update_topic"
  | "add_exercise"
  | "update_exercise"
  | "add_section"
  | "update_section";

export interface ProposedChange {
  id: string; // client-side unique id for React keys
  action: ChangeAction;
  description: string; // human-readable summary of this change
  targetId?: string;   // existing record to update
  topicId?: string;    // topic to add to
  topicTitle?: string; // for display
  data: Record<string, unknown>;
}

export interface AiEditResult {
  summary: string;
  changes: ProposedChange[];
  error?: string;
}

// ─── Context builder ───────────────────────────────────────────────────────────

interface PackContext {
  title: string;
  subject: string;
  grade: string;
  topics: Array<{
    id: string;
    title: string;
    summary: string;
    sections: Array<{ id: string; type: string; title?: string; contentPreview: string }>;
    exercises: Array<{ id: string; type: string; statement: string }>;
  }>;
}

async function buildPackContext(packId: string): Promise<PackContext | null> {
  const supabase = createAdminClient();

  const { data: pack } = await supabase
    .from("study_packs")
    .select("title, subject, grade")
    .eq("id", packId)
    .single();

  if (!pack) return null;

  const { data: topics } = await supabase
    .from("topics")
    .select("id, title, summary, sections(id, type, title, content), exercises(id, type, statement)")
    .eq("pack_id", packId)
    .order("order");

  const packRow = pack as { title: string; subject: string; grade: string };

  return {
    title: packRow.title,
    subject: packRow.subject,
    grade: packRow.grade ?? "",
    topics: (topics ?? []).map((t: Record<string, unknown>) => ({
      id: t.id as string,
      title: t.title as string,
      summary: (t.summary as string) ?? "",
      sections: ((t.sections as Record<string, unknown>[]) ?? []).map((s) => ({
        id: s.id as string,
        type: s.type as string,
        title: (s.title as string | null) ?? undefined,
        contentPreview: ((s.content as string) ?? "").slice(0, 80),
      })),
      exercises: ((t.exercises as Record<string, unknown>[]) ?? []).map((e) => ({
        id: e.id as string,
        type: e.type as string,
        statement: ((e.statement as string) ?? "").slice(0, 120),
      })),
    })),
  };
}

// ─── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(ctx: PackContext): string {
  const topicList = ctx.topics
    .map((t, i) => {
      const sections = t.sections.map((s) =>
        `      - seção [${s.id}] tipo=${s.type}${s.title ? ` título="${s.title}"` : ""}: "${s.contentPreview}..."`
      ).join("\n");
      const exercises = t.exercises.map((e) =>
        `      - questão [${e.id}] tipo=${e.type}: "${e.statement}"`
      ).join("\n");
      return [
        `  Tópico ${i + 1} [${t.id}]: "${t.title}"`,
        `    Resumo: "${t.summary}"`,
        sections ? `    Seções:\n${sections}` : "    Seções: (nenhuma)",
        exercises ? `    Questões:\n${exercises}` : "    Questões: (nenhuma)",
      ].join("\n");
    })
    .join("\n\n");

  return `Você é um assistente pedagógico especializado em criar e melhorar materiais de estudo.
Você vai editar um pacote de estudos seguindo a instrução do professor.

=== PACOTE ATUAL ===
Título: ${ctx.title}
Matéria: ${ctx.subject}
Série/Turma: ${ctx.grade}

Tópicos:
${topicList}

=== SUAS TAREFAS ===
Analise a instrução do professor e produza uma lista de alterações no formato JSON abaixo.
Seja preciso: use os IDs exatos dos tópicos, seções e questões mostrados acima.

Tipos de ação disponíveis:
- "update_topic": alterar título ou resumo de um tópico (campos: title?, summary?)
- "add_section": adicionar seção a um tópico (campos: type, title?, content; type ∈ explanation|example|summary|note|common_mistake)
- "update_section": alterar seção existente (campos: type?, title?, content?)
- "add_exercise": adicionar questão a um tópico (campos: type, statement, correctAnswer, explanation, choices?)
- "update_exercise": alterar questão existente (campos: type?, statement?, correctAnswer?, explanation?)

Tipos de questão disponíveis: multiple_choice, true_false, fill_blank, open_short, numeric, multiple_select, open_long, text_interpretation, explain_required, text_production, match_columns, ordering

Para multiple_choice, inclua choices como array de {id, label, text}.

Responda SOMENTE com JSON válido:
{
  "summary": "Resumo curto (1 frase) do que foi feito",
  "changes": [
    {
      "action": "add_exercise",
      "description": "Descrição legível desta alteração específica",
      "topic_id": "<uuid do tópico>",
      "topic_title": "<título do tópico para exibição>",
      "data": { ... }
    },
    {
      "action": "update_section",
      "description": "...",
      "target_id": "<uuid da seção>",
      "topic_title": "<título do tópico para exibição>",
      "data": { ... }
    }
  ]
}

Limite: máximo 6 alterações por resposta. Seja conciso e certeiro.`;
}

// ─── Main action ───────────────────────────────────────────────────────────────

export async function generateAiEditProposal(
  packId: string,
  instruction: string
): Promise<AiEditResult> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      summary: "",
      changes: [],
      error: "OpenAI não configurado. Defina OPENAI_API_KEY nas variáveis de ambiente.",
    };
  }

  const ctx = await buildPackContext(packId);
  if (!ctx) return { summary: "", changes: [], error: "Pacote não encontrado." };

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: buildSystemPrompt(ctx) },
        { role: "user", content: instruction },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.4,
    });

    const raw = JSON.parse(res.choices[0]?.message?.content ?? "{}") as {
      summary?: string;
      changes?: Array<{
        action?: string;
        description?: string;
        topic_id?: string;
        target_id?: string;
        topic_title?: string;
        data?: Record<string, unknown>;
      }>;
    };

    const validActions = new Set<ChangeAction>([
      "update_topic", "add_exercise", "update_exercise", "add_section", "update_section",
    ]);

    const changes: ProposedChange[] = (raw.changes ?? [])
      .filter((c) => c.action && validActions.has(c.action as ChangeAction) && c.data)
      .map((c, i) => ({
        id: `change-${i}`,
        action: c.action as ChangeAction,
        description: c.description ?? c.action ?? "",
        targetId: c.target_id,
        topicId: c.topic_id,
        topicTitle: c.topic_title,
        data: c.data ?? {},
      }));

    return { summary: raw.summary ?? "", changes };
  } catch (e) {
    return { summary: "", changes: [], error: `Erro ao chamar IA: ${String(e)}` };
  }
}

// ─── Apply changes ─────────────────────────────────────────────────────────────

export async function applyAiChanges(
  packId: string,
  changes: ProposedChange[]
): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  for (const change of changes) {
    try {
      if (change.action === "update_topic" && change.targetId) {
        await supabase
          .from("topics")
          .update(change.data as never)
          .eq("id", change.targetId);

      } else if (change.action === "add_section" && change.topicId) {
        // Get max order for this topic's sections
        const { data: existing } = await supabase
          .from("sections")
          .select("order")
          .eq("topic_id", change.topicId)
          .order("order", { ascending: false })
          .limit(1);
        const maxOrder = (existing as { order: number }[] | null)?.[0]?.order ?? -1;
        await supabase
          .from("sections")
          .insert({ ...change.data, topic_id: change.topicId, order: maxOrder + 1 } as never);

      } else if (change.action === "update_section" && change.targetId) {
        await supabase
          .from("sections")
          .update(change.data as never)
          .eq("id", change.targetId);

      } else if (change.action === "add_exercise" && change.topicId) {
        const { data: existing } = await supabase
          .from("exercises")
          .select("order")
          .eq("topic_id", change.topicId)
          .order("order", { ascending: false })
          .limit(1);
        const maxOrder = (existing as { order: number }[] | null)?.[0]?.order ?? -1;
        await supabase
          .from("exercises")
          .insert({ ...change.data, topic_id: change.topicId, order: maxOrder + 1 } as never);

      } else if (change.action === "update_exercise" && change.targetId) {
        await supabase
          .from("exercises")
          .update(change.data as never)
          .eq("id", change.targetId);
      }
    } catch {
      // Continue with other changes even if one fails
    }
  }

  revalidatePath(`/pacotes/${packId}/editar`);
  revalidatePath(`/pacotes/${packId}`);
  return {};
}
