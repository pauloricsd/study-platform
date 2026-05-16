"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Files,
  HelpCircle,
  ExternalLink,
  Download,
  Trash2,
  ChevronRight,
  Search,
  Loader2,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { subjectColors } from "@/lib/mock-data";
import type { SourceFileWithPack, ExerciseWithContext } from "@/lib/data/materiais";
import type { ExerciseRow } from "@/lib/database.types";
import { deleteSourceFileAction } from "./actions";

// ── Constants ──────────────────────────────────────────────────────────────────

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

const objectiveTypes = new Set<ExerciseRow["type"]>([
  "multiple_choice", "true_false", "fill_blank", "numeric", "multiple_select", "ordering", "match_columns",
]);
const openTypes = new Set<ExerciseRow["type"]>(["open_short", "text_interpretation"]);
const longTypes = new Set<ExerciseRow["type"]>(["open_long", "explain_required", "text_production"]);

function typeGroup(type: ExerciseRow["type"]): "objetivo" | "aberta" | "dissertativa" {
  if (objectiveTypes.has(type)) return "objetivo";
  if (openTypes.has(type)) return "aberta";
  return "dissertativa";
}

function exerciseTypeBadgeClass(type: ExerciseRow["type"]) {
  if (objectiveTypes.has(type)) return "bg-blue-50 text-blue-700 border-blue-200";
  if (openTypes.has(type)) return "bg-violet-50 text-violet-700 border-violet-200";
  if (longTypes.has(type)) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-muted text-muted-foreground";
}

