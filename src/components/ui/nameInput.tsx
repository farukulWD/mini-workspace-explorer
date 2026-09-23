"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import IconButton from "@/components/ui/iconButton";
import { getNameError } from "@/lib/tree";
import { useAppSelector } from "@/redux/hooks";
import { selectItems } from "@/redux/features/workspaceSlice";

export default function NameInput({
  initialValue,
  parentId,
  excludeId,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  initialValue: string;
  parentId: string;
  excludeId?: string;
  confirmLabel: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}) {
  const items = useAppSelector(selectItems);
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);

  const error = getNameError(items, parentId, value, excludeId);
  const showError = touched && error !== null;

  const submit = () => {
    setTouched(true);
    if (error === null) onConfirm(value.trim());
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 py-1">
      <div className="flex min-w-0 items-center gap-1">
        <input
          autoFocus
          value={value}
          aria-label={confirmLabel}
          aria-invalid={showError}
          onChange={(event) => {
            setValue(event.target.value);
            setTouched(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            } else if (event.key === "Escape") {
              event.preventDefault();
              onCancel();
            }
          }}
          className={`min-w-0 flex-1 rounded-md border bg-background px-2 py-1 text-sm outline-none focus-visible:outline-2 focus-visible:outline-accent ${
            showError ? "border-red-500" : "border-border"
          }`}
        />
        <IconButton
          label={confirmLabel}
          disabled={error !== null}
          className="disabled:opacity-40"
          onClick={submit}
        >
          <Check className="size-4" aria-hidden />
        </IconButton>
        <IconButton label="Cancel" onClick={onCancel}>
          <X className="size-4" aria-hidden />
        </IconButton>
      </div>
      {showError && (
        <p role="alert" className="px-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
