import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentProfile } from "@/lib/data/auth";
import { getStudentPacks } from "@/lib/data/packs";
import { subjectColors, getDaysUntilExam, getCompletionRate, getAccuracyRate } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  PlayCircle,
  CalendarDays,
  Clock,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Flame,
  Target,
} from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function StudentHome() {
  const profile = await getCurrentProfile();

  const myPacks = profile
    ? await getStudentPacks(profile.id)
    : [];

  const continuePack = [...myPacks]
    .filter((p) => getCompletionRate(p.progress) < 100)
    .sort((a, b) => (getDaysUntilExam(a.examDate) ?? Infinity) - (getDaysUntilExam(b.examDate) ?? Infinity))[0];

  const totalQuestions = myPacks.reduce(
    (acc, p) => acc + (p.progress?.questionsTotal ?? 0),
    0
  );
  const answeredQuestions = myPacks.reduce(
    (acc, p) => acc + (p.progress?.questionsAnswered ?? 0),
    0
  );
  const correctAnswers = myPacks.reduce(
    (acc, p) => acc + (p.progress?.correctAnswers ?? 0),
    0
  );
  const overallAccuracy =
    answeredQuestions > 0
      ? Math.round((correctAnswers / answeredQuestions) * 100)
      : 0;
  const packsCompleted = myPacks.filter(
    (p) => getCompletionRate(p.progress) === 100
  ).length;

  const nextExam = [...myPacks]
    .filter((p) => { const d = getDaysUntilExam(p.examDate); return d !== null && d > 0; })
    .sort((a, b) => (getDaysUntilExam(a.examDate) ?? Infinity) - (getDaysUntilExam(b.examDate) ?? Infinity))[0];
  const daysToNextExam = nextExam ? getDaysUntilExam(nextExam.examDate) : null;

  const urgent = myPacks.filter((p) => {
    const d = getDaysUntilExam(p.examDate);
    return d !== null && d <= 7 && d > 0;
  });
  const inProgress = myPacks.filter(
    (p) => getCompletionRate(p.progress) > 0 && getCompletionRate(p.progress) < 100
  );
  const motivationMsg =
    urgent.length > 0
      ? `Você tem ${urgent.length} prova${urgent.length > 1 ? "s" : ""} chegando. Foco!`
      : inProgress.length > 0
      ? "Continue de onde parou — você está indo bem!"
      : "Escolha um pacote para começar a estudar.";

  const firstName = profile?.name?.split(" ")[0] ?? "Olá";

  return (
    <>
      <Topbar title="Início" />
      <main className="mx-auto max-w-lg px-4 py-6 space-y-7">

        {/* Greeting */}
        <section className="space-y-1">
          <p className="text-sm text-muted-foreground">{getGreeting()},</p>
          <h1 className="text-2xl font-bold text-foreground">{firstName} 👋</h1>
          <p className="text-sm text-muted-foreground">{motivationMsg}</p>
        </section>

        {/* Next exam banner */}
        {nextExam && daysToNextExam !== null && (
          <div className={cn(
            "rounded-2xl p-4 flex items-center gap-4",
            daysToNextExam <= 7
              ? "bg-amber-50 border border-amber-200"
              : "bg-primary/5 border border-primary/10"
          )}>
            <div className={cn(
              "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-center",
              daysToNextExam <= 7 ? "bg-amber-100" : "bg-primary/10"
            )}>
              {daysToNextExam <= 7
                ? <Flame className="h-6 w-6 text-amber-600" />
                : <CalendarDays className="h-6 w-6 text-primary" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-semibold",
                daysToNextExam <= 7 ? "text-amber-800" : "text-foreground"
              )}>
                {daysToNextExam === 1
                  ? "Prova amanhã!"
                  : daysToNextExam <= 7
                  ? `${daysToNextExam} dias para a prova`
                  : `Próxima prova em ${daysToNextExam} dias`}
              </p>
              <p className={cn(
                "text-xs mt-0.5 truncate",
                daysToNextExam <= 7 ? "text-amber-700" : "text-muted-foreground"
              )}>
                {nextExam.title} · {nextExam.subject}
              </p>
            </div>
          </div>
        )}

        {/* Continue studying CTA */}
        {continuePack && (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Continuar estudando
            </h2>
            <Link href={`/estudar/${continuePack.id}`} className="block">
              <div className="rounded-2xl border bg-white p-5 space-y-4 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className={cn(
                      "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                      subjectColors[continuePack.subject]
                    )}>
                      {continuePack.subject}
                    </span>
                    <h3 className="font-semibold text-foreground leading-snug">
                      {continuePack.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{continuePack.grade}</p>
                  </div>
                  {(() => {
                    const d = getDaysUntilExam(continuePack.examDate);
                    if (d === null) return null;
                    return (
                      <div className={cn(
                        "shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                        d <= 7 ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"
                      )}>
                        <Clock className="h-3 w-3" />
                        {d}d
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-semibold text-foreground">
                      {getCompletionRate(continuePack.progress)}%
                    </span>
                  </div>
                  <Progress value={getCompletionRate(continuePack.progress)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {continuePack.progress?.topicsDone ?? 0} de{" "}
                    {continuePack.progress?.topicsTotal ?? 0} tópicos concluídos
                  </p>
                </div>

                <Button className="w-full gap-2 h-10">
                  <PlayCircle className="h-4 w-4" />
                  Continuar
                </Button>
              </div>
            </Link>
          </section>
        )}

        {/* Stats row */}
        <section className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Questões respondidas",
              value: answeredQuestions,
              total: totalQuestions,
              icon: BookOpen,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Taxa de acerto",
              value: `${overallAccuracy}%`,
              total: null,
              icon: Target,
              color: "text-emerald-600",
              bg: "bg-emerald-100",
            },
            {
              label: "Pacotes concluídos",
              value: packsCompleted,
              total: myPacks.length,
              icon: CheckCircle2,
              color: "text-violet-600",
              bg: "bg-violet-100",
            },
          ].map(({ label, value, total, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl border bg-white p-4 text-center space-y-2">
              <div className={cn("mx-auto flex h-9 w-9 items-center justify-center rounded-xl", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground leading-none">
                  {value}
                  {total !== null && (
                    <span className="text-xs font-normal text-muted-foreground">/{total}</span>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* All packs */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Meus estudos
          </h2>
          <div className="space-y-3">
            {myPacks.map((pack) => {
              const completion = getCompletionRate(pack.progress);
              const accuracy = getAccuracyRate(pack.progress);
              const days = getDaysUntilExam(pack.examDate);
              const isDone = completion === 100;

              return (
                <Link key={pack.id} href={`/estudar/${pack.id}`} className="block">
                  <div className={cn(
                    "rounded-2xl border bg-white p-4 transition-all hover:shadow-sm hover:-translate-y-0.5 cursor-pointer",
                    isDone && "opacity-75"
                  )}>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        isDone ? "bg-emerald-100" : "bg-muted/50"
                      )}>
                        {isDone
                          ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          : <BookOpen className="h-5 w-5 text-muted-foreground" />
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground leading-snug truncate">
                              {pack.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {pack.subject} · {pack.grade}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 mt-0.5" />
                        </div>

                        <div className="mt-2.5 space-y-1">
                          <Progress value={completion} className="h-1.5" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {completion}% concluído
                              {accuracy > 0 && ` · ${accuracy}% de acerto`}
                            </span>
                            <span className={cn(
                              "font-medium",
                              days !== null && days <= 7 ? "text-amber-600" : "text-muted-foreground"
                            )}>
                              {days === null ? "—" : days > 0 ? `${days}d` : "encerrado"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="h-4" />
      </main>
    </>
  );
}
