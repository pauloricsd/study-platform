import Link from "next/link";
import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getStudentById } from "@/lib/data/students";
import { getPacksForStudent } from "@/lib/data/packs";
import { subjectColors, getCompletionRate, getAccuracyRate, getDaysUntilExam } from "@/lib/mock-data";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  CalendarDays,
  Layers,
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

function formatExamDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [student, packs] = await Promise.all([
    getStudentById(id),
    getPacksForStudent(id),
  ]);

  if (!student) notFound();

  const packsWithProgress = packs.filter(
    (p) => p.progress && p.progress.questionsAnswered > 0
  );
  const completedPacks = packs.filter(
    (p) => p.progress && p.progress.topicsDone === p.progress.topicsTotal && p.progress.topicsTotal > 0
  );

  const avgCompletion =
    packsWithProgress.length > 0
      ? Math.round(
          packsWithProgress.reduce((sum, p) => sum + getCompletionRate(p.progress), 0) /
            packsWithProgress.length
        )
      : 0;

  const avgAccuracy =
    packsWithProgress.length > 0
      ? Math.round(
          packsWithProgress.reduce((sum, p) => sum + getAccuracyRate(p.progress), 0) /
            packsWithProgress.length
        )
      : 0;

  const lastAccess =
    packs
      .map((p) => p.progress?.lastAccessedAt)
      .filter((d): d is string => !!d)
      .sort()
      .pop() ?? null;

  return (
    <>
      <Topbar
        title={student.name}
        action={
          <Link
            href="/alunos"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        }
      />

      <main className="p-6 space-y-6">
        {/* Student header card */}
        <div className="rounded-xl border bg-white px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold",
            student.color
          )}>
            {student.avatarInitials}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold">{student.name}</h2>
            <p className="text-sm text-muted-foreground">{student.grade}</p>
          </div>

          <div className="flex items-center gap-6 sm:gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold leading-none">{packs.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {packs.length === 1 ? "pacote" : "pacotes"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold leading-none text-emerald-600">
                {completedPacks.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">concluídos</p>
            </div>
            <div className="text-center">
              <p className={cn(
                "text-2xl font-bold leading-none",
                avgAccuracy >= 70 ? "text-emerald-600"
                  : avgAccuracy >= 50 ? "text-amber-600"
                  : avgAccuracy > 0 ? "text-red-500"
                  : "text-muted-foreground"
              )}>
                {avgAccuracy > 0 ? `${avgAccuracy}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">acerto médio</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                {relativeTime(lastAccess)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">último acesso</p>
            </div>
          </div>
        </div>

        {/* Pack list */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Pacotes de estudo
          </h3>

          {packs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-white py-12 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum pacote atribuído ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {packs.map((pack) => {
                const completion = getCompletionRate(pack.progress);
                const accuracy = getAccuracyRate(pack.progress);
                const daysLeft = getDaysUntilExam(pack.examDate);
                const hasProgress = pack.progress && pack.progress.questionsAnswered > 0;
                const isComplete =
                  pack.progress &&
                  pack.progress.topicsDone === pack.progress.topicsTotal &&
                  pack.progress.topicsTotal > 0;

                return (
                  <Link
                    key={pack.id}
                    href={`/pacotes/${pack.id}`}
                    className="group block rounded-xl border bg-white p-5 hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                            subjectColors[pack.subject]
                          )}>
                            {pack.subject}
                          </span>
                          {isComplete && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                              <CheckCircle2 className="h-3 w-3" />
                              Concluído
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm truncate">{pack.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{pack.examName}</p>

                        <div className="flex items-center gap-4 mt-3">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Layers className="h-3 w-3" />
                            {pack.progress
                              ? `${pack.progress.topicsDone}/${pack.progress.topicsTotal}`
                              : `0/${pack.topicsCount}`}{" "}
                            tópicos
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            {formatExamDate(pack.examDate)}
                            {daysLeft !== null && daysLeft > 0 && (
                              <span className={cn(
                                "ml-0.5",
                                daysLeft <= 7 ? "text-amber-600 font-medium" : ""
                              )}>
                                · {daysLeft}d
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="w-40 shrink-0 space-y-3">
                        {hasProgress ? (
                          <>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  Progresso
                                </span>
                                <span className="text-[11px] font-semibold">{completion}%</span>
                              </div>
                              <Progress value={completion} className="h-1.5" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                Acerto
                              </span>
                              <span className={cn(
                                "text-[11px] font-semibold",
                                accuracy >= 70 ? "text-emerald-600"
                                  : accuracy >= 50 ? "text-amber-600"
                                  : "text-red-500"
                              )}>
                                {accuracy}%{" "}
                                <span className="text-muted-foreground font-normal">
                                  ({pack.progress!.correctAnswers}/{pack.progress!.questionsAnswered})
                                </span>
                              </span>
                            </div>
                            {pack.progress?.lastAccessedAt && (
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {relativeTime(pack.progress.lastAccessedAt)}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-16 rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground">
                              {pack.status === "published" ? "Não iniciado"
                                : pack.status === "in_review" ? "Em revisão"
                                : "Rascunho"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
