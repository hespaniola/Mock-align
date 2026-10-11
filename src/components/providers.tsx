"use client";

import { MotionConfig } from "motion/react";
import { useEffect } from "react";
import { useAlignData } from "@/lib/store";

/** Applies user preferences app-wide (motion) and hosts global context. */
export function Providers({ children }: { children: React.ReactNode }) {
  const data = useAlignData();
  const motionPref = data?.preferences.motion ?? "system";

  useEffect(() => {
    const root = document.documentElement;
    if (motionPref === "system") delete root.dataset.motion;
    else root.dataset.motion = motionPref;
  }, [motionPref]);

  return (
    <MotionConfig reducedMotion={motionPref === "reduced" ? "always" : motionPref === "full" ? "never" : "user"}>
      {children}
    </MotionConfig>
  );
}
