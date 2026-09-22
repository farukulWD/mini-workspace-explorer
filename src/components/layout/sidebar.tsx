"use client";

import { FolderOpen } from "lucide-react";
import { useSidebar } from "@/components/layout/sidebarContext";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectFolder,
  selectSelectedFolderId,
} from "@/redux/features/workspaceSlice";
import { ROOT_ID, ROOT_NAME } from "@/types/workspace";

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const { closeSidebar } = useSidebar();
  const selected = useAppSelector(selectSelectedFolderId) === ROOT_ID;

  return (
    <nav aria-label="Folder tree" className="px-2 pb-2">
      <button
        type="button"
        aria-current={selected ? "page" : undefined}
        onClick={() => {
          dispatch(selectFolder(ROOT_ID));
          closeSidebar();
        }}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
          selected
            ? "bg-accent-soft font-medium text-accent"
            : "hover:bg-foreground/5"
        }`}
      >
        <FolderOpen className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{ROOT_NAME}</span>
      </button>
    </nav>
  );
}
