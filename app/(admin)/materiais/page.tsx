import Link from "next/link";
import { FileText, Files, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";
import { subjectColors } from "@/lib/mock-data";
import { getSourceFiles, getAllExercises } from "@/lib/data/materiais";
import type { ExerciseRow } from "@/lib/database.types";

// ── Exercise type labels ───────────────────────────────────────────────────
const typeLabels: Record<ExerciseRow["type"], string> = {
  multiple_choice: "Múltipla escolha",
  true_false: "V ou F",
  fill_blank: "Complete",
  open_short: "Aberta",
  numeric: "Numérica",
  multiple_select: "Múltipla seleção",
  open_long: "Dissertativa",
  match_columns: "Associação",
  ordering: "Ordenação",
  text_interpretation: "Interpretação",
  explain_required: "Explicação",
  text_production: "Produção",
};

const objectiveTypes: ExerciseRow["type"][] = [
  "multiple_choice",
  "true_false",
  "fill_blank",
  "numeric",
  "multiple_select",
  "ordering",
  "match_columns",
];
const openTypes: ExerciseRow["type"][] = ["open_short", "text_interpretation"];
const longTypes: ExerciseRow["type"][] = [
  "open_long",
  "explain_required",
  "text_production",
];

function exerciseTypeBadgeClass(type: ExerciseRow["type"]) {
  if (objectiveTypes.includes(type))
    return "bg-blue-50 text-blue-700 border-blue-200";
  if (openTypes.includes(type))
    return "bg-violet-50 text-violet-700 border-violet-200";
  if (longTypes.includes(type))
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-muted text-muted-foreground";
}

// ── Status badge ───────────────────────────────────────────────────────────
const statusConfig = {
  done: { label: "Processado", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  processing: { label: "Processando", className: "bg-blue-50 text-blue-700 border-blue-200" },
  pending: { label: "Aguardando", className: "bg-amber-50 text-amber-700 border-amber-200" },
  error: { label: "Erro", className: "bg-red-50 text-red-700 border-red-200" },
} as const;

// ── File size formatter ────────────────────────────────────────────────────
function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Date formatter ─────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Page ───────────────────────────────────────────────────────────────────
export default async function MateriaisPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "questoes" ? "questoes" : "arquivos";

  const [sourceFiles, exercises] = await Promise.all([
    getSourceFiles(),
    getAllExercises(),
  ]);

  // Top-3 exercise type breakdown
  const typeCounts = exercises.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});
  const top3Types = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3) as [ExerciseRow["type"], number][];

  return (
    <>
      <Topbar title="Materiais" />

      <main className="p-6 space-y-6">
        {/* Tab nav */}
        <div className="flex gap-2">
          {(
            [
              { key: "arquivos", label: "Arquivos" },
              { key: "questoes", label: "Questões" },
            ] as const
          ).map(({ key, label }) => (
            <Link
              key={key}
              href={`?tab=${key}`}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                tab === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* ── Tab A: Arquivos ── */}
        {tab === "arquivos" && (
          <div className="space-y-4">
            {/* Stat */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-white px-5 py-4 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Files className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">
                    {sourceFiles.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Arquivos enviados
                  </p>
                </div>
              </div>
            </div>

            {/* List */}
            {sourceFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                  <FileText className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Nenhum arquivo enviado
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Os PDFs enviados para os pacotes aparecerão aqui.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {sourceFiles.map((file) => {
                  const status = statusConfig[file.processingStatus];
                  const subjectColor =
                    subjectColors[
                      file.pack.subject as keyof typeof subjectColors
                    ] ?? "bg-muted text-muted-foreground border-muted";
                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 rounded-xl border bg-white px-4 py-3.5"
                    >
                      {/* Icon */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>

                      {/* Middle */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {file.fileName}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn("text-[11px] px-1.5 py-0", subjectColor)}
                          >
                            {file.pack.subject}
                          </Badge>
                          <span className="text-xs text-muted-foreground truncate">
                            {file.pack.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            · {formatDate(file.uploadedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground w-14 text-right">
                          {formatFileSize(file.fileSize)}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[11px] px-1.5 py-0",
                            status.className
                          )}
                        >
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab B: Questões ── */}
        {tab === "questoes" && (
          <div className="space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-white px-5 py-4 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                  <HelpCircle className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">
                    {exercises.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total de questões
                  </p>
                </div>
              </div>

              {top3Types.map(([type, count]) => (
                <div
                  key={type}
                  className="rounded-xl border bg-white px-5 py-4 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold leading-none">{count}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {typeLabels[type]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* List */}
            {exercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                  <HelpCircle className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Nenhuma questão cadastrada
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    As questões dos tópicos aparecerão aqui.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {exercises.map((exercise) => {
                  const subjectColor =
                    subjectColors[
                      exercise.pack.subject as keyof typeof subjectColors
                    ] ?? "bg-muted text-muted-foreground border-muted";
                  const typeBadgeClass = exerciseTypeBadgeClass(exercise.type);
                  const truncated =
                    exercise.statement.length > 120
                      ? exercise.statement.slice(0, 120) + "…"
                      : exercise.statement;
                  return (
                    <div
                      key={exercise.id}
                      className="flex items-center gap-4 rounded-xl border bg-white px-4 py-3.5"
                    >
                      {/* Type badge */}
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 text-[11px] px-1.5 py-0 whitespace-nowrap",
                          typeBadgeClass
                        )}
                      >
                        {typeLabels[exercise.type]}
                      </Badge>

                      {/* Middle */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-snug">
                          {truncated}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {exercise.topic.title}
                          <span className="mx-1">→</span>
                          {exercise.pack.title}
                        </p>
                      </div>

                      {/* Subject badge */}
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 text-[11px] px-1.5 py-0",
                          subjectColor
                        )}
                      >
                        {exercise.pack.subject}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
