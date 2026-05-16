"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/auth";
import {
  validateStudyPack,
  mapToDbRows,
  type StudyPackFile,
} from "@/lib/ai/import-studypack";
import type { StudyPackRow } from "@/lib/database.types";

export interface ImportResult {
  packId?: string;
  error?: string;
  warnings?: string[];
}

export async function importStudyPackAction(
  formData: FormData
): Promise<ImportResult> {
  // ── 1. Read the uploaded JSON file ──────────────────────────────────────────
  const file = formData.get("file") as File | null;
  const pasteText = formData.get("paste") as string | null;

  let rawText: string;

  if (file && file.size > 0) {
    try {
      rawText = await file.text();
    } catch {
      return { error: "Não foi possível ler o arquivo enviado." };
    }
  } else if (pasteText && pasteText.trim()) {
    rawText = pasteText.trim();
  } else {
    return { error: "Nenhum arquivo ou texto JSON enviado." };
  }

  // ── 2. Parse JSON ────────────────────────────────────────────────────────────
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { error: "O conteúdo enviado não é um JSON válido." };
  }

  // ── 3. Validate ──────────────────────────────────────────────────────────────
  const validation = validateStudyPack(parsed);
  if (validation.errors.length > 0) {
    return {
      error: `Validação falhou com ${validation.errors.length} erro(s): ${validation.errors[0]}`,
    };
  }

  const studyPackFile = parsed as StudyPackFile;

  // ── 4. Create study_pack row ─────────────────────────────────────────────────
  const supabase = createAdminClient();
  const profile = await getCurrentProfile();
  const adminId = profile?.id ?? null;

  const meta = studyPackFile.metadata;

  const packResult = await supabase
    .from("study_packs")
    .insert({
      title: meta.title,
      subject: meta.subject,
      grade: meta.schoolLevel,
      exam_name: "",
      exam_date: meta.examDate ?? new Date().toISOString().slice(0, 10),
      status: "draft",
      created_by: adminId,
      feedback_mode: "immediate",
    } as never)
    .select("id")
    .single();

  const pack = packResult.data as Pick<StudyPackRow, "id"> | null;
  if (!pack) {
    return { error: "Erro ao criar pacote no banco de dados." };
  }

  const packId = pack.id;

  // ── 5. Map and insert topics + exercises ─────────────────────────────────────
  const { topics: mappedTopics, exercises: mappedExercises } = mapToDbRows(
    studyPackFile,
    packId
  );

  // topicSourceId → DB topic id
  const topicIdMap = new Map<string, string>();

  for (const topic of mappedTopics) {
    const { _sourceId, ...topicInsert } = topic;

    const topicResult = await supabase
      .from("topics")
      .insert(topicInsert as never)
      .select("id")
      .single();

    const topicRow = topicResult.data as { id: string } | null;
    if (topicRow) {
      topicIdMap.set(_sourceId, topicRow.id);
    }
  }

  // Insert exercises in batches per topic
  const exercisesToInsert = mappedExercises
    .map(({ _sourceTopicId, ...rest }) => {
      const resolvedTopicId = topicIdMap.get(_sourceTopicId);
      if (!resolvedTopicId) return null;
      return { ...rest, topic_id: resolvedTopicId };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  if (exercisesToInsert.length > 0) {
    await supabase
      .from("exercises")
      .insert(exercisesToInsert as never);
  }

  // ── 6. Update pack counts ────────────────────────────────────────────────────
  await supabase
    .from("study_packs")
    .update({
      topics_count: mappedTopics.length,
      questions_count: exercisesToInsert.length,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", packId);

  return {
    packId,
    warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
  };
}

/** Server action called from the "Importar" button — does the import and redirects. */
export async function importAndRedirectAction(
  formData: FormData
): Promise<void> {
  const result = await importStudyPackAction(formData);
  if (result.packId) {
    redirect(`/pacotes/${result.packId}/editar`);
  }
}
