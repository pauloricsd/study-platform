"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Loader2,
  AlertCircle,
  ShieldAlert,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import type {
  SendTutorMessageInput,
  SendTutorMessageResult,
} from "@/app/estudar/[packId]/topico/[topicId]/tutor-actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "student" | "assistant";
  content: string;
  confidence?: string;
  directAnswerBlocked?: boolean;
}

export interface TutorChatProps {
  packId: string;
  topicId: string;
  mode: "study" | "exercise";
  // Exercise-specific
  exerciseId?: string | null;
  exerciseStatement?: string;
  exerciseType?: string;
  studentAnswer?: string;
  answerState?: string;
  attemptNumber?: number;
  previousFeedback?: string;
  // Server action (passed as prop for Next.js 15 compatibility)
  onSendMessage: (input: SendTutorMessageInput) => Promise<SendTutorMessageResult>;
}

// ─── Suggestion chips ─────────────────────────────────────────────────────────

const STUDY_SUGGESTIONS = [
  "Explique de outro jeito",
  "Me dê outro exemplo",
  "O que significa essa parte?",
  "Resuma o tópico",
];

const EXERCISE_SUGGESTIONS = [
  "Me dê uma dica",
  "Explique o enunciado",
  "Qual conceito devo lembrar?",
  "Onde minha resposta está incompleta?",
];

// ─── Markdown-lite renderer ───────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode {
  // Split by lines and handle basic markdown
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        // Bold: **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        // List item
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <li key={i} className="ml-3 list-disc">
              {parts.slice(0, 1)}
              {line.slice(2)}
            </li>
          );
        }

        if (line === "") return <br key={i} />;

        return (
          <span key={i}>
            {parts}
            {i < lines.length - 1 && !lines[i + 1]?.startsWith("- ") && "\n"}
          </span>
        );
      })}
    </>
  );
}

// ─── Confidence indicator ─────────────────────────────────────────────────────

function ConfidenceBadge({ confidence }: { confidence?: string }) {
  if (!confidence || confidence === "high_confidence") return null;
  if (confidence === "insufficient_information") {
    return (
      <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5">
        <AlertCircle className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-700 leading-snug">
          Informação não encontrada no material. Confirme com seu professor.
        </p>
      </div>
    );
  }
  if (confidence === "low_confidence") {
    return (
      <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-1.5">
        <AlertCircle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-700 leading-snug">
          Resposta com incerteza — confirme com seu professor.
        </p>
      </div>
    );
  }
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TutorChat({
  packId,
  topicId,
  mode,
  exerciseId,
  exerciseStatement,
  exerciseType,
  studentAnswer,
  answerState,
  attemptNumber,
  previousFeedback,
  onSendMessage,
}: TutorChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = mode === "exercise" ? EXERCISE_SUGGESTIONS : STUDY_SUGGESTIONS;
  const hasMessages = messages.length > 0;

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isPending) return;

    setInput("");
    const userMsg: ChatMessage = { role: "student", content: msg };
    setMessages((prev) => [...prev, userMsg]);

    startTransition(async () => {
      const result = await onSendMessage({
        packId,
        topicId,
        mode,
        message: msg,
        exerciseId: exerciseId ?? null,
        exerciseStatement,
        exerciseType,
        studentAnswer: studentAnswer ?? null,
        answerState,
        attemptNumber,
        previousFeedback,
      });

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: result.content,
        confidence: result.confidence,
        directAnswerBlocked: result.directAnswerBlocked,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all",
          "bg-primary text-white hover:bg-primary/90 active:scale-95",
          open && "bg-primary/90 rotate-12"
        )}
        aria-label="Abrir Tutor IA"
      >
        {open ? (
          <ChevronDown className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
        {/* Pulse indicator (when not open) */}
        {!open && !hasMessages && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary border-2 border-white" />
          </span>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-36 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border bg-white shadow-2xl transition-all duration-300 origin-bottom-right overflow-hidden",
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
        style={{ maxHeight: "70vh" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b bg-gradient-to-r from-primary/10 to-violet-500/10 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-none">Tutor IA</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {mode === "exercise"
                ? "Modo exercício — não vou dar a resposta direta"
                : "Modo estudo — tire suas dúvidas"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Exercise mode warning */}
        {mode === "exercise" && !hasMessages && (
          <div className="flex items-start gap-2 px-4 py-3 bg-amber-50/60 border-b border-amber-100">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-snug">
              Posso te ajudar a pensar, mas não vou te dar a resposta direta.
            </p>
          </div>
        )}

        {/* Messages */}
        <div
          className="overflow-y-auto px-4 py-3 space-y-3"
          style={{ maxHeight: "calc(70vh - 180px)" }}
        >
          {/* Welcome message */}
          {!hasMessages && (
            <div className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-muted/50 px-3.5 py-2.5 max-w-[85%]">
                <p className="text-sm text-foreground leading-snug">
                  {mode === "exercise"
                    ? "Olá! Estou aqui para te ajudar a pensar nesta questão. O que você precisa?"
                    : "Olá! Estou aqui para te ajudar a entender o conteúdo. Qual é a sua dúvida?"}
                </p>
              </div>
            </div>
          )}

          {/* Conversation */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-2",
                msg.role === "student" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {msg.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2.5 max-w-[85%]",
                  msg.role === "student"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-muted/50 text-foreground rounded-tl-sm"
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                </p>
                {msg.role === "assistant" && msg.directAnswerBlocked && (
                  <div className="mt-1.5 flex items-center gap-1 opacity-60">
                    <ShieldAlert className="h-3 w-3" />
                    <span className="text-[10px]">Resposta direta bloqueada</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Confidence badge (after last assistant message) */}
          {messages.at(-1)?.role === "assistant" && (
            <ConfidenceBadge confidence={messages.at(-1)?.confidence} />
          )}

          {/* Typing indicator */}
          {isPending && (
            <div className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips (when no messages yet or only welcome) */}
        {!hasMessages && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSend(s)}
                disabled={isPending}
                className="rounded-full border bg-white px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t px-3 py-2.5 flex items-end gap-2">
          <div className="flex-1 flex items-end rounded-xl border bg-muted/30 px-3 py-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva sua dúvida… (Enter para enviar)"
              rows={1}
              disabled={isPending}
              className="w-full resize-none bg-transparent text-sm outline-none leading-relaxed max-h-24 disabled:opacity-50 placeholder:text-muted-foreground/60"
              style={{ minHeight: "1.5rem" }}
            />
          </div>
          <Button
            type="button"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl"
            onClick={() => handleSend()}
            disabled={!input.trim() || isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 border-t py-1.5 bg-muted/20">
          <BookOpen className="h-2.5 w-2.5 text-muted-foreground/50" />
          <p className="text-[9px] text-muted-foreground/50">
            Baseado no conteúdo do seu pacote de estudo
          </p>
        </div>
      </div>
    </>
  );
}
