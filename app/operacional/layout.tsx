import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import Link from "next/link";
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
  ExternalLink,
} from "lucide-react";

const navItems = [
  { href: "/operacional", label: "Overview", icon: LayoutDashboard, active: true },
  { href: "/operacional/usuarios", label: "Usuários", icon: Users, soon: true },
  { href: "/operacional/alunos", label: "Alunos", icon: GraduationCap, soon: true },
  { href: "/operacional/estudos", label: "Estudos", icon: BookOpen, soon: true },
  { href: "/operacional/tutor", label: "Tutor IA", icon: MessageCircle, soon: true },
  { href: "/operacional/uploads", label: "Uploads", icon: Upload, soon: true },
  { href: "/operacional/sistema", label: "Sistema", icon: Server, soon: true },
  { href: "/operacional/design", label: "Design System", icon: Palette, soon: true },
  { href: "/operacional/logs", label: "Logs", icon: ScrollText, soon: true },
  { href: "/operacional/configuracoes", label: "Config.", icon: Settings, soon: true },
];

export default async function OperationalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile?.isOperational) {
    redirect("/");
  }

  const env = process.env.NODE_ENV ?? "development";
  const isProd = env === "production";

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 flex flex-col border-r border-gray-800 bg-gray-900">
        {/* Logo / Header */}
        <div className="px-4 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-700">
              <Settings className="h-3.5 w-3.5 text-gray-300" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-100 leading-none">Operacional</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Sia · interno</p>
            </div>
          </div>
          {/* Ambiente */}
          <div className={`mt-3 flex items-center gap-1.5 rounded-md px-2 py-1 ${isProd ? "bg-emerald-950/60" : "bg-amber-950/60"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isProd ? "bg-emerald-400" : "bg-amber-400"}`} />
            <span className={`text-[10px] font-medium ${isProd ? "text-emerald-400" : "text-amber-400"}`}>
              {isProd ? "production" : "development"}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, soon }) =>
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
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm bg-gray-700/60 text-gray-100"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{label}</span>
              </Link>
            )
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 px-3 py-3 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Voltar à plataforma
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-700 text-[10px] font-bold text-gray-300">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-300 truncate">{profile.name}</p>
              <p className="text-[9px] text-gray-600 truncate font-mono">{profile.id.slice(0, 12)}…</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
