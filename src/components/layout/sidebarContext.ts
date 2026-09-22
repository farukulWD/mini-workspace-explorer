"use client";

import { createContext, useContext } from "react";

export interface SidebarContextValue {
  closeSidebar: () => void;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used inside <AppShell>.");
  return context;
}
