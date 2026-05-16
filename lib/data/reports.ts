import { SUPABASE_CONFIGURED } from "./utils";
import type { TopicProgressRow, ExerciseResponseRow, ExerciseRow, ProfileRow } from "@/lib/database.types";

export interface TopicStat {
  topicId: string;
  topicTitle: string;
  avgScore: number;       // 0-100
  studentCount: number;   // how many students attempted
  totalAttempts: number;
}

export interface ExerciseStat {
  exerciseId: string;
  statement: string;      // truncated to 100 chars
  topicTitle: string;
  totalResponses: number;
  correctCount: number;
  errorRate: number;      // 0-1
}

export interface StudentPackStat {
  studentId: string;
  name: string;
  avatarInitials: string | null;
  avatarColor: string | null;
  avgScore: number;          // 0-100, or -1 if not started
  topicsCompleted: number;
  totalTopics: number;
  lastActiveAt: string | null;
}

export interface PackReport {
  topicStats: TopicStat[];
  worstExercises: ExerciseStat[];  // top 5 with highest error rate (min 2 responses)
  studentStats: StudentPackStat[];
}

async function db() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

export async function getPackReport(
  packId: string,
  topics: { id: string; title: string }[]
): Promise<PackReport> {
  if (!SUPABASE_CONFIGURED || topics.length === 0) {
    return { topicStats: [], worstExercises: [], studentStats: [] };
  }

  const topicIds = topics.map((t) => t.id);
  const topicMap = new Map(topics.map((t) => [t.id, t.title]));

  const supabase = await db();

  const [topicProgressResult, exerciseResponsesResult, studentPacksResult] = await Promise.all([
    // 1. Topic progress for all topics in this pack
    supabase
      .from("topic_progress")
      .select("topic_id, score, correct_answers, total_questions, student_id, attempts")
      .in("topic_id", topicIds),

    // 2. Exercise responses joined with exercises to get statement and topic
    supabase
      .from("exercise_responses")
      .select("exercise_id, is_correct, student_id, exercises(statement, topic_id)")
      .in("exercises.topic_id", topicIds),

    // 3. Students assigned to this pack with their profiles
    supabase
      .from("student_packs")
      .select("student_id, profiles(id, name, avatar_initials, avatar_color)")
      .eq("pack_id", packId),
  ]);

  // --- Topic stats ---
  type ProgressRow = Pick<TopicProgressRow, "topic_id" | "score" | "correct_answers" | "total_questions" | "student_id" | "attempts">;
  const progressData = topicProgressResult.data as ProgressRow[] | null ?? [];

  const topicGroups = new Map<string, ProgressRow[]>();
  for (const row of progressData) {
    const existing = topicGroups.get(row.topic_id) ?? [];
    existing.push(row);
    topicGroups.set(row.topic_id, existing);
  }

  const topicStats: TopicStat[] = topics.map((t) => {
    const rows = topicGroups.get(t.id) ?? [];
    const avgScore =
      rows.length > 0
        ? Math.round(rows.reduce((sum, r) => sum + (r.score ?? 0), 0) / rows.length)
        : 0;
    const studentCount = new Set(rows.map((r) => r.student_id)).size;
    const totalAttempts = rows.reduce((sum, r) => sum + (r.attempts ?? 0), 0);
    return {
      topicId: t.id,
      topicTitle: t.title,
      avgScore,
      studentCount,
      totalAttempts,
    };
  });

  // --- Exercise stats ---
  type ExerciseResponseWithJoin = Pick<ExerciseResponseRow, "exercise_id" | "is_correct" | "student_id"> & {
    exercises: Pick<ExerciseRow, "statement" | "topic_id"> | null;
  };
  const responseData = exerciseResponsesResult.data as ExerciseResponseWithJoin[] | null ?? [];

  // Filter to only responses for exercises actually in our topics
  const validResponses = responseData.filter(
    (r) => r.exercises && topicMap.has(r.exercises.topic_id)
  );

  const exerciseGroups = new Map<string, ExerciseResponseWithJoin[]>();
  for (const row of validResponses) {
    const existing = exerciseGroups.get(row.exercise_id) ?? [];
    existing.push(row);
    exerciseGroups.set(row.exercise_id, existing);
  }

  const worstExercises: ExerciseStat[] = Array.from(exerciseGroups.entries())
    .map(([exerciseId, rows]) => {
      const totalResponses = rows.length;
      const correctCount = rows.filter((r) => r.is_correct === true).length;
      const errorRate = totalResponses > 0 ? (totalResponses - correctCount) / totalResponses : 0;
      const exercise = rows[0].exercises!;
      const statement =
        exercise.statement.length > 100
          ? exercise.statement.slice(0, 100) + "…"
          : exercise.statement;
      const topicTitle = topicMap.get(exercise.topic_id) ?? "";
      return { exerciseId, statement, topicTitle, totalResponses, correctCount, errorRate };
    })
    .filter((e) => e.totalResponses >= 2)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 5);

  // --- Student stats ---
  type StudentPackRow = {
    student_id: string;
    profiles: Pick<ProfileRow, "id" | "name" | "avatar_initials" | "avatar_color"> | null;
  };
  const studentPackData = studentPacksResult.data as StudentPackRow[] | null ?? [];

  const studentStats: StudentPackStat[] = studentPackData.map((sp) => {
    const profile = sp.profiles;
    const studentProgress = progressData.filter((p) => p.student_id === sp.student_id);
    const topicsAttempted = studentProgress.length;

    const avgScore =
      topicsAttempted > 0
        ? Math.round(
            studentProgress.reduce((sum, p) => sum + (p.score ?? 0), 0) / topicsAttempted
          )
        : -1;

    const topicsCompleted = studentProgress.filter((p) => (p.score ?? 0) >= 60).length;

    // Find last active date from topic_progress rows that have a last_attempt_at
    const fullProgressRows = (topicProgressResult.data as (ProgressRow & { last_attempt_at?: string | null })[] | null) ?? [];
    const studentFullProgress = fullProgressRows.filter((p) => p.student_id === sp.student_id);
    const dates = studentFullProgress
      .map((p) => (p as { last_attempt_at?: string | null }).last_attempt_at)
      .filter((d): d is string => !!d);
    const lastActiveAt = dates.length > 0 ? dates.sort().at(-1) ?? null : null;

    return {
      studentId: sp.student_id,
      name: profile?.name ?? "Aluno",
      avatarInitials: profile?.avatar_initials ?? null,
      avatarColor: profile?.avatar_color ?? null,
      avgScore,
      topicsCompleted,
      totalTopics: topics.length,
      lastActiveAt,
    };
  });

  return { topicStats, worstExercises, studentStats };
}
