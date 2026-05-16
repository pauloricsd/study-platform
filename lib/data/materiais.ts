import { SUPABASE_CONFIGURED } from "./utils";
import type { ExerciseRow } from "@/lib/database.types";

export interface SourceFileWithPack {
  id: string;
  fileName: string;
  fileSize: number | null;
  storagePath: string;
  processingStatus: "pending" | "processing" | "done" | "error";
  uploadedAt: string;
  pack: { id: string; title: string; subject: string };
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
    .select("*, study_packs(id, title, subject)")
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
        study_packs: { id: string; title: string; subject: string } | null;
      })[]
    | null;

  if (!data) return [];

  return data
    .filter((row) => row.study_packs !== null)
    .map((row) => ({
      id: row.id,
      fileName: row.file_name,
      fileSize: row.file_size,
      storagePath: row.storage_path,
      processingStatus: row.processing_status,
      uploadedAt: row.uploaded_at,
      pack: row.study_packs!,
    }));
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
