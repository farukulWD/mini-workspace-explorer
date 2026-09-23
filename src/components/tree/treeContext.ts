"use client";

import { createContext, useContext } from "react";
import type { WorkspaceItem } from "@/types/workspace";

export interface TreeContextValue {
  tabbableId: string;
  onFocusItem: (id: string) => void;
  onActivate: (item: WorkspaceItem) => void;
}

export const TreeContext = createContext<TreeContextValue | null>(null);

export function useTree(): TreeContextValue {
  const context = useContext(TreeContext);
  if (!context) throw new Error("useTree must be used inside <WorkspaceTree>.");
  return context;
}
