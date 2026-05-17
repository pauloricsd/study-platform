"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/pack/section-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { type Topic, type Exercise, questionTypeConfig } from "@/lib/mock-topics";
import { gradeOpenAnswer } from "@/lib/ai/grade-response";
import { TutorChat, type TutorChatProps } from "@/components/tutor/tutor-chat";
import { sendTutorMessage } from "./tutor-actions";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Trophy,
  ArrowLeft,
  Lightbulb,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

const AI_GRADED_TYPES = new Set([
  "open_short",
  "text_interpretation",
  "explain_required",
]);

// ─── Types ────────────────────────────────────────────────────────────────────

type AnswerState =
  | "idle"
  | "too_short"
  | "partial"
  | "incorrect"
  | "correct"
  | "revealed";

interface ExerciseResult {
  exercise: Exercise;
  userAnswer: string;
  correct: boolean;
  wasRevealed: boolean;
}

// ─── Answer evaluation ────────────────────────────────────────────────────────

function evaluateAnswer(
  exercise: Exercise,
  userAnswer: string,
  attempt: number
): AnswerState {
  const norm = (s: string) => s.trim().toLowerCase();

  if (exercise.type === "multiple_choice" || exercise.type === "true_false") {
    return norm(userAnswer) === norm(exercise.correctAnswer)
      ? "correct"
      : "incorrect";
  }

  if (exercise.type === "fill_blank") {
    const correct = norm(exercise.correctAnswer);
    const user = norm(userAnswer);
    if (user.length < 3) return "too_short";
    if (user === correct || correct.includes(user) || user.includes(correct))
      return "correct";
    return "incorrect";
  }

  if (exercise.type === "open_short" || exercise.type === "text_interpretation") {
    if (userAnswer.trim().length < 15) return "too_short";
    if (attempt === 1 && userAnswer.trim().length < 50) return "partial";
    return "correct";
  }

  if (exercise.type === "numeric") {
    return norm(userAnswer) === norm(exercise.correctAnswer)
      ? "correct"
      : "incorrect";
  }

  if (exercise.type === "multiple_select") {
    const sortIds = (s: string) => s.split(",").map((x) => x.trim()).sort().join(",");
    return sortIds(userAnswer) === sortIds(exercise.correctAnswer)
      ? "correct"
      : "incorrect";
  }

  if (exercise.type === "open_long" || exercise.type === "text_production") {
    if (userAnswer.trim().length < 30) return "too_short";
    return "partial";
  }

  if (exercise.type === "explain_required") {
    const [answer, explanation] = userAnswer.split("|||");
    if (!answer?.trim() || !explanation?.trim()) return "too_short";
    if (answer.trim().length < 10 || explanation.trim().length < 20) return "partial";
    return "correct";
  }

  if (exercise.type === "match_columns") {
    try {
      const correct = JSON.parse(exercise.correctAnswer) as Record<string, string>;
      const user = JSON.parse(userAnswer) as Record<string, string>;
      const allCorrect = Object.entries(correct).every(([k, v]) => user[k] === v);
      return allCorrect ? "correct" : "incorrect";
    } catch {
      return "incorrect";
    }
  }

  if (exercise.type === "ordering") {
    const correctOrder = exercise.correctAnswer.split(",").map((s) => s.trim());
    const userOrder = userAnswer.split(",").map((s) => s.trim());
    return JSON.stringify(correctOrder) === JSON.stringify(userOrder)
      ? "correct"
      : "incorrect";
  }

  return "incorrect";
}

// ─── Feedback config ──────────────────────────────────────────────────────────

const feedbackConfig: Record<
  Exclude<AnswerState, "idle">,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    title: string;
    message: string;
  }
> = {
  correct: {
    icon: CheckCircle2,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    title: "Correto!",
    message: "Muito bem! Você acertou essa questão.",
  },
  incorrect: {
    icon: XCircle,
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    title: "Não foi dessa vez.",
    message: "Tente novamente antes de ver o gabarito — você consegue!",
  },
  partial: {
    icon: AlertCircle,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    title: "Parcialmente correta.",
    message:
      "Sua resposta está no caminho certo, mas pode ser mais completa. Tente melhorar antes de ver o gabarito.",
  },
  too_short: {
    icon: AlertCircle,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    title: "Resposta muito curta.",
    message:
      "Sua resposta parece incompleta. Tente explicar um pouco mais antes de verificar.",
  },
  revealed: {
    icon: Eye,
    color: "text-muted-foreground",
    bg: "bg-muted/40",
    border: "border-border",
    title: "Gabarito revelado.",
    message: "Veja a resposta correta e a explicação abaixo.",
  },
  // runtime-only: used when maxAttempts is exhausted (mapped to "revealed" state)

};

