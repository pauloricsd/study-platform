import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConfiguracoesClient } from "./configuracoes-client";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role, avatar_initials, avatar_color, roles, cpf, birthdate")
    .eq("id", user.id)
    .single();

  const name     = profile?.name ?? user.user_metadata?.name ?? "Usuário";
  const initials = name.trim().split(/\s+/).map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  // Derive active roles — fall back to primary role for existing accounts
  const primaryRole = profile?.role ?? "admin";
  const roles: string[] = (profile?.roles as string[] | null)?.length
    ? (profile.roles as string[])
    : [primaryRole];

  return (
    <ConfiguracoesClient
      name={name}
      email={user.email ?? ""}
      role={primaryRole}
      roles={roles}
      cpf={(profile?.cpf as string | null) ?? null}
      birthdate={(profile?.birthdate as string | null) ?? null}
      initials={initials}
      color={profile?.avatar_color ?? null}
    />
  );
}
