"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { acceptInvitationAction } from "./actions";

export function AcceptInviteButton({
  token,
  studentId,
  groupId,
}: {
  token: string;
  studentId: string;
  groupId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptInvitationAction(token, studentId);
      if (result.error) {
        setError(result.error);
      } else {
        setAccepted(true);
        setTimeout(() => router.push("/estudar"), 1500);
      }
    });
  }

  if (accepted) {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        <p className="text-sm font-semibold text-emerald-700">Você entrou no grupo!</p>
        <p className="text-xs text-muted-foreground">Redirecionando para seus estudos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
          {error}
        </p>
      )}
      <Button className="w-full gap-2 h-11" onClick={handleAccept} disabled={isPending}>
        {isPending ? "Entrando..." : "Aceitar convite e entrar no grupo"}
      </Button>
    </div>
  );
}
