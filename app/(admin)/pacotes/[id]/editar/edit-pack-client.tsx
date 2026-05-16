"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type StudyPack, subjectColors } from "@/lib/mock-data";
import { type Topic, type Exercise } from "@/lib/mock-topics";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Check,
} from "lucide-react";
import {
  updatePackMeta,
  updateTopic,
  updateExercise,
  addExercise,
  deleteExercise,
} from "./actions";

// ─── Constants ───────────────────────────────────────────────────────────────

const SUBJECTS = [
  "Português",
  "Matemática",
  "Ciências",
  "História",
  "Geografia",
  "Inglês",
  "Biologia",
  "Física",
  "Química",
] as const;

const EXERCISE_TYPES: { value: Exercise["type"]; label: string }[] = [
  { value: "multiple_choice", label: "Múltipla escolha" },
  { value: "true_false", label: "Verdadeiro ou falso" },
  { value: "fill_blank", label: "Preencher lacuna" },
  { value: "open_short", label: "Resposta curta" },
  { value: "numeric", label: "Numérica" },
  { value: "multiple_select", label: "Múltipla seleção" },
  { value: "open_long", label: "Dissertativa" },
  { value: "match_columns", label: "Relacionar colunas" },
  { value: "ordering", label: "Ordenação" },
  { value: "text_interpretation", label: "Interpretação de texto" },
  { value: "explain_required", label: "Explicação obrigatória" },
  { value: "text_production", label: "Produção textual" },
];

// ─── Save feedback hook ───────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

function useSaveState(): [SaveState, (fn: () => Promise<{ error?: string }>) => void] {
  const [state, setState] = useState<SaveState>("idle");
  const [, startTransition] = useTransition();

  function save(fn: () => Promise<{ error?: string }>) {
    setState("saving");
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        setState("error");
        setTimeout(() => setState("idle"), 3000);
      } else {
        setState("saved");
        setTimeout(() => setState("idle"), 2000);
      }
    });
  }

  return [state, save];
}

function SaveButton({ state, label = "Salvar" }: { state: SaveState; label?: string }) {
  return (
    <Button
      type="submit"
      size="sm"
      disabled={state === "saving"}
      className={cn(
        "gap-1.5 min-w-[80px] transition-colors",
        state === "saved" && "bg-emerald-600 hover:bg-emerald-600 text-white",
        state === "error" && "bg-destructive hover:bg-destructive text-destructive-foreground"
      )}
    >
      {state === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {state === "saved" && <Check className="h-3.5 w-3.5" />}
      {state === "saving" ? "Salvando…" : state === "saved" ? "Salvo!" : state === "error" ? "Erro" : label}
    </Button>
  );
}

// ─── MetadataSection ─────────────────────────────────────────────────────────

function MetadataSection({ pack }: { pack: StudyPack }) {
  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState(pack.title);
  const [subject, setSubject] = useState(pack.subject);
  const [grade, setGrade] = useState(pack.grade);
  const [examName, setExamName] = useState(pack.examName);
  const [examDate, setExamDate] = useState(pack.examDate ?? "");
  const [saveState, save] = useSaveState();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    save(() => updatePackMeta(pack.id, { title, subject, grade, examName, examDate }));
  }

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="font-semibold text-foreground">Informações do pacote</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="border-t px-5 py-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Matéria</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Grade */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Série / Turma</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
                className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            {/* Exam name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Nome da prova</label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            {/* Exam date */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Data da prova</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <SaveButton state={saveState} />
          </div>
        </form>
      )}
    </div>
  );
}

// ─── ExerciseRow ─────────────────────────────────────────────────────────────

interface ExerciseRowProps {
  exercise: Exercise;
  packId: string;
  index: number;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Exercise>) => void;
}

function ExerciseRow({ exercise, packId, index, onDelete, onUpdate }: ExerciseRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [type, setType] = useState<Exercise["type"]>(exercise.type);
  const [statement, setStatement] = useState(exercise.statement);
  const [correctAnswer, setCorrectAnswer] = useState(exercise.correctAnswer);
  const [explanation, setExplanation] = useState(exercise.explanation ?? "");
  const [saveState, save] = useSaveState();
  const [, startDeleteTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const typeLabel = EXERCISE_TYPES.find((t) => t.value === exercise.type)?.label ?? exercise.type;
  const choicesType = type === "multiple_choice" || type === "true_false" || type === "multiple_select";

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    save(async () => {
      const result = await updateExercise(exercise.id, packId, {
        type,
        statement,
        correctAnswer,
        explanation,
      });
      if (!result.error) {
        onUpdate(exercise.id, { type, statement, correctAnswer, explanation });
        setExpanded(false);
      }
      return result;
    });
  }

  function handleDelete() {
    if (!window.confirm("Excluir este exercício? Esta ação não pode ser desfeita.")) return;
    setIsDeleting(true);
    startDeleteTransition(async () => {
      const result = await deleteExercise(exercise.id, packId);
      if (!result.error) {
        onDelete(exercise.id);
      } else {
        setIsDeleting(false);
      }
    });
  }

  if (isDeleting) return null;

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      {/* Collapsed row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
          {index + 1}
        </span>
        <Badge variant="secondary" className="shrink-0 text-xs">
          {typeLabel}
        </Badge>
        <p className="flex-1 text-sm text-foreground truncate">
          {exercise.statement.length > 80
            ? exercise.statement.slice(0, 80) + "…"
            : exercise.statement}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setExpanded((o) => !o)}
            title="Editar exercício"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            title="Excluir exercício"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Expanded edit form */}
      {expanded && (
        <form onSubmit={handleSave} className="border-t bg-muted/20 px-4 py-4 space-y-3">
          {/* Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tipo
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Exercise["type"])}
              className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              {EXERCISE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Statement */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Enunciado
            </label>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              required
              rows={3}
              className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Choices note */}
          {choicesType && (
            <p className="text-xs text-muted-foreground italic rounded-md border border-dashed px-3 py-2">
              Edição de alternativas disponível em breve.
            </p>
          )}

          {/* Correct answer */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Gabarito / Resposta esperada
            </label>
            <textarea
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              rows={2}
              className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Explanation */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Explicação
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
              className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(false)}
            >
              Cancelar
            </Button>
            <SaveButton state={saveState} />
          </div>
        </form>
      )}
    </div>
  );
}

