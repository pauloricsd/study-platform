"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  MessageCircle,
  Upload,
  Server,
  Palette,
  ScrollText,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  soon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/operacional", label: "Overview", icon: LayoutDashboard },
  { href: "/operacional/usuarios", label: "Usuários", icon: Users, soon: true },
  { href: "/operacional/alunos", label: "Alunos", icon: GraduationCap, soon: true },
  { href: "/operacional/estudos", label: "Estudos", icon: BookOpen, soon: true },
  { href: "/operacional/tutor", label: "Tutor IA", icon: MessageCircle, soon: true },
  { href: "/operacional/uploads", label: "Uploads", icon: Upload, soon: true },
  { href: "/operacional/sistema", label: "Sistema", icon: Server, soon: true },
  { href: "/operacional/design", label: "Design System", icon: Palette },
  { href: "/operacional/logs", label: "Logs", icon: ScrollText, soon: true },
  { href: "/operacional/configuracoes", label: "Config.", icon: Settings, soon: true },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
      {NAV_ITEMS.map(({ href, label, icon: Icon, soon }) =>
        soon ? (
          <span
            key={href}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-500 cursor-default select-none"
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{label}</span>
            <span className="ml-auto text-[9px] font-medium text-gray-600 bg-gray-800 rounded px-1 py-0.5">
              em breve
            </span>
          </span>
        ) : (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
              pathname === href
                ? "bg-gray-700/60 text-gray-100"
                : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{label}</span>
          </Link>
        )
      )}
    </nav>
  );
}
