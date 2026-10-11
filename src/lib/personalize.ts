import {
  GOAL_SUGGESTIONS,
  MANTRAS,
  UNCOMFORTABLE_BY_OBSTACLE,
  UNCOMFORTABLE_FALLBACK,
  lowerFirst,
} from "./content";
import { addDays, dayPeriod, daysBetween, type DayPeriod } from "./dates";
import type { AppData, DateKey, EveningEntry, Profile } from "./types";

/**
 * Deterministic personalization. Same inputs → same output, so the daily
 * mantra stays stable through the day and across reloads. This is the seam
 * where an AI layer could plug in later.
 */

/** FNV-1a — small, stable string hash. */
export function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mantraPool(profile: Profile | null): string[] {
  const areas = new Set(profile?.areas ?? []);
  const own = (profile?.mantras ?? []).filter(Boolean);
  const relevant = MANTRAS.filter((m) => !m.areas || m.areas.some((a) => areas.has(a))).map((m) => m.text);
  // The user's own words are weighted more heavily.
  return [...own, ...own, ...relevant];
}

export function dailyMantra(profile: Profile | null, date: DateKey, offset = 0): string {
  const pool = mantraPool(profile);
  if (pool.length === 0) return MANTRAS[0].text;
  return pool[(hash(date) + offset) % pool.length];
}

export function greeting(period: DayPeriod, name?: string): string {
  const who = name?.trim() ? `, ${name.trim()}` : "";
  switch (period) {
    case "dawn":
      return `Early light${who}`;
    case "morning":
      return `Good morning${who}`;
    case "afternoon":
      return `Good afternoon${who}`;
    case "evening":
      return `Good evening${who}`;
    case "night":
      return `Quiet hours${who}`;
  }
}

export function currentPeriod() {
  return dayPeriod(new Date());
}

/** Is this the part of the day for the evening ritual? */
export function isEveningTime(period: DayPeriod) {
  return period === "evening" || period === "night";
}

export function missionSuggestions(profile: Profile | null): string[] {
  const goals = (profile?.goals ?? []).filter(Boolean).map((g) => `Move "${g}" forward by one concrete step`);
  return [...goals, "Finish the one task I keep postponing", "Two focused hours on what matters most"].slice(0, 4);
}

export function uncomfortableSuggestions(profile: Profile | null, date: DateKey): string[] {
  const fromObstacles = (profile?.obstacles ?? []).flatMap((o) => UNCOMFORTABLE_BY_OBSTACLE[o] ?? []);
  const pool = fromObstacles.length ? [...fromObstacles, ...UNCOMFORTABLE_FALLBACK] : UNCOMFORTABLE_FALLBACK;
  // Rotate deterministically so suggestions feel fresh each day.
  const start = hash(date + "u") % pool.length;
  const rotated = [...pool.slice(start), ...pool.slice(0, start)];
  return Array.from(new Set(rotated)).slice(0, 3);
}

export function goalSuggestions(existing: string[]): string[] {
  return GOAL_SUGGESTIONS.filter((g) => !existing.includes(g));
}

/** The mission carried over from last night's reflection, if any. */
export function carriedMission(data: AppData, today: DateKey): string {
  return data.evenings[addDays(today, -1)]?.tomorrowMission?.trim() ?? "";
}

/** Today's mission: this morning's commitment, or last night's intention. */
export function todaysMission(data: AppData, today: DateKey): { text: string; source: "morning" | "evening" | null } {
  const m = data.mornings[today]?.mission?.trim();
  if (m) return { text: m, source: "morning" };
  const carried = carriedMission(data, today);
  if (carried) return { text: carried, source: "evening" };
  return { text: "", source: null };
}

