"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { Exercise } from "@/lib/mock-topics";

// ─── Pack metadata ────────────────────────────────────────────────────────────

interface PackMetaInput {
  title: string;
  subject: string;
  grade: string;
  examName: string;
  examDate: string;
}

export async function updatePackMeta(
  packId: string,
  data: PackMetaInput
): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("study_packs")
    .update({
      title: data.title,
      subject: data.subject,
      grade: data.grade,
      exam_name: data.examName,
      exam_date: data.examDate || null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", packId);

  if (error) return { error: error.message };

  revalidatePath(`/pacotes/${packId}`);
  revalidatePath(`/pacotes/${packId}/editar`);
  return {};
}

// ─── Topic ────────────────────────────────────────────────────────────────────

interface TopicInput {
  title: string;
  summary: string;
}

export async function updateTopic(
  topicId: string,
  packId: string,
  data: TopicInput
): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("topics")
    .update({
      title: data.title,
      summary: data.summary,
    } as never)
    .eq("id", topicId);

  if (error) return { error: error.message };

  revalidatePath(`/pacotes/${packId}`);
  revalidatePath(`/pacotes/${packId}/editar`);
  return {};
}

// ─── Exercise ─────────────────────────────────────────────────────────────────

interface ExerciseInput {
  type: Exercise["type"];
  statement: string;
  correctAnswer: string;
  explanation: string;
}

export async function updateExercise(
  exerciseId: string,
  packId: string,
  data: ExerciseInput
): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("exercises")
    .update({
      type: data.type,
      statement: data.statement,
      correct_answer: data.correctAnswer,
      explanation: data.explanation,
    } as never)
    .eq("id", exerciseId);

  if (error) return { error: error.message };

  revalidatePath(`/pacotes/${packId}`);
  revalidatePath(`/pacotes/${packId}/editar`);
  return {};
}

export async function addExercise(
  topicId: string,
  packId: string,
  data: ExerciseInput
): Promise<{ id?: string; error?: string }> {
  const supabase = createAdminClient();

  // Find max existing order for this topic
  const { data: existing } = await supabase
    .from("exercises")
    .select("order")
    .eq("topic_id", topicId)
    .order("order", { ascending: false })
    .limit(1);

  const maxOrder = (existing as { order: number }[] | null)?.[0]?.order ?? -1;

  const { data: inserted, error } = await supabase
    .from("exercises")
    .insert({
      topic_id: topicId,
      type: data.type,
      statement: data.statement,
      correct_answer: data.correctAnswer,
      explanation: data.explanation,
      order: maxOrder + 1,
    } as never)
    .select("id")
    .single();

  if (error) return { error: error.message };

  const row = inserted as { id: string } | null;

  revalidatePath(`/pacotes/${packId}`);
  revalidatePath(`/pacotes/${packId}/editar`);
  return { id: row?.id };
}

export async function deleteExercise(
  exerciseId: string,
  packId: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", exerciseId);

  if (error) return { error: error.message };

  revalidatePath(`/pacotes/${packId}`);
  revalidatePath(`/pacotes/${packId}/editar`);
  return {};
}
