import { formatLong } from "./dates";
import type { AppData } from "./types";

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const stamp = () => new Date().toISOString().slice(0, 10);

/** Full backup — can be re-imported. */
export function exportJSON(data: AppData) {
  download(`align-backup-${stamp()}.json`, JSON.stringify(data, null, 2), "application/json");
}

/** Human-readable journal. */
export function exportMarkdown(data: AppData) {
  const p = data.profile;
  const lines: string[] = ["# ALIGN — Personal Journal", ""];
  if (p) {
    lines.push("## North Star", "");
    if (p.identity) lines.push(`**Who I am becoming:** ${p.identity}`, "");
    if (p.statement) lines.push(`> ${p.statement}`, "");
    if (p.vision) lines.push("**Vision**", "", p.vision, "");
    const goals = p.goals.filter(Boolean);
    if (goals.length) lines.push("**Goals**", "", ...goals.map((g) => `- ${g}`), "");
    if (p.values.length) lines.push(`**Values:** ${p.values.join(", ")}`, "");
    if (p.mantras.length) lines.push("**Mantras**", "", ...p.mantras.map((m) => `- ${m}`), "");
    if (p.reasons.length) lines.push("**Why**", "", ...p.reasons.map((m) => `- ${m}`), "");
  }
  const dates = Array.from(new Set([...Object.keys(data.mornings), ...Object.keys(data.evenings)])).sort().reverse();
  if (dates.length) lines.push("## Days", "");
  for (const d of dates) {
    const m = data.mornings[d];
    const e = data.evenings[d];
    lines.push(`### ${formatLong(d)}`, "");
    if (m) {
      if (m.mantra) lines.push(`*${m.mantra}*`, "");
      if (m.mission) lines.push(`- **Mission:** ${m.mission}${m.missionDone ? " ✓" : ""}`);
      if (m.uncomfortableAction) lines.push(`- **Uncomfortable action:** ${m.uncomfortableAction}${m.uncomfortableDone ? " ✓" : ""}`);
      if (m.visionNote) lines.push(`- **Vision note:** ${m.visionNote}`);
      lines.push("");
    }
    if (e) {
      if (e.win) lines.push(`- **Win:** ${e.win}`);
      if (e.lesson) lines.push(`- **Learned:** ${e.lesson}`);
      if (e.improve) lines.push(`- **Improve:** ${e.improve}`);
      if (e.tomorrowMission) lines.push(`- **Tomorrow:** ${e.tomorrowMission}`);
      lines.push("");
    }
  }
  download(`align-journal-${stamp()}.md`, lines.join("\n"), "text/markdown");
}
