"use client";

import { useEffect, useRef, useState } from "react";
import { FolderTree, Menu, X } from "lucide-react";
import { SidebarContext } from "@/components/layout/sidebarContext";
import IconButton from "@/components/ui/iconButton";

const DESKTOP_QUERY = "(min-width: 48rem)";

export default function AppShell({
  sidebar,
  topBar,
  children,
}: {
  sidebar: React.ReactNode;
  topBar?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeSidebar = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const menuButton = menuButtonRef.current;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      menuButton?.focus();
    };
  }, [open]);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <SidebarContext value={{ closeSidebar }}>
      <div className="flex h-dvh flex-col">
        <header
          inert={open}
          className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3"
        >
          <div className="flex min-w-0 shrink items-center gap-2 md:flex-1">
            <IconButton
              ref={menuButtonRef}
              label="Open sidebar"
              aria-expanded={open}
              aria-controls="sidebar"
              className="md:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" aria-hidden />
            </IconButton>
            <FolderTree className="size-5 shrink-0 text-accent" aria-hidden />
            <span className="truncate text-sm font-semibold">
              Workspace Explorer
            </span>
          </div>
          <div className="flex min-w-0 flex-1 justify-end md:w-80 md:flex-initial md:justify-center">
            {topBar}
          </div>
          <div aria-hidden className="hidden min-w-0 md:block md:flex-1" />
        </header>

        <div className="relative flex min-h-0 flex-1">
          {open && (
            <div
              aria-hidden
              className="fixed inset-0 z-30 bg-black/40 md:hidden"
              onClick={closeSidebar}
            />
          )}

          <aside
            id="sidebar"
            aria-label="Workspace sidebar"
            className={`flex w-72 max-w-[85vw] shrink-0 flex-col border-r border-border bg-panel max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40 max-md:duration-200 max-md:ease-out motion-reduce:transition-none md:w-64 lg:w-72 ${
              open
                ? "max-md:transition-[translate]"
                : "max-md:invisible max-md:-translate-x-full max-md:transition-[translate,visibility]"
            }`}
          >
            <div className="flex h-10 shrink-0 items-center justify-between px-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">
                Explorer
              </span>
              <IconButton
                ref={closeButtonRef}
                label="Close sidebar"
                className="md:hidden"
                onClick={closeSidebar}
              >
                <X className="size-4" aria-hidden />
              </IconButton>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{sidebar}</div>
          </aside>

          <main inert={open} className="flex min-w-0 flex-1 flex-col">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext>
  );
}
