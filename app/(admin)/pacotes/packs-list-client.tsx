"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StudyPackCard } from "@/components/dashboard/study-pack-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type StudyPack, type StudyPackStatus, statusLabels, subjectColors } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Plus, Search, BookOpen, CheckCircle2, Clock, FileText,
  Archive, RotateCcw, Trash2, AlertTriangle, Sparkles,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { restorePackAction, deletePackPermanentlyAction } from "./actions";

type FilterTab = "all" | StudyPackStatus;

const tabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "published", label: "Publicados" },
  { id: "in_review", label: "Em revisão" },
  { id: "draft", label: "Rascunhos" },
];

interface PacksListClientProps {
  packs: StudyPack[];
}

function ArchivedPackRow({ pack, onRefresh }: { pack: StudyPack; onRefresh: () => void }) {
  const [isPending, startTransition] = useTransition();

  function handleRestore() {
    startTransition(async () => {
      await restorePackAction(pack.id);
      onRefresh();
    });
  }

  function handleDelete() {
    if (!confirm(`Excluir permanentemente "${pack.title}"? Esta ação não pode ser desfeita.`)) return;
    startTransition(async () => {
      await deletePackPermanentlyAction(pack.id);
      onRefresh();
    });
  }

  return (
    <div className={cn(
      "flex items-center gap-4 rounded-xl border bg-white px-4 py-3.5 transition-opacity",
      isPending && "opacity-50 pointer-events-none"
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn(
            "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
            subjectColors[pack.subject] ?? "bg-slate-100 text-slate-700 border-slate-200"
          )}>
            {pack.subject}
          </span>
          <span className="text-xs text-muted-foreground">{pack.grade}</span>
        </div>
        <p className="text-sm font-medium text-foreground truncate">{pack.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{pack.examName}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 text-xs"
          onClick={handleRestore}
          disabled={isPending}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restaurar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Excluir
        </Button>
      </div>
    </div>
  );
}

export function PacksListClient({ packs }: PacksListClientProps) {
  const [activeTab, setActiveTab] = useState<FilterTab | "archived">("all");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const activePacks = packs.filter((p) => p.status !== "archived");
  const archivedPacks = packs.filter((p) => p.status === "archived");

  const stats = {
    total: activePacks.length,
    published: activePacks.filter((p) => p.status === "published").length,
    pending: activePacks.filter((p) => p.status === "draft" || p.status === "in_review").length,
    totalQuestions: activePacks.reduce((acc, p) => acc + p.questionsCount, 0),
  };

  const filtered = useMemo(() => {
    if (activeTab === "archived") return [];
    return activePacks.filter((pack) => {
      const matchesTab = activeTab === "all" || pack.status === activeTab;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        pack.title.toLowerCase().includes(q) ||
        pack.subject.toLowerCase().includes(q) ||
        pack.grade.toLowerCase().includes(q) ||
        pack.examName.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [activePacks, activeTab, search]);

  return (
    <main className="p-6 space-y-6">
        {/* Stats — only shown for active packs */}
        {activeTab !== "archived" && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Total de pacotes", value: stats.total, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
              { label: "Publicados", value: stats.published, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
              { label: "Pendentes", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
              { label: "Questões criadas", value: stats.totalQuestions, icon: FileText, color: "text-violet-600", bg: "bg-violet-100" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-xl border bg-white px-5 py-4 flex items-center gap-4">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", bg)}>
                  <Icon className={cn("h-5 w-5", color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1 w-fit">
            {tabs.map((tab) => {
              const count =
                tab.id === "all"
                  ? activePacks.length
                  : activePacks.filter((p) => p.status === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none",
                    activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-muted-foreground/15 text-muted-foreground"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Archived tab — separated visually */}
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={() => setActiveTab("archived")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                activeTab === "archived"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Archive className="h-3.5 w-3.5" />
              Arquivados
              {archivedPacks.length > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none",
                  activeTab === "archived" ? "bg-primary/10 text-primary" : "bg-muted-foreground/15 text-muted-foreground"
                )}>
                  {archivedPacks.length}
                </span>
              )}
            </button>
          </div>

          {activeTab !== "archived" && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pacote..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-white"
              />
            </div>
          )}
        </div>

        {/* Archived view */}
        {activeTab === "archived" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Pacotes arquivados não são visíveis para os alunos. Você pode restaurá-los ou excluí-los permanentemente.
            </div>

            {archivedPacks.length === 0 ? (
              <EmptyState
                icon={Archive}
                iconColor="text-muted-foreground"
                iconBg="bg-muted/50"
                title="Nenhum pacote arquivado"
                description="Pacotes que você arquivar aparecerão aqui. Eles ficam ocultos para os alunos mas podem ser restaurados a qualquer momento."
              />
            ) : (
              <div className="space-y-2">
                {archivedPacks.map((pack) => (
                  <ArchivedPackRow
                    key={pack.id}
                    pack={pack}
                    onRefresh={() => router.refresh()}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active packs grid */}
        {activeTab !== "archived" && (
          filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((pack) => (
                <StudyPackCard key={pack.id} pack={pack} />
              ))}
            </div>
          ) : search ? (
            <EmptyState
              icon={Search}
              iconColor="text-muted-foreground"
              iconBg="bg-muted/50"
              title={`Nenhum resultado para "${search}"`}
              description="Tente buscar por outro título, disciplina ou série."
              action={
                <button onClick={() => setSearch("")} className="text-sm text-primary font-medium hover:underline">
                  Limpar busca
                </button>
              }
            />
          ) : activeTab === "all" ? (
            <EmptyState
              icon={Sparkles}
              iconColor="text-primary"
              iconBg="bg-primary/10"
              title="Crie seu primeiro pacote"
              description="Importe um PDF ou crie manualmente um conjunto de materiais de estudo para seus alunos."
              decorative
              action={
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button asChild>
                    <Link href="/pacotes/novo"><Plus className="h-4 w-4 mr-1.5" />Novo pacote</Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <EmptyState
              icon={BookOpen}
              iconColor="text-muted-foreground"
              iconBg="bg-muted/50"
              title="Nenhum pacote nesta categoria"
              description="Não há pacotes com este status no momento."
            />
          )
        )}
    </main>
  );
}

export { statusLabels };
