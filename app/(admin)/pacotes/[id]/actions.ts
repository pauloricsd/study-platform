"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import type { StudyPackFile, StudyPackQuestion, StudyPackAnswerKey } from "@/lib/ai/import-studypack";
import type { TopicRow, SectionRow, ExerciseRow } from "@/lib/database.types";

export async function setPackStatusAction(
  packId: string,
  status: "published" | "draft" | "archived"
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("study_packs")
    .update({ status, updated_at: new Date().toISOString() } as never)
    .eq("id", packId);

  if (error) return { error: error.message };

  revalidatePath(`/pacotes/${packId}`);
  revalidatePath("/pacotes");
  return {};
}

// ─── Export StudyPack ─────────────────────────────────────────────────────────

type Choice = { id: string; label: string; text: string };

function buildAnswerKey(type: string, correctAnswer: string, choices: Choice[] | null): StudyPackAnswerKey {
  switch (type) {
    case "multiple_choice": {
      const match = (choices ?? []).find((c) => c.label === correctAnswer);
      return { correctOptionId: match?.id ?? correctAnswer.toLowerCase() };
    }
    case "true_false":
      return { correctValue: correctAnswer === "Verdadeiro" };
    case "fill_blank":
      return { acceptedAnswers: [correctAnswer] };
    case "numeric": {
      const n = parseFloat(correctAnswer);
      return { correctValue: isNaN(n) ? 0 : n };
    }
    default:
      return { idealAnswer: correctAnswer };
  }
}

function buildOptions(type: string, choices: Choice[] | null) {
  if (type !== "multiple_choice" || !choices?.length) return undefined;
  return choices.map((c) => ({ id: c.id, text: c.text }));
}

export async function exportStudyPackAction(
  packId: string
): Promise<{ data?: StudyPackFile; filename?: string; error?: string }> {
  const supabase = createAdminClient();

  // Fetch pack
  const { data: pack, error: packErr } = await supabase
    .from("study_packs")
    .select("*")
    .eq("id", packId)
    .single();

  if (packErr || !pack) return { error: packErr?.message ?? "Pacote não encontrado." };

  // Fetch topics with sections
  const { data: topicsRaw } = await supabase
    .from("topics")
    .select("*, sections(*)")
    .eq("pack_id", packId)
    .order("order");

  const topics = (topicsRaw ?? []) as (TopicRow & { sections: SectionRow[] })[];

  // Fetch exercises
  const topicIds = topics.map((t) => t.id);
  const { data: exercisesRaw } = topicIds.length
    ? await supabase.from("exercises").select("*").in("topic_id", topicIds).order("order")
    : { data: [] };

  const exercises = (exercisesRaw ?? []) as ExerciseRow[];

  // Build StudyPackFile
  const packRow = pack as Record<string, unknown>;

  const studyPack: StudyPackFile = {
    studyPackVersion: "1.0",
    metadata: {
      title: packRow.title as string,
      subject: packRow.subject as string,
      schoolLevel: packRow.grade as string ?? "",
      examDate: packRow.exam_date ? String(packRow.exam_date) : undefined,
      description: packRow.exam_name ? String(packRow.exam_name) : undefined,
      language: "pt-BR",
    },
    topics: topics.map((t, idx) => ({
      id: t.id,
      title: t.title,
      summary: t.summary ?? "",
      order: t.order ?? idx,
      // Extension: include content sections for round-trip fidelity
      ...(t.sections?.length
        ? {
            sections: t.sections.map((s) => ({
              id: s.id,
              type: s.type,
              title: s.title ?? undefined,
              content: s.content,
            })),
          }
        : {}),
    })),
    questions: exercises.map((ex) => {
      const choices = ex.choices as Choice[] | null;
      const q: StudyPackQuestion = {
        id: ex.id,
        type: ex.type,
        topicId: ex.topic_id,
        prompt: ex.statement,
        options: buildOptions(ex.type, choices),
        answerKey: buildAnswerKey(ex.type, ex.correct_answer, choices),
        explanation: ex.explanation ?? "",
      };
      return q;
    }),
  };

  const slug = (packRow.title as string)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);

  return { data: studyPack, filename: `${slug}.studypack.json` };
}

export async function deletePackAction(packId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("study_packs").delete().eq("id", packId);
  revalidatePath("/pacotes");
  redirect("/pacotes");
}
