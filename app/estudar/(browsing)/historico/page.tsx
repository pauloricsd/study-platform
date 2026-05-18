import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Topbar } from "@/components/layout/topbar";
import { Progress } from "@/components/ui/progress";
import { getCurrentProfile } from "@/lib/data/auth";
import { getStudentPacks } from "@/lib/data/packs";
import { getTopicsByPack } from "@/lib/data/topics";
import { getTopicHistory } from "@/lib/data/progress";
import { getTopicStatus } from "@/lib/mock-history";
import type { TopicHistory } from "@/lib/mock-history";
import type { Topic } from "@/lib/mock-topics";
import type { StudyPack } from "@/lib/mock-data";
import { subjectColors } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  Circle,
  PlayCircle,
  RotateCcw,
  Target,
  Calendar,
  History,
} from "lucide-react";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

const statusConfig = {
  review: {
    label: "Para revisar",
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
  },
  completed: {
    label: "Concluído",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
  },
  not_started: {
    label: "Não iniciado",
    icon: Circle,
    color: "text-muted-foreground",
    bg: "bg-muted/40",
    dot: "bg-muted-foreground/40",
  },
} as const;

interface TopicRow {
  topic: Topic;
  pack: StudyPack;
  history: TopicHistory;
  status: "completed" | "review" | "not_started";
}

export default async function HistoricoPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const packs = await getStudentPacks(profile.id);

  const [topicsByPack, history] = await Promise.all([
    Promise.all(
      packs.map((p) => getTopicsByPack(p.id).then((topics) => ({ packId: p.id, topics })))
    ),
    getTopicHistory(profile.id),
  ]);

  const historyMap = new Map<string, TopicHistory>(history.map((h) => [h.topicId, h]));
  const packMap = new Map<string, StudyPack>(packs.map((p) => [p.id, p]));

  const rows: TopicRow[] = topicsByPack.flatMap(({ packId, topics }) => {
    const pack = packMap.get(packId);
    if (!pack) return [];
    return topics.map((topic) => {
      const h: TopicHistory = historyMap.get(topic.id) ?? {
        topicId: topic.id,
        packId,
        score: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        attempts: 0,
        lastAttemptAt: null,
      };
      return { topic, pack, history: h, status: getTopicStatus(h) };
    });
  });

  const priorityOrder = { review: 0, completed: 1, not_started: 2 };
  rows.sort((a, b) => {
    const diff = priorityOrder[a.status] - priorityOrder[b.status];
    if (diff !== 0) return diff;
    return (b.history.lastAttemptAt ?? "0").localeCompare(a.history.lastAttemptAt ?? "0");
  });

  const groups = (["review", "completed", "not_started"] as const)
    .map((key) => ({ key, rows: rows.filter((r) => r.status === key) }))
    .filter((g) => g.rows.length > 0);

  const totalDone = rows.filter((r) => r.status === "completed").length;
  const totalReview = rows.filter((r) => r.status === "review").length;
  const totalNew = rows.filter((r) => r.status === "not_started").length;

  return (
    <>
      <Topbar title="Revisão" />

      <main className="p-4 md:p-6 space-y-6 max-w-3xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Concluídos", value: totalDone, color: "text-emerald-600", bg: "bg-emerald-100", icon: CheckCircle2 },
            { label: "Para revisar", value: totalReview, color: "text-amber-600", bg: "bg-amber-100", icon: AlertTriangle },
            { label: "Não iniciados", value: totalNew, color: "text-muted-foreground", bg: "bg-muted/60", icon: Circle },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="rounded-xl border bg-white p-4 flex flex-col items-center text-center gap-1.5">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-full", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Target}
            iconColor="text-violet-600"
            iconBg="bg-violet-100"
            title="Nenhum estudo registrado ainda"
            description="Complete tópicos dos seus pacotes de estudo e o seu progresso e histórico aparecerão aqui."
            decorative
            action={
              <Button asChild>
                <Link href="/estudar/materiais">Ver meus materiais</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-8">
            {groups.map(({ key, rows: groupRows }) => {
              const cfg = statusConfig[key];
              const StatusIcon = cfg.icon;
              return (
                <section key={key}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn("h-2 w-2 rounded-full", cfg.dot)} />
                    <h2 className={cn("text-sm font-semibold", cfg.color)}>{cfg.label}</h2>
                    <span className="text-xs text-muted-foreground">({groupRows.length})</span>
                  </div>

                  <div className="space-y-2">
                    {groupRows.map(({ topic, pack, history: h, status }) => {
                      const accuracy =
                        h.totalQuestions > 0
                          ? Math.round((h.correctAnswers / h.totalQuestions) * 100)
                          : null;

                      return (
                        <div
                          key={topic.id}
                          className={cn(
                            "rounded-xl border bg-white px-4 py-3.5 flex items-center gap-4 transition-shadow hover:shadow-sm",
                            status === "review" && "border-amber-200/70"
                          )}
                        >
                          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", cfg.bg)}>
                            <StatusIcon className={cn("h-4 w-4", cfg.color)} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                              <span className={cn(
                                "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium shrink-0",
                                subjectColors[pack.subject] ?? "bg-slate-100 text-slate-700 border-slate-200"
                              )}>
                                {pack.subject}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">{pack.title}</span>
                            </div>
                            <p className="text-sm font-medium text-foreground truncate">{topic.title}</p>

                            {h.attempts > 0 && (
                              <div className="mt-1.5 space-y-1">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {accuracy !== null ? `${accuracy}% acerto` : "—"}
                                    {" · "}
                                    {h.attempts} {h.attempts === 1 ? "tentativa" : "tentativas"}
                                  </span>
                                  <span className="flex items-center gap-1 shrink-0">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(h.lastAttemptAt)}
                                  </span>
                                </div>
                                <Progress
                                  value={h.score}
                                  className={cn(
                                    "h-1.5",
                                    status === "completed" && "[&>div]:bg-emerald-500",
                                    status === "review" && "[&>div]:bg-amber-500"
                                  )}
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {h.attempts > 0 && (
                              <Link
                                href={`/estudar/historico/${topic.id}`}
                                className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                                title="Ver tentativas"
                              >
                                <History className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Tentativas</span>
                              </Link>
                            )}
                            <Link
                              href={`/estudar/${pack.id}/topico/${topic.id}`}
                              className={cn(
                                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                                status === "review"
                                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                  : status === "completed"
                                  ? "bg-muted text-muted-foreground hover:bg-muted/80"
                                  : "bg-primary/10 text-primary hover:bg-primary/20"
                              )}
                            >
                              {status === "review" ? (
                                <><RotateCcw className="h-3.5 w-3.5" />Revisar</>
                              ) : status === "completed" ? (
                                <><RotateCcw className="h-3.5 w-3.5" />Refazer</>
                              ) : (
                                <><PlayCircle className="h-3.5 w-3.5" />Estudar</>
                              )}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
