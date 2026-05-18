import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import Link from "next/link";
import { Settings, ExternalLink } from "lucide-react";
import { SidebarNav } from "./_components/sidebar-nav";

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
        <SidebarNav />

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
