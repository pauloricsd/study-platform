import { SUPABASE_CONFIGURED } from "./utils";
import type { InvitationRow, GroupRow } from "@/lib/database.types";

async function db() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

export interface InvitationWithGroup extends InvitationRow {
  group: Pick<GroupRow, "id" | "name" | "type">;
}

export async function getGroupInvitations(groupId: string): Promise<InvitationRow[]> {
  if (!SUPABASE_CONFIGURED) return [];
  const supabase = await db();
  const { data } = await supabase
    .from("invitations")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createInvitation(
  groupId: string,
  createdBy: string,
  opts: { email?: string; studentName?: string } = {}
): Promise<InvitationRow | null> {
  if (!SUPABASE_CONFIGURED) return null;
  const supabase = await db();
  const { data, error } = await supabase
    .from("invitations")
    .insert({
      group_id: groupId,
      created_by: createdBy,
      email: opts.email ?? null,
      student_name: opts.studentName ?? null,
    })
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function getInvitationByToken(token: string): Promise<InvitationWithGroup | null> {
  if (!SUPABASE_CONFIGURED) return null;
  const supabase = await db();
  const { data } = await supabase
    .from("invitations")
    .select("*, group:groups(id, name, type)")
    .eq("token", token)
    .single();
  if (!data) return null;
  return data as InvitationWithGroup;
}

export async function acceptInvitation(
  token: string,
  studentId: string
): Promise<{ error?: string }> {
  if (!SUPABASE_CONFIGURED) return { error: "Supabase não configurado." };
  const supabase = await db();

  const invite = await getInvitationByToken(token);
  if (!invite) return { error: "Convite não encontrado." };
  if (invite.status !== "pending") return { error: "Este convite não está mais disponível." };
  if (new Date(invite.expires_at) < new Date()) {
    await supabase.from("invitations").update({ status: "expired" }).eq("id", invite.id);
    return { error: "Este convite expirou." };
  }

  // mark invite as accepted (single-use)
  const { error: updateErr } = await supabase
    .from("invitations")
    .update({ status: "accepted", accepted_by: studentId })
    .eq("id", invite.id);
  if (updateErr) return { error: updateErr.message };

  // add student to group
  const { error: memberErr } = await supabase
    .from("group_members")
    .upsert({ group_id: invite.group_id, student_id: studentId, status: "active" });
  if (memberErr) return { error: memberErr.message };

  // grant access to all packs currently assigned to this group
  const { data: assignments } = await supabase
    .from("group_assignments")
    .select("pack_id")
    .eq("group_id", invite.group_id);

  if (assignments && assignments.length > 0) {
    await supabase
      .from("student_packs")
      .upsert(assignments.map((a) => ({ student_id: studentId, pack_id: a.pack_id })));
  }

  return {};
}

export async function revokeInvitation(invitationId: string): Promise<{ error?: string }> {
  if (!SUPABASE_CONFIGURED) return {};
  const supabase = await db();
  const { error } = await supabase
    .from("invitations")
    .update({ status: "revoked" })
    .eq("id", invitationId);
  return error ? { error: error.message } : {};
}
