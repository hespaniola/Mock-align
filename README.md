# ALIGN

> Remember who you are. Become who you're meant to be.

ALIGN is a daily personal-alignment ritual for the web: a few intentional minutes each morning and night to remember your identity, choose one meaningful mission, take one brave action, and reflect.

It runs entirely in the browser. There's no account and no backend. Everything is stored in `localStorage` on your device.

## Quick start

Requires **Node.js 20.9+** (developed on Node 22).

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm start          # serve the production build
npm run lint       # ESLint (flat config)
npm run typecheck  # tsc --noEmit
```

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript**
- **Tailwind CSS v4** with tokens in `src/app/globals.css`
- shadcn/ui-style primitives (`cva` + Radix Slot) in `src/components/ui`
- **Motion for React** (`motion/react`) for the motion system
- **React Three Fiber + Drei** for the hero centerpiece, loaded lazily and only when WebGL is appropriate
- **Lucide** icons · Inter Tight / Instrument Sans / Instrument Serif (self-hosted via Fontsource)

## Features

| Area | What it does |
| --- | --- |
| **Landing** (`/`) | Cinematic hero with a 3D "aligning orbits" centerpiece. Scrolling brings the orbits into alignment. Also has scroll-lit philosophy text and a short ritual overview. |
| **Onboarding** (`/onboarding`) | One question per screen: name, identity, three goals, life areas, obstacles, personal statement. Ends with a North Star reveal. Every question is skippable, the whole setup can be skipped, answers autosave, and everything can be edited later. |
| **Today** (`/today`) | A greeting and accent that change with the time of day, plus your identity statement and a daily mantra. Shows one primary ritual card (morning, evening or rest), today's mission and brave action with checkboxes, and a 14-day consistency row. Shows a warm "welcome back" after time away. |
| **Morning** (`/morning`) | Identity → vision → mantra → one mission → one uncomfortable action → commitment summary. There's a **60-second quick mode** (toggle in the header, or `?mode=quick`). Last night's "tomorrow's mission" carries over. |
| **Nightly** (`/evening`) | Win → lesson → improvement → tomorrow's mission, then a personalized closing reflection. Uses warmer amber visuals and slower, calmer transitions. |
| **North Star** (`/north-star`) | An editable personal manifesto: statement, identity, vision, goals, values, mantras, reasons, focus areas and obstacles. Edit in place; changes save as you type. |
| **Journey** (`/journey`) | Totals, a 16-week calendar (top half of a dot = morning, bottom half = evening), and reflection history with edit links. Also has a wall of wins, past missions, and a prompt to fill in a missed reflection. There are no streaks to break; returning after time away is celebrated. |
| **Settings** (`/settings`) | Name, quick-mode default, the hour a new day starts, motion (System / Reduced / Full), and a 3D on/off switch. JSON backup + restore, a Markdown journal export, and erase-all. |

### Interaction details

- **Keyboard:** <kbd>Enter</kbd> continues in guided flows (<kbd>Shift</kbd>+<kbd>Enter</kbd> adds a newline). <kbd>Alt</kbd>+<kbd>←</kbd> goes back. <kbd>Esc</kbd> leaves the current field, then the flow. Focus moves to each new step, all controls have visible focus rings, and there's a skip-to-content link.
- **Reduced motion:** follows the OS setting or the in-app override. CSS animations are disabled and the WebGL scene is replaced by a still CSS orb.
- **3D fallbacks:** WebGL is skipped when motion is reduced, on data-saver, on low-core or low-memory devices, when there's no WebGL, or when the user turns it off. A CSS orb of the same size is shown instead, so there's no layout shift. The 3D bundle is code-split and only downloaded when used. Rendering pauses when the canvas is off-screen or the tab is hidden. If the WebGL context is lost or errors, it falls back to the CSS orb.

## Architecture

```
src/
  app/
    page.tsx                 Landing
    (app)/                   Shell with navigation: today, north-star, journey, settings
    (focus)/                 Distraction-free rituals: onboarding, morning, evening
  components/
    ui/                      Button, Chip, Textarea, Input, Card, StepProgress, TiltCard…
    flow/                    GuidedFlow engine, answer fields, completion moment
    three/                   R3F centerpiece, CSS fallback, capability-gated loader
    shell/ landing/ home/ north-star/
  hooks/                     useToday, useRitualDate, useMood, useCapabilities
  lib/
    types.ts                 Data model
    storage.ts               StorageAdapter interface + localStorage implementation
    store.ts                 External store (useSyncExternalStore), actions, debounced autosave
    dates.ts                 Local-timezone date keys & helpers
    personalize.ts           Deterministic mantras, suggestions, reflections, insights
    content.ts               Curated copy (mantras, suggestions, areas)
    motion.ts                Shared easing, springs and variants
    export.ts                JSON / Markdown export
```

### Data and dates

- One versioned JSON document (`align:v1`) holds the profile, preferences and per-day records.
- Mornings and evenings are keyed by a **local** `YYYY-MM-DD` date. Saving is an upsert, so duplicate check-ins can't happen. Past days can be edited with `?date=YYYY-MM-DD`; future dates are ignored.
- The day rolls over at **4 am** by default (configurable), so a 1 am reflection counts toward the day that just ended.
- Writes update memory immediately and flush to storage after 250 ms. They also flush when the tab is hidden or closed. Open tabs stay in sync through the `storage` event.

### Extending later

- **Auth and cloud sync:** implement `StorageAdapter` (`load`/`save`/`clear`) against an API and swap it in with `setStorageAdapter()`. No screen talks to storage directly.
- **AI personalization:** `lib/personalize.ts` is the single seam. It's deterministic today (same inputs give the same daily mantra and reflection), and can be replaced with model-backed functions.
- **Subscriptions:** the route groups keep the app shell separate, so it can be gated without touching the rituals.

## Known limitations

- Data lives only in this browser on this device. It is **not synced** between devices. Use Settings → Backup / Restore to move it.
- Clearing site data or using a private window loses entries. If storage is unavailable or full, the app keeps working for the session but can't persist.
- Mantras, suggestions and reflections are curated and rule-based. No AI is involved.
- There are no reminders or notifications, and no offline service worker yet.
- In headless or software-rendered browsers the 3D scene may fall back to the CSS orb.
