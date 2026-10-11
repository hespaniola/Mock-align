"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE, fadeUp, stagger } from "@/lib/motion";

/**
 * Understated completion moment: three orbits drift into a single line, a
 * circle closes, and the words settle. ~1.6s total, never blocks the CTA.
 */
export function Completion({
  title,
  subtitle,
  children,
  calm = false,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  calm?: boolean;
}) {
  const d = calm ? 1.6 : 1.1;
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <div aria-hidden className="relative mb-12 size-40 sm:size-48">
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: "radial-gradient(closest-side, rgb(var(--glow-a) / 0.35), transparent)" }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: d * 1.4, ease: EASE }}
        />
        <svg viewBox="0 0 200 200" className="absolute inset-0 size-full -rotate-90 overflow-visible">
          {[0, 1, 2].map((i) => (
            <motion.ellipse
              key={i}
              cx="100"
              cy="100"
              rx={88 - i * 14}
              ry={88 - i * 14}
              fill="none"
              stroke="var(--accent)"
              strokeOpacity={0.55 - i * 0.12}
              strokeWidth={1}
              initial={{ rotate: (i - 1) * 50, scaleY: 0.35 + i * 0.15, pathLength: 0.25 }}
              animate={{ rotate: 0, scaleY: 1, pathLength: 1 }}
              transition={{ duration: d, delay: 0.1 + i * 0.1, ease: EASE }}
              style={{ transformOrigin: "100px 100px" }}
            />
          ))}
        </svg>
        <motion.div
          className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_24px_rgb(var(--glow-a)/0.9)]"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.6, 1] }}
          transition={{ duration: 0.8, delay: d * 0.8, ease: EASE }}
        />
      </div>

      <motion.div variants={stagger(0.12, d * 0.6)} initial="hidden" animate="show" className="flex flex-col items-center">
        <motion.h1 variants={fadeUp} className="display text-balance text-5xl sm:text-6xl" tabIndex={-1}>
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p variants={fadeUp} className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-ivory-muted">
            {subtitle}
          </motion.p>
        )}
        {children && (
          <motion.div variants={fadeUp} className="mt-10 w-full">
            {children}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
