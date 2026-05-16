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
  canSwitchRole?: boolean;
  isOperational?: boolean;
}

async function db() {
  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!SUPABASE_CONFIGURED) {
    // Mock: use the first mock student's ID so student-page queries return data
    const s = mockStudents[0];
    return {
      id: s.id,
      role: "admin",
      name: s.name,
      grade: s.grade,
      avatarInitials: s.avatarInitials,
      avatarColor: s.color,
      canSwitchRole: true, // always allow switching in mock/dev mode
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
    canSwitchRole: data.can_switch_role ?? false,
    isOperational: data.is_operational ?? false,
  };
}
