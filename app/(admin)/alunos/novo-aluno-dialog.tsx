"use client";

import { useState, useTransition } from "react";
import { UserPlus, Eye, EyeOff, Copy, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createStudent } from "./actions";

// ── Grade options ─────────────────────────────────────────────────────────────
const GRADES = [
  "1º ano – Fundamental",
  "2º ano – Fundamental",
  "3º ano – Fundamental",
  "4º ano – Fundamental",
  "5º ano – Fundamental",
  "6º ano – Fundamental",
  "7º ano – Fundamental",
  "8º ano – Fundamental",
  "9º ano – Fundamental",
  "1º ano – Médio",
  "2º ano – Médio",
  "3º ano – Médio",
];

// ── Success screen ─────────────────────────────────────────────────────────────
function SuccessScreen({
  name,
  loginEmail,
  onClose,
}: {
  name: string;
  loginEmail: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(loginEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-5 py-2 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <Check className="h-8 w-8 text-emerald-600" />
      </div>
      <div>
        <p className="text-lg font-semibold">Conta criada!</p>
        <p className="text-sm text-muted-foreground mt-1">
          O aluno <span className="font-medium">{name}</span> já pode fazer login.
        </p>
      </div>

      <div className="w-full rounded-xl border bg-muted/40 px-4 py-3 text-left space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Login gerado (interno)
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm font-mono text-foreground truncate">
            {loginEmail}
          </code>
          <button
            onClick={copy}
            className="shrink-0 rounded-md p-1.5 hover:bg-muted transition-colors"
            title="Copiar"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Este é o e-mail interno usado pelo sistema. Você pode compartilhar
          apenas a senha com o aluno — o login é opcional.
        </p>
      </div>

      <Button className="w-full" onClick={onClose}>
        Fechar
      </Button>
    </div>
  );
}

// ── Main dialog ───────────────────────────────────────────────────────────────
export function NovoAlunoDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ name: string; loginEmail: string } | null>(null);

  function handleClose() {
    setOpen(false);
    // reset after close animation
    setTimeout(() => {
      setError(null);
      setSuccess(null);
      setShowPassword(false);
    }, 300);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();

    startTransition(async () => {
      const result = await createStudent(fd);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess({ name, loginEmail: result.loginEmail! });
      }
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <UserPlus className="h-4 w-4" />
        Novo aluno
      </Button>

      <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else setOpen(true); }}>
        <DialogContent className="max-w-md">
          {success ? (
            <SuccessScreen
              name={success.name}
              loginEmail={success.loginEmail}
              onClose={handleClose}
            />
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Criar conta de aluno</DialogTitle>
                <DialogDescription>
                  Crie uma conta sem e-mail. O aluno acessa com login e senha definidos aqui.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="name">
                    Nome completo <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Ana Luiza Costa"
                    required
                    autoFocus
                    disabled={isPending}
                  />
                </div>

                {/* Grade */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="grade">
                    Série / Ano
                  </label>
                  <select
                    id="grade"
                    name="grade"
                    disabled={isPending}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <option value="">Selecione (opcional)</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="password">
                    Senha temporária <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                      required
                      disabled={isPending}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O aluno poderá alterar a senha depois do primeiro acesso.
                  </p>
                </div>

                {error && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPending} className="gap-2">
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isPending ? "Criando…" : "Criar conta"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
