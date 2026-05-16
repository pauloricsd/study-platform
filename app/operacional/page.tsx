import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { Settings } from "lucide-react";

export default async function OperationalPage() {
  const profile = await getCurrentProfile();

  if (!profile?.isOperational) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800 border border-gray-700">
          <Settings className="h-8 w-8 text-gray-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Painel Operacional</h1>
          <p className="text-sm text-gray-500 mt-1">Em construção — Fase 6</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-left space-y-1.5">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Sessão</p>
          <p className="text-xs text-gray-400 font-mono break-all">{profile.id}</p>
          <p className="text-xs text-gray-500">{profile.name} · {profile.role}</p>
        </div>
        <p className="text-xs text-gray-600">
          Acesso restrito — permissão <code className="text-gray-500">operational</code>
        </p>
      </div>
    </div>
  );
}
