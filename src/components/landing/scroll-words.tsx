"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/** Editorial statement whose words light up as it scrolls through view. */
export function ScrollWords({ text, className, accentWords = [] }: { text: string; className?: string; accentWords?: string[] }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");

  return (
    <p ref={ref} className={cn("flex flex-wrap", className)} aria-label={text}>
      {words.map((w, i) => (
        <Word
          key={i}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
          accent={accentWords.includes(w.replace(/[.,]/g, ""))}
        >
          {w}
        </Word>
      ))}
    </p>
  );
}

function Word({ children, progress, range, accent }: { children: string; progress: MotionValue<number>; range: [number, number]; accent: boolean }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <span aria-hidden className="relative mr-[0.25em]">
      <motion.span style={{ opacity }} className={cn(accent && "serif-accent text-accent")}>
        {children}
      </motion.span>
    </span>
  );
}
