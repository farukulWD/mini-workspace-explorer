"use client";

import { useRef, useState } from "react";
import { useUnsavedGuard } from "@/components/editor/unsavedGuard";
import { useSidebar } from "@/components/layout/sidebarContext";
import { TreeContext } from "@/components/tree/treeContext";
import TreeNode from "@/components/tree/treeNode";
import { getVisibleIds } from "@/lib/tree";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  openFile,
  selectChildrenIndex,
  selectExpandedIds,
  selectFolder,
  selectItems,
  selectSelectedFolderId,
  toggleExpand,
} from "@/redux/features/workspaceSlice";
import { ROOT_ID, type WorkspaceItem } from "@/types/workspace";

export default function WorkspaceTree() {
  const dispatch = useAppDispatch();
  const { closeSidebar } = useSidebar();
  const { guard } = useUnsavedGuard();
  const items = useAppSelector(selectItems);
  const index = useAppSelector(selectChildrenIndex);
  const expandedIds = useAppSelector(selectExpandedIds);
  const selectedFolderId = useAppSelector(selectSelectedFolderId);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const treeRef = useRef<HTMLUListElement>(null);

  const expanded = new Set(expandedIds);
  const visible = getVisibleIds(index, expanded);
  const tabbableId =
    focusedId && visible.includes(focusedId)
      ? focusedId
      : visible.includes(selectedFolderId)
        ? selectedFolderId
        : ROOT_ID;

  const activate = (item: WorkspaceItem) => {
    if (item.type === "folder") {
      dispatch(selectFolder(item.id));
      closeSidebar();
      return;
    }
    guard(() => {
      dispatch(openFile(item.id));
      closeSidebar();
    });
  };

  const focusRow = (id: string | null | undefined) => {
    if (!id) return;
    treeRef.current
      ?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)
      ?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const id = (event.target as HTMLElement).closest<HTMLElement>("[data-id]")
      ?.dataset.id;
    const item = id ? items[id] : undefined;
    if (!item) return;

    const position = visible.indexOf(item.id);
    const children = index.get(item.id) ?? [];
    const isOpen = children.length > 0 && expanded.has(item.id);

    switch (event.key) {
      case "ArrowDown":
        focusRow(visible[position + 1]);
        break;
      case "ArrowUp":
        focusRow(visible[position - 1]);
        break;
      case "Home":
        focusRow(visible[0]);
        break;
      case "End":
        focusRow(visible[visible.length - 1]);
        break;
      case "ArrowRight":
        if (isOpen) focusRow(children[0].id);
        else if (children.length > 0) dispatch(toggleExpand(item.id));
        break;
      case "ArrowLeft":
        if (isOpen) dispatch(toggleExpand(item.id));
        else focusRow(item.parentId);
        break;
      case "Enter":
      case " ":
        activate(item);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  return (
    <TreeContext
      value={{ tabbableId, onFocusItem: setFocusedId, onActivate: activate }}
    >
      <ul
        ref={treeRef}
        role="tree"
        aria-label="Workspace"
        className="px-2 pb-2"
        onKeyDown={onKeyDown}
      >
        <TreeNode id={ROOT_ID} depth={0} />
      </ul>
    </TreeContext>
  );
}
