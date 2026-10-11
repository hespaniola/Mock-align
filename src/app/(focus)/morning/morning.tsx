"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Shuffle, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { Completion } from "@/components/flow/completion";
import { AnswerField, Echo } from "@/components/flow/fields";
import { GuidedFlow, type FlowStep } from "@/components/flow/guided-flow";
import { Loading } from "@/components/shell/loading";
import { Button, LinkButton } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRitualDate } from "@/hooks/use-ritual-date";
import { lowerFirst } from "@/lib/content";
import { formatLong } from "@/lib/dates";
import { fadeUp, stagger } from "@/lib/motion";
import {
  carriedMission,
  dailyMantra,
  missionSuggestions,
  uncomfortableSuggestions,
} from "@/lib/personalize";
import { actions, useAlignData } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Morning() {
  const router = useRouter();
  const data = useAlignData();
  const when = useRitualDate(data?.preferences.dayStartsAt);
  const requestedMode = useSearchParams().get("mode");
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [mantraOffset, setMantraOffset] = useState(0);

  const date = when?.date;
  const entry = date ? data?.mornings[date] : undefined;
  const profile = data?.profile ?? null;

  // Seed today's draft once: mantra, carried-over mission, preferred mode.
  useEffect(() => {
    if (!data || !date || data.mornings[date]) return;
    actions.saveMorning(date, {
      mantra: dailyMantra(data.profile, date),
      mission: carriedMission(data, date),
      mode:
        requestedMode === "quick" || requestedMode === "full"
          ? requestedMode
          : data.preferences.quickMorning
            ? "quick"
            : "full",
    });
  }, [data, date, requestedMode]);

  // An explicit ?mode= switches an unfinished draft too.
  const draftMode = date ? data?.mornings[date]?.mode : undefined;
  const draftDone = date ? Boolean(data?.mornings[date]?.completedAt) : true;
  useEffect(() => {
    if (!date || !draftMode || draftDone) return;
    if ((requestedMode === "quick" || requestedMode === "full") && requestedMode !== draftMode) {
      actions.saveMorning(date, { mode: requestedMode });
    }
    // Only on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, requestedMode]);

  if (!data || !when || !entry || !date) return <Loading />;

  const save = (patch: Parameters<typeof actions.saveMorning>[1]) => actions.saveMorning(date, patch);
  const quick = entry.mode === "quick";
  const carried = carriedMission(data, date);

  const shuffleMantra = () => {
    let offset = mantraOffset;
    let next = entry.mantra;
    for (let i = 0; i < 8 && next === entry.mantra; i++) {
      offset += 1;
      next = dailyMantra(profile, date, offset);
    }
    setMantraOffset(offset);
    save({ mantra: next });
  };

  const finish = () => {
    save({ completedAt: entry.completedAt ?? new Date().toISOString() });
    setDone(true);
    window.scrollTo({ top: 0 });
  };

  if (done) {
    return (
      <Completion
        title={
          <>
            You&apos;re <span className="serif-accent text-accent">aligned.</span>
          </>
        }
        subtitle={
          entry.mission
            ? "One mission. One brave step. The rest of the day is just following through."
            : "You showed up for yourself this morning. That counts."
        }
      >
        {entry.mission && (
          <div className="surface mx-auto mb-8 max-w-md rounded-3xl p-6 text-left">
            <p className="eyebrow mb-2">Today&apos;s mission</p>
            <p className="font-display text-xl font-light text-ivory">{entry.mission}</p>
          </div>
        )}
        <LinkButton href="/today" size="lg">
          Begin the day
        </LinkButton>
      </Completion>
    );
  }

  const identityLine = profile?.statement?.trim() || profile?.identity?.trim();

  const identityStep: FlowStep = {
    id: "identity",
    eyebrow: when.isPast ? formatLong(date) : "Remember who you are",
    title: identityLine ? (
      <span className="text-gradient">{identityLine}</span>
    ) : (
      <>
        Today, you get to <span className="serif-accent text-accent">choose</span> who you are.
      </>
    ),
    description: identityLine
      ? "Read it slowly. Let it land before the day begins."
      : "Add your personal statement any time in your North Star, and it will greet you here.",
    cta: "I remember",
    content: quick ? (
      <Echo label="Today's mantra">{entry.mantra}</Echo>
    ) : !identityLine ? (
      <Link href="/north-star" className="text-sm text-accent underline-offset-4 hover:underline">
        Write your North Star →
      </Link>
    ) : profile?.identity && profile.statement ? (
      <p className="text-ivory-muted">
        Becoming <span className="text-ivory">{lowerFirst(profile.identity).replace(/\.$/, "")}</span>.
      </p>
    ) : undefined,
  };

  const goals = (profile?.goals ?? []).filter((g) => g.trim());
  const visionStep: FlowStep = {
    id: "vision",
    eyebrow: "Long-term vision",
    title: "Where you're headed.",
    skippable: true,
    content: (
      <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="space-y-8">
        {profile?.vision ? (
          <motion.div variants={fadeUp}>
            <Echo>{profile.vision}</Echo>
          </motion.div>
        ) : null}
        {goals.length > 0 && (
          <motion.ol variants={fadeUp} className="space-y-3">
            {goals.map((g, i) => (
              <li key={i} className="flex items-baseline gap-4 text-lg text-ivory-soft">
                <span className="font-display text-sm tabular-nums text-accent">0{i + 1}</span>
                {g}
              </li>
            ))}
          </motion.ol>
        )}
        {!profile?.vision && goals.length === 0 && (
          <motion.p variants={fadeUp} className="text-ivory-muted">
            You haven&apos;t written a vision yet.{" "}
            <Link href="/north-star" className="text-accent underline-offset-4 hover:underline">
              Add one in North Star
            </Link>
            .
          </motion.p>
        )}
        <motion.div variants={fadeUp}>
          <label htmlFor="vision-note" className="mb-2 block text-sm text-ivory-muted">
            One thought about it today <span className="text-ivory-faint">(optional)</span>
          </label>
          <Textarea
            id="vision-note"
            value={entry.visionNote}
            onChange={(e) => save({ visionNote: e.target.value })}
            placeholder="What would move this closer?"
            maxLength={400}
          />
        </motion.div>
      </motion.div>
    ),
  };

  const mantraStep: FlowStep = {
    id: "mantra",
    eyebrow: "Today's mantra",
    title: <span className="serif-accent text-[1.15em] text-ivory">“{entry.mantra}”</span>,
    description: "Carry it with you. Return to it when the day gets loud.",
    cta: "Carry this",
    content: (
      <Button variant="secondary" size="sm" onClick={shuffleMantra}>
        <Shuffle /> Another
      </Button>
    ),
  };

  const missionStep: FlowStep = {
    id: "mission",
    eyebrow: "One important mission",
    title: "If only one thing gets done today, what should it be?",
    skippable: true,
    content: (
      <AnswerField
        label="Today's mission"
        value={entry.mission}
        onChange={(v) => save({ mission: v })}
        placeholder="Today I will…"
        suggestions={[...(carried && carried !== entry.mission ? [carried] : []), ...missionSuggestions(profile)].slice(0, 4)}
      />
    ),
  };

  const uncomfortableStep: FlowStep = {
    id: "uncomfortable",
    eyebrow: "One uncomfortable action",
    title: "What's one brave thing you'll do today?",
    description: "Small and real beats big and imagined. Growth lives just past comfort.",
    skippable: true,
    content: (
      <AnswerField
        label="Uncomfortable action"
        value={entry.uncomfortableAction}
        onChange={(v) => save({ uncomfortableAction: v })}
        placeholder="I will…"
        suggestions={uncomfortableSuggestions(profile, date)}
      />
    ),
  };

  const summaryStep: FlowStep = {
    id: "summary",
    eyebrow: "Your commitment",
    title: (
      <>
        Today, I <span className="serif-accent text-accent">choose</span> this.
      </>
    ),
    cta: entry.completedAt ? "Save changes" : "I commit",
    content: (
      <motion.dl variants={stagger(0.08)} initial="hidden" animate="show" className="surface divide-y divide-ivory/[0.06] rounded-3xl">
        {[
          { k: "Mantra", v: entry.mantra, s: 0 },
          { k: "Mission", v: entry.mission, s: quick ? 1 : 3 },
          { k: "Uncomfortable action", v: entry.uncomfortableAction, s: quick ? 2 : 4 },
        ].map((row) => (
          <motion.div key={row.k} variants={fadeUp} className="flex items-start justify-between gap-4 p-5 sm:p-6">
            <div>
              <dt className="eyebrow mb-1.5">{row.k}</dt>
              <dd className={cn("text-lg", row.v ? "text-ivory" : "text-ivory-faint")}>{row.v || "Not set — that's okay."}</dd>
            </div>
            <Button variant="link" size="sm" onClick={() => setStep(row.s)} aria-label={`Edit ${row.k}`}>
              Edit
            </Button>
          </motion.div>
        ))}
      </motion.dl>
    ),
  };

  const steps = quick
    ? [identityStep, missionStep, uncomfortableStep, summaryStep]
    : [identityStep, visionStep, mantraStep, missionStep, uncomfortableStep, summaryStep];

  return (
    <GuidedFlow
      mood="morning"
      steps={steps}
      step={Math.min(step, steps.length - 1)}
      onStepChange={setStep}
      onFinish={finish}
      onExit={() => router.push(when.isPast ? "/journey" : "/today")}
      saveSignal={entry.updatedAt}
      exitLabel="Save and close"
      headerExtra={
        <button
          type="button"
          onClick={() => {
            save({ mode: quick ? "full" : "quick" });
            setStep(0);
          }}
          aria-pressed={quick}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors",
            quick ? "border-accent/50 bg-accent/15 text-ivory" : "border-ivory/10 text-ivory-muted hover:text-ivory",
          )}
        >
          <Timer className="size-3.5" aria-hidden />
          60s
          <span className="sr-only">quick mode</span>
        </button>
      }
    />
  );
}
