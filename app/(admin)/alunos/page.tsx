import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getStudents } from "@/lib/data/students";
import { getPacks } from "@/lib/data/packs";
import { getCompletionRate, getAccuracyRate } from "@/lib/mock-data";
import {
  Users,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Clock,
} from "lucide-react";

const TODAY = new Date();

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "Nunca";
  const diff = Math.floor(
    (TODAY.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  return `Há ${diff} dias`;
}

export default async function StudentsPage() {
  const [students, allPacks] = await Promise.all([getStudents(), getPacks()]);

  const allStats = students.map((s) => {
    const packs = allPacks.filter((p) => p.studentIds.includes(s.id));
    const publishedPacks = packs.filter((p) => p.status === "published");
    const packsWithProgress = packs.filter(
      (p) => p.progress && p.progress.questionsAnswered > 0
    );

    const avgCompletion =
      packsWithProgress.length > 0
        ? Math.round(
            packsWithProgress.reduce(
              (sum, p) => sum + getCompletionRate(p.progress),
              0
            ) / packsWithProgress.length
          )
        : 0;

    const avgAccuracy =
      packsWithProgress.length > 0
        ? Math.round(
            packsWithProgress.reduce(
              (sum, p) => sum + getAccuracyRate(p.progress),
              0
            ) / packsWithProgress.length
          )
        : 0;

    const lastAccess =
      packs
        .map((p) => p.progress?.lastAccessedAt)
        .filter((d): d is string => !!d)
        .sort()
        .pop() ?? null;

    return {
      totalPacks: packs.length,
      publishedPacks: publishedPacks.length,
      avgCompletion,
      avgAccuracy,
      lastAccess,
    };
  });

  const globalStats = {
    total: students.length,
    activePacks: allPacks.filter((p) => p.status === "published").length,
    avgProgress:
      allStats.length > 0
        ? Math.round(
            allStats.reduce((sum, s) => sum + s.avgCompletion, 0) /
              allStats.length
          )
        : 0,
  };

  return (
    <>
      <Topbar title="Alunos" />

      <main className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total de alunos", value: globalStats.total, icon: Users, color: "text-primary", bg: "bg-primary/10" },
            { label: "Pacotes publicados", value: globalStats.activePacks, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-100" },
            { label: "Progresso médio", value: `${globalStats.avgProgress}%`, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-100" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-xl border bg-white px-5 py-4 flex items-center gap-4">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", bg)}>
                <Icon className={cn("h-5 w-5", color)} />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Student list */}
        <div className="space-y-3">
          {students.map((student, i) => {
            const stats = allStats[i];
            return (
              <Link
                key={student.id}
                href={`/alunos/${student.id}`}
                className="group flex items-center gap-4 rounded-xl border bg-white px-5 py-4 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  student.color
                )}>
                  {student.avatarInitials}
                </div>

                <div className="w-36 shrink-0">
                  <p className="font-semibold text-sm">{student.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{student.grade}</p>
                </div>

                <div className="flex items-center gap-1.5 w-28 shrink-0">
                  <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    {stats.totalPacks} {stats.totalPacks === 1 ? "pacote" : "pacotes"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">Progresso</span>
                    <span className="text-xs font-semibold">{stats.avgCompletion}%</span>
                  </div>
                  <Progress value={stats.avgCompletion} className="h-1.5" />
                </div>

                <div className="w-20 shrink-0 text-right">
                  <p className={cn(
                    "text-sm font-semibold",
                    stats.avgAccuracy >= 70 ? "text-emerald-600"
                      : stats.avgAccuracy >= 50 ? "text-amber-600"
                      : stats.avgAccuracy > 0 ? "text-red-500"
                      : "text-muted-foreground"
                  )}>
                    {stats.avgAccuracy > 0 ? `${stats.avgAccuracy}%` : "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">acerto</p>
                </div>

                <div className="w-24 shrink-0 text-right">
                  <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {relativeTime(stats.lastAccess)}
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
