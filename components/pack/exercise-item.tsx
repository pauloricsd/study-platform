import { type Exercise, questionTypeConfig } from "@/lib/mock-topics";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface ExerciseItemProps {
  exercise: Exercise;
  number: number;
}

export function ExerciseItem({ exercise, number }: ExerciseItemProps) {
  const typeConfig = questionTypeConfig[exercise.type];

  return (
    <div className="rounded-xl border bg-white p-5 space-y-4 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {number}
          </span>
          <p className="text-sm font-medium text-foreground leading-relaxed pt-0.5">
            {exercise.statement}
          </p>
        </div>
        <span className={cn("text-xs font-medium shrink-0 whitespace-nowrap", typeConfig.color)}>
          {typeConfig.label}
        </span>
      </div>

      {/* Choices */}
      {exercise.choices && (
        <div className="ml-10 space-y-2">
          {exercise.choices.map((choice) => {
            const isCorrect = exercise.correctAnswer === choice.id;
            return (
              <div
                key={choice.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm",
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-border bg-muted/30 text-muted-foreground"
                )}
              >
                {isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                )}
                <span className="font-medium mr-1">{choice.label})</span>
                {choice.text}
              </div>
            );
          })}
        </div>
      )}

      {/* True/false answer */}
      {exercise.type === "true_false" && (
        <div className="ml-10 flex gap-2">
          {["true", "false"].map((val) => {
            const isCorrect = exercise.correctAnswer === val;
            return (
              <div
                key={val}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm",
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-border bg-muted/30 text-muted-foreground"
                )}
              >
                {isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40" />
                )}
                {val === "true" ? "Verdadeiro" : "Falso"}
              </div>
            );
          })}
        </div>
      )}

      {/* Fill blank / open / numeric answer */}
      {(exercise.type === "fill_blank" ||
        exercise.type === "open_short" ||
        exercise.type === "numeric") && (
        <div className="ml-10">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            <p className="text-xs font-semibold text-emerald-700 mb-1">Resposta esperada</p>
            <p className="text-sm text-emerald-800">{exercise.correctAnswer}</p>
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="ml-10 rounded-lg bg-muted/40 px-3 py-2.5">
        <p className="text-xs font-semibold text-muted-foreground mb-1">Explicação do gabarito</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{exercise.explanation}</p>
      </div>
    </div>
  );
}
