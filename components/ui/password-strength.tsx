"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export const PASSWORD_REQUIREMENTS = [
  { label: "Mínimo 6 caracteres", test: (pw: string) => pw.length >= 6 },
  { label: "Pelo menos uma letra", test: (pw: string) => /[a-zA-ZÀ-ÿ]/.test(pw) },
  { label: "Pelo menos um número", test: (pw: string) => /[0-9]/.test(pw) },
];

export function passwordValid(pw: string) {
  return PASSWORD_REQUIREMENTS.every((r) => r.test(pw));
}

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  return (
    <ul className="mt-2 space-y-1">
      {PASSWORD_REQUIREMENTS.map((req) => {
        const ok = req.test(password);
        return (
          <li
            key={req.label}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              ok ? "text-emerald-600" : "text-gray-400"
            )}
          >
            {ok
              ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              : <Circle className="h-3.5 w-3.5 shrink-0" />}
            {req.label}
          </li>
        );
      })}
    </ul>
  );
}
