"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  Sparkles, Loader2, User, Lock, CheckCircle2, ArrowLeft,
  BookOpen, GraduationCap, Plus, CreditCard, Calendar, Check, X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { updateProfile, updatePassword, activateRole } from "./actions";
import { logout } from "@/app/login/actions";
import { formatCPF, validateCPF } from "@/lib/cpf";
import { PasswordStrength } from "@/components/ui/password-strength";

// ── Role display config ────────────────────────────────────────────────────
const ROLE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  student: {
    label: "Aluno",
    icon:  <BookOpen className="h-3.5 w-3.5" />,
    color: "bg-primary/10 text-primary border-primary/20",
  },
  teacher: {
    label: "Professor",
    icon:  <GraduationCap className="h-3.5 w-3.5" />,
    color: "bg-violet-100 text-violet-700 border-violet-200",
  },
  admin: {
    label: "Administrador",
    icon:  <Sparkles className="h-3.5 w-3.5" />,
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────
function computeAge(birthdate: string): number | null {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const inputCls =
  "flex h-10 w-full rounded-lg border bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors " +
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50";

// ── Sub-forms ──────────────────────────────────────────────────────────────
function ProfileForm({ name }: { name: string }) {
  const [state, action, isPending] = useActionState(updateProfile, null);
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Nome completo</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            name="name" defaultValue={name} required minLength={2} disabled={isPending}
            className={inputCls}
          />
        </div>
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> Nome atualizado com sucesso.
        </p>
      )}
      <button
        type="submit" disabled={isPending}
        className="flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</> : "Salvar"}
      </button>
    </form>
  );
}

function PasswordForm() {
  const [state, action, isPending] = useActionState(updatePassword, null);
  return (
    <form action={action} className="space-y-4">
      {(["current", "next", "confirm"] as const).map((field) => (
        <div key={field} className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            {field === "current" ? "Senha atual" : field === "next" ? "Nova senha" : "Confirmar nova senha"}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              name={field} type="password" required
              minLength={field === "current" ? 1 : 6}
              placeholder={field !== "current" ? "Mínimo 6 caracteres" : ""}
              disabled={isPending}
              className={inputCls}
            />
          </div>
          {field === "next" && <PasswordStrength password="" />}
        </div>
      ))}
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> Senha alterada com sucesso.
        </p>
      )}
      <button
        type="submit" disabled={isPending}
        className="flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Alterando...</> : "Alterar senha"}
      </button>
    </form>
  );
}

// ── Activate teacher profile form ─────────────────────────────────────────
function ActivateTeacherForm({
  existingBirthdate,
  existingCpf,
  onSuccess,
}: {
  existingBirthdate: string | null;
  existingCpf: string | null;
  onSuccess: () => void;
}) {
  const [state, action, isPending] = useActionState(activateRole, null);
  const [cpf, setCpf]             = useState(existingCpf ? "" : ""); // always start empty for re-entry
  const [birthdate, setBirthdate] = useState("");

  const cpfDigits   = cpf.replace(/\D/g, "");
  const cpfComplete = cpfDigits.length === 11;
  const cpfValid    = cpfComplete ? validateCPF(cpf) : null;

  const age   = computeAge(birthdate || existingBirthdate || "");
  const ageOk = age === null || age >= 18;

  const needsBirthdate = !existingBirthdate;
  const canSubmit =
    cpfValid === true &&
    (!needsBirthdate || (birthdate !== "" && ageOk));

  if (state?.success) {
    onSuccess();
    return null;
  }

  return (
    <form action={action} className="mt-4 space-y-4 border-t pt-4">
      <input type="hidden" name="target_role" value="teacher" />

      {/* Show existing birthdate as read-only, or ask for it */}
      {existingBirthdate ? (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Data de nascimento</p>
          <p className="text-sm text-foreground">
            {new Date(existingBirthdate).toLocaleDateString("pt-BR")}
            {age !== null && <span className="text-muted-foreground ml-1.5">({age} anos)</span>}
          </p>
          <input type="hidden" name="birthdate" value={existingBirthdate} />
        </div>
      ) : (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Data de nascimento <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              name="birthdate" type="date" required
              value={birthdate} onChange={(e) => setBirthdate(e.target.value)}
              className={cn(inputCls, birthdate && !ageOk && "border-red-300")}
              disabled={isPending}
            />
          </div>
          {birthdate && !ageOk && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <X className="h-3 w-3 shrink-0" />
              É necessário ter 18 anos ou mais para ativar o perfil de professor.
            </p>
          )}
          {birthdate && ageOk && age !== null && (
            <p className="text-xs text-muted-foreground">{age} anos</p>
          )}
        </div>
      )}

      {/* CPF */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          CPF <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            name="cpf" type="text" inputMode="numeric" required
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(formatCPF(e.target.value))}
            className={cn(
              inputCls, "pr-9",
              cpfComplete && cpfValid === false && "border-red-300",
              cpfValid === true && "border-emerald-400",
            )}
            disabled={isPending}
          />
          {cpfComplete && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {cpfValid
                ? <Check className="h-4 w-4 text-emerald-500" />
                : <X     className="h-4 w-4 text-red-500"     />}
            </span>
          )}
        </div>
        {cpfComplete && cpfValid === false && (
          <p className="text-xs text-red-600">CPF inválido.</p>
        )}
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit" disabled={isPending || !canSubmit}
        className="flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-60"
      >
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Ativando...</> : "Ativar perfil de professor"}
      </button>
    </form>
  );
}

