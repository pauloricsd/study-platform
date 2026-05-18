"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { validateCPF } from "@/lib/cpf";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
];

function computeAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export async function signup(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const name     = (formData.get("name")     as string)?.trim();
  const email    =  formData.get("email")    as string;
  const password =  formData.get("password") as string;
  const rawRole  =  formData.get("role")     as string;
  const redirectTo = (formData.get("redirect") as string) || "";

  const role: "student" | "teacher" | "admin" =
    rawRole === "student" ? "student" :
    rawRole === "teacher" ? "teacher" :
    "admin";

  if (!name || !email || !password) {
    return { error: "Preencha todos os campos." };
  }
  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  // ── Teacher-specific server-side validation ─────────────────────────────
  if (role === "teacher") {
    const birthdate = (formData.get("birthdate") as string)?.trim();
    const cpf       = (formData.get("cpf")       as string)?.trim() ?? "";

    if (!birthdate) {
      return { error: "Data de nascimento é obrigatória para professores." };
    }
    if (computeAge(birthdate) < 18) {
      return { error: "É necessário ter 18 anos ou mais para criar uma conta de professor." };
    }
    if (!cpf || !validateCPF(cpf)) {
      return { error: "CPF inválido." };
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role, name } },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Este e-mail já está cadastrado." };
    }
    return { error: error.message };
  }

  if (data.user) {
    const initials = getInitials(name);
    const color    = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const profileUpdate: Record<string, unknown> = {
      avatar_initials: initials,
      avatar_color:    color,
      roles:           [role],
    };

    // Save teacher-specific fields
    const birthdate = (formData.get("birthdate") as string)?.trim();
    const cpf       = (formData.get("cpf")       as string)?.trim();
    if (birthdate) profileUpdate.birthdate = birthdate;
    if (cpf)       profileUpdate.cpf       = cpf.replace(/\D/g, ""); // store digits only

    await supabase
      .from("profiles")
      .update(profileUpdate as never)
      .eq("id", data.user.id);
  }

  // Email confirmation required
  if (!data.session) {
    const confirmUrl = redirectTo
      ? `/cadastro/confirmar?redirect=${encodeURIComponent(redirectTo)}`
      : "/cadastro/confirmar";
    redirect(confirmUrl);
  }

  redirect(redirectTo || (role === "student" ? "/estudar" : "/"));
}
