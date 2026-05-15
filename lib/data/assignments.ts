import { SUPABASE_CONFIGURED } from "./utils";

async function db() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

export async function assignPackToGroup(
  groupId: string,
  packId: string,
  assignedBy: string
): Promise<{ error?: string }> {
  if (!SUPABASE_CONFIGURED) return {};
  const supabase = await db();

  // record the group-level assignment
  const { error } = await supabase
    .from("group_assignments")
    .upsert({ group_id: groupId, pack_id: packId, assigned_by: assignedBy });
  if (error) return { error: error.message };

  // propagate to all current active members
  const { data: members } = await supabase
    .from("group_members")
    .select("student_id")
    .eq("group_id", groupId)
    .eq("status", "active");

  if (members && members.length > 0) {
    await supabase
      .from("student_packs")
      .upsert(members.map((m) => ({ student_id: m.student_id, pack_id: packId })));
  }

  return {};
}

export async function unassignPackFromGroup(
  groupId: string,
  packId: string
): Promise<{ error?: string }> {
  if (!SUPABASE_CONFIGURED) return {};
  const supabase = await db();
  const { error } = await supabase
    .from("group_assignments")
    .delete()
    .eq("group_id", groupId)
    .eq("pack_id", packId);
  return error ? { error: error.message } : {};
}

export async function getPublishedPacksNotInGroup(groupId: string) {
  if (!SUPABASE_CONFIGURED) return [];
  const supabase = await db();

  const { data: assigned } = await supabase
    .from("group_assignments")
    .select("pack_id")
    .eq("group_id", groupId);

  const assignedIds = (assigned ?? []).map((a) => a.pack_id);

  const query = supabase
    .from("study_packs")
    .select("id, title, subject, grade, exam_name")
    .eq("status", "published")
    .order("title");

  if (assignedIds.length > 0) {
    query.not("id", "in", `(${assignedIds.join(",")})`);
  }

  const { data } = await query;
  return data ?? [];
}