// ── Role activation section ───────────────────────────────────────────────
function RolesSection({
  roles,
  cpf,
  birthdate,
}: {
  roles: string[];
  cpf: string | null;
  birthdate: string | null;
}) {
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [, actionStudent, isPendingStudent]   = useActionState(activateRole, null);

  const hasTeacher = roles.includes("teacher");
  const hasStudent = roles.includes("student");
  const hasAdmin   = roles.includes("admin");

  const canActivateTeacher = !hasTeacher;
  const canActivateStudent = !hasStudent;

  return (
    <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-4">
      <h2 className="font-semibold text-foreground">Perfis ativos</h2>

      {/* Active role badges */}
      <div className="flex flex-wrap gap-2">
        {roles.map((r) => {
          const cfg = ROLE_LABELS[r] ?? { label: r, icon: null, color: "bg-muted text-muted-foreground border-border" };
          return (
            <span
              key={r}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                cfg.color
              )}
            >
              {cfg.icon}
              {cfg.label}
            </span>
          );
        })}
      </div>

      {/* Activate teacher profile */}
      {canActivateTeacher && !hasAdmin && (
        <div className="rounded-xl border bg-violet-50/50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-violet-600" />
                Ativar perfil de professor
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Crie e gerencie pacotes de estudo. Requer CPF e idade mínima de 18 anos.
              </p>
            </div>
            {!showTeacherForm && (
              <button
                onClick={() => setShowTeacherForm(true)}
                className="shrink-0 flex items-center gap-1 text-xs font-medium text-violet-700 hover:text-violet-900 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Ativar
              </button>
            )}
          </div>
          {showTeacherForm && (
            <ActivateTeacherForm
              existingBirthdate={birthdate}
              existingCpf={cpf}
              onSuccess={() => setShowTeacherForm(false)}
            />
          )}
        </div>
      )}

      {/* Activate student profile */}
      {canActivateStudent && (
        <div className="rounded-xl border bg-primary/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
                Ativar perfil de aluno
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Acesse materiais de estudo e acompanhe seu progresso.
              </p>
            </div>
            <form action={actionStudent}>
              <input type="hidden" name="target_role" value="student" />
              <button
                type="submit" disabled={isPendingStudent}
                className="shrink-0 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-60"
              >
                {isPendingStudent
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Plus className="h-3.5 w-3.5" />}
                Ativar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
interface Props {
  name: string;
  email: string;
  role: string;
  roles: string[];
  cpf: string | null;
  birthdate: string | null;
  initials: string;
  color: string | null;
}

export function ConfiguracoesClient({ name, email, role, roles, cpf, birthdate, initials, color }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-white/95 backdrop-blur px-4 lg:px-6 gap-3">
        <Link
          href={roles.includes("student") ? "/estudar" : "/"}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mr-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="font-bold text-foreground">Configurações</span>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8 space-y-6">
        {/* Identity */}
        <div className="rounded-2xl border bg-white shadow-sm p-6 flex items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold"
            style={color
              ? { backgroundColor: `${color}20`, color }
              : { backgroundColor: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{name}</p>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {roles.map((r) => {
                const cfg = ROLE_LABELS[r] ?? { label: r, icon: null, color: "bg-muted text-muted-foreground border-border" };
                return (
                  <span
                    key={r}
                    className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", cfg.color)}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Informações pessoais</h2>
          <ProfileForm name={name} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">E-mail</label>
            <input
              value={email} readOnly
              className="flex h-10 w-full rounded-lg border bg-muted/30 px-3 py-1 text-sm text-muted-foreground cursor-default"
            />
            <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
          </div>
        </div>

        {/* Active roles + activation */}
        <RolesSection roles={roles} cpf={cpf} birthdate={birthdate} />

        {/* Password */}
        <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Alterar senha</h2>
          <PasswordForm />
        </div>

        {/* Logout */}
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <h2 className="font-semibold text-foreground mb-3">Sessão</h2>
          <form action={logout}>
            <button type="submit" className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">
              Sair da conta
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
