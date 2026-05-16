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

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export interface CreateStudentResult {
  error?: string;
  /** The generated login hint shown to the admin after creation */
  loginEmail?: string;
}

export async function createStudent(
  formData: FormData
): Promise<CreateStudentResult> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const grade = (formData.get("grade") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!name) return { error: "Nome é obrigatório." };
  if (password.length < 6) return { error: "Senha precisa ter pelo menos 6 caracteres." };

  const supabase = createAdminClient();

  // Build a fake-but-unique email so Supabase Auth is happy
  const slug = slugify(name);
  const suffix = Math.random().toString(36).slice(2, 7);
  const email = `${slug}.${suffix}@sia.local`;

  // 1. Create Auth user (no email confirmation required)
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skip confirmation flow
    });

  if (authError || !authData.user) {
    return { error: authError?.message ?? "Erro ao criar usuário." };
  }

  const userId = authData.user.id;

  // 2. Insert profile row
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    role: "student",
    name,
    grade: grade || null,
    avatar_initials: initials(name),
    avatar_color: randomColor(),
    can_switch_role: false,
  } as never);

  if (profileError) {
    // Best-effort cleanup of the auth user
    await supabase.auth.admin.deleteUser(userId);
    return { error: profileError.message };
  }

  revalidatePath("/alunos");
  return { loginEmail: email };
}
