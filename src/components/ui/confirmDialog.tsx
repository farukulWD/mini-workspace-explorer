"use client";

import { useEffect, useRef } from "react";

const BUTTON =
  "rounded-md border px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-accent";

export default function ConfirmDialog({
  title,
  body,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onCancel();
      }}
      className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-lg border border-border bg-panel p-4 text-foreground backdrop:bg-black/40"
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-2 text-sm text-muted">{body}</div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className={`${BUTTON} border-border hover:bg-foreground/5`}
        >
          Cancel
        </button>
        <button
          type="button"
          autoFocus
          onClick={onConfirm}
          className={`${BUTTON} ${
            danger
              ? "border-red-500 text-red-500 hover:bg-red-500/10"
              : "border-accent text-accent hover:bg-accent-soft"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
