import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wordmark({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} aria-label="ALIGN home" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span aria-hidden className="relative grid size-5 place-items-center">
        <span className="absolute inset-0 rounded-full border border-accent/60 transition-transform duration-500 group-hover:rotate-90 [transform:rotateX(60deg)]" />
        <span className="size-2 rounded-full bg-accent shadow-[0_0_12px_rgb(var(--glow-a)/0.8)]" />
      </span>
      <span className="font-display text-[0.95rem] font-medium tracking-[0.32em] text-ivory">ALIGN</span>
    </Link>
  );
}
