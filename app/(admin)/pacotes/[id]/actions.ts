"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";

export async function setPackStatusAction(
  packId: string,
  status: "published" | "draft" | "archived"
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("study_packs")
    .update({ status, updated_at: new Date().toISOString() } as never)
    .eq("id", packId);

  if (error) return { error: error.message };

  revalidatePath(`/pacotes/${packId}`);
  revalidatePath("/pacotes");
  return {};
}

export async function deletePackAction(packId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("study_packs").delete().eq("id", packId);
  revalidatePath("/pacotes");
  redirect("/pacotes");
}
