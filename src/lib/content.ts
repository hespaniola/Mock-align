import type { LifeArea } from "./types";

/** Curated content. Kept separate from logic so it can later come from a CMS or AI layer. */

export const LIFE_AREAS: { id: LifeArea; label: string; hint: string }[] = [
  { id: "health", label: "Health", hint: "Body, energy, sleep" },
  { id: "career", label: "Work", hint: "Craft, career, impact" },
  { id: "relationships", label: "Relationships", hint: "Family, partner, friends" },
  { id: "mind", label: "Mind", hint: "Clarity, calm, focus" },
  { id: "finances", label: "Finances", hint: "Security and freedom" },
  { id: "creativity", label: "Creativity", hint: "Making, expressing" },
  { id: "spirit", label: "Spirit", hint: "Meaning, faith, gratitude" },
  { id: "learning", label: "Learning", hint: "Growth, curiosity, skill" },
];

export const IDENTITY_SUGGESTIONS = [
  "Someone who keeps the promises I make to myself",
  "A calm, focused person who does the important work first",
  "A present partner and parent",
  "A disciplined athlete who trains with joy",
  "A builder who ships, learns, and ships again",
  "A generous, grounded leader",
];

export const GOAL_SUGGESTIONS = [
  "Train four times a week",
  "Finish and launch my project",
  "Read twelve books this year",
  "Save six months of runway",
  "Protect two hours of deep work daily",
  "Be fully present at dinner",
];

export const OBSTACLES = [
  "Waiting until I feel ready",
  "Perfectionism",
  "Distraction and my phone",
  "Self-doubt",
  "Overcommitting",
  "Low energy",
  "Fear of judgment",
  "Inconsistency",
];

export const VALUE_SUGGESTIONS = [
  "Integrity",
  "Courage",
  "Discipline",
  "Presence",
  "Craft",
  "Kindness",
  "Freedom",
  "Growth",
  "Health",
  "Honesty",
];

/** Universal mantras, plus area-specific sets used for deterministic personalization. */
export const MANTRAS: { text: string; areas?: LifeArea[] }[] = [
  { text: "Action creates clarity." },
  { text: "Small steps, taken daily, become a life." },
  { text: "I don't need to feel ready. I need to begin." },
  { text: "Discipline is remembering what I want." },
  { text: "Progress over perfection. Always." },
  { text: "I am the author of today." },
  { text: "Do the next right thing." },
  { text: "Calm is a skill, and I am practicing it." },
  { text: "Evidence beats emotion. Collect evidence." },
  { text: "Who I become is decided by what I repeat." },
  { text: "Hard things, done gently, still count." },
  { text: "I can do hard things slowly." },
  { text: "Protect the morning, and the day follows." },
  { text: "My future self is watching. Make them proud." },
  { text: "Energy follows attention.", areas: ["mind", "career"] },
  { text: "Move the body, clear the mind.", areas: ["health", "mind"] },
  { text: "Rest is part of the work.", areas: ["health", "mind"] },
  { text: "Make one thing better than yesterday.", areas: ["career", "creativity"] },
  { text: "Make it, then make it good.", areas: ["creativity", "career"] },
  { text: "Be where your feet are.", areas: ["relationships", "spirit"] },
  { text: "Listen longer. Love louder.", areas: ["relationships"] },
  { text: "Spend like the future matters.", areas: ["finances"] },
  { text: "Freedom is built quietly, one choice at a time.", areas: ["finances"] },
  { text: "Gratitude turns what I have into enough.", areas: ["spirit"] },
  { text: "Curiosity before certainty.", areas: ["learning", "mind"] },
  { text: "Be a beginner on purpose.", areas: ["learning", "creativity"] },
];

/** Uncomfortable-action prompts, matched to common obstacles. */
export const UNCOMFORTABLE_BY_OBSTACLE: Record<string, string[]> = {
  "Waiting until I feel ready": [
    "Start the task before I feel ready — 10 minutes",
    "Send the message I've been rehearsing",
  ],
  Perfectionism: [
    "Share something unfinished and ask for feedback",
    "Ship a version I'd rate a 7 out of 10",
  ],
  "Distraction and my phone": [
    "Phone in another room for the first 90 minutes",
    "One full work block with every notification off",
  ],
  "Self-doubt": [
    "Ask for the thing I think I don't deserve",
    "Speak first in the meeting",
  ],
  Overcommitting: ["Say no to one request today", "Cancel one thing that doesn't matter"],
  "Low energy": ["Walk outside before checking messages", "Train even if it's short"],
  "Fear of judgment": ["Post the work publicly", "Share an honest opinion out loud"],
  Inconsistency: ["Do the 2-minute version, no matter what", "Show up at the same time as yesterday"],
};

export const UNCOMFORTABLE_FALLBACK = [
  "Have the conversation I've been avoiding",
  "Do the hardest task first",
  "Take a cold shower",
  "Ask for help with something I'm stuck on",
];

export const STATEMENT_TEMPLATES = [
  (identity: string) => (identity ? `I am becoming ${lowerFirst(identity)}.` : "I am becoming who I said I would be."),
  () => "I keep my promises to myself, one day at a time.",
  () => "I act before I feel ready, and clarity follows.",
];

export function lowerFirst(s: string) {
  if (!s) return s;
  // Keep "I" and acronyms intact.
  if (/^(I\b|[A-Z]{2,})/.test(s)) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}
