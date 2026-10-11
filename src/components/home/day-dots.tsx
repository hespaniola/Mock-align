"use client";

import { useState } from "react";
import { formatLong } from "@/lib/dates";
import type { AppData, DateKey } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A day as a small circle: the top half fills for a completed morning, the
 * bottom half for a completed evening. Identity is carried by position
 * (shape), not by colour, so it reads the same for everyone.
 */
export function DayDot({ morning, evening, size = 14, today = false }: { morning: boolean; evening: boolean; size?: number; today?: boolean }) {
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="overflow-visible">
      <circle cx={r} cy={r} r={r - 0.75} fill="none" stroke="rgb(243 236 224 / 0.16)" strokeWidth={1.5} />
      {morning && <path d={`M 0.75 ${r} A ${r - 0.75} ${r - 0.75} 0 0 1 ${size - 0.75} ${r} Z`} fill="var(--accent)" />}
      {evening && (
        <path
          d={`M 0.75 ${r} A ${r - 0.75} ${r - 0.75} 0 0 0 ${size - 0.75} ${r} Z`}
          fill="var(--accent)"
          fillOpacity={0.6}
        />
      )}
      {today && <circle cx={r} cy={r} r={r + 2.5} fill="none" stroke="var(--color-ivory)" strokeOpacity={0.5} strokeWidth={1} />}
    </svg>
  );
}

function status(data: AppData, d: DateKey) {
  const m = Boolean(data.mornings[d]?.completedAt);
  const e = Boolean(data.evenings[d]?.completedAt);
  return { m, e, label: m && e ? "Morning and evening" : m ? "Morning" : e ? "Evening" : "Rest day" };
}

/** Row or grid of day dots with a hover/focus readout. */
export function DayDots({
  data,
  days,
  today,
  columns,
  rows,
  size = 14,
  className,
}: {
  data: AppData;
  days: DateKey[];
  today: DateKey;
  /** If set, lays days out in a grid (e.g. 7 for weeks). */
  columns?: number;
  /** If set, flows days down columns of this height (calendar weeks). */
  rows?: number;
  size?: number;
  className?: string;
}) {
  const [hover, setHover] = useState<DateKey | null>(null);
  const active = hover ? status(data, hover) : null;

  return (
    <div className={className}>
      <ul
        className={cn(columns || rows ? "grid w-fit" : "flex flex-wrap items-center")}
        style={{
          gap: size * 0.55,
          ...(columns ? { gridTemplateColumns: `repeat(${columns}, ${size}px)` } : {}),
          ...(rows ? { gridTemplateRows: `repeat(${rows}, ${size}px)`, gridAutoFlow: "column" } : {}),
        }}
        onMouseLeave={() => setHover(null)}
      >
        {days.map((d) => {
          const s = status(data, d);
          return (
            <li key={d} className="leading-none">
              <span
                role="img"
                tabIndex={0}
                aria-label={`${formatLong(d)}: ${s.label}`}
                onMouseEnter={() => setHover(d)}
                onFocus={() => setHover(d)}
                onBlur={() => setHover(null)}
                className="-m-1 block rounded-full p-1 outline-offset-1 transition-transform duration-200 hover:scale-125"
              >
                <DayDot morning={s.m} evening={s.e} size={size} today={d === today} />
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 h-4 text-xs text-ivory-muted" aria-live="polite">
        {hover && active ? (
          <>
            <span className="text-ivory">{formatLong(hover)}</span> · {active.label}
          </>
        ) : (
          <span className="inline-flex items-center gap-3 text-ivory-faint">
            <span className="inline-flex items-center gap-1.5">
              <DayDot morning evening={false} size={10} /> Morning
            </span>
            <span className="inline-flex items-center gap-1.5">
              <DayDot morning={false} evening size={10} /> Evening
            </span>
          </span>
        )}
      </p>
    </div>
  );
}
