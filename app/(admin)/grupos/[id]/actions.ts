"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/data/auth";
import { createInvitation, revokeInvitation } from "@/lib/data/invitations";
import { assignPackToGroup, unassignPackFromGroup } from "@/lib/data/assignments";
import { removeMember, updateGroup } from "@/lib/data/groups";
import type { GroupRow } from "@/lib/database.types";

export async function createInviteAction(
  groupId: string,
  opts: { email?: string; studentName?: string }
): Promise<{ token?: string; error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Não autenticado." };

  const invite = await createInvitation(groupId, profile.id, opts);
  if (!invite) return { error: "Erro ao criar convite." };

  revalidatePath(`/grupos/${groupId}`);
  return { token: invite.token };
}

export async function revokeInviteAction(
  groupId: string,
  invitationId: string
): Promise<{ error?: string }> {
  const result = await revokeInvitation(invitationId);
  revalidatePath(`/grupos/${groupId}`);
  return result;
}

export async function assignPackAction(
  groupId: string,
  packId: string
): Promise<{ error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Não autenticado." };

  const result = await assignPackToGroup(groupId, packId, profile.id);
  revalidatePath(`/grupos/${groupId}`);
  return result;
}

export async function unassignPackAction(
  groupId: string,
  packId: string
): Promise<{ error?: string }> {
  const result = await unassignPackFromGroup(groupId, packId);
  revalidatePath(`/grupos/${groupId}`);
  return result;
}

export async function removeMemberAction(
  groupId: string,
  studentId: string
): Promise<{ error?: string }> {
  const result = await removeMember(groupId, studentId);
  revalidatePath(`/grupos/${groupId}`);
  return result;
}

export async function updateGroupAction(
  groupId: string,
  data: Partial<Pick<GroupRow, "name" | "description" | "type" | "school_name" | "grade" | "subject">>
): Promise<{ error?: string }> {
  const result = await updateGroup(groupId, data);
  revalidatePath(`/grupos/${groupId}`);
  revalidatePath("/grupos");
  return result;
}
