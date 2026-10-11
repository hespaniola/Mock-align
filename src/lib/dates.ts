import type { DateKey } from "./types";

/**
 * All date math happens in the user's local timezone. We never use
 * `toISOString().slice(0, 10)` for day keys, because that is UTC and would
 * put an 8pm reflection in Los Angeles on the following day.
 */

const pad = (n: number) => String(n).padStart(2, "0");

export function toDateKey(d: Date): DateKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parses a DateKey into a local Date at noon (noon avoids DST edge cases). */
export function fromDateKey(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}

export function isDateKey(value: unknown): value is DateKey {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return toDateKey(fromDateKey(value)) === value;
}

/**
 * The "alignment day" for a moment in time. A reflection written at 1am
 * belongs to the day that just ended, so the day rolls over at
 * `dayStartsAt` (default 4am) rather than midnight.
 */
export function alignDay(now: Date = new Date(), dayStartsAt = 4): DateKey {
  const shifted = new Date(now);
  if (now.getHours() < dayStartsAt) shifted.setDate(shifted.getDate() - 1);
  return toDateKey(shifted);
}

export function addDays(key: DateKey, delta: number): DateKey {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + delta);
  return toDateKey(d);
}

/** Whole days from `a` to `b` (b − a). */
export function daysBetween(a: DateKey, b: DateKey): number {
  const ms = fromDateKey(b).getTime() - fromDateKey(a).getTime();
  return Math.round(ms / 86_400_000);
}

/** Inclusive list of keys ending at `end`, oldest first. */
export function lastNDays(end: DateKey, n: number): DateKey[] {
  return Array.from({ length: n }, (_, i) => addDays(end, i - (n - 1)));
}

export type DayPeriod = "dawn" | "morning" | "afternoon" | "evening" | "night";

export function dayPeriod(now: Date = new Date()): DayPeriod {
  const h = now.getHours();
  if (h >= 4 && h < 7) return "dawn";
  if (h >= 7 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 22) return "evening";
  return "night";
}

export function formatLong(key: DateKey): string {
  return fromDateKey(key).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatShort(key: DateKey): string {
  return fromDateKey(key).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatWeekday(key: DateKey): string {
  return fromDateKey(key).toLocaleDateString(undefined, { weekday: "short" });
}

/** Friendly relative label: Today, Yesterday, or a short date. */
export function relativeLabel(key: DateKey, today: DateKey): string {
  const diff = daysBetween(key, today);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff > 1 && diff < 7) return fromDateKey(key).toLocaleDateString(undefined, { weekday: "long" });
  return formatShort(key);
}
