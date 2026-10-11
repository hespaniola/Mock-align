"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Check, MoonStar, Sunrise, Timer } from "lucide-react";
import { DayDots } from "@/components/home/day-dots";
import { Loading } from "@/components/shell/loading";
import { OrbFallback } from "@/components/three/orb-fallback";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TiltCard } from "@/components/ui/tilt-card";
import { useMood } from "@/hooks/use-mood";
import { useToday } from "@/hooks/use-today";
import { formatLong, lastNDays } from "@/lib/dates";
import { fadeUp, spring, stagger } from "@/lib/motion";
import {
  dailyMantra,
  greeting,
  insights,
  isEveningTime,
  todaysMission,
  welcomeBack,
} from "@/lib/personalize";
import { actions, useAlignData } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Today() {
  const data = useAlignData();
  const now = useToday(data?.preferences.dayStartsAt);
  const evening = now ? isEveningTime(now.period) : false;
  useMood(evening ? "evening" : "morning");

  if (!data || !now) return <Loading />;

  const { today, period } = now;
  const profile = data.profile;
  const morning = data.mornings[today];
  const night = data.evenings[today];
  const morningDone = Boolean(morning?.completedAt);
  const eveningDone = Boolean(night?.completedAt);
  const mission = todaysMission(data, today);
  const mantra = morning?.mantra || dailyMantra(profile, today);
  const stats = insights(data, today);
  const returning = welcomeBack(stats.daysAway);
  const identityLine = profile?.statement?.trim() || profile?.identity?.trim();

  // The one primary action for right now.
  const primary: "morning" | "evening" | "rest" = eveningDone
    ? "rest"
    : evening
      ? "evening"
      : morningDone
        ? "rest"
        : "morning";

  return (
    <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="space-y-16 sm:space-y-24">
      {/* Greeting */}
      <section className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
        <div>
          <motion.p variants={fadeUp} className="eyebrow">
            {formatLong(today)}
          </motion.p>
          <motion.h1 variants={fadeUp} className="display mt-5 text-balance text-[2.75rem] sm:text-7xl">
            {greeting(period, profile?.name)}
            <span className="text-accent">.</span>
          </motion.h1>
          {identityLine ? (
            <motion.p variants={fadeUp} className="serif-accent mt-6 max-w-2xl text-balance text-2xl leading-snug text-ivory-soft sm:text-3xl">
              {identityLine}
            </motion.p>
          ) : (
            <motion.div variants={fadeUp} className="mt-6 max-w-xl">
              <p className="text-lg text-ivory-muted">
                Start by naming who you want to become. It takes about two minutes.
              </p>
              <LinkButton href="/onboarding" variant="secondary" className="mt-5">
                Find your North Star <ArrowRight />
              </LinkButton>
            </motion.div>
          )}
          <AnimatePresence>
            {returning && (
              <motion.p
                variants={fadeUp}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm text-ivory-soft"
              >
                <span className="size-1.5 rounded-full bg-accent" aria-hidden />
                {returning}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <motion.div variants={fadeUp} className="hidden md:block">
          <OrbFallback className="size-56 lg:size-64" />
        </motion.div>
      </section>

      {/* Primary ritual + mission */}
      <section className="grid gap-5 lg:grid-cols-5">
        <motion.div variants={fadeUp} className="lg:col-span-3">
          <RitualCard
            kind={primary}
            morningDone={morningDone}
            eveningDone={eveningDone}
            mantra={mantra}
            quickDefault={data.preferences.quickMorning}
          />
        </motion.div>

        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="flex h-full flex-col p-7 sm:p-8">
            <p className="eyebrow">Today&apos;s mission</p>
            {mission.text ? (
              <>
                <div className="mt-5 flex items-start gap-4">
                  {morning && mission.source === "morning" ? (
                    <CheckToggle
                      checked={morning.missionDone}
                      onChange={(v) => actions.saveMorning(today, { missionDone: v })}
                      label="Mark mission complete"
                    />
                  ) : null}
                  <p
                    className={cn(
                      "font-display text-2xl font-light leading-snug tracking-[-0.02em] transition-colors",
                      morning?.missionDone ? "text-ivory-muted line-through decoration-accent/50" : "text-ivory",
                    )}
                  >
                    {mission.text}
                  </p>
                </div>
                {mission.source === "evening" && (
                  <p className="mt-3 text-sm text-ivory-faint">Set last night. Confirm it in your morning alignment.</p>
                )}
              </>
            ) : (
              <p className="mt-5 text-lg leading-relaxed text-ivory-muted">
                No mission yet. Your morning alignment will help you choose one thing that matters.
              </p>
            )}

            {morning?.uncomfortableAction && (
              <div className="mt-8 border-t border-ivory/[0.06] pt-6">
                <p className="eyebrow mb-4">One brave action</p>
                <div className="flex items-start gap-4">
                  <CheckToggle
                    checked={morning.uncomfortableDone}
                    onChange={(v) => actions.saveMorning(today, { uncomfortableDone: v })}
                    label="Mark brave action complete"
                  />
                  <p className={cn("text-lg", morning.uncomfortableDone ? "text-ivory-muted line-through decoration-accent/50" : "text-ivory-soft")}>
                    {morning.uncomfortableAction}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </section>

      {/* Consistency + navigation */}
      <section className="grid gap-5 md:grid-cols-3">
        <motion.div variants={fadeUp} className="md:col-span-2">
          <Card className="p-7 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Consistency</p>
                <p className="mt-3 font-display text-3xl font-light tracking-tight">
                  {stats.last30}
                  <span className="text-ivory-muted"> of the last 30 days</span>
                </p>
              </div>
              <Link href="/journey" className="inline-flex items-center gap-1 text-sm text-ivory-muted transition-colors hover:text-ivory">
                Your journey <ArrowUpRight className="size-4" />
              </Link>
            </div>
            <DayDots data={data} days={lastNDays(today, 14)} today={today} size={16} className="mt-7" />
            <p className="mt-4 text-sm text-ivory-faint">
              {stats.totalDays === 0
                ? "Every journey starts with a single day. This could be it."
                : stats.returns > 0
                  ? `You've come back ${stats.returns} ${stats.returns === 1 ? "time" : "times"} after time away. That's the real skill.`
                  : "No streaks to protect here — only evidence to collect."}
            </p>
          </Card>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Link href="/north-star" className="group block h-full">
            <Card className="flex h-full flex-col justify-between p-7 transition-colors duration-300 group-hover:border-ivory/15 sm:p-8">
              <div>
                <p className="eyebrow">North Star</p>
                <p className="mt-4 text-pretty text-lg leading-relaxed text-ivory-soft">
                  {profile?.vision?.trim() ? truncate(profile.vision, 120) : "Your identity, vision, values and reasons — in one place."}
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1 text-sm text-accent">
                Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Card>
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}

function CheckToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "mt-1 grid size-7 shrink-0 place-items-center rounded-full border transition-colors duration-200",
        checked ? "border-accent bg-accent text-accent-ink" : "border-ivory/25 hover:border-accent/70",
      )}
    >
      <AnimatePresence>
        {checked && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={spring.snappy}>
            <Check className="size-4" strokeWidth={2.5} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function RitualCard({
  kind,
  morningDone,
  eveningDone,
  mantra,
  quickDefault,
}: {
  kind: "morning" | "evening" | "rest";
  morningDone: boolean;
  eveningDone: boolean;
  mantra: string;
  quickDefault: boolean;
}) {
  const content = {
    morning: {
      eyebrow: "Morning alignment",
      title: "Begin with intention.",
      body: "Remember who you are, choose one mission, and one brave step.",
      href: "/morning",
      cta: "Begin morning",
      meta: quickDefault ? "About 60 seconds" : "About 3 minutes",
      Icon: Sunrise,
    },
    evening: {
      eyebrow: "Nightly alignment",
      title: "Close the day gently.",
      body: "One win, one lesson, one adjustment — and tomorrow's mission.",
      href: "/evening",
      cta: "Begin reflection",
      meta: "About 3 minutes",
      Icon: MoonStar,
    },
    rest: {
      eyebrow: eveningDone ? "Fully aligned" : "Morning complete",
      title: eveningDone ? "The day is closed. Rest." : "Now, follow through.",
      body: eveningDone
        ? "You remembered who you are and reflected on the day. Recovery is part of the work."
        : "Your intention is set. Come back this evening to reflect.",
      href: eveningDone ? "/journey" : "/evening",
      cta: eveningDone ? "View your journey" : "Reflect early",
      meta: "",
      Icon: eveningDone ? MoonStar : Sunrise,
    },
  }[kind];

  const { Icon } = content;

  return (
    <TiltCard className="h-full rounded-3xl">
      <div className="surface relative flex h-full min-h-[22rem] flex-col justify-between overflow-hidden rounded-3xl p-7 sm:p-10">
        <div
          aria-hidden
          className="absolute -right-24 -top-24 size-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgb(var(--glow-a) / 0.25), transparent)" }}
        />
        <div className="relative [transform:translateZ(30px)]">
          <div className="flex items-center justify-between">
            <p className="eyebrow inline-flex items-center gap-2">
              <Icon className="size-4 text-accent" aria-hidden /> {content.eyebrow}
            </p>
            <div className="flex gap-1.5" aria-label={`Morning ${morningDone ? "done" : "not done"}, evening ${eveningDone ? "done" : "not done"}`}>
              <span className={cn("size-1.5 rounded-full", morningDone ? "bg-accent" : "bg-ivory/15")} />
              <span className={cn("size-1.5 rounded-full", eveningDone ? "bg-accent" : "bg-ivory/15")} />
            </div>
          </div>
          <h2 className="display mt-8 text-4xl sm:text-5xl">{content.title}</h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-ivory-muted">{content.body}</p>
        </div>

        <div className="relative mt-10 [transform:translateZ(40px)]">
          {kind !== "rest" && (
            <p className="serif-accent mb-6 text-xl text-ivory-soft">“{mantra}”</p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <LinkButton href={content.href} size="lg" variant={kind === "rest" ? "secondary" : "primary"}>
              {content.cta} <ArrowRight className="transition-transform group-hover/button:translate-x-0.5" />
            </LinkButton>
            {kind === "morning" && (
              <Link
                href={`/morning?mode=${quickDefault ? "full" : "quick"}`}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ivory-muted transition-colors hover:text-ivory"
              >
                <Timer className="size-4" aria-hidden />
                {quickDefault ? "Full version" : "60-second version"}
              </Link>
            )}
            {content.meta && <span className="text-sm text-ivory-faint">{content.meta}</span>}
            {kind === "evening" && !morningDone && (
              <Link
                href="/morning?mode=quick"
                className="text-sm text-ivory-muted underline-offset-4 transition-colors hover:text-ivory hover:underline"
              >
                Missed the morning? Take 60 seconds
              </Link>
            )}
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
