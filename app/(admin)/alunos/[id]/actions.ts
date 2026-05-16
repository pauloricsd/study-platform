"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

export async function assignPackToStudentAction(
  studentId: string,
  packId: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("student_packs")
    .upsert({ student_id: studentId, pack_id: packId } as never);

  if (error) return { error: error.message };
  revalidatePath(`/alunos/${studentId}`);
  return {};
}

export async function unassignPackFromStudentAction(
  studentId: string,
  packId: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("student_packs")
    .delete()
    .eq("student_id", studentId)
    .eq("pack_id", packId);

  if (error) return { error: error.message };
  revalidatePath(`/alunos/${studentId}`);
  return {};
}
