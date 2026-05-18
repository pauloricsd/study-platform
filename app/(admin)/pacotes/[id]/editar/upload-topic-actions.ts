"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { processPdfText, type GeneratedTopic } from "@/lib/ai/process-pdf";

// ─── Step 1: Extract text + call AI ─────────────────────────────────────────
// Called from dialog after the user drops a file. Does NOT write to the DB.
export async function processUploadedPdfAction(
  packId: string,
  subject: string,
  grade: string,
  examName: string,
  formData: FormData
): Promise<{ topics: GeneratedTopic[] } | { error: string }> {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "Nenhum arquivo enviado." };
  if (file.size > 20 * 1024 * 1024) return { error: "Arquivo muito grande. Limite: 20 MB." };

  // Upload to storage (non-fatal — just for record-keeping)
  try {
    const supabase = createAdminClient();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const storagePath = `${packId}/edit-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("source-files")
      .upload(storagePath, buffer, { contentType: "application/pdf", upsert: true });

    if (!uploadError) {
      await supabase.from("source_files").insert({
        pack_id: packId,
        file_name: file.name,
        file_size: file.size,
        storage_path: storagePath,
        processing_status: "processing",
      } as never);
    }
  } catch {
    // Non-fatal — continue
  }

  // Extract text
  let extractedText = "";
  try {
    const arrayBuffer = await file.arrayBuffer();
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
    const { text } = await extractText(pdf, { mergePages: true });
    extractedText = text;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Erro ao ler o PDF: ${msg}` };
  }

  if (!extractedText.trim()) {
    return { error: "O PDF não contém texto extraível. Use um PDF textual, não escaneado." };
  }

  // Process with AI
  try {
    const topics = await processPdfText(extractedText, { subject, grade, examName });
    return { topics };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { error: `Erro ao processar com IA: ${msg}` };
  }
}

// ─── Step 2a: Add new topic(s) to an existing pack ─────────────────────────
export async function saveNewTopicsAction(
  packId: string,
  topics: GeneratedTopic[],
  topicTitles: Record<number, string>,
  selectedIndices: number[]
): Promise<{ error?: string }> {
  if (!selectedIndices.length) return { error: "Nenhum tópico selecionado." };

  const supabase = createAdminClient();

  // Find current max order
  const { data: existing } = await supabase
    .from("topics")
    .select("order")
    .eq("pack_id", packId)
    .order("order", { ascending: false })
    .limit(1);

  let nextOrder = ((existing as { order: number }[] | null)?.[0]?.order ?? -1) + 1;
  let addedQuestions = 0;

  for (const idx of selectedIndices) {
    const t = { ...topics[idx], title: topicTitles[idx] ?? topics[idx].title };

    const topicResult = await supabase
      .from("topics")
      .insert({ pack_id: packId, title: t.title, summary: t.summary, order: nextOrder++ } as never)
      .select("id")
      .single();

    const topicRow = topicResult.data as { id: string } | null;
    if (!topicRow) continue;
    const topicId = topicRow.id;

    if (t.sections.length) {
      await supabase.from("sections").insert(
        t.sections.map((s, si) => ({
          topic_id: topicId, type: s.type, title: s.title ?? null,
          content: s.content, order: si,
        })) as never
      );
    }

    if (t.exercises.length) {
      await supabase.from("exercises").insert(
        t.exercises.map((e, ei) => ({
          topic_id: topicId, type: e.type, statement: e.statement,
          choices: e.choices ?? null, correct_answer: e.correctAnswer,
          explanation: e.explanation, order: ei,
        })) as never
      );
      addedQuestions += t.exercises.length;
    }
  }

  // Increment pack counts
  const { data: packData } = await supabase
    .from("study_packs")
    .select("topics_count, questions_count")
    .eq("id", packId)
    .single();

  const row = packData as { topics_count: number; questions_count: number } | null;
  await supabase.from("study_packs").update({
    topics_count:    (row?.topics_count    ?? 0) + selectedIndices.length,
    questions_count: (row?.questions_count ?? 0) + addedQuestions,
    updated_at: new Date().toISOString(),
  } as never).eq("id", packId);

  revalidatePath(`/pacotes/${packId}`);
  revalidatePath(`/pacotes/${packId}/editar`);
  return {};
}

// ─── Step 2b: Replace an existing topic's content ───────────────────────────
export async function replaceTopicAction(
  packId: string,
  topicId: string,
  topic: GeneratedTopic,
  newTitle: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  // Update topic title + summary
  await supabase
    .from("topics")
    .update({ title: newTitle, summary: topic.summary } as never)
    .eq("id", topicId);

  // Delete old sections + exercises
  await supabase.from("sections").delete().eq("topic_id", topicId);
  await supabase.from("exercises").delete().eq("topic_id", topicId);

  // Insert new sections
  if (topic.sections.length) {
    await supabase.from("sections").insert(
      topic.sections.map((s, i) => ({
        topic_id: topicId, type: s.type, title: s.title ?? null,
        content: s.content, order: i,
      })) as never
    );
  }

  // Insert new exercises
  if (topic.exercises.length) {
    await supabase.from("exercises").insert(
      topic.exercises.map((e, i) => ({
        topic_id: topicId, type: e.type, statement: e.statement,
        choices: e.choices ?? null, correct_answer: e.correctAnswer,
        explanation: e.explanation, order: i,
      })) as never
    );
  }

  // Update pack questions_count
  const { data: allTopics } = await supabase
    .from("topics")
    .select("id")
    .eq("pack_id", packId);

  const topicIds = (allTopics as { id: string }[] | null)?.map((t) => t.id) ?? [];

  const { count } = await supabase
    .from("exercises")
    .select("id", { count: "exact", head: true })
    .in("topic_id", topicIds);

  await supabase.from("study_packs").update({
    questions_count: count ?? 0,
    updated_at: new Date().toISOString(),
  } as never).eq("id", packId);

  revalidatePath(`/pacotes/${packId}`);
  revalidatePath(`/pacotes/${packId}/editar`);
  return {};
}
