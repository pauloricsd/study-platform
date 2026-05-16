import { createAdminClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OverviewMetrics {
  // Usuários
  totalUsers: number;
  totalAdmins: number;
  totalStudents: number;
  totalOperational: number;

  // Conteúdo
  totalPacks: number;
  publishedPacks: number;
  draftPacks: number;
  totalTopics: number;
  totalExercises: number;
  totalSections: number;

  // Atividade
  totalResponses: number;
  totalTopicProgress: number;
  totalUploads: number;

  // Tutor IA
  totalTutorSessions: number;
  totalTutorMessages: number;
  totalSafetyEvents: number;
  blockedDirectAnswers: number;
  studyModeSessions: number;
  exerciseModeSessions: number;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  const supabase = createAdminClient();

  const [
    profilesResult,
    packsResult,
    topicsCount,
    exercisesCount,
    sectionsCount,
    responsesCount,
    progressCount,
    uploadsCount,
    tutorSessionsResult,
    tutorMessagesCount,
    safetyEventsCount,
    blockedCount,
  ] = await Promise.all([
    supabase.from("profiles").select("role, is_operational"),
    supabase.from("study_packs").select("status"),
    supabase.from("topics").select("*", { count: "exact", head: true }),
    supabase.from("exercises").select("*", { count: "exact", head: true }),
    supabase.from("sections").select("*", { count: "exact", head: true }),
    supabase.from("exercise_responses").select("*", { count: "exact", head: true }),
    supabase.from("topic_progress").select("*", { count: "exact", head: true }),
    supabase.from("source_files").select("*", { count: "exact", head: true }),
    supabase.from("tutor_sessions").select("mode"),
    supabase.from("tutor_messages").select("*", { count: "exact", head: true }),
    supabase.from("tutor_safety_events").select("*", { count: "exact", head: true }),
    supabase
      .from("tutor_messages")
      .select("*", { count: "exact", head: true })
      .eq("direct_answer_blocked", true),
  ]);

  const profiles = (profilesResult.data ?? []) as Array<{
    role: string;
    is_operational: boolean | null;
  }>;
  const packs = (packsResult.data ?? []) as Array<{ status: string }>;
  const tutorSessions = (tutorSessionsResult.data ?? []) as Array<{ mode: string }>;

  return {
    // Usuários
    totalUsers: profiles.length,
    totalAdmins: profiles.filter((p) => p.role === "admin").length,
    totalStudents: profiles.filter((p) => p.role === "student").length,
    totalOperational: profiles.filter((p) => p.is_operational).length,

    // Conteúdo
    totalPacks: packs.length,
    publishedPacks: packs.filter((p) => p.status === "published").length,
    draftPacks: packs.filter((p) => p.status === "draft").length,
    totalTopics: topicsCount.count ?? 0,
    totalExercises: exercisesCount.count ?? 0,
    totalSections: sectionsCount.count ?? 0,

    // Atividade
    totalResponses: responsesCount.count ?? 0,
    totalTopicProgress: progressCount.count ?? 0,
    totalUploads: uploadsCount.count ?? 0,

    // Tutor IA
    totalTutorSessions: tutorSessions.length,
    totalTutorMessages: tutorMessagesCount.count ?? 0,
    totalSafetyEvents: safetyEventsCount.count ?? 0,
    blockedDirectAnswers: blockedCount.count ?? 0,
    studyModeSessions: tutorSessions.filter((s) => s.mode === "study").length,
    exerciseModeSessions: tutorSessions.filter((s) => s.mode === "exercise").length,
  };
}
