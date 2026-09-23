"use client";

import { FileText, Folder } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  openFile,
  selectChildrenIndex,
  selectFolder,
  selectOpenFileId,
  selectSelectedFolderId,
} from "@/redux/features/workspaceSlice";
import type { WorkspaceItem } from "@/types/workspace";

const NO_CHILDREN: WorkspaceItem[] = [];

export default function FolderList() {
  const dispatch = useAppDispatch();
  const folderId = useAppSelector(selectSelectedFolderId);
  const openFileId = useAppSelector(selectOpenFileId);
  const children = useAppSelector(
    (state) => selectChildrenIndex(state).get(folderId) ?? NO_CHILDREN,
  );

  const activate = (item: WorkspaceItem) =>
    dispatch(
      item.type === "folder" ? selectFolder(item.id) : openFile(item.id),
    );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {children.length} {children.length === 1 ? "item" : "items"}
      </p>

      {children.length === 0 ? (
        <p className="text-sm text-muted">This folder is empty.</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {children.map((item) => {
            const open = item.id === openFileId;
            const Icon = item.type === "folder" ? Folder : FileText;

            return (
              <li
                key={item.id}
                className="flex items-center rounded-md pr-1 hover:bg-foreground/5"
              >
                <button
                  type="button"
                  title={item.name}
                  aria-current={open ? "true" : undefined}
                  onClick={() => activate(item)}
                  className={`flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm focus-visible:outline-2 focus-visible:outline-accent ${
                    open ? "font-medium text-accent" : ""
                  }`}
                >
                  <Icon
                    aria-hidden
                    className={`size-4 shrink-0 ${open ? "" : "text-muted"}`}
                  />
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  <span className="shrink-0 text-xs text-muted @max-[20rem]:hidden">
                    {item.type === "folder" ? "Folder" : "Text file"}
                  </span>
                </button>
                <div className="flex shrink-0 items-center gap-1" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
