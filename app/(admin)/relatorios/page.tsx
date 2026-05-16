import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Progress } from "@/components/ui/progress";
import { getAdminReport } from "@/lib/data/reports";
import { cn } from "@/lib/utils";
import {
  Users,
  Target,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  Calendar,
} from "lucide-react";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function ScoreBadge({ score }: { score: number }) {
  if (score === -1)
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        Sem dados
      </span>
    );
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        score >= 70
          ? "bg-emerald-100 text-emerald-800"
          : score >= 40
          ? "bg-amber-100 text-amber-800"
          : "bg-red-100 text-red-700"
      )}
    >
      {score >= 70 ? (
        <TrendingUp className="h-3 w-3" />
      ) : score >= 40 ? (
        <Minus className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {score}%
    </span>
  );
}

export default async function RelatoriosPage() {
  const students = await getAdminReport();

  const activeStudents = students.filter((s) => s.avgScore !== -1).length;
  const avgScoreAll =
    activeStudents > 0
      ? Math.round(
          students
            .filter((s) => s.avgScore !== -1)
            .reduce((sum, s) => sum + s.avgScore, 0) / activeStudents
        )
      : 0;
  const totalTopicsCompleted = students.reduce((sum, s) => sum + s.topicsCompleted, 0);
  const totalPacks = students.reduce((sum, s) => sum + s.packsAssigned, 0);

  // Active this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const activeThisWeek = students.filter(
    (s) => s.lastActiveAt && new Date(s.lastActiveAt) >= oneWeekAgo
  ).length;

  return (
    <>
      <Topbar title="Relatórios" />

      <main className="p-4 md:p-6 space-y-6 max-w-5xl">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Total de alunos",
              value: students.length,
              icon: Users,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Ativos esta semana",
              value: activeThisWeek,
              icon: Clock,
              color: "text-emerald-600",
              bg: "bg-emerald-100",
            },
            {
              label: "Média geral",
              value: activeStudents > 0 ? `${avgScoreAll}%` : "—",
              icon: Target,
              color: "text-violet-600",
              bg: "bg-violet-100",
            },
            {
              label: "Tópicos concluídos",
              value: totalTopicsCompleted,
              icon: CheckCircle2,
              color: "text-amber-600",
              bg: "bg-amber-100",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-xl border bg-white p-4 space-y-3">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Students table */}
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Desempenho por aluno</h2>
            <span className="text-xs text-muted-foreground">{students.length} aluno{students.length !== 1 ? "s" : ""}</span>
          </div>

          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum aluno cadastrado ainda.</p>
              <Link href="/alunos" className="mt-2 text-sm text-primary hover:underline">
                Gerenciar alunos →
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {students.map((student) => (
                <Link
                  key={student.studentId}
                  href={`/alunos/${student.studentId}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                      student.color ?? "bg-muted-foreground"
                    )}
                  >
                    {student.initials ?? student.name.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Name + grade */}
                  <div className="w-40 shrink-0">
                    <p className="text-sm font-semibold text-foreground truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.grade || "—"}</p>
                  </div>

                  {/* Packs */}
                  <div className="hidden md:flex items-center gap-1.5 w-24 shrink-0">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {student.packsAssigned} pacote{student.packsAssigned !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Topics completed */}
                  <div className="hidden md:flex items-center gap-1.5 w-28 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {student.topicsCompleted} tópico{student.topicsCompleted !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Score bar */}
                  <div className="flex-1 min-w-0 hidden sm:block">
                    {student.avgScore === -1 ? (
                      <p className="text-xs text-muted-foreground">Sem atividade</p>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Média</span>
                          <span className="font-semibold text-foreground">{student.avgScore}%</span>
                        </div>
                        <Progress
                          value={student.avgScore}
                          className={cn(
                            "h-1.5",
                            student.avgScore >= 70
                              ? "[&>div]:bg-emerald-500"
                              : student.avgScore >= 40
                              ? "[&>div]:bg-amber-500"
                              : "[&>div]:bg-red-500"
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* Score badge (mobile) */}
                  <div className="sm:hidden">
                    <ScoreBadge score={student.avgScore} />
                  </div>

                  {/* Score badge (desktop) */}
                  <div className="hidden sm:block shrink-0 w-20 text-right">
                    <ScoreBadge score={student.avgScore} />
                  </div>

                  {/* Last active */}
                  <div className="hidden lg:flex items-center gap-1.5 w-24 shrink-0 justify-end">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(student.lastActiveAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Score distribution */}
        {activeStudents > 0 && (
          <div className="rounded-xl border bg-white p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Distribuição de desempenho
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: "Ótimo (≥ 70%)",
                  count: students.filter((s) => s.avgScore >= 70).length,
                  color: "[&>div]:bg-emerald-500",
                  textColor: "text-emerald-700",
                },
                {
                  label: "Regular (40–69%)",
                  count: students.filter((s) => s.avgScore >= 40 && s.avgScore < 70).length,
                  color: "[&>div]:bg-amber-400",
                  textColor: "text-amber-700",
                },
                {
                  label: "Precisa atenção (< 40%)",
                  count: students.filter((s) => s.avgScore >= 0 && s.avgScore < 40).length,
                  color: "[&>div]:bg-red-400",
                  textColor: "text-red-700",
                },
                {
                  label: "Sem atividade",
                  count: students.filter((s) => s.avgScore === -1).length,
                  color: "[&>div]:bg-muted-foreground/30",
                  textColor: "text-muted-foreground",
                },
              ].map(({ label, count, color, textColor }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={cn("font-semibold", textColor)}>
                      {count} aluno{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <Progress
                    value={students.length > 0 ? (count / students.length) * 100 : 0}
                    className={cn("h-2", color)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
