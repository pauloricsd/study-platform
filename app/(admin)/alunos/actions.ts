"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

// Avatar palette — cycling through colours for new students
const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-pink-100 text-pink-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-indigo-100 text-indigo-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export interface CreateStudentResult {
  error?: string;
  loginEmail?: string;
}

export async function createStudent(
  formData: FormData
): Promise<CreateStudentResult> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const grade = (formData.get("grade") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const school = (formData.get("school") as string | null)?.trim() ?? "";
  const birthdate = (formData.get("birthdate") as string | null)?.trim() ?? "";

  if (!name) return { error: "Nome é obrigatório." };
  if (!email) return { error: "E-mail é obrigatório." };
  if (password.length < 6) return { error: "Senha precisa ter pelo menos 6 caracteres." };
  if (!/[a-zA-ZÀ-ÿ]/.test(password)) return { error: "A senha deve conter pelo menos uma letra." };
  if (!/[0-9]/.test(password)) return { error: "A senha deve conter pelo menos um número." };

  const supabase = createAdminClient();

  // 1. Create Auth user with the real email
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skip confirmation — admin is creating the account
    });

  if (authError || !authData.user) {
    // Provide a friendlier message for duplicate email
    const msg = authError?.message ?? "Erro ao criar usuário.";
    if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("exists")) {
      return { error: "Este e-mail já está cadastrado na plataforma." };
    }
    return { error: msg };
  }

  const userId = authData.user.id;

  // 2. Insert profile row
  const profileInsert: Record<string, unknown> = {
    id: userId,
    role: "student",
    name,
    grade: grade || null,
    avatar_initials: initials(name),
    avatar_color: randomColor(),
    can_switch_role: false,
  };

  if (school) profileInsert.school = school;
  if (birthdate) profileInsert.birthdate = birthdate;

  const { error: profileError } = await supabase
    .from("profiles")
    .insert(profileInsert as never);

  if (profileError) {
    // Best-effort cleanup of the auth user
    await supabase.auth.admin.deleteUser(userId);
    return { error: profileError.message };
  }

  revalidatePath("/alunos");
  return { loginEmail: email };
}
