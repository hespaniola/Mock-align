"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { StepProgress } from "@/components/ui/progress";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { useMood, type Mood } from "@/hooks/use-mood";
import { calmStepVariants, stepVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface FlowStep {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  /** Label for the primary action. Defaults to "Continue". */
  cta?: string;
  /** Show a "Skip" affordance for this step. */
  skippable?: boolean;
  /** Disable the primary action (e.g. nothing chosen yet). */
  blocked?: boolean;
  /** Hide the standard footer (the step renders its own action). */
  hideFooter?: boolean;
}

interface GuidedFlowProps {
  steps: FlowStep[];
  step: number;
  onStepChange: (next: number) => void;
  onFinish: () => void;
  onExit: () => void;
  mood?: Mood;
  /** Changes when content autosaves — drives the quiet "Saved" hint. */
  saveSignal?: unknown;
  /** Optional element in the header's right slot (e.g. mode toggle). */
  headerExtra?: ReactNode;
  exitLabel?: string;
}

/**
 * Shared engine for onboarding and the morning/evening rituals:
 * one question per screen, directional transitions, keyboard support
 * (Enter to continue, Alt+← to go back, Esc to leave), focus management
 * and autosave feedback.
 */
export function GuidedFlow({
  steps,
  step,
  onStepChange,
  onFinish,
  onExit,
  mood = "morning",
  saveSignal,
  headerExtra,
  exitLabel = "Close",
}: GuidedFlowProps) {
  useMood(mood);
  const [direction, setDirection] = useState(1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const current = steps[Math.min(step, steps.length - 1)];
  const isLast = step >= steps.length - 1;
  const calm = mood === "evening";

  const next = useCallback(() => {
    if (current.blocked) return;
    setDirection(1);
    if (isLast) onFinish();
    else onStepChange(step + 1);
  }, [current.blocked, isLast, onFinish, onStepChange, step]);

  const back = useCallback(() => {
    if (step === 0) return;
    setDirection(-1);
    onStepChange(step - 1);
  }, [onStepChange, step]);

  // Keyboard: Enter continues (Shift+Enter for a new line), Alt+← goes back,
  // Esc leaves a field first and the flow second.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      const inField = tag === "INPUT" || tag === "TEXTAREA";
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing && !e.metaKey && !e.ctrlKey) {
        if (tag === "BUTTON" || tag === "A" || tag === "SELECT") return;
        if (current.hideFooter) return;
        e.preventDefault();
        next();
      } else if (e.key === "Escape") {
        if (inField) el?.blur();
        else onExit();
      } else if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back, next, onExit, current.hideFooter]);

  // Move focus into the new step once it has entered.
  const focusStep = useCallback(() => {
    const root = bodyRef.current;
    if (!root) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const target = (fine && root.querySelector<HTMLElement>("[data-autofocus]")) || root.querySelector<HTMLElement>("h1");
    target?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 sm:px-8">
      {/* Header */}
      <div className="sticky top-0 z-20 -mx-5 bg-gradient-to-b from-ink-950 via-ink-950/80 to-transparent px-5 pb-6 pt-[max(env(safe-area-inset-top),1rem)] sm:-mx-8 sm:px-8 sm:pt-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onExit} aria-label={exitLabel}>
            <X />
          </Button>
          <StepProgress total={steps.length} current={step} className="flex-1" />
          <div className="flex min-w-10 items-center justify-end gap-2">
            {headerExtra}
            <span className="tabular-nums text-xs text-ivory-faint" aria-hidden>
              {step + 1}/{steps.length}
            </span>
          </div>
        </div>
      </div>

      {/* Step body */}
      <div ref={bodyRef} className="flex flex-1 flex-col justify-center py-6 sm:py-10">
        <AnimatePresence mode="wait" custom={direction} initial={false} onExitComplete={focusStep}>
          <motion.section
            key={current.id}
            custom={direction}
            variants={calm ? calmStepVariants : stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            aria-labelledby={`step-${current.id}`}
            onAnimationComplete={(def) => def === "center" && focusStep()}
          >
            {current.eyebrow && <p className="eyebrow mb-5">{current.eyebrow}</p>}
            <h1
              id={`step-${current.id}`}
              tabIndex={-1}
              className="display text-balance text-[2.25rem] text-ivory outline-none sm:text-[3.25rem]"
            >
              {current.title}
            </h1>
            {current.description && (
              <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-ivory-muted sm:text-lg">
                {current.description}
              </p>
            )}
            {current.content && <div className="mt-10">{current.content}</div>}
          </motion.section>
        </AnimatePresence>
      </div>

      {/* Footer */}
      {!current.hideFooter && (
        <div className="sticky bottom-0 z-20 -mx-5 bg-gradient-to-t from-ink-950 via-ink-950/90 to-transparent px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-8 sm:-mx-8 sm:px-8 sm:pb-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={back}
              disabled={step === 0}
              className={cn(step === 0 && "invisible")}
              aria-label="Previous step"
            >
              <ArrowLeft />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex-1">
              <SaveIndicator signal={saveSignal} />
            </div>
            {current.skippable && !isLast && (
              <Button variant="link" size="md" onClick={next} className="mr-2">
                Skip
              </Button>
            )}
            <Button variant={calm ? "accent" : "primary"} size="lg" onClick={next} disabled={current.blocked}>
              {current.cta ?? (isLast ? "Finish" : "Continue")}
              <ArrowRight className="transition-transform duration-200 group-hover/button:translate-x-0.5" />
            </Button>
          </div>
          <p className="mt-3 hidden text-right text-xs text-ivory-faint sm:block" aria-hidden>
            Press <kbd className="rounded border border-ivory/15 px-1.5 py-0.5 font-sans">Enter</kbd> to continue
          </p>
        </div>
      )}
    </div>
  );
}
