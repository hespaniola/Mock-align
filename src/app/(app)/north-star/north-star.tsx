"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { InlineText, ListEditor, TagEditor } from "@/components/north-star/editors";
import { Loading } from "@/components/shell/loading";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { LIFE_AREAS, OBSTACLES, VALUE_SUGGESTIONS } from "@/lib/content";
import { fadeUp, stagger } from "@/lib/motion";
import { actions, blankProfile, useAlignData } from "@/lib/store";
import type { LifeArea, Profile } from "@/lib/types";

function Section({ index, title, hint, children }: { index: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <motion.section
      variants={fadeUp}
      className="grid gap-6 border-t border-ivory/[0.07] py-12 sm:py-16 md:grid-cols-[14rem_1fr] md:gap-12"
    >
      <header>
        <p className="font-display text-sm tabular-nums text-accent">{index}</p>
        <h2 className="mt-2 font-display text-xl font-normal tracking-tight text-ivory">{title}</h2>
        {hint && <p className="mt-2 text-sm leading-relaxed text-ivory-faint">{hint}</p>}
      </header>
      <div className="min-w-0">{children}</div>
    </motion.section>
  );
}

export function NorthStar() {
  const data = useAlignData();
  if (!data) return <Loading />;

  const p: Profile = data.profile ?? blankProfile();
  const set = (patch: Partial<Profile>) => actions.updateProfile(patch);
  const areaLabel = (id: string) => LIFE_AREAS.find((a) => a.id === id)?.label ?? id;
  const labelToArea = (label: string) => LIFE_AREAS.find((a) => a.label === label)?.id;

  return (
    <motion.article variants={stagger(0.06)} initial="hidden" animate="show" className="mx-auto max-w-4xl">
      {/* Manifesto header */}
      <motion.header variants={fadeUp} className="pb-12 sm:pb-16">
        <div className="flex items-center justify-between">
          <p className="eyebrow">North Star · A personal manifesto</p>
          <SaveIndicator signal={p.updatedAt} />
        </div>
        <div className="mt-8">
          <InlineText
            label="Personal statement"
            value={p.statement}
            onChange={(v) => set({ statement: v })}
            placeholder="Write the one sentence you want to remember every day."
            className="display text-balance text-[2.5rem] leading-[1.05] sm:text-6xl"
            maxLength={240}
          />
        </div>
        <p className="mt-6 text-sm text-ivory-faint">Everything on this page is editable. Click any line and write.</p>
      </motion.header>

      <Section index="01" title="Identity" hint="Who you are becoming.">
        <InlineText
          label="Identity"
          value={p.identity}
          onChange={(v) => set({ identity: v })}
          placeholder="I am becoming someone who…"
          className="serif-accent text-3xl leading-snug sm:text-4xl"
          maxLength={300}
        />
      </Section>

      <Section index="02" title="Vision" hint="The life you're building, a few years from now.">
        <InlineText
          label="Long-term vision"
          value={p.vision}
          onChange={(v) => set({ vision: v })}
          placeholder="In three years, an ordinary day looks like…"
          className="text-xl leading-relaxed text-ivory-soft"
        />
      </Section>

      <Section index="03" title="Goals" hint="The three that matter most.">
        <ol className="space-y-2">
          {p.goals.map((g, i) => (
            <li key={i} className="flex items-baseline gap-4">
              <span className="w-6 shrink-0 font-display text-sm tabular-nums text-accent">0{i + 1}</span>
              <InlineText
                label={`Goal ${i + 1}`}
                value={g}
                onChange={(v) => {
                  const next = [...p.goals] as Profile["goals"];
                  next[i] = v;
                  set({ goals: next });
                }}
                placeholder="A goal worth your mornings"
                className="text-xl"
                maxLength={160}
              />
            </li>
          ))}
        </ol>
      </Section>

      <Section index="04" title="Values" hint="What you won't trade away.">
        <TagEditor selected={p.values} options={VALUE_SUGGESTIONS} onChange={(values) => set({ values })} addLabel="Add a value" />
      </Section>

      <Section index="05" title="Mantras" hint="Your own words. They'll appear in your mornings alongside curated ones.">
        <ListEditor
          items={p.mantras}
          onChange={(mantras) => set({ mantras })}
          placeholder="A mantra"
          addLabel="Add a mantra"
          itemClassName="serif-accent text-xl"
        />
      </Section>

      <Section index="06" title="Why it matters" hint="Your reasons. Read them on the hard days.">
        <ListEditor
          items={p.reasons}
          onChange={(reasons) => set({ reasons })}
          placeholder="A reason"
          addLabel="Add a reason"
          itemClassName="text-lg"
        />
      </Section>

      <Section index="07" title="Focus areas" hint="Shapes your daily mantras.">
        <TagEditor
          selected={p.areas.map(areaLabel)}
          options={LIFE_AREAS.map((a) => a.label)}
          onChange={(labels) => set({ areas: labels.map(labelToArea).filter(Boolean) as LifeArea[] })}
          allowCustom={false}
        />
      </Section>

      <Section index="08" title="What holds me back" hint="Shapes your uncomfortable-action suggestions.">
        <TagEditor selected={p.obstacles} options={OBSTACLES} onChange={(obstacles) => set({ obstacles })} addLabel="Add your own" />
      </Section>

      <motion.footer variants={fadeUp} className="border-t border-ivory/[0.07] pt-10">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 text-sm text-ivory-muted transition-colors hover:text-ivory"
        >
          <RotateCcw className="size-4" aria-hidden /> Walk through the guided questions again
        </Link>
      </motion.footer>
    </motion.article>
  );
}
