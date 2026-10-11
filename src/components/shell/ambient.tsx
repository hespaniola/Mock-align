import { cn } from "@/lib/utils";

/**
 * Atmospheric background: two soft light pools drifting slowly behind
 * everything. Pure CSS (transform-only animation, GPU composited), tinted by
 * the current mood via CSS variables.
 */
export function Ambient({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}>
      <div
        className="absolute -left-[20%] -top-[30%] h-[80vmax] w-[80vmax] rounded-full blur-3xl will-change-transform animate-drift transition-[background] duration-[1500ms]"
        style={{
          background: `radial-gradient(closest-side, rgb(var(--glow-a) / calc(var(--glow-strength) * ${intensity})), transparent)`,
        }}
      />
      <div
        className="absolute -bottom-[35%] -right-[25%] h-[75vmax] w-[75vmax] rounded-full blur-3xl will-change-transform animate-drift-slow transition-[background] duration-[1500ms]"
        style={{
          background: `radial-gradient(closest-side, rgb(var(--glow-b) / calc(var(--glow-strength) * ${0.8 * intensity})), transparent)`,
        }}
      />
      {/* Vignette for depth and focus */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(10_9_8/0.85)_100%)]" />
    </div>
  );
}
