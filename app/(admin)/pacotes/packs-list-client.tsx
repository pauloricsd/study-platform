"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { StudyPackCard } from "@/components/dashboard/study-pack-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type StudyPack, type StudyPackStatus, statusLabels } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Plus, Search, BookOpen, CheckCircle2, Clock, FileText } from "lucide-react";

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

export function PacksListClient({ packs }: PacksListClientProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const stats = {
    total: packs.length,
    published: packs.filter((p) => p.status === "published").length,
    pending: packs.filter((p) => p.status === "draft" || p.status === "in_review").length,
    totalQuestions: packs.reduce((acc, p) => acc + p.questionsCount, 0),
  };

  const filtered = useMemo(() => {
    return packs.filter((pack) => {
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
  }, [packs, activeTab, search]);

  return (
    <>
      <Topbar
        title="Pacotes de Estudo"
        action={
          <Button size="sm" className="gap-2" asChild>
            <Link href="/pacotes/novo">
              <Plus className="h-4 w-4" />
              Novo pacote
            </Link>
          </Button>
        }
      />

      <main className="p-6 space-y-6">
        {/* Stats */}
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

        {/* Filters + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1 w-fit">
            {tabs.map((tab) => {
              const count =
                tab.id === "all"
                  ? packs.length
                  : packs.filter((p) => p.status === tab.id).length;
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
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pacote..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-white"
            />
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((pack) => (
              <StudyPackCard key={pack.id} pack={pack} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-white py-16 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {search ? `Nenhum pacote encontrado para "${search}"` : "Nenhum pacote nesta categoria"}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        )}
      </main>
    </>
  );
}

export { statusLabels };
