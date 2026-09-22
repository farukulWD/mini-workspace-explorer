"use client";

import { FileText, X } from "lucide-react";
import IconButton from "@/components/ui/iconButton";
import { getChildren } from "@/lib/tree";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  closeFile,
  selectItems,
  selectOpenFileId,
  selectSelectedFolderId,
} from "@/redux/features/workspaceSlice";

export default function MainPanel() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectItems);
  const folderId = useAppSelector(selectSelectedFolderId);
  const openFileId = useAppSelector(selectOpenFileId);

  const folder = items[folderId];
  const openItem = openFileId ? items[openFileId] : undefined;
  const file = openItem?.type === "file" ? openItem : null;
  const childCount = getChildren(items, folderId).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-12 shrink-0 flex-wrap items-center gap-2 border-b border-border px-4 py-2">
        <h1 className="min-w-0 truncate text-sm font-medium">{folder?.name}</h1>
        <div className="ml-auto flex items-center gap-2" />
      </div>

      <div className="flex min-h-0 flex-1">
        <section
          aria-label="Folder contents"
          className={`min-w-0 overflow-y-auto p-4 ${
            file
              ? "max-lg:hidden lg:w-80 lg:shrink-0 lg:border-r lg:border-border"
              : "flex-1"
          }`}
        >
          <p className="text-sm text-muted">
            {childCount} {childCount === 1 ? "item" : "items"}
          </p>
        </section>

        {file && (
          <section
            aria-label={`Editor: ${file.name}`}
            className="flex min-w-0 flex-1 flex-col"
          >
            <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border pr-2 pl-4">
              <FileText className="size-4 shrink-0 text-muted" aria-hidden />
              <span className="min-w-0 truncate text-sm font-medium">
                {file.name}
              </span>
              <IconButton
                label="Close file"
                className="ml-auto"
                onClick={() => dispatch(closeFile())}
              >
                <X className="size-4" aria-hidden />
              </IconButton>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <pre className="font-mono text-sm whitespace-pre-wrap">
                {file.content}
              </pre>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
