"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, Send, CheckCircle2, Archive } from "lucide-react";
import { setPackStatusAction } from "./actions";
import { archivePackAction } from "@/app/(admin)/pacotes/actions";
import type { StudyPack } from "@/lib/mock-data";

interface PackActionsProps {
  pack: StudyPack;
}

export function PackActions({ pack }: PackActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handlePublish() {
    startTransition(async () => {
      await setPackStatusAction(pack.id, "published");
      router.refresh();
    });
  }

  function handleArchive() {
    if (!confirm("Arquivar este pacote? Ele ficará na lixeira e poderá ser restaurado depois.")) return;
    startTransition(async () => {
      await archivePackAction(pack.id);
      router.push("/pacotes");
    });
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link href={`/estudar/${pack.id}`}>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Visualizar como aluno
        </Button>
      </Link>

      {pack.status !== "published" ? (
        <Button size="sm" className="gap-2" onClick={handlePublish} disabled={isPending}>
          <Send className="h-4 w-4" />
          {isPending ? "Publicando…" : "Publicar"}
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
          disabled
        >
          <CheckCircle2 className="h-4 w-4" />
          Publicado
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground hover:text-foreground"
        onClick={handleArchive}
        disabled={isPending}
      >
        <Archive className="h-4 w-4" />
        Arquivar
      </Button>
    </div>
  );
}
