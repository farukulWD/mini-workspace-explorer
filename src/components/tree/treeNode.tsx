"use client";

import { useEffect, useId, useRef } from "react";
import { ChevronRight, FileText, Folder, FolderOpen } from "lucide-react";
import { useTree } from "@/components/tree/treeContext";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectChildrenIndex,
  selectExpandedIds,
  selectItems,
  selectOpenFileId,
  selectSelectedFolderId,
  toggleExpand,
} from "@/redux/features/workspaceSlice";
import type { WorkspaceItem } from "@/types/workspace";

const NO_CHILDREN: WorkspaceItem[] = [];

function revealRow(row: HTMLElement) {
  let scroller = row.parentElement;
  while (scroller && scroller.scrollHeight <= scroller.clientHeight) {
    scroller = scroller.parentElement;
  }
  if (!scroller) return;

  const rowRect = row.getBoundingClientRect();
  const viewRect = scroller.getBoundingClientRect();
  if (rowRect.top < viewRect.top)
    scroller.scrollTop -= viewRect.top - rowRect.top;
  else if (rowRect.bottom > viewRect.bottom)
    scroller.scrollTop += rowRect.bottom - viewRect.bottom;
}

export default function TreeNode({ id, depth }: { id: string; depth: number }) {
  const dispatch = useAppDispatch();
  const { tabbableId, onFocusItem, onActivate } = useTree();
  const item = useAppSelector((state) => selectItems(state)[id]);
  const children = useAppSelector(
    (state) => selectChildrenIndex(state).get(id) ?? NO_CHILDREN,
  );
  const expanded = useAppSelector((state) =>
    selectExpandedIds(state).includes(id),
  );
  const selected = useAppSelector(
    (state) => selectSelectedFolderId(state) === id,
  );
  const open = useAppSelector((state) => selectOpenFileId(state) === id);
  const groupId = useId();
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((selected || open) && rowRef.current) revealRow(rowRef.current);
  }, [selected, open]);

  if (!item) return null;

  const hasChildren = children.length > 0;
  const isOpen = expanded && hasChildren;
  const Icon = item.type === "file" ? FileText : isOpen ? FolderOpen : Folder;

  return (
    <li role="none">
      <div
        ref={rowRef}
        role="treeitem"
        data-id={id}
        aria-level={depth + 1}
        aria-selected={selected}
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-current={open ? "true" : undefined}
        aria-owns={isOpen ? groupId : undefined}
        tabIndex={tabbableId === id ? 0 : -1}
        title={item.name}
        onFocus={() => onFocusItem(id)}
        onClick={() => onActivate(item)}
        style={{ paddingInlineStart: depth * 12 + 4 }}
        className={`flex h-8 cursor-pointer items-center gap-1 rounded-md pr-2 text-sm outline-none select-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${
          selected
            ? "bg-accent-soft font-medium text-accent"
            : open
              ? "font-medium text-accent hover:bg-foreground/5"
              : "hover:bg-foreground/5"
        }`}
      >
        {hasChildren ? (
          <span
            aria-hidden
            className="flex size-5 shrink-0 items-center justify-center rounded text-muted hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation();
              dispatch(toggleExpand(id));
            }}
          >
            <ChevronRight
              className={`size-3.5 transition-transform motion-reduce:transition-none ${
                isOpen ? "rotate-90" : ""
              }`}
            />
          </span>
        ) : (
          <span aria-hidden className="size-5 shrink-0" />
        )}
        <Icon
          aria-hidden
          className={`size-4 shrink-0 ${selected || open ? "" : "text-muted"}`}
        />
        <span className="min-w-0 truncate">{item.name}</span>
      </div>

      {isOpen && (
        <ul role="group" id={groupId}>
          {children.map((child) => (
            <TreeNode key={child.id} id={child.id} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
