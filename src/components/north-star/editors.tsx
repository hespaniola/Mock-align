"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Chip } from "@/components/ui/chip";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Text that is always editable in place. It reads like typeset prose and
 * reveals a hairline only on hover/focus, so the manifesto feels like a page,
 * not a form. Changes save as you type.
 */
export function InlineText({
  value,
  onChange,
  placeholder,
  label,
  className,
  maxLength = 1200,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  className?: string;
  maxLength?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      aria-label={label}
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "-mx-3 block w-[calc(100%+1.5rem)] resize-none overflow-hidden rounded-xl bg-transparent px-3 py-2 text-ivory outline-none",
        "transition-[background-color,box-shadow] duration-300 hover:bg-ivory/[0.03] focus:bg-ivory/[0.04] focus:shadow-[inset_0_0_0_1px_rgb(var(--glow-a)/0.35)] focus-visible:outline-none",
        className,
      )}
    />
  );
}

/** Editable list of short lines (mantras, reasons). */
export function ListEditor({
  items,
  onChange,
  placeholder,
  addLabel,
  itemClassName,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  addLabel: string;
  itemClassName?: string;
}) {
  const pendingFocus = useRef<number | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const setFocusIndex = (i: number) => {
    pendingFocus.current = i;
  };

  // Focus a newly added (or the previous) line after the list re-renders.
  useEffect(() => {
    if (pendingFocus.current !== null) {
      refs.current[pendingFocus.current]?.focus();
      pendingFocus.current = null;
    }
  });

  const add = () => {
    onChange([...items, ""]);
    setFocusIndex(items.length);
  };

  return (
    <div>
      <ul className="space-y-1">
        <AnimatePresence initial={false}>
          {items.map((item, i) => (
            <motion.li
              key={i}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={spring.soft}
              className="group flex items-center gap-2"
            >
              <span aria-hidden className="size-1 shrink-0 rounded-full bg-accent/70" />
              <input
                ref={(el) => void (refs.current[i] = el)}
                value={item}
                placeholder={placeholder}
                aria-label={`${placeholder} ${i + 1}`}
                maxLength={200}
                onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    add();
                  } else if (e.key === "Backspace" && !item && items.length > 0) {
                    e.preventDefault();
                    onChange(items.filter((_, j) => j !== i));
                    setFocusIndex(Math.max(0, i - 1));
                  }
                }}
                onBlur={() => {
                  if (!item.trim()) onChange(items.filter((_, j) => j !== i));
                }}
                className={cn(
                  "h-11 flex-1 rounded-lg bg-transparent px-2 text-ivory outline-none transition-colors hover:bg-ivory/[0.03] focus:bg-ivory/[0.04] focus-visible:outline-none",
                  itemClassName,
                )}
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                aria-label={`Remove “${item || "item"}”`}
                className="grid size-9 place-items-center rounded-full text-ivory-faint opacity-60 transition hover:bg-ivory/[0.06] hover:text-ivory focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <X className="size-4" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <button
        type="button"
        onClick={add}
        className="mt-2 inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm text-ivory-muted transition-colors hover:bg-ivory/[0.05] hover:text-ivory"
      >
        <Plus className="size-4 text-accent" aria-hidden /> {addLabel}
      </button>
    </div>
  );
}

/** Choose from suggestions and add custom tags. */
export function TagEditor({
  selected,
  options,
  onChange,
  addLabel = "Add your own",
  allowCustom = true,
}: {
  selected: string[];
  options: string[];
  onChange: (next: string[]) => void;
  addLabel?: string;
  allowCustom?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const all = Array.from(new Set([...options, ...selected]));
  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {all.map((o) => (
        <Chip key={o} selected={selected.includes(o)} onClick={() => toggle(o)}>
          {o}
        </Chip>
      ))}
      {allowCustom && (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = draft.trim();
          if (v && !selected.includes(v)) onChange([...selected, v]);
          setDraft("");
        }}
        className="inline-flex"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`${addLabel}…`}
          aria-label={addLabel}
          maxLength={40}
          className="h-10 w-40 rounded-full border border-dashed border-ivory/15 bg-transparent px-4 text-sm text-ivory outline-none transition-colors focus:border-accent/60 focus-visible:outline-none"
        />
      </form>
      )}
    </div>
  );
}