const statusConfig = {
  done: { label: "Processado", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  processing: { label: "Processando", className: "bg-blue-50 text-blue-700 border-blue-200" },
  pending: { label: "Aguardando", className: "bg-amber-50 text-amber-700 border-amber-200" },
  error: { label: "Erro", className: "bg-red-50 text-red-700 border-red-200" },
} as const;

const packStatusConfig: Record<string, { label: string; className: string }> = {
  published: { label: "Publicado", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  draft:     { label: "Rascunho",  className: "bg-amber-50 text-amber-700 border-amber-200" },
  archived:  { label: "Arquivado", className: "bg-muted text-muted-foreground border-border" },
};

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Filter chip ────────────────────────────────────────────────────────────────

function FilterChip({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-colors border",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

// ── Delete file row ────────────────────────────────────────────────────────────

function FileRow({ file }: { file: SourceFileWithPack }) {
  const [, startTransition] = useTransition();
  const [deleted, setDeleted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const status = statusConfig[file.processingStatus];
  const packStatus = packStatusConfig[file.pack.status] ?? packStatusConfig.draft;
  const subjectColor =
    subjectColors[file.pack.subject as keyof typeof subjectColors] ??
    "bg-muted text-muted-foreground border-muted";

  function handleDelete() {
    if (!confirm(`Excluir "${file.fileName}"? Esta ação não pode ser desfeita.`)) return;
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteSourceFileAction(file.id, file.storagePath);
      if (result.error) {
        alert(`Erro: ${result.error}`);
        setIsDeleting(false);
      } else {
        setDeleted(true);
      }
    });
  }

  if (deleted) return null;

  return (
    <div className="flex items-start gap-4 rounded-xl border bg-white px-4 py-3.5 hover:shadow-sm transition-shadow">
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted mt-0.5">
        <FileText className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Middle */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-medium text-sm">{file.fileName}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={cn("text-[11px] px-1.5 py-0", subjectColor)}>
            {file.pack.subject}
          </Badge>
          <Link
            href={`/pacotes/${file.pack.id}`}
            className="text-xs text-muted-foreground hover:text-primary hover:underline truncate"
          >
            {file.pack.title}
          </Link>
          <Badge variant="outline" className={cn("text-[11px] px-1.5 py-0", packStatus.className)}>
            {packStatus.label}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {file.pack.topicsCount} tópico{file.pack.topicsCount !== 1 ? "s" : ""} gerado{file.pack.topicsCount !== 1 ? "s" : ""}
          </span>
          <span>·</span>
          <span>{formatDate(file.uploadedAt)}</span>
          <span>·</span>
          <span>{formatFileSize(file.fileSize)}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className={cn("text-[11px] px-1.5 py-0", status.className)}>
          {status.label}
        </Badge>

        {/* Download */}
        {file.signedUrl && (
          <a
            href={file.signedUrl}
            download={file.fileName}
            className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Baixar arquivo"
          >
            <Download className="h-3 w-3" />
            Baixar
          </a>
        )}

        {/* Open in new tab */}
        {file.signedUrl && (
          <a
            href={file.signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Abrir em nova aba"
          >
            <ExternalLink className="h-3 w-3" />
            Abrir
          </a>
        )}

        {/* Delete */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Excluir arquivo"
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Main client component ─────────────────────────────────────────────────────

interface MateriaisClientProps {
  initialTab: "arquivos" | "questoes";
  sourceFiles: SourceFileWithPack[];
  exercises: ExerciseWithContext[];
}

export function MateriaisClient({ initialTab, sourceFiles, exercises }: MateriaisClientProps) {
  const [tab, setTab] = useState(initialTab);

  // ── Arquivo filters ──
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [subjectFilterA, setSubjectFilterA] = useState<string>("todos");

  // ── Questão filters ──
  const [typeGroupFilter, setTypeGroupFilter] = useState<string>("todos");
  const [subjectFilterQ, setSubjectFilterQ] = useState<string>("todos");
  const [searchQ, setSearchQ] = useState("");

  // Unique subjects
  const fileSubjects = useMemo(() =>
    [...new Set(sourceFiles.map((f) => f.pack.subject))].sort(), [sourceFiles]);
  const exSubjects = useMemo(() =>
    [...new Set(exercises.map((e) => e.pack.subject))].sort(), [exercises]);

  // Filtered data
  const filteredFiles = useMemo(() => {
    return sourceFiles.filter((f) => {
      if (statusFilter !== "todos" && f.processingStatus !== statusFilter) return false;
      if (subjectFilterA !== "todos" && f.pack.subject !== subjectFilterA) return false;
      return true;
    });
  }, [sourceFiles, statusFilter, subjectFilterA]);

  const filteredExercises = useMemo(() => {
    return exercises.filter((e) => {
      if (typeGroupFilter !== "todos" && typeGroup(e.type) !== typeGroupFilter) return false;
      if (subjectFilterQ !== "todos" && e.pack.subject !== subjectFilterQ) return false;
      if (searchQ.trim()) {
        const q = searchQ.toLowerCase();
        if (!e.statement.toLowerCase().includes(q) && !e.topic.title.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [exercises, typeGroupFilter, subjectFilterQ, searchQ]);

  // Type counts for stats
  const typeCounts = useMemo(() => exercises.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {}), [exercises]);
  const top3Types = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3) as [ExerciseRow["type"], number][];

  return (
    <main className="p-6 space-y-5">
      {/* Tab nav */}
      <div className="flex gap-2">
        {([
          { key: "arquivos" as const, label: `Arquivos (${sourceFiles.length})` },
          { key: "questoes" as const, label: `Questões (${exercises.length})` },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              tab === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Arquivos ── */}
      {tab === "arquivos" && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border bg-white px-5 py-4 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Files className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{sourceFiles.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Arquivos enviados</p>
              </div>
            </div>
            <div className="rounded-xl border bg-white px-5 py-4 flex items-center gap-4">
              <div>
                <p className="text-2xl font-bold leading-none">
                  {sourceFiles.filter((f) => f.processingStatus === "done").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Processados</p>
              </div>
            </div>
            <div className="rounded-xl border bg-white px-5 py-4 flex items-center gap-4">
              <div>
                <p className="text-2xl font-bold leading-none">
                  {sourceFiles.filter((f) => f.processingStatus === "error").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Com erro</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          {sourceFiles.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">Status:</span>
              {["todos", "done", "processing", "pending", "error"].map((s) => (
                <FilterChip
                  key={s}
                  label={s === "todos" ? "Todos" : statusConfig[s as keyof typeof statusConfig]?.label ?? s}
                  active={statusFilter === s}
                  onClick={() => setStatusFilter(s)}
                />
              ))}
              {fileSubjects.length > 1 && (
                <>
                  <span className="text-xs text-muted-foreground font-medium ml-2">Matéria:</span>
                  {["todos", ...fileSubjects].map((s) => (
                    <FilterChip
                      key={s}
                      label={s === "todos" ? "Todas" : s}
                      active={subjectFilterA === s}
                      onClick={() => setSubjectFilterA(s)}
                    />
                  ))}
                </>
              )}
            </div>
          )}

          {/* List */}
          {sourceFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                <FileText className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Nenhum arquivo enviado</p>
                <p className="text-sm text-muted-foreground mt-1">Os PDFs enviados para os pacotes aparecerão aqui.</p>
              </div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
              Nenhum arquivo corresponde aos filtros selecionados.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <FileRow key={file.id} file={file} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Questões ── */}
      {tab === "questoes" && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-xl border bg-white px-5 py-4 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                <HelpCircle className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{exercises.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Total de questões</p>
              </div>
            </div>
            {top3Types.map(([type, count]) => (
              <div key={type} className="rounded-xl border bg-white px-5 py-4 flex items-center gap-4">
                <div>
                  <p className="text-2xl font-bold leading-none">{count}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{typeLabels[type]}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          {exercises.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-medium">Tipo:</span>
                {[
                  { key: "todos", label: "Todos" },
                  { key: "objetivo", label: "Objetivo" },
                  { key: "aberta", label: "Aberta" },
                  { key: "dissertativa", label: "Dissertativa" },
                ].map(({ key, label }) => (
                  <FilterChip
                    key={key}
                    label={label}
                    active={typeGroupFilter === key}
                    onClick={() => setTypeGroupFilter(key)}
                  />
                ))}
                {exSubjects.length > 1 && (
                  <>
                    <span className="text-xs text-muted-foreground font-medium ml-2">Matéria:</span>
                    {["todos", ...exSubjects].map((s) => (
                      <FilterChip
                        key={s}
                        label={s === "todos" ? "Todas" : s}
                        active={subjectFilterQ === s}
                        onClick={() => setSubjectFilterQ(s)}
                      />
                    ))}
                  </>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Buscar por enunciado ou tópico…"
                  className="w-full rounded-lg border bg-white pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              {filteredExercises.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {filteredExercises.length} questão{filteredExercises.length !== 1 ? "ões" : ""}
                  {filteredExercises.length !== exercises.length ? ` de ${exercises.length}` : ""}
                </p>
              )}
            </div>
          )}

          {/* List */}
          {exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                <HelpCircle className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Nenhuma questão cadastrada</p>
                <p className="text-sm text-muted-foreground mt-1">As questões dos tópicos aparecerão aqui.</p>
              </div>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
              Nenhuma questão corresponde aos filtros selecionados.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExercises.map((exercise) => {
                const subjectColor =
                  subjectColors[exercise.pack.subject as keyof typeof subjectColors] ??
                  "bg-muted text-muted-foreground border-muted";
                const typeBadgeClass = exerciseTypeBadgeClass(exercise.type);
                const truncated =
                  exercise.statement.length > 120
                    ? exercise.statement.slice(0, 120) + "…"
                    : exercise.statement;
                return (
                  <Link
                    key={exercise.id}
                    href={`/pacotes/${exercise.pack.id}`}
                    className="flex items-center gap-4 rounded-xl border bg-white px-4 py-3.5 hover:shadow-sm hover:border-primary/20 transition-all group"
                  >
                    <Badge
                      variant="outline"
                      className={cn("shrink-0 text-[11px] px-1.5 py-0 whitespace-nowrap", typeBadgeClass)}
                    >
                      {typeLabels[exercise.type]}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{truncated}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {exercise.topic.title}
                        <span className="mx-1">→</span>
                        {exercise.pack.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={cn("text-[11px] px-1.5 py-0", subjectColor)}
                      >
                        {exercise.pack.subject}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
