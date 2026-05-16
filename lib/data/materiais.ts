import { SUPABASE_CONFIGURED } from "./utils";
import type { ExerciseRow } from "@/lib/database.types";

export interface SourceFileWithPack {
  id: string;
  fileName: string;
  fileSize: number | null;
  storagePath: string;
  processingStatus: "pending" | "processing" | "done" | "error";
  uploadedAt: string;
  signedUrl: string | null;
  pack: { id: string; title: string; subject: string; status: string; topicsCount: number };
}

export interface ExerciseWithContext {
  id: string;
  type: ExerciseRow["type"];
  statement: string;
  topic: { id: string; title: string };
  pack: { id: string; title: string; subject: string };
}

async function db() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

export async function getSourceFiles(): Promise<SourceFileWithPack[]> {
  if (!SUPABASE_CONFIGURED) return [];

  const supabase = await db();
  const result = await supabase
    .from("source_files")
    .select("*, study_packs(id, title, subject, status, topics(count))")
    .order("uploaded_at", { ascending: false });

  const data = result.data as
    | (Omit<
        {
          id: string;
          pack_id: string;
          file_name: string;
          file_size: number | null;
          storage_path: string;
          processing_status: "pending" | "processing" | "done" | "error";
          uploaded_at: string;
        },
        never
      > & {
        study_packs: {
          id: string;
          title: string;
          subject: string;
          status: string;
          topics: { count: number }[];
        } | null;
      })[]
    | null;

  if (!data) return [];

  const filtered = data.filter((row) => row.study_packs !== null);

  // Batch-generate signed URLs (1 hour expiry)
  const paths = filtered.map((row) => row.storage_path);
  const { data: signedUrlsData } = await supabase.storage
    .from("source-files")
    .createSignedUrls(paths, 3600);

  const signedUrlMap = new Map<string, string>();
  for (const u of signedUrlsData ?? []) {
    if (u.path && u.signedUrl) signedUrlMap.set(u.path, u.signedUrl);
  }

  return filtered.map((row) => {
    const pack = row.study_packs!;
    const topicsCount = (pack.topics as unknown as { count: number }[] | null)?.[0]?.count ?? 0;
    return {
      id: row.id,
      fileName: row.file_name,
      fileSize: row.file_size,
      storagePath: row.storage_path,
      processingStatus: row.processing_status,
      uploadedAt: row.uploaded_at,
      signedUrl: signedUrlMap.get(row.storage_path) ?? null,
      pack: {
        id: pack.id,
        title: pack.title,
        subject: pack.subject,
        status: pack.status,
        topicsCount,
      },
    };
  });
}

export async function getAllExercises(): Promise<ExerciseWithContext[]> {
  if (!SUPABASE_CONFIGURED) return [];

  const supabase = await db();
  const result = await supabase
    .from("exercises")
    .select("*, topics(id, title, pack_id, study_packs(id, title, subject))")
    .order("order");

  const data = result.data as
    | (Pick<ExerciseRow, "id" | "type" | "statement"> & {
        topics: {
          id: string;
          title: string;
          pack_id: string;
          study_packs: { id: string; title: string; subject: string } | null;
        } | null;
      })[]
    | null;

  if (!data) return [];

  return data
    .filter((row) => row.topics !== null && row.topics.study_packs !== null)
    .map((row) => ({
      id: row.id,
      type: row.type,
      statement: row.statement,
      topic: { id: row.topics!.id, title: row.topics!.title },
      pack: row.topics!.study_packs!,
    }));
}
