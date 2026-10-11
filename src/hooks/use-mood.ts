"use client";

import { useEffect } from "react";

export type Mood = "morning" | "evening";

// A stack, so nested components can request a mood and unmount in any order.
const stack: { id: symbol; mood: Mood }[] = [];

function apply() {
  const root = document.documentElement;
  const top = stack[stack.length - 1];
  if (top) root.dataset.mood = top.mood;
  else delete root.dataset.mood;
}

/** Shifts the global accent + ambient light for the current ritual. */
export function useMood(mood: Mood) {
  useEffect(() => {
    const entry = { id: Symbol(mood), mood };
    stack.push(entry);
    apply();
    return () => {
      const i = stack.indexOf(entry);
      if (i !== -1) stack.splice(i, 1);
      apply();
    };
  }, [mood]);
}
