"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, MoonStar, PenLine, Sunrise } from "lucide-react";
import { useState } from "react";
import { DayDots } from "@/components/home/day-dots";
import { Loading } from "@/components/shell/loading";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToday } from "@/hooks/use-today";
import { addDays, fromDateKey, relativeLabel, formatLong } from "@/lib/dates";
import { fadeUp, spring, stagger } from "@/lib/motion";
import { insights } from "@/lib/personalize";
import { useAlignData } from "@/lib/store";
import type { AppData, DateKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEEKS = 16;

type Tab = "days" | "wins" | "missions";

export function Journey() {
  const data = useAlignData();
  const now = useToday(data?.preferences.dayStartsAt);
  const [tab, setTab] = useState<Tab>("days");
  const [limit, setLimit] = useState(10);

  if (!data || !now) return <Loading />;
  const { today } = now;
  const stats = insights(data, today);

  // Calendar: WEEKS full weeks ending with the current week (weeks start Monday).
  const todayDate = fromDateKey(today);
  const dow = (todayDate.getDay() + 6) % 7; // 0 = Monday
  const start = addDays(today, -dow - (WEEKS - 1) * 7);
  const calendar: DateKey[] = [];
  for (let d = start; d <= today; d = addDays(d, 1)) calendar.push(d);

  const dated = Array.from(new Set([...Object.keys(data.mornings), ...Object.keys(data.evenings)]))
    .filter((d) => data.mornings[d]?.completedAt || data.evenings[d]?.completedAt || hasContent(data, d))
    .sort()
    .reverse();

  const yesterday = addDays(today, -1);
  const missedYesterday = !data.evenings[yesterday]?.completedAt && stats.firstDay !== null && stats.firstDay < yesterday;

  const tiles = [
    { label: "Days aligned", value: stats.totalDays },
    { label: "Mornings", value: stats.mornings },
    { label: "Evenings", value: stats.evenings },
    { label: "Missions kept", value: stats.missionsKept },
  ];

  return (
    <motion.div variants={stagger(0.07)} initial="hidden" animate="show" className="space-y-14 sm:space-y-20">
      <header>
        <motion.p variants={fadeUp} className="eyebrow">
          Your journey
        </motion.p>
        <motion.h1 variants={fadeUp} className="display mt-5 max-w-3xl text-balance text-5xl sm:text-7xl">
          Evidence of who you&apos;re <span className="serif-accent text-accent">becoming.</span>
        </motion.h1>
        {stats.returns > 0 && (
          <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg text-ivory-muted">
            You&apos;ve returned {stats.returns} {stats.returns === 1 ? "time" : "times"} after time away. Coming back is
            the habit that makes every other habit possible.
          </motion.p>
        )}
      </header>

      {/* Stats + calendar */}
      <motion.section variants={fadeUp} className="grid gap-5 lg:grid-cols-[1fr_auto]">
        <Card className="grid grid-cols-2 gap-px overflow-hidden p-0 sm:grid-cols-4 lg:grid-cols-2">
          {tiles.map((t) => (
            <div key={t.label} className="bg-ink-900/40 p-6 sm:p-7">
              <p className="font-display text-4xl font-light tabular-nums tracking-tight">{t.value}</p>
              <p className="mt-2 text-sm text-ivory-muted">{t.label}</p>
            </div>
          ))}
        </Card>
        <Card className="overflow-x-auto p-6 sm:p-8">
          <div className="mb-5 flex items-baseline justify-between gap-6">
            <h2 className="eyebrow">Last {WEEKS} weeks</h2>
            <p className="text-xs text-ivory-faint">{stats.last30} of the last 30 days</p>
          </div>
          <div className="flex gap-3">
            <div
              aria-hidden
              className="grid text-[0.625rem] leading-none text-ivory-faint"
              style={{ gridTemplateRows: "repeat(7, 14px)", rowGap: 14 * 0.55 }}
            >
              {["M", "", "W", "", "F", "", "S"].map((l, i) => (
                <span key={i} className="flex items-center">
                  {l}
                </span>
              ))}
            </div>
            <DayDots data={data} days={calendar} today={today} rows={7} size={14} />
          </div>
        </Card>
      </motion.section>

      {/* Gentle invitation to fill in a missed reflection */}
      {missedYesterday && (
        <motion.div variants={fadeUp}>
          <Link
            href={`/evening?date=${yesterday}`}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-dashed border-ivory/15 px-6 py-5 transition-colors hover:border-accent/40"
          >
            <span className="text-ivory-soft">
              Missed last night? <span className="text-ivory-muted">You can still reflect on yesterday.</span>
            </span>
            <PenLine className="size-4 text-accent transition-transform group-hover:-rotate-12" aria-hidden />
          </Link>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.section variants={fadeUp}>
        <div role="tablist" aria-label="Journey view" className="mb-8 inline-flex rounded-full border border-ivory/[0.08] p-1">
          {(
            [
              ["days", "Reflections"],
              ["wins", "Wins"],
              ["missions", "Missions"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              onClick={() => setTab(id)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm transition-colors",
                tab === id ? "text-ink-950" : "text-ivory-muted hover:text-ivory",
              )}
            >
              {tab === id && <motion.span layoutId="journey-tab" className="absolute inset-0 rounded-full bg-ivory" transition={spring.snappy} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            id={`panel-${tab}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "days" &&
              (dated.length === 0 ? (
                <Empty />
              ) : (
                <div className="space-y-4">
                  {dated.slice(0, limit).map((d) => (
                    <DayCard key={d} data={data} date={d} today={today} />
                  ))}
                  {dated.length > limit && (
                    <div className="pt-4 text-center">
                      <Button variant="secondary" onClick={() => setLimit((l) => l + 14)}>
                        Show earlier days
                      </Button>
                    </div>
                  )}
                </div>
              ))}

            {tab === "wins" &&
              (stats.wins.length === 0 ? (
                <Empty text="Your wins will collect here — each one written in an evening reflection." />
              ) : (
                <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
                  {stats.wins.map((w) => (
                    <li key={w.date} className="surface mb-4 break-inside-avoid rounded-3xl p-6">
                      <p className="serif-accent text-xl leading-snug text-ivory">“{w.text}”</p>
                      <p className="mt-4 text-xs text-ivory-faint">{formatLong(w.date)}</p>
                    </li>
                  ))}
                </ul>
              ))}

            {tab === "missions" && <Missions data={data} today={today} />}
          </motion.div>
        </AnimatePresence>
      </motion.section>
    </motion.div>
  );
}

function hasContent(data: AppData, d: DateKey) {
  const m = data.mornings[d];
  const e = data.evenings[d];
  return Boolean(m?.mission || m?.uncomfortableAction || e?.win || e?.lesson || e?.improve || e?.tomorrowMission);
}

function Empty({ text = "Your first alignment will appear here. There's nothing to catch up on — just begin." }: { text?: string }) {
  return (
    <Card className="flex flex-col items-start gap-6 p-8 sm:p-10">
      <p className="max-w-lg text-lg leading-relaxed text-ivory-muted">{text}</p>
      <LinkButton href="/today" variant="secondary">
        Go to today
      </LinkButton>
    </Card>
  );
}

function Row({ label, value, done }: { label: string; value: string; done?: boolean }) {
  if (!value.trim()) return null;
  return (
    <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-xs uppercase tracking-[0.16em] text-ivory-faint sm:pt-1">{label}</dt>
      <dd className="flex items-start gap-2 text-ivory-soft">
        {done && <Check className="mt-1 size-4 shrink-0 text-accent" aria-label="Done" />}
        <span>{value}</span>
      </dd>
    </div>
  );
}

function DayCard({ data, date, today }: { data: AppData; date: DateKey; today: DateKey }) {
  const m = data.mornings[date];
  const e = data.evenings[date];
  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-display text-2xl font-light tracking-tight">{relativeLabel(date, today)}</h3>
        <p className="text-sm text-ivory-faint">{formatLong(date)}</p>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="eyebrow inline-flex items-center gap-2">
              <Sunrise className="size-3.5 text-accent" aria-hidden /> Morning
              {!m?.completedAt && m && <span className="normal-case tracking-normal text-ivory-faint">· draft</span>}
            </p>
            <Link
              href={`/morning?date=${date}`}
              className="rounded-full px-2 py-1 text-xs text-ivory-muted transition-colors hover:text-ivory"
              aria-label={`${m ? "Edit" : "Add"} morning for ${formatLong(date)}`}
            >
              {m ? "Edit" : "Add"}
            </Link>
          </div>
          {m ? (
            <dl className="space-y-3">
              {m.mantra && <p className="serif-accent text-lg text-ivory">“{m.mantra}”</p>}
              <Row label="Mission" value={m.mission} done={m.missionDone} />
              <Row label="Brave action" value={m.uncomfortableAction} done={m.uncomfortableDone} />
              <Row label="Vision note" value={m.visionNote} />
            </dl>
          ) : (
            <p className="text-sm text-ivory-faint">No morning alignment.</p>
          )}
        </div>
        <div data-mood="evening">
          <div className="mb-4 flex items-center justify-between">
            <p className="eyebrow inline-flex items-center gap-2">
              <MoonStar className="size-3.5 text-accent" aria-hidden /> Evening
              {!e?.completedAt && e && <span className="normal-case tracking-normal text-ivory-faint">· draft</span>}
            </p>
            <Link
              href={`/evening?date=${date}`}
              className="rounded-full px-2 py-1 text-xs text-ivory-muted transition-colors hover:text-ivory"
              aria-label={`${e ? "Edit" : "Add"} evening for ${formatLong(date)}`}
            >
              {e ? "Edit" : "Add"}
            </Link>
          </div>
          {e ? (
            <dl className="space-y-3">
              <Row label="Win" value={e.win} />
              <Row label="Learned" value={e.lesson} />
              <Row label="Improve" value={e.improve} />
              <Row label="Tomorrow" value={e.tomorrowMission} />
            </dl>
          ) : (
            <p className="text-sm text-ivory-faint">No evening reflection.</p>
          )}
        </div>
      </div>
    </Card>
  );
}

function Missions({ data, today }: { data: AppData; today: DateKey }) {
  const list = Object.values(data.mornings)
    .filter((m) => m.mission.trim() || m.uncomfortableAction.trim())
    .sort((a, b) => b.date.localeCompare(a.date));
  if (list.length === 0) return <Empty text="Missions you choose each morning will gather here." />;
  return (
    <Card className="divide-y divide-ivory/[0.06] p-0">
      {list.map((m) => (
        <div key={m.date} className="grid gap-2 p-5 sm:grid-cols-[8rem_1fr_1fr] sm:gap-6 sm:p-6">
          <p className="text-sm text-ivory-faint">{relativeLabel(m.date, today)}</p>
          <p className={cn("flex items-start gap-2", m.missionDone ? "text-ivory" : "text-ivory-soft")}>
            {m.missionDone && <Check className="mt-1 size-4 shrink-0 text-accent" aria-label="Done" />}
            {m.mission || <span className="text-ivory-faint">—</span>}
          </p>
          <p className="flex items-start gap-2 text-sm text-ivory-muted">
            {m.uncomfortableDone && <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-label="Done" />}
            {m.uncomfortableAction}
          </p>
        </div>
      ))}
    </Card>
  );
}

