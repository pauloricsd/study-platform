"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type StudyPack, subjectColors } from "@/lib/mock-data";
import { type Topic, type Exercise, type Section, type SectionType } from "@/lib/mock-topics";
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
  X,
  Upload,
} from "lucide-react";
import {
  updatePackMeta,
  updateTopic,
  updateExercise,
  addExercise,
  deleteExercise,
  addSection,
  updateSection,
  deleteSection,
} from "./actions";
import { AiAssistantPanel } from "./ai-assistant-panel";
import { UploadTopicDialog } from "./upload-topic-dialog";

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

const SECTION_TYPES: { value: SectionType; label: string; color: string }[] = [
  { value: "explanation", label: "Explicação", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "example", label: "Exemplo", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "summary", label: "Resumo", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "note", label: "Atenção", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "common_mistake", label: "Erro comum", color: "bg-red-50 text-red-700 border-red-200" },
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

// ── Default choice sets ───────────────────────────────────────────────────────

type Choice = NonNullable<Exercise["choices"]>[number];

function defaultChoices(exerciseType: Exercise["type"]): Choice[] {
  if (exerciseType === "true_false") {
    return [
      { id: "t", label: "V", text: "Verdadeiro" },
      { id: "f", label: "F", text: "Falso" },
    ];
  }
  return [
    { id: "a", label: "A", text: "" },
    { id: "b", label: "B", text: "" },
    { id: "c", label: "C", text: "" },
    { id: "d", label: "D", text: "" },
  ];
}

// ── ChoicesEditor ─────────────────────────────────────────────────────────────

function ChoicesEditor({
  exerciseType,
  choices,
  correctAnswer,
  onChoicesChange,
  onCorrectAnswerChange,
}: {
  exerciseType: Exercise["type"];
  choices: Choice[];
  correctAnswer: string;
  onChoicesChange: (c: Choice[]) => void;
  onCorrectAnswerChange: (v: string) => void;
}) {
  const isMultiSelect = exerciseType === "multiple_select";
  const isTrueFalse = exerciseType === "true_false";
  // Multiple select: correctAnswer is comma-separated labels
  const selectedLabels = isMultiSelect
    ? correctAnswer.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  function toggleMultiSelect(label: string) {
    const next = selectedLabels.includes(label)
      ? selectedLabels.filter((l) => l !== label)
      : [...selectedLabels, label];
    onCorrectAnswerChange(next.join(","));
  }

  function updateChoiceText(id: string, text: string) {
    onChoicesChange(choices.map((c) => (c.id === id ? { ...c, text } : c)));
  }

  return (
    <div className="space-y-2">
      {choices.map((choice) => {
        const isCorrect = isMultiSelect
          ? selectedLabels.includes(choice.label)
          : correctAnswer === choice.label;

        return (
          <div
            key={choice.id}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
              isCorrect ? "border-emerald-300 bg-emerald-50" : "border-border bg-white"
            }`}
          >
            {/* Select correct answer */}
            <button
              type="button"
              onClick={() => {
                if (isMultiSelect) toggleMultiSelect(choice.label);
                else onCorrectAnswerChange(choice.label);
              }}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors ${
                isCorrect
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-muted-foreground/30 text-muted-foreground hover:border-primary/60"
              }`}
              title={isCorrect ? "Resposta correta" : "Marcar como correta"}
            >
              {isCorrect ? <Check className="h-3 w-3" /> : choice.label}
            </button>

            {/* Choice text */}
            {isTrueFalse ? (
              <span className="text-sm font-medium flex-1">{choice.text}</span>
            ) : (
              <input
                type="text"
                value={choice.text}
                onChange={(e) => updateChoiceText(choice.id, e.target.value)}
                placeholder={`Alternativa ${choice.label}…`}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
              />
            )}
          </div>
        );
      })}
      <p className="text-[11px] text-muted-foreground">
        {isMultiSelect
          ? "Clique nos círculos para marcar as alternativas corretas (pode ser mais de uma)."
          : isTrueFalse
          ? "Clique no círculo para indicar a resposta correta."
          : "Clique no círculo para indicar a alternativa correta."}
      </p>
    </div>
  );
}

// ─── ExerciseRow ─────────────────────────────────────────────────────────────