// ─── Sub-components ───────────────────────────────────────────────────────────

function MultipleChoiceInput({
  exercise,
  selected,
  answerState,
  onSelect,
}: {
  exercise: Exercise;
  selected: string;
  answerState: AnswerState;
  onSelect: (id: string) => void;
}) {
  // Only reveal which answer is correct when the attempt is fully resolved
  const revealCorrect = answerState === "correct" || answerState === "revealed";

  return (
    <div className="space-y-2.5">
      {exercise.choices!.map((choice) => {
        const isSelected = selected === choice.id;
        const isCorrect = exercise.correctAnswer === choice.id;
        const answered = answerState !== "idle";

        return (
          <button
            key={choice.id}
            onClick={() => !answered && onSelect(choice.id)}
            disabled={answered}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all",
              !answered &&
                !isSelected &&
                "hover:border-primary/40 hover:bg-primary/5",
              !answered &&
                isSelected &&
                "border-primary bg-primary/10 font-medium",
              revealCorrect &&
                isCorrect &&
                "border-emerald-300 bg-emerald-50 text-emerald-800 font-medium",
              answered &&
                isSelected &&
                !isCorrect &&
                "border-red-300 bg-red-50 text-red-800",
              answered &&
                !revealCorrect &&
                !isSelected &&
                "opacity-50 bg-muted/30",
              revealCorrect &&
                !isCorrect &&
                !isSelected &&
                "opacity-50 bg-muted/30"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                !answered && isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-current"
              )}
            >
              {choice.label}
            </span>
            {choice.text}
            {revealCorrect && isCorrect && (
              <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function TrueFalseInput({
  selected,
  answerState,
  correctAnswer,
  onSelect,
}: {
  selected: string;
  answerState: AnswerState;
  correctAnswer: string;
  onSelect: (v: string) => void;
}) {
  const answered = answerState !== "idle";
  const revealCorrect = answerState === "correct" || answerState === "revealed";
  return (
    <div className="flex gap-3">
      {[
        { value: "true", label: "Verdadeiro" },
        { value: "false", label: "Falso" },
      ].map(({ value, label }) => {
        const isSelected = selected === value;
        const isCorrect = correctAnswer === value;
        return (
          <button
            key={value}
            onClick={() => !answered && onSelect(value)}
            disabled={answered}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-xl border py-4 text-sm font-medium transition-all",
              !answered &&
                !isSelected &&
                "hover:border-primary/40 hover:bg-primary/5",
              !answered && isSelected && "border-primary bg-primary/10 text-primary",
              revealCorrect &&
                isCorrect &&
                "border-emerald-300 bg-emerald-50 text-emerald-800",
              answered &&
                isSelected &&
                !isCorrect &&
                "border-red-300 bg-red-50 text-red-800",
              answered && !isSelected && !isCorrect && "opacity-40 bg-muted/30"
            )}
          >
            {revealCorrect && isCorrect && (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  disabled,
  multiline,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  multiline?: boolean;
  placeholder?: string;
}) {
  const cls = cn(
    "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-offset-background transition-all",
    "focus:ring-2 focus:ring-ring focus:ring-offset-2",
    disabled && "bg-muted/40 text-muted-foreground cursor-default"
  );
  if (multiline) {
    return (
      <textarea
        className={cn(cls, "resize-none min-h-[100px] leading-relaxed")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder ?? "Escreva sua resposta aqui..."}
        rows={4}
      />
    );
  }
  return (
    <input
      className={cls}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder ?? "Digite sua resposta..."}
    />
  );
}

function MultipleSelectInput({
  exercise,
  selected,
  answerState,
  onToggle,
}: {
  exercise: Exercise;
  selected: string[];
  answerState: AnswerState;
  onToggle: (id: string) => void;
}) {
  const answered = answerState !== "idle";
  const correct = exercise.correctAnswer.split(",").map((s) => s.trim());

  return (
    <div className="space-y-2.5">
      <p className="text-xs text-muted-foreground">Selecione todas as alternativas corretas.</p>
      {exercise.choices!.map((choice) => {
        const isSelected = selected.includes(choice.id);
        const isCorrect = correct.includes(choice.id);
        return (
          <button
            key={choice.id}
            onClick={() => !answered && onToggle(choice.id)}
            disabled={answered}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all",
              !answered && !isSelected && "hover:border-primary/40 hover:bg-primary/5",
              !answered && isSelected && "border-primary bg-primary/10 font-medium",
              answered && isCorrect && "border-emerald-300 bg-emerald-50 text-emerald-800 font-medium",
              answered && isSelected && !isCorrect && "border-red-300 bg-red-50 text-red-800",
              answered && !isSelected && !isCorrect && "opacity-50 bg-muted/30"
            )}
          >
            <span className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs",
              !answered && isSelected ? "border-primary bg-primary text-white" : "border-current"
            )}>
              {isSelected && "✓"}
            </span>
            <span className="font-medium mr-1">{choice.label})</span>
            {choice.text}
            {answered && isCorrect && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />}
          </button>
        );
      })}
    </div>
  );
}

function MatchColumnsInput({
  exercise,
  value,
  onChange,
  disabled,
}: {
  exercise: Exercise;
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  disabled: boolean;
}) {
  let correct: Record<string, string> = {};
  try { correct = JSON.parse(exercise.correctAnswer); } catch { /* empty */ }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Associe cada item da coluna esquerda com o correspondente da coluna direita.</p>
      {(exercise.leftItems ?? []).map((item, i) => {
        const key = String(i);
        const selected = value[key] ?? "";
        const isCorrect = disabled && correct[key] === selected;
        const isWrong = disabled && correct[key] !== selected;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-1 rounded-xl border bg-muted/30 px-4 py-3 text-sm font-medium">
              {item}
            </div>
            <span className="text-muted-foreground">→</span>
            <select
              disabled={disabled}
              value={selected}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              className={cn(
                "flex-1 rounded-xl border px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-ring",
                disabled && isCorrect && "border-emerald-300 bg-emerald-50 text-emerald-800",
                disabled && isWrong && "border-red-300 bg-red-50 text-red-800",
                disabled && "cursor-default"
              )}
            >
              <option value="">Selecione...</option>
              {exercise.choices!.map((c) => (
                <option key={c.id} value={c.id}>{c.label}) {c.text}</option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}

function OrderingInput({
  exercise,
  order,
  onMove,
  disabled,
}: {
  exercise: Exercise;
  order: string[];
  onMove: (from: number, to: number) => void;
  disabled: boolean;
}) {
  const correct = exercise.correctAnswer.split(",").map((s) => s.trim());
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-muted-foreground">Arranje os itens na ordem correta usando as setas.</p>
      {order.map((id, idx) => {
        const choice = exercise.choices!.find((c) => c.id === id);
        const isCorrect = disabled && correct[idx] === id;
        const isWrong = disabled && correct[idx] !== id;
        return (
          <div key={id} className={cn(
            "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm bg-white",
            disabled && isCorrect && "border-emerald-300 bg-emerald-50 text-emerald-800",
            disabled && isWrong && "border-red-300 bg-red-50 text-red-800",
          )}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
              {idx + 1}
            </span>
            <span className="flex-1">{choice?.text}</span>
            {!disabled && (
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => idx > 0 && onMove(idx, idx - 1)}
                  disabled={idx === 0}
                  className="rounded p-0.5 hover:bg-muted disabled:opacity-30"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => idx < order.length - 1 && onMove(idx, idx + 1)}
                  disabled={idx === order.length - 1}
                  className="rounded p-0.5 hover:bg-muted disabled:opacity-30"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {disabled && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            {disabled && isWrong && <XCircle className="h-4 w-4 text-red-400" />}
          </div>
        );
      })}
    </div>
  );
}

function ExplainRequiredInput({
  value,
  onChange,
  disabled,
}: {
  value: { answer: string; explanation: string };
  onChange: (v: { answer: string; explanation: string }) => void;
  disabled: boolean;
}) {
  const inputCls = cn(
    "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-offset-background transition-all focus:ring-2 focus:ring-ring focus:ring-offset-2",
    disabled && "bg-muted/40 text-muted-foreground cursor-default"
  );
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1.5">Sua resposta</p>
        <input
          className={inputCls}
          value={value.answer}
          onChange={(e) => onChange({ ...value, answer: e.target.value })}
          disabled={disabled}
          placeholder="Digite sua resposta..."
        />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1.5">Explique seu raciocínio <span className="text-red-500">*</span></p>
        <textarea
          className={cn(inputCls, "resize-none min-h-[80px] leading-relaxed")}
          value={value.explanation}
          onChange={(e) => onChange({ ...value, explanation: e.target.value })}
          disabled={disabled}
          placeholder="Explique como chegou a essa resposta..."
          rows={3}
        />
      </div>
    </div>
  );
}

// ─── Exercise card ────────────────────────────────────────────────────────────

function ExerciseCard({
  exercise,
  number,
  total,
  feedbackMode = "immediate",
  packId,
  topicId,
  onResult,
  onSendMessage,
}: {
  exercise: Exercise;
  number: number;
  total: number;
  feedbackMode?: "immediate" | "adaptive";
  packId: string;
  topicId: string;
  onResult: (result: ExerciseResult) => void;
  onSendMessage: TutorChatProps["onSendMessage"];
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const [multiSelectIds, setMultiSelectIds] = useState<string[]>([]);
  const [matchValue, setMatchValue] = useState<Record<string, string>>({});
  const [orderValue, setOrderValue] = useState<string[]>(
    exercise.type === "ordering" ? (exercise.choices ?? []).map((c) => c.id) : []
  );
  const [explainValue, setExplainValue] = useState({ answer: "", explanation: "" });
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [attempt, setAttempt] = useState(1);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [isGrading, startGrading] = useTransition();

  const typeConfig = questionTypeConfig[exercise.type];
  const answered = answerState !== "idle";
  const isDone = answerState === "correct" || answerState === "revealed";
  const feedback = answerState !== "idle" ? feedbackConfig[answerState] : null;

  function getEffectiveAnswer(): string {
    if (exercise.type === "multiple_select") return multiSelectIds.join(",");
    if (exercise.type === "match_columns") return JSON.stringify(matchValue);
    if (exercise.type === "ordering") return orderValue.join(",");
    if (exercise.type === "explain_required")
      return `${explainValue.answer}|||${explainValue.explanation}`;
    return userAnswer;
  }

  const maxAttempts = exercise.maxAttempts ?? null;
  const hideGabarito = exercise.hideCorrectAnswerDuringRetry ?? false;

  // Force reveal when attempts exhausted
  function applyResult(result: AnswerState) {
    const isWrong = result === "incorrect" || result === "partial" || result === "too_short";
    if (isWrong && maxAttempts !== null && attempt >= maxAttempts) {
      setAnswerState("revealed");
      setShowExplanation(true);
    } else {
      setAnswerState(result);
      if (result === "correct") setShowExplanation(true);
    }
  }

  function handleSubmit() {
    const effective = getEffectiveAnswer();
    if (!effective && exercise.type !== "multiple_choice" && exercise.type !== "true_false") return;

    if (AI_GRADED_TYPES.has(exercise.type)) {
      startGrading(async () => {
        const { verdict, feedback } = await gradeOpenAnswer({
          question: exercise.statement,
          correctAnswer: exercise.correctAnswer,
          userAnswer: effective,
          exerciseType: exercise.type,
          passage: exercise.passage ?? undefined,
          acceptanceCriteria: exercise.acceptanceCriteria ?? undefined,
        });
        setAiFeedback(feedback);
        applyResult(verdict);
      });
      return;
    }

    const result = evaluateAnswer(exercise, effective, attempt);
    applyResult(result);
  }

  function handleRetry() {
    setUserAnswer("");
    setMultiSelectIds([]);
    setMatchValue({});
    setOrderValue(exercise.type === "ordering" ? (exercise.choices ?? []).map((c) => c.id) : []);
    setExplainValue({ answer: "", explanation: "" });
    setAnswerState("idle");
    setAiFeedback("");
    setAttempt((a) => a + 1);
  }

  function handleReveal() {
    setAnswerState("revealed");
    setShowExplanation(true);
  }

  function handleNext() {
    const effective = getEffectiveAnswer();
    onResult({
      exercise,
      userAnswer: effective,
      correct: answerState === "correct",
      wasRevealed: answerState === "revealed",
    });
  }

  function moveOrderItem(from: number, to: number) {
    const next = [...orderValue];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrderValue(next);
  }

  const canSubmit =
    answerState === "idle" && (() => {
      if (exercise.type === "multiple_choice" || exercise.type === "true_false") return userAnswer !== "";
      if (exercise.type === "multiple_select") return multiSelectIds.length > 0;
      if (exercise.type === "match_columns")
        return (exercise.leftItems ?? []).every((_, i) => matchValue[String(i)]);
      if (exercise.type === "ordering") return orderValue.length > 0;
      if (exercise.type === "explain_required")
        return explainValue.answer.trim().length > 0 && explainValue.explanation.trim().length > 0;
      return userAnswer.trim().length > 0;
    })();

  function renderCorrectAnswer() {
    if (exercise.type === "multiple_choice") {
      return exercise.choices!.find((c) => c.id === exercise.correctAnswer)?.text;
    }
    if (exercise.type === "true_false") {
      return exercise.correctAnswer === "true" ? "Verdadeiro" : "Falso";
    }
    if (exercise.type === "multiple_select") {
      const ids = exercise.correctAnswer.split(",").map((s) => s.trim());
      return exercise.choices!.filter((c) => ids.includes(c.id)).map((c) => `${c.label}) ${c.text}`).join(", ");
    }
    if (exercise.type === "match_columns") {
      try {
        const correct = JSON.parse(exercise.correctAnswer) as Record<string, string>;
        return (exercise.leftItems ?? []).map((item, i) => {
          const choice = exercise.choices!.find((c) => c.id === correct[String(i)]);
          return `${item} → ${choice?.text ?? "?"}`;
        }).join(" | ");
      } catch { return exercise.correctAnswer; }
    }
    if (exercise.type === "ordering") {
      const ids = exercise.correctAnswer.split(",").map((s) => s.trim());
      return ids.map((id, i) => {
        const choice = exercise.choices!.find((c) => c.id === id);
        return `${i + 1}. ${choice?.text ?? id}`;
      }).join(" → ");
    }
    if (exercise.type === "explain_required") {
      const [ans, exp] = exercise.correctAnswer.split("|||");
      return exp ? `Resposta: ${ans} | Raciocínio: ${exp}` : exercise.correctAnswer;
    }
    return exercise.correctAnswer;
  }

  return (
    <div className="space-y-5">
      {/* Question header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {number}
          </span>
          <span className="text-xs text-muted-foreground">de {total}</span>
        </div>
        <span className={cn("text-xs font-medium", typeConfig.color)}>
          {typeConfig.label}
        </span>
      </div>

      {/* Passage (text_interpretation) */}
      {exercise.type === "text_interpretation" && exercise.passage && (
        <div className="rounded-xl border bg-muted/20 px-4 py-4 text-sm leading-relaxed text-foreground">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Leia o texto</p>
          <p className="whitespace-pre-wrap">{exercise.passage}</p>
        </div>
      )}

      {/* Statement */}
      <p className="text-base font-medium text-foreground leading-relaxed">
        {exercise.statement}
      </p>

      {/* Answer input */}
      <div>
        {exercise.type === "multiple_choice" && (
          <MultipleChoiceInput exercise={exercise} selected={userAnswer} answerState={answerState} onSelect={setUserAnswer} />
        )}
        {exercise.type === "true_false" && (
          <TrueFalseInput selected={userAnswer} answerState={answerState} correctAnswer={exercise.correctAnswer} onSelect={setUserAnswer} />
        )}
        {exercise.type === "multiple_select" && (
          <MultipleSelectInput
            exercise={exercise}
            selected={multiSelectIds}
            answerState={answerState}
            onToggle={(id) => setMultiSelectIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            )}
          />
        )}
        {exercise.type === "match_columns" && (
          <MatchColumnsInput exercise={exercise} value={matchValue} onChange={setMatchValue} disabled={answered} />
        )}
        {exercise.type === "ordering" && (
          <OrderingInput exercise={exercise} order={orderValue} onMove={moveOrderItem} disabled={answered} />
        )}
        {exercise.type === "fill_blank" && (
          <TextInput value={userAnswer} onChange={setUserAnswer} disabled={answered} placeholder="Complete a frase..." />
        )}
        {(exercise.type === "open_short" || exercise.type === "text_interpretation") && (
          <TextInput value={userAnswer} onChange={setUserAnswer} disabled={answered} multiline />
        )}
        {(exercise.type === "open_long" || exercise.type === "text_production") && (
          <TextInput value={userAnswer} onChange={setUserAnswer} disabled={answered} multiline
            placeholder={exercise.type === "text_production" ? "Desenvolva sua produção textual aqui..." : "Escreva sua resposta detalhada..."} />
        )}
        {exercise.type === "numeric" && (
          <TextInput value={userAnswer} onChange={setUserAnswer} disabled={answered} placeholder="Digite o valor numérico..." />
        )}
        {exercise.type === "explain_required" && (
          <ExplainRequiredInput value={explainValue} onChange={setExplainValue} disabled={answered} />
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={cn("rounded-xl border p-4 space-y-2", feedback.bg, feedback.border)}>
          <div className="flex items-center gap-2">
            <feedback.icon className={cn("h-5 w-5 shrink-0", feedback.color)} />
            <span className={cn("text-sm font-semibold", feedback.color)}>{feedback.title}</span>
          </div>
          <p className={cn("text-sm leading-relaxed", feedback.color)}>
            {aiFeedback || feedback.message}
          </p>

          {showExplanation && (
            <div className="mt-3 pt-3 border-t border-current/20 space-y-2">
              {answerState === "revealed" && (
                <div className="rounded-lg bg-white/60 px-3 py-2">
                  <p className="text-xs font-semibold text-foreground mb-0.5">Resposta correta</p>
                  <p className="text-sm text-foreground">{renderCorrectAnswer()}</p>
                </div>
              )}
              <div className="rounded-lg bg-white/60 px-3 py-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                  <p className="text-xs font-semibold text-foreground">Explicação</p>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{exercise.explanation}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* open_long / text_production: always show reveal after partial */}
      {(exercise.type === "open_long" || exercise.type === "text_production") &&
        answerState === "partial" && !showExplanation && (
        <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground"
          onClick={() => setShowExplanation(true)}>
          <Lightbulb className="h-3.5 w-3.5" />
          Ver resposta de referência
        </Button>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {(answerState === "idle" || isGrading) && (
          <Button onClick={handleSubmit} disabled={!canSubmit || isGrading} className="gap-2">
            {isGrading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Corrigindo...
              </>
            ) : (
              <>
                Responder
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}

        {(answerState === "incorrect" || answerState === "partial" || answerState === "too_short") &&
          exercise.type !== "open_long" && exercise.type !== "text_production" && (() => {
            const attemptsLeft = maxAttempts !== null ? maxAttempts - attempt : null;
            const canRetry = maxAttempts === null || attempt < maxAttempts;
            const canRevealBtn = !hideGabarito && (feedbackMode === "immediate" || attempt >= 2);
            return (
              <>
                {canRetry && (
                  <Button onClick={handleRetry} variant="outline" className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Tentar novamente
                    {attemptsLeft !== null && attemptsLeft > 0 && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({attemptsLeft} restante{attemptsLeft !== 1 ? "s" : ""})
                      </span>
                    )}
                  </Button>
                )}
                {canRevealBtn && (
                  <Button onClick={handleReveal} variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
                    <Eye className="h-4 w-4" />
                    Ver gabarito
                  </Button>
                )}
              </>
            );
          })()
        }

        {isDone && (
          <Button onClick={handleNext} className="gap-2">
            Próxima questão
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* open_long / text_production: advance after partial */}
        {(exercise.type === "open_long" || exercise.type === "text_production") &&
          answerState === "partial" && (
          <Button onClick={handleNext} variant="outline" className="gap-2">
            Avançar mesmo assim
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tutor IA — modo exercício */}
      <TutorChat
        packId={packId}
        topicId={topicId}
        mode="exercise"
        exerciseId={exercise.id}
        exerciseStatement={exercise.statement}
        exerciseType={exercise.type}
        studentAnswer={getEffectiveAnswer()}
        answerState={answerState}
        attemptNumber={attempt}
        previousFeedback={aiFeedback || undefined}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}

// ─── Question review (results detail) ─────────────────────────────────────────

function formatAnswer(exercise: Exercise, answer: string): string {
  if (!answer) return "Sem resposta";
  if (exercise.type === "multiple_choice") {
    const choice = exercise.choices?.find((c) => c.id === answer);
    return choice ? `${choice.label} — ${choice.text}` : answer;
  }
  if (exercise.type === "true_false") return answer === "true" ? "Verdadeiro" : "Falso";
  if (exercise.type === "multiple_select") {
    const ids = answer.split(",").map((s) => s.trim());
    return exercise.choices?.filter((c) => ids.includes(c.id)).map((c) => `${c.label}) ${c.text}`).join(", ") ?? answer;
  }
  if (exercise.type === "match_columns") {
    try {
      const map = JSON.parse(answer) as Record<string, string>;
      return (exercise.leftItems ?? []).map((item, i) => {
        const choice = exercise.choices?.find((c) => c.id === map[String(i)]);
        return `${item} → ${choice?.text ?? "?"}`;
      }).join(" | ");
    } catch { return answer; }
  }
  if (exercise.type === "ordering") {
    const ids = answer.split(",").map((s) => s.trim());
    return ids.map((id, i) => {
      const choice = exercise.choices?.find((c) => c.id === id);
      return `${i + 1}. ${choice?.text ?? id}`;
    }).join(" → ");
  }
  if (exercise.type === "explain_required") {
    const [ans, exp] = answer.split("|||");
    return exp ? `${ans} (raciocínio: ${exp})` : answer;
  }
  return answer;
}

function formatCorrectAnswer(exercise: Exercise): string {
  if (exercise.type === "multiple_choice") {
    const choice = exercise.choices?.find((c) => c.id === exercise.correctAnswer);
    return choice ? `${choice.label} — ${choice.text}` : exercise.correctAnswer;
  }
  if (exercise.type === "true_false") return exercise.correctAnswer === "true" ? "Verdadeiro" : "Falso";
  if (exercise.type === "multiple_select") {
    const ids = exercise.correctAnswer.split(",").map((s) => s.trim());
    return exercise.choices?.filter((c) => ids.includes(c.id)).map((c) => `${c.label}) ${c.text}`).join(", ") ?? exercise.correctAnswer;
  }
  if (exercise.type === "match_columns") {
    try {
      const correct = JSON.parse(exercise.correctAnswer) as Record<string, string>;
      return (exercise.leftItems ?? []).map((item, i) => {
        const choice = exercise.choices?.find((c) => c.id === correct[String(i)]);
        return `${item} → ${choice?.text ?? "?"}`;
      }).join(" | ");
    } catch { return exercise.correctAnswer; }
  }
  if (exercise.type === "ordering") {
    const ids = exercise.correctAnswer.split(",").map((s) => s.trim());
    return ids.map((id, i) => {
      const choice = exercise.choices?.find((c) => c.id === id);
      return `${i + 1}. ${choice?.text ?? id}`;
    }).join(" → ");
  }
  if (exercise.type === "explain_required") {
    const [ans, exp] = exercise.correctAnswer.split("|||");
    return exp ? `${ans} (raciocínio: ${exp})` : exercise.correctAnswer;
  }
  return exercise.correctAnswer;
}

function QuestionReviewCard({
  result,
  number,
}: {
  result: ExerciseResult;
  number: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { exercise, correct, wasRevealed, userAnswer } = result;
  const typeConfig = questionTypeConfig[exercise.type];

  return (
    <div
      className={cn(
        "rounded-xl border bg-white overflow-hidden",
        correct ? "border-emerald-200" : "border-red-200"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3",
          correct ? "bg-emerald-50" : "bg-red-50"
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white",
              correct ? "bg-emerald-500" : "bg-red-400"
            )}
          >
            {number}
          </span>
          <span className={cn("text-xs font-medium", typeConfig.color)}>
            {typeConfig.label}
          </span>
          {wasRevealed && (
            <span className="text-xs text-muted-foreground">· Gabarito revelado</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {correct ? (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Correto
            </span>
          ) : (
            <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5" /> Incorreto
            </span>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        <p className="text-sm text-foreground leading-relaxed">
          {exercise.statement}
        </p>

        {expanded && (
          <div className="space-y-2.5 pt-1 border-t">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Sua resposta
              </p>
              <p
                className={cn(
                  "text-sm rounded-lg px-3 py-2",
                  correct
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-red-50 text-red-800"
                )}
              >
                {formatAnswer(exercise, userAnswer)}
              </p>
            </div>

            {!correct && (
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Resposta correta
                </p>
                <p className="text-sm rounded-lg px-3 py-2 bg-emerald-50 text-emerald-800">
                  {formatCorrectAnswer(exercise)}
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Explicação
                </p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {exercise.explanation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main study flow ──────────────────────────────────────────────────────────

type Phase = "reading" | "exercises" | "results";

export interface ExerciseResponseData {
  exerciseId: string;
  userAnswer: string;
  isCorrect: boolean;
  wasRevealed: boolean;
}

interface StudyFlowProps {
  topic: Topic;
  topics: Topic[];
  exercises: Exercise[];
  packId: string;
  feedbackMode?: "immediate" | "adaptive";
  onComplete?: (data: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    responses: ExerciseResponseData[];
  }) => Promise<void>;
}

export function StudyFlow({ topic, topics, exercises, packId, feedbackMode = "immediate", onComplete }: StudyFlowProps) {
  const [phase, setPhase] = useState<Phase>("reading");
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);

  const topicIdx = topics.findIndex((t) => t.id === topic.id);
  const nextTopic = topics[topicIdx + 1];
  const topicExercises = exercises.filter((e) => e.topicId === topic.id);

  const correctCount = results.filter((r) => r.correct).length;
  const scorePercent =
    results.length > 0
      ? Math.round((correctCount / results.length) * 100)
      : 0;

  function handleExerciseResult(result: ExerciseResult) {
    const newResults = [...results, result];
    setResults(newResults);
    if (currentExIdx < topicExercises.length - 1) {
      setCurrentExIdx((i) => i + 1);
    } else {
      setPhase("results");
      if (onComplete) {
        const correct = newResults.filter((r) => r.correct).length;
        const total = newResults.length;
        const score = total > 0 ? Math.round((correct / total) * 100) : 0;
        onComplete({
          score,
          correctAnswers: correct,
          totalQuestions: total,
          responses: newResults.map((r) => ({
            exerciseId: r.exercise.id,
            userAnswer: r.userAnswer,
            isCorrect: r.correct,
            wasRevealed: r.wasRevealed,
          })),
        }).catch(() => {});
      }
    }
  }

  // ── Top bar ──────────────────────────────────────────────────────────────
  const TopBar = () => (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-4 px-4">
        <Link
          href={`/estudar/${packId}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-medium text-foreground truncate">
              {topic.title}
            </span>
            <span className="shrink-0 ml-2">
              Tópico {topicIdx + 1}/{topics.length}
            </span>
          </div>
          <Progress
            value={
              phase === "reading"
                ? 10
                : phase === "exercises"
                ? 10 + (currentExIdx / topicExercises.length) * 80
                : 100
            }
            className="h-1.5"
          />
        </div>
      </div>
    </header>
  );

  // ── Reading phase ────────────────────────────────────────────────────────
  if (phase === "reading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="mx-auto max-w-2xl px-4 py-6 space-y-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>
              Leitura · {topic.sections.length} seções
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {topic.title}
            </h1>
            <p className="text-muted-foreground mt-1">{topic.summary}</p>
          </div>

          <div className="space-y-4">
            {topic.sections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>

          <div className="sticky bottom-0 py-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent -mx-4 px-4">
            {topicExercises.length > 0 ? (
              <Button
                className="w-full h-12 text-base gap-2"
                onClick={() => setPhase("exercises")}
              >
                Ir para os exercícios
                <ChevronRight className="h-5 w-5" />
              </Button>
            ) : (
              <Link href={`/estudar/${packId}`}>
                <Button
                  className="w-full h-12 text-base gap-2"
                  variant="outline"
                >
                  Voltar ao pacote
                </Button>
              </Link>
            )}
          </div>
        </main>

        {/* Tutor IA — modo estudo */}
        <TutorChat
          packId={packId}
          topicId={topic.id}
          mode="study"
          onSendMessage={sendTutorMessage}
        />
      </div>
    );
  }

  // ── Exercise phase ───────────────────────────────────────────────────────
  if (phase === "exercises") {
    const current = topicExercises[currentExIdx];

    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="mx-auto max-w-2xl px-4 py-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <ExerciseCard
              key={current.id}
              exercise={current}
              number={currentExIdx + 1}
              total={topicExercises.length}
              feedbackMode={feedbackMode}
              packId={packId}
              topicId={topic.id}
              onResult={handleExerciseResult}
              onSendMessage={sendTutorMessage}
            />
          </div>
        </main>
      </div>
    );
  }

  // ── Results phase ────────────────────────────────────────────────────────
  const isGreat = scorePercent >= 80;
  const isOk = scorePercent >= 50 && scorePercent < 80;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 py-8 space-y-5">
        {/* Score card */}
        <div className="rounded-2xl border bg-white p-8 text-center space-y-4 shadow-sm">
          <div
            className={cn(
              "mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl",
              isGreat
                ? "bg-emerald-100"
                : isOk
                ? "bg-amber-100"
                : "bg-red-100"
            )}
          >
            {isGreat ? "🎉" : isOk ? "💪" : "📖"}
          </div>

          <div>
            <p className="text-3xl font-bold text-foreground">{scorePercent}%</p>
            <p
              className={cn(
                "text-lg font-semibold mt-0.5",
                isGreat
                  ? "text-emerald-700"
                  : isOk
                  ? "text-amber-700"
                  : "text-red-700"
              )}
            >
              {isGreat
                ? "Excelente!"
                : isOk
                ? "Bom trabalho!"
                : "Continue praticando!"}
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Você acertou <strong>{correctCount}</strong> de{" "}
            <strong>{topicExercises.length}</strong> questões.
          </p>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {results.map((r, i) => (
              <div
                key={i}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white",
                  r.correct ? "bg-emerald-500" : "bg-red-400"
                )}
              >
                {r.correct ? "✓" : "✗"}
              </div>
            ))}
          </div>

          {!isGreat && (
            <p className="text-xs text-muted-foreground">
              Dica: revise as seções deste tópico e tente novamente para
              melhorar seu desempenho.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {nextTopic ? (
            <Link href={`/estudar/${packId}/topico/${nextTopic.id}`}>
              <Button className="w-full h-12 text-base gap-2">
                Próximo tópico: {nextTopic.title}
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link href={`/estudar/${packId}`}>
              <Button className="w-full h-12 text-base gap-2">
                <Trophy className="h-5 w-5" />
                Ver resultado final
              </Button>
            </Link>
          )}

          <button
            onClick={() => {
              setPhase("exercises");
              setCurrentExIdx(0);
              setResults([]);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl border bg-white py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Refazer exercícios
          </button>

          <Link
            href={`/estudar/${packId}`}
            className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Voltar ao pacote
          </Link>
        </div>

        {/* Per-question review */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Revisão das questões
          </h2>
          <div className="space-y-3">
            {results.map((result, i) => (
              <QuestionReviewCard key={i} result={result} number={i + 1} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
