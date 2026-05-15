"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { logout } from "@/app/login/actions";
import { Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  name: string;
  initials: string;
  color: string | null;
  role: string;
}

export function UserMenu({ name, initials, color, role }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback
            style={color ? { backgroundColor: `${color}20`, color } : undefined}
            className={cn("text-xs font-semibold", !color && "bg-primary/10 text-primary")}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-white shadow-lg z-50 overflow-hidden">
          {/* Identity */}
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-semibold text-foreground truncate">{name}</p>
            <Badge variant="secondary" className="mt-1 text-[10px] h-4">
              {role === "admin" ? "Professor / Responsável" : "Aluno"}
            </Badge>
          </div>

          {/* Actions */}
          <div className="py-1">
            <Link
              href="/configuracoes"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Configurações
            </Link>

            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
