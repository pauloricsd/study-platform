import { SUPABASE_CONFIGURED } from "./utils";
import { mockTopicHistory, type TopicHistory } from "@/lib/mock-history";
import type { TopicProgressRow } from "@/lib/database.types";

export type { TopicHistory };

async function db() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

export async function getTopicHistory(studentId: string): Promise<TopicHistory[]> {
  if (!SUPABASE_CONFIGURED) return mockTopicHistory;

  const supabase = await db();
  const result = await supabase
    .from("topic_progress")
    .select("*, topics(pack_id)")
    .eq("student_id", studentId);

  const data = result.data as (TopicProgressRow & {
    topics: { pack_id: string } | null;
  })[] | null;
  if (!data) return [];

  return data.map((row) => ({
    topicId: row.topic_id,
    packId: row.topics?.pack_id ?? "",
    score: row.score ?? 0,
    correctAnswers: row.correct_answers ?? 0,
    totalQuestions: row.total_questions ?? 0,
    attempts: row.attempts ?? 0,
    lastAttemptAt: row.last_attempt_at ?? null,
  }));
}

// ─── Exercise attempt history ──────────────────────────────────────────────────

export interface ExerciseAttempt {
  exerciseId: string;
  statement: string;
  type: string;
  attemptNumber: number;
  userAnswer: string | null;
  isCorrect: boolean | null;
  wasRevealed: boolean;
  answeredAt: string;
}

export async function getExerciseHistory(
  studentId: string,
  topicId: string
): Promise<ExerciseAttempt[]> {
  if (!SUPABASE_CONFIGURED) return [];

  const supabase = await db();

  // Step 1: exercises in this topic (ordered)
  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, statement, type")
    .eq("topic_id", topicId)
    .order("order");

  if (!exercises || exercises.length === 0) return [];

  const exerciseIds = (exercises as { id: string; statement: string; type: string }[]).map(
    (e) => e.id
  );
  const exerciseMap = new Map(
    (exercises as { id: string; statement: string; type: string }[]).map((e) => [
      e.id,
      { statement: e.statement, type: e.type },
    ])
  );

  // Step 2: responses for those exercises by this student
  const { data: responses } = await supabase
    .from("exercise_responses")
    .select("exercise_id, attempt_number, user_answer, is_correct, was_revealed, answered_at")
    .eq("student_id", studentId)
    .in("exercise_id", exerciseIds)
    .order("answered_at", { ascending: false });

  if (!responses) return [];

  return (
    responses as {
      exercise_id: string;
      attempt_number: number;
      user_answer: string | null;
      is_correct: boolean | null;
      was_revealed: boolean | null;
      answered_at: string;
    }[]
  ).map((r) => ({
    exerciseId: r.exercise_id,
    statement: exerciseMap.get(r.exercise_id)?.statement ?? "",
    type: exerciseMap.get(r.exercise_id)?.type ?? "",
    attemptNumber: r.attempt_number,
    userAnswer: r.user_answer,
    isCorrect: r.is_correct,
    wasRevealed: r.was_revealed ?? false,
    answeredAt: r.answered_at,
  }));
}

// ─── Save responses ─────────────────────────────────────────────────────────────

export interface ExerciseResponseInput {
  studentId: string;
  exerciseId: string;
  attemptNumber: number;
  userAnswer: string;
  isCorrect: boolean;
  wasRevealed: boolean;
}

export async function saveExerciseResponses(
  responses: ExerciseResponseInput[]
): Promise<void> {
  if (!SUPABASE_CONFIGURED || responses.length === 0) return;

  const supabase = await db();
  await supabase.from("exercise_responses").insert(
    responses.map((r) => ({
      student_id: r.studentId,
      exercise_id: r.exerciseId,
      attempt_number: r.attemptNumber,
      user_answer: r.userAnswer,
      is_correct: r.isCorrect,
      was_revealed: r.wasRevealed,
    })) as never
  );
}

export interface SaveProgressInput {
  studentId: string;
  topicId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

export async function saveTopicProgress(input: SaveProgressInput): Promise<void> {
  if (!SUPABASE_CONFIGURED) return;

  const supabase = await db();
  const existingResult = await supabase
    .from("topic_progress")
    .select("*")
    .eq("student_id", input.studentId)
    .eq("topic_id", input.topicId)
    .single();

  const existing = existingResult.data as TopicProgressRow | null;

  if (existing) {
    await supabase
      .from("topic_progress")
      .update({
        score: input.score,
        correct_answers: input.correctAnswers,
        total_questions: input.totalQuestions,
        attempts: (existing.attempts ?? 0) + 1,
        last_attempt_at: new Date().toISOString(),
      } as never)
      .eq("id", existing.id);
  } else {
    await supabase.from("topic_progress").insert({
      student_id: input.studentId,
      topic_id: input.topicId,
      score: input.score,
      correct_answers: input.correctAnswers,
      total_questions: input.totalQuestions,
      attempts: 1,
      last_attempt_at: new Date().toISOString(),
    } as never);
  }
}
