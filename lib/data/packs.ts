import { SUPABASE_CONFIGURED } from "./utils";
import {
  mockStudyPacks,
  type StudyPack,
  type StudyPackProgress,
} from "@/lib/mock-data";
import type { StudyPackRow, StudentPackRow, TopicProgressRow } from "@/lib/database.types";

function mapPackRow(row: StudyPackRow): StudyPack {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject as StudyPack["subject"],
    grade: row.grade,
    examName: row.exam_name,
    examDate: row.exam_date,
    status: row.status,
    topicsCount: row.topics_count ?? 0,
    questionsCount: row.questions_count ?? 0,
    feedbackMode: row.feedback_mode ?? "immediate",
    studentIds: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function db() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

/** Admin: all packs regardless of assignment */
export async function getPacks(): Promise<StudyPack[]> {
  if (!SUPABASE_CONFIGURED) return mockStudyPacks;

  const supabase = await db();
  const result = await supabase
    .from("study_packs")
    .select("*")
    .order("updated_at", { ascending: false });

  return ((result.data as StudyPackRow[] | null) ?? []).map(mapPackRow);
}

/** Admin: single pack by id */
export async function getPackById(id: string): Promise<StudyPack | null> {
  if (!SUPABASE_CONFIGURED) {
    return mockStudyPacks.find((p) => p.id === id) ?? null;
  }

  const supabase = await db();
  const result = await supabase.from("study_packs").select("*").eq("id", id).single();
  const data = result.data as StudyPackRow | null;
  return data ? mapPackRow(data) : null;
}

/** Student: published packs assigned to a student, with their progress */
export async function getStudentPacks(studentId: string): Promise<StudyPack[]> {
  if (!SUPABASE_CONFIGURED) {
    return mockStudyPacks.filter(
      (p) => p.status === "published" && p.studentIds.includes(studentId)
    );
  }

  const supabase = await db();

  const assignmentsResult = await supabase
    .from("student_packs")
    .select("*")
    .eq("student_id", studentId);

  const assignments = assignmentsResult.data as StudentPackRow[] | null;
  if (!assignments?.length) return [];

  const packIds = assignments.map((a) => a.pack_id);

  const packsResult = await supabase
    .from("study_packs")
    .select("*, topics(id)")
    .in("id", packIds)
    .eq("status", "published")
    .order("exam_date");

  const packs = packsResult.data as (StudyPackRow & { topics: { id: string }[] })[] | null;
  if (!packs?.length) return [];

  const topicIds = packs.flatMap((p) => p.topics.map((t) => t.id));

  const progressResult = topicIds.length
    ? await supabase
        .from("topic_progress")
        .select("*")
        .eq("student_id", studentId)
        .in("topic_id", topicIds)
    : { data: [] };

  const topicProgress = (progressResult.data as TopicProgressRow[] | null) ?? [];

  return packs.map((pack) => {
    const packTopicIds = pack.topics.map((t) => t.id);
    const progress = topicProgress.filter((tp) => packTopicIds.includes(tp.topic_id));

    const topicsTotal = packTopicIds.length;
    const topicsDone = progress.filter((tp) => (tp.score ?? 0) >= 80).length;
    const questionsTotal = progress.reduce((sum, tp) => sum + (tp.total_questions ?? 0), 0);
    const questionsAnswered = progress.reduce(
      (sum, tp) => sum + ((tp.attempts ?? 0) > 0 ? (tp.total_questions ?? 0) : 0),
      0
    );
    const correctAnswers = progress.reduce((sum, tp) => sum + (tp.correct_answers ?? 0), 0);
    const lastAttempts = progress
      .map((tp) => tp.last_attempt_at)
      .filter(Boolean)
      .sort() as string[];
    const lastAccessedAt = lastAttempts.at(-1) ?? null;

    const packProgress: StudyPackProgress | undefined =
      topicsTotal > 0
        ? { topicsTotal, topicsDone, questionsTotal, questionsAnswered, correctAnswers, lastAccessedAt }
        : undefined;

    return { ...mapPackRow(pack), studentIds: [studentId], progress: packProgress };
  });
}

/** Admin: packs assigned to a specific student (all statuses) */
export async function getPacksForStudent(studentId: string): Promise<StudyPack[]> {
  if (!SUPABASE_CONFIGURED) {
    return mockStudyPacks.filter((p) => p.studentIds.includes(studentId));
  }

  const supabase = await db();

  const assignmentsResult = await supabase
    .from("student_packs")
    .select("*")
    .eq("student_id", studentId);

  const assignments = assignmentsResult.data as StudentPackRow[] | null;
  if (!assignments?.length) return [];

  const packIds = assignments.map((a) => a.pack_id);

  const packsResult = await supabase
    .from("study_packs")
    .select("*")
    .in("id", packIds)
    .order("exam_date");

  return ((packsResult.data as StudyPackRow[] | null) ?? []).map((p) => ({
    ...mapPackRow(p),
    studentIds: [studentId],
  }));
}
