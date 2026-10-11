"use client";

import { motion } from "motion/react";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { Loading } from "@/components/shell/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { exportJSON, exportMarkdown } from "@/lib/export";
import { fadeUp, spring, stagger } from "@/lib/motion";
import { actions, useAlignData } from "@/lib/store";
import type { MotionPreference } from "@/lib/types";
import { cn } from "@/lib/utils";

function Row({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-t border-ivory/[0.06] py-6 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="max-w-md">
        <p className="text-ivory">{title}</p>
        {hint && <p className="mt-1 text-sm leading-relaxed text-ivory-faint">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 rounded-full border transition-colors duration-300",
        checked ? "border-accent/60 bg-accent/80" : "border-ivory/15 bg-ivory/[0.06]",
      )}
    >
      <motion.span
        className="absolute top-0.5 block size-5.5 rounded-full bg-ivory shadow"
        initial={false}
        animate={{ left: checked ? 22 : 2 }}
        transition={spring.snappy}
      />
    </button>
  );
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-ivory/[0.08] p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm transition-colors",
            value === o.id ? "bg-ivory text-ink-950" : "text-ivory-muted hover:text-ivory",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Settings() {
  const data = useAlignData();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!data) return <Loading />;
  const prefs = data.preferences;

  const onImport = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      setMessage(actions.importData(parsed) ? "Backup restored." : "That file isn't an ALIGN backup.");
    } catch {
      setMessage("Couldn't read that file.");
    }
  };

  return (
    <motion.div variants={stagger(0.07)} initial="hidden" animate="show" className="mx-auto max-w-3xl space-y-10">
      <header>
        <motion.p variants={fadeUp} className="eyebrow">
          Settings
        </motion.p>
        <motion.h1 variants={fadeUp} className="display mt-5 text-5xl sm:text-6xl">
          Make it yours.
        </motion.h1>
      </header>

      <motion.section variants={fadeUp} aria-labelledby="s-ritual">
        <h2 id="s-ritual" className="eyebrow mb-4">
          Ritual
        </h2>
        <Card className="p-6 sm:p-8">
          <Row title="Your name" hint="Used in your greeting.">
            <Input
              aria-label="Your name"
              value={data.profile?.name ?? ""}
              onChange={(e) => actions.updateProfile({ name: e.target.value })}
              placeholder="First name"
              className="h-10 w-48 text-base"
              maxLength={40}
            />
          </Row>
          <Row title="60-second mornings" hint="Start each morning in quick mode. You can switch any time.">
            <Switch label="60-second mornings" checked={prefs.quickMorning} onChange={(v) => actions.setPreferences({ quickMorning: v })} />
          </Row>
          <Row title="New day begins at" hint="Reflections written before this hour count toward the previous day.">
            <select
              aria-label="New day begins at"
              value={prefs.dayStartsAt}
              onChange={(e) => actions.setPreferences({ dayStartsAt: Number(e.target.value) })}
              className="h-10 rounded-full border border-ivory/10 bg-ink-850 px-4 text-sm text-ivory"
            >
              {[0, 1, 2, 3, 4, 5, 6].map((h) => (
                <option key={h} value={h}>
                  {h === 0 ? "Midnight" : `${h}:00 am`}
                </option>
              ))}
            </select>
          </Row>
        </Card>
      </motion.section>

      <motion.section variants={fadeUp} aria-labelledby="s-exp">
        <h2 id="s-exp" className="eyebrow mb-4">
          Experience
        </h2>
        <Card className="p-6 sm:p-8">
          <Row title="Motion" hint="“System” follows your device's reduced-motion setting.">
            <Segmented<MotionPreference>
              label="Motion"
              value={prefs.motion}
              onChange={(v) => actions.setPreferences({ motion: v })}
              options={[
                { id: "system", label: "System" },
                { id: "reduced", label: "Reduced" },
                { id: "full", label: "Full" },
              ]}
            />
          </Row>
          <Row title="3D centerpiece" hint="Uses WebGL on capable devices. A lightweight version is shown otherwise.">
            <Switch label="3D centerpiece" checked={prefs.enable3D} onChange={(v) => actions.setPreferences({ enable3D: v })} />
          </Row>
        </Card>
      </motion.section>

      <motion.section variants={fadeUp} aria-labelledby="s-data">
        <h2 id="s-data" className="eyebrow mb-4">
          Your data
        </h2>
        <Card className="p-6 sm:p-8">
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-ivory-muted">
            Everything you write is stored only in this browser, on this device. It isn&apos;t synced or sent anywhere.
            Export a backup to keep it safe or move it to another device.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => exportJSON(data)}>
              <Download /> Backup (.json)
            </Button>
            <Button variant="secondary" onClick={() => exportMarkdown(data)}>
              <FileText /> Journal (.md)
            </Button>
            <Button variant="ghost" onClick={() => fileRef.current?.click()}>
              <Upload /> Restore backup
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onImport(f);
                e.target.value = "";
              }}
            />
          </div>
          <p role="status" className="mt-4 min-h-5 text-sm text-accent">
            {message}
          </p>

          <div className="mt-6 border-t border-ivory/[0.06] pt-6">
            {confirmReset ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-ivory-soft">Erase everything on this device? This can&apos;t be undone.</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="border-ember/50 text-ember hover:bg-ember/10"
                  onClick={() => {
                    actions.reset();
                    router.push("/");
                  }}
                >
                  Yes, erase
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)} className="text-ivory-muted">
                <Trash2 /> Erase all data
              </Button>
            )}
          </div>
        </Card>
      </motion.section>
    </motion.div>
  );
}
