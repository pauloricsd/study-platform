import { SUPABASE_CONFIGURED } from "./utils";
import type { GroupRow, GroupMemberRow, ProfileRow, StudyPackRow } from "@/lib/database.types";

async function db() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

export interface GroupWithCounts extends GroupRow {
  memberCount: number;
  packCount: number;
}

export interface GroupDetail extends GroupRow {
  members: (GroupMemberRow & { profile: ProfileRow })[];
  assignedPacks: StudyPackRow[];
}

export async function getGroups(adminId: string): Promise<GroupWithCounts[]> {
  if (!SUPABASE_CONFIGURED) return [];
  const supabase = await db();

  const { data: groups, error } = await supabase
    .from("groups")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error || !groups) return [];

  const counts = await Promise.all(
    groups.map(async (g) => {
      const [{ count: memberCount }, { count: packCount }] = await Promise.all([
        supabase.from("group_members").select("*", { count: "exact", head: true }).eq("group_id", g.id).eq("status", "active"),
        supabase.from("group_assignments").select("*", { count: "exact", head: true }).eq("group_id", g.id),
      ]);
      return { ...g, memberCount: memberCount ?? 0, packCount: packCount ?? 0 };
    })
  );

  return counts;
}

export async function getGroupDetail(groupId: string): Promise<GroupDetail | null> {
  if (!SUPABASE_CONFIGURED) return null;
  const supabase = await db();

  const { data: group } = await supabase.from("groups").select("*").eq("id", groupId).single();
  if (!group) return null;

  const [{ data: memberRows }, { data: assignmentRows }] = await Promise.all([
    supabase.from("group_members").select("*").eq("group_id", groupId).eq("status", "active"),
    supabase.from("group_assignments").select("pack_id").eq("group_id", groupId),
  ]);

  const memberIds = (memberRows ?? []).map((m) => m.student_id);
  const packIds = (assignmentRows ?? []).map((a) => a.pack_id);

  const [{ data: profiles }, { data: packs }] = await Promise.all([
    memberIds.length ? supabase.from("profiles").select("*").in("id", memberIds) : Promise.resolve({ data: [] }),
    packIds.length ? supabase.from("study_packs").select("*").in("id", packIds) : Promise.resolve({ data: [] }),
  ]);

  const members = (memberRows ?? []).map((m) => ({
    ...m,
    profile: (profiles ?? []).find((p) => p.id === m.student_id)!,
  })).filter((m) => m.profile);

  return { ...group, members, assignedPacks: packs ?? [] };
}

export async function createGroup(
  adminId: string,
  data: {
    name: string;
    type: GroupRow["type"];
    description?: string;
    school_name?: string;
    grade?: string;
    subject?: string;
    tags?: string[];
  }
): Promise<GroupRow | null> {
  if (!SUPABASE_CONFIGURED) return null;
  const supabase = await db();

  const { data: group, error } = await supabase
    .from("groups")
    .insert({ ...data, created_by: adminId })
    .select()
    .single();

  if (error || !group) return null;

  // auto-add creator as group admin
  await supabase.from("group_admins").insert({ group_id: group.id, admin_id: adminId });

  return group;
}

export async function updateGroup(
  groupId: string,
  data: Partial<Pick<GroupRow, "name" | "description" | "type" | "school_name" | "grade" | "subject" | "tags" | "status">>
): Promise<{ error?: string }> {
  if (!SUPABASE_CONFIGURED) return {};
  const supabase = await db();
  const { error } = await supabase
    .from("groups")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", groupId);
  return error ? { error: error.message } : {};
}

export async function removeMember(groupId: string, studentId: string): Promise<{ error?: string }> {
  if (!SUPABASE_CONFIGURED) return {};
  const supabase = await db();
  const { error } = await supabase
    .from("group_members")
    .update({ status: "inactive" })
    .eq("group_id", groupId)
    .eq("student_id", studentId);
  return error ? { error: error.message } : {};
}
