"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/auth";
import { processPdfText, type GeneratedTopic } from "@/lib/ai/process-pdf";
import type { StudyPackRow, TopicProgressRow } from "@/lib/database.types";

export type { GeneratedTopic };

interface PackFormInput {
  title: string;
  subject: string;
  grade: string;
  examName: string;
  examDate: string;
}

// Step 2→3: upload PDF, extract text, call OpenAI, return topics + packId
export async function processPackAction(formData: FormData): Promise<
  { packId: string; topics: GeneratedTopic[] } | { error: string }
> {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "Nenhum arquivo enviado." };

  const title = formData.get("title") as string;
  const subject = formData.get("subject") as string;
  const grade = formData.get("grade") as string;
  const examName = formData.get("examName") as string;
  const examDate = formData.get("examDate") as string;
  const feedbackModeRaw = formData.get("feedbackMode") as string | null;
  const feedbackMode: "immediate" | "adaptive" =
    feedbackModeRaw === "adaptive" ? "adaptive" : "immediate";

  if (!title || !subject || !grade || !examName) {
    return { error: "Dados do pacote incompletos." };
  }

  const supabase = createAdminClient();
  const profile = await getCurrentProfile();
  const adminId = profile?.id ?? null;

  // 1. Create the pack as 'draft'
  const packResult = await supabase
    .from("study_packs")
    .insert({
      title,
      subject,
      grade,
      exam_name: examName,
      exam_date: examDate || null,
      status: "draft",
      created_by: adminId,
      feedback_mode: feedbackMode,
    } as never)
    .select("id")
    .single();

  const pack = packResult.data as Pick<StudyPackRow, "id"> | null;
  if (!pack) return { error: "Erro ao criar pacote no banco de dados." };

  const packId = pack.id;

  // 2. Upload PDF to Supabase Storage
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);
  const storagePath = `${packId}/${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("source-files")
    .upload(storagePath, fileBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    // Non-fatal: continue even if storage upload fails
    console.error("Storage upload error:", uploadError.message);
  } else {
    // 3. Record the source file
    await supabase
      .from("source_files")
      .insert({
        pack_id: packId,
        file_name: file.name,
        file_size: file.size,
        storage_path: storagePath,
        processing_status: "processing",
      } as never);
  }

  // 4. Extract text from PDF using unpdf (ESM-native, works in Vercel serverless)
  let extractedText = "";
  try {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
    const { text } = await extractText(pdf, { mergePages: true });
    extractedText = text;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("PDF parse error:", msg);
    return { error: `Erro ao ler o PDF: ${msg}` };
  }

  if (!extractedText.trim()) {
    return { error: "O PDF não contém texto extraível. Use um PDF textual, não uma imagem escaneada." };
  }

  // 5. Process with OpenAI
  let topics: GeneratedTopic[];
  try {
    topics = await processPdfText(extractedText, { subject, grade, examName });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { error: `Erro ao processar com IA: ${msg}` };
  }

  // Update source_files status to 'done'
  await supabase
    .from("source_files")
    .update({ processing_status: "done" } as never)
    .eq("pack_id", packId);

  return { packId, topics };
}

// Step 4→5: save topics/sections/exercises to DB, publish pack
export async function publishPackAction(
  packId: string,
  topics: GeneratedTopic[],
  topicTitles: Record<number, string>,
  enabledIndices: number[]
): Promise<{ packId: string } | { error: string }> {
  if (!packId || enabledIndices.length === 0) {
    return { error: "Nenhum tópico selecionado." };
  }

  const supabase = createAdminClient();

  const selectedTopics = enabledIndices.map((i) => ({
    ...topics[i],
    title: topicTitles[i] ?? topics[i].title,
  }));

  let totalQuestions = 0;

  for (let order = 0; order < selectedTopics.length; order++) {
    const t = selectedTopics[order];

    // Insert topic
    const topicResult = await supabase
      .from("topics")
      .insert({
        pack_id: packId,
        title: t.title,
        summary: t.summary,
        order,
      } as never)
      .select("id")
      .single();

    const topicRow = topicResult.data as { id: string } | null;
    if (!topicRow) continue;

    const topicId = topicRow.id;

    // Insert sections
    if (t.sections.length > 0) {
      await supabase
        .from("sections")
        .insert(
          t.sections.map((s, si) => ({
            topic_id: topicId,
            type: s.type,
            title: s.title ?? null,
            content: s.content,
            order: si,
          })) as never
        );
    }

    // Insert exercises
    if (t.exercises.length > 0) {
      await supabase
        .from("exercises")
        .insert(
          t.exercises.map((e, ei) => ({
            topic_id: topicId,
            type: e.type,
            statement: e.statement,
            choices: e.choices ?? null,
            correct_answer: e.correctAnswer,
            explanation: e.explanation,
            order: ei,
          })) as never
        );
      totalQuestions += t.exercises.length;
    }
  }

  // Publish the pack
  await supabase
    .from("study_packs")
    .update({
      status: "published",
      topics_count: selectedTopics.length,
      questions_count: totalQuestions,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", packId);

  return { packId };
}

// Save draft without publishing (step 4 "Salvar rascunho")
export async function saveDraftAction(packId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("study_packs")
    .update({ status: "draft", updated_at: new Date().toISOString() } as never)
    .eq("id", packId);
}
