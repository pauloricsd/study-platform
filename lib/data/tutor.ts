import { SUPABASE_CONFIGURED } from "./utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TutorSession {
  id: string;
  studentId: string;
  packId: string;
  topicId: string;
  exerciseId: string | null;
  mode: "study" | "exercise";
  createdAt: string;
}

export interface TutorMessage {
  id: string;
  sessionId: string;
  role: "student" | "assistant";
  content: string;
  confidence: string | null;
  directAnswerBlocked: boolean;
  createdAt: string;
}

// ─── DB helper ────────────────────────────────────────────────────────────────

async function db() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

// ─── Session management ───────────────────────────────────────────────────────

type SessionRow = {
  id: string;
  student_id: string;
  pack_id: string;
  topic_id: string;
  exercise_id: string | null;
  mode: string;
  created_at: string;
};

function rowToSession(row: SessionRow): TutorSession {
  return {
    id: row.id,
    studentId: row.student_id,
    packId: row.pack_id,
    topicId: row.topic_id,
    exerciseId: row.exercise_id,
    mode: row.mode as "study" | "exercise",
    createdAt: row.created_at,
  };
}

export async function getOrCreateTutorSession(input: {
  studentId: string;
  packId: string;
  topicId: string;
  exerciseId?: string | null;
  mode: "study" | "exercise";
}): Promise<TutorSession | null> {
  if (!SUPABASE_CONFIGURED) return null;

  const supabase = await db();

  // Try to find an existing session
  let query = supabase
    .from("tutor_sessions")
    .select("*")
    .eq("student_id", input.studentId)
    .eq("topic_id", input.topicId)
    .eq("mode", input.mode);

  if (input.exerciseId) {
    query = query.eq("exercise_id", input.exerciseId);
  } else {
    query = query.is("exercise_id", null);
  }

  const { data: existing } = await query.maybeSingle();

  if (existing) return rowToSession(existing as SessionRow);

  // Create new session
  const { data: created, error } = await supabase
    .from("tutor_sessions")
    .insert({
      student_id: input.studentId,
      pack_id: input.packId,
      topic_id: input.topicId,
      exercise_id: input.exerciseId ?? null,
      mode: input.mode,
    } as never)
    .select("*")
    .single();

  if (error || !created) return null;

  return rowToSession(created as SessionRow);
}

// ─── Messages ────────────────────────────────────────────────────────────────

type MessageRow = {
  id: string;
  session_id: string;
  role: string;
  content: string;
  confidence: string | null;
  direct_answer_blocked: boolean | null;
  created_at: string;
};

export async function getTutorMessages(sessionId: string): Promise<TutorMessage[]> {
  if (!SUPABASE_CONFIGURED) return [];

  const supabase = await db();
  const { data } = await supabase
    .from("tutor_messages")
    .select(
      "id, session_id, role, content, confidence, direct_answer_blocked, created_at"
    )
    .eq("session_id", sessionId)
    .order("created_at");

  return ((data ?? []) as MessageRow[]).map((row) => ({
    id: row.id,
    sessionId: row.session_id,
    role: row.role as "student" | "assistant",
    content: row.content,
    confidence: row.confidence,
    directAnswerBlocked: row.direct_answer_blocked ?? false,
    createdAt: row.created_at,
  }));
}

export async function saveTutorMessage(input: {
  sessionId: string;
  role: "student" | "assistant";
  content: string;
  confidence?: string | null;
  directAnswerBlocked?: boolean;
  usedStudyPackContext?: boolean;
}): Promise<void> {
  if (!SUPABASE_CONFIGURED) return;

  const supabase = await db();
  await supabase.from("tutor_messages").insert({
    session_id: input.sessionId,
    role: input.role,
    content: input.content,
    confidence: input.confidence ?? null,
    direct_answer_blocked: input.directAnswerBlocked ?? false,
    used_studypack_context: input.usedStudyPackContext ?? true,
  } as never);
}

// ─── Safety events ────────────────────────────────────────────────────────────

export async function saveTutorSafetyEvent(input: {
  sessionId: string;
  type: string;
  action: string;
  studentMessage: string;
}): Promise<void> {
  if (!SUPABASE_CONFIGURED) return;

  const supabase = await db();
  await supabase.from("tutor_safety_events").insert({
    session_id: input.sessionId,
    type: input.type,
    action: input.action,
    student_message: input.studentMessage,
  } as never);
}
