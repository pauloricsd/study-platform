"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Sparkles, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { requestPasswordReset } from "./actions";

export default function RecuperarSenhaPage() {
  const [state, action, isPending] = useActionState(requestPasswordReset, null);

  if (state?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25 mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sia</h1>
          </div>
          <div className="rounded-2xl border bg-white shadow-sm p-6 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 mx-auto">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">E-mail enviado</h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha em instantes.
              </p>
            </div>
            <Link
              href="/login"
              className="block w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25 mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sia</h1>
          <p className="text-sm text-muted-foreground mt-1">Plataforma de estudos personalizada</p>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recuperar senha</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
          </div>

          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  disabled={isPending}
                  className="flex h-10 w-full rounded-lg border bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                />
              </div>
            </div>

            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium",
                "hover:bg-primary/90 transition-colors disabled:opacity-60"
              )}
            >
              {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Enviando...</> : "Enviar link"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Lembrou a senha?{" "}
          <Link href="/login" className="text-primary hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
