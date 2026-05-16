"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Send,
  CheckCircle2,
  Archive,
  Pencil,
  ChevronDown,
  EyeOff,
  Loader2,
  BookOpen,
  HelpCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { setPackStatusAction, exportStudyPackAction } from "./actions";
import { archivePackAction } from "@/app/(admin)/pacotes/actions";
import type { StudyPack } from "@/lib/mock-data";

interface PackActionsProps {
  pack: StudyPack;
}

// ── Publish confirmation dialog ───────────────────────────────────────────────
function PublishDialog({
  pack,
  open,
  onClose,
  onConfirm,
  isPending,
}: {
  pack: StudyPack;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const hasTopics = pack.topicsCount > 0;
  const hasQuestions = pack.questionsCount > 0;
  const canPublish = hasTopics && hasQuestions;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Publicar pacote</DialogTitle>
          <DialogDescription>
            Ao publicar, os alunos atribuídos poderão acessar e estudar este pacote.
          </DialogDescription>
        </DialogHeader>

        {/* Checklist */}
        <div className="space-y-2 py-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Verificação antes de publicar
          </p>

          <CheckRow
            ok={hasTopics}
            label={
              hasTopics
                ? `${pack.topicsCount} tópico${pack.topicsCount !== 1 ? "s" : ""} adicionado${pack.topicsCount !== 1 ? "s" : ""}`
                : "Nenhum tópico encontrado"
            }
            icon={BookOpen}
          />
          <CheckRow
            ok={hasQuestions}
            label={
              hasQuestions
                ? `${pack.questionsCount} questão${pack.questionsCount !== 1 ? "ões" : ""} disponíve${pack.questionsCount !== 1 ? "is" : "l"}`
                : "Nenhuma questão encontrada"
            }
            icon={HelpCircle}
          />
        </div>

        {!canPublish && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Adicione tópicos e questões antes de publicar o pacote.
            </span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending || !canPublish}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isPending ? "Publicando…" : "Publicar agora"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CheckRow({
  ok,
  label,
  icon: Icon,
}: {
  ok: boolean;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm ${
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function PackActions({ pack }: PackActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  async function handleExport() {
    setIsExporting(true);
    try {
      const result = await exportStudyPackAction(pack.id);
      if (result.error || !result.data) {
        alert(result.error ?? "Erro ao exportar pacote.");
        return;
      }
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename ?? `${pack.id}.studypack.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }

  function confirmPublish() {
    startTransition(async () => {
      await setPackStatusAction(pack.id, "published");
      setShowPublishDialog(false);
      router.refresh();
    });
  }

  function handleUnpublish() {
    startTransition(async () => {
      await setPackStatusAction(pack.id, "draft");
      router.refresh();
    });
  }

  function handleArchive() {
    if (
      !confirm(
        "Arquivar este pacote? Ele ficará invisível para os alunos e pode ser restaurado depois."
      )
    )
      return;
    startTransition(async () => {
      await archivePackAction(pack.id);
      router.push("/pacotes");
    });
  }

  return (
    <>
      <PublishDialog
        pack={pack}
        open={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        onConfirm={confirmPublish}
        isPending={isPending}
      />

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {/* Edit */}
        <Link href={`/pacotes/${pack.id}/editar`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        </Link>

        {/* Export JSON */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isExporting ? "Exportando…" : "Exportar JSON"}
        </Button>

        {/* Preview as student */}
        <Link href={`/estudar/${pack.id}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            Visualizar
          </Button>
        </Link>

        {/* Publish / Published dropdown */}
        {pack.status !== "published" ? (
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setShowPublishDialog(true)}
            disabled={isPending}
          >
            <Send className="h-4 w-4" />
            Publicar
          </Button>
        ) : (
          /* Published state — dropdown with unpublish + archive */
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Publicado
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="gap-2 text-muted-foreground"
                onClick={handleUnpublish}
              >
                <EyeOff className="h-4 w-4" />
                Despublicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-muted-foreground"
                onClick={handleArchive}
              >
                <Archive className="h-4 w-4" />
                Arquivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Archive — only shown when not published */}
        {pack.status !== "published" && (
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
        )}
      </div>
    </>
  );
}
