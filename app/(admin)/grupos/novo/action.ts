"use server";

import { getCurrentProfile } from "@/lib/data/auth";
import { createGroup } from "@/lib/data/groups";
import { revalidatePath } from "next/cache";
import type { GroupRow } from "@/lib/database.types";

export default async function createGroupServerAction(
  formData: FormData
): Promise<{ id?: string; error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Não autenticado." };

  const name = formData.get("name") as string;
  const type = (formData.get("type") as GroupRow["type"]) ?? "custom";
  const description = (formData.get("description") as string) || undefined;
  const school_name = (formData.get("school_name") as string) || undefined;
  const grade = (formData.get("grade") as string) || undefined;
  const subject = (formData.get("subject") as string) || undefined;

  if (!name?.trim()) return { error: "Nome do grupo é obrigatório." };

  const group = await createGroup(profile.id, { name: name.trim(), type, description, school_name, grade, subject });
  if (!group) return { error: "Erro ao criar grupo. Tente novamente." };

  revalidatePath("/grupos");
  return { id: group.id };
}
