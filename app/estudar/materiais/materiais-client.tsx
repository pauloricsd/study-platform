"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, X, BookOpen, ChevronRight,
  Clock, CalendarDays, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getDaysUntilExam, getCompletionRate, getAccuracyRate } from "@/lib/mock-data";
import type { StudyPack } from "@/lib/mock-data";

// ── Subject color strips ───────────────────────────────────────────────────
const SUBJECT_COLORS: Record<string, string> = {
  "Português":        "bg-violet-500",
  "Matemática":       "bg-blue-500",
  "Ciências":         "bg-emerald-500",
  "História":         "bg-amber-500",
  "Geografia":        "bg-teal-500",
  "Inglês":           "bg-sky-500",
  "Biologia":         "bg-green-500",
  "Física":           "bg-indigo-500",
  "Química":          "bg-orange-500",
  "Artes":            "bg-pink-500",
  "Educação Física":  "bg-lime-500",
  "Filosofia":        "bg-purple-500",
  "Sociologia":       "bg-rose-500",
};

const SUBJECT_BADGE_COLORS: Record<string, string> = {
  "Português":        "bg-violet-50  text-violet-700  border-violet-200",
  "Matemática":       "bg-blue-50    text-blue-700    border-blue-200",
  "Ciências":         "bg-emerald-50 text-emerald-700 border-emerald-200",
  "História":         "bg-amber-50   text-amber-700   border-amber-200",
  "Geografia":        "bg-teal-50    text-teal-700    border-teal-200",
  "Inglês":           "bg-sky-50     text-sky-700     border-sky-200",
  "Biologia":         "bg-green-50   text-green-700   border-green-200",
  "Física":           "bg-indigo-50  text-indigo-700  border-indigo-200",
  "Química":          "bg-orange-50  text-orange-700  border-orange-200",
  "Artes":            "bg-pink-50    text-pink-700    border-pink-200",
  "Educação Física":  "bg-lime-50    text-lime-700    border-lime-200",
  "Filosofia":        "bg-purple-50  text-purple-700  border-purple-200",
  "Sociologia":       "bg-rose-50    text-rose-700    border-rose-200",
};

// ── Pack card ──────────────────────────────────────────────────────────────
function PackCard({ pack }: { pack: StudyPack }) {
  const completion = getCompletionRate(pack.progress);
  const accuracy   = getAccuracyRate(pack.progress);
  const days       = getDaysUntilExam(pack.examDate);
  const isDone     = completion === 100;
  const isUrgent   = days !== null && days <= 7 && days > 0;
  const isOverdue  = days !== null && days < 0;
  const strip      = SUBJECT_COLORS[pack.subject] ?? "bg-slate-400";
  const badge      = SUBJECT_BADGE_COLORS[pack.subject] ?? "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <Link href={`/estudar/${pack.id}`} className="block group">
      <div className="relative flex overflow-hidden rounded-2xl border bg-white transition-all hover:shadow-md hover:-translate-y-0.5">
        {/* Left color strip */}
        <div className={cn("w-1 shrink-0", strip)} />

        <div className="flex flex-1 min-w-0 items-center gap-3 px-4 py-3.5">
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title + badge */}
            <div className="flex items-start gap-2 flex-wrap">
              <span className={cn(
                "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium shrink-0",
                badge
              )}>
                {pack.subject}
              </span>
              {isDone && (
                <span className="inline-flex items-center gap-0.5 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 shrink-0">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Concluído
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
              {pack.title}
            </p>

            {/* Progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{completion}% concluído</span>
                {accuracy > 0 && (
                  <span className="text-muted-foreground">{accuracy}% de acerto</span>
                )}
              </div>
              <Progress value={completion} className="h-1.5" />
            </div>

            {/* Exam date */}
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isOverdue  ? "text-red-500"
              : isUrgent ? "text-amber-600"
              :             "text-muted-foreground"
            )}>
              {isOverdue  ? <AlertCircle  className="h-3 w-3" />
              : isUrgent  ? <Clock        className="h-3 w-3" />
              :              <CalendarDays className="h-3 w-3" />}
              {days === null
                ? "Data não definida"
                : isOverdue
                ? "Prova encerrada"
                : isUrgent
                ? `${days} dia${days !== 1 ? "s" : ""} para a prova`
                : `Prova em ${days} dias`}
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
        </div>
      </div>
    </Link>
  );
}

