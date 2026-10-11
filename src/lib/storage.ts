import type { AppData, Preferences } from "./types";

/**
 * Persistence adapter.
 *
 * The app talks to storage only through `StorageAdapter`, so a cloud-backed
 * implementation (with auth) can replace `localAdapter` later without touching
 * any screen. Everything is one JSON document, which keeps writes atomic.
 */
export interface StorageAdapter {
  load(): AppData | null;
  save(data: AppData): void;
  clear(): void;
}

export const STORAGE_KEY = "align:v1";

export const DEFAULT_PREFERENCES: Preferences = {
  quickMorning: false,
  motion: "system",
  enable3D: true,
  dayStartsAt: 4,
};

export function emptyData(): AppData {
  return {
    version: 1,
    profile: null,
    mornings: {},
    evenings: {},
    preferences: { ...DEFAULT_PREFERENCES },
    onboardingDraft: {},
    createdAt: new Date().toISOString(),
  };
}

/** Fills in anything missing from older or partially-written documents. */
export function normalize(raw: unknown): AppData | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<AppData>;
  if (r.version !== 1) return null;
  const base = emptyData();
  return {
    ...base,
    ...r,
    mornings: r.mornings && typeof r.mornings === "object" ? r.mornings : {},
    evenings: r.evenings && typeof r.evenings === "object" ? r.evenings : {},
    preferences: { ...DEFAULT_PREFERENCES, ...(r.preferences ?? {}) },
    onboardingDraft: r.onboardingDraft ?? {},
  };
}

export const localAdapter: StorageAdapter = {
  load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return normalize(JSON.parse(raw));
    } catch (err) {
      console.warn("[align] Could not read saved data", err);
      return null;
    }
  },
  save(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      // Quota exceeded or storage disabled (private mode). The in-memory
      // state keeps working for this session.
      console.warn("[align] Could not save data", err);
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  },
};
