"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { validateCPF } from "@/lib/cpf";

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
  const next    = formData.get("next")    as string;
  const confirm = formData.get("confirm") as string;

  if (!current || !next || !confirm) return { error: "Preencha todos os campos." };
  if (next.length < 6)               return { error: "A nova senha deve ter pelo menos 6 caracteres." };
  if (next !== confirm)              return { error: "As senhas não coincidem." };

  const supabase = await createClient();
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

function computeAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export async function activateRole(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const targetRole = (formData.get("target_role") as string)?.trim();
  if (!targetRole) return { error: "Perfil inválido." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  // Fetch current profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("roles, birthdate, cpf")
    .eq("id", user.id)
    .single();

  const currentRoles: string[] = (profile?.roles as string[] | null) ?? [];

  if (currentRoles.includes(targetRole)) {
    return { error: "Você já possui este perfil." };
  }

  const profileUpdate: Record<string, unknown> = {
    roles: [...currentRoles, targetRole],
  };

  // ── Teacher-specific validation ────────────────────────────────────────
  if (targetRole === "teacher") {
    const birthdateInput = (formData.get("birthdate") as string)?.trim();
    const cpfInput       = (formData.get("cpf")       as string)?.trim();

    const birthdate = birthdateInput || (profile?.birthdate as string | null);
    const cpfRaw    = cpfInput       || (profile?.cpf       as string | null);

    if (!birthdate) {
      return { error: "Data de nascimento é obrigatória." };
    }
    if (computeAge(birthdate) < 18) {
      return { error: "É necessário ter 18 anos ou mais para ativar o perfil de professor." };
    }
    if (!cpfRaw || !validateCPF(cpfRaw)) {
      return { error: "CPF inválido." };
    }

    if (birthdateInput) profileUpdate.birthdate = birthdateInput;
    if (cpfInput)       profileUpdate.cpf       = cpfInput.replace(/\D/g, "");
  }

  const { error } = await supabase
    .from("profiles")
    .update(profileUpdate as never)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/configuracoes");
  return { success: true };
}
