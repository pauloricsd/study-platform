import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { MobileMenuButton } from "./mobile-menu-button";
import { UserMenu } from "./user-menu";
import { getCurrentProfile } from "@/lib/data/auth";

interface TopbarProps {
  title: string;
  action?: React.ReactNode;
}

export async function Topbar({ title, action }: TopbarProps) {
  const profile = await getCurrentProfile();

  const initials = profile?.name
    ? profile.name.trim().split(/\s+/).map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/95 backdrop-blur px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <MobileMenuButton />
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {action}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-4 w-4" />
        </Button>
        <UserMenu
          name={profile?.name ?? "Usuário"}
          initials={initials}
          color={profile?.avatar_color ?? null}
          role={profile?.role ?? "admin"}
        />
      </div>
    </header>
  );
}
