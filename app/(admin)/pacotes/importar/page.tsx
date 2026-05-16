"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  validateStudyPack,
  type StudyPackFile,
  type ValidationResult,
} from "@/lib/ai/import-studypack";
import { importStudyPackAction } from "./actions";
import {
  Upload,
  FileJson,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  BookOpen,
  X,
  ChevronRight,
} from "lucide-react";

type Step = "input" | "preview";

interface ParsedPack {
  file: StudyPackFile;
  validation: ValidationResult;
  questionCountByTopic: Map<string, number>;
}

export default function ImportarStudyPackPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("input");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawJson, setRawJson] = useState<string>("");
  const [pasteValue, setPasteValue] = useState<string>("");
  const [inputMode, setInputMode] = useState<"file" | "paste">("file");

  // Validation state
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedPack | null>(null);

  // Import state
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // ── File handling ─────────────────────────────────────────────────────────

  function loadFileContent(file: File) {
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      setParseError("O arquivo deve ter extensão .json.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRawJson(text);
      setFileName(file.name);
      setParseError(null);
      setValidationResult(null);
      setParsed(null);
    };
    reader.onerror = () => {
      setParseError("Não foi possível ler o arquivo.");
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFileContent(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFileContent(file);
  }

  function clearFile() {
    setFileName(null);
    setRawJson("");
    setParseError(null);
    setValidationResult(null);
    setParsed(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Validation ────────────────────────────────────────────────────────────

  const handleValidate = useCallback(() => {
    const source = inputMode === "file" ? rawJson : pasteValue;

    if (!source.trim()) {
      setParseError(
        inputMode === "file"
          ? "Nenhum arquivo carregado."
          : "Cole o JSON no campo de texto acima."
      );
      return;
    }

    setValidating(true);
    setParseError(null);
    setValidationResult(null);
    setParsed(null);

    // Run synchronously but yield to give UI a tick to update
    setTimeout(() => {
      let data: unknown;
      try {
        data = JSON.parse(source);
      } catch {
        setParseError("O conteúdo não é um JSON válido. Verifique a formatação.");
        setValidating(false);
        return;
      }

      const result = validateStudyPack(data);
      setValidationResult(result);

      if (result.errors.length === 0) {
        const spFile = data as StudyPackFile;

        // Count questions per topic
        const countMap = new Map<string, number>();
        for (const q of spFile.questions) {
          countMap.set(q.topicId, (countMap.get(q.topicId) ?? 0) + 1);
        }

        setParsed({ file: spFile, validation: result, questionCountByTopic: countMap });
        setStep("preview");
      }

      setValidating(false);
    }, 50);
  }, [inputMode, rawJson, pasteValue]);

  // ── Import ────────────────────────────────────────────────────────────────

  async function handleImport() {
    if (!parsed) return;
    setImporting(true);
    setImportError(null);

    const source = inputMode === "file" ? rawJson : pasteValue;
    const fd = new FormData();

    if (inputMode === "file" && fileName) {
      const blob = new Blob([source], { type: "application/json" });
      const file = new File([blob], fileName, { type: "application/json" });
      fd.append("file", file);
    } else {
      fd.append("paste", source);
    }

    const result = await importStudyPackAction(fd);

    if (result.error) {
      setImportError(result.error);
      setImporting(false);
      return;
    }

    if (result.packId) {
      router.push(`/pacotes/${result.packId}/editar`);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const activeSource = inputMode === "file" ? rawJson : pasteValue;
  const hasContent = activeSource.trim().length > 0;

  return (
    <>
      <Topbar
        title="Importar StudyPack"
        action={
          <Link
            href="/pacotes"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        }
      />

      <main className="p-6">
        <div className="max-w-2xl">

          {/* Step: Input */}
          {step === "input" && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Carregar arquivo</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Importe um arquivo <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">.studypack.json</code> para criar um pacote de estudo sem precisar de IA ou PDF.
                </p>
              </div>

              {/* Mode switcher */}
              <div className="flex rounded-lg border bg-muted/30 p-1 mb-4 w-fit gap-1">
                <button
                  type="button"
                  onClick={() => setInputMode("file")}
                  className={cn(
                    "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                    inputMode === "file"
                      ? "bg-white shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Arquivo
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("paste")}
                  className={cn(
                    "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                    inputMode === "paste"
                      ? "bg-white shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Colar JSON
                </button>
              </div>

              {/* File input mode */}
              {inputMode === "file" && (
                <div className="rounded-xl border bg-white p-6">
                  {!fileName ? (
                    <div
                      className={cn(
                        "rounded-xl border-2 border-dashed transition-colors cursor-pointer py-14 flex flex-col items-center justify-center text-center gap-3",
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/20"
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
                        <p className="font-medium text-foreground">Arraste um arquivo JSON aqui</p>
                        <p className="text-sm text-muted-foreground mt-0.5">ou clique para selecionar</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Extensão: .json ou .studypack.json</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,application/json"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl border bg-muted/20 px-4 py-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <FileJson className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{fileName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {(rawJson.length / 1024).toFixed(1)} KB · JSON
                        </p>
                      </div>
                      <button
                        onClick={clearFile}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Remover arquivo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Paste mode */}
              {inputMode === "paste" && (
                <div className="rounded-xl border bg-white p-6">
                  <label className="block text-sm font-medium mb-2">Cole o JSON aqui</label>
                  <textarea
                    className="w-full rounded-lg border border-input bg-muted/20 px-3 py-2 text-sm font-mono resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-48"
                    placeholder={'{\n  "studyPackVersion": "1.0",\n  "metadata": { ... },\n  "topics": [],\n  "questions": []\n}'}
                    value={pasteValue}
                    onChange={(e) => {
                      setPasteValue(e.target.value);
                      setParseError(null);
                      setValidationResult(null);
                      setParsed(null);
                    }}
                    spellCheck={false}
                  />
                </div>
              )}

              {/* Parse error */}
              {parseError && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 mt-4">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{parseError}</p>
                </div>
              )}

              {/* Validation errors (when validation ran but had errors) */}
              {validationResult && validationResult.errors.length > 0 && (
                <div className="mt-4 rounded-xl border border-red-200 bg-white overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border-b border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <span className="text-sm font-semibold text-red-700">
                      {validationResult.errors.length} erro{validationResult.errors.length !== 1 ? "s" : ""} encontrado{validationResult.errors.length !== 1 ? "s" : ""}
                    </span>
                    <span className="ml-auto text-xs text-red-500">Corrija antes de importar</span>
                  </div>
                  <ul className="divide-y divide-red-100">
                    {validationResult.errors.map((err, i) => (
                      <li key={i} className="px-4 py-2.5 text-sm text-red-700 flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 text-red-400">•</span>
                        {err}
                      </li>
                    ))}
                  </ul>
                  {validationResult.warnings.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border-t border-b border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="text-sm font-semibold text-amber-700">
                          {validationResult.warnings.length} aviso{validationResult.warnings.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <ul className="divide-y divide-amber-100">
                        {validationResult.warnings.map((w, i) => (
                          <li key={i} className="px-4 py-2.5 text-sm text-amber-700 flex items-start gap-2">
                            <span className="mt-0.5 shrink-0 text-amber-400">•</span>
                            {w}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleValidate}
                  disabled={!hasContent || validating}
                  className="gap-2"
                >
                  {validating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Validando...</>
                  ) : (
                    <>Validar <ChevronRight className="h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Step: Preview */}
          {step === "preview" && parsed && (
            <>
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Prévia do pacote</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Revise os dados antes de importar como rascunho.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("input");
                    setValidationResult(null);
                    setParsed(null);
                    setImportError(null);
                  }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </button>
              </div>

              {/* Validation summary */}
              {parsed.validation.errors.length === 0 && (
                <div className="flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 mb-4">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-sm text-emerald-700 font-medium">
                    Arquivo válido — nenhum erro encontrado.
                  </span>
                  {parsed.validation.warnings.length > 0 && (
                    <Badge
                      variant="outline"
                      className="ml-auto text-amber-600 border-amber-300 bg-amber-50"
                    >
                      {parsed.validation.warnings.length} aviso{parsed.validation.warnings.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              )}

              {/* Warnings list */}
              {parsed.validation.warnings.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-white overflow-hidden mb-4">
                  <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border-b border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-sm font-semibold text-amber-700">
                      {parsed.validation.warnings.length} aviso{parsed.validation.warnings.length !== 1 ? "s" : ""} — importação permitida, mas revise após importar.
                    </span>
                  </div>
                  <ul className="divide-y divide-amber-100">
                    {parsed.validation.warnings.map((w, i) => (
                      <li key={i} className="px-4 py-2.5 text-sm text-amber-700 flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 text-amber-400">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pack metadata card */}
              <div className="rounded-xl border bg-white p-5 mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Metadados do pacote
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                  <div>
                    <p className="text-xs text-muted-foreground">Título</p>
                    <p className="text-sm font-semibold mt-0.5">{parsed.file.metadata.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Matéria</p>
                    <p className="text-sm font-medium mt-0.5">{parsed.file.metadata.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Série / Nível</p>
                    <p className="text-sm font-medium mt-0.5">{parsed.file.metadata.schoolLevel}</p>
                  </div>
                  {parsed.file.metadata.examDate && (
                    <div>
                      <p className="text-xs text-muted-foreground">Data da prova</p>
                      <p className="text-sm font-medium mt-0.5">{parsed.file.metadata.examDate}</p>
                    </div>
                  )}
                  {parsed.file.metadata.description && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Descrição</p>
                      <p className="text-sm text-foreground mt-0.5">{parsed.file.metadata.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-bold leading-none">{parsed.file.topics.length}</span>
                    <span className="text-xs text-muted-foreground">tópicos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-bold leading-none">{parsed.file.questions.length}</span>
                    <span className="text-xs text-muted-foreground">questões</span>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="outline" className="text-xs">
                      v{parsed.file.studyPackVersion}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Topics list */}
              <div className="rounded-xl border bg-white overflow-hidden mb-6">
                <div className="px-4 py-3 border-b bg-muted/20">
                  <h3 className="text-sm font-semibold">Tópicos</h3>
                </div>
                <ul className="divide-y">
                  {parsed.file.topics
                    .slice()
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((topic) => {
                      const count = parsed.questionCountByTopic.get(topic.id) ?? 0;
                      return (
                        <li key={topic.id} className="flex items-start gap-3 px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{topic.title}</p>
                            {topic.summary && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {topic.summary}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span className="text-xs">{count} questão{count !== 1 ? "ões" : ""}</span>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>

              {/* Import error */}
              {importError && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 mb-4">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{importError}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleImport}
                  disabled={importing}
                  className="gap-2"
                >
                  {importing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Importando...</>
                  ) : (
                    <><CheckCircle2 className="h-4 w-4" /> Importar como rascunho</>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
