"use client";

import { useAppSelector } from "@/redux/hooks";
import { selectHydrated } from "@/redux/features/workspaceSlice";

export default function HydrationGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrated = useAppSelector(selectHydrated);

  if (!hydrated) {
    return (
      <div
        role="status"
        className="flex flex-1 items-center justify-center text-sm text-neutral-500"
      >
        Loading workspace…
      </div>
    );
  }

  return children;
}
