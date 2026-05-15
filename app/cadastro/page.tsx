"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signup } from "./actions";
import { Sparkles, Loader2, Mail, Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";

function CadastroForm() {
  const [state, formAction, isPending] = useActionState(signup, null);
  const searchParams = useSearchParams();
  const role = searchParams.get("role") === "student" ? "student" : "admin";
  const redirectTo = searchParams.get("redirect") ?? "";

  const isStudent = role === "student";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25 mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sia</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plataforma de estudos personalizada
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isStudent ? "Criar conta de aluno" : "Criar conta"}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isStudent
                ? "Crie sua conta para acessar os materiais de estudo"
                : "Cadastro para professores e responsáveis"}
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="role" value={role} />
            {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}

            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder={isStudent ? "Seu nome" : "Seu nome"}
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

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
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
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
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
                  Criando conta...
                </>
              ) : isStudent ? (
                "Criar conta e entrar"
              ) : (
                "Criar conta"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Já tem uma conta?{" "}
          <Link
            href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
            className="text-primary hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense>
      <CadastroForm />
    </Suspense>
  );
}
