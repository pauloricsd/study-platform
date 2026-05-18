"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signup } from "./actions";
import {
  Sparkles, Loader2, Mail, Lock, User,
  Eye, EyeOff, GraduationCap, BookOpen,
  Check, X, Calendar, CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PasswordStrength, passwordValid } from "@/components/ui/password-strength";
import { formatCPF, validateCPF } from "@/lib/cpf";

// ── Age helper ────────────────────────────────────────────────────────────────
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

// ── Shared input class ────────────────────────────────────────────────────────
const inputCls =
  "flex h-10 w-full rounded-lg border bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors " +
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring " +
  "disabled:cursor-not-allowed disabled:opacity-50";

// ── Main form ─────────────────────────────────────────────────────────────────
function CadastroForm() {
  const [state, formAction, isPending] = useActionState(signup, null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";

  const [role, setRole] = useState<"student" | "teacher" | null>(null);
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cpf, setCpf]               = useState("");
  const [birthdate, setBirthdate]   = useState("");

  const cpfDigits   = cpf.replace(/\D/g, "");
  const cpfComplete = cpfDigits.length === 11;
  const cpfValid    = cpfComplete ? validateCPF(cpf) : null; // null = still typing

  const age   = computeAge(birthdate);
  const ageOk = age === null || age >= 18;

  const canSubmit =
    role !== null &&
    password.length > 0 &&
    passwordValid(password) &&
    (role === "student" ||
      (cpfValid === true && birthdate !== "" && ageOk));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25 mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sia</h1>
          <p className="text-sm text-muted-foreground mt-1">Plataforma de estudos personalizada</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Criar conta</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Comece escolhendo seu perfil</p>
          </div>

          {/* ── Role selector ───────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all",
                role === "student"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-slate-50"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                role === "student" ? "bg-primary/10" : "bg-muted"
              )}>
                <BookOpen className={cn("h-5 w-5", role === "student" ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <p className={cn("text-sm font-semibold", role === "student" ? "text-primary" : "text-foreground")}>
                  Aluno
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Acesso aos materiais</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all",
                role === "teacher"
                  ? "border-violet-500 bg-violet-50"
                  : "border-border hover:border-violet-300 hover:bg-slate-50"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                role === "teacher" ? "bg-violet-100" : "bg-muted"
              )}>
                <GraduationCap className={cn("h-5 w-5", role === "teacher" ? "text-violet-600" : "text-muted-foreground")} />
              </div>
              <div>
                <p className={cn("text-sm font-semibold", role === "teacher" ? "text-violet-700" : "text-foreground")}>
                  Professor
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Cria e gerencia pacotes</p>
              </div>
            </button>
          </div>

          {/* ── Form — only shown after role is chosen ───────────────── */}
          {role !== null && (
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
                    id="name" name="name" type="text" autoComplete="name"
                    required placeholder="Seu nome completo"
                    className={inputCls} disabled={isPending}
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
                    id="email" name="email" type="email" autoComplete="email"
                    required placeholder="seu@email.com"
                    className={inputCls} disabled={isPending}
                  />
                </div>
              </div>

              {/* ── Professor-only fields ──────────────────────────────── */}
              {role === "teacher" && (
                <>
                  {/* Birthdate */}
                  <div className="space-y-1.5">
                    <label htmlFor="birthdate" className="text-sm font-medium text-foreground">
                      Data de nascimento <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="birthdate" name="birthdate" type="date" required
                        value={birthdate} onChange={(e) => setBirthdate(e.target.value)}
                        className={cn(inputCls, birthdate && !ageOk && "border-red-300")}
                        disabled={isPending}
                      />
                    </div>
                    {birthdate && !ageOk && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <X className="h-3 w-3 shrink-0" />
                        É necessário ter 18 anos ou mais para criar uma conta de professor.
                      </p>
                    )}
                    {birthdate && ageOk && age !== null && (
                      <p className="text-xs text-muted-foreground">{age} anos</p>
                    )}
                  </div>

                  {/* CPF */}
                  <div className="space-y-1.5">
                    <label htmlFor="cpf" className="text-sm font-medium text-foreground">
                      CPF <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="cpf" name="cpf" type="text" inputMode="numeric" required
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
                </>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="password" name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password" required
                    placeholder="Crie uma senha segura"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className={cn(inputCls, "pr-10")}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
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
                disabled={isPending || !canSubmit}
                className={cn(
                  "w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium",
                  "hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                )}
              >
                {isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Criando conta...</>
                  : "Criar conta"}
              </button>
            </form>
          )}
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
