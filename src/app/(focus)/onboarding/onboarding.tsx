"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { AnswerField, Echo, Suggestions } from "@/components/flow/fields";
import { GuidedFlow, type FlowStep } from "@/components/flow/guided-flow";
import { Loading } from "@/components/shell/loading";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import {
  GOAL_SUGGESTIONS,
  IDENTITY_SUGGESTIONS,
  LIFE_AREAS,
  OBSTACLES,
  STATEMENT_TEMPLATES,
  lowerFirst,
} from "@/lib/content";
import { fadeUp, stagger } from "@/lib/motion";
import { actions, useAlignData } from "@/lib/store";
import type { LifeArea, Profile } from "@/lib/types";

type Goals = Profile["goals"];

export function Onboarding() {
  const router = useRouter();
  const data = useAlignData();
  const seeded = useRef(false);

  // When revisiting onboarding, start from the existing profile.
  useEffect(() => {
    if (!data || seeded.current) return;
    seeded.current = true;
    const draft = data.onboardingDraft;
    const p = data.profile;
    if (p && Object.keys(draft).length === 0) {
      actions.setOnboardingDraft({
        name: p.name,
        identity: p.identity,
        goals: p.goals,
        areas: p.areas,
        obstacles: p.obstacles,
        statement: p.statement,
        step: 0,
      });
    }
  }, [data]);

  const draft = data?.onboardingDraft ?? {};
  const step = draft.step ?? 0;
  const name = draft.name ?? "";
  const identity = draft.identity ?? "";
  const goals: Goals = (draft.goals as Goals | undefined) ?? ["", "", ""];
  const areas = draft.areas ?? [];
  const obstacles = draft.obstacles ?? [];
  const statement = draft.statement ?? "";

  const set = actions.setOnboardingDraft;

  const statementSuggestions = useMemo(
    () => STATEMENT_TEMPLATES.map((fn) => fn(identity.trim().replace(/\.$/, ""))),
    [identity],
  );

  const finish = () => {
    actions.completeOnboarding();
    router.push("/today");
  };

  if (!data) return <Loading />;

  const setGoal = (i: number, v: string) => {
    const next = [...goals] as Goals;
    next[i] = v;
    set({ goals: next });
  };
  const fillGoal = (v: string) => {
    const i = goals.findIndex((g) => !g.trim());
    if (i !== -1) setGoal(i, v);
  };
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const steps: FlowStep[] = [
    {
      id: "name",
      eyebrow: "A two-minute beginning",
      title: (
        <>
          Let&apos;s begin <span className="serif-accent text-accent">with you.</span>
        </>
      ),
      description: "A few questions to shape your daily ritual. Everything stays on this device and can be edited anytime.",
      skippable: true,
      content: (
        <div className="max-w-md">
          <label htmlFor="name" className="mb-2 block text-sm text-ivory-muted">
            What should we call you?
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Your first name"
            autoComplete="given-name"
            maxLength={40}
            data-autofocus=""
          />
        </div>
      ),
    },
    {
      id: "identity",
      eyebrow: "Question 1 of 5",
      title: "Who do you want to become?",
      description: "Describe the person you're growing into — not what you'll have, but who you'll be.",
      skippable: true,
      content: (
        <AnswerField
          label="Who you want to become"
          value={identity}
          onChange={(v) => set({ identity: v })}
          placeholder="Someone who…"
          suggestions={IDENTITY_SUGGESTIONS}
        />
      ),
    },
    {
      id: "goals",
      eyebrow: "Question 2 of 5",
      title: "Your three most important goals.",
      description: "The few things that, if they happened, would change everything else.",
      skippable: true,
      content: (
        <div>
          <ol className="space-y-5">
            {goals.map((g, i) => (
              <li key={i} className="flex items-baseline gap-4">
                <span className="w-6 font-display text-sm tabular-nums text-accent">0{i + 1}</span>
                <label htmlFor={`goal-${i}`} className="sr-only">
                  Goal {i + 1}
                </label>
                <Input
                  id={`goal-${i}`}
                  value={g}
                  onChange={(e) => setGoal(i, e.target.value)}
                  placeholder={["The most important one", "The second", "The third"][i]}
                  maxLength={120}
                  data-autofocus={i === 0 ? "" : undefined}
                />
              </li>
            ))}
          </ol>
          <Suggestions
            items={GOAL_SUGGESTIONS.filter((s) => !goals.includes(s))}
            onPick={fillGoal}
            label="Tap to add"
          />
        </div>
      ),
    },
    {
      id: "areas",
      eyebrow: "Question 3 of 5",
      title: "Which areas of life matter most?",
      description: "Choose as many as feel true right now. Your daily mantras will lean toward these.",
      skippable: true,
      content: (
        <motion.div
          variants={stagger(0.04)}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
        >
          {LIFE_AREAS.map((a) => {
            const on = areas.includes(a.id);
            return (
              <motion.div key={a.id} variants={fadeUp}>
                <Chip
                  selected={on}
                  onClick={() => set({ areas: toggle<LifeArea>(areas, a.id) })}
                  className="w-full justify-start rounded-2xl px-5 py-4"
                >
                  <span className="block text-base text-ivory">{a.label}</span>
                  <span className="block text-xs text-ivory-faint">{a.hint}</span>
                </Chip>
              </motion.div>
            );
          })}
        </motion.div>
      ),
    },
    {
      id: "obstacles",
      eyebrow: "Question 4 of 5",
      title: "What usually holds you back?",
      description: "No judgment — naming it is how you get ahead of it. Your uncomfortable actions will be shaped by this.",
      skippable: true,
      content: (
        <motion.div variants={stagger(0.035)} initial="hidden" animate="show" className="flex flex-wrap gap-2.5">
          {OBSTACLES.map((o) => (
            <motion.div key={o} variants={fadeUp}>
              <Chip selected={obstacles.includes(o)} onClick={() => set({ obstacles: toggle(obstacles, o) })}>
                {o}
              </Chip>
            </motion.div>
          ))}
        </motion.div>
      ),
    },
    {
      id: "statement",
      eyebrow: "Question 5 of 5",
      title: "What should you remember every day?",
      description: "A personal statement, in your own words. You'll see it each morning.",
      skippable: true,
      content: (
        <AnswerField
          label="Personal statement"
          value={statement}
          onChange={(v) => set({ statement: v })}
          placeholder="I am…"
          suggestions={statementSuggestions}
        />
      ),
    },
    {
      id: "reveal",
      eyebrow: "Your North Star",
      title: (
        <>
          This is who you <span className="serif-accent text-accent">said</span> you would be.
        </>
      ),
      cta: "Enter ALIGN",
      content: (
        <motion.div variants={stagger(0.12, 0.2)} initial="hidden" animate="show" className="space-y-4">
          <motion.div variants={fadeUp}>
            <Echo label="Remember">{statement.trim() || "I am becoming who I said I would be."}</Echo>
          </motion.div>
          {identity.trim() && (
            <motion.p variants={fadeUp} className="px-2 text-ivory-muted">
              Becoming <span className="text-ivory">{lowerFirst(identity.trim()).replace(/\.$/, "")}</span>.
            </motion.p>
          )}
          {goals.some((g) => g.trim()) && (
            <motion.ul variants={fadeUp} className="flex flex-wrap gap-2 px-2">
              {goals
                .filter((g) => g.trim())
                .map((g) => (
                  <li key={g} className="rounded-full border border-ivory/10 px-3 py-1.5 text-sm text-ivory-soft">
                    {g}
                  </li>
                ))}
            </motion.ul>
          )}
        </motion.div>
      ),
    },
  ];

  return (
    <GuidedFlow
      steps={steps}
      step={step}
      onStepChange={(s) => set({ step: s })}
      onFinish={finish}
      onExit={() => router.push(data.profile ? "/today" : "/")}
      saveSignal={draft}
      exitLabel="Save and close"
      headerExtra={
        step < steps.length - 1 ? (
          <Button variant="link" size="sm" onClick={finish} className="hidden text-xs sm:inline-flex">
            Skip setup
          </Button>
        ) : null
      }
    />
  );
}
