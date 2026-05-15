"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function setNewPassword(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!password || password.length < 6) return { error: "A senha deve ter pelo menos 6 caracteres." };
  if (password !== confirm) return { error: "As senhas não coincidem." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/login?msg=senha_atualizada");
}
