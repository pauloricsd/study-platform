import { SUPABASE_CONFIGURED } from "./utils";
import { mockStudents } from "@/lib/mock-data";
import type { ProfileRow } from "@/lib/database.types";

export interface Profile {
  id: string;
  role: "admin" | "student";
  name: string;
  grade?: string | null;
  avatarInitials?: string | null;
  avatarColor?: string | null;
}

async function db() {
  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!SUPABASE_CONFIGURED) {
    const s = mockStudents[0];
    return {
      id: s.id,
      role: "student",
      name: s.name,
      grade: s.grade,
      avatarInitials: s.avatarInitials,
      avatarColor: s.color,
    };
  }

  const supabase = await db();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const result = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const data = result.data as ProfileRow | null;
  if (!data) return null;

  return {
    id: data.id,
    role: data.role,
    name: data.name,
    grade: data.grade,
    avatarInitials: data.avatar_initials,
    avatarColor: data.avatar_color,
  };
}
