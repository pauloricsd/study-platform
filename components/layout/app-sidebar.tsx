"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import {
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Users,
  UsersRound,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Home,
  Compass,
  RotateCcw,
  BarChart2,
} from "lucide-react";

export type SidebarVariant = "admin" | "student";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  disabled?: boolean;
}

const adminNav: NavItem[] = [
  { href: "/", label: "Início", icon: LayoutDashboard },
  { href: "/pacotes", label: "Pacotes de Estudo", icon: BookOpen },
  { href: "/alunos", label: "Alunos", icon: Users },
  { href: "/grupos", label: "Grupos", icon: UsersRound },
  { href: "/materiais", label: "Materiais", icon: FileText },
  { href: "/relatorios", label: "Relatórios", icon: BarChart2 },
];

const studentNav: NavItem[] = [
  { href: "/estudar", label: "Início", icon: Home },
  { href: "/estudar/historico", label: "Revisão", icon: RotateCcw },
  { href: "/estudar/explorar", label: "Explorar", icon: Compass, badge: "Em breve", disabled: true },
  { href: "/estudar/materiais", label: "Meus Materiais", icon: FileText },
];

const adminBottomNav: NavItem[] = [
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

const studentBottomNav: NavItem[] = [
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

interface AppSidebarProps {
  variant: SidebarVariant;
}

export function AppSidebar({ variant }: AppSidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, closeMobile, toggleCollapsed } = useSidebar();

  const nav = variant === "admin" ? adminNav : studentNav;
  const bottomNav = variant === "admin" ? adminBottomNav : studentBottomNav;

  const isActive = (href: string) => {
    if (href === "/" || href === "/estudar") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-white transition-all duration-300 ease-in-out",
          // Width
          isCollapsed ? "w-16" : "w-60",
          // Mobile: slide in/out
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible
          "lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex h-16 shrink-0 items-center border-b transition-all duration-300",
          isCollapsed ? "justify-center px-0" : "gap-2.5 px-5"
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-foreground">Sia</span>
          )}
          {/* Mobile close */}
          {isMobileOpen && !isCollapsed && (
            <button
              onClick={closeMobile}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {nav.map(({ href, label, icon: Icon, badge, disabled }) => {
            const active = isActive(href);
            return (
              <div key={href} className="relative group/item">
                <Link
                  href={disabled ? "#" : href}
                  onClick={disabled ? (e) => e.preventDefault() : closeMobile}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isCollapsed ? "justify-center px-0 mx-auto w-10 h-10" : "",
                    active
                      ? "bg-primary/10 text-primary"
                      : disabled
                      ? "text-muted-foreground/40 cursor-default"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate">{label}</span>
                      {badge && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 hidden lg:group-hover/item:flex">
                    <div className="rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-md whitespace-nowrap">
                      {label}
                      {badge && <span className="ml-1.5 opacity-60">{badge}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom nav + collapse toggle */}
        <div className="border-t p-2 space-y-0.5">
          {bottomNav.map(({ href, label, icon: Icon }) => (
            <div key={href} className="relative group/item">
              <Link
                href={href}
                onClick={closeMobile}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  isCollapsed ? "justify-center px-0 mx-auto w-10 h-10" : ""
                )}
              >
                <Icon className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
                {!isCollapsed && <span className="truncate">{label}</span>}
              </Link>
              {isCollapsed && (
                <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 hidden lg:group-hover/item:flex">
                  <div className="rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-md whitespace-nowrap">
                    {label}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapsed}
            className={cn(
              "hidden lg:flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground w-full",
              isCollapsed ? "justify-center px-0 mx-auto w-10 h-10" : ""
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span className="truncate">Recolher</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