// ─── TopicSection ─────────────────────────────────────────────────────────────

interface TopicSectionProps {
  topic: Topic;
  packId: string;
  exercises: Exercise[];
}

function TopicSection({ topic, packId, exercises: initialExercises }: TopicSectionProps) {
  const [title, setTitle] = useState(topic.title);
  const [summary, setSummary] = useState(topic.summary ?? "");
  const [titleSaveState, saveTitle] = useSaveState();
  const [summarySaveState, saveSummary] = useSaveState();
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [isAdding, setIsAdding] = useState(false);
  const [, startAddTransition] = useTransition();

  function handleSaveTitle(e: React.FormEvent) {
    e.preventDefault();
    saveTitle(() => updateTopic(topic.id, packId, { title, summary }));
  }

  function handleSaveSummary(e: React.FormEvent) {
    e.preventDefault();
    saveSummary(() => updateTopic(topic.id, packId, { title, summary }));
  }

  function handleDeleteExercise(id: string) {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  }

  function handleUpdateExercise(id: string, data: Partial<Exercise>) {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...data } : ex))
    );
  }

  function handleAddExercise() {
    setIsAdding(true);
    startAddTransition(async () => {
      const result = await addExercise(topic.id, packId, {
        type: "open_short",
        statement: "Nova questão",
        correctAnswer: "",
        explanation: "",
      });
      setIsAdding(false);
      if (result.id) {
        const newExercise: Exercise = {
          id: result.id,
          topicId: topic.id,
          type: "open_short",
          statement: "Nova questão",
          correctAnswer: "",
          explanation: "",
          order: exercises.length,
        };
        setExercises((prev) => [...prev, newExercise]);
      }
    });
  }

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      {/* Topic header */}
      <div className="px-5 py-4 border-b bg-muted/20">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Tópico
        </p>

        {/* Title field */}
        <form onSubmit={handleSaveTitle} className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Título do tópico"
            className="flex-1 rounded-md border bg-white px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <SaveButton state={titleSaveState} label="Salvar título" />
        </form>

        {/* Summary field */}
        <form onSubmit={handleSaveSummary} className="space-y-1.5">
          <label className="block text-xs font-medium text-muted-foreground">Resumo</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            placeholder="Resumo do tópico…"
            className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <div className="flex justify-end">
            <SaveButton state={summarySaveState} label="Salvar resumo" />
          </div>
        </form>
      </div>

      {/* Exercises */}
      <div className="px-5 py-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Exercícios ({exercises.length})
        </p>

        {exercises.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">
            Nenhum exercício neste tópico.
          </p>
        )}

        {exercises
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((ex, idx) => (
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              packId={packId}
              index={idx}
              onDelete={handleDeleteExercise}
              onUpdate={handleUpdateExercise}
            />
          ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-2 mt-2"
          onClick={handleAddExercise}
          disabled={isAdding}
        >
          {isAdding ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          {isAdding ? "Adicionando…" : "Adicionar exercício"}
        </Button>
      </div>
    </div>
  );
}

// ─── EditPackClient (main) ────────────────────────────────────────────────────

interface EditPackClientProps {
  pack: StudyPack;
  topics: Topic[];
  exercises: Exercise[];
}

export function EditPackClient({ pack, topics, exercises }: EditPackClientProps) {
  const backLink = (
    <Link
      href={"/pacotes/" + pack.id}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar
    </Link>
  );

  return (
    <>
      <Topbar title="Editar pacote" action={backLink} />

      <main className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Pack title + subject badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
              subjectColors[pack.subject]
            )}
          >
            {pack.subject}
          </span>
          <h2 className="text-lg font-semibold text-foreground">{pack.title}</h2>
        </div>

        {/* Metadata section */}
        <MetadataSection pack={pack} />

        {/* Topics */}
        {topics.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum tópico encontrado neste pacote.
            </p>
          </div>
        ) : (
          topics.map((topic) => (
            <TopicSection
              key={topic.id}
              topic={topic}
              packId={pack.id}
              exercises={exercises.filter((ex) => ex.topicId === topic.id)}
            />
          ))
        )}
      </main>
    </>
  );
}
