"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Quietly confirms autosave after the user pauses typing. */
export function SaveIndicator({ signal }: { signal: unknown }) {
  const [visible, setVisible] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const show = setTimeout(() => setVisible(true), 400);
    const hide = setTimeout(() => setVisible(false), 1800);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [signal]);

  return (
    <span aria-live="polite" className="inline-flex h-5 min-w-14 items-center text-xs text-ivory-faint">
      <AnimatePresence>
        {visible && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Saved
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