// ── Main client component ──────────────────────────────────────────────────
interface MateriaisClientProps {
  packs: StudyPack[];
}

export function MateriaisClient({ packs }: MateriaisClientProps) {
  const [search,         setSearch]         = useState("");
  const [activeSubjects, setActiveSubjects] = useState<Set<string>>(new Set());
  const [activeGrades,   setActiveGrades]   = useState<Set<string>>(new Set());

  // Unique subjects + grades for filter chips
  const subjects = useMemo(
    () => [...new Set(packs.map((p) => p.subject || "Sem disciplina"))].sort(),
    [packs]
  );
  const grades = useMemo(
    () => [...new Set(packs.map((p) => p.grade || "Sem série"))].sort(),
    [packs]
  );

  // Filtered packs
  const filtered = useMemo(() => {
    return packs.filter((p) => {
      const subject = p.subject || "Sem disciplina";
      const grade   = p.grade   || "Sem série";
      if (activeSubjects.size > 0 && !activeSubjects.has(subject)) return false;
      if (activeGrades.size   > 0 && !activeGrades.has(grade))     return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.title.toLowerCase().includes(q)   ||
          subject.toLowerCase().includes(q)   ||
          grade.toLowerCase().includes(q)     ||
          (p.examName ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [packs, activeSubjects, activeGrades, search]);

  // Group: subject → grade → packs[]
  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, Record<string, StudyPack[]>>>((acc, pack) => {
      const subject = pack.subject || "Sem disciplina";
      const grade   = pack.grade   || "Sem série";
      if (!acc[subject])        acc[subject]        = {};
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

  // Summary stats
  const totalTopics    = packs.reduce((s, p) => s + (p.progress?.topicsTotal    ?? p.topicsCount),      0);
  const donePacks      = packs.filter((p) => getCompletionRate(p.progress) === 100).length;
  const totalAnswered  = packs.reduce((s, p) => s + (p.progress?.questionsAnswered ?? 0), 0);
  const totalCorrect   = packs.reduce((s, p) => s + (p.progress?.correctAnswers    ?? 0), 0);
  const avgAccuracy    = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : null;

  if (packs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <BookOpen className="h-7 w-7 text-muted-foreground" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">Nenhum material ainda</p>
          <p className="text-sm text-muted-foreground mt-1">
            Quando um professor atribuir um pacote ao seu grupo, ele aparecerá aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Stats header ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 lg:grid-cols-3 gap-3">
        {[
          { label: "Pacotes",   value: `${donePacks}/${packs.length}`, sub: "concluídos" },
          { label: "Tópicos",   value: totalTopics,                    sub: "no total"   },
          { label: "Acerto",    value: avgAccuracy !== null ? `${avgAccuracy}%` : "—", sub: "médio" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-2xl border bg-white p-3.5 text-center space-y-0.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
            <p className="text-[10px] text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Search + filters ─────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, disciplina ou série..."
            className="w-full h-10 rounded-xl border bg-white pl-10 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Subject chips */}
        {subjects.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => toggleSubject(s)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
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

        {/* Grade chips */}
        {grades.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {grades.map((g) => (
              <button
                key={g}
                onClick={() => toggleGrade(g)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
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
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Limpar filtros
          </button>
        )}
      </div>

      {/* ── Results ──────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border bg-white py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum material encontrado para os filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([subject, gradeMap]) => {
            const strip = SUBJECT_COLORS[subject] ?? "bg-slate-400";
            const totalInSubject = Object.values(gradeMap).reduce((s, arr) => s + arr.length, 0);

            return (
              <div key={subject} className="space-y-3">
                {/* Subject header */}
                <div className="flex items-center gap-2">
                  <div className={cn("h-3.5 w-1 rounded-full shrink-0", strip)} />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
                    {subject}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {totalInSubject} pacote{totalInSubject !== 1 ? "s" : ""}
                  </span>
                </div>

                {Object.entries(gradeMap).map(([grade, gradePacks]) => (
                  <div key={grade} className="space-y-2">
                    {/* Grade sub-header — only when multiple grades exist */}
                    {Object.keys(gradeMap).length > 1 && (
                      <p className="text-[11px] font-medium text-muted-foreground pl-3 uppercase tracking-wider">
                        {grade}
                      </p>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {gradePacks.map((pack) => (
                        <PackCard key={pack.id} pack={pack} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
