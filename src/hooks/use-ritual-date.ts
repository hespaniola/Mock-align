"use client";

import { useSearchParams } from "next/navigation";
import { isDateKey } from "@/lib/dates";
import type { DateKey } from "@/lib/types";
import { useToday } from "./use-today";

/**
 * Which day a ritual screen is editing: `?date=YYYY-MM-DD` for a past entry
 * (never the future), otherwise today.
 */
export function useRitualDate(dayStartsAt?: number): { date: DateKey; today: DateKey; isPast: boolean } | null {
  const params = useSearchParams();
  const now = useToday(dayStartsAt);
  if (!now) return null;
  const requested = params.get("date");
  const date = isDateKey(requested) && requested <= now.today ? requested : now.today;
  return { date, today: now.today, isPast: date !== now.today };
}
