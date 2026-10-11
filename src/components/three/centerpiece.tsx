"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, type MotionValue } from "motion/react";
import { Component, useState, type ReactNode } from "react";
import { useCapabilities } from "@/hooks/use-capabilities";
import { useAlignData } from "@/lib/store";
import { cn } from "@/lib/utils";
import { OrbFallback } from "./orb-fallback";

// WebGL bundle (three + r3f + drei) is only fetched when it will actually render.
const AlignOrb = dynamic(() => import("./align-orb"), { ssr: false, loading: () => null });

class GLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn("[align] 3D centerpiece unavailable, using fallback", err);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function Centerpiece({
  align,
  accent,
  className,
}: {
  align?: MotionValue<number>;
  accent?: string;
  className?: string;
}) {
  const data = useAlignData();
  const caps = useCapabilities(data?.preferences.enable3D ?? true, data?.preferences.motion);
  const [lost, setLost] = useState(false);
  const [ready, setReady] = useState(false);
  const useGL = Boolean(caps?.webgl) && !lost;
  const fallback = <OrbFallback className="absolute inset-0" still={caps?.reducedMotion} />;

  return (
    <div className={cn("relative", className)}>
      {/* Fallback sits underneath and fades out once WebGL has painted. */}
      <AnimatePresence>
        {!(useGL && ready) && (
          <motion.div key="fallback" className="absolute inset-0" exit={{ opacity: 0, transition: { duration: 1.2 } }}>
            {fallback}
          </motion.div>
        )}
      </AnimatePresence>
      {useGL && (
        <GLBoundary fallback={fallback}>
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <AlignOrb
              align={align}
              accent={accent}
              className="size-full"
              onReady={() => setReady(true)}
              onContextLost={() => setLost(true)}
            />
          </motion.div>
        </GLBoundary>
      )}
    </div>
  );
}
