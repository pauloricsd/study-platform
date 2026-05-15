"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

export async function archivePackAction(packId: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("study_packs")
    .update({ status: "archived", updated_at: new Date().toISOString() } as never)
    .eq("id", packId);

  if (error) return { error: error.message };
  revalidatePath("/pacotes");
  revalidatePath(`/pacotes/${packId}`);
  return {};
}

export async function restorePackAction(packId: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("study_packs")
    .update({ status: "draft", updated_at: new Date().toISOString() } as never)
    .eq("id", packId);

  if (error) return { error: error.message };
  revalidatePath("/pacotes");
  return {};
}

export async function deletePackPermanentlyAction(packId: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("study_packs").delete().eq("id", packId);

  if (error) return { error: error.message };
  revalidatePath("/pacotes");
  return {};
}
