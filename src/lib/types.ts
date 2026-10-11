/**
 * ALIGN data model.
 *
 * Everything the user creates lives in a single versioned `AppData` document.
 * Daily records are keyed by a local `DateKey` ("YYYY-MM-DD"), which makes
 * duplicate check-ins impossible by construction: saving a morning for a day
 * that already has one updates that record instead of creating another.
 */

/** A calendar day in the user's local timezone, formatted `YYYY-MM-DD`. */
export type DateKey = string;

/** ISO-8601 timestamp. */
export type Timestamp = string;

export type LifeArea =
  | "health"
  | "career"
  | "relationships"
  | "mind"
  | "finances"
  | "creativity"
  | "spirit"
  | "learning";

export interface Profile {
  name: string;
  /** "Who do you want to become?" */
  identity: string;
  /** Long-term vision — a few sentences describing the life being built. */
  vision: string;
  /** The three most important goals. Always length 3; empty strings allowed. */
  goals: [string, string, string];
  areas: LifeArea[];
  /** What usually holds the user back. */
  obstacles: string[];
  /** The personal statement to remember every day. */
  statement: string;
  values: string[];
  /** The user's own mantras. Mixed with the curated set. */
  mantras: string[];
  /** Why growth matters to them. */
  reasons: string[];
  onboardedAt: Timestamp | null;
  updatedAt: Timestamp;
}

export type MorningMode = "full" | "quick";

export interface MorningEntry {
  date: DateKey;
  mode: MorningMode;
  mantra: string;
  mission: string;
  uncomfortableAction: string;
  /** Optional thought captured while revisiting the vision. */
  visionNote: string;
  missionDone: boolean;
  uncomfortableDone: boolean;
  /** Null while the flow is in progress (an autosaved draft). */
  completedAt: Timestamp | null;
  updatedAt: Timestamp;
}

export interface EveningEntry {
  date: DateKey;
  win: string;
  lesson: string;
  improve: string;
  tomorrowMission: string;
  /** Closing reflection generated at completion. */
  reflection: string;
  completedAt: Timestamp | null;
  updatedAt: Timestamp;
}

export type MotionPreference = "system" | "reduced" | "full";

export interface Preferences {
  /** Default to the 60-second morning. */
  quickMorning: boolean;
  motion: MotionPreference;
  /** Allow the WebGL centerpiece when the device can handle it. */
  enable3D: boolean;
  /** Hour (0–23) at which a new day begins. Late-night reflections before this count toward the previous day. */
  dayStartsAt: number;
}

export interface AppData {
  version: 1;
  profile: Profile | null;
  mornings: Record<DateKey, MorningEntry>;
  evenings: Record<DateKey, EveningEntry>;
  preferences: Preferences;
  /** In-progress onboarding answers, so a refresh never loses them. */
  onboardingDraft: Partial<Profile> & { step?: number };
  createdAt: Timestamp;
}
