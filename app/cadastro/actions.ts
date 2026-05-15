"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

export async function signup(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const name = (formData.get("name") as string)?.trim();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) === "student" ? "student" : "admin";
  const redirectTo = (formData.get("redirect") as string) || "";

  if (!name || !email || !password) {
    return { error: "Preencha todos os campos." };
  }
  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
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
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    await supabase
      .from("profiles")
      .update({ avatar_initials: initials, avatar_color: color } as never)
      .eq("id", data.user.id);
  }

  // Email confirmation required
  if (!data.session) {
    const confirmUrl = redirectTo
      ? `/cadastro/confirmar?redirect=${encodeURIComponent(redirectTo)}`
      : "/cadastro/confirmar";
    redirect(confirmUrl);
  }

  // Logged in immediately — go to redirect target or default home
  redirect(redirectTo || (role === "student" ? "/estudar" : "/"));
}
