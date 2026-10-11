"use client";

import { useSyncExternalStore } from "react";
import { emptyData, localAdapter, normalize, STORAGE_KEY, type StorageAdapter } from "./storage";
import type {
  AppData,
  DateKey,
  EveningEntry,
  MorningEntry,
  Preferences,
  Profile,
} from "./types";

/**
 * A tiny external store over the persisted document.
 *
 * - Reads are synchronous and shared by every component via
 *   `useSyncExternalStore`, so there is one source of truth.
 * - Writes update memory immediately and are flushed to storage on a short
 *   debounce (autosave while typing), plus on tab hide / unload so nothing is
 *   lost.
 * - The server snapshot is `null`, which screens render as a calm loading
 *   state; this avoids hydration mismatches with localStorage.
 */

let adapter: StorageAdapter = localAdapter;
let state: AppData | null = null;
let loaded = false;
const listeners = new Set<() => void>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function ensureLoaded(): AppData {
  if (!loaded) {
    loaded = true;
    state = adapter.load() ?? emptyData();
    if (typeof window !== "undefined") {
      window.addEventListener("pagehide", flush);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") flush();
      });
      // Keep multiple open tabs consistent.
      window.addEventListener("storage", (e) => {
        if (e.key && e.key !== STORAGE_KEY) return;
        state = adapter.load() ?? emptyData();
        emit();
      });
    }
  }
  return state!;
}

function emit() {
  listeners.forEach((l) => l());
}

export function flush() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (state) adapter.save(state);
}

function commit(next: AppData) {
  state = next;
  emit();
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, 250);
}

function update(fn: (draft: AppData) => AppData) {
  commit(fn(ensureLoaded()));
}

const now = () => new Date().toISOString();

/* ------------------------------------------------------------------ */
/* Subscriptions                                                       */
/* ------------------------------------------------------------------ */

function subscribe(listener: () => void) {
  ensureLoaded();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The full document, or `null` during server render / before hydration. */
export function useAlignData(): AppData | null {
  return useSyncExternalStore(subscribe, ensureLoaded, () => null);
}

export function getData(): AppData {
  return ensureLoaded();
}

/** Swap the persistence layer (e.g. a cloud adapter after sign-in). */
export function setStorageAdapter(next: StorageAdapter) {
  adapter = next;
  loaded = false;
  ensureLoaded();
  emit();
}

/* ------------------------------------------------------------------ */
/* Defaults                                                            */
/* ------------------------------------------------------------------ */

export function blankProfile(): Profile {
  return {
    name: "",
    identity: "",
    vision: "",
    goals: ["", "", ""],
    areas: [],
    obstacles: [],
    statement: "",
    values: [],
    mantras: [],
    reasons: [],
    onboardedAt: null,
    updatedAt: now(),
  };
}

export function blankMorning(date: DateKey): MorningEntry {
  return {
    date,
    mode: "full",
    mantra: "",
    mission: "",
    uncomfortableAction: "",
    visionNote: "",
    missionDone: false,
    uncomfortableDone: false,
    completedAt: null,
    updatedAt: now(),
  };
}

export function blankEvening(date: DateKey): EveningEntry {
  return {
    date,
    win: "",
    lesson: "",
    improve: "",
    tomorrowMission: "",
    reflection: "",
    completedAt: null,
    updatedAt: now(),
  };
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

export const actions = {
  updateProfile(patch: Partial<Profile>) {
    update((d) => ({
      ...d,
      profile: { ...(d.profile ?? blankProfile()), ...patch, updatedAt: now() },
    }));
  },

  setOnboardingDraft(patch: AppData["onboardingDraft"]) {
    update((d) => ({ ...d, onboardingDraft: { ...d.onboardingDraft, ...patch } }));
  },

  /** Promote the onboarding draft (merged with any existing profile). */
  completeOnboarding() {
    update((d) => {
      const { step: _step, ...draft } = d.onboardingDraft;
      void _step;
      const base = d.profile ?? blankProfile();
      return {
        ...d,
        profile: {
          ...base,
          ...draft,
          goals: (draft.goals ?? base.goals) as Profile["goals"],
          onboardedAt: base.onboardedAt ?? now(),
          updatedAt: now(),
        },
        onboardingDraft: {},
      };
    });
    flush();
  },

  /** Upsert — one record per day, never duplicates. */
  saveMorning(date: DateKey, patch: Partial<MorningEntry>) {
    update((d) => {
      const prev = d.mornings[date] ?? blankMorning(date);
      return {
        ...d,
        mornings: { ...d.mornings, [date]: { ...prev, ...patch, date, updatedAt: now() } },
      };
    });
  },

  saveEvening(date: DateKey, patch: Partial<EveningEntry>) {
    update((d) => {
      const prev = d.evenings[date] ?? blankEvening(date);
      return {
        ...d,
        evenings: { ...d.evenings, [date]: { ...prev, ...patch, date, updatedAt: now() } },
      };
    });
  },

  deleteMorning(date: DateKey) {
    update((d) => {
      const { [date]: _gone, ...rest } = d.mornings;
      void _gone;
      return { ...d, mornings: rest };
    });
  },

  deleteEvening(date: DateKey) {
    update((d) => {
      const { [date]: _gone, ...rest } = d.evenings;
      void _gone;
      return { ...d, evenings: rest };
    });
  },

  setPreferences(patch: Partial<Preferences>) {
    update((d) => ({ ...d, preferences: { ...d.preferences, ...patch } }));
  },

  /** Replace everything with an imported document. Returns false if invalid. */
  importData(raw: unknown): boolean {
    const next = normalize(raw);
    if (!next) return false;
    commit(next);
    flush();
    return true;
  },

  reset() {
    adapter.clear();
    commit(emptyData());
    flush();
  },
};
