"use client";

import { FileText, X } from "lucide-react";
import FileEditor from "@/components/editor/fileEditor";
import { useUnsavedGuard } from "@/components/editor/unsavedGuard";
import Breadcrumb from "@/components/layout/breadcrumb";
import EmptyEditor from "@/components/layout/emptyEditor";
import FolderActions from "@/components/layout/folderActions";
import FolderList from "@/components/layout/folderList";
import IconButton from "@/components/ui/iconButton";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  closeFile,
  selectItems,
  selectOpenFileId,
} from "@/redux/features/workspaceSlice";

export default function MainPanel() {
  const dispatch = useAppDispatch();
  const { guard } = useUnsavedGuard();
  const items = useAppSelector(selectItems);
  const openFileId = useAppSelector(selectOpenFileId);

  const openItem = openFileId ? items[openFileId] : undefined;
  const file = openItem?.type === "file" ? openItem : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-12 shrink-0 flex-wrap items-center gap-2 border-b border-border px-4 py-2">
        <Breadcrumb />
        <div className="ml-auto flex items-center gap-2">
          <FolderActions />
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <section
          aria-label="Folder contents"
          className={`@container min-w-0 overflow-y-auto p-4 lg:w-80 lg:shrink-0 lg:border-r lg:border-border ${
            file ? "max-lg:hidden" : "max-lg:flex-1"
          }`}
        >
          <FolderList />
        </section>

        {file ? (
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
                onClick={() => guard(() => dispatch(closeFile()))}
              >
                <X className="size-4" aria-hidden />
              </IconButton>
            </div>
            <FileEditor key={file.id} file={file} />
          </section>
        ) : (
          <section
            aria-label="Editor"
            className="hidden min-w-0 flex-1 lg:flex"
          >
            <EmptyEditor />
          </section>
        )}
      </div>
    </div>
  );
}
