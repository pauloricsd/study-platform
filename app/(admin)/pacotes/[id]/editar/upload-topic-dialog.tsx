"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Upload, FileText, Loader2, Check, X,
  Plus, RefreshCw, ChevronRight, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Topic } from "@/lib/mock-topics";
import type { GeneratedTopic } from "@/lib/ai/process-pdf";
import {
  processUploadedPdfAction,
  saveNewTopicsAction,
  replaceTopicAction,
} from "./upload-topic-actions";

type Mode = "new" | "replace";
type Step = "configure" | "processing" | "preview" | "saving" | "done";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packId: string;
  subject: string;
  grade: string;
  examName: string;
  topics: Topic[];
}

export function UploadTopicDialog({
  open, onOpenChange,
  packId, subject, grade, examName, topics,
}: Props) {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step,            setStep]           = useState<Step>("configure");
  const [mode,            setMode]           = useState<Mode>("new");
  const [replaceTopicId,  setReplaceTopicId] = useState(topics[0]?.id ?? "");
  const [file,            setFile]           = useState<File | null>(null);
  const [dragOver,        setDragOver]       = useState(false);
  const [error,           setError]          = useState<string | null>(null);
  const [generatedTopics, setGeneratedTopics] = useState<GeneratedTopic[]>([]);
  const [topicTitles,     setTopicTitles]    = useState<Record<number, string>>({});
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [replacePickIdx,  setReplacePickIdx] = useState(0);
  const [, startTransition] = useTransition();

  function reset() {
    setStep("configure");
    setMode("new");
    setFile(null);
    setError(null);
    setGeneratedTopics([]);
    setTopicTitles({});
    setSelectedIndices(new Set());
    setReplacePickIdx(0);
    setReplaceTopicId(topics[0]?.id ?? "");
  }

  function handleClose() {
    onOpenChange(false);
    setTimeout(reset, 300);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
    else setError("Apenas arquivos PDF são aceitos.");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (picked) { setFile(picked); setError(null); }
  }

  // ── Step: process PDF ───────────────────────────────────────────────────
  function handleProcess() {
    if (!file) { setError("Selecione um arquivo PDF."); return; }
    setError(null);
    setStep("processing");

    startTransition(async () => {
      const fd = new FormData();
      fd.append("file", file);
      const result = await processUploadedPdfAction(packId, subject, grade, examName, fd);

      if ("error" in result) {
        setError(result.error);
        setStep("configure");
        return;
      }

      const generated = result.topics;
      setGeneratedTopics(generated);
      // Default titles
      const titles: Record<number, string> = {};
      generated.forEach((t, i) => { titles[i] = t.title; });
      setTopicTitles(titles);
      // Default selections
      if (mode === "new") {
        setSelectedIndices(new Set(generated.map((_, i) => i)));
      } else {
        setReplacePickIdx(0);
      }
      setStep("preview");
    });
  }

  // ── Step: save ──────────────────────────────────────────────────────────
  function handleSave() {
    setStep("saving");

    startTransition(async () => {
      let result: { error?: string };

      if (mode === "new") {
        result = await saveNewTopicsAction(
          packId,
          generatedTopics,
          topicTitles,
          [...selectedIndices].sort((a, b) => a - b)
        );
      } else {
        const replaceTopic = generatedTopics[replacePickIdx];
        result = await replaceTopicAction(
          packId,
          replaceTopicId,
          replaceTopic,
          topicTitles[replacePickIdx] ?? replaceTopic.title
        );
      }

      if (result.error) {
        setError(result.error);
        setStep("preview");
        return;
      }

      setStep("done");
      router.refresh();
    });
  }

  function toggleSelect(i: number) {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  // ── Render steps ────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">

        {/* ── Configure ────────────────────────────────────────────── */}
        {step === "configure" && (
          <>
            <DialogHeader>
              <DialogTitle>Importar PDF</DialogTitle>
              <DialogDescription>
                Gere tópicos automaticamente a partir de um arquivo PDF.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 pt-1">
              {/* Mode */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">O que deseja fazer?</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["new", "replace"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-left text-sm transition-all",
                        mode === m
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {m === "new"
                        ? <><Plus className="h-4 w-4 shrink-0" />Novo tópico</>
                        : <><RefreshCw className="h-4 w-4 shrink-0" />Substituir tópico</>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic selector (replace mode) */}
              {mode === "replace" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Substituir qual tópico?
                  </label>
                  {topics.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Nenhum tópico encontrado neste pacote.
                    </p>
                  ) : (
                    <select
                      value={replaceTopicId}
                      onChange={(e) => setReplaceTopicId(e.target.value)}
                      className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {topics.map((t, i) => (
                        <option key={t.id} value={t.id}>
                          {i + 1}. {t.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* File dropzone */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Arquivo PDF</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors",
                    dragOver
                      ? "border-primary bg-primary/5"
                      : file
                      ? "border-emerald-400 bg-emerald-50/50"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  )}
                >
                  {file ? (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                        <FileText className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground truncate max-w-[220px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                      >
                        <X className="h-3 w-3" /> Remover
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          Arraste o PDF ou clique para selecionar
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Somente PDF · Máx. 20 MB
                        </p>
                      </div>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {error && (
                <p className="flex items-center gap-1.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />{error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>Cancelar</Button>
                <Button
                  onClick={handleProcess}
                  disabled={!file || (mode === "replace" && !replaceTopicId)}
                  className="gap-2"
                >
                  Processar com IA <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ── Processing ───────────────────────────────────────────── */}
        {step === "processing" && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Processando arquivo…</p>
              <p className="text-sm text-muted-foreground mt-1">
                Extraindo texto e gerando tópico com IA. Isso pode levar alguns segundos.
              </p>
            </div>
          </div>
        )}

        {/* ── Preview ──────────────────────────────────────────────── */}
        {step === "preview" && (
          <>
            <DialogHeader>
              <DialogTitle>
                {mode === "new" ? "Tópicos gerados" : "Conteúdo gerado"}
              </DialogTitle>
              <DialogDescription>
                {mode === "new"
                  ? "Selecione os tópicos que deseja adicionar ao pacote e edite os títulos se necessário."
                  : "Revise o conteúdo gerado. Ele substituirá o tópico selecionado."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-1">
              {generatedTopics.map((t, i) => {
                const isSelected = mode === "new"
                  ? selectedIndices.has(i)
                  : replacePickIdx === i;

                return (
                  <div
                    key={i}
                    onClick={() => mode === "new" ? toggleSelect(i) : setReplacePickIdx(i)}
                    className={cn(
                      "rounded-xl border p-4 cursor-pointer transition-all space-y-3",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox / Radio */}
                      <div className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        isSelected ? "border-primary bg-primary" : "border-border"
                      )}>
                        {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>

                      {/* Title (editable) */}
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={topicTitles[i] ?? t.title}
                          onChange={(e) => setTopicTitles((prev) => ({ ...prev, [i]: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full rounded-md border bg-white px-2 py-1 text-sm font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pl-7 text-xs text-muted-foreground">
                      <span>{t.sections.length} seção{t.sections.length !== 1 ? "ões" : ""}</span>
                      <span>{t.exercises.length} exercício{t.exercises.length !== 1 ? "s" : ""}</span>
                      {t.summary && (
                        <span className="truncate text-muted-foreground/70">{t.summary.slice(0, 60)}…</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {error && (
                <p className="flex items-center gap-1.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />{error}
                </p>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep("configure")}>
                  ← Voltar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={
                    mode === "new"
                      ? selectedIndices.size === 0
                      : generatedTopics.length === 0
                  }
                  className="gap-2"
                >
                  {mode === "new"
                    ? `Adicionar ${selectedIndices.size} tópico${selectedIndices.size !== 1 ? "s" : ""}`
                    : "Substituir tópico"}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ── Saving ───────────────────────────────────────────────── */}
        {step === "saving" && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-base font-semibold text-foreground">Salvando…</p>
          </div>
        )}

        {/* ── Done ─────────────────────────────────────────────────── */}
        {step === "done" && (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {mode === "new" ? "Tópicos adicionados!" : "Tópico substituído!"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                O pacote foi atualizado com sucesso.
              </p>
            </div>
            <Button className="w-full" onClick={handleClose}>Fechar</Button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
