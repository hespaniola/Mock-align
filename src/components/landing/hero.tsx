"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { Centerpiece } from "@/components/three/centerpiece";
import { LinkButton } from "@/components/ui/button";
import { EASE, wordReveal } from "@/lib/motion";

const HEADLINE: { text: string; accent?: boolean }[] = [
  { text: "Become" },
  { text: "who" },
  { text: "you" },
  { text: "said", accent: true },
  { text: "you" },
  { text: "would" },
  { text: "be." },
];

export function Hero({ returning }: { returning: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Scrolling through the hero pulls the orbits into alignment.
  const align = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden">
      <div className="mx-auto grid min-h-[100svh] max-w-7xl grid-rows-[auto_1fr] items-center gap-4 px-5 pb-16 pt-24 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:grid-rows-1 lg:gap-0 lg:pt-20">
        {/* Centerpiece — top on mobile, right on desktop */}
        <motion.div style={{ scale: orbScale }} className="relative mx-auto aspect-square w-[min(78vw,22rem)] lg:order-2 lg:w-full lg:max-w-[40rem]">
          <Centerpiece align={align} className="absolute -inset-[12%]" />
        </motion.div>

        <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10 lg:order-1">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="eyebrow"
          >
            A daily alignment ritual
          </motion.p>
          <motion.h1
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.08, delayChildren: 0.25 }}
            className="display mt-6 text-[3.25rem] sm:text-7xl lg:text-[5.75rem] xl:text-[6.5rem]"
          >
            {HEADLINE.map((w, i) => (
              <motion.span key={i} variants={wordReveal} className="mr-[0.22em] inline-block">
                {w.accent ? <span className="serif-accent text-[1.06em] text-accent">{w.text}</span> : <span className="text-gradient">{w.text}</span>}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
            className="mt-8 max-w-lg text-pretty text-lg leading-relaxed text-ivory-muted sm:text-xl"
          >
            A few intentional minutes every morning and night to remember your purpose, protect your focus, and build the
            life you envision.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 1.05 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <LinkButton href={returning ? "/today" : "/onboarding"} size="lg">
              {returning ? "Continue your alignment" : "Begin Your Alignment"}
              <ArrowRight className="transition-transform duration-200 group-hover/button:translate-x-0.5" />
            </LinkButton>
            <span className="text-sm text-ivory-faint">Free · No account · Two minutes</span>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#ritual"
        aria-label="Scroll to learn more"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs text-ivory-faint transition-colors hover:text-ivory sm:flex"
      >
        <ArrowDown className="size-4 animate-bounce [animation-duration:2.4s]" aria-hidden />
      </motion.a>
    </section>
  );
}
