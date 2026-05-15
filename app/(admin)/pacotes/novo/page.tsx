"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  processPackAction,
  publishPackAction,
  saveDraftAction,
  type GeneratedTopic,
} from "./actions";
import {
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  ChevronRight,
  BookOpen,
  Sparkles,
  X,
  ArrowLeft,
  Pencil,
  Layers,
  Check,
  AlertCircle,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  title: string;
  subject: string;
  grade: string;
  examName: string;
  examDate: string;
}

const PROCESSING_STEPS = [
  "Extraindo conteúdo do PDF",
  "Limpando e normalizando texto",
  "Identificando tópicos principais",
  "Organizando seções de estudo",
  "Gerando explicações didáticas",
  "Preparando revisão para aprovação",
];

const SUBJECTS = [
  "Português", "Matemática", "História", "Geografia",
  "Ciências", "Inglês", "Artes", "Educação Física",
];

const GRADES = [
  "1º ano - Fundamental", "2º ano - Fundamental", "3º ano - Fundamental",
  "4º ano - Fundamental", "5º ano - Fundamental", "6º ano - Fundamental",
  "7º ano - Fundamental", "8º ano - Fundamental", "9º ano - Fundamental",
  "1º ano - Médio", "2º ano - Médio", "3º ano - Médio",
];

const STEP_LABELS = ["Informações", "Upload", "Processando", "Revisão", "Publicado"];

