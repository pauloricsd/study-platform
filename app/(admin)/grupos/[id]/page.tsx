import Link from "next/link";
import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getGroupDetail } from "@/lib/data/groups";
import { getGroupInvitations } from "@/lib/data/invitations";
import { getPublishedPacksNotInGroup } from "@/lib/data/assignments";
import { GroupActions } from "./group-actions";
import { AssignedPacksPanel } from "./assigned-packs-panel";
import { ArrowLeft, Users, Link2, Clock, CheckCircle2, XCircle, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

const groupTypeLabels: Record<string, string> = {
  family: "Família", school: "Escola", classroom: "Turma",
  tutoring_group: "Reforço", subject_group: "Grupo por matéria", custom: "Personalizado",
};

const inviteStatusConfig: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "draft" }> = {
  pending:  { label: "Pendente",  variant: "warning" },
  accepted: { label: "Aceito",    variant: "success" },
  expired:  { label: "Expirado",  variant: "secondary" },
  revoked:  { label: "Revogado",  variant: "draft" },
};

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [group, invitations, availablePacks] = await Promise.all([
    getGroupDetail(id),
    getGroupInvitations(id),
    getPublishedPacksNotInGroup(id),
  ]);

  if (!group) notFound();

  const pendingInvites = invitations.filter((i) => i.status === "pending");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sia-plataforma.vercel.app";

  return (
    <>
      <Topbar
        title={group.name}
        action={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/grupos"><ArrowLeft className="h-4 w-4 mr-1.5" />Grupos</Link>
          </Button>
        }
      />
      <main className="p-6 space-y-6 max-w-4xl">

        {/* Header */}
        <div className="rounded-2xl border bg-white p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{groupTypeLabels[group.type] ?? group.type}</Badge>
                {group.grade && <Badge variant="secondary">{group.grade}</Badge>}
                {group.subject && <Badge variant="secondary">{group.subject}</Badge>}
              </div>
              <h1 className="text-xl font-bold text-foreground">{group.name}</h1>
              {group.school_name && <p className="text-sm text-muted-foreground">{group.school_name}</p>}
              {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{group.members.length} alunos</span>
              <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" />{group.assignedPacks.length} pacotes</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">

            {/* Members */}
            <section className="rounded-2xl border bg-white overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Membros ({group.members.length})
                </h2>
              </div>
              {group.members.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  Nenhum aluno ainda. Crie um convite para adicionar alunos.
                </div>
              ) : (
                <div className="divide-y">
                  {group.members.map(({ student_id, profile, joined_at }) => (
                    <div key={student_id} className="flex items-center gap-3 px-5 py-3.5">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className={cn("text-xs font-bold", profile.avatar_color ?? "bg-muted")}>
                          {profile.avatar_initials ?? profile.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{profile.name}</p>
                        {profile.grade && <p className="text-xs text-muted-foreground">{profile.grade}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        Entrou {new Date(joined_at).toLocaleDateString("pt-BR")}
                      </span>
                      <GroupActions groupId={group.id} type="remove_member" studentId={student_id} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Assigned packs */}
            <AssignedPacksPanel
              groupId={group.id}
              packs={group.assignedPacks}
              availablePacks={availablePacks}
            />
          </div>

          {/* Invitations panel */}
          <div className="space-y-5">
            <section className="rounded-2xl border bg-white overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  Convites
                </h2>
                <GroupActions groupId={group.id} type="create_invite" baseUrl={baseUrl} />
              </div>

              {pendingInvites.length > 0 && (
                <div className="px-5 py-3 bg-amber-50 border-b flex items-center gap-2 text-xs text-amber-700">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {pendingInvites.length} convite{pendingInvites.length !== 1 ? "s" : ""} pendente{pendingInvites.length !== 1 ? "s" : ""}
                </div>
              )}

              {invitations.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                  Nenhum convite criado.
                </div>
              ) : (
                <div className="divide-y">
                  {invitations.map((inv) => {
                    const cfg = inviteStatusConfig[inv.status];
                    const isExpired = inv.status === "pending" && new Date(inv.expires_at) < new Date();
                    return (
                      <div key={inv.id} className="px-5 py-3.5 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {inv.student_name && (
                              <p className="text-sm font-medium text-foreground truncate">{inv.student_name}</p>
                            )}
                            {inv.email && (
                              <p className="text-xs text-muted-foreground truncate">{inv.email}</p>
                            )}
                            {!inv.student_name && !inv.email && (
                              <p className="text-xs text-muted-foreground">Link genérico</p>
                            )}
                          </div>
                          <Badge variant={isExpired ? "secondary" : cfg.variant} className="shrink-0 text-[10px]">
                            {isExpired ? "Expirado" : cfg.label}
                          </Badge>
                        </div>
                        {inv.status === "pending" && !isExpired && (
                          <div className="flex items-center gap-2">
                            <GroupActions groupId={group.id} type="copy_link" token={inv.token} baseUrl={baseUrl} />
                            <GroupActions groupId={group.id} type="revoke_invite" invitationId={inv.id} />
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          {inv.status === "pending" && !isExpired
                            ? `Expira ${new Date(inv.expires_at).toLocaleDateString("pt-BR")}`
                            : `Criado ${new Date(inv.created_at).toLocaleDateString("pt-BR")}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
