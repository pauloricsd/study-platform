"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

export async function deleteSourceFileAction(
  id: string,
  storagePath: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("source-files")
    .remove([storagePath]);

  if (storageError) return { error: storageError.message };

  // Delete DB row
  const { error: dbError } = await supabase
    .from("source_files")
    .delete()
    .eq("id", id);

  if (dbError) return { error: dbError.message };

  revalidatePath("/materiais");
  return {};
}
