"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./sidebar-context";

export function MobileMenuButton() {
  const { openMobile } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden text-muted-foreground"
      onClick={openMobile}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