/** Closing words for the night, built from what the user just wrote. */
export function eveningReflection(profile: Profile | null, entry: Pick<EveningEntry, "win" | "lesson" | "improve" | "tomorrowMission">, date: DateKey): string {
  const identity = profile?.identity?.trim();
  const parts: string[] = [];

  if (entry.win.trim()) {
    parts.push(
      pick(date, [
        `You named a win today. That is evidence, and evidence is how belief is built.`,
        `Today held a real win. Let it count — it was earned.`,
        `A win, written down, becomes proof. You now have one more piece.`,
      ]),
    );
  } else {
    parts.push(
      pick(date, [
        `Not every day leaves an obvious win. Showing up to reflect is one.`,
        `Some days are for enduring. You still closed this one with intention.`,
      ]),
    );
  }

  if (entry.lesson.trim()) {
    parts.push(`What you learned stays with you; the day was not wasted.`);
  }

  if (identity) {
    parts.push(`This is what ${toSecondPerson(lowerFirst(identity)).replace(/\.$/, "")} does: notices, adjusts, and returns.`);
  } else {
    parts.push(`Notice, adjust, return. That is the whole practice.`);
  }

  parts.push(
    entry.tomorrowMission.trim()
      ? `Tomorrow already has a direction. Now rest — recovery is part of the work.`
      : `Let tomorrow be decided tomorrow. Tonight, rest.`,
  );

  return parts.join(" ");
}

/** "keeps the promises I make to myself" → "keeps the promises you make to yourself". */
export function toSecondPerson(s: string): string {
  return s
    .replace(/\bI am\b/g, "you are")
    .replace(/\bI'm\b/g, "you're")
    .replace(/\bI\b/g, "you")
    .replace(/\bmyself\b/gi, "yourself")
    .replace(/\bmy\b/gi, "your")
    .replace(/\bmine\b/gi, "yours")
    .replace(/\bme\b/gi, "you");
}

function pick<T>(seed: string, options: T[]): T {
  return options[hash(seed) % options.length];
}

/* ------------------------------------------------------------------ */
/* Progress                                                            */
/* ------------------------------------------------------------------ */

export function isAligned(data: AppData, date: DateKey) {
  return Boolean(data.mornings[date]?.completedAt || data.evenings[date]?.completedAt);
}

export function activeDates(data: AppData): DateKey[] {
  const set = new Set<DateKey>();
  for (const [k, v] of Object.entries(data.mornings)) if (v.completedAt) set.add(k);
  for (const [k, v] of Object.entries(data.evenings)) if (v.completedAt) set.add(k);
  return Array.from(set).sort();
}

export interface Insights {
  totalDays: number;
  mornings: number;
  evenings: number;
  last30: number;
  /** Times the user came back after missing 2+ days. Celebrated, not punished. */
  returns: number;
  /** Days since the last aligned day (0 = today). Null if never. */
  daysAway: number | null;
  wins: { date: DateKey; text: string }[];
  missionsKept: number;
  firstDay: DateKey | null;
}

export function insights(data: AppData, today: DateKey): Insights {
  const dates = activeDates(data);
  let returns = 0;
  for (let i = 1; i < dates.length; i++) if (daysBetween(dates[i - 1], dates[i]) > 2) returns++;
  const last = dates[dates.length - 1];
  const morningList = Object.values(data.mornings).filter((m) => m.completedAt);
  return {
    totalDays: dates.length,
    mornings: morningList.length,
    evenings: Object.values(data.evenings).filter((e) => e.completedAt).length,
    last30: dates.filter((d) => daysBetween(d, today) >= 0 && daysBetween(d, today) < 30).length,
    returns,
    daysAway: last ? daysBetween(last, today) : null,
    wins: Object.values(data.evenings)
      .filter((e) => e.win.trim())
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((e) => ({ date: e.date, text: e.win.trim() })),
    missionsKept: morningList.filter((m) => m.missionDone).length,
    firstDay: dates[0] ?? null,
  };
}

/** Warm, non-judgmental message for someone who's been away. */
export function welcomeBack(daysAway: number | null): string | null {
  if (daysAway === null || daysAway < 2) return null;
  if (daysAway < 7) return "Welcome back. Returning is the habit that matters most.";
  return "It's good to see you again. Nothing to catch up on — just begin from here.";
}
