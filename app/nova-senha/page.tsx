"use client";

import { useActionState } from "react";
import { Sparkles, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { setNewPassword } from "./actions";

export default function NovaSenhaPage() {
  const [state, action, isPending] = useActionState(setNewPassword, null);

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
            <h2 className="text-lg font-semibold text-foreground">Nova senha</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Escolha uma nova senha para a sua conta.</p>
          </div>

          <form action={action} className="space-y-4">
            {(["password", "confirm"] as const).map((field) => (
              <div key={field} className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  {field === "password" ? "Nova senha" : "Confirmar senha"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    name={field}
                    type="password"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    disabled={isPending}
                    className="flex h-10 w-full rounded-lg border bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  />
                </div>
              </div>
            ))}

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
              {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</> : "Salvar nova senha"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
