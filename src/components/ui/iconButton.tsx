import type { ComponentProps } from "react";

export default function IconButton({
  label,
  className = "",
  ...props
}: ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent ${className}`}
      {...props}
    />
  );
}
