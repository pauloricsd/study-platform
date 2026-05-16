import { SUPABASE_CONFIGURED } from "./utils";
import { mockStudents, type Student } from "@/lib/mock-data";
import type { ProfileRow } from "@/lib/database.types";

function mapProfile(row: ProfileRow, loginEmail?: string): Student {
  return {
    id: row.id,
    name: row.name,
    grade: row.grade ?? "",
    avatarInitials: row.avatar_initials ?? row.name.slice(0, 2).toUpperCase(),
    color: row.avatar_color ?? "bg-slate-100 text-slate-700",
    loginEmail,
  };
}

async function db() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

export async function getStudents(): Promise<Student[]> {
  if (!SUPABASE_CONFIGURED) return mockStudents;

  const supabase = await db();
  const result = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("name");

  return ((result.data as ProfileRow[] | null) ?? []).map((row) => mapProfile(row));
}

export async function getStudentById(id: string): Promise<Student | null> {
  if (!SUPABASE_CONFIGURED) {
    return mockStudents.find((s) => s.id === id) ?? null;
  }

  const supabase = await db();
  const [profileResult, authResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("role", "student")
      .single(),
    supabase.auth.admin.getUserById(id),
  ]);

  const data = profileResult.data as ProfileRow | null;
  if (!data) return null;

  const email = authResult.data?.user?.email;
  // Only expose the email if it's the internal @sia.local domain (no-email flow)
  const loginEmail = email?.endsWith("@sia.local") ? email : undefined;

  return mapProfile(data, loginEmail);
}
