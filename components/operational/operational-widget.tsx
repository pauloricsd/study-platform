"use client";

import { useState } from "react";
import { Settings, ExternalLink, Copy, Check, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface OperationalWidgetProps {
  userId: string;
  environment: string;
}

export function OperationalWidget({ userId, environment }: OperationalWidgetProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyUserId() {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openPanel() {
    window.open("/operacional", "_blank");
    setOpen(false);
  }

  const isProd = environment === "production";

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0" onClick={() => setOpen(false)} />

          {/* Menu */}
          <div className="absolute bottom-10 left-0 mb-1 w-56 rounded-xl border bg-white shadow-xl overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2.5 border-b bg-muted/30 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Operacional
                </p>
              </div>
              <span className={cn(
                "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                isProd
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              )}>
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isProd ? "bg-emerald-500" : "bg-amber-500"
                )} />
                {isProd ? "production" : "development"}
              </span>
            </div>

            {/* Actions */}
            <button
              onClick={openPanel}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors text-left"
            >
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              Abrir painel operacional
            </button>

            <button
              onClick={copyUserId}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors text-left"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
              {copied ? "Copiado!" : "Copiar user ID"}
            </button>

            {/* Footer */}
            <div className="flex items-center gap-2 px-3 py-2 border-t bg-muted/20">
              <Monitor className="h-3 w-3 text-muted-foreground/60 shrink-0" />
              <p className="text-[10px] text-muted-foreground/60 truncate font-mono">
                {userId.slice(0, 8)}…
              </p>
            </div>
          </div>
        </>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border bg-white/90 backdrop-blur px-2.5 py-1.5",
          "text-xs font-medium shadow-md transition-all select-none",
          "text-muted-foreground hover:text-foreground hover:border-primary/30 hover:shadow-lg",
          open && "border-primary/40 text-foreground shadow-lg bg-white"
        )}
        aria-label="Abrir menu operacional"
      >
        <Settings className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-45 text-primary")} />
        <span className="hidden sm:inline">Ops</span>
      </button>
    </div>
  );
}
