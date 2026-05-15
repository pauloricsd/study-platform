import { SUPABASE_CONFIGURED } from "./utils";
import { mockTopics, mockExercises, type Topic, type Exercise } from "@/lib/mock-topics";
import type { TopicRow, SectionRow, ExerciseRow } from "@/lib/database.types";

async function db() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

function mapSections(sections: SectionRow[]): Topic["sections"] {
  return sections.map((s) => ({
    id: s.id,
    type: s.type as Topic["sections"][number]["type"],
    title: s.title ?? undefined,
    content: s.content,
  }));
}

export async function getTopicsByPack(packId: string): Promise<Topic[]> {
  if (!SUPABASE_CONFIGURED) {
    return mockTopics.filter((t) => t.packId === packId);
  }

  const supabase = await db();
  const result = await supabase
    .from("topics")
    .select("*, sections(*)")
    .eq("pack_id", packId)
    .order("order");

  const data = result.data as (TopicRow & { sections: SectionRow[] })[] | null;
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    packId: row.pack_id,
    title: row.title,
    summary: row.summary ?? "",
    order: row.order ?? 0,
    sections: mapSections(row.sections ?? []),
    exerciseIds: [],
  }));
}

export async function getTopicById(id: string): Promise<Topic | null> {
  if (!SUPABASE_CONFIGURED) {
    return mockTopics.find((t) => t.id === id) ?? null;
  }

  const supabase = await db();
  const result = await supabase
    .from("topics")
    .select("*, sections(*)")
    .eq("id", id)
    .single();

  const data = result.data as (TopicRow & { sections: SectionRow[] }) | null;
  if (!data) return null;

  return {
    id: data.id,
    packId: data.pack_id,
    title: data.title,
    summary: data.summary ?? "",
    order: data.order ?? 0,
    sections: mapSections(data.sections ?? []),
    exerciseIds: [],
  };
}

export async function getExercisesForTopics(topicIds: string[]): Promise<Exercise[]> {
  if (!SUPABASE_CONFIGURED) {
    return mockExercises.filter((e) => topicIds.includes(e.topicId));
  }
  if (!topicIds.length) return [];

  const supabase = await db();
  const result = await supabase
    .from("exercises")
    .select("*")
    .in("topic_id", topicIds)
    .order("order");

  const data = result.data as ExerciseRow[] | null;
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    topicId: row.topic_id,
    type: row.type as Exercise["type"],
    statement: row.statement,
    choices: (row.choices as unknown) as Exercise["choices"] ?? undefined,
    correctAnswer: row.correct_answer,
    explanation: row.explanation,
    order: row.order ?? 0,
  }));
}

export async function getExercisesByTopic(topicId: string): Promise<Exercise[]> {
  if (!SUPABASE_CONFIGURED) {
    return mockExercises.filter((e) => e.topicId === topicId);
  }

  const supabase = await db();
  const result = await supabase
    .from("exercises")
    .select("*")
    .eq("topic_id", topicId)
    .order("order");

  const data = result.data as ExerciseRow[] | null;
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    topicId: row.topic_id,
    type: row.type as Exercise["type"],
    statement: row.statement,
    choices: (row.choices as unknown) as Exercise["choices"] ?? undefined,
    correctAnswer: row.correct_answer,
    explanation: row.explanation,
    order: row.order ?? 0,
  }));
}
