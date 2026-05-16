"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  X,
  AlertCircle,
  Plus,
  Pencil,
} from "lucide-react";
import { generateAiEditProposal, applyAiChanges } from "./ai-actions";
import type { ProposedChange, AiEditResult } from "./ai-actions";
import { useRouter } from "next/navigation";

// ── Action labels ─────────────────────────────────────────────────────────────

const actionConfig: Record<
  ProposedChange["action"],
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  add_exercise:   { label: "Nova questão",  icon: Plus,   color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  update_exercise:{ label: "Alterar questão", icon: Pencil, color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  add_section:    { label: "Nova seção",    icon: Plus,   color: "text-violet-700",  bg: "bg-violet-50 border-violet-200" },
  update_section: { label: "Alterar seção", icon: Pencil, color: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
  update_topic:   { label: "Alterar tópico", icon: Pencil, color: "text-primary",    bg: "bg-primary/5 border-primary/20" },
};

// ── Suggestion chips ──────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "Adicione 3 questões de múltipla escolha ao primeiro tópico",
  "Melhore a explicação do primeiro tópico",
  "Adicione um exemplo prático ao segundo tópico",
  "Reescreva os enunciados das questões de forma mais clara",
];

// ── Change card ───────────────────────────────────────────────────────────────

function ChangeCard({
  change,
  selected,
  onToggle,
}: {
  change: ProposedChange;
  selected: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = actionConfig[change.action];
  const Icon = cfg.icon;

  // Build preview of data fields
  const previewFields = Object.entries(change.data)
    .filter(([k]) => ["title", "summary", "statement", "content", "type"].includes(k))
    .slice(0, 3);

  return (
    <div
      className={cn(
        "rounded-xl border transition-all",
        selected ? "border-primary/40 ring-1 ring-primary/20 bg-white" : "bg-white border-border opacity-70"
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors mt-0.5",
            selected
              ? "border-primary bg-primary text-white"
              : "border-muted-foreground/30 hover:border-primary/60"
          )}
        >
          {selected && <Check className="h-3 w-3" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-semibold", cfg.bg, cfg.color)}>
              <Icon className="h-3 w-3" />
              {cfg.label}
            </span>
            {change.topicTitle && (
              <span className="text-xs text-muted-foreground truncate">
                em «{change.topicTitle}»
              </span>
            )}
          </div>
          <p className="text-sm text-foreground mt-1 leading-snug">{change.description}</p>

          {/* Data preview */}
          {previewFields.length > 0 && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {expanded ? "Ocultar detalhes" : "Ver detalhes"}
              </button>

              {expanded && (
                <div className="mt-2 space-y-1.5 rounded-lg bg-muted/40 px-3 py-2">
                  {previewFields.map(([key, value]) => (
                    <div key={key}>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">{key}</p>
                      <p className="text-xs text-foreground line-clamp-3">
                        {typeof value === "string" ? value : JSON.stringify(value)}
                      </p>
                    </div>
                  ))}
                  {Object.keys(change.data).length > 3 && (
                    <p className="text-[10px] text-muted-foreground">
                      + {Object.keys(change.data).length - 3} campo(s) adicional(is)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function AiAssistantPanel({ packId }: { packId: string }) {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [proposal, setProposal] = useState<AiEditResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isGenerating, startGenerating] = useTransition();
  const [isApplying, startApplying] = useTransition();
  const [appliedCount, setAppliedCount] = useState(0);
  const router = useRouter();

  function handleGenerate() {
    if (!instruction.trim()) return;
    setProposal(null);
    setSelectedIds(new Set());
    setAppliedCount(0);
    startGenerating(async () => {
      const result = await generateAiEditProposal(packId, instruction);
      setProposal(result);
      if (!result.error) {
        setSelectedIds(new Set(result.changes.map((c) => c.id)));
      }
    });
  }

  function toggleChange(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleApply() {
    if (!proposal) return;
    const selected = proposal.changes.filter((c) => selectedIds.has(c.id));
    if (selected.length === 0) return;

    startApplying(async () => {
      const result = await applyAiChanges(packId, selected);
      if (result.error) {
        alert(`Erro ao aplicar alterações: ${result.error}`);
      } else {
        setAppliedCount(selected.length);
        setProposal(null);
        setInstruction("");
        setSelectedIds(new Set());
        router.refresh();
      }
    });
  }

  function handleDiscard() {
    setProposal(null);
    setSelectedIds(new Set());
  }

  return (
    <div className={cn(
      "rounded-xl border overflow-hidden transition-all",
      open ? "border-primary/30 bg-gradient-to-br from-primary/5 to-violet-500/5" : "bg-white"
    )}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <span className="font-semibold text-foreground text-sm">IA Assistente de Edição</span>
          <p className="text-xs text-muted-foreground">
            Descreva o que quer modificar e a IA vai propor as alterações
          </p>
        </div>
        {appliedCount > 0 && !open && (
          <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
            <Check className="h-3.5 w-3.5" />
            {appliedCount} alteração{appliedCount !== 1 ? "ões" : ""} aplicada{appliedCount !== 1 ? "s" : ""}
          </span>
        )}
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Body */}
      {open && (
        <div className="border-t px-5 py-5 space-y-4">
          {/* Instruction input */}
          <div className="space-y-2">
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate();
              }}
              placeholder="Ex: Adicione 2 questões de múltipla escolha sobre o módulo de um número ao primeiro tópico…"
              rows={3}
              disabled={isGenerating}
              className="w-full rounded-xl border bg-white px-4 py-3 text-sm shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/60 disabled:bg-muted/40"
            />

            {/* Suggestions */}
            {!instruction && !proposal && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInstruction(s)}
                    className="rounded-full border bg-white px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                Ctrl+Enter para gerar · Máx. 6 alterações por vez
              </p>
              <Button
                type="button"
                size="sm"
                className="gap-2"
                onClick={handleGenerate}
                disabled={!instruction.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Gerando proposta…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Gerar proposta
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Error */}
          {proposal?.error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {proposal.error}
            </div>
          )}

          {/* Proposal */}
          {proposal && !proposal.error && (
            <div className="space-y-3">
              {/* Summary */}
              <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <Sparkles className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <p className="text-sm text-foreground">{proposal.summary}</p>
              </div>

              {proposal.changes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  A IA não gerou nenhuma alteração. Tente reformular a instrução.
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {proposal.changes.length} alteração{proposal.changes.length !== 1 ? "ões" : ""} propostas
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedIds(new Set(proposal.changes.map((c) => c.id)))}
                        className="text-xs text-primary hover:underline"
                      >
                        Selecionar todas
                      </button>
                      <span className="text-muted-foreground text-xs">·</span>
                      <button
                        type="button"
                        onClick={() => setSelectedIds(new Set())}
                        className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {proposal.changes.map((change) => (
                      <ChangeCard
                        key={change.id}
                        change={change}
                        selected={selectedIds.has(change.id)}
                        onToggle={() => toggleChange(change.id)}
                      />
                    ))}
                  </div>

                  {/* Apply / Discard */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleDiscard}
                      disabled={isApplying}
                      className="gap-1.5 text-muted-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                      Descartar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleApply}
                      disabled={selectedIds.size === 0 || isApplying}
                      className="gap-1.5"
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Aplicando…
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Aplicar {selectedIds.size} alteração{selectedIds.size !== 1 ? "ões" : ""}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
