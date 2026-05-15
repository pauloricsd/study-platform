import Link from "next/link";
import { notFound } from "next/navigation";
import { getPackById } from "@/lib/data/packs";
import { getTopicsByPack, getExercisesForTopics } from "@/lib/data/topics";
import { getDaysUntilExam, subjectColors } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  PlayCircle,
  Eye,
  ArrowLeft,
} from "lucide-react";

interface Props {
  params: Promise<{ packId: string }>;
}

export default async function StudentPackOverview({ params }: Props) {
  const { packId } = await params;

  const [pack, topics] = await Promise.all([
    getPackById(packId),
    getTopicsByPack(packId),
  ]);

  if (!pack) notFound();

  const topicIds = topics.map((t) => t.id);
  const exercises = await getExercisesForTopics(topicIds);

  const daysUntil = getDaysUntilExam(pack.examDate ?? null);
  const progress = pack.progress;
  const completionPct = progress
    ? Math.round((progress.topicsDone / progress.topicsTotal) * 100)
    : 0;

  const topicStatuses: Record<string, "done" | "in_progress" | "not_started"> = {};
  topics.forEach((t, idx) => {
    if (idx < (progress?.topicsDone ?? 0)) topicStatuses[t.id] = "done";
    else if (idx === (progress?.topicsDone ?? 0)) topicStatuses[t.id] = "in_progress";
    else topicStatuses[t.id] = "not_started";
  });

  const nextTopicId =
    topics.find((t) => topicStatuses[t.id] !== "done")?.id ?? topics[0]?.id;

  return (
    <>
      {/* Preview banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-amber-400 px-4 py-2 text-amber-950">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Eye className="h-4 w-4 shrink-0" />
          Você está visualizando como aluno — esta é uma prévia
        </div>
        <Link href={`/pacotes/${packId}`}>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 border-amber-600 bg-transparent text-amber-950 hover:bg-amber-500 hover:text-amber-950 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao pacote
          </Button>
        </Link>
      </div>
      <Topbar title={pack.title} />
      <main className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        {/* Pack hero */}
        <div className="rounded-2xl border bg-white p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <span
                className={cn(
                  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                  subjectColors[pack.subject] ?? "bg-slate-100 text-slate-700 border-slate-200"
                )}
              >
                {pack.subject}
              </span>
              <h1 className="text-xl font-bold text-foreground leading-snug">
                {pack.title}
              </h1>
              <p className="text-sm text-muted-foreground">{pack.grade}</p>
            </div>

            {/* Progress ring */}
            <div className="shrink-0 flex flex-col items-center gap-1">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                  <circle
                    cx="32" cy="32" r="26" fill="none"
                    stroke="hsl(var(--primary))" strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - completionPct / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute text-sm font-bold text-foreground">{completionPct}%</span>
              </div>
              <span className="text-xs text-muted-foreground">concluído</span>
            </div>
          </div>

          {/* Exam countdown */}
          <div className={cn(
            "flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2",
            daysUntil !== null && daysUntil <= 7 ? "bg-amber-50 text-amber-700" : "bg-muted/50 text-muted-foreground"
          )}>
            <Clock className="h-4 w-4" />
            {daysUntil === null
              ? `${pack.examName} — data não definida`
              : daysUntil > 0
              ? `${daysUntil} dia${daysUntil !== 1 ? "s" : ""} até a prova — ${pack.examName}`
              : "Prova encerrada"}
          </div>

          {/* Overall stats */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              { label: "Tópicos", value: `${progress?.topicsDone ?? 0}/${topics.length}`, icon: BookOpen },
              { label: "Questões", value: `${progress?.questionsAnswered ?? 0}/${exercises.length}`, icon: CheckCircle2 },
              { label: "Acertos", value: progress?.questionsAnswered ? `${Math.round((progress.correctAnswers / progress.questionsAnswered) * 100)}%` : "—", icon: Sparkles },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl bg-muted/40 px-3 py-3 text-center">
                <p className="text-lg font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          {nextTopicId && (
            <Link href={`/estudar/${packId}/topico/${nextTopicId}`} className="block">
              <Button className="w-full gap-2 h-11 text-base">
                <PlayCircle className="h-5 w-5" />
                {completionPct === 0 ? "Começar a estudar" : "Continuar estudando"}
              </Button>
            </Link>
          )}
        </div>

        {/* Topics list */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Tópicos
          </h2>
          <div className="rounded-2xl border bg-white divide-y overflow-hidden">
            {topics.length === 0 && (
              <p className="px-5 py-8 text-sm text-muted-foreground text-center">
                Nenhum tópico encontrado.
              </p>
            )}
            {topics.map((topic, idx) => {
              const status = topicStatuses[topic.id] ?? "not_started";
              const topicExCount = exercises.filter((e) => e.topicId === topic.id).length;
              const isAccessible = status !== "not_started" || idx === 0;

              return (
                <Link
                  key={topic.id}
                  href={isAccessible ? `/estudar/${packId}/topico/${topic.id}` : "#"}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 transition-colors",
                    isAccessible ? "hover:bg-muted/30" : "opacity-50 cursor-default"
                  )}
                >
                  <div className="shrink-0">
                    {status === "done" ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                    ) : status === "in_progress" ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-xs font-bold text-primary">{idx + 1}</span>
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <span className="text-xs font-medium text-muted-foreground">{idx + 1}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium leading-snug",
                      status === "done" ? "text-muted-foreground line-through decoration-muted-foreground/40" : "text-foreground"
                    )}>
                      {topic.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {topic.sections.length} seções · {topicExCount} questões
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {status === "in_progress" && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Em andamento
                      </span>
                    )}
                    {status === "done" && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Concluído
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
