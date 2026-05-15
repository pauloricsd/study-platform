import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { StudyPackCard } from "@/components/dashboard/study-pack-card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getPacks } from "@/lib/data/packs";
import { getStudents } from "@/lib/data/students";
import { getDaysUntilExam, getCompletionRate } from "@/lib/mock-data";
import {
  Plus,
  BookOpen,
  Users,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Flame,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const [allPacksRaw, students] = await Promise.all([getPacks(), getStudents()]);

  const allPacks = allPacksRaw.filter((p) => p.status !== "archived");
  const publishedPacks = allPacks.filter((p) => p.status === "published");
  const draftPacks = allPacks.filter(
    (p) => p.status === "draft" || p.status === "in_review"
  );
  const totalQuestions = allPacks.reduce((acc, p) => acc + p.questionsCount, 0);
  const avgCompletion = publishedPacks.length
    ? Math.round(
        publishedPacks.reduce(
          (acc, p) => acc + getCompletionRate(p.progress),
          0
        ) / publishedPacks.length
      )
    : 0;

  const urgentPacks = allPacks
    .filter((p) => {
      const d = getDaysUntilExam(p.examDate);
      return p.status === "published" && d !== null && d <= 7 && d > 0;
    })
    .sort((a, b) => (getDaysUntilExam(a.examDate) ?? 0) - (getDaysUntilExam(b.examDate) ?? 0));

  const recentPacks = [...allPacks]
    .sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 4);

  return (
    <>
      <Topbar
        title="Início"
        action={
          <Button size="sm" className="gap-2" asChild>
            <Link href="/pacotes/novo">
              <Plus className="h-4 w-4" />
              Novo pacote
            </Link>
          </Button>
        }
      />
      <main className="p-6 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bom dia</h2>
          <p className="text-muted-foreground mt-0.5">
            Você tem {draftPacks.length} pacote
            {draftPacks.length !== 1 ? "s" : ""} aguardando publicação.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Pacotes ativos"
            value={publishedPacks.length}
            icon={BookOpen}
            description={`${allPacks.length} no total`}
            color="text-primary"
          />
          <StatCard
            label="Alunos"
            value={students.length}
            icon={Users}
            description="vinculados a você"
            color="text-sky-600"
          />
          <StatCard
            label="Questões criadas"
            value={totalQuestions}
            icon={CheckCircle2}
            description="em todos os pacotes"
            color="text-emerald-600"
          />
          <StatCard
            label="Conclusão média"
            value={`${avgCompletion}%`}
            icon={TrendingUp}
            description="pelos alunos"
            color="text-amber-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {urgentPacks.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <h3 className="font-semibold text-foreground">Provas chegando</h3>
                  <Badge variant="warning">{urgentPacks.length}</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {urgentPacks.map((pack) => (
                    <StudyPackCard key={pack.id} pack={pack} />
                  ))}
                </div>
              </section>
            )}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Pacotes recentes</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground h-8 text-xs"
                  asChild
                >
                  <Link href="/pacotes">
                    Ver todos <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {recentPacks.map((pack) => (
                  <StudyPackCard key={pack.id} pack={pack} />
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Alunos</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground h-8 text-xs gap-1"
                  asChild
                >
                  <Link href="/alunos">
                    Ver todos <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="rounded-xl border bg-white divide-y">
                {students.map((student) => {
                  const studentPacks = allPacks.filter(
                    (p) =>
                      p.status === "published" &&
                      p.studentIds.includes(student.id)
                  );
                  const done = studentPacks.filter(
                    (p) => getCompletionRate(p.progress) === 100
                  ).length;
                  return (
                    <Link
                      key={student.id}
                      href={`/alunos/${student.id}`}
                      className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback
                          className={cn("text-xs font-bold", student.color)}
                        >
                          {student.avatarInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {student.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.grade}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-foreground">
                          {done}/{studentPacks.length}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          concluídos
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {draftPacks.length > 0 && (
              <section>
                <h3 className="font-semibold text-foreground mb-3">
                  Pendentes de publicação
                </h3>
                <div className="rounded-xl border bg-white divide-y">
                  {draftPacks.map((pack) => (
                    <Link
                      key={pack.id}
                      href={`/pacotes/${pack.id}`}
                      className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <div
                        className={cn(
                          "mt-0.5 h-2 w-2 rounded-full shrink-0",
                          pack.status === "in_review"
                            ? "bg-amber-400"
                            : "bg-slate-300"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {pack.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {pack.subject} · {pack.grade}
                        </p>
                      </div>
                      <Badge
                        variant={
                          pack.status === "in_review" ? "review" : "draft"
                        }
                        className="shrink-0 text-[10px]"
                      >
                        {pack.status === "in_review" ? "Em revisão" : "Rascunho"}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="font-semibold text-foreground mb-3">
                Próximas provas
              </h3>
              <div className="rounded-xl border bg-white divide-y">
                {[...allPacks]
                  .filter((p) => { const d = getDaysUntilExam(p.examDate); return d !== null && d > 0; })
                  .sort((a, b) => (getDaysUntilExam(a.examDate) ?? 0) - (getDaysUntilExam(b.examDate) ?? 0))
                  .slice(0, 4)
                  .map((pack) => {
                    const days = getDaysUntilExam(pack.examDate);
                    return (
                      <div key={pack.id} className="flex items-center gap-3 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {pack.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pack.examName}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "text-xs font-semibold shrink-0",
                            days !== null && days <= 7
                              ? "text-amber-600"
                              : "text-muted-foreground"
                          )}
                        >
                          {days !== null ? `${days}d` : "—"}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
