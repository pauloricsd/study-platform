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
import { cn } from "@/lib/utils";
import { PasswordStrength, passwordValid } from "@/components/ui/password-strength";
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
  email,
  onClose,
}: {
  name: string;
  email: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(email);
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

      <div className="w-full rounded-xl border bg-muted/40 px-4 py-3 text-left space-y-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            E-mail de login
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono text-foreground truncate">{email}</code>
            <button
              onClick={copy}
              className="shrink-0 rounded-md p-1.5 hover:bg-muted transition-colors"
              title="Copiar e-mail"
            >
              {copied
                ? <Check className="h-4 w-4 text-emerald-500" />
                : <Copy className="h-4 w-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-xs text-amber-700">
            <span className="font-semibold">Lembre-se:</span> compartilhe a senha temporária
            que você definiu com o aluno ou responsável.
          </p>
        </div>
      </div>

      <Button className="w-full" onClick={onClose}>
        Fechar
      </Button>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium" htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Main dialog ───────────────────────────────────────────────────────────────
export function NovoAlunoDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ name: string; email: string } | null>(null);

  const isPasswordValid = passwordValid(password);

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setError(null);
      setSuccess(null);
      setShowPassword(false);
      setPassword("");
    }, 300);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError("A senha não atende todos os requisitos.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();
    const email = (fd.get("email") as string).trim();

    startTransition(async () => {
      const result = await createStudent(fd);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess({ name, email });
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {success ? (
            <SuccessScreen
              name={success.name}
              email={success.email}
              onClose={handleClose}
            />
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Criar conta de aluno</DialogTitle>
                <DialogDescription>
                  Preencha os dados do aluno. Campos marcados com * são obrigatórios.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-5 pt-1">

                {/* ── Dados pessoais ──────────────────────────────── */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Dados pessoais
                  </p>

                  <Field label="Nome completo" htmlFor="name" required>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ex: Ana Luiza Costa"
                      required
                      autoFocus
                      disabled={isPending}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Data de nascimento" htmlFor="birthdate">
                      <Input
                        id="birthdate"
                        name="birthdate"
                        type="date"
                        disabled={isPending}
                        className="block"
                      />
                    </Field>

                    <Field label="Série / Ano" htmlFor="grade">
                      <select
                        id="grade"
                        name="grade"
                        disabled={isPending}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                      >
                        <option value="">Selecione</option>
                        {GRADES.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Escola" htmlFor="school">
                    <Input
                      id="school"
                      name="school"
                      placeholder="Ex: Colégio Estadual Central"
                      disabled={isPending}
                    />
                  </Field>
                </div>

                {/* ── Acesso ao sistema ───────────────────────────── */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Acesso ao sistema
                  </p>

                  <Field label="E-mail de login" htmlFor="email" required>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Ex: joao.silva@gmail.com"
                      required
                      disabled={isPending}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Pode ser o e-mail do aluno ou do responsável. Será usado para entrar na plataforma.
                    </p>
                  </Field>

                  <Field label="Senha temporária" htmlFor="password" required>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Crie uma senha segura"
                        required
                        disabled={isPending}
                        className="pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword
                          ? <EyeOff className="h-4 w-4" />
                          : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={password} />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      O aluno poderá alterar a senha depois do primeiro acesso.
                    </p>
                  </Field>
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
                  <Button
                    type="submit"
                    disabled={isPending || (password.length > 0 && !isPasswordValid)}
                    className="gap-2"
                  >
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
