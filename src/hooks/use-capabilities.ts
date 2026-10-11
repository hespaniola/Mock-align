"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import type { MotionPreference } from "@/lib/types";

export interface Capabilities {
  /** WebGL rendering is appropriate on this device right now. */
  webgl: boolean;
  /** Prefers reduced motion (system or in-app). */
  reducedMotion: boolean;
  /** Coarse pointer / small screen. */
  compact: boolean;
}

interface Device {
  webgl: boolean;
  lowPower: boolean;
  compact: boolean;
}

let device: Device | null = null;

function probe(): Device {
  if (device) return device;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  device = {
    webgl,
    lowPower: (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 || nav.connection?.saveData === true,
    compact: window.matchMedia("(max-width: 640px), (pointer: coarse)").matches,
  };
  return device;
}

const noop = () => () => {};

/**
 * Decides whether to load the 3D centerpiece. WebGL is skipped for reduced
 * motion, data-saver, low-memory/low-core devices and when disabled in
 * settings — those get the CSS fallback instead. Null on the server.
 */
export function useCapabilities(enable3D = true, motion: MotionPreference = "system"): Capabilities | null {
  const systemReduced = useReducedMotion() ?? false;
  const reduced = motion === "reduced" || (motion === "system" && systemReduced);
  const d = useSyncExternalStore(noop, probe, () => null);
  if (!d) return null;
  return { webgl: enable3D && !reduced && !d.lowPower && d.webgl, reducedMotion: reduced, compact: d.compact };
}
