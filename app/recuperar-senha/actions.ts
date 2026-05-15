"use server";

import { createClient } from "@/lib/supabase/server";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://sia-plataforma.vercel.app";

export async function requestPasswordReset(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const email = (formData.get("email") as string)?.trim();
  if (!email) return { error: "Informe o e-mail." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${APP_URL}/auth/callback?next=/nova-senha`,
  });

  // Always show success to avoid user enumeration
  if (error) console.error("resetPasswordForEmail error:", error.message);

  return { success: true };
}
