"use client";

import { motion } from "motion/react";
import { ArrowRight, MoonStar, Sparkle, Sunrise } from "lucide-react";
import { Ambient } from "@/components/shell/ambient";
import { Wordmark } from "@/components/shell/wordmark";
import { LinkButton } from "@/components/ui/button";
import { TiltCard } from "@/components/ui/tilt-card";
import { fadeUp, stagger } from "@/lib/motion";
import { useAlignData } from "@/lib/store";
import { Hero } from "./hero";
import { ScrollWords } from "./scroll-words";

const RITUAL = [
  {
    n: "01",
    Icon: Sunrise,
    title: "Morning alignment",
    body: "Remember who you are. Revisit your vision. Choose one mission and one brave, uncomfortable step.",
    meta: "2–5 minutes · or 60 seconds",
    glow: "radial-gradient(closest-side, rgb(220 192 138 / 0.35), transparent)",
  },
  {
    n: "02",
    Icon: MoonStar,
    title: "Nightly reflection",
    body: "One win. One lesson. One adjustment. Decide tomorrow's mission, then let the day go.",
    meta: "About 3 minutes",
    glow: "radial-gradient(closest-side, rgb(217 134 92 / 0.32), transparent)",
  },
  {
    n: "03",
    Icon: Sparkle,
    title: "Your North Star",
    body: "Identity, vision, values and reasons — a living manifesto you return to whenever you drift.",
    meta: "Always yours to edit",
    glow: "radial-gradient(closest-side, rgb(159 179 154 / 0.28), transparent)",
  },
];

const PRINCIPLES = [
  { title: "Action over perfection", body: "One mission. One brave step. Clarity follows movement." },
  { title: "No guilt, ever", body: "No streaks to break. Returning after time away is celebrated." },
  { title: "Private by default", body: "Everything stays in your browser. No account, no tracking." },
];

export function Landing() {
  const data = useAlignData();
  const returning = Boolean(data?.profile?.onboardedAt);

  return (
    <>
      <Ambient />
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:h-20 sm:px-8">
          <Wordmark />
          <LinkButton href={returning ? "/today" : "/onboarding"} variant="secondary" size="sm">
            {returning ? "Open ALIGN" : "Begin"}
          </LinkButton>
        </div>
      </header>

      <main id="main">
        <Hero returning={returning} />

        {/* The ritual */}
        <section id="ritual" className="relative mx-auto max-w-7xl scroll-mt-20 px-5 py-28 sm:px-8 sm:py-40">
          <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-15%" }}>
            <motion.p variants={fadeUp} className="eyebrow">
              The ritual
            </motion.p>
            <motion.h2 variants={fadeUp} className="display mt-6 max-w-3xl text-balance text-4xl sm:text-6xl">
              Twice a day, come back to <span className="serif-accent text-accent">yourself.</span>
            </motion.h2>
          </motion.div>

          <motion.ul
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            className="mt-16 grid gap-5 md:grid-cols-3"
          >
            {RITUAL.map(({ n, Icon, title, body, meta, glow }) => (
              <motion.li key={n} variants={fadeUp}>
                <TiltCard className="h-full rounded-3xl">
                  <article className="surface relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-3xl p-8">
                    <div aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full blur-2xl" style={{ background: glow }} />
                    <div className="relative flex items-center justify-between [transform:translateZ(24px)]">
                      <span className="font-display text-sm tabular-nums text-ivory-faint">{n}</span>
                      <Icon className="size-5 text-accent" strokeWidth={1.5} aria-hidden />
                    </div>
                    <div className="relative mt-auto [transform:translateZ(36px)]">
                      <h3 className="font-display text-3xl font-light tracking-tight">{title}</h3>
                      <p className="mt-4 leading-relaxed text-ivory-muted">{body}</p>
                      <p className="mt-6 text-xs uppercase tracking-[0.18em] text-ivory-faint">{meta}</p>
                    </div>
                  </article>
                </TiltCard>
              </motion.li>
            ))}
          </motion.ul>
        </section>

        {/* Philosophy */}
        <section className="mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-44">
          <p className="eyebrow mb-10">The philosophy</p>
          <ScrollWords
            text="Remember who you are. Become who you're meant to be. Not someday — in the small, ordinary choices of today."
            accentWords={["Remember", "Become"]}
            className="display text-balance text-4xl leading-[1.08] sm:text-6xl lg:text-7xl"
          />
        </section>

        {/* Principles */}
        <section className="mx-auto max-w-7xl px-5 pb-28 sm:px-8 sm:pb-40">
          <motion.ul
            variants={stagger(0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            className="grid gap-px overflow-hidden rounded-3xl border border-ivory/[0.07] bg-ivory/[0.07] md:grid-cols-3"
          >
            {PRINCIPLES.map((p) => (
              <motion.li key={p.title} variants={fadeUp} className="bg-ink-950 p-8 sm:p-10">
                <h3 className="font-display text-xl tracking-tight">{p.title}</h3>
                <p className="mt-3 leading-relaxed text-ivory-muted">{p.body}</p>
              </motion.li>
            ))}
          </motion.ul>
        </section>

        {/* Closing CTA */}
        <section className="relative overflow-hidden border-t border-ivory/[0.06]">
          <div
            aria-hidden
            className="absolute left-1/2 top-full size-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgb(var(--glow-a) / 0.18), transparent)" }}
          />
          <motion.div
            variants={stagger(0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            className="relative mx-auto flex max-w-3xl flex-col items-center px-5 py-32 text-center sm:py-44"
          >
            <motion.h2 variants={fadeUp} className="display text-balance text-5xl sm:text-7xl">
              Begin <span className="serif-accent text-accent">today.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 max-w-md text-lg text-ivory-muted">
              The person you want to become is built in minutes like these.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10">
              <LinkButton href={returning ? "/today" : "/onboarding"} size="lg">
                {returning ? "Continue your alignment" : "Begin Your Alignment"}
                <ArrowRight />
              </LinkButton>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-ivory/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-5 py-10 text-sm text-ivory-faint sm:flex-row sm:items-center sm:px-8">
          <Wordmark />
          <p>Your reflections stay on this device.</p>
        </div>
      </footer>
    </>
  );
}
