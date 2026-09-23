"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FileText, Folder, Search, X } from "lucide-react";
import { useUnsavedGuard } from "@/components/editor/unsavedGuard";
import IconButton from "@/components/ui/iconButton";
import { getPath, searchItems } from "@/lib/tree";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  openFile,
  selectFolder,
  selectItems,
} from "@/redux/features/workspaceSlice";
import type { WorkspaceItem } from "@/types/workspace";

const DEBOUNCE_MS = 200;
const MAX_RESULTS = 50;

export default function SearchBox() {
  const dispatch = useAppDispatch();
  const { guard } = useUnsavedGuard();
  const items = useAppSelector(selectItems);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const open = debounced.trim().length > 0;
  const results = open
    ? searchItems(items, debounced).slice(0, MAX_RESULTS)
    : [];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setQuery("");
      setDebounced("");
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const clear = () => {
    setQuery("");
    setDebounced("");
    setActive(0);
  };

  const parentLabel = (item: WorkspaceItem) =>
    item.parentId
      ? getPath(items, item.parentId)
          .map((ancestor) => ancestor.name)
          .join(" / ")
      : "";

  const go = (item: WorkspaceItem) => {
    if (item.type === "folder") dispatch(selectFolder(item.id));
    else guard(() => dispatch(openFile(item.id)));
    clear();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      clear();
    } else if (event.key === "ArrowDown") {
      setActive((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[active]) {
      go(results[active]);
    } else {
      return;
    }
    event.preventDefault();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="flex items-center gap-1 rounded-md border border-border bg-background pr-1 pl-2 focus-within:outline-2 focus-within:outline-accent">
        <Search aria-hidden className="size-4 shrink-0 text-muted" />
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label="Search workspace"
          placeholder="Search workspace…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none"
        />
        {query ? (
          <IconButton label="Clear search" onClick={clear}>
            <X className="size-4" aria-hidden />
          </IconButton>
        ) : (
          <span aria-hidden className="size-8 shrink-0" />
        )}
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Search results"
          className="absolute top-full right-0 z-30 mt-1 max-h-80 w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-md border border-border bg-panel py-1 shadow-lg"
        >
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">No matches.</li>
          ) : (
            results.map((item, index) => (
              <li key={item.id} role="option" aria-selected={index === active}>
                <button
                  type="button"
                  onClick={() => go(item)}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
                    index === active ? "bg-foreground/5" : ""
                  } hover:bg-foreground/5`}
                >
                  {item.type === "folder" ? (
                    <Folder aria-hidden className="size-4 shrink-0 text-muted" />
                  ) : (
                    <FileText
                      aria-hidden
                      className="size-4 shrink-0 text-muted"
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{item.name}</span>
                    <span className="block truncate text-xs text-muted">
                      {parentLabel(item)}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
