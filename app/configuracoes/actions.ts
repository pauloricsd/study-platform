"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const name = (formData.get("name") as string)?.trim();
  if (!name || name.length < 2) return { error: "Nome deve ter pelo menos 2 caracteres." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { error } = await supabase
    .from("profiles")
    .update({ name } as never)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/configuracoes");
  return { success: true };
}

export async function updatePassword(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const current = formData.get("current") as string;
  const next = formData.get("next") as string;
  const confirm = formData.get("confirm") as string;

  if (!current || !next || !confirm) return { error: "Preencha todos os campos." };
  if (next.length < 6) return { error: "A nova senha deve ter pelo menos 6 caracteres." };
  if (next !== confirm) return { error: "As senhas não coincidem." };

  const supabase = await createClient();

  // Re-authenticate with current password to verify it
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Não autenticado." };

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (signInError) return { error: "Senha atual incorreta." };

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { error: error.message };

  return { success: true };
}
