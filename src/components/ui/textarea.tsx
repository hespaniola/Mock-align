"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"textarea"> & {
  /** Large, editorial input used for the main question on a screen. */
  size?: "md" | "lg";
  /** Submit on Enter (Shift+Enter for a newline). */
  onSubmit?: () => void;
};

/** Auto-growing textarea. No layout jump: height tracks content. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { className, size = "md", onSubmit, onKeyDown, value, ...props },
  forwarded,
) {
  const inner = React.useRef<HTMLTextAreaElement>(null);
  React.useImperativeHandle(forwarded, () => inner.current!);

  React.useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={inner}
      rows={1}
      value={value}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (!e.defaultPrevented && onSubmit && e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
          e.preventDefault();
          onSubmit();
        }
      }}
      className={cn(
        "block w-full resize-none overflow-hidden bg-transparent text-ivory outline-none",
        "border-b border-ivory/15 pb-3 transition-colors duration-300 focus:border-accent focus-visible:outline-none",
        size === "lg"
          ? "font-display text-2xl font-light leading-snug tracking-[-0.02em] sm:text-[2rem]"
          : "text-lg leading-relaxed",
        className,
      )}
      {...props}
    />
  );
});
