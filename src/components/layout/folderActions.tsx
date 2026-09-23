"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirmDialog";
import IconButton from "@/components/ui/iconButton";
import NameInput from "@/components/ui/nameInput";
import { getDescendantIds } from "@/lib/tree";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  deleteItem,
  renameItem,
  selectItems,
  selectSelectedFolderId,
} from "@/redux/features/workspaceSlice";

export default function FolderActions() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectItems);
  const folderId = useAppSelector(selectSelectedFolderId);

  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lastFolderId, setLastFolderId] = useState(folderId);

  if (folderId !== lastFolderId) {
    setLastFolderId(folderId);
    setRenaming(false);
    setDeleting(false);
  }

  const folder = items[folderId];
  if (!folder || folder.parentId === null) return null;

  const parentId = folder.parentId;

  if (renaming) {
    return (
      <div className="flex w-56 max-w-full items-center sm:w-72">
        <NameInput
          initialValue={folder.name}
          parentId={parentId}
          excludeId={folder.id}
          confirmLabel={`Rename ${folder.name}`}
          onConfirm={(name) => {
            dispatch(renameItem({ id: folder.id, name }));
            setRenaming(false);
          }}
          onCancel={() => setRenaming(false)}
        />
      </div>
    );
  }

  const nestedCount = getDescendantIds(items, folder.id).length;

  return (
    <>
      <IconButton
        label={`Rename ${folder.name}`}
        onClick={() => setRenaming(true)}
      >
        <Pencil className="size-4" aria-hidden />
      </IconButton>
      <IconButton
        label={`Delete ${folder.name}`}
        onClick={() => setDeleting(true)}
      >
        <Trash2 className="size-4" aria-hidden />
      </IconButton>

      {deleting && (
        <ConfirmDialog
          title={`Delete "${folder.name}"?`}
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
            dispatch(deleteItem(folder.id));
            setDeleting(false);
          }}
          onCancel={() => setDeleting(false)}
        />
      )}
    </>
  );
}
