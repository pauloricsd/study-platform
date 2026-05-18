"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createInviteAction,
  revokeInviteAction,
  assignPackAction,
  unassignPackAction,
  removeMemberAction,
} from "./actions";
import { Plus, Link2, Copy, Check, X, Trash2, BookOpen, Ban } from "lucide-react";

interface GroupActionsProps {
  groupId: string;
  type: "create_invite" | "copy_link" | "revoke_invite" | "assign_pack" | "unassign_pack" | "remove_member";
  baseUrl?: string;
  token?: string;
  invitationId?: string;
  packId?: string;
  studentId?: string;
  availablePacks?: { id: string; title: string; subject: string; grade: string }[];
}

export function GroupActions(props: GroupActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [showPackSelect, setShowPackSelect] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newInviteLink, setNewInviteLink] = useState<string | null>(null);

  // ── Create invite ──────────────────────────────────────────────────────────
  if (props.type === "create_invite") {
    return (
      <>
        <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs"
          onClick={() => setShowInviteModal(true)}>
          <Plus className="h-3 w-3" />
          Novo convite
        </Button>

        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
              {newInviteLink ? (
                <>
                  <h3 className="font-semibold text-foreground">Convite criado!</h3>
                  <p className="text-sm text-muted-foreground">Compartilhe este link com o aluno. Ele expira em 5 dias e é de uso único.</p>
                  <div className="flex gap-2">
                    <input readOnly value={newInviteLink}
                      className="flex-1 rounded-lg border bg-muted/40 px-3 py-2 text-xs font-mono" />
                    <Button size="sm" variant="outline" onClick={() => {
                      const el = document.createElement("textarea");
                      el.value = newInviteLink;
                      el.setAttribute("readonly", "");
                      el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
                      document.body.appendChild(el);
                      el.focus();
                      el.select();
                      const ok = document.execCommand("copy");
                      document.body.removeChild(el);
                      if (ok) {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } else {
                        navigator.clipboard?.writeText(newInviteLink).then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }).catch(() => {});
                      }
                    }}>
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  <Button className="w-full" onClick={() => { setShowInviteModal(false); setNewInviteLink(null); router.refresh(); }}>
                    Fechar
                  </Button>
                </>
              ) : (
                <InviteForm
                  groupId={props.groupId}
                  baseUrl={props.baseUrl ?? ""}
                  onCreated={(link) => setNewInviteLink(link)}
                  onClose={() => setShowInviteModal(false)}
                />
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  // ── Copy link ──────────────────────────────────────────────────────────────
  if (props.type === "copy_link") {
    const link = `${props.baseUrl}/convite/${props.token}`;

    function copyToClipboard() {
      // Always use execCommand — works in HTTP/dev and avoids permission issues
      const el = document.createElement("textarea");
      el.value = link;
      el.setAttribute("readonly", "");
      el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
      document.body.appendChild(el);
      el.focus();
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);

      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      // If execCommand fails, try Clipboard API
      navigator.clipboard?.writeText(link).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // Nothing we can do silently — user will need to copy manually
        setCopied(false);
      });
    }

    return (
      <button
        onClick={copyToClipboard}
        className={cn("flex items-center gap-1 text-xs rounded-lg px-2 py-1 border transition-colors",
          copied ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-border hover:border-primary/40 text-muted-foreground")}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copiado" : "Copiar link"}
      </button>
    );
  }

  // ── Revoke invite ──────────────────────────────────────────────────────────
  if (props.type === "revoke_invite") {
    return (
      <button
        disabled={isPending}
        onClick={() => {
          if (!confirm("Revogar este convite?")) return;
          startTransition(async () => {
            await revokeInviteAction(props.groupId, props.invitationId!);
            router.refresh();
          });
        }}
        className="flex items-center gap-1 text-xs rounded-lg px-2 py-1 border border-border hover:border-red-300 hover:text-red-600 text-muted-foreground transition-colors disabled:opacity-50"
      >
        <Ban className="h-3 w-3" />
        Revogar
      </button>
    );
  }

  // ── Assign pack ────────────────────────────────────────────────────────────
  if (props.type === "assign_pack") {
    return (
      <>
        <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs"
          onClick={() => setShowPackSelect(true)}>
          <Plus className="h-3 w-3" />
          Atribuir pacote
        </Button>

        {showPackSelect && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Atribuir pacote ao grupo
                </h3>
                <button onClick={() => setShowPackSelect(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <p className="text-sm text-muted-foreground">Todos os membros atuais receberão acesso ao pacote.</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(props.availablePacks ?? []).map((pack) => (
                  <button key={pack.id} disabled={isPending}
                    onClick={() => {
                      startTransition(async () => {
                        await assignPackAction(props.groupId, pack.id);
                        setShowPackSelect(false);
                        router.refresh();
                      });
                    }}
                    className="w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{pack.title}</p>
                      <p className="text-xs text-muted-foreground">{pack.subject} · {pack.grade}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── Unassign pack ──────────────────────────────────────────────────────────
  if (props.type === "unassign_pack") {
    return (
      <button
        disabled={isPending}
        onClick={() => {
          if (!confirm("Remover este pacote do grupo?")) return;
          startTransition(async () => {
            await unassignPackAction(props.groupId, props.packId!);
            router.refresh();
          });
        }}
        className="p-1 rounded-lg hover:bg-red-50 hover:text-red-600 text-muted-foreground/50 transition-colors disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    );
  }

  // ── Remove member ──────────────────────────────────────────────────────────
  if (props.type === "remove_member") {
    return (
      <button
        disabled={isPending}
        onClick={() => {
          if (!confirm("Remover este aluno do grupo?")) return;
          startTransition(async () => {
            await removeMemberAction(props.groupId, props.studentId!);
            router.refresh();
          });
        }}
        className="p-1 rounded-lg hover:bg-red-50 hover:text-red-600 text-muted-foreground/40 transition-colors disabled:opacity-50"
      >
        <X className="h-4 w-4" />
      </button>
    );
  }

  return null;
}

function InviteForm({
  groupId,
  baseUrl,
  onCreated,
  onClose,
}: {
  groupId: string;
  baseUrl: string;
  onCreated: (link: string) => void;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");

  function handleCreate() {
    startTransition(async () => {
      const result = await createInviteAction(groupId, {
        studentName: studentName.trim() || undefined,
        email: email.trim() || undefined,
      });
      if (result.token) {
        onCreated(`${baseUrl}/convite/${result.token}`);
      }
    });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Novo convite</h3>
        <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>
      <p className="text-sm text-muted-foreground">
        Opcionalmente informe nome ou e-mail. O link gerado é de uso único e expira em 5 dias.
      </p>
      <div className="space-y-3">
        <input
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Nome do aluno (opcional)"
          className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="E-mail do aluno (opcional)"
          className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex gap-3">
        <Button className="flex-1 gap-2" onClick={handleCreate} disabled={isPending}>
          <Link2 className="h-3.5 w-3.5" />
          {isPending ? "Gerando..." : "Gerar link"}
        </Button>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
      </div>
    </>
  );
}
