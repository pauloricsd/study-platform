"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/auth";
import type { SuggestedQuestionRow } from "@/lib/database.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SuggestedQuestion = SuggestedQuestionRow & {
  topic_title?: string;
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getSuggestedQuestionsForPack(
  packId: string
): Promise<SuggestedQuestion[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("suggested_questions")
    .select("*, topics(title)")
    .eq("pack_id" as never, packId)
    .order("created_at" as never, { ascending: true });

  if (error || !data) return [];

  return (data as unknown as (SuggestedQuestionRow & { topics: { title: string } | null })[]).map((row) => ({
    ...row,
    topic_title: row.topics?.title ?? undefined,
  }));
}

export async function getPendingSuggestionsCount(packId: string): Promise<number> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("suggested_questions")
    .select("*", { count: "exact", head: true })
    .eq("pack_id" as never, packId)
    .eq("status" as never, "suggested");
  return count ?? 0;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function approveSuggestedQuestion(
  suggestionId: string,
  packId: string
): Promise<{ exerciseId: string } | { error: string }> {
  const supabase = createAdminClient();
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Não autenticado." };

  // Fetch the suggestion
  const { data: sqRaw, error: fetchErr } = await supabase
    .from("suggested_questions")
    .select("*")
    .eq("id", suggestionId)
    .eq("pack_id", packId)
    .single();

  if (fetchErr || !sqRaw) return { error: "Sugestão não encontrada." };
  const sq = sqRaw as SuggestedQuestionRow;
  if (sq.status !== "suggested") return { error: "Sugestão já processada." };

  // Count existing exercises in the topic to set the order
  const { count: existingCount } = await supabase
    .from("exercises")
    .select("*", { count: "exact", head: true })
    .eq("topic_id", sq.topic_id as never);

  // Create the exercise from the suggestion
  const { data: exercise, error: insertErr } = await supabase
    .from("exercises")
    .insert({
      topic_id: sq.topic_id,
      type: sq.type as never,
      statement: sq.statement,
      choices: sq.choices ?? null,
      correct_answer: sq.correct_answer,
      explanation: sq.explanation,
      order: existingCount ?? 0,
      difficulty: sq.difficulty as never,
      difficulty_source: "ai_inferred",
      origin: "ai_suggested",
    } as never)
    .select("id")
    .single();

  if (insertErr || !exercise) return { error: "Erro ao criar exercício." };

  const exerciseRow = exercise as { id: string };

  // Mark suggestion as approved
  await supabase
    .from("suggested_questions")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: profile.id,
      approved_as_exercise_id: exerciseRow.id,
    } as never)
    .eq("id" as never, suggestionId);

  return { exerciseId: exerciseRow.id };
}

export async function rejectSuggestedQuestion(
  suggestionId: string,
  packId: string
): Promise<void | { error: string }> {
  const supabase = createAdminClient();
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Não autenticado." };

  await supabase
    .from("suggested_questions")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: profile.id,
    } as never)
    .eq("id" as never, suggestionId)
    .eq("pack_id" as never, packId);
}

export async function approveSuggestedQuestionsBatch(
  suggestionIds: string[],
  packId: string
): Promise<{ approved: number; errors: number }> {
  let approved = 0;
  let errors = 0;

  for (const id of suggestionIds) {
    const result = await approveSuggestedQuestion(id, packId);
    if ("error" in result) errors++;
    else approved++;
  }

  return { approved, errors };
}
