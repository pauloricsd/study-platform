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

  const { data, error } = await supabase.rpc(
    "get_suggested_questions" as never,
    { p_pack_id: packId } as never
  );

  if (error || !data) return [];
  return data as unknown as SuggestedQuestion[];
}

export async function getPendingSuggestionsCount(packId: string): Promise<number> {
  const suggestions = await getSuggestedQuestionsForPack(packId);
  return suggestions.filter((s) => s.status === "suggested").length;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

// Accept full suggestion data from client — avoids fetching from PostgREST
// (table not yet in schema cache)
export async function approveSuggestedQuestion(
  sq: SuggestedQuestion,
  packId: string
): Promise<{ exerciseId: string } | { error: string }> {
  const supabase = createAdminClient();
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Não autenticado." };
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
    } as never)
    .select("id")
    .single();

  if (insertErr || !exercise) {
    console.error("approve exercise insert error:", insertErr?.message);
    return { error: `Erro ao criar exercício: ${insertErr?.message}` };
  }

  const exerciseRow = exercise as { id: string };

  // Mark suggestion as approved via RPC
  await supabase.rpc("approve_suggested_question" as never, {
    p_suggestion_id: sq.id,
    p_reviewed_by: profile.id,
    p_exercise_id: exerciseRow.id,
  } as never);

  return { exerciseId: exerciseRow.id };
}

export async function rejectSuggestedQuestion(
  suggestionId: string,
): Promise<void | { error: string }> {
  const supabase = createAdminClient();
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Não autenticado." };

  await supabase.rpc("reject_suggested_question" as never, {
    p_suggestion_id: suggestionId,
    p_reviewed_by: profile.id,
  } as never);
}

export async function approveSuggestedQuestionsBatch(
  suggestions: SuggestedQuestion[],
  packId: string
): Promise<{ approved: number; errors: number }> {
  let approved = 0;
  let errors = 0;

  for (const sq of suggestions) {
    const result = await approveSuggestedQuestion(sq, packId);
    if ("error" in result) errors++;
    else approved++;
  }

  return { approved, errors };
}
