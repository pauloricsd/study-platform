import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getGroups } from "@/lib/data/groups";
import { getCurrentProfile } from "@/lib/data/auth";
import { Plus, Users, BookOpen, ChevronRight, School, Home, GraduationCap, Briefcase, Tag, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const groupTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  family:         { label: "Família",           icon: Home,         color: "text-rose-600 bg-rose-50 border-rose-200" },
  school:         { label: "Escola",            icon: School,       color: "text-blue-600 bg-blue-50 border-blue-200" },
  classroom:      { label: "Turma",             icon: GraduationCap,color: "text-violet-600 bg-violet-50 border-violet-200" },
  tutoring_group: { label: "Reforço",           icon: Briefcase,    color: "text-amber-600 bg-amber-50 border-amber-200" },
  subject_group:  { label: "Grupo por matéria", icon: Tag,          color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  custom:         { label: "Personalizado",     icon: Layers,       color: "text-slate-600 bg-slate-50 border-slate-200" },
};

export default async function GruposPage() {
  const profile = await getCurrentProfile();
  const groups = profile ? await getGroups(profile.id) : [];

  return (
    <>
      <Topbar
        title="Grupos"
        action={
          <Button size="sm" className="gap-2" asChild>
            <Link href="/grupos/novo">
              <Plus className="h-4 w-4" />
              Novo grupo
            </Link>
          </Button>
        }
      />
      <main className="p-6 space-y-6 max-w-4xl">
        <div>
          <p className="text-muted-foreground text-sm">
            Organize seus alunos em famílias, turmas, grupos de reforço ou categorias personalizadas.
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">Nenhum grupo criado ainda</p>
            <p className="text-sm text-muted-foreground">
              Crie um grupo para organizar alunos e atribuir pacotes de estudo.
            </p>
            <Button asChild className="mt-2">
              <Link href="/grupos/novo">
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro grupo
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {groups.map((group) => {
              const cfg = groupTypeConfig[group.type] ?? groupTypeConfig.custom;
              const Icon = cfg.icon;
              return (
                <Link key={group.id} href={`/grupos/${group.id}`}>
                  <div className="rounded-2xl border bg-white p-5 space-y-4 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", cfg.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-snug">{group.name}</p>
                          {group.school_name && (
                            <p className="text-xs text-muted-foreground">{group.school_name}</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {group.memberCount} aluno{group.memberCount !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        {group.packCount} pacote{group.packCount !== 1 ? "s" : ""}
                      </span>
                      {group.grade && (
                        <span className="flex items-center gap-1">{group.grade}</span>
                      )}
                    </div>

                    {group.tags && group.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {group.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
