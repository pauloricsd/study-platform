"use server";

import { getCurrentProfile } from "@/lib/data/auth";
import { callTutorAI, type TutorContext, type TutorSection } from "@/lib/ai/tutor";
import {
  getOrCreateTutorSession,
  getTutorMessages,
  saveTutorMessage,
  saveTutorSafetyEvent,
} from "@/lib/data/tutor";
import { createAdminClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SendTutorMessageInput {
  packId: string;
  topicId: string;
  mode: "study" | "exercise";
  message: string;
  // Exercise-specific (when mode = "exercise")
  exerciseId?: string | null;
  exerciseStatement?: string;
  exerciseType?: string;
  studentAnswer?: string | null;
  answerState?: string;
  attemptNumber?: number;
  previousFeedback?: string;
}

export interface SendTutorMessageResult {
  content: string;
  confidence: string;
  directAnswerBlocked: boolean;
  error?: string;
}

// ─── Server action ─────────────────────────────────────────────────────────────

export async function sendTutorMessage(
  input: SendTutorMessageInput
): Promise<SendTutorMessageResult> {
  const profile = await getCurrentProfile();

  if (!profile) {
    return {
      content: "Você precisa estar autenticado para usar o Tutor IA.",
      confidence: "insufficient_information",
      directAnswerBlocked: false,
      error: "unauthenticated",
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      content: "O Tutor IA não está disponível no momento.",
      confidence: "insufficient_information",
      directAnswerBlocked: false,
      error: "no_api_key",
    };
  }

  const supabase = createAdminClient();

  // Fetch topic + sections + pack in parallel
  const [topicResult, packResult] = await Promise.all([
    supabase
      .from("topics")
      .select("title, summary, sections(type, title, content)")
      .eq("id", input.topicId)
      .single(),
    supabase
      .from("study_packs")
      .select("title, subject, grade")
      .eq("id", input.packId)
      .single(),
  ]);

  type TopicRow = {
    title: string;
    summary: string | null;
    sections: Array<{ type: string; title: string | null; content: string }>;
  };
  type PackRow = { title: string; subject: string; grade: string | null };

  const topic = topicResult.data as TopicRow | null;
  const pack = packResult.data as PackRow | null;

  // Build context object for the AI
  const ctx: TutorContext = {
    packTitle: pack?.title ?? "Pacote de Estudo",
    subject: pack?.subject ?? "",
    grade: pack?.grade ?? "",
    topicTitle: topic?.title ?? "",
    topicSummary: topic?.summary ?? "",
    sections: (topic?.sections ?? []).map(
      (s): TutorSection => ({
        type: s.type,
        title: s.title ?? undefined,
        content: s.content,
      })
    ),
  };

  if (input.mode === "exercise" && input.exerciseStatement) {
    ctx.exercise = {
      statement: input.exerciseStatement,
      type: input.exerciseType ?? "open_short",
      studentAnswer: input.studentAnswer ?? null,
      attemptNumber: input.attemptNumber ?? 1,
      answerState: input.answerState ?? "idle",
      previousFeedback: input.previousFeedback,
    };
  }

  // Get or create session + load conversation history
  const session = await getOrCreateTutorSession({
    studentId: profile.id,
    packId: input.packId,
    topicId: input.topicId,
    exerciseId: input.exerciseId ?? null,
    mode: input.mode,
  });

  const history = session ? await getTutorMessages(session.id) : [];
  const conversationHistory = history.map((m) => ({
    role: m.role === "student" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));

  // Call AI
  const aiResponse = await callTutorAI(ctx, input.mode, conversationHistory, input.message);

  // Persist messages + safety events
  if (session) {
    await saveTutorMessage({
      sessionId: session.id,
      role: "student",
      content: input.message,
    });

    await saveTutorMessage({
      sessionId: session.id,
      role: "assistant",
      content: aiResponse.content,
      confidence: aiResponse.confidence,
      directAnswerBlocked: aiResponse.directAnswerBlocked,
      usedStudyPackContext: aiResponse.usedStudyPackContext,
    });

    if (aiResponse.safetyEvent) {
      await saveTutorSafetyEvent({
        sessionId: session.id,
        type: aiResponse.safetyEvent.type,
        action: aiResponse.safetyEvent.action,
        studentMessage: input.message,
      });
    }
  }

  return {
    content: aiResponse.content,
    confidence: aiResponse.confidence,
    directAnswerBlocked: aiResponse.directAnswerBlocked,
  };
}