function ExerciseRow({ exercise, packId, index, onDelete, onUpdate }: ExerciseRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [type, setType] = useState<Exercise["type"]>(exercise.type);
  const [statement, setStatement] = useState(exercise.statement);
  const [correctAnswer, setCorrectAnswer] = useState(exercise.correctAnswer);
  const [explanation, setExplanation] = useState(exercise.explanation ?? "");
  const [choices, setChoices] = useState<Choice[]>(
    exercise.choices?.length ? exercise.choices : defaultChoices(exercise.type)
  );
  const [maxAttempts, setMaxAttempts] = useState<string>(
    exercise.maxAttempts != null ? String(exercise.maxAttempts) : ""
  );
  const [hideCorrectAnswer, setHideCorrectAnswer] = useState(
    exercise.hideCorrectAnswerDuringRetry ?? false
  );
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(
    exercise.acceptanceCriteria ?? ""
  );

  const AI_GRADABLE = new Set([
    "open_short", "text_interpretation", "explain_required", "open_long", "text_production",
  ]);
  const [saveState, save] = useSaveState();
  const [, startDeleteTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const typeLabel = EXERCISE_TYPES.find((t) => t.value === exercise.type)?.label ?? exercise.type;
  const choicesType = type === "multiple_choice" || type === "true_false" || type === "multiple_select";

  // Reset choices when type changes
  function handleTypeChange(newType: Exercise["type"]) {
    setType(newType);
    const needsChoices = newType === "multiple_choice" || newType === "true_false" || newType === "multiple_select";
    if (needsChoices) {
      setChoices(defaultChoices(newType));
      setCorrectAnswer("");
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const parsedMax = maxAttempts.trim() !== "" ? parseInt(maxAttempts, 10) : null;
    const payload = {
      type,
      statement,
      choices: choicesType ? choices : undefined,
      correctAnswer,
      explanation,
      maxAttempts: parsedMax && !isNaN(parsedMax) && parsedMax > 0 ? parsedMax : null,
      hideCorrectAnswerDuringRetry: hideCorrectAnswer,
      acceptanceCriteria: acceptanceCriteria.trim() || null,
    };
    save(async () => {
      const result = await updateExercise(exercise.id, packId, payload);
      if (!result.error) {
        onUpdate(exercise.id, {
          type, statement,
          choices: choicesType ? choices : undefined,
          correctAnswer, explanation,
          maxAttempts: payload.maxAttempts,
          hideCorrectAnswerDuringRetry: hideCorrectAnswer,
          acceptanceCriteria: payload.acceptanceCriteria,
        });
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
              onChange={(e) => handleTypeChange(e.target.value as Exercise["type"])}
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

          {/* Choices editor (multiple_choice, true_false, multiple_select) */}
          {choicesType && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Alternativas
              </label>
              <ChoicesEditor
                exerciseType={type}
                choices={choices}
                correctAnswer={correctAnswer}
                onChoicesChange={setChoices}
                onCorrectAnswerChange={setCorrectAnswer}
              />
            </div>
          )}

          {/* Correct answer — only for non-choices types */}
          {!choicesType && (
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
          )}

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

          {/* Acceptance criteria — AI-graded types only */}
          {AI_GRADABLE.has(type) && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Critérios de aceite{" "}
                <span className="normal-case font-normal text-primary/70">(para correção por IA)</span>
              </label>
              <textarea
                value={acceptanceCriteria}
                onChange={(e) => setAcceptanceCriteria(e.target.value)}
                rows={3}
                placeholder="Ex: A resposta deve mencionar que substantivo nomeia seres ou objetos. Não precisa listar os tipos."
                className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/50"
              />
              <p className="text-[11px] text-muted-foreground">
                Instrua a IA sobre o que esperar na resposta do aluno. Deixe vazio para usar apenas o gabarito como referência.
              </p>
            </div>
          )}

          {/* Retry settings */}
          <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-3 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Configurações de tentativa
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap">
                  Máx. tentativas
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                  placeholder="∞"
                  className="w-16 rounded-md border bg-white px-2 py-1 text-sm text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <span className="text-xs text-muted-foreground">vazio = ilimitado</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideCorrectAnswer}
                  onChange={(e) => setHideCorrectAnswer(e.target.checked)}
                  className="rounded border-muted accent-primary"
                />
                <span className="text-xs text-muted-foreground">
                  Ocultar gabarito durante tentativas
                </span>
              </label>
            </div>
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

// ─── SectionRow ───────────────────────────────────────────────────────────────

interface SectionRowProps {
  section: Section;
  packId: string;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Section>) => void;
}

function SectionRow({ section, packId, onDelete, onUpdate }: SectionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [type, setType] = useState<SectionType>(section.type);
  const [title, setTitle] = useState(section.title ?? "");
  const [content, setContent] = useState(section.content);
  const [saveState, save] = useSaveState();
  const [, startDeleteTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const typeInfo = SECTION_TYPES.find((t) => t.value === section.type) ?? SECTION_TYPES[0];

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    save(async () => {
      const result = await updateSection(section.id, packId, { type, title, content });
      if (!result.error) {
        onUpdate(section.id, { type, title: title || undefined, content });
        setExpanded(false);
      }
      return result;
    });
  }

  function handleDelete() {
    if (!window.confirm("Excluir esta seção de conteúdo? Esta ação não pode ser desfeita.")) return;
    setIsDeleting(true);
    startDeleteTransition(async () => {
      const result = await deleteSection(section.id, packId);
      if (!result.error) {
        onDelete(section.id);
      } else {
        setIsDeleting(false);
      }
    });
  }

  if (isDeleting) return null;

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      {/* Collapsed row */}
      <div className="flex items-start gap-3 px-4 py-3">
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold mt-0.5",
            typeInfo.color
          )}
        >
          {typeInfo.label}
        </span>
        <p className="flex-1 text-sm text-foreground line-clamp-2">
          {section.title ? (
            <><span className="font-medium">{section.title}:</span>{" "}</>
          ) : null}
          {section.content.replace(/\*\*/g, "").slice(0, 100)}
          {section.content.length > 100 ? "…" : ""}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setExpanded((o) => !o)}
            title="Editar seção"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            title="Excluir seção"
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
              Tipo de seção
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as SectionType)}
              className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              {SECTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Title (optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Título <span className="normal-case font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da seção…"
              className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Conteúdo
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              placeholder="Conteúdo da seção…"
              className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <p className="text-[11px] text-muted-foreground">
              Use **negrito** para destacar termos importantes.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setExpanded(false);
                setType(section.type);
                setTitle(section.title ?? "");
                setContent(section.content);
              }}
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
  const [sections, setSections] = useState<Section[]>(topic.sections ?? []);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [, startAddTransition] = useTransition();
  const [, startAddSectionTransition] = useTransition();

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

  function handleDeleteSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  function handleUpdateSection(id: string, data: Partial<Section>) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
  }

  function handleAddSection() {
    setIsAddingSection(true);
    startAddSectionTransition(async () => {
      const result = await addSection(topic.id, packId, {
        type: "explanation",
        title: "",
        content: "Nova seção de conteúdo.",
      });
      setIsAddingSection(false);
      if (result.id) {
        const newSection: Section = {
          id: result.id,
          type: "explanation",
          content: "Nova seção de conteúdo.",
        };
        setSections((prev) => [...prev, newSection]);
      }
    });
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

      {/* Sections */}
      <div className="px-5 py-4 space-y-2 border-b">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Conteúdo ({sections.length})
          </p>
        </div>

        {sections.length === 0 && (
          <p className="text-sm text-muted-foreground py-1">
            Nenhuma seção de conteúdo neste tópico.
          </p>
        )}

        {sections.map((sec) => (
          <SectionRow
            key={sec.id}
            section={sec}
            packId={packId}
            onDelete={handleDeleteSection}
            onUpdate={handleUpdateSection}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-2 mt-2"
          onClick={handleAddSection}
          disabled={isAddingSection}
        >
          {isAddingSection ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          {isAddingSection ? "Adicionando…" : "Adicionar seção de conteúdo"}
        </Button>
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
  const [uploadOpen, setUploadOpen] = useState(false);

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

      <UploadTopicDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        packId={pack.id}
        subject={pack.subject}
        grade={pack.grade}
        examName={pack.examName ?? ""}
        topics={topics}
      />

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

        {/* AI Assistant */}
        <AiAssistantPanel packId={pack.id} />

        {/* Topics header + import button */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Tópicos ({topics.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setUploadOpen(true)}
          >
            <Upload className="h-3.5 w-3.5" />
            Importar PDF
          </Button>
        </div>

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
