"use client";

import { createContext, useContext, useRef, useState } from "react";
import ConfirmDialog from "@/components/ui/confirmDialog";

export interface UnsavedGuardValue {
  setDirty: (dirty: boolean) => void;
  guard: (run: () => void) => void;
}

const UnsavedGuardContext = createContext<UnsavedGuardValue | null>(null);

export function useUnsavedGuard(): UnsavedGuardValue {
  const context = useContext(UnsavedGuardContext);
  if (!context) {
    throw new Error(
      "useUnsavedGuard must be used inside <UnsavedGuardProvider>.",
    );
  }
  return context;
}

export function UnsavedGuardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dirtyRef = useRef(false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [api] = useState<UnsavedGuardValue>(() => ({
    setDirty: (dirty: boolean) => {
      dirtyRef.current = dirty;
    },
    guard: (run: () => void) => {
      if (!dirtyRef.current) {
        run();
        return;
      }
      setPending(() => run);
    },
  }));

  const discard = () => {
    const run = pending;
    dirtyRef.current = false;
    setPending(null);
    run?.();
  };

  return (
    <UnsavedGuardContext value={api}>
      {children}
      {pending && (
        <ConfirmDialog
          title="Discard unsaved changes?"
          body="This file has edits that have not been saved. Leaving now discards them."
          confirmLabel="Discard"
          danger
          onConfirm={discard}
          onCancel={() => setPending(null)}
        />
      )}
    </UnsavedGuardContext>
  );
}
