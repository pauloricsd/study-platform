"use client";

import { createContext, useContext } from "react";

export interface SidebarContextValue {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleCollapsed: () => void;
}

export const SidebarContext = createContext<SidebarContextValue>({
  isCollapsed: false,
  isMobileOpen: false,
  openMobile: () => {},
  closeMobile: () => {},
  toggleCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);
