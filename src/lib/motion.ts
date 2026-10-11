import type { Transition, Variants } from "motion/react";

/**
 * ALIGN motion system.
 *
 * One vocabulary for every screen: calm springs, short durations, a single
 * signature ease. Interactions answer in ~150–250ms; reveals settle within
 * ~600ms; nothing ever blocks input.
 */

/** Signature ease — a soft, decelerating "exhale". */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const spring = {
  /** Buttons, toggles, chips. */
  snappy: { type: "spring", stiffness: 420, damping: 32, mass: 0.6 } satisfies Transition,
  /** Cards, panels, layout changes. */
  soft: { type: "spring", stiffness: 180, damping: 26 } satisfies Transition,
  /** Evening — slower, heavier, calmer. */
  calm: { type: "spring", stiffness: 90, damping: 22 } satisfies Transition,
};

export const duration = { fast: 0.18, base: 0.35, slow: 0.6, cinematic: 1.1 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: EASE } },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.slow, ease: EASE } },
};

export const stagger = (gap = 0.07, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

/** Word-by-word headline reveal. */
export const wordReveal: Variants = {
  hidden: { opacity: 0, y: "0.4em", filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: "0em",
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

/** Guided-flow step transitions; `custom` is the direction (1 forward, -1 back). */
export const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40, filter: "blur(6px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: EASE } },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -40,
    filter: "blur(6px)",
    transition: { duration: 0.25, ease: EASE_IN_OUT },
  }),
};

export const calmStepVariants: Variants = {
  enter: { opacity: 0, y: 14, filter: "blur(8px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
  exit: { opacity: 0, y: -10, filter: "blur(8px)", transition: { duration: 0.4, ease: EASE_IN_OUT } },
};

export const press = { scale: 0.97 };
export const hoverLift = { y: -2 };
