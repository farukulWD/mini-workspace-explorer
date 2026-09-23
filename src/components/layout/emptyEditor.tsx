"use client";

import { Fragment } from "react";
import { FolderTree } from "lucide-react";
import { isMac } from "@/lib/platform";

export default function EmptyEditor() {
  const mod = isMac() ? "⌘" : "Ctrl";
  const alt = isMac() ? "⌥" : "Alt";

  const hints = [
    { label: "Search workspace", keys: [mod, "K"] },
    { label: "New file", keys: [mod, alt, "N"] },
    { label: "Save file", keys: [mod, "S"] },
  ];

  return (
    <div className="flex min-h-0 flex-1 select-none flex-col items-center justify-center gap-12 p-8">
      <FolderTree
        aria-hidden
        strokeWidth={0.75}
        className="size-48 shrink-0 text-foreground/5"
      />
      <dl className="grid grid-cols-[1fr_auto] items-center gap-x-12 gap-y-3 text-sm text-muted">
        {hints.map((hint) => (
          <Fragment key={hint.label}>
            <dt>{hint.label}</dt>
            <dd className="flex items-center gap-1">
              {hint.keys.map((key, index) => (
                <kbd
                  key={index}
                  className="inline-flex min-w-7 justify-center rounded border border-border bg-panel px-1.5 py-0.5 font-sans text-xs text-foreground/80"
                >
                  {key}
                </kbd>
              ))}
            </dd>
          </Fragment>
        ))}
      </dl>
    </div>
  );
}
