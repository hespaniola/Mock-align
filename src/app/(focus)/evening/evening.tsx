"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Completion } from "@/components/flow/completion";
import { AnswerField } from "@/components/flow/fields";
import { GuidedFlow, type FlowStep } from "@/components/flow/guided-flow";
import { Loading } from "@/components/shell/loading";
import { LinkButton } from "@/components/ui/button";
import { useMood } from "@/hooks/use-mood";
import { useRitualDate } from "@/hooks/use-ritual-date";
import { formatLong } from "@/lib/dates";
import { eveningReflection } from "@/lib/personalize";
import { actions, useAlignData } from "@/lib/store";

const WIN_SUGGESTIONS = ["I did the hard thing first", "I kept my word to myself", "I stayed calm when it mattered"];
const LESSON_SUGGESTIONS = ["Starting is the hardest part", "Energy matters more than time", "I can handle more than I think"];
const IMPROVE_SUGGESTIONS = ["Start earlier", "Fewer tabs, more focus", "Protect my evening wind-down"];

export function Evening() {
  const router = useRouter();
  const data = useAlignData();
  const when = useRitualDate(data?.preferences.dayStartsAt);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  useMood("evening");

  const date = when?.date;
  const entry = date ? data?.evenings[date] : undefined;

  useEffect(() => {
    if (!data || !date || data.evenings[date]) return;
    actions.saveEvening(date, {});
  }, [data, date]);

  if (!data || !when || !entry || !date) return <Loading />;

  const save = (patch: Parameters<typeof actions.saveEvening>[1]) => actions.saveEvening(date, patch);
  const morning = data.mornings[date];

  const finish = () => {
    const reflection = eveningReflection(data.profile, entry, date);
    save({ reflection, completedAt: entry.completedAt ?? new Date().toISOString() });
    setDone(true);
    window.scrollTo({ top: 0 });
  };

  if (done) {
    return (
      <div data-mood="evening">
        <Completion
          calm
          title={
            <>
              Rest <span className="serif-accent text-accent">well.</span>
            </>
          }
          subtitle={eveningReflection(data.profile, entry, date)}
        >
          <LinkButton href={when.isPast ? "/journey" : "/today"} variant="secondary" size="lg">
            Close the day
          </LinkButton>
        </Completion>
      </div>
    );
  }

  const steps: FlowStep[] = [
    {
      id: "win",
      eyebrow: when.isPast ? formatLong(date) : "Evening reflection",
      title: "What is one win from today?",
      description: morning?.mission
        ? `This morning's mission was “${morning.mission}”. Big or small, every win is evidence.`
        : "Big or small. Every win is evidence of who you're becoming.",
      skippable: true,
      content: (
        <AnswerField
          label="Today's win"
          value={entry.win}
          onChange={(v) => save({ win: v })}
          placeholder="Today I…"
          suggestions={WIN_SUGGESTIONS}
        />
      ),
    },
    {
      id: "lesson",
      eyebrow: "Evening reflection",
      title: "What did you learn?",
      skippable: true,
      content: (
        <AnswerField
          label="What you learned"
          value={entry.lesson}
          onChange={(v) => save({ lesson: v })}
          placeholder="I noticed…"
          suggestions={LESSON_SUGGESTIONS}
        />
      ),
    },
    {
      id: "improve",
      eyebrow: "Evening reflection",
      title: "What can you improve tomorrow?",
      description: "Not a criticism — just one adjustment.",
      skippable: true,
      content: (
        <AnswerField
          label="What to improve"
          value={entry.improve}
          onChange={(v) => save({ improve: v })}
          placeholder="Tomorrow I'll…"
          suggestions={IMPROVE_SUGGESTIONS}
        />
      ),
    },
    {
      id: "tomorrow",
      eyebrow: "Looking ahead",
      title: "What is tomorrow's most important mission?",
      description: "Decide tonight, and tomorrow begins with clarity. It'll be waiting for you in the morning.",
      cta: entry.completedAt ? "Save changes" : "Close the day",
      content: (
        <AnswerField
          label="Tomorrow's mission"
          value={entry.tomorrowMission}
          onChange={(v) => save({ tomorrowMission: v })}
          placeholder="Tomorrow, the one thing is…"
          suggestions={(data.profile?.goals ?? []).filter((g) => g.trim()).slice(0, 3)}
        />
      ),
    },
  ];

  return (
    <div data-mood="evening">
      <GuidedFlow
        mood="evening"
        steps={steps}
        step={step}
        onStepChange={setStep}
        onFinish={finish}
        onExit={() => router.push(when.isPast ? "/journey" : "/today")}
        saveSignal={entry.updatedAt}
        exitLabel="Save and close"
      />
    </div>
  );
}
