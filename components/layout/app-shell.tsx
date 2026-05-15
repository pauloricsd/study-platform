"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SidebarContext, type SidebarContextValue } from "./sidebar-context";
import { AppSidebar, type SidebarVariant } from "./app-sidebar";

interface AppShellProps {
  variant: SidebarVariant;
  children: React.ReactNode;
}

export function AppShell({ variant, children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Persist collapsed preference
  useEffect(() => {
    const saved = localStorage.getItem(`sia-sidebar-collapsed-${variant}`);
    if (saved !== null) setIsCollapsed(saved === "true");
  }, [variant]);

  const toggleCollapsed = () => {
    setIsCollapsed((v) => {
      const next = !v;
      localStorage.setItem(`sia-sidebar-collapsed-${variant}`, String(next));
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, []);

  const ctx: SidebarContextValue = {
    isCollapsed,
    isMobileOpen,
    openMobile: () => setIsMobileOpen(true),
    closeMobile: () => setIsMobileOpen(false),
    toggleCollapsed,
  };

  return (
    <SidebarContext.Provider value={ctx}>
      <div className="min-h-screen bg-gray-50/50">
        <AppSidebar variant={variant} />
        <div
          className={cn(
            "transition-[padding-left] duration-300 ease-in-out",
            isCollapsed ? "lg:pl-16" : "lg:pl-60"
          )}
        >
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
