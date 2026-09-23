"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronRight, Ellipsis, Folder } from "lucide-react";
import IconButton from "@/components/ui/iconButton";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectBreadcrumb, selectFolder } from "@/redux/features/workspaceSlice";
import type { WorkspaceItem } from "@/types/workspace";

const MAX_SEGMENTS = 4;
const TAIL_SEGMENTS = 2;
const LABEL = "min-w-0 max-w-32 truncate rounded-md px-1.5 py-1 sm:max-w-48";

export default function Breadcrumb() {
  const dispatch = useAppDispatch();
  const path = useAppSelector(selectBreadcrumb);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const collapsed = path.length > MAX_SEGMENTS;
  const hidden = collapsed ? path.slice(1, -TAIL_SEGMENTS) : [];
  const showMenu = menuOpen && hidden.length > 0;

  useEffect(() => {
    if (!showMenu) return;
    const menuButton = menuButtonRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (menuButton?.contains(target)) return;
      setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      menuButton?.focus();
    };
  }, [showMenu]);

  if (path.length === 0) return null;

  const navigate = (id: string) => {
    setMenuOpen(false);
    dispatch(selectFolder(id));
  };

  const currentId = path[path.length - 1].id;
  const segments: { key: string; item?: WorkspaceItem }[] = collapsed
    ? [
        { key: path[0].id, item: path[0] },
        { key: "overflow" },
        ...path.slice(-TAIL_SEGMENTS).map((item) => ({ key: item.id, item })),
      ]
    : path.map((item) => ({ key: item.id, item }));

  const renderSegment = (item: WorkspaceItem) =>
    item.id === currentId ? (
      <span
        aria-current="page"
        title={item.name}
        className={`${LABEL} font-medium`}
      >
        {item.name}
      </span>
    ) : (
      <button
        type="button"
        title={item.name}
        onClick={() => navigate(item.id)}
        className={`${LABEL} text-muted hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent`}
      >
        {item.name}
      </button>
    );

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center text-sm">
        {segments.map(({ key, item }, index) => (
          <li key={key} className="flex min-w-0 items-center">
            {index > 0 && (
              <ChevronRight
                aria-hidden
                className="size-3.5 shrink-0 text-muted"
              />
            )}

            {item ? (
              renderSegment(item)
            ) : (
              <div className="relative">
                <IconButton
                  ref={menuButtonRef}
                  label="Show hidden path segments"
                  aria-expanded={showMenu}
                  aria-controls={menuId}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <Ellipsis className="size-4" aria-hidden />
                </IconButton>

                {showMenu && (
                  <ul
                    ref={menuRef}
                    id={menuId}
                    className="absolute top-full left-0 z-20 mt-1 max-h-64 min-w-44 overflow-y-auto rounded-md border border-border bg-panel py-1 shadow-lg"
                  >
                    {hidden.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          title={item.name}
                          onClick={() => navigate(item.id)}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-foreground/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                        >
                          <Folder
                            aria-hidden
                            className="size-4 shrink-0 text-muted"
                          />
                          <span className="truncate">{item.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
