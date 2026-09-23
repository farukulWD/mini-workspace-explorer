"use client";

import { useEffect, useState } from "react";
import { useUnsavedGuard } from "@/components/editor/unsavedGuard";
import { useAppDispatch } from "@/redux/hooks";
import { updateFileContent } from "@/redux/features/workspaceSlice";
import type { FileItem } from "@/types/workspace";

export default function FileEditor({ file }: { file: FileItem }) {
  const dispatch = useAppDispatch();
  const { setDirty } = useUnsavedGuard();
  const [draft, setDraft] = useState(file.content);

  const dirty = draft !== file.content;

  const save = () => {
    if (!dirty) return;
    dispatch(updateFileContent({ id: file.id, content: draft }));
    setDirty(false);
  };

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => () => setDirty(false), [setDirty]);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      onKeyDown={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "s") {
          event.preventDefault();
          save();
        }
      }}
    >
      <div className="flex shrink-0 items-center gap-2 px-4 py-2">
        {dirty && (
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            Unsaved changes
          </span>
        )}
        <button
          type="button"
          disabled={!dirty}
          onClick={save}
          className="ml-auto rounded-md border border-border px-3 py-1 text-xs hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40 disabled:hover:bg-transparent"
        >
          Save
        </button>
      </div>
      <textarea
        value={draft}
        aria-label={`Contents of ${file.name}`}
        spellCheck={false}
        onChange={(event) => {
          setDraft(event.target.value);
          setDirty(event.target.value !== file.content);
        }}
        className="min-h-0 flex-1 resize-none bg-transparent px-4 pb-4 font-mono text-sm outline-none"
      />
    </div>
  );
}
