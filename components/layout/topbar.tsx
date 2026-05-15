import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";
import { MobileMenuButton } from "./mobile-menu-button";

interface TopbarProps {
  title: string;
  action?: React.ReactNode;
}

export function Topbar({ title, action }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/95 backdrop-blur px-4 lg:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger — uses client component to access context */}
        <MobileMenuButton />
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {action}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            MJ
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
