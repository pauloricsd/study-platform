import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { MobileMenuButton } from "./mobile-menu-button";
import { UserMenu } from "./user-menu";

interface TopbarProps {
  title: string;
  action?: React.ReactNode;
}

export function Topbar({ title, action }: TopbarProps) {
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
        <UserMenu />
      </div>
    </header>
  );
}
