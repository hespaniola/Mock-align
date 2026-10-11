import * as React from "react";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "group/button relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap",
    "font-medium tracking-[-0.01em] outline-none",
    "transition-[transform,background-color,color,box-shadow,border-color,opacity] duration-200 ease-[var(--ease-exhale)]",
    "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-ivory text-ink-950 shadow-[0_10px_30px_-12px_rgb(var(--glow-a)/0.55)] hover:bg-white hover:shadow-[0_14px_40px_-12px_rgb(var(--glow-a)/0.75)]",
        accent:
          "bg-accent text-accent-ink shadow-[0_10px_30px_-12px_rgb(var(--glow-a)/0.7)] hover:brightness-110",
        secondary:
          "border border-ivory/12 bg-ivory/[0.04] text-ivory hover:border-ivory/25 hover:bg-ivory/[0.08]",
        ghost: "text-ivory-soft hover:bg-ivory/[0.06] hover:text-ivory",
        link: "h-auto px-0 text-ivory-muted underline-offset-4 hover:text-ivory hover:underline",
      },
      size: {
        sm: "h-9 rounded-full px-4 text-sm",
        md: "h-11 rounded-full px-5 text-[0.9375rem]",
        lg: "h-14 rounded-full px-7 text-base",
        icon: "size-10 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

type LinkButtonProps = React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

export function LinkButton({ className, variant, size, ...props }: LinkButtonProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
