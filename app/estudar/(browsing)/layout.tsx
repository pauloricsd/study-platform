import { AppShell } from "@/components/layout/app-shell";
import { UserProfileProvider } from "@/components/layout/user-profile-context";
import { getCurrentProfile } from "@/lib/data/auth";
import { OperationalWidget } from "@/components/operational/operational-widget";

function toInitials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default async function StudentBrowsingLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  const profileData = {
    name: profile?.name ?? "Usuário",
    initials: profile?.name ? toInitials(profile.name) : "?",
    color: profile?.avatarColor ?? null,
    role: "student" as const,        // this layout always renders the student view
    canSwitchRole: profile?.canSwitchRole ?? false,
  };

  return (
    <UserProfileProvider profile={profileData}>
      <AppShell variant="student">{children}</AppShell>
      {profile?.isOperational && (
        <OperationalWidget
          userId={profile.id}
          environment={process.env.NODE_ENV ?? "development"}
        />
      )}
    </UserProfileProvider>
  );
}
