"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { approveSuggestedQuestion, rejectSuggestedQuestion } from "@/lib/data/suggestions";
import type { SuggestedQuestion } from "@/lib/data/suggestions";
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Lightbulb,
  BarChart2,
} from "lucide-react";

// ─── Exercise type labels ─────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: "Múltipla escolha",
  true_false: "V ou F",
  fill_blank: "Complete",
  open_short: "Aberta curta",
  numeric: "Numérica",
  multiple_select: "Múltipla seleção",
  open_long: "Dissertativa",
  match_columns: "Relacionar colunas",
  ordering: "Ordenar",
  text_interpretation: "Interpretação",
  explain_required: "Explicar",
  text_production: "Produção textual",
};

const DIFFICULTY_CONFIG = {
  easy: { label: "Fácil", className: "bg-emerald-100 text-emerald-700" },
  medium: { label: "Médio", className: "bg-amber-100 text-amber-700" },
  hard: { label: "Difícil", className: "bg-red-100 text-red-700" },
};

// ─── Single suggestion card ───────────────────────────────────────────────────

interface SuggestionCardProps {
  sq: SuggestedQuestion;
  packId: string;
  onStatusChange: (id: string, status: "approved" | "rejected") => void;
}

function SuggestionCard({ sq, packId, onStatusChange }: SuggestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const difficulty = sq.difficulty ? DIFFICULTY_CONFIG[sq.difficulty] : null;
  const typeLabel = TYPE_LABELS[sq.type] ?? sq.type;

  function handleApprove() {
    startTransition(async () => {
      const result = await approveSuggestedQuestion(sq, packId);
      if (!("error" in result)) onStatusChange(sq.id, "approved");
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectSuggestedQuestion(sq.id);
      onStatusChange(sq.id, "rejected");
    });
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {sq.topic_title && (
              <span className="text-[11px] text-gray-500 font-medium">{sq.topic_title}</span>
            )}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{typeLabel}</Badge>
            {difficulty && (
              <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", difficulty.className)}>
                {difficulty.label}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-800 leading-snug">{sq.statement}</p>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-3">
          {/* Choices */}
          {sq.choices && Array.isArray(sq.choices) && (sq.choices as { id: string; label: string; text: string }[]).length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Alternativas</p>
              {(sq.choices as { id: string; label: string; text: string }[]).map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "flex items-start gap-2 text-sm rounded-lg px-3 py-2",
                    c.id === sq.correct_answer
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-white border border-gray-200 text-gray-700"
                  )}
                >
                  <span className="font-semibold w-4 shrink-0">{c.label.toUpperCase()}.</span>
                  <span>{c.text}</span>
                  {c.id === sq.correct_answer && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto mt-0.5 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Answer for non-choice types */}
          {(!sq.choices || !(sq.choices as unknown[]).length) && (
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Gabarito</p>
              <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                {sq.correct_answer}
              </p>
            </div>
          )}

          {/* Explanation */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Explicação</p>
            <p className="text-sm text-gray-700">{sq.explanation}</p>
          </div>

          {/* Suggestion reason */}
          {sq.suggestion_reason && (
            <div className="flex items-start gap-2 rounded-lg bg-violet-50 border border-violet-100 px-3 py-2">
              <Lightbulb className="h-3.5 w-3.5 text-violet-500 mt-0.5 shrink-0" />
              <p className="text-[12px] text-violet-700">{sq.suggestion_reason}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 flex items-center gap-2 border-t border-gray-100">
        <Button
          size="sm"
          onClick={handleApprove}
          disabled={isPending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 text-xs"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Aprovar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReject}
          disabled={isPending}
          className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5 h-8 text-xs"
        >
          <XCircle className="h-3.5 w-3.5" />
          Rejeitar
        </Button>
      </div>
    </div>
  );
}

// ─── Approved / rejected chip ─────────────────────────────────────────────────

function ReviewedCard({ sq, status }: { sq: SuggestedQuestion; status: "approved" | "rejected" }) {
  return (
    <div className={cn(
      "rounded-xl border px-4 py-3 flex items-center gap-3 opacity-60",
      status === "approved" ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50"
    )}>
      {status === "approved"
        ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        : <XCircle className="h-4 w-4 text-gray-400 shrink-0" />}
      <span className="text-sm text-gray-700 flex-1 truncate">{sq.statement}</span>
      <span className={cn(
        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
        status === "approved"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-gray-200 text-gray-500"
      )}>
        {status === "approved" ? "Aprovada" : "Rejeitada"}
      </span>
    </div>
  );
}

// ─── Main tab component ───────────────────────────────────────────────────────

interface SuggestedQuestionsTabProps {
  packId: string;
  initialSuggestions: SuggestedQuestion[];
  onStatusChange: (id: string, status: "approved" | "rejected") => void;
}

export function SuggestedQuestionsTab({ packId, initialSuggestions, onStatusChange }: SuggestedQuestionsTabProps) {
  const suggestions = initialSuggestions;

  const pending = suggestions.filter((s) => s.status === "suggested");
  const approved = suggestions.filter((s) => s.status === "approved");
  const rejected = suggestions.filter((s) => s.status === "rejected");

  function handleStatusChange(id: string, status: "approved" | "rejected") {
    onStatusChange(id, status);
  }

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <BookOpen className="h-8 w-8 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-500">Nenhuma sugestão disponível</p>
        <p className="text-xs text-gray-400 mt-1">
          Sugestões aparecem automaticamente ao processar um PDF com IA.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-3xl">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pendentes", count: pending.length, color: "text-violet-600" },
          { label: "Aprovadas", count: approved.length, color: "text-emerald-600" },
          { label: "Rejeitadas", count: rejected.length, color: "text-gray-400" },
        ].map(({ label, count, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-3 text-center">
            <p className={cn("text-xl font-bold tabular-nums", color)}>{count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <h3 className="text-sm font-semibold text-gray-700">
              Aguardando revisão <span className="text-violet-500">({pending.length})</span>
            </h3>
          </div>
          <div className="space-y-3">
            {pending.map((sq) => (
              <SuggestionCard
                key={sq.id}
                sq={sq}
                packId={packId}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </section>
      )}

      {/* Approved */}
      {approved.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-gray-700">Aprovadas ({approved.length})</h3>
          </div>
          <div className="space-y-2">
            {approved.map((sq) => (
              <ReviewedCard key={sq.id} sq={sq} status="approved" />
            ))}
          </div>
        </section>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-500">Rejeitadas ({rejected.length})</h3>
          </div>
          <div className="space-y-2">
            {rejected.map((sq) => (
              <ReviewedCard key={sq.id} sq={sq} status="rejected" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
