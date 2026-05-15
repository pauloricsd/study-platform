"use client";

import { useActionState } from "react";
import { Sparkles, Loader2, User, Lock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { updateProfile, updatePassword } from "./actions";
import { logout } from "@/app/login/actions";

interface Props {
  name: string;
  email: string;
  role: string;
  initials: string;
  color: string | null;
}

function ProfileForm({ name }: { name: string }) {
  const [state, action, isPending] = useActionState(updateProfile, null);
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Nome completo</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            name="name"
            defaultValue={name}
            required
            minLength={2}
            disabled={isPending}
            className="flex h-10 w-full rounded-lg border bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
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
        type="submit"
        disabled={isPending}
        className={cn(
          "flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium",
          "hover:bg-primary/90 transition-colors disabled:opacity-60"
        )}
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
              name={field}
              type="password"
              required
              minLength={field === "current" ? 1 : 6}
              placeholder={field !== "current" ? "Mínimo 6 caracteres" : ""}
              disabled={isPending}
              className="flex h-10 w-full rounded-lg border bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>
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
        type="submit"
        disabled={isPending}
        className={cn(
          "flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium",
          "hover:bg-primary/90 transition-colors disabled:opacity-60"
        )}
      >
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Alterando...</> : "Alterar senha"}
      </button>
    </form>
  );
}

export function ConfiguracoesClient({ name, email, role, initials, color }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-white/95 backdrop-blur px-4 lg:px-6 gap-3">
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
            <Badge variant="secondary" className="mt-1 text-[10px] h-4">
              {role === "admin" ? "Professor / Responsável" : "Aluno"}
            </Badge>
          </div>
        </div>

        {/* Profile */}
        <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Informações pessoais</h2>
          <ProfileForm name={name} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">E-mail</label>
            <input
              value={email}
              readOnly
              className="flex h-10 w-full rounded-lg border bg-muted/30 px-3 py-1 text-sm text-muted-foreground cursor-default"
            />
            <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
          </div>
        </div>

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
