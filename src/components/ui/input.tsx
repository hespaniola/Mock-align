import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "block h-12 w-full border-b border-ivory/15 bg-transparent text-lg text-ivory outline-none",
        "transition-colors duration-300 focus:border-accent focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
});