export default function NovoPacotePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>({
    title: "",
    subject: "Português",
    grade: "6º ano - Fundamental",
    examName: "",
    examDate: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  // Real processing state
  const [packId, setPackId] = useState<string | null>(null);
  const [generatedTopics, setGeneratedTopics] = useState<GeneratedTopic[]>([]);
  const [processError, setProcessError] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Topic review state (index-based to work with dynamically generated topics)
  const [topicToggles, setTopicToggles] = useState<Record<number, boolean>>({});
  const [topicTitles, setTopicTitles] = useState<Record<number, string>>({});
  const [editingTopicIndex, setEditingTopicIndex] = useState<number | null>(null);

  // Cosmetic processing animation (runs while real API call is in flight)
  useEffect(() => {
    if (step !== 3) {
      setProcessingStep(0);
      return;
    }
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    PROCESSING_STEPS.forEach((_, i) => {
      timeouts.push(setTimeout(() => setProcessingStep(i + 1), (i + 1) * 1400));
    });
    return () => timeouts.forEach(clearTimeout);
  }, [step]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
  }

  async function handleStartProcessing() {
    if (!file) return;
    setProcessError(null);
    setStep(3);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", form.title);
    fd.append("subject", form.subject);
    fd.append("grade", form.grade);
    fd.append("examName", form.examName);
    fd.append("examDate", form.examDate);

    const result = await processPackAction(fd);

    if ("error" in result) {
      setProcessError(result.error);
      setStep(2);
      return;
    }

    setPackId(result.packId);
    setGeneratedTopics(result.topics);
    setTopicToggles(Object.fromEntries(result.topics.map((_, i) => [i, true])));
    setTopicTitles(Object.fromEntries(result.topics.map((t, i) => [i, t.title])));
    setStep(4);
  }

  async function handlePublish() {
    if (!packId) return;
    setPublishError(null);
    setIsPublishing(true);

    const enabledIndices = Object.entries(topicToggles)
      .filter(([, v]) => v)
      .map(([k]) => Number(k));

    const result = await publishPackAction(packId, generatedTopics, topicTitles, enabledIndices);
    setIsPublishing(false);

    if ("error" in result) {
      setPublishError(result.error);
      return;
    }

    setStep(5);
  }

  async function handleSaveDraft() {
    if (packId) await saveDraftAction(packId);
    router.push("/pacotes");
  }

  const isStep1Valid = form.title.trim() && form.examName.trim() && form.examDate;
  const activeTopicsCount = Object.values(topicToggles).filter(Boolean).length;

  return (
    <>
      <Topbar title="Criar pacote" />

      <main className="p-6">
        {/* Step indicator */}
        <div className="flex items-start gap-0 mb-8">
          {STEP_LABELS.map((label, i) => {
            const stepNum = (i + 1) as Step;
            const isDone = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={label} className="flex items-start">
                {i > 0 && (
                  <div className={cn("h-px mt-3.5 w-8 sm:w-12 shrink-0", isDone ? "bg-primary" : "bg-border")} />
                )}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold border-2 transition-colors",
                    isDone ? "bg-primary border-primary text-white"
                      : isCurrent ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground bg-white"
                  )}>
                    {isDone ? <Check className="h-3.5 w-3.5" /> : stepNum}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium hidden sm:block",
                    isCurrent ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step 1 — Basic info */}
        {step === 1 && (
          <div className="max-w-xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Informações do pacote</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Preencha os dados básicos sobre o conteúdo e a prova.
              </p>
            </div>
            <div className="rounded-xl border bg-white p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Título do pacote *</label>
                <Input
                  placeholder="Ex.: Revisão para o simulado de Português"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Matéria *</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  >
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Série / Turma *</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  >
                    {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nome da prova *</label>
                <Input
                  placeholder="Ex.: Simulado Bimestral — 2º Bimestre"
                  value={form.examName}
                  onChange={(e) => setForm({ ...form, examName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Data da prova *</label>
                <Input
                  type="date"
                  value={form.examDate}
                  onChange={(e) => setForm({ ...form, examDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setStep(2)} disabled={!isStep1Valid} className="gap-2">
                Próximo <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — Upload */}
        {step === 2 && (
          <div className="max-w-xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Material de estudo</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Envie o PDF com o conteúdo que será processado pela IA.
              </p>
            </div>

            {processError && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 mb-4">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{processError}</p>
              </div>
            )}

            {!file ? (
              <div
                className={cn(
                  "rounded-xl border-2 border-dashed bg-white transition-colors cursor-pointer p-14 flex flex-col items-center justify-center text-center gap-3",
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Arraste um PDF aqui</p>
                  <p className="text-sm text-muted-foreground mt-0.5">ou clique para selecionar</p>
                </div>
                <p className="text-xs text-muted-foreground">PDF textual · máximo 20 MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
                />
              </div>
            ) : (
              <div className="rounded-xl border bg-white p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(2)} MB · PDF
                    </p>
                  </div>
                  <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
              <Button onClick={handleStartProcessing} disabled={!file} className="gap-2">
                <Sparkles className="h-4 w-4" /> Processar material
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 — Processing (animation + real API call in flight) */}
        {step === 3 && (
          <div className="max-w-sm mx-auto pt-6 text-center">
            <div className="flex h-16 w-16 mx-auto mb-6 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-semibold mb-1">Processando material</h2>
            <p className="text-sm text-muted-foreground mb-8 truncate px-4">{form.title}</p>
            <div className="space-y-2.5 text-left">
              {PROCESSING_STEPS.map((label, i) => {
                const stepIndex = i + 1;
                const isDone = processingStep > stepIndex;
                const isCurrent = processingStep === stepIndex;
                return (
                  <div key={label} className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors",
                    isDone ? "bg-emerald-50" : isCurrent ? "bg-primary/5" : "bg-muted/30"
                  )}>
                    <div className="shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : isCurrent ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/25" />
                      )}
                    </div>
                    <span className={cn(
                      "text-sm",
                      isDone ? "text-emerald-700 font-medium"
                        : isCurrent ? "text-primary font-medium"
                        : "text-muted-foreground"
                    )}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4 — Topic review */}
        {step === 4 && (
          <div className="max-w-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Revisar tópicos gerados</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  A IA identificou {generatedTopics.length} tópicos. Revise, ajuste títulos
                  e desmarque o que não for necessário.
                </p>
              </div>
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <span className="text-2xl font-bold leading-none">{activeTopicsCount}</span>
                <span className="text-xs text-muted-foreground">ativos</span>
              </div>
            </div>

            {publishError && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 mb-4">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{publishError}</p>
              </div>
            )}

            <div className="space-y-3 mb-6">
              {generatedTopics.map((topic, i) => {
                const isActive = topicToggles[i] ?? true;
                const isEditing = editingTopicIndex === i;
                return (
                  <div key={i} className={cn("rounded-xl border bg-white p-4 transition-opacity", !isActive && "opacity-50")}>
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => setTopicToggles((t) => ({ ...t, [i]: !t[i] }))}
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                          isActive ? "bg-primary border-primary text-white" : "border-border bg-white"
                        )}
                      >
                        {isActive && <Check className="h-3 w-3" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <Input
                            autoFocus
                            value={topicTitles[i]}
                            onChange={(e) => setTopicTitles((t) => ({ ...t, [i]: e.target.value }))}
                            onBlur={() => setEditingTopicIndex(null)}
                            onKeyDown={(e) => e.key === "Enter" && setEditingTopicIndex(null)}
                            className="h-7 text-sm font-semibold mb-1"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5 mb-1">
                            <h3 className="font-semibold text-sm">{topicTitles[i] ?? topic.title}</h3>
                            <button
                              onClick={() => setEditingTopicIndex(i)}
                              className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground line-clamp-2">{topic.summary}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Layers className="h-3 w-3" />
                            {topic.sections.length} seções
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <BookOpen className="h-3 w-3" />
                            {topic.exercises.length} exercícios
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                Salvar rascunho
              </Button>
              <Button
                onClick={handlePublish}
                disabled={activeTopicsCount === 0 || isPublishing}
                className="gap-2"
              >
                {isPublishing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Publicando...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> Publicar pacote</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5 — Success */}
        {step === 5 && (
          <div className="max-w-sm mx-auto pt-6 text-center">
            <div className="flex h-16 w-16 mx-auto mb-6 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Pacote publicado!</h2>
            <p className="text-sm font-medium mb-1">{form.title}</p>
            <p className="text-sm text-muted-foreground mb-8">
              {activeTopicsCount} tópicos · {form.subject} · {form.grade}
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => packId && router.push(`/pacotes/${packId}`)}>
                Ver pacote
              </Button>
              <Button variant="outline" onClick={() => router.push("/pacotes")}>
                Ir para lista de pacotes
              </Button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
