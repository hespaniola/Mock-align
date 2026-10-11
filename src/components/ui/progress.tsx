"use client";

import { motion } from "motion/react";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Segmented progress for guided flows. */
export function StepProgress({ total, current, className }: { total: number; current: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      aria-label={`Step ${current + 1} of ${total}`}
      className={cn("flex w-full items-center gap-1.5", className)}
    >
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-ivory/10">
          <motion.div
            className="absolute inset-0 origin-left rounded-full bg-accent"
            initial={false}
            animate={{ scaleX: i <= current ? 1 : 0, opacity: i < current ? 0.55 : 1 }}
            transition={spring.soft}
          />
        </div>
      ))}
    </div>
  );
}
