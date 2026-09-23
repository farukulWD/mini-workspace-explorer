"use client";

import { useState } from "react";
import {
  FilePlus,
  FileText,
  Folder,
  FolderPlus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useUnsavedGuard } from "@/components/editor/unsavedGuard";
import ConfirmDialog from "@/components/ui/confirmDialog";
import IconButton from "@/components/ui/iconButton";
import NameInput from "@/components/ui/nameInput";
import { getDescendantIds } from "@/lib/tree";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  createItem,
  deleteItem,
  openFile,
  renameItem,
  selectChildrenIndex,
  selectFolder,
  selectItems,
  selectOpenFileId,
  selectSelectedFolderId,
} from "@/redux/features/workspaceSlice";
import { ROOT_ID, type ItemType, type WorkspaceItem } from "@/types/workspace";

const NO_CHILDREN: WorkspaceItem[] = [];

const ACTION =
  "inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-accent";

export default function FolderList() {
  const dispatch = useAppDispatch();
  const { guard } = useUnsavedGuard();
  const items = useAppSelector(selectItems);
  const folderId = useAppSelector(selectSelectedFolderId);
  const openFileId = useAppSelector(selectOpenFileId);
  const children = useAppSelector(
    (state) => selectChildrenIndex(state).get(folderId) ?? NO_CHILDREN,
  );

  const [draftType, setDraftType] = useState<ItemType | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lastFolderId, setLastFolderId] = useState(folderId);

  if (folderId !== lastFolderId) {
    setLastFolderId(folderId);
    setDraftType(null);
    setRenamingId(null);
    setDeletingId(null);
  }

  const activate = (item: WorkspaceItem) => {
    if (item.type === "folder") {
      dispatch(selectFolder(item.id));
      return;
    }
    guard(() => dispatch(openFile(item.id)));
  };

  const confirmCreate = (name: string) => {
    const type = draftType;
    if (!type) return;
    const action = dispatch(createItem({ parentId: folderId, name, type }));
    setDraftType(null);
    if (type === "file") dispatch(openFile(action.payload.id));
  };

  const createButtons = (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        className={ACTION}
        onClick={() => setDraftType("folder")}
      >
        <FolderPlus className="size-4" aria-hidden />
        New folder
      </button>
      <button
        type="button"
        className={ACTION}
        onClick={() => setDraftType("file")}
      >
        <FilePlus className="size-4" aria-hidden />
        New file
      </button>
    </div>
  );

  const deleting = deletingId ? items[deletingId] : undefined;
  const nestedCount = deleting ? getDescendantIds(items, deleting.id).length : 0;

  const DraftIcon = draftType === "file" ? FileText : Folder;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {children.length} {children.length === 1 ? "item" : "items"}
        </p>
        <div className="ml-auto">{createButtons}</div>
      </div>

      {children.length === 0 && !draftType ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-4 py-10 text-center">
          <p className="text-sm text-muted">
            {folderId === ROOT_ID
              ? "Your workspace is empty."
              : "This folder is empty."}
          </p>
          {createButtons}
        </div>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {draftType && (
            <li className="flex items-center gap-2 rounded-md px-2">
              <DraftIcon aria-hidden className="size-4 shrink-0 text-muted" />
              <NameInput
                initialValue=""
                parentId={folderId}
                confirmLabel={
                  draftType === "folder" ? "Create folder" : "Create file"
                }
                onConfirm={confirmCreate}
                onCancel={() => setDraftType(null)}
              />
            </li>
          )}

          {children.map((item) => {
            const open = item.id === openFileId;
            const Icon = item.type === "folder" ? Folder : FileText;

            if (item.id === renamingId) {
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-2 rounded-md px-2"
                >
                  <Icon aria-hidden className="size-4 shrink-0 text-muted" />
                  <NameInput
                    initialValue={item.name}
                    parentId={folderId}
                    excludeId={item.id}
                    confirmLabel={`Rename ${item.name}`}
                    onConfirm={(name) => {
                      dispatch(renameItem({ id: item.id, name }));
                      setRenamingId(null);
                    }}
                    onCancel={() => setRenamingId(null)}
                  />
                </li>
              );
            }

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
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton
                    label={`Rename ${item.name}`}
                    onClick={() => setRenamingId(item.id)}
                  >
                    <Pencil className="size-4" aria-hidden />
                  </IconButton>
                  <IconButton
                    label={`Delete ${item.name}`}
                    onClick={() => setDeletingId(item.id)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </IconButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete "${deleting.name}"?`}
          body={
            nestedCount > 0
              ? `This also deletes ${nestedCount} nested ${
                  nestedCount === 1 ? "item" : "items"
                }. This cannot be undone.`
              : "This cannot be undone."
          }
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            dispatch(deleteItem(deleting.id));
            setDeletingId(null);
          }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
