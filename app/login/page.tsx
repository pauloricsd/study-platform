"use client";

import { Suspense } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "./actions";
import Link from "next/link";
import { Sparkles, Loader2, Mail, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
  const msg = searchParams.get("msg");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25 mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sia
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plataforma de estudos personalizada
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Entrar</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Acesso para professores, pais e alunos
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="seu@email.com"
                  className={cn(
                    "flex h-10 w-full rounded-lg border bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors",
                    "placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    state?.error && "border-red-300"
                  )}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className={cn(
                    "flex h-10 w-full rounded-lg border bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors",
                    "placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    state?.error && "border-red-300"
                  )}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Success msg */}
            {msg === "senha_atualizada" && (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> Senha atualizada! Faça login com a nova senha.
              </p>
            )}

            {/* Error */}
            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {state.error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium",
                "hover:bg-primary/90 transition-colors",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/recuperar-senha" className="text-primary hover:underline">
            Esqueci minha senha
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground mt-2">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="text-primary hover:underline">
            Criar conta de administrador
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
