"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { Exercise, Section } from "@/lib/mock-topics";

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
  choices?: Exercise["choices"];
  correctAnswer: string;
  explanation: string;
  maxAttempts?: number | null;
  hideCorrectAnswerDuringRetry?: boolean;
  acceptanceCriteria?: string | null;
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
      choices: data.choices ?? null,
      correct_answer: data.correctAnswer,
      explanation: data.explanation,
      max_attempts: data.maxAttempts ?? null,
      hide_correct_answer_during_retry: data.hideCorrectAnswerDuringRetry ?? false,
      acceptance_criteria: data.acceptanceCriteria ?? null,
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
      choices: data.choices ?? null,
      correct_answer: data.correctAnswer,
      explanation: data.explanation,
      order: maxOrder + 1,
      max_attempts: data.maxAttempts ?? null,
      hide_correct_answer_during_retry: data.hideCorrectAnswerDuringRetry ?? false,
      acceptance_criteria: data.acceptanceCriteria ?? null,
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

// ─── Section ──────────────────────────────────────────────────────────────────

interface SectionInput {
  type: Section["type"];
  title: string;
  content: string;
}

export async function addSection(
  topicId: string,
  packId: string,
  data: SectionInput
): Promise<{ id?: string; error?: string }> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("sections")
    .select("order")
    .eq("topic_id", topicId)
    .order("order", { ascending: false })
    .limit(1);

  const maxOrder = (existing as { order: number }[] | null)?.[0]?.order ?? -1;

  const { data: inserted, error } = await supabase
    .from("sections")
    .insert({
      topic_id: topicId,
      type: data.type,
      title: data.title || null,
      content: data.content,
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

export async function updateSection(
  sectionId: string,
  packId: string,
  data: SectionInput
): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("sections")
    .update({
      type: data.type,
      title: data.title || null,
      content: data.content,
    } as never)
    .eq("id", sectionId);

  if (error) return { error: error.message };

  revalidatePath(`/pacotes/${packId}`);
  revalidatePath(`/pacotes/${packId}/editar`);
  return {};
}

export async function deleteSection(
  sectionId: string,
  packId: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("sections")
    .delete()
    .eq("id", sectionId);

  if (error) return { error: error.message };

  revalidatePath(`/pacotes/${packId}`);
  revalidatePath(`/pacotes/${packId}/editar`);
  return {};
}
