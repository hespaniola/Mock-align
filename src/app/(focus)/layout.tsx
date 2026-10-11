import { Ambient } from "@/components/shell/ambient";

/** Full-screen, distraction-free layout for guided rituals. */
export default function FocusLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ambient intensity={1.2} />
      <main id="main" className="min-h-dvh">
        {children}
      </main>
    </>
  );
}
