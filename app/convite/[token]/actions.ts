"use server";

import { acceptInvitation } from "@/lib/data/invitations";

export async function acceptInvitationAction(token: string, studentId: string) {
  return acceptInvitation(token, studentId);
}
