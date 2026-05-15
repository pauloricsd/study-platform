"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Home, School, GraduationCap, Briefcase, Tag, Layers } from "lucide-react";

const GROUP_TYPES = [
  { value: "family",         label: "Família",           desc: "Para um ou mais filhos/dependentes",     icon: Home,          color: "border-rose-200 bg-rose-50 text-rose-700" },
  { value: "classroom",      label: "Turma",             desc: "Alunos de uma mesma turma escolar",       icon: GraduationCap, color: "border-violet-200 bg-violet-50 text-violet-700" },
  { value: "tutoring_group", label: "Reforço",           desc: "Grupo de reforço ou aulas particulares",  icon: Briefcase,     color: "border-amber-200 bg-amber-50 text-amber-700" },
  { value: "school",         label: "Escola",            desc: "Agrupamento de turmas de uma escola",     icon: School,        color: "border-blue-200 bg-blue-50 text-blue-700" },
  { value: "subject_group",  label: "Grupo por matéria", desc: "Alunos agrupados por matéria ou tema",    icon: Tag,           color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { value: "custom",         label: "Personalizado",     desc: "Qualquer outra organização",              icon: Layers,        color: "border-slate-200 bg-slate-50 text-slate-700" },
] as const;

async function createGroupAction(formData: FormData) {
  const { default: createGroup } = await import("./action");
  return createGroup(formData);
}

export default function NovoGrupoPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<string>("family");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("type", type);
    setError(null);
    startTransition(async () => {
      const result = await createGroupAction(fd);
      if (result?.error) {
        setError(result.error);
      } else if (result?.id) {
        router.push(`/grupos/${result.id}`);
      }
    });
  }

  return (
    <>
      <Topbar
        title="Novo grupo"
        action={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/grupos"><ArrowLeft className="h-4 w-4 mr-1.5" />Voltar</Link>
          </Button>
        }
      />
      <main className="p-6 max-w-2xl space-y-8">
        <form onSubmit={handleSubmit} className="space-y-7">

          {/* Type */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Tipo de grupo</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {GROUP_TYPES.map(({ value, label, desc, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={cn(
                    "flex flex-col items-start gap-1.5 rounded-xl border-2 p-3.5 text-left transition-all",
                    type === value ? color + " border-current" : "border-border hover:border-primary/40 bg-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold">{label}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground" htmlFor="name">
              Nome do grupo <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder={type === "family" ? "Família — Sofia" : type === "classroom" ? "6º ano B — 2026" : "Nome do grupo"}
            />
          </div>

          {/* Optional fields */}
          {(type === "school" || type === "classroom") && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground" htmlFor="school_name">
                Nome da escola
              </label>
              <input
                id="school_name"
                name="school_name"
                className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Ex.: Escola Estadual Anchieta"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground" htmlFor="grade">
                Ano / série
              </label>
              <input
                id="grade"
                name="grade"
                className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Ex.: 6º ano"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground" htmlFor="subject">
                Matéria principal
              </label>
              <input
                id="subject"
                name="subject"
                className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Ex.: Português"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground" htmlFor="description">
              Descrição <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Informações adicionais sobre o grupo..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? "Criando..." : "Criar grupo"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/grupos">Cancelar</Link>
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}
