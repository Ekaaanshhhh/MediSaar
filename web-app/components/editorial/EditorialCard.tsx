import * as React from "react";
import { cn } from "@/lib/utils";

interface EditorialCardProps extends React.ComponentProps<"div"> {
  title?: string;
  eyebrow?: string;
  size?: "default" | "large";
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
}

export function EditorialCard({
  title,
  eyebrow,
  size = "default",
  loading = false,
  empty = false,
  emptyMessage = "No content yet.",
  className,
  children,
  ...props
}: EditorialCardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-lg shadow-soft",
        size === "large" ? "p-10" : "p-8",
        className
      )}
      {...props}
    >
      {eyebrow && (
        <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-500 mb-2">
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 className="font-serif text-2xl font-semibold text-ink-900 tracking-[-0.01em] leading-snug mb-4">
          {title}
        </h2>
      )}

      {loading ? (
        <div className="space-y-3">
          <div className="h-4 bg-surface-sunk rounded-sm animate-pulse w-3/4" />
          <div className="h-4 bg-surface-sunk rounded-sm animate-pulse w-5/6" />
          <div className="h-4 bg-surface-sunk rounded-sm animate-pulse w-2/3" />
        </div>
      ) : empty ? (
        <p className="text-sm text-ink-300 italic">{emptyMessage}</p>
      ) : (
        children
      )}
    </div>
  );
}
