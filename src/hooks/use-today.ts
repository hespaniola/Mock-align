"use client";

import { useEffect, useState } from "react";
import { alignDay, dayPeriod, type DayPeriod } from "@/lib/dates";
import type { DateKey } from "@/lib/types";

/**
 * The current alignment day and period of day. Re-evaluated every minute and
 * whenever the tab regains focus, so a tab left open overnight rolls over.
 * Returns null on the server.
 */
export function useToday(dayStartsAt = 4): { today: DateKey; period: DayPeriod } | null {
  const [value, setValue] = useState<{ today: DateKey; period: DayPeriod } | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = { today: alignDay(now, dayStartsAt), period: dayPeriod(now) };
      setValue((prev) => (prev && prev.today === next.today && prev.period === next.period ? prev : next));
    };
    tick();
    const id = setInterval(tick, 60_000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [dayStartsAt]);

  return value;
}
