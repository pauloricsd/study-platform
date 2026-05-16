"use client";

import { useState, useTransition } from "react";
import { BookPlus, Loader2, Search, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { subjectColors } from "@/lib/mock-data";
import { assignPackToStudentAction } from "./actions";

interface AvailablePack {
  id: string;
  title: string;
  subject: string;
  grade: string;
  examName: string;
}

interface AssignPackDialogProps {
  studentId: string;
  studentName: string;
  availablePacks: AvailablePack[];
}

export function AssignPackDialog({
  studentId,
  studentName,
  availablePacks,
}: AssignPackDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const filtered = availablePacks.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.subject.toLowerCase().includes(q) ||
      p.grade.toLowerCase().includes(q)
    );
  });

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setSearch("");
      setSelected(null);
      setError(null);
      setDone(false);
    }, 300);
  }

  function handleConfirm() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await assignPackToStudentAction(studentId, selected);
      if (result.error) {
        setError(result.error);
      } else {
        setDone(true);
        setTimeout(() => handleClose(), 1200);
      }
    });
  }

  const selectedPack = availablePacks.find((p) => p.id === selected);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
        disabled={availablePacks.length === 0}
        title={availablePacks.length === 0 ? "Nenhum pacote publicado disponível" : undefined}
      >
        <BookPlus className="h-4 w-4" />
        Atribuir pacote
      </Button>

      <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else setOpen(true); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Atribuir pacote</DialogTitle>
            <DialogDescription>
              Selecione um pacote publicado para dar acesso a{" "}
              <span className="font-medium">{studentName}</span>.
            </DialogDescription>
          </DialogHeader>

          {done ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm font-medium">Pacote atribuído com sucesso!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pacote…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>

              {/* Pack list */}
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-0.5">
                {filtered.length === 0 ? (
                  <p className="text-sm text-center text-muted-foreground py-6">
                    {search ? "Nenhum pacote encontrado." : "Nenhum pacote disponível."}
                  </p>
                ) : (
                  filtered.map((pack) => {
                    const isSelected = selected === pack.id;
                    const subjectColor =
                      subjectColors[pack.subject as keyof typeof subjectColors] ??
                      "bg-slate-100 text-slate-700 border-slate-200";

                    return (
                      <button
                        key={pack.id}
                        type="button"
                        onClick={() => setSelected(pack.id)}
                        className={cn(
                          "w-full text-left rounded-lg border px-3 py-2.5 transition-colors",
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:bg-muted/40"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
                              subjectColor
                            )}
                          >
                            {pack.subject}
                          </span>
                          <span className="text-xs text-muted-foreground">{pack.grade}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {pack.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{pack.examName}</p>
                      </button>
                    );
                  })
                )}
              </div>

              {error && (
                <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={handleClose} disabled={isPending}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!selected || isPending}
                  className="gap-2"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isPending
                    ? "Atribuindo…"
                    : selectedPack
                    ? `Atribuir "${selectedPack.title.slice(0, 20)}${selectedPack.title.length > 20 ? "…" : ""}"`
                    : "Atribuir"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
