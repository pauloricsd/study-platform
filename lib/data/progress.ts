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
