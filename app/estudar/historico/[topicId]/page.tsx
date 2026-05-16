import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Progress } from "@/components/ui/progress";
import { getCurrentProfile } from "@/lib/data/auth";
import { getExerciseHistory, getTopicHistory } from "@/lib/data/progress";
import { createAdminClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Target,
  RotateCcw,
  BookOpen,
} from "lucide-react";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const typeLabels: Record<string, string> = {
  multiple_choice:    "Múltipla escolha",
  true_false:         "V ou F",
  fill_blank:         "Complete",
  open_short:         "Resposta curta",
  numeric:            "Numérica",
  multiple_select:    "Múltipla seleção",
  open_long:          "Dissertativa",
  text_interpretation:"Interpretação",
  explain_required:   "Explicação",
  text_production:    "Produção",
  match_columns:      "Associação",
  ordering:           "Ordenação",
};

export default async function ExerciseHistoryPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = createAdminClient();

  // Fetch topic + pack info
  const { data: topicRow } = await supabase
    .from("topics")
    .select("id, title, pack_id, study_packs(id, title, subject)")
    .eq("id", topicId)
    .single();

  const topic = topicRow as {
    id: string;
    title: string;
    pack_id: string;
    study_packs: { id: string; title: string; subject: string } | null;
  } | null;

  if (!topic) {
    return (
      <main className="p-6">
        <p className="text-sm text-muted-foreground">Tópico não encontrado.</p>
      </main>
    );
  }

  const [history, allHistory] = await Promise.all([
    getExerciseHistory(profile.id, topicId),
    getTopicHistory(profile.id),
  ]);

  const topicProgress = allHistory.find((h) => h.topicId === topicId);
  const pack = topic.study_packs;

  // Group attempts by exerciseId, keeping them in exercise-statement order
  const byExercise = new Map<string, typeof history>();
  for (const attempt of history) {
    const existing = byExercise.get(attempt.exerciseId) ?? [];
    existing.push(attempt);
    byExercise.set(attempt.exerciseId, existing);
  }
  // Deduplicate exercise order (history is already newest-first; we want oldest-first within exercise)
  for (const [id, attempts] of byExercise) {
    byExercise.set(
      id,
      [...attempts].sort((a, b) => a.attemptNumber - b.attemptNumber)
    );
  }

  const exerciseEntries = Array.from(byExercise.entries());

  const totalAttempts = topicProgress?.attempts ?? 0;
  const bestScore = topicProgress?.score ?? 0;
  const totalResponses = history.length;
  const correctResponses = history.filter((h) => h.isCorrect === true).length;
  const overallAccuracy =
    totalResponses > 0 ? Math.round((correctResponses / totalResponses) * 100) : 0;

  return (
    <>
      <Topbar title="Histórico de tentativas" />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb */}
        <div>
          <Link
            href="/estudar/historico"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Revisão
          </Link>
        </div>

        {/* Topic header */}
        <div className="rounded-2xl border bg-white p-5 space-y-4">
          <div>
            {pack && (
              <p className="text-xs text-muted-foreground mb-1">
                {pack.subject} · {pack.title}
              </p>
            )}
            <h1 className="text-xl font-bold text-foreground">{topic.title}</h1>
          </div>

          {totalAttempts > 0 ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Tentativas",
                    value: totalAttempts,
                    icon: RotateCcw,
                    color: "text-primary",
                    bg: "bg-primary/10",
                  },
                  {
                    label: "Melhor nota",
                    value: `${bestScore}%`,
                    icon: Target,
                    color: "text-emerald-600",
                    bg: "bg-emerald-100",
                  },
                  {
                    label: "Acerto geral",
                    value: `${overallAccuracy}%`,
                    icon: CheckCircle2,
                    color: "text-violet-600",
                    bg: "bg-violet-100",
                  },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div
                    key={label}
                    className="rounded-xl border p-3 text-center space-y-1.5"
                  >
                    <div
                      className={cn(
                        "mx-auto flex h-8 w-8 items-center justify-center rounded-xl",
                        bg
                      )}
                    >
                      <Icon className={cn("h-4 w-4", color)} />
                    </div>
                    <p className="text-lg font-bold text-foreground leading-none">
                      {value}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              {/* Score bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Melhor nota</span>
                  <span className="font-semibold text-foreground">{bestScore}%</span>
                </div>
                <Progress
                  value={bestScore}
                  className={cn(
                    "h-2",
                    bestScore >= 70
                      ? "[&>div]:bg-emerald-500"
                      : bestScore >= 40
                      ? "[&>div]:bg-amber-500"
                      : "[&>div]:bg-red-500"
                  )}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Você ainda não tentou este tópico.
            </p>
          )}
        </div>

        {/* Exercise attempts */}
        {exerciseEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-white py-14 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              Nenhuma resposta registrada ainda.
            </p>
            <Link
              href={`/estudar/${topic.pack_id}/topico/${topicId}`}
              className="mt-3 text-sm text-primary hover:underline font-medium"
            >
              Estudar este tópico →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {exerciseEntries.length} questão{exerciseEntries.length !== 1 ? "ões" : ""}
            </p>

            {exerciseEntries.map(([exerciseId, attempts], exIdx) => {
              const latest = attempts.at(-1)!;
              const bestAttempt = attempts.find((a) => a.isCorrect === true);
              const allWrong = attempts.every((a) => a.isCorrect === false);
              const anyRevealed = attempts.some((a) => a.wasRevealed);

              return (
                <div
                  key={exerciseId}
                  className="rounded-2xl border bg-white overflow-hidden"
                >
                  {/* Exercise header */}
                  <div
                    className={cn(
                      "px-4 py-3 border-b flex items-start gap-3",
                      bestAttempt
                        ? "bg-emerald-50/60"
                        : allWrong
                        ? "bg-red-50/60"
                        : "bg-muted/30"
                    )}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground mt-0.5">
                      {exIdx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase rounded border px-1.5 py-0.5">
                          {typeLabels[latest.type] ?? latest.type}
                        </span>
                        {bestAttempt ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            Acertou
                          </span>
                        ) : allWrong ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-red-600 font-medium">
                            <XCircle className="h-3 w-3" />
                            Não acertou
                          </span>
                        ) : null}
                        {anyRevealed && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            Gabarito revelado
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground line-clamp-2 leading-snug">
                        {latest.statement}
                      </p>
                    </div>
                  </div>

                  {/* Attempts list */}
                  <div className="divide-y">
                    {attempts.map((attempt) => (
                      <div
                        key={`${attempt.exerciseId}-${attempt.attemptNumber}`}
                        className="px-4 py-3 flex items-start gap-3"
                      >
                        {/* Status icon */}
                        <div className="mt-0.5 shrink-0">
                          {attempt.wasRevealed ? (
                            <Eye className="h-4 w-4 text-muted-foreground/60" />
                          ) : attempt.isCorrect === true ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : attempt.isCorrect === false ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                attempt.wasRevealed
                                  ? "text-muted-foreground"
                                  : attempt.isCorrect === true
                                  ? "text-emerald-700"
                                  : attempt.isCorrect === false
                                  ? "text-red-600"
                                  : "text-muted-foreground"
                              )}
                            >
                              {attempt.wasRevealed
                                ? "Gabarito consultado"
                                : attempt.isCorrect === true
                                ? "Correto"
                                : attempt.isCorrect === false
                                ? "Incorreto"
                                : "Sem avaliação"}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                              <Clock className="h-3 w-3" />
                              {formatDateTime(attempt.answeredAt)}
                            </span>
                          </div>
                          {attempt.userAnswer && (
                            <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 mt-1 line-clamp-2">
                              {attempt.userAnswer}
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 text-[10px] text-muted-foreground/60 font-medium">
                          #{attempt.attemptNumber}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-center pb-4">
          <Link
            href={`/estudar/${topic.pack_id}/topico/${topicId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Praticar novamente
          </Link>
        </div>
      </main>
    </>
  );
}
