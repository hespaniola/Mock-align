import { cn } from "@/lib/utils";

/**
 * CSS-only centerpiece used before WebGL loads, and permanently on
 * low-power devices or with reduced motion. Same footprint as the 3D orb,
 * so swapping between them never shifts layout.
 */
export function OrbFallback({ className, still = false }: { className?: string; still?: boolean }) {
  return (
    <div aria-hidden className={cn("relative grid place-items-center [perspective:900px]", className)}>
      {/* Halo */}
      <div
        className={cn("absolute size-[78%] rounded-full blur-2xl", !still && "animate-breathe")}
        style={{ background: "radial-gradient(closest-side, rgb(var(--glow-a) / 0.28), transparent)" }}
      />
      {/* Orbits */}
      <div className="absolute inset-[8%] [transform-style:preserve-3d] [transform:rotateX(68deg)_rotateZ(8deg)]">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn("absolute rounded-full border", !still && "animate-spin-slow")}
            style={{
              inset: `${i * 9}%`,
              borderColor: `rgb(var(--glow-a) / ${0.55 - i * 0.12})`,
              boxShadow: `0 0 18px rgb(var(--glow-a) / ${0.25 - i * 0.06})`,
              animationDuration: `${50 + i * 25}s`,
              animationDirection: i % 2 ? "reverse" : "normal",
            }}
          />
        ))}
      </div>
      {/* Core sphere */}
      <div
        className="relative size-[42%] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, rgb(255 244 222 / 0.55), transparent 22%), radial-gradient(circle at 60% 70%, rgb(var(--glow-a) / 0.35), transparent 55%), radial-gradient(circle at 50% 50%, #2a231a 0%, #120f0b 70%)",
          boxShadow:
            "inset -18px -24px 48px rgb(0 0 0 / 0.65), inset 8px 10px 30px rgb(255 240 210 / 0.12), 0 30px 80px -20px rgb(var(--glow-a) / 0.35)",
        }}
      />
    </div>
  );
}
