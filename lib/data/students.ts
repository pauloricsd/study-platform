import { SUPABASE_CONFIGURED } from "./utils";
import { mockStudents, type Student } from "@/lib/mock-data";
import type { ProfileRow } from "@/lib/database.types";

function mapProfile(row: ProfileRow): Student {
  return {
    id: row.id,
    name: row.name,
    grade: row.grade ?? "",
    avatarInitials: row.avatar_initials ?? row.name.slice(0, 2).toUpperCase(),
    color: row.avatar_color ?? "bg-slate-100 text-slate-700",
  };
}

async function db() {
  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}

export async function getStudents(): Promise<Student[]> {
  if (!SUPABASE_CONFIGURED) return mockStudents;

  const supabase = await db();
  const result = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("name");

  return ((result.data as ProfileRow[] | null) ?? []).map(mapProfile);
}

export async function getStudentById(id: string): Promise<Student | null> {
  if (!SUPABASE_CONFIGURED) {
    return mockStudents.find((s) => s.id === id) ?? null;
  }

  const supabase = await db();
  const result = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "student")
    .single();

  const data = result.data as ProfileRow | null;
  return data ? mapProfile(data) : null;
}
