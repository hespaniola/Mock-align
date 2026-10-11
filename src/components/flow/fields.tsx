"use client";

import { motion } from "motion/react";
import { Chip } from "@/components/ui/chip";
import { Textarea } from "@/components/ui/textarea";
import { fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** A large free-text answer with optional one-tap suggestions underneath. */
export function AnswerField({
  value,
  onChange,
  placeholder,
  suggestions = [],
  label,
  autoFocus = true,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suggestions?: string[];
  label: string;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="sr-only" htmlFor={`f-${label}`}>
        {label}
      </label>
      <Textarea
        id={`f-${label}`}
        size="lg"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        data-autofocus={autoFocus ? "" : undefined}
        maxLength={400}
      />
      {suggestions.length > 0 && <Suggestions items={suggestions} onPick={onChange} current={value} />}
    </div>
  );
}

export function Suggestions({
  items,
  onPick,
  current,
  label = "Or tap one to start",
}: {
  items: string[];
  onPick: (v: string) => void;
  current?: string;
  label?: string;
}) {
  return (
    <div className="mt-8">
      <p className="mb-3 text-xs text-ivory-faint">{label}</p>
      <motion.div variants={stagger(0.04, 0.15)} initial="hidden" animate="show" className="flex flex-wrap gap-2">
        {items.map((s) => (
          <motion.div key={s} variants={fadeUp}>
            <Chip kind="suggest" selected={current === s} onClick={() => onPick(s)}>
              {s}
            </Chip>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/** A quiet, framed display of something the user wrote earlier. */
export function Echo({ children, className, label }: { children: React.ReactNode; className?: string; label?: string }) {
  return (
    <figure className={cn("surface rounded-3xl p-6 sm:p-8", className)}>
      {label && <figcaption className="eyebrow mb-4">{label}</figcaption>}
      <blockquote className="font-display text-xl font-light leading-snug tracking-[-0.015em] text-ivory sm:text-2xl">
        {children}
      </blockquote>
    </figure>
  );
}
