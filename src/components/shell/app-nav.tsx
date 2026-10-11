"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { CircleDot, SlidersHorizontal, Sparkle, Waypoints } from "lucide-react";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Wordmark } from "./wordmark";

const NAV = [
  { href: "/today", label: "Today", icon: CircleDot },
  { href: "/north-star", label: "North Star", icon: Sparkle },
  { href: "/journey", label: "Journey", icon: Waypoints },
  { href: "/settings", label: "Settings", icon: SlidersHorizontal },
] as const;

/** Desktop: floating top bar. Mobile: thumb-reachable bottom tab bar. */
export function AppNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-20 sm:px-8">
          <Wordmark href="/today" />
          <nav aria-label="Primary" className="hidden sm:block">
            <ul className="flex items-center gap-1 rounded-full border border-ivory/[0.07] bg-ink-900/70 p-1 backdrop-blur-md">
              {NAV.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative block rounded-full px-4 py-2 text-sm transition-colors duration-200",
                        active ? "text-ink-950" : "text-ivory-muted hover:text-ivory",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full bg-ivory"
                          transition={spring.snappy}
                        />
                      )}
                      <span className="relative">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <span className="hidden w-[92px] sm:block" aria-hidden />
        </div>
      </header>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ivory/[0.06] bg-ink-950/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden"
      >
        <ul className="grid grid-cols-4">
          {NAV.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] transition-colors",
                    active ? "text-ivory" : "text-ivory-faint",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="tab-dot"
                      className="absolute top-0 h-[2px] w-8 rounded-full bg-accent"
                      transition={spring.snappy}
                    />
                  )}
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
