"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { GroupActions } from "./group-actions";

interface Pack {
  id: string;
  title: string;
  subject: string;
  grade: string;
}

interface AssignedPacksPanelProps {
  groupId: string;
  packs: Pack[];
  availablePacks: Pack[];
}

export function AssignedPacksPanel({ groupId, packs, availablePacks }: AssignedPacksPanelProps) {
  const [search, setSearch] = useState("");
  const [activeSubjects, setActiveSubjects] = useState<Set<string>>(new Set());
  const [activeGrades, setActiveGrades] = useState<Set<string>>(new Set());

  // Unique subjects and grades for filter chips
  const subjects = useMemo(
    () => [...new Set(packs.map((p) => p.subject || "Sem matéria"))].sort(),
    [packs]
  );
  const grades = useMemo(
    () => [...new Set(packs.map((p) => p.grade || "Sem série"))].sort(),
    [packs]
  );

  // Filtered packs
  const filtered = useMemo(() => {
    return packs.filter((p) => {
      const subject = p.subject || "Sem matéria";
      const grade = p.grade || "Sem série";
      if (activeSubjects.size > 0 && !activeSubjects.has(subject)) return false;
      if (activeGrades.size > 0 && !activeGrades.has(grade)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          subject.toLowerCase().includes(q) ||
          grade.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [packs, activeSubjects, activeGrades, search]);

  // Group filtered packs by subject → grade
  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, Record<string, Pack[]>>>((acc, pack) => {
      const subject = pack.subject || "Sem matéria";
      const grade = pack.grade || "Sem série";
      if (!acc[subject]) acc[subject] = {};
      if (!acc[subject][grade]) acc[subject][grade] = [];
      acc[subject][grade].push(pack);
      return acc;
    }, {});
  }, [filtered]);

  function toggleSubject(s: string) {
    setActiveSubjects((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }

  function toggleGrade(g: string) {
    setActiveGrades((prev) => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  }

  const hasFilters = activeSubjects.size > 0 || activeGrades.size > 0 || search.trim();

  return (
    <section className="rounded-2xl border bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          Pacotes atribuídos ({packs.length})
        </h2>
        {availablePacks.length > 0 && (
          <GroupActions groupId={groupId} type="assign_pack" availablePacks={availablePacks} />
        )}
      </div>

      {packs.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">
          Nenhum pacote atribuído ainda.
        </div>
      ) : (
        <>
          {/* Search + filters */}
          <div className="px-5 py-3 space-y-3 border-b bg-gray-50/60">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar pacote..."
                className="w-full h-8 rounded-lg border bg-white pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Subject filters */}
            {subjects.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {subjects.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSubject(s)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition-colors",
                      activeSubjects.has(s)
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Grade filters */}
            {grades.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {grades.map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleGrade(g)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition-colors",
                      activeGrades.has(g)
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-white text-muted-foreground border-border hover:border-violet-400/50 hover:text-foreground"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={() => { setActiveSubjects(new Set()); setActiveGrades(new Set()); setSearch(""); }}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
                Limpar filtros
              </button>
            )}
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              Nenhum pacote encontrado para os filtros aplicados.
            </div>
          ) : (
            <div className="divide-y">
              {Object.entries(grouped).map(([subject, gradeMap]) => (
                <div key={subject}>
                  {/* Subject header */}
                  <div className="px-5 py-2.5 bg-gray-50 border-b">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {subject}
                    </p>
                  </div>
                  {Object.entries(gradeMap).map(([grade, gradePacks]) => (
                    <div key={grade}>
                      {/* Grade sub-header */}
                      <div className="px-5 py-2 flex items-center gap-2 bg-gray-50/60 border-b">
                        <span className="text-[11px] font-medium text-gray-400">{grade}</span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">
                          {gradePacks.length} pacote{gradePacks.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="divide-y">
                        {gradePacks.map((pack) => (
                          <div key={pack.id} className="flex items-center gap-3 px-5 py-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{pack.title}</p>
                            </div>
                            <Link
                              href={`/pacotes/${pack.id}`}
                              className="text-xs text-primary hover:underline shrink-0"
                            >
                              Ver pacote
                            </Link>
                            <GroupActions groupId={groupId} type="unassign_pack" packId={pack.id} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
