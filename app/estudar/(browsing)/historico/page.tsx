import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getCurrentProfile } from "@/lib/data/auth";
import { getStudentPacks } from "@/lib/data/packs";
import { getTopicsByPack } from "@/lib/data/topics";
import { getTopicHistory } from "@/lib/data/progress";
import { getTopicStatus } from "@/lib/mock-history";
import type { TopicHistory } from "@/lib/mock-history";
import {
  CheckCircle2,
  AlertCircle,
  Circle,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  Target,
  BookOpen,
} from "lucide-react";

const TODAY = new Date();

function relativeTime(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const diff = Math.floor(
    (TODAY.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  return `Há ${diff} dias`;
}

const statusConfig = {
  completed: {
    label: "Concluído",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  review: {
    label: "Para revisar",
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  not_started: {
    label: "Não iniciado",
    icon: Circle,
    color: "text-muted-foreground",
    bg: "bg-muted/30",
    border: "border-border",
  },
};

export default async function HistoricoPage() {
  const profile = await getCurrentProfile();
  const studentId = profile?.id ?? "s1";

  const myPacks = await getStudentPacks(studentId);

  // Topics for all assigned packs
  const allTopics = (
    await Promise.all(myPacks.map((p) => getTopicsByPack(p.id)))
  ).flat();

  // Topic history (attempted topics)
  const history = await getTopicHistory(studentId);
  const historyMap = Object.fromEntries(history.map((h) => [h.topicId, h]));

  // Pack lookup by id
  const packMap = Object.fromEntries(myPacks.map((p) => [p.id, p]));

  // Sort: review → completed → not_started
  const statusOrder = { review: 0, completed: 1, not_started: 2 };
  const sortedTopics = [...allTopics].sort((a, b) => {
    const sa = getTopicStatus(historyMap[a.id] ?? { attempts: 0, score: 0 } as TopicHistory);
    const sb = getTopicStatus(historyMap[b.id] ?? { attempts: 0, score: 0 } as TopicHistory);
    return statusOrder[sa] - statusOrder[sb];
  });

  const attempted = history.filter((h) => h.attempts > 0);
  const completed = history.filter((h) => getTopicStatus(h) === "completed");
  const toReview = history.filter((h) => getTopicStatus(h) === "review");
  const avgAccuracy =
    attempted.length > 0
      ? Math.round(attempted.reduce((sum, h) => sum + h.score, 0) / attempted.length)
      : 0;

  return (
    <>
      <Topbar title="Revisão" />

      <main className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Concluídos", value: completed.length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
            { label: "Para revisar", value: toReview.length, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-100" },
            { label: "Média de acerto", value: avgAccuracy > 0 ? `${avgAccuracy}%` : "—", icon: Target, color: "text-violet-600", bg: "bg-violet-100" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-xl border bg-white px-4 py-3.5 flex items-center gap-3">
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Topic list */}
        <div className="space-y-3">
          {sortedTopics.map((topic) => {
            const h = historyMap[topic.id] as TopicHistory | undefined;
            const status = h ? getTopicStatus(h) : "not_started";
            const pack = packMap[topic.packId];
            const cfg = statusConfig[status];
            const lastActive = relativeTime(h?.lastAttemptAt ?? null);

            return (
              <Link
                key={topic.id}
                href={`/estudar/${topic.packId}/topico/${topic.id}`}
                className="group flex items-center gap-4 rounded-xl border bg-white px-5 py-4 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                {/* Status icon */}
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                  cfg.bg,
                  cfg.border
                )}>
                  <cfg.icon className={cn("h-4 w-4", cfg.color)} />
                </div>

                {/* Topic info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-sm truncate">{topic.title}</h3>
                    <span className={cn(
                      "shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full border",
                      cfg.bg, cfg.color, cfg.border
                    )}>
                      {cfg.label}
                    </span>
                  </div>
                  {pack && (
                    <p className="text-xs text-muted-foreground truncate">
                      {pack.title} · {pack.subject}
                    </p>
                  )}
                </div>

                {/* Progress + accuracy */}
                {h && h.attempts > 0 ? (
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right w-24">
                      <div className="flex items-center justify-between mb-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-semibold">{h.score}%</span>
                      </div>
                      <Progress
                        value={h.score}
                        className={cn(
                          "h-1.5",
                          h.score >= 80
                            ? "[&>div]:bg-emerald-500"
                            : h.score >= 50
                            ? "[&>div]:bg-amber-500"
                            : "[&>div]:bg-red-400"
                        )}
                      />
                    </div>
                    <div className="text-right w-20">
                      <p className={cn(
                        "text-sm font-semibold",
                        h.score >= 80 ? "text-emerald-600"
                          : h.score >= 50 ? "text-amber-600"
                          : "text-red-500"
                      )}>
                        {h.correctAnswers}/{h.totalQuestions}
                      </p>
                      {lastActive && (
                        <p className="text-[10px] text-muted-foreground">{lastActive}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="shrink-0">
                    <span className="text-xs text-muted-foreground">Não iniciado</span>
                  </div>
                )}

                {/* CTA */}
                <div className="shrink-0">
                  {status === "review" ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 group-hover:bg-amber-100 transition-colors">
                      <RotateCcw className="h-3 w-3" />
                      Revisar
                    </span>
                  ) : status === "not_started" ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1.5 group-hover:bg-primary/15 transition-colors">
                      <BookOpen className="h-3 w-3" />
                      Estudar
                    </span>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
