"use client";

import * as React from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type ChipProps = React.ComponentProps<"button"> & {
  selected?: boolean;
  /** "toggle" shows a check when selected; "suggest" shows a plus. */
  kind?: "toggle" | "suggest";
};

export function Chip({ selected, kind = "toggle", className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={kind === "toggle" ? !!selected : undefined}
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-left text-sm",
        "transition-[background-color,border-color,color,transform] duration-200 ease-[var(--ease-exhale)] active:scale-[0.97]",
        selected
          ? "border-accent/60 bg-accent/15 text-ivory"
          : "border-ivory/10 bg-ivory/[0.03] text-ivory-soft hover:border-ivory/25 hover:bg-ivory/[0.06] hover:text-ivory",
        className,
      )}
      {...props}
    >
      {kind === "toggle" ? (
        <span
          aria-hidden
          className={cn(
            "grid size-4 place-items-center rounded-full border transition-colors",
            selected ? "border-accent bg-accent text-accent-ink" : "border-ivory/25",
          )}
        >
          {selected && <Check className="size-3" strokeWidth={3} />}
        </span>
      ) : (
        <Plus aria-hidden className="size-3.5 text-accent" />
      )}
      <span>{children}</span>
    </button>
  );
}
