import { redirect } from "next/navigation";
import Link from "next/link";
import { getInvitationByToken } from "@/lib/data/invitations";
import { getCurrentProfile } from "@/lib/data/auth";
import { AcceptInviteButton } from "./accept-button";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const groupTypeLabels: Record<string, string> = {
  family: "Família", school: "Escola", classroom: "Turma",
  tutoring_group: "Grupo de reforço", subject_group: "Grupo por matéria", custom: "Grupo",
};

export default async function ConvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const invite = await getInvitationByToken(token);
  const profile = await getCurrentProfile();

  // Convite não encontrado
  if (!invite) {
    return <InviteLayout icon={XCircle} iconColor="text-red-500" bg="bg-red-50">
      <h1 className="text-xl font-bold text-foreground">Convite não encontrado</h1>
      <p className="text-sm text-muted-foreground">Este link de convite não existe ou foi removido.</p>
      <Button asChild><Link href="/estudar">Ir para meus estudos</Link></Button>
    </InviteLayout>;
  }

  const isExpired = invite.status === "pending" && new Date(invite.expires_at) < new Date();

  // Convite inválido (revogado, expirado, já aceito)
  if (invite.status !== "pending" || isExpired) {
    const msg = invite.status === "accepted"
      ? "Este convite já foi utilizado."
      : invite.status === "revoked"
      ? "Este convite foi revogado."
      : "Este convite expirou.";
    return <InviteLayout icon={Clock} iconColor="text-amber-500" bg="bg-amber-50">
      <h1 className="text-xl font-bold text-foreground">Convite indisponível</h1>
      <p className="text-sm text-muted-foreground">{msg}</p>
      <Button asChild><Link href="/estudar">Ir para meus estudos</Link></Button>
    </InviteLayout>;
  }

  // Aluno já é membro deste grupo
  if (profile?.role === "student") {
    // will be handled by AcceptInviteButton (idempotent upsert)
  }

  const groupLabel = groupTypeLabels[invite.group.type] ?? "Grupo";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-8 shadow-sm space-y-6">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary/10">
          <Users className="h-8 w-8 text-primary" />
        </div>

        <div className="text-center space-y-1.5">
          <p className="text-sm text-muted-foreground">{groupLabel}</p>
          <h1 className="text-2xl font-bold text-foreground">{invite.group.name}</h1>
          {invite.student_name && (
            <p className="text-sm text-muted-foreground">Convite para <strong>{invite.student_name}</strong></p>
          )}
        </div>

        <div className="rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground text-center">
          Ao aceitar, você terá acesso a todos os pacotes de estudo deste grupo.
        </div>

        {profile ? (
          profile.role === "admin" ? (
            <div className="space-y-3">
              <p className="text-sm text-center text-amber-700 bg-amber-50 rounded-xl px-4 py-3">
                Você está logado como professor/responsável. Convites são para alunos.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Ir para o painel</Link>
              </Button>
            </div>
          ) : (
            <AcceptInviteButton token={token} studentId={profile.id} groupId={invite.group_id} />
          )
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-center text-muted-foreground">
              Faça login ou crie uma conta para aceitar o convite.
            </p>
            <Button className="w-full" asChild>
              <Link href={`/login?redirect=/convite/${token}`}>Entrar</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/cadastro?redirect=/convite/${token}&role=student`}>Criar conta de aluno</Link>
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Expira em {new Date(invite.expires_at).toLocaleDateString("pt-BR")}
        </p>
      </div>
    </div>
  );
}

function InviteLayout({
  icon: Icon,
  iconColor,
  bg,
  children,
}: {
  icon: React.ElementType;
  iconColor: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-8 shadow-sm text-center space-y-4">
        <div className={cn("flex h-16 w-16 mx-auto items-center justify-center rounded-2xl", bg)}>
          <Icon className={cn("h-8 w-8", iconColor)} />
        </div>
        {children}
      </div>
    </div>
  );
}
